import { prisma } from "@campusoj/db";
import type {
  CreateProblemInput,
  UpdateProblemInput,
  CreateTestCaseInput,
  BulkTestCaseInput,
  ProblemListQuery,
  Role,
} from "@campusoj/shared";
import { AppError } from "../../lib/AppError.js";

// ─── Serialiser: strips hidden test case data from non-privileged responses ───

type RawTestCase = {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  isSample: boolean;
  weight: number;
  createdAt?: Date;
};

export function serializeTestCase(tc: RawTestCase, viewerRole: Role | null) {
  const isPrivileged =
    viewerRole && ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(viewerRole);

  // CRITICAL SECURITY RULE: Test cases with isHidden: true NEVER include input
  // or expectedOutput in student/public responses. Only faculty/admin can view them.
  if (tc.isHidden && !isPrivileged) {
    return {
      id: tc.id,
      problemId: tc.problemId,
      isHidden: tc.isHidden,
      isSample: tc.isSample,
      weight: tc.weight,
    };
  }

  return {
    id: tc.id,
    problemId: tc.problemId,
    isHidden: tc.isHidden,
    isSample: tc.isSample,
    weight: tc.weight,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  };
}

// ─── Fast In-Memory Cache ─────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const problemListCache = new Map<string, CacheEntry<any>>();
const problemDetailCache = new Map<string, CacheEntry<any>>();

export function invalidateProblemCaches() {
  problemListCache.clear();
  problemDetailCache.clear();
}

// ─── List Problems ────────────────────────────────────────────────────────────

export async function listProblems(query: ProblemListQuery) {
  const { difficulty, tag, search, page, limit } = query;
  const skip = (page - 1) * limit;

  const cacheKey = JSON.stringify({ difficulty, tag, search, page, limit });
  const cached = problemListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const where: Record<string, unknown> = {};
  if (difficulty) where.difficulty = difficulty;
  if (tag) {
    where.tags = { some: { tag: { name: { equals: tag, mode: "insensitive" } } } };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        allowedLanguages: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.problem.count({ where }),
  ]);

  const result = {
    data: problems.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      timeLimit: p.timeLimit,
      memoryLimit: p.memoryLimit,
      allowedLanguages: p.allowedLanguages,
      tags: p.tags.map((pt) => pt.tag.name),
      submissionCount: p._count.submissions,
      authorId: p.authorId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  problemListCache.set(cacheKey, { data: result, expiresAt: Date.now() + 60_000 });
  return result;
}

// ─── Get Problem Detail ───────────────────────────────────────────────────────

export async function getProblemDetail(
  problemIdOrSlug: string,
  viewerRole: Role | null
) {
  const isPrivileged =
    viewerRole && ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(viewerRole);

  const cacheKey = `${problemIdOrSlug}:${isPrivileged ? "admin" : "user"}`;
  const cached = problemDetailCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      problemIdOrSlug
    );
  const problem = await prisma.problem.findUnique({
    where: isUuid ? { id: problemIdOrSlug } : { slug: problemIdOrSlug },
    include: {
      tags: { include: { tag: { select: { name: true } } } },
      testCases: {
        where: isPrivileged ? undefined : { OR: [{ isHidden: false }, { isSample: true }] },
        orderBy: [{ isSample: "desc" }, { isHidden: "asc" }],
      },
    },
  });

  if (!problem) throw new AppError("Problem not found", 404);

  const submissionCount = await prisma.submission.count({
    where: { problemId: problem.id },
  });

  const result = {
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    statement: problem.statement,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    allowedLanguages: problem.allowedLanguages,
    functionSignature: problem.functionSignature,
    starterCode: problem.starterCode,
    driverCode: problem.driverCode,
    tags: problem.tags.map((pt) => pt.tag.name),
    submissionCount,
    authorId: problem.authorId,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
    testCases: problem.testCases.map((tc) => serializeTestCase(tc, viewerRole)),
  };

  problemDetailCache.set(cacheKey, { data: result, expiresAt: Date.now() + 120_000 });
  return result;
}

// ─── Create Problem ───────────────────────────────────────────────────────────

export async function createProblem(input: CreateProblemInput, authorId: string) {
  const existing = await prisma.problem.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError("Problem slug already taken", 409);

  const { tags, ...rest } = input;

  const problem = await prisma.$transaction(async (tx) => {
    const created = await tx.problem.create({
      data: {
        ...rest,
        authorId,
      },
    });

    // Upsert tags and link them
    for (const tagName of tags) {
      const tag = await tx.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await tx.problemTag.create({
        data: { problemId: created.id, tagId: tag.id },
      });
    }

    return created;
  });

  invalidateProblemCaches();
  return problem;
}

// ─── Update Problem ───────────────────────────────────────────────────────────

export async function updateProblem(
  problemId: string,
  input: UpdateProblemInput,
  requesterId: string,
  requesterRole: Role
) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new AppError("Problem not found", 404);

  if (problem.authorId !== requesterId && !["ADMIN", "SUPER_ADMIN"].includes(requesterRole)) {
    throw new AppError("Forbidden — you do not own this problem", 403);
  }

  const { tags, ...rest } = input;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.problem.update({
      where: { id: problemId },
      data: rest as Record<string, unknown>,
    });

    if (tags !== undefined) {
      await tx.problemTag.deleteMany({ where: { problemId } });
      for (const tagName of tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        await tx.problemTag.create({ data: { problemId, tagId: tag.id } });
      }
    }

    return updated;
  });

  invalidateProblemCaches();
  return result;
}

// ─── Create Test Cases ────────────────────────────────────────────────────────

export async function createTestCases(
  problemId: string,
  input: BulkTestCaseInput,
  requesterId: string,
  requesterRole: Role
) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new AppError("Problem not found", 404);

  if (problem.authorId !== requesterId && !["ADMIN", "SUPER_ADMIN"].includes(requesterRole)) {
    throw new AppError("Forbidden", 403);
  }

  const created = await prisma.$transaction(
    input.testCases.map((tc: CreateTestCaseInput) =>
      prisma.testCase.create({
        data: {
          problemId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          isSample: tc.isSample,
          weight: tc.weight,
        },
      })
    )
  );

  invalidateProblemCaches();
  return created.length;
}
