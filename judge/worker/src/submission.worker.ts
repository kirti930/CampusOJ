import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { prisma } from "@campusoj/db";
import {
  SUBMISSION_QUEUE_NAME,
  type SubmissionJobPayload,
  type SubmissionVerdict,
  wrapCodeWithDriver,
} from "@campusoj/shared";
import { getJudgeProvider } from "./judge/index.js";

dotenv.config();

const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);

connection.on("connect", () =>
  console.log("[SubmissionWorker:Redis] Connected")
);
connection.on("error", (err) =>
  console.error("[SubmissionWorker:Redis] Error:", err.message)
);

export const submissionWorker = new Worker<SubmissionJobPayload>(
  SUBMISSION_QUEUE_NAME,
  async (job: Job<SubmissionJobPayload>) => {
    const { submissionId } = job.data;

    console.log(`[SubmissionWorker] Received job for submission: ${submissionId}`);

    // 1. Load submission and test cases
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: {
          include: {
            testCases: {
              orderBy: [{ isSample: "desc" }, { isHidden: "asc" }],
            },
          },
        },
      },
    });

    if (!submission) {
      console.error(`[SubmissionWorker] Submission not found: ${submissionId}`);
      return;
    }

    // 2. Update status to RUNNING
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "RUNNING" },
    });

    try {
      await connection.publish(
        "campusoj:events",
        JSON.stringify({
          type: "submission:status",
          userId: submission.userId,
          contestId: submission.contestId,
          payload: {
            submissionId,
            problemId: submission.problemId,
            contestId: submission.contestId,
            status: "RUNNING",
          },
        })
      );
    } catch {
      // ignore
    }

    console.log(
      `[SubmissionWorker] Evaluating ${submission.language} submission for problem "${submission.problem.title}" (${submission.problem.testCases.length} test cases)`
    );

    // 3. Execute through active JudgeProvider (LocalJudgeProvider or Judge0Provider)
    const judgeProvider = getJudgeProvider();
    const testCases = submission.problem.testCases;

    const executableCode = wrapCodeWithDriver(
      submission.sourceCode,
      submission.language,
      submission.problem as any
    );

    const judgeResults = await judgeProvider.execute(
      executableCode,
      submission.language,
      testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
      {
        timeLimit: submission.problem.timeLimit,
        memoryLimit: submission.problem.memoryLimit,
      }
    );

    // 4. Record individual SubmissionResult entries and compute aggregate verdict
    let aggregateVerdict: SubmissionVerdict = "ACCEPTED";
    let maxExecutionTime = 0;
    let maxMemoryUsage = 0;

    // Clear any prior results
    await prisma.submissionResult.deleteMany({
      where: { submissionId },
    });

    const verdictPriority: Record<SubmissionVerdict, number> = {
      COMPILATION_ERROR: 6,
      INTERNAL_ERROR: 5,
      TIME_LIMIT_EXCEEDED: 4,
      MEMORY_LIMIT_EXCEEDED: 3,
      RUNTIME_ERROR: 2,
      WRONG_ANSWER: 1,
      ACCEPTED: 0,
      PENDING: 0,
      QUEUED: 0,
      RUNNING: 0,
    };

    let highestPriority = 0;

    for (const jr of judgeResults) {
      if (jr.executionTime > maxExecutionTime) {
        maxExecutionTime = jr.executionTime;
      }
      if (jr.memoryUsage > maxMemoryUsage) {
        maxMemoryUsage = jr.memoryUsage;
      }

      const prio = verdictPriority[jr.verdict] ?? 0;
      if (prio > highestPriority) {
        highestPriority = prio;
        aggregateVerdict = jr.verdict;
      }

      if (jr.testCaseId) {
        const errorDetail =
          jr.stderr ??
          jr.compileOutput ??
          (jr.verdict === "WRONG_ANSWER"
            ? `Wrong Answer:\nExpected: ${jr.expectedOutput ?? ""}\nActual: ${jr.actualOutput ?? ""}`
            : null);

        await prisma.submissionResult.create({
          data: {
            submissionId,
            testCaseId: jr.testCaseId,
            verdict: jr.verdict,
            executionTime: jr.executionTime,
            memoryUsage: jr.memoryUsage,
            stderr: errorDetail,
          },
        });
      }
    }

    // 5. Update submission with final status
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: aggregateVerdict,
        executionTime: maxExecutionTime,
        memoryUsage: maxMemoryUsage,
      },
    });

    console.log(
      `[SubmissionWorker] Finished evaluation: ${submissionId} => ${aggregateVerdict} (${maxExecutionTime}ms, ${maxMemoryUsage}MB)`
    );

    // 6. Realtime event emission: publish event to Redis for Socket.IO dispatch
    try {
      await connection.publish(
        "campusoj:events",
        JSON.stringify({
          type: "submission:status",
          userId: submission.userId,
          contestId: submission.contestId,
          payload: {
            submissionId,
            problemId: submission.problemId,
            contestId: submission.contestId,
            status: aggregateVerdict,
            verdict: aggregateVerdict,
            executionTime: maxExecutionTime,
            memoryUsage: maxMemoryUsage,
          },
        })
      );
    } catch (pubErr) {
      console.warn("[SubmissionWorker] Redis publish error:", (pubErr as Error).message);
    }

    // 7. If contest submission and accepted, update contest leaderboard
    if (submission.contestId && aggregateVerdict === "ACCEPTED") {
      try {
        await prisma.leaderboard.upsert({
          where: {
            contestId_userId: {
              contestId: submission.contestId,
              userId: submission.userId,
            },
          },
          update: {
            solvedCount: { increment: 1 },
            totalScore: { increment: 100 },
            lastSubmissionTime: new Date(),
          },
          create: {
            contestId: submission.contestId,
            userId: submission.userId,
            solvedCount: 1,
            totalScore: 100,
            penalty: 0,
            lastSubmissionTime: new Date(),
          },
        });
        console.log(`[SubmissionWorker] Leaderboard updated for contest ${submission.contestId}`);
      } catch (lbErr) {
        console.error("[SubmissionWorker] Leaderboard update error:", lbErr);
      }
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
  }
);

submissionWorker.on("completed", (job) => {
  console.log(`[SubmissionWorker] Job ${job.id} completed successfully`);
});

submissionWorker.on("failed", (job, err) => {
  console.error(`[SubmissionWorker] Job ${job?.id} failed:`, err.message);
});

process.on("SIGINT", async () => {
  await submissionWorker.close();
  await connection.quit();
  process.exit(0);
});

console.log(
  `🚀 CampusOJ Submission Worker started — queue: "${SUBMISSION_QUEUE_NAME}" (Provider: ${process.env.JUDGE_PROVIDER ?? "local"})`
);
