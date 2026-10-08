import type {
  SubmissionVerdict,
  LeaderboardRowData,
} from "@campusoj/shared";

export interface ContestProblemMeta {
  problemId: string;
  title: string;
  slug: string;
  points: number;
  orderIndex: number;
}

export interface ContestParticipantMeta {
  userId: string;
  user: {
    email: string;
    profile: {
      fullName: string;
      college: string | null;
    } | null;
  };
}

export interface ContestSubmissionMeta {
  id: string;
  userId: string;
  problemId: string;
  status: SubmissionVerdict;
  createdAt: Date;
}

export interface ScoringEngine {
  calculate(
    contestStartTime: Date,
    problems: ContestProblemMeta[],
    participants: ContestParticipantMeta[],
    submissions: ContestSubmissionMeta[]
  ): LeaderboardRowData[];
}
