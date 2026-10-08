import type { FunctionSignature, StarterCodeMap, DriverCodeMap } from "./codeWrapper.js";
export * from "./codeWrapper.js";

// ─────────────────────────────────────────────────────────────────────────────
// Enums  (kept in sync with packages/db/prisma/schema.prisma)
// Defined as const objects so they work in the browser without the Prisma client.
// ─────────────────────────────────────────────────────────────────────────────

export const Role = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ContestStatus = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  ENDED: "ENDED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ContestStatus = (typeof ContestStatus)[keyof typeof ContestStatus];

export const SubmissionVerdict = {
  PENDING: "PENDING",
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
export type SubmissionVerdict =
  (typeof SubmissionVerdict)[keyof typeof SubmissionVerdict];

export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const ScoringStrategy = {
  ICPC: "ICPC",
  POINTS_BINARY: "POINTS_BINARY",
} as const;
export type ScoringStrategy =
  (typeof ScoringStrategy)[keyof typeof ScoringStrategy];

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript interfaces (mirror Prisma models for frontend/API contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile {
  id: string;
  userId: string;
  fullName: string;
  college: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export interface IContest {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ContestStatus;
  scoringStrategy: ScoringStrategy;
  freezeLeaderboard: boolean;
  rules: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContestDetail extends IContest {
  participantCount: number;
  problems: IContestProblemEntry[];
  isRegistered?: boolean;
  createdByName?: string | null;
}

export interface IContestProblemEntry {
  id: string;        // ContestProblem id
  problemId: string;
  orderIndex: number;
  points: number;
  /** Only populated when contest is LIVE or user is Faculty/Admin */
  title?: string;
  slug?: string;
  difficulty?: Difficulty;
}

export interface IProblem {
  id: string;
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  timeLimit: number;
  memoryLimit: number;
  allowedLanguages: string[];
  functionSignature?: FunctionSignature | null;
  starterCode?: StarterCodeMap | null;
  driverCode?: DriverCodeMap | null;
  authorId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestCase {
  id: string;
  problemId: string;
  /** Present only for sample or faculty/admin */
  input?: string;
  /** Present only for sample or faculty/admin */
  expectedOutput?: string;
  isHidden: boolean;
  isSample: boolean;
  weight: number;
}

export interface IProblemDetail extends IProblem {
  testCases: ITestCase[];
  submissionCount?: number;
}

export interface ISubmission {
  id: string;
  userId: string;
  contestId: string | null;
  problemId: string;
  language: string;
  sourceCode: string;
  status: SubmissionVerdict;
  executionTime: number | null;
  memoryUsage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaderboardEntry {
  id: string;
  contestId: string;
  userId: string;
  solvedCount: number;
  totalScore: number;
  penalty: number;
  lastSubmissionTime: Date | null;
  updatedAt: Date;
}

export interface ProblemScoreStatus {
  problemId: string;
  points: number;
  status: "ACCEPTED" | "REJECTED" | "PENDING" | "UNATTEMPTED";
  attempts: number;
  penaltyMinutes: number;
  solvedAtElapsedMinutes?: number;
}

export interface LeaderboardRowData {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  college: string | null;
  solvedCount: number;
  totalScore: number;
  penalty: number;
  lastSubmissionTime: string | null;
  problemMatrix: Record<string, ProblemScoreStatus>;
}

export interface LeaderboardResponse {
  contestId: string;
  contestTitle: string;
  scoringStrategy: ScoringStrategy;
  isFrozen: boolean;
  problems: {
    id: string;
    title: string;
    slug: string;
    points: number;
    orderIndex: number;
  }[];
  rows: LeaderboardRowData[];
}

export interface ICertificate {
  id: string;
  certificateCode: string;
  userId: string;
  contestId: string;
  achievement: string;
  issuedAt: Date;
}

export interface ITag {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  fullName: z.string().min(2, "Full name too short").max(100),
  college: z.string().max(200).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ── Contest ───────────────────────────────────────────────────────────────────
export const ContestBaseSchema = z.object({
  title: z.string().min(3, "Title too short").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(3)
    .max(100),
  description: z.string().min(10, "Description too short"),
  startTime: z.string().datetime({ message: "startTime must be ISO 8601" }),
  endTime: z.string().datetime({ message: "endTime must be ISO 8601" }),
  scoringStrategy: z.enum(["ICPC", "POINTS_BINARY"]),
  freezeLeaderboard: z.boolean().default(false),
  rules: z.string().max(10000).optional(),
});

export const CreateContestSchema = ContestBaseSchema.refine(
  (d) => new Date(d.endTime) > new Date(d.startTime),
  { message: "endTime must be after startTime", path: ["endTime"] }
);

export type CreateContestInput = z.infer<typeof CreateContestSchema>;

export const UpdateContestSchema = ContestBaseSchema.partial().extend({
  status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "ENDED", "ARCHIVED"]).optional(),
}).refine(
  (d) => {
    if (d.startTime && d.endTime) {
      return new Date(d.endTime) > new Date(d.startTime);
    }
    return true;
  },
  { message: "endTime must be after startTime", path: ["endTime"] }
);
export type UpdateContestInput = z.infer<typeof UpdateContestSchema>;

export const AttachProblemSchema = z.object({
  problemId: z.string().uuid(),
  orderIndex: z.number().int().min(0),
  points: z.number().int().min(1).max(10000).default(100),
});
export type AttachProblemInput = z.infer<typeof AttachProblemSchema>;

// ── Problem ───────────────────────────────────────────────────────────────────
export const CreateProblemSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(3)
    .max(100),
  statement: z.string().min(10),
  inputFormat: z.string().min(1),
  outputFormat: z.string().min(1),
  constraints: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  timeLimit: z.number().int().min(100).max(10000),   // ms
  memoryLimit: z.number().int().min(16).max(1024),   // MB
  allowedLanguages: z.array(z.string()).min(1),
  functionSignature: z.any().optional(),
  starterCode: z.any().optional(),
  driverCode: z.any().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
});

export type CreateProblemInput = z.infer<typeof CreateProblemSchema>;

export const UpdateProblemSchema = CreateProblemSchema.partial();
export type UpdateProblemInput = z.infer<typeof UpdateProblemSchema>;

// ── Test Case ─────────────────────────────────────────────────────────────────
export const CreateTestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(true),
  isSample: z.boolean().default(false),
  weight: z.number().int().min(1).default(1),
});
export type CreateTestCaseInput = z.infer<typeof CreateTestCaseSchema>;

export const BulkTestCaseSchema = z.object({
  testCases: z.array(CreateTestCaseSchema).min(1).max(200),
});
export type BulkTestCaseInput = z.infer<typeof BulkTestCaseSchema>;

export const UploadTestCasesSchema = z.union([
  BulkTestCaseSchema,
  z.array(CreateTestCaseSchema).transform((testCases) => ({ testCases })),
  CreateTestCaseSchema.transform((tc) => ({ testCases: [tc] })),
]);
export type UploadTestCasesInput = z.infer<typeof UploadTestCasesSchema>;

// ── Submission ────────────────────────────────────────────────────────────────
export const CreateSubmissionSchema = z.object({
  problemId: z.string().uuid(),
  contestId: z.string().uuid().optional(),
  language: z.string().min(1),
  sourceCode: z.string().min(1).max(65536),
});
export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;

export const RunCodeSchema = z.object({
  problemId: z.string().uuid(),
  language: z.string().min(1),
  sourceCode: z.string().min(1).max(65536),
  customInput: z.string().max(65536).optional(),
});
export type RunCodeInput = z.infer<typeof RunCodeSchema>;

export const SubmissionListQuerySchema = z.object({
  problemId: z.string().uuid().optional(),
  contestId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z
    .enum([
      "PENDING",
      "QUEUED",
      "RUNNING",
      "ACCEPTED",
      "WRONG_ANSWER",
      "TIME_LIMIT_EXCEEDED",
      "MEMORY_LIMIT_EXCEEDED",
      "RUNTIME_ERROR",
      "COMPILATION_ERROR",
      "INTERNAL_ERROR",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type SubmissionListQuery = z.infer<typeof SubmissionListQuerySchema>;

// ── Query / List filters ──────────────────────────────────────────────────────
export const ContestListQuerySchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "ENDED", "ARCHIVED", "UPCOMING"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ContestListQuery = z.infer<typeof ContestListQuerySchema>;

export const ProblemListQuerySchema = z.object({
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ProblemListQuery = z.infer<typeof ProblemListQuerySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// API Response Envelope
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Payload
// ─────────────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Judge Job Payload
// ─────────────────────────────────────────────────────────────────────────────
export interface JudgeJobPayload {
  submissionId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  timeLimit: number;
  memoryLimit: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  "c",
  "cpp",
  "java",
  "python3",
  "javascript",
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const JUDGE_QUEUE_NAME = "judge-queue" as const;
export const SUBMISSION_QUEUE_NAME = "submissionQueue" as const;

export interface SubmissionJobPayload {
  submissionId: string;
}

// ── Judge Types ──────────────────────────────────────────────────────────────
export interface JudgeTestCase {
  id?: string;
  input: string;
  expectedOutput: string;
}

export interface JudgeLimits {
  timeLimit: number;   // ms
  memoryLimit: number; // MB
}

export interface JudgeResult {
  testCaseId?: string;
  verdict: SubmissionVerdict;
  executionTime: number; // ms
  memoryUsage: number;   // MB or KB
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  actualOutput?: string;
  expectedOutput?: string;
}

export interface JudgeProvider {
  execute(
    code: string,
    language: string,
    testCases: JudgeTestCase[],
    limits: JudgeLimits
  ): Promise<JudgeResult[]>;
}

/** Roles that can create/manage contests and problems */
export const PRIVILEGED_ROLES: Role[] = [
  Role.FACULTY,
  Role.ADMIN,
  Role.SUPER_ADMIN,
];

