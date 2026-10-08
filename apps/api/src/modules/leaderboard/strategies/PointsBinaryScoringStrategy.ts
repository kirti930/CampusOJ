import type {
  ScoringEngine,
  ContestProblemMeta,
  ContestParticipantMeta,
  ContestSubmissionMeta,
} from "../scoringStrategy.interface.js";
import type { LeaderboardRowData, ProblemScoreStatus } from "@campusoj/shared";

export class PointsBinaryScoringStrategy implements ScoringEngine {
  calculate(
    _contestStartTime: Date,
    problems: ContestProblemMeta[],
    participants: ContestParticipantMeta[],
    submissions: ContestSubmissionMeta[]
  ): LeaderboardRowData[] {
    const subsByUserAndProblem = new Map<string, Map<string, ContestSubmissionMeta[]>>();

    for (const sub of submissions) {
      if (!subsByUserAndProblem.has(sub.userId)) {
        subsByUserAndProblem.set(sub.userId, new Map());
      }
      const userProblems = subsByUserAndProblem.get(sub.userId)!;
      if (!userProblems.has(sub.problemId)) {
        userProblems.set(sub.problemId, []);
      }
      userProblems.get(sub.problemId)!.push(sub);
    }

    const rows: LeaderboardRowData[] = [];

    for (const participant of participants) {
      const userId = participant.userId;
      const userProblems =
        subsByUserAndProblem.get(userId) ??
        new Map<string, ContestSubmissionMeta[]>();

      let solvedCount = 0;
      let totalScore = 0;
      let lastAcTime: Date | null = null;
      const problemMatrix: Record<string, ProblemScoreStatus> = {};

      for (const prob of problems) {
        const pSubs: ContestSubmissionMeta[] = [
          ...(userProblems.get(prob.problemId) ?? []),
        ];
        pSubs.sort(
          (a: ContestSubmissionMeta, b: ContestSubmissionMeta) =>
            a.createdAt.getTime() - b.createdAt.getTime()
        );

        const acSub = pSubs.find((s) => s.status === "ACCEPTED");

        if (acSub) {
          solvedCount++;
          totalScore += prob.points;

          if (!lastAcTime || acSub.createdAt.getTime() > lastAcTime.getTime()) {
            lastAcTime = acSub.createdAt;
          }

          problemMatrix[prob.problemId] = {
            problemId: prob.problemId,
            points: prob.points,
            status: "ACCEPTED",
            attempts: pSubs.indexOf(acSub) + 1,
            penaltyMinutes: 0,
          };
        } else if (pSubs.length > 0) {
          const hasPending = pSubs.some(
            (s) =>
              s.status === "QUEUED" ||
              s.status === "RUNNING" ||
              s.status === "PENDING"
          );

          problemMatrix[prob.problemId] = {
            problemId: prob.problemId,
            points: prob.points,
            status: hasPending ? "PENDING" : "REJECTED",
            attempts: pSubs.length,
            penaltyMinutes: 0,
          };
        } else {
          problemMatrix[prob.problemId] = {
            problemId: prob.problemId,
            points: prob.points,
            status: "UNATTEMPTED",
            attempts: 0,
            penaltyMinutes: 0,
          };
        }
      }

      rows.push({
        rank: 1,
        userId,
        userName:
          participant.user.profile?.fullName ??
          participant.user.email.split("@")[0],
        userEmail: participant.user.email,
        college: participant.user.profile?.college ?? null,
        solvedCount,
        totalScore,
        penalty: 0,
        lastSubmissionTime: lastAcTime ? lastAcTime.toISOString() : null,
        problemMatrix,
      });
    }

    // Sort by:
    // 1. totalScore DESC
    // 2. lastSubmissionTime ASC (earliest AC wins tie)
    rows.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.lastSubmissionTime && b.lastSubmissionTime) {
        return (
          new Date(a.lastSubmissionTime).getTime() -
          new Date(b.lastSubmissionTime).getTime()
        );
      }
      return 0;
    });

    rows.forEach((row, i) => {
      row.rank = i + 1;
    });

    return rows;
  }
}
