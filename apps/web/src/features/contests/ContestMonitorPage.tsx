import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { getSocket, joinContest, leaveContest } from "../../lib/socket";
import type { IContest, SubmissionVerdict } from "@campusoj/shared";
import {
  Shield,
  ArrowLeft,
  Activity,
  Users,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Zap,
} from "lucide-react";

interface MonitorSubmission {
  id: string;
  userId: string;
  userName: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty?: string;
  language: string;
  status: SubmissionVerdict;
  executionTime: number | null;
  memoryUsage: number | null;
  createdAt: string;
}

interface MonitorParticipant {
  id: string;
  userId: string;
  registeredAt: string;
  user: {
    email: string;
    profile: {
      fullName: string;
      college: string | null;
    } | null;
  };
}

export default function ContestMonitorPage() {
  const { id } = useParams<{ id: string }>();

  const [contest, setContest] = useState<IContest | null>(null);
  const [submissions, setSubmissions] = useState<MonitorSubmission[]>([]);
  const [participants, setParticipants] = useState<MonitorParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"stream" | "participants">("stream");

  // Fetch initial contest data and submissions
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [contestRes, subsRes] = await Promise.all([
        api.get<{ success: boolean; data: IContest & { participants: MonitorParticipant[] } }>(
          `/contests/${id}`
        ),
        api.get<{
          success: boolean;
          data: MonitorSubmission[];
        }>(`/submissions?contestId=${id}&limit=50`),
      ]);

      setContest(contestRes.data.data);
      if (contestRes.data.data.participants) {
        setParticipants(contestRes.data.data.participants);
      }
      setSubmissions(subsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load contest monitor data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s fallback poll
    return () => clearInterval(interval);
  }, [loadData]);

  // Socket.IO live stream
  useEffect(() => {
    if (!id) return;
    joinContest(id);
    const socket = getSocket();

    const handleNewSubmission = (data: {
      submissionId: string;
      problemId: string;
      contestId: string | null;
      status: SubmissionVerdict;
      executionTime?: number | null;
      memoryUsage?: number | null;
    }) => {
      if (data.contestId === id) {
        setSubmissions((prev) => {
          const existingIdx = prev.findIndex((s) => s.id === data.submissionId);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              status: data.status,
              executionTime: data.executionTime ?? updated[existingIdx].executionTime,
              memoryUsage: data.memoryUsage ?? updated[existingIdx].memoryUsage,
            };
            return updated;
          }
          // Fetch refreshed list to obtain full problem and user relations
          loadData();
          return prev;
        });
      }
    };

    socket.on("contest:submission", handleNewSubmission);

    return () => {
      leaveContest(id);
      socket.off("contest:submission", handleNewSubmission);
    };
  }, [id, loadData]);

  // Analytics calculations
  const stats = useMemo(() => {
    const total = submissions.length;
    const accepted = submissions.filter((s) => s.status === "ACCEPTED").length;
    const wrongAnswer = submissions.filter((s) => s.status === "WRONG_ANSWER").length;
    const tle = submissions.filter((s) => s.status === "TIME_LIMIT_EXCEEDED").length;
    const runtimeErr = submissions.filter((s) => s.status === "RUNTIME_ERROR").length;
    const compileErr = submissions.filter((s) => s.status === "COMPILATION_ERROR").length;
    const pending = submissions.filter(
      (s) => s.status === "QUEUED" || s.status === "RUNNING" || s.status === "PENDING"
    ).length;

    const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return {
      total,
      accepted,
      wrongAnswer,
      tle,
      runtimeErr,
      compileErr,
      pending,
      rate,
    };
  }, [submissions]);

  const getVerdictBadge = (verdict: SubmissionVerdict) => {
    switch (verdict) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> AC
          </span>
        );
      case "WRONG_ANSWER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            WA
          </span>
        );
      case "TIME_LIMIT_EXCEEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            TLE
          </span>
        );
      case "COMPILATION_ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            CE
          </span>
        );
      case "RUNTIME_ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            RTE
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            RUNNING
          </span>
        );
      case "QUEUED":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            QUEUED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {verdict}
          </span>
        );
    }
  };

  if (loading && !contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Connecting to live contest monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to={`/contests/${id}`}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Contest Lobby"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    {contest?.title}
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Faculty Live Monitor
                    </span>
                  </h1>
                  <p className="text-xs text-gray-500">
                    Real-time submission activity & participant telemetry
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRefreshing(true);
                  loadData();
                }}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <Link
                to={`/contests/${id}/leaderboard`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Standings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Submissions</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">Total evaluated jobs</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Acceptance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.rate}%</div>
            <div className="text-xs text-gray-400 mt-1">{stats.accepted} accepted solutions</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Participants</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
            <div className="text-xs text-gray-400 mt-1">Registered students</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Queue</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-gray-400 mt-1">Evaluating now</div>
          </div>
        </div>

        {/* Verdict Distribution Bars */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Verdict Distribution
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">Accepted (AC)</div>
              <div className="text-lg font-bold text-emerald-800">{stats.accepted}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <div className="text-xs text-rose-700 font-medium">Wrong Answer (WA)</div>
              <div className="text-lg font-bold text-rose-800">{stats.wrongAnswer}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-xs text-amber-700 font-medium">Time Limit (TLE)</div>
              <div className="text-lg font-bold text-amber-800">{stats.tle}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-xs text-orange-700 font-medium">Runtime Error</div>
              <div className="text-lg font-bold text-orange-800">{stats.runtimeErr}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-xs text-purple-700 font-medium">Compile Error</div>
              <div className="text-lg font-bold text-purple-800">{stats.compileErr}</div>
            </div>
          </div>
        </div>

        {/* Tab Switching */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("stream")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "stream"
                ? "border-purple-600 text-purple-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Live Submissions Stream ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "participants"
                ? "border-purple-600 text-purple-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Registered Participants ({participants.length})
          </button>
        </div>

        {/* Tab 1: Live Submissions Stream */}
        {activeTab === "stream" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-3">Language</th>
                    <th className="py-3 px-3">Verdict</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Memory</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No submissions received yet in this contest.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{sub.userName}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {sub.problemTitle}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-600 uppercase">
                          {sub.language}
                        </td>
                        <td className="py-3 px-3">{getVerdictBadge(sub.status)}</td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-500">
                          {sub.executionTime !== null ? `${sub.executionTime}ms` : "—"}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-500">
                          {sub.memoryUsage !== null ? `${sub.memoryUsage}MB` : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {new Date(sub.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Registered Participants */}
        {activeTab === "participants" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Registration Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">
                        No participants registered yet.
                      </td>
                    </tr>
                  ) : (
                    participants.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {part.user.profile?.fullName || part.user.email.split("@")[0]}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs font-mono">
                          {part.user.email}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {part.user.profile?.college || "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {new Date(part.registeredAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
