import { prisma } from "@campusoj/db";
import {
  type CreateSubmissionInput,
  type RunCodeInput,
  type SubmissionListQuery,
  type Role,
  wrapCodeWithDriver,
} from "@campusoj/shared";
import { AppError } from "../../lib/AppError.js";
import { getJudgeProvider } from "../../services/judge/index.js";
import { submissionQueue } from "../../services/queue.js";
import { emitSubmissionStatus } from "../../sockets/socketServer.js";
import { recalculateAndPersistLeaderboard } from "../leaderboard/leaderboard.service.js";

// ─── 1. Run Code (Custom / Sample run without creating a DB submission) ───────

export async function runCode(input: RunCodeInput) {
  const { problemId, language, sourceCode, customInput } = input;

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true },
  });

  if (!problem) throw new AppError("Problem not found", 404);

  // Validate allowed language
  if (
    problem.allowedLanguages.length > 0 &&
    !problem.allowedLanguages.map((l) => l.toLowerCase()).includes(language.toLowerCase())
  ) {
    throw new AppError(
      `Language '${language}' is not allowed for this problem. Allowed: ${problem.allowedLanguages.join(", ")}`,
      400
    );
  }

  const judgeProvider = getJudgeProvider();

  // If custom input provided, check if it matches a known testcase to extract expectedOutput
  let testCasesToRun: { id?: string; input: string; expectedOutput: string }[];

  if (customInput !== undefined) {
    const matchedTc = problem.testCases.find(
      (tc) => tc.input.trim() === customInput.trim()
    );
    testCasesToRun = [
      {
        id: matchedTc?.id,
        input: customInput,
        expectedOutput: matchedTc ? matchedTc.expectedOutput : "",
      },
    ];
  } else {
    const sampleCases = problem.testCases.filter((tc) => tc.isSample);
    testCasesToRun =
      sampleCases.length > 0
        ? sampleCases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          }))
        : [{ input: "", expectedOutput: "" }];
  }

  const executableCode = wrapCodeWithDriver(
    sourceCode,
    language,
    problem as any
  );

  const results = await judgeProvider.execute(
    executableCode,
    language,
    testCasesToRun,
    {
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    }
  );

  const firstResult = results[0] ?? {
    verdict: "INTERNAL_ERROR",
    executionTime: 0,
    memoryUsage: 0,
  };

  const stdout = firstResult.stdout !== undefined ? firstResult.stdout : "";
  const stderr = firstResult.stderr ?? null;
  const compile_output = firstResult.compileOutput ?? null;
  const status = firstResult.verdict;

  return {
    results,
    primaryResult: {
      ...firstResult,
      stdout,
      stderr,
      compile_output,
      status,
    },
    stdout,
    stderr,
    compile_output,
    status,
  };
}

// ─── 2. Submit Solution (Official evaluation) ──────────────────────────────────

export async function submitSolution(
  input: CreateSubmissionInput,
  userId: string,
  userRole: Role
) {
  const { problemId, contestId, language, sourceCode } = input;

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });
  if (!problem) throw new AppError("Problem not found", 404);

  // Validate allowed language
  if (
    problem.allowedLanguages.length > 0 &&
    !problem.allowedLanguages.map((l) => l.toLowerCase()).includes(language.toLowerCase())
  ) {
    throw new AppError(
      `Language '${language}' is not permitted. Allowed: ${problem.allowedLanguages.join(", ")}`,
      400
    );
  }

  // If contest submission, validate contest rules
  if (contestId) {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        participants: { where: { userId } },
        problems: { where: { problemId } },
      },
    });

    if (!contest) throw new AppError("Contest not found", 404);

    const isPrivileged = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(userRole);

    // If student, contest must be LIVE
    if (!isPrivileged && contest.status !== "LIVE") {
      throw new AppError(
        "Submissions are only allowed while the contest is actively LIVE",
        403
      );
    }

    // Must be registered
    if (!isPrivileged && contest.participants.length === 0) {
      throw new AppError("You must register for this contest before submitting", 403);
    }

    // Problem must belong to contest
    if (contest.problems.length === 0) {
      throw new AppError("This problem is not part of the specified contest", 400);
    }
  }

  // Create submission record in DB
  const submission = await prisma.submission.create({
    data: {
      userId,
      contestId: contestId ?? null,
      problemId,
      language,
      sourceCode,
      status: "QUEUED",
    },
    include: {
      problem: { select: { title: true, slug: true } },
    },
  });

  // Enqueue job to BullMQ
  try {
    await submissionQueue.add(
      "evaluate-submission",
      { submissionId: submission.id },
      { jobId: submission.id }
    );
  } catch (queueErr) {
    // If Redis is not running in development, fallback to mock execution in background
    console.warn(
      `[Queue Warning] Failed to enqueue to Redis. Triggering local evaluation:`,
      (queueErr as Error).message
    );
    // Execute asynchronously
    processSubmissionDirectly(submission.id).catch((err) =>
      console.error("[Local Direct Eval Error]", err)
    );
  }

  // Real-time notification: QUEUED
  emitSubmissionStatus(userId, submission.contestId, {
    submissionId: submission.id,
    problemId: submission.problemId,
    contestId: submission.contestId,
    status: "QUEUED",
  });

  return submission;
}

// ─── 3. Get Submission Details ────────────────────────────────────────────────

export async function getSubmissionById(
  submissionId: string,
  viewerUserId: string,
  viewerRole: Role
) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: { select: { id: true, title: true, slug: true, difficulty: true } },
      contest: { select: { id: true, title: true, slug: true } },
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
      results: {
        select: {
          id: true,
          testCaseId: true,
          verdict: true,
          executionTime: true,
          memoryUsage: true,
          stderr: true,
        },
      },
    },
  });

  if (!submission) throw new AppError("Submission not found", 404);

  const isPrivileged = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(viewerRole);
  const isOwner = submission.userId === viewerUserId;

  if (!isOwner && !isPrivileged) {
    throw new AppError("Forbidden: You do not have permission to view this submission", 403);
  }

  return {
    id: submission.id,
    userId: submission.userId,
    userName: submission.user.profile?.fullName ?? submission.user.email,
    problemId: submission.problemId,
    problemTitle: submission.problem.title,
    contestId: submission.contestId,
    contestTitle: submission.contest?.title ?? null,
    language: submission.language,
    sourceCode: isOwner || isPrivileged ? submission.sourceCode : undefined,
    status: submission.status,
    executionTime: submission.executionTime,
    memoryUsage: submission.memoryUsage,
    results: submission.results,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

// ─── 4. List Submissions ──────────────────────────────────────────────────────

export async function listSubmissions(
  query: SubmissionListQuery,
  viewerUserId: string,
  viewerRole: Role
) {
  const { problemId, contestId, userId, status, page, limit } = query;
  const skip = (page - 1) * limit;

  const isPrivileged = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(viewerRole);

  const where: Record<string, unknown> = {};

  if (problemId) where.problemId = problemId;
  if (contestId) where.contestId = contestId;
  if (status) where.status = status;

  // Students default to viewing their own submissions unless specified
  if (!isPrivileged) {
    where.userId = viewerUserId;
  } else if (userId) {
    where.userId = userId;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        problem: { select: { title: true, slug: true, difficulty: true } },
        user: { select: { email: true, profile: { select: { fullName: true } } } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    data: submissions.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.profile?.fullName ?? s.user.email,
      problemId: s.problemId,
      problemTitle: s.problem.title,
      problemDifficulty: s.problem.difficulty,
      contestId: s.contestId,
      language: s.language,
      status: s.status,
      executionTime: s.executionTime,
      memoryUsage: s.memoryUsage,
      createdAt: s.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Helper for direct fallback evaluation when Redis is unavailable ──────────

export async function processSubmissionDirectly(submissionId: string) {
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

  if (!submission) return;

  // Mark RUNNING
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "RUNNING" },
  });

  emitSubmissionStatus(submission.userId, submission.contestId, {
    submissionId,
    problemId: submission.problemId,
    contestId: submission.contestId,
    status: "RUNNING",
  });

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

  // Compute aggregate verdict & save results
  let aggregateVerdict: any = "ACCEPTED";
  let maxTime = 0;
  let maxMemory = 0;

  await prisma.submissionResult.deleteMany({
    where: { submissionId },
  });

  const verdictPriority: Record<string, number> = {
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
    if (jr.executionTime > maxTime) maxTime = jr.executionTime;
    if (jr.memoryUsage > maxMemory) maxMemory = jr.memoryUsage;

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

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: aggregateVerdict,
      executionTime: maxTime,
      memoryUsage: maxMemory,
    },
  });

  // Real-time notification: Final verdict
  emitSubmissionStatus(submission.userId, submission.contestId, {
    submissionId,
    problemId: submission.problemId,
    contestId: submission.contestId,
    status: aggregateVerdict,
    verdict: aggregateVerdict,
    executionTime: maxTime,
    memoryUsage: maxMemory,
  });

  // If contest submission, trigger real-time leaderboard recalculation
  if (submission.contestId) {
    try {
      await recalculateAndPersistLeaderboard(submission.contestId);
    } catch (recalcErr) {
      console.error("[Leaderboard Recalculate Error]", recalcErr);
    }
  }
}
