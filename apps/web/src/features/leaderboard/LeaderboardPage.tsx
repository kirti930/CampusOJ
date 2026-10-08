import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { getSocket, joinContest, leaveContest } from "../../lib/socket";
import { useAuth } from "../../context/AuthContext";
import type { LeaderboardResponse, LeaderboardRowData } from "@campusoj/shared";
import {
  Trophy,
  ArrowLeft,
  Snowflake,
  RefreshCw,
  Search,
  CheckCircle2,
  Shield,
  Activity,
  AlertCircle,
} from "lucide-react";

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isPrivileged =
    user && ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcMessage, setRecalcMessage] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get<{
        success: boolean;
        data: LeaderboardResponse;
      }>(`/contests/${id}/leaderboard`);
      setLeaderboard(res.data.data);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch and 15s polling fallback
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Socket.IO real-time listener
  useEffect(() => {
    if (!id) return;

    const socket = getSocket();
    joinContest(id);

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("leaderboard:update", (updated: LeaderboardResponse) => {
      if (updated.contestId === id) {
        setLeaderboard(updated);
      }
    });

    return () => {
      leaveContest(id);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("leaderboard:update");
    };
  }, [id]);

  // Faculty/Admin manual recalculation
  const handleRecalculate = async () => {
    if (!id) return;
    setIsRecalculating(true);
    setRecalcMessage(null);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: LeaderboardResponse;
      }>(`/contests/${id}/leaderboard/recalculate`);
      setLeaderboard(res.data.data);
      setRecalcMessage("Standings recalculated & broadcasted!");
      setTimeout(() => setRecalcMessage(null), 4000);
    } catch (err: unknown) {
      setRecalcMessage((err as Error).message || "Failed to recalculate");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Filter rows by search
  const filteredRows = useMemo(() => {
    if (!leaderboard) return [];
    if (!search.trim()) return leaderboard.rows;
    const q = search.toLowerCase();
    return leaderboard.rows.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        (r.college && r.college.toLowerCase().includes(q))
    );
  }, [leaderboard, search]);

  const getProblemLetter = (idx: number) =>
    String.fromCharCode(65 + (idx % 26));

  if (loading && !leaderboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading live standings...</p>
        </div>
      </div>
    );
  }

  if (error && !leaderboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Failed to Load Leaderboard
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to={id ? `/contests/${id}` : "/contests"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Contest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Top Header Bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/contests/${id}`}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Contest Lobby"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {leaderboard?.contestTitle || "Contest Leaderboard"}
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 ml-8 text-xs text-gray-500">
                <span className="px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {leaderboard?.scoringStrategy === "ICPC"
                    ? "ICPC Rules (Penalty & Solved)"
                    : "Points Binary"}
                </span>
                <span>•</span>
                <span>{leaderboard?.rows.length || 0} Participants</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSocketConnected
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  {isSocketConnected ? "Live Synced" : "Polling fallback"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchLeaderboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {isPrivileged && (
                <button
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                  title="Recalculate and broadcast live scores to all participants"
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      isRecalculating ? "animate-spin" : ""
                    }`}
                  />
                  {isRecalculating ? "Recalculating..." : "Recalculate Standings"}
                </button>
              )}

              {isPrivileged && (
                <Link
                  to={`/admin/contests/${id}/monitor`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Live Monitor
                </Link>
              )}
            </div>
          </div>

          {/* Alert messages */}
          {recalcMessage && (
            <div className="mt-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              {recalcMessage}
            </div>
          )}

          {leaderboard?.isFrozen && (
            <div className="mt-3 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs font-medium text-sky-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-sky-500 animate-spin-slow" />
                <span>
                  <strong>Leaderboard Frozen:</strong> Standings reflect
                  submissions up to the final hour. Live results will unlock
                  after the contest ends.
                </span>
              </div>
              {isPrivileged && (
                <span className="bg-sky-200 text-sky-800 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                  Faculty Unfrozen View
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:text-slate-900 font-medium"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing {filteredRows.length} of {leaderboard?.rows.length || 0}{" "}
            participants
          </div>
        </div>

        {/* ── Leaderboard Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center"># Rank</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Participant</th>
                  <th className="py-3.5 px-3 text-center w-20">Solved</th>
                  <th className="py-3.5 px-3 text-center w-24">
                    {leaderboard?.scoringStrategy === "ICPC"
                      ? "Score"
                      : "Points"}
                  </th>
                  {leaderboard?.scoringStrategy === "ICPC" && (
                    <th className="py-3.5 px-3 text-center w-24">Penalty</th>
                  )}
                  {/* Problem headers */}
                  {leaderboard?.problems.map((prob, idx) => (
                    <th
                      key={prob.id}
                      className="py-3.5 px-3 text-center min-w-[72px]"
                      title={`${prob.title} (${prob.points} pts)`}
                    >
                      <Link
                        to={`/contests/${id}/problems/${prob.id}`}
                        className="hover:text-brand-600 transition-colors"
                      >
                        <div className="font-bold text-gray-800">
                          {getProblemLetter(idx)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {prob.points} pts
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        4 +
                        (leaderboard?.scoringStrategy === "ICPC" ? 1 : 0) +
                        (leaderboard?.problems.length || 0)
                      }
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      No participants registered or no matching entries found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row: LeaderboardRowData) => {
                    const isCurrentUser = user && user.id === row.userId;
                    return (
                      <tr
                        key={row.userId}
                        className={`transition-colors ${
                          isCurrentUser
                            ? "bg-amber-50/60 font-medium"
                            : "hover:bg-gray-50/70"
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 text-center">
                          {row.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-sm">
                              🥇 1
                            </span>
                          ) : row.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs shadow-sm">
                              🥈 2
                            </span>
                          ) : row.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-bold text-xs shadow-sm">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-gray-600 font-semibold text-xs">
                              {row.rank}
                            </span>
                          )}
                        </td>

                        {/* Participant info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {row.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate flex items-center gap-1.5">
                                {row.userName}
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {row.college || row.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Solved count */}
                        <td className="py-3 px-3 text-center font-bold text-gray-900">
                          {row.solvedCount}
                        </td>

                        {/* Total Score / Points */}
                        <td className="py-3 px-3 text-center font-bold text-brand-700">
                          {row.totalScore}
                        </td>

                        {/* Penalty for ICPC */}
                        {leaderboard?.scoringStrategy === "ICPC" && (
                          <td className="py-3 px-3 text-center text-xs font-mono text-gray-600">
                            {row.penalty}
                          </td>
                        )}

                        {/* Problem Matrix Cells */}
                        {leaderboard?.problems.map((prob) => {
                          const status = row.problemMatrix[prob.id];
                          if (!status || status.status === "UNATTEMPTED") {
                            return (
                              <td
                                key={prob.id}
                                className="py-3 px-3 text-center text-gray-300 font-mono text-xs"
                              >
                                —
                              </td>
                            );
                          }

                          if (status.status === "ACCEPTED") {
                            return (
                              <td
                                key={prob.id}
                                className="py-2 px-2 text-center"
                              >
                                <div className="inline-flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                                  <span className="font-bold text-xs">
                                    +{status.attempts}
                                  </span>
                                  {status.solvedAtElapsedMinutes !==
                                    undefined && (
                                    <span className="text-[10px] font-mono text-emerald-600">
                                      {status.solvedAtElapsedMinutes}m
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          if (status.status === "PENDING") {
                            return (
                              <td
                                key={prob.id}
                                className="py-2 px-2 text-center"
                              >
                                <div className="inline-flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 animate-pulse">
                                  <span className="font-bold text-xs">
                                    ?{status.attempts}
                                  </span>
                                  <span className="text-[10px] text-amber-600 font-medium">
                                    Judging
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          // REJECTED
                          return (
                            <td
                              key={prob.id}
                              className="py-2 px-2 text-center"
                            >
                              <div className="inline-flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                                <span className="font-bold text-xs">
                                  -{status.attempts}
                                </span>
                                <span className="text-[10px] text-rose-600 font-medium">
                                  Failed
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
