import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/layout/Navbar";
import { Button } from "../components/ui/FormElements";
import { Role, type SubmissionVerdict } from "@campusoj/shared";
import api from "../lib/api";
import { getSocket, joinUser } from "../lib/socket";
import {
  Trophy,
  Code2,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  [Role.STUDENT]: "Student",
  [Role.FACULTY]: "Faculty",
  [Role.ADMIN]: "Administrator",
  [Role.SUPER_ADMIN]: "Super Administrator",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  [Role.STUDENT]: "bg-blue-100 text-blue-700",
  [Role.FACULTY]: "bg-purple-100 text-purple-700",
  [Role.ADMIN]: "bg-orange-100 text-orange-700",
  [Role.SUPER_ADMIN]: "bg-red-100 text-red-700",
};

interface UserSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty?: string;
  contestId: string | null;
  language: string;
  status: SubmissionVerdict;
  executionTime: number | null;
  memoryUsage: number | null;
  createdAt: string;
}

interface ContestItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  startTime: string;
  endTime: string;
  isRegistered?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const isPrivileged =
    user?.role === Role.FACULTY ||
    user?.role === Role.ADMIN ||
    user?.role === Role.SUPER_ADMIN;

  const {
    data: dashboardData,
    isLoading: loading,
    refetch: loadUserData,
  } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      if (!user) return { submissions: [], contests: [] };
      const [subsRes, contestsRes] = await Promise.all([
        api.get<{ success: boolean; data: UserSubmission[] }>(
          `/submissions?userId=${user.id}&limit=50`
        ),
        api.get<{ success: boolean; data: ContestItem[] }>(
          `/contests?limit=10`
        ),
      ]);
      return {
        submissions: subsRes.data.data || [],
        contests: contestsRes.data.data || [],
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
  });

  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  useEffect(() => {
    if (dashboardData?.submissions) {
      setSubmissions(dashboardData.submissions);
    }
  }, [dashboardData?.submissions]);

  const contests = dashboardData?.contests ?? [];

  // Real-time listener for user submissions
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    joinUser(user.id);

    const handleStatus = (data: {
      submissionId: string;
      problemId: string;
      status: SubmissionVerdict;
      executionTime?: number | null;
      memoryUsage?: number | null;
    }) => {
      setSubmissions((prev) => {
        const idx = prev.findIndex((s) => s.id === data.submissionId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            status: data.status,
            executionTime: data.executionTime ?? next[idx].executionTime,
            memoryUsage: data.memoryUsage ?? next[idx].memoryUsage,
          };
          return next;
        }
        // If brand new, reload list to get problem title relations
        loadUserData();
        return prev;
      });
    };

    socket.on("submission:status", handleStatus);
    return () => {
      socket.off("submission:status", handleStatus);
    };
  }, [user, loadUserData]);

  // Statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const acceptedSubs = submissions.filter((s) => s.status === "ACCEPTED");
    const uniqueSolved = new Set(acceptedSubs.map((s) => s.problemId)).size;
    const acceptanceRate =
      total > 0 ? Math.round((acceptedSubs.length / total) * 100) : 0;
    const liveContests = contests.filter((c) => c.status === "LIVE").length;

    return {
      total,
      uniqueSolved,
      acceptanceRate,
      liveContests,
    };
  }, [submissions, contests]);

  const getVerdictBadge = (verdict: SubmissionVerdict) => {
    switch (verdict) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> AC
          </span>
        );
      case "WRONG_ANSWER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            WA
          </span>
        );
      case "TIME_LIMIT_EXCEEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            TLE
          </span>
        );
      case "COMPILATION_ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            CE
          </span>
        );
      case "RUNTIME_ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            RTE
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            Judging...
          </span>
        );
      case "QUEUED":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Queued
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {verdict}
          </span>
        );
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Profile Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold flex-shrink-0 border border-brand-200">
                {user.profile?.fullName?.[0]?.toUpperCase() ??
                  user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {user.profile?.fullName ?? user.email}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      ROLE_BADGE_COLORS[user.role] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                {user.profile?.college && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {user.profile.college}
                  </p>
                )}
              </div>
            </div>

            {isPrivileged && (
              <div className="flex items-center gap-2">
                <Link to="/admin/contests/new">
                  <Button variant="secondary" className="text-xs">
                    <PlusCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    New Contest
                  </Button>
                </Link>
                <Link to="/admin/problems/new">
                  <Button variant="primary" className="text-xs">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    New Problem
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Problems Solved"
              value={loading ? "..." : String(stats.uniqueSolved)}
            />
            <StatCard
              label="Total Submissions"
              value={loading ? "..." : String(stats.total)}
            />
            <StatCard
              label="Acceptance Rate"
              value={loading ? "..." : `${stats.acceptanceRate}%`}
            />
            <StatCard
              label="Live Contests"
              value={loading ? "..." : String(stats.liveContests)}
            />
          </div>
        </div>

        {/* ── Active & Live Contests ── */}
        {contests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Featured Contests
              </h2>
              <Link
                to="/contests"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contests.slice(0, 3).map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          contest.status === "LIVE"
                            ? "bg-emerald-100 text-emerald-800 animate-pulse"
                            : contest.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {contest.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                      {contest.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      Starts: {new Date(contest.startTime).toLocaleDateString()}{" "}
                      {new Date(contest.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <Link
                      to={`/contests/${contest.id}`}
                      className="flex-1 text-center py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 rounded-lg border border-gray-200"
                    >
                      Lobby
                    </Link>
                    <Link
                      to={`/contests/${contest.id}/leaderboard`}
                      className="flex-1 text-center py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-xs font-semibold text-brand-700 rounded-lg border border-brand-200 flex items-center justify-center gap-1"
                    >
                      <Trophy className="w-3 h-3" /> Standings
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Submissions ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Recent Submissions
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-3">Verdict</th>
                    <th className="py-3 px-3">Language</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Memory</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        No submissions yet. Solve problems to build your track record!
                      </td>
                    </tr>
                  ) : (
                    submissions.slice(0, 5).map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {sub.problemTitle}
                        </td>
                        <td className="py-3 px-3">{getVerdictBadge(sub.status)}</td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-600 uppercase">
                          {sub.language}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-500">
                          {sub.executionTime !== null
                            ? `${sub.executionTime}ms`
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-500">
                          {sub.memoryUsage !== null
                            ? `${sub.memoryUsage}MB`
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/problems/${sub.problemId}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            Solve <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contests Arena */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 border border-amber-200">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Contests Arena
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Join live campus programming competitions, register for upcoming
                contests, and compete for rank on real-time leaderboards.
              </p>
            </div>
            <div className="mt-6">
              <Link to="/contests">
                <Button
                  variant="primary"
                  className="bg-amber-600 hover:bg-amber-700 text-xs px-4 py-2"
                >
                  Browse Contests
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Problem Archive */}
          <div className="bg-gradient-to-br from-brand-50 to-indigo-50/50 rounded-2xl border border-brand-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4 border border-brand-200">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Problem Archive
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Practice data structures and algorithmic challenges across Easy,
                Medium, and Hard difficulty levels.
              </p>
            </div>
            <div className="mt-6">
              <Link to="/problems">
                <Button variant="primary" className="text-xs px-4 py-2">
                  Explore Problems
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 px-5 py-4 bg-gray-50/80">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
