import { prisma } from "@campusoj/db";
import type {
  CreateContestInput,
  UpdateContestInput,
  AttachProblemInput,
  ContestListQuery,
  Role,
} from "@campusoj/shared";
import { AppError } from "../../lib/AppError.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIVILEGE_ROLES: Role[] = ["FACULTY", "ADMIN", "SUPER_ADMIN"];

function isPrivileged(role: Role): boolean {
  return PRIVILEGE_ROLES.includes(role);
}

// ─── List Contests ────────────────────────────────────────────────────────────

export async function listContests(query: ContestListQuery) {
  const { status, page, limit } = query;
  const skip = (page - 1) * limit;

  let dbStatus: any = status;
  if (status === "UPCOMING") {
    dbStatus = "SCHEDULED";
  }

  const where = dbStatus ? { status: dbStatus } : {};

  const [contests, total] = await prisma.$transaction([
    prisma.contest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: "asc" },
      include: {
        _count: { select: { participants: true } },
        createdBy: { select: { profile: { select: { fullName: true } } } },
      },
    }),
    prisma.contest.count({ where }),
  ]);

  return {
    data: contests.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      startTime: c.startTime,
      endTime: c.endTime,
      status: c.status,
      scoringStrategy: c.scoringStrategy,
      freezeLeaderboard: c.freezeLeaderboard,
      rules: c.rules,
      createdById: c.createdById,
      createdByName: c.createdBy.profile?.fullName ?? null,
      participantCount: c._count.participants,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Contest Detail ───────────────────────────────────────────────────────

export async function getContestDetail(
  contestId: string,
  viewerRole: Role | null,
  viewerUserId: string | null
) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      _count: { select: { participants: true } },
      problems: {
        orderBy: { orderIndex: "asc" },
        include: {
          problem: { select: { title: true, slug: true, difficulty: true } },
        },
      },
      createdBy: { select: { profile: { select: { fullName: true } } } },
    },
  });

  if (!contest) throw new AppError("Contest not found", 404);

  const canSeeProblems =
    contest.status === "LIVE" ||
    contest.status === "ENDED" ||
    (viewerRole && isPrivileged(viewerRole));

  const problems = contest.problems.map((cp) => ({
    id: cp.id,
    problemId: cp.problemId,
    orderIndex: cp.orderIndex,
    points: cp.points,
    ...(canSeeProblems
      ? {
          title: cp.problem.title,
          slug: cp.problem.slug,
          difficulty: cp.problem.difficulty,
        }
      : {}),
  }));

  // Check if viewer is registered
  let isRegistered = false;
  if (viewerUserId) {
    const participant = await prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId: contest.id, userId: viewerUserId } },
    });
    isRegistered = !!participant;
  }

  return {
    id: contest.id,
    title: contest.title,
    slug: contest.slug,
    description: contest.description,
    startTime: contest.startTime,
    endTime: contest.endTime,
    status: contest.status,
    scoringStrategy: contest.scoringStrategy,
    freezeLeaderboard: contest.freezeLeaderboard,
    rules: contest.rules,
    createdById: contest.createdById,
    createdByName: contest.createdBy.profile?.fullName ?? null,
    participantCount: contest._count.participants,
    problems,
    isRegistered,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
  };
}

// ─── Create Contest ───────────────────────────────────────────────────────────

export async function createContest(
  input: CreateContestInput,
  createdById: string
) {
  const existing = await prisma.contest.findUnique({
    where: { slug: input.slug },
  });
  if (existing) throw new AppError("Contest slug already taken", 409);

  const contest = await prisma.contest.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      scoringStrategy: input.scoringStrategy,
      freezeLeaderboard: input.freezeLeaderboard,
      rules: input.rules ?? null,
      status: "DRAFT",
      createdById,
    },
  });

  return contest;
}

// ─── Update Contest ───────────────────────────────────────────────────────────

export async function updateContest(
  contestId: string,
  input: UpdateContestInput,
  requesterId: string,
  requesterRole: Role
) {
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new AppError("Contest not found", 404);

  // Only creator or admin can update
  if (contest.createdById !== requesterId && !["ADMIN", "SUPER_ADMIN"].includes(requesterRole)) {
    throw new AppError("Forbidden — you do not own this contest", 403);
  }

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) {
    const clash = await prisma.contest.findFirst({
      where: { slug: input.slug, NOT: { id: contestId } },
    });
    if (clash) throw new AppError("Slug already taken", 409);
    data.slug = input.slug;
  }
  if (input.description !== undefined) data.description = input.description;
  if (input.startTime !== undefined) data.startTime = new Date(input.startTime);
  if (input.endTime !== undefined) data.endTime = new Date(input.endTime);
  if (input.scoringStrategy !== undefined) data.scoringStrategy = input.scoringStrategy;
  if (input.freezeLeaderboard !== undefined) data.freezeLeaderboard = input.freezeLeaderboard;
  if (input.rules !== undefined) data.rules = input.rules;
  if (input.status !== undefined) data.status = input.status;

  return prisma.contest.update({ where: { id: contestId }, data });
}

// ─── Register for Contest ─────────────────────────────────────────────────────

export async function registerForContest(contestId: string, userId: string) {
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new AppError("Contest not found", 404);

  if (contest.status === "ENDED" || contest.status === "ARCHIVED") {
    throw new AppError("Registration is closed for this contest", 400);
  }

  const existing = await prisma.contestParticipant.findUnique({
    where: { contestId_userId: { contestId, userId } },
  });
  if (existing) throw new AppError("Already registered for this contest", 409);

  return prisma.contestParticipant.create({
    data: { contestId, userId },
  });
}

// ─── Attach Problem to Contest ────────────────────────────────────────────────

export async function attachProblemToContest(
  contestId: string,
  input: AttachProblemInput,
  requesterId: string,
  requesterRole: Role
) {
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new AppError("Contest not found", 404);

  if (contest.createdById !== requesterId && !["ADMIN", "SUPER_ADMIN"].includes(requesterRole)) {
    throw new AppError("Forbidden", 403);
  }

  const problem = await prisma.problem.findUnique({ where: { id: input.problemId } });
  if (!problem) throw new AppError("Problem not found", 404);

  const existing = await prisma.contestProblem.findUnique({
    where: { contestId_problemId: { contestId, problemId: input.problemId } },
  });
  if (existing) throw new AppError("Problem already attached to this contest", 409);

  return prisma.contestProblem.create({
    data: {
      contestId,
      problemId: input.problemId,
      orderIndex: input.orderIndex,
      points: input.points,
    },
  });
}
