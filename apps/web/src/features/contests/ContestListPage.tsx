import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AppLayout } from "../../components/layout/Navbar";
import { Button, Alert } from "../../components/ui/FormElements";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { IContest } from "@campusoj/shared";

type TabOption = "ALL" | "LIVE" | "UPCOMING" | "ENDED";

interface ContestListItem extends IContest {
  participantCount: number;
  createdByName: string | null;
  isRegistered?: boolean;
}

export default function ContestListPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState<ContestListItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabOption>("LIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPrivileged =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  const fetchContests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        success: boolean;
        data: ContestListItem[];
      }>("/contests", {
        params: { limit: 50 },
      });
      setContests(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleRegister = async (contestId: string) => {
    setRegisteringId(contestId);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.post(`/contests/${contestId}/register`);
      setSuccessMessage("You have successfully registered for the contest!");
      // Mark as registered in local state
      setContests((prev) =>
        prev.map((c) =>
          c.id === contestId
            ? { ...c, isRegistered: true, participantCount: c.participantCount + 1 }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setRegisteringId(null);
    }
  };

  // Filter based on tab and dates
  const now = new Date();
  const filteredContests = contests.filter((c) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);

    // Compute active or scheduled or ended
    const isLive = c.status === "LIVE" || (now >= start && now <= end && c.status !== "DRAFT");
    const isUpcoming =
      c.status === "SCHEDULED" || (now < start && c.status !== "ENDED" && c.status !== "DRAFT");
    const isPast = c.status === "ENDED" || now > end;

    if (activeTab === "LIVE") return isLive;
    if (activeTab === "UPCOMING") return isUpcoming;
    if (activeTab === "ENDED") return isPast;
    return true;
  });

  const liveCount = contests.filter((c) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);
    return c.status === "LIVE" || (now >= start && now <= end && c.status !== "DRAFT");
  }).length;

  const upcomingCount = contests.filter((c) => {
    const start = new Date(c.startTime);
    return c.status === "SCHEDULED" || (now < start && c.status !== "ENDED" && c.status !== "DRAFT");
  }).length;

  const pastCount = contests.filter((c) => {
    const end = new Date(c.endTime);
    return c.status === "ENDED" || now > end;
  }).length;

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Campus Competitions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Contest Arena
          </h1>
          <p className="text-brand-200 mt-1 text-sm max-w-xl">
            Test your algorithmic problem-solving skills, climb the live campus leaderboard, and earn certificates.
          </p>
        </div>

        {isPrivileged && (
          <Link to="/admin/contests/new">
            <Button
              variant="primary"
              className="bg-white text-brand-900 hover:bg-brand-50 border-0 font-semibold shadow-md whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 mr-1.5 text-brand-700" />
              Create Contest
            </Button>
          </Link>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          className="mb-6 animate-in fade-in"
        />
      )}
      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 pb-2 overflow-x-auto">
        <TabButton
          label="Live Now"
          count={liveCount}
          active={activeTab === "LIVE"}
          badgeColor="bg-emerald-100 text-emerald-700"
          onClick={() => setActiveTab("LIVE")}
        />
        <TabButton
          label="Upcoming"
          count={upcomingCount}
          active={activeTab === "UPCOMING"}
          badgeColor="bg-blue-100 text-blue-700"
          onClick={() => setActiveTab("UPCOMING")}
        />
        <TabButton
          label="Past"
          count={pastCount}
          active={activeTab === "ENDED"}
          badgeColor="bg-gray-100 text-gray-700"
          onClick={() => setActiveTab("ENDED")}
        />
        <TabButton
          label="All Contests"
          count={contests.length}
          active={activeTab === "ALL"}
          badgeColor="bg-gray-100 text-gray-700"
          onClick={() => setActiveTab("ALL")}
        />
      </div>

      {/* Contest Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
          <p className="text-sm text-gray-500">Loading contests...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
            <Trophy className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No {activeTab.toLowerCase()} contests found
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {activeTab === "LIVE"
              ? "There are currently no active contests running. Check the Upcoming tab for scheduled events!"
              : "No contests match the selected filter."}
          </p>
          {isPrivileged && (
            <Link to="/admin/contests/new" className="inline-block mt-4">
              <Button variant="secondary" className="text-xs">
                Schedule a Contest
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              isRegistering={registeringId === contest.id}
              onRegister={() => handleRegister(contest.id)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function TabButton({
  label,
  count,
  active,
  badgeColor,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  badgeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          active ? "bg-white/20 text-white" : badgeColor
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ContestCard({
  contest,
  isRegistering,
  onRegister,
}: {
  contest: ContestListItem;
  isRegistering: boolean;
  onRegister: () => void;
}) {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const now = new Date();

  const isLive = contest.status === "LIVE" || (now >= start && now <= end);
  const isPast = contest.status === "ENDED" || now > end;
  const isUpcoming = !isLive && !isPast;

  const durationHours = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  );

  // Time display
  let badgeText = "Upcoming";
  let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";

  if (isLive) {
    const diffMs = end.getTime() - now.getTime();
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    badgeText = `LIVE NOW (${hrs}h ${mins}m left)`;
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse";
  } else if (isUpcoming) {
    const diffMs = start.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    badgeText = days > 0 ? `Starts in ${days}d ${hrs}h` : `Starts in ${hrs}h`;
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else {
    badgeText = "Ended";
    badgeClass = "bg-gray-100 text-gray-600 border-gray-200";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}
          >
            {badgeText}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {contest.scoringStrategy}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 line-clamp-1">
          <Link to={`/contests/${contest.id}`} className="hover:text-brand-600">
            {contest.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {contest.description}
        </p>

        {/* Details list */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {start.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {start.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>Duration: {durationHours} hour{durationHours > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span>{contest.participantCount} registered participant{contest.participantCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-3">
        {isUpcoming && !contest.isRegistered ? (
          <Button
            variant="secondary"
            className="text-xs px-3 py-1.5 w-full bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
            isLoading={isRegistering}
            onClick={onRegister}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Register Now
          </Button>
        ) : contest.isRegistered ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Registered
          </span>
        ) : (
          <span />
        )}

        <Link to={`/contests/${contest.id}`} className="ml-auto">
          <Button variant="primary" className="text-xs px-3.5 py-1.5">
            {isLive ? "Enter Arena" : "View Lobby"}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
