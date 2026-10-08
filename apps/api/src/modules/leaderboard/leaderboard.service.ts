import { prisma } from "@campusoj/db";
import type {
  Role,
  LeaderboardResponse,
  ScoringStrategy,
} from "@campusoj/shared";
import { AppError } from "../../lib/AppError.js";
import { ICPCScoringStrategy } from "./strategies/ICPCScoringStrategy.js";
import { PointsBinaryScoringStrategy } from "./strategies/PointsBinaryScoringStrategy.js";
import type {
  ContestProblemMeta,
  ContestParticipantMeta,
  ContestSubmissionMeta,
  ScoringEngine,
} from "./scoringStrategy.interface.js";
import { emitLeaderboardUpdate } from "../../sockets/socketServer.js";

const icpcEngine = new ICPCScoringStrategy();
const pointsBinaryEngine = new PointsBinaryScoringStrategy();

function getEngine(strategy: ScoringStrategy): ScoringEngine {
  if (strategy === "POINTS_BINARY") {
    return pointsBinaryEngine;
  }
  return icpcEngine;
}

export async function getLeaderboard(
  contestId: string,
  viewerRole: Role | null,
  _viewerUserId?: string | null
): Promise<LeaderboardResponse> {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      scoringStrategy: true,
      freezeLeaderboard: true,
    },
  });

  if (!contest) {
    throw new AppError("Contest not found", 404);
  }

  const isPrivileged =
    viewerRole !== null &&
    ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(viewerRole);

  // Freeze calculation:
  // If contest.freezeLeaderboard is true, freeze applies during the final 1 hour before endTime
  const now = new Date();
  const oneHourMs = 60 * 60 * 1000;
  const freezeTime = new Date(contest.endTime.getTime() - oneHourMs);
  const isFreezeActive =
    contest.freezeLeaderboard &&
    now >= freezeTime &&
    contest.status === "LIVE";

  // Fetch contest problems ordered by orderIndex
  const contestProblems = await prisma.contestProblem.findMany({
    where: { contestId },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  // Fetch registered participants
  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              college: true,
            },
          },
        },
      },
    },
  });

  // Fetch submissions. If freeze is active and viewer is not privileged, mask submissions after freezeTime.
  const submissionWhere: {
    contestId: string;
    createdAt?: { lte: Date };
  } = { contestId };

  if (isFreezeActive && !isPrivileged) {
    submissionWhere.createdAt = { lte: freezeTime };
  }

  const submissions = await prisma.submission.findMany({
    where: submissionWhere,
    select: {
      id: true,
      userId: true,
      problemId: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const problemMetas: ContestProblemMeta[] = contestProblems.map((cp) => ({
    problemId: cp.problemId,
    title: cp.problem.title,
    slug: cp.problem.slug,
    points: cp.points,
    orderIndex: cp.orderIndex,
  }));

  const participantMetas: ContestParticipantMeta[] = participants.map((p) => ({
    userId: p.userId,
    user: {
      email: p.user.email,
      profile: p.user.profile,
    },
  }));

  const contestSubmissionMetas: ContestSubmissionMeta[] = submissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    problemId: s.problemId,
    status: s.status,
    createdAt: s.createdAt,
  }));

  const engine = getEngine(contest.scoringStrategy as ScoringStrategy);
  const rows = engine.calculate(
    contest.startTime,
    problemMetas,
    participantMetas,
    contestSubmissionMetas
  );

  return {
    contestId: contest.id,
    contestTitle: contest.title,
    scoringStrategy: contest.scoringStrategy as ScoringStrategy,
    isFrozen: isFreezeActive && !isPrivileged,
    problems: problemMetas.map((p) => ({
      id: p.problemId,
      title: p.title,
      slug: p.slug,
      points: p.points,
      orderIndex: p.orderIndex,
    })),
    rows,
  };
}

export async function recalculateAndPersistLeaderboard(
  contestId: string
): Promise<LeaderboardResponse> {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      scoringStrategy: true,
      freezeLeaderboard: true,
    },
  });

  if (!contest) {
    throw new AppError("Contest not found", 404);
  }

  const contestProblems = await prisma.contestProblem.findMany({
    where: { contestId },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              college: true,
            },
          },
        },
      },
    },
  });

  // Calculate with all real submissions (ground truth)
  const submissions = await prisma.submission.findMany({
    where: { contestId },
    select: {
      id: true,
      userId: true,
      problemId: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const problemMetas: ContestProblemMeta[] = contestProblems.map((cp) => ({
    problemId: cp.problemId,
    title: cp.problem.title,
    slug: cp.problem.slug,
    points: cp.points,
    orderIndex: cp.orderIndex,
  }));

  const participantMetas: ContestParticipantMeta[] = participants.map((p) => ({
    userId: p.userId,
    user: {
      email: p.user.email,
      profile: p.user.profile,
    },
  }));

  const contestSubmissionMetas: ContestSubmissionMeta[] = submissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    problemId: s.problemId,
    status: s.status,
    createdAt: s.createdAt,
  }));

  const engine = getEngine(contest.scoringStrategy as ScoringStrategy);
  const rows = engine.calculate(
    contest.startTime,
    problemMetas,
    participantMetas,
    contestSubmissionMetas
  );

  // Persist into Leaderboard table
  for (const row of rows) {
    await prisma.leaderboard.upsert({
      where: {
        contestId_userId: {
          contestId,
          userId: row.userId,
        },
      },
      update: {
        solvedCount: row.solvedCount,
        totalScore: row.totalScore,
        penalty: row.penalty,
        lastSubmissionTime: row.lastSubmissionTime
          ? new Date(row.lastSubmissionTime)
          : null,
      },
      create: {
        contestId,
        userId: row.userId,
        solvedCount: row.solvedCount,
        totalScore: row.totalScore,
        penalty: row.penalty,
        lastSubmissionTime: row.lastSubmissionTime
          ? new Date(row.lastSubmissionTime)
          : null,
      },
    });
  }

  const liveResponse: LeaderboardResponse = {
    contestId: contest.id,
    contestTitle: contest.title,
    scoringStrategy: contest.scoringStrategy as ScoringStrategy,
    isFrozen: false,
    problems: problemMetas.map((p) => ({
      id: p.problemId,
      title: p.title,
      slug: p.slug,
      points: p.points,
      orderIndex: p.orderIndex,
    })),
    rows,
  };

  // Broadcast to contest room
  emitLeaderboardUpdate(contestId, liveResponse);

  return liveResponse;
}
