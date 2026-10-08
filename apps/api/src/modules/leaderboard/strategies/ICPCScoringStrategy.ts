import type {
  ScoringEngine,
  ContestProblemMeta,
  ContestParticipantMeta,
  ContestSubmissionMeta,
} from "../scoringStrategy.interface.js";
import type { LeaderboardRowData, ProblemScoreStatus } from "@campusoj/shared";

export class ICPCScoringStrategy implements ScoringEngine {
  calculate(
    contestStartTime: Date,
    problems: ContestProblemMeta[],
    participants: ContestParticipantMeta[],
    submissions: ContestSubmissionMeta[]
  ): LeaderboardRowData[] {
    const startMs = contestStartTime.getTime();

    // Group submissions by userId then by problemId
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
      let totalPenalty = 0;
      let lastAcTime: Date | null = null;
      const problemMatrix: Record<string, ProblemScoreStatus> = {};

      for (const prob of problems) {
        const pSubs: ContestSubmissionMeta[] = [
          ...(userProblems.get(prob.problemId) ?? []),
        ];
        // Sort chronologically
        pSubs.sort(
          (a: ContestSubmissionMeta, b: ContestSubmissionMeta) =>
            a.createdAt.getTime() - b.createdAt.getTime()
        );

        let isAccepted = false;
        let rejectedBeforeAc = 0;
        let penaltyMinutes = 0;
        let solvedAtElapsedMinutes: number | undefined;

        for (const s of pSubs) {
          if (s.status === "ACCEPTED") {
            isAccepted = true;
            const elapsed = Math.max(
              0,
              Math.floor((s.createdAt.getTime() - startMs) / 60000)
            );
            solvedAtElapsedMinutes = elapsed;
            penaltyMinutes = elapsed + rejectedBeforeAc * 20;

            if (!lastAcTime || s.createdAt.getTime() > lastAcTime.getTime()) {
              lastAcTime = s.createdAt;
            }
            break; // Stop at first AC
          } else if (
            s.status !== "PENDING" &&
            s.status !== "QUEUED" &&
            s.status !== "RUNNING"
          ) {
            rejectedBeforeAc++;
          }
        }

        if (isAccepted) {
          solvedCount++;
          totalPenalty += penaltyMinutes;

          problemMatrix[prob.problemId] = {
            problemId: prob.problemId,
            points: prob.points,
            status: "ACCEPTED",
            attempts: rejectedBeforeAc + 1,
            penaltyMinutes,
            solvedAtElapsedMinutes,
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
            penaltyMinutes: 0, // Unsolved problems do NOT contribute to penalty
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
        rank: 1, // Assigned after sorting
        userId,
        userName:
          participant.user.profile?.fullName ??
          participant.user.email.split("@")[0],
        userEmail: participant.user.email,
        college: participant.user.profile?.college ?? null,
        solvedCount,
        totalScore: solvedCount * 100, // ICPC displays score proportional to solved
        penalty: totalPenalty,
        lastSubmissionTime: lastAcTime ? lastAcTime.toISOString() : null,
        problemMatrix,
      });
    }

    // Sort by:
    // 1. Solved problems DESC
    // 2. Penalty ASC (lower penalty wins)
    // 3. Last AC time ASC
    rows.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      if (a.penalty !== b.penalty) {
        return a.penalty - b.penalty;
      }
      if (a.lastSubmissionTime && b.lastSubmissionTime) {
        return (
          new Date(a.lastSubmissionTime).getTime() -
          new Date(b.lastSubmissionTime).getTime()
        );
      }
      return 0;
    });

    // Assign rank with tie handling
    rows.forEach((row, i) => {
      row.rank = i + 1;
    });

    return rows;
  }
}
