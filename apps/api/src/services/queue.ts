import { Queue } from "bullmq";
import IORedis from "ioredis";
import { SUBMISSION_QUEUE_NAME, type SubmissionJobPayload } from "@campusoj/shared";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
});

redisConnection.on("error", (err) => {
  // Graceful log for local dev when Redis is offline
  if (process.env.NODE_ENV !== "production") {
    // Keep warning light
  } else {
    console.error("[Redis Queue Error]", err.message);
  }
});

export const submissionQueue = new Queue<SubmissionJobPayload>(
  SUBMISSION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);
