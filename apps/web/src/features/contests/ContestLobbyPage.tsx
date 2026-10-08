import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AppLayout } from "../../components/layout/Navbar";
import { Button, Alert, Input } from "../../components/ui/FormElements";
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  Shield,
  ExternalLink,
  Info,
  Layers,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import type { IContestDetail } from "@campusoj/shared";

interface ProblemOption {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export default function ContestLobbyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [contest, setContest] = useState<IContestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Attach problem form state (for faculty/admin)
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachProblemId, setAttachProblemId] = useState("");
  const [attachPoints, setAttachPoints] = useState(100);
  const [attachOrderIndex, setAttachOrderIndex] = useState(0);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);

  // Searchable problem dropdown state
  const [availableProblems, setAvailableProblems] = useState<ProblemOption[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [problemSearch, setProblemSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPrivileged =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  const fetchContest = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: IContestDetail }>(
        `/contests/${id}`
      );
      setContest(res.data.data);
      setAttachOrderIndex(res.data.data.problems.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contest");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  // Live timer interval
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      if (now < start) {
        const diff = start - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`Starts in: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`Time Remaining: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      } else {
        setTimeRemaining("Contest has concluded");
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const handleRegister = async () => {
    if (!id) return;
    setIsRegistering(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.post(`/contests/${id}/register`);
      setSuccessMsg("Registration successful! You're in.");
      fetchContest();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchAvailableProblems = useCallback(async () => {
    setIsLoadingProblems(true);
    try {
      const res = await api.get<{ success: boolean; data: ProblemOption[] }>(
        "/problems?limit=100"
      );
      setAvailableProblems(res.data.data || []);
    } catch (err) {
      console.error("Failed to load problems:", err);
    } finally {
      setIsLoadingProblems(false);
    }
  }, []);

  useEffect(() => {
    if (showAttachModal && availableProblems.length === 0) {
      fetchAvailableProblems();
    }
  }, [showAttachModal, availableProblems.length, fetchAvailableProblems]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAttachModal = () => {
    setAttachProblemId("");
    setProblemSearch("");
    setIsDropdownOpen(false);
    setAttachError(null);
    setAttachPoints(100);
    setAttachOrderIndex(contest?.problems.length ?? 0);
    setShowAttachModal(true);
    fetchAvailableProblems();
  };

  const filteredProblems = useMemo(() => {
    if (!problemSearch.trim()) return availableProblems;
    const q = problemSearch.toLowerCase();
    return availableProblems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [availableProblems, problemSearch]);

  const selectedProblem = useMemo(() => {
    return availableProblems.find((p) => p.id === attachProblemId) || null;
  }, [availableProblems, attachProblemId]);

  const attachedProblemIds = useMemo(() => {
    return new Set(contest?.problems.map((p) => p.problemId) || []);
  }, [contest?.problems]);

  const handleAttachProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachProblemId.trim()) {
      setAttachError("Please select a problem from the dropdown selector.");
      return;
    }
    if (!id) return;
    setIsAttaching(true);
    setAttachError(null);
    try {
      await api.post(`/contests/${id}/problems`, {
        problemId: attachProblemId.trim(),
        orderIndex: Number(attachOrderIndex),
        points: Number(attachPoints),
      });
      setShowAttachModal(false);
      setAttachProblemId("");
      setProblemSearch("");
      setIsDropdownOpen(false);
      setSuccessMsg("Problem successfully attached to contest!");
      fetchContest();
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : "Failed to attach problem");
    } finally {
      setIsAttaching(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
          <p className="text-sm text-gray-500">Loading contest arena...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !contest) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Alert type="error" message={error ?? "Contest not found"} />
          <div className="mt-4 text-center">
            <Link to="/contests">
              <Button variant="secondary">Back to Contests</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const now = new Date();
  const isLive = contest.status === "LIVE" || (now >= start && now <= end);
  const isUpcoming = now < start && contest.status !== "ENDED";

  return (
    <AppLayout>
      {/* Contest Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isLive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse"
                    : isUpcoming
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {isLive ? "● LIVE CONTEST" : isUpcoming ? "SCHEDULED" : "CONCLUDED"}
              </span>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Strategy: {contest.scoringStrategy}
              </span>

              {contest.freezeLeaderboard && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Frozen Leaderboard
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {contest.title}
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-2xl">
              {contest.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {start.toLocaleString()} — {end.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{contest.participantCount} Participants</span>
              </div>
              {contest.createdByName && (
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>Organized by {contest.createdByName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action / Timer Box */}
          <div className="flex flex-col items-center sm:items-end gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 lg:min-w-[280px]">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Clock className="h-4 w-4 text-brand-600 animate-spin-slow" />
              <span>{timeRemaining}</span>
            </div>

            {isUpcoming && !contest.isRegistered ? (
              <Button
                variant="primary"
                className="w-full text-xs font-semibold shadow-sm"
                isLoading={isRegistering}
                onClick={handleRegister}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Register for Contest
              </Button>
            ) : contest.isRegistered ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> You are registered!
              </div>
            ) : null}

            {isPrivileged && (
              <Button
                variant="secondary"
                className="w-full text-xs"
                onClick={openAttachModal}
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-brand-600" />
                Attach Problem
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <Alert type="success" message={successMsg} className="mb-6" />
      )}

      {/* Main Grid: Problems + Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Problems Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Problems ({contest.problems.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {isPrivileged && (
                  <Button
                    variant="secondary"
                    className="text-xs py-1 px-2.5 h-auto"
                    onClick={openAttachModal}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1 text-brand-600" />
                    Attach Problem
                  </Button>
                )}
                <span className="text-xs text-gray-400">
                  {isLive || isPrivileged
                    ? "Select a problem to start solving"
                    : "Locked until contest starts"}
                </span>
              </div>
            </div>

            {contest.problems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No problems attached to this contest yet
                </p>
                {isPrivileged && (
                  <Button
                    variant="secondary"
                    className="text-xs mt-3"
                    onClick={openAttachModal}
                  >
                    Attach First Problem
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {contest.problems.map((prob, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C...
                  const canAccess = isLive || isPrivileged || contest.status === "ENDED";

                  return (
                    <div
                      key={prob.id}
                      className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-100">
                          {letter}
                        </span>
                        <div>
                          {canAccess && prob.title ? (
                            <Link
                              to={`/contests/${contest.id}/problems/${prob.problemId}`}
                              className="font-semibold text-gray-900 hover:text-brand-600 transition"
                            >
                              {prob.title}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-400">
                                Problem {letter}
                              </span>
                              <Lock className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-0.5">
                            {prob.difficulty && (
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  prob.difficulty === "EASY"
                                    ? "bg-green-100 text-green-700"
                                    : prob.difficulty === "MEDIUM"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {prob.points} points
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {canAccess ? (
                          <Link
                            to={`/contests/${contest.id}/problems/${prob.problemId}`}
                          >
                            <Button variant="secondary" className="text-xs px-3 py-1">
                              Solve
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rules & Info Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-gray-900">Rules & Strategy</h2>
            </div>

            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-800 block mb-1">
                  Scoring Strategy: {contest.scoringStrategy}
                </span>
                {contest.scoringStrategy === "ICPC" ? (
                  <p>
                    Rankings are determined by highest problems solved, then least total penalty time.
                    Incorrect submissions incur a 20-minute penalty once the problem is solved.
                  </p>
                ) : (
                  <p>
                    Points are awarded upon complete acceptance of all test cases. Each problem contributes
                    its designated points to your total score.
                  </p>
                )}
              </div>

              {contest.rules ? (
                <div>
                  <span className="font-semibold text-gray-800 block mb-1">
                    Special Contest Rules
                  </span>
                  <div className="whitespace-pre-wrap font-sans text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {contest.rules}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">
                  Standard CampusOJ competitive programming honor code applies. Plagiarism or multi-account usage leads to disqualification.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attach Problem Modal (Faculty/Admin) */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                Attach Problem to Contest
              </h3>
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Select an algorithmic challenge from the CampusOJ problem catalog.
            </p>

            {attachError && (
              <Alert type="error" message={attachError} className="mb-4 text-xs" />
            )}

            <form onSubmit={handleAttachProblem} className="space-y-4">
              {/* Searchable Problem Selector */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-gray-700">
                  Select Problem <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>

                  <input
                    type="text"
                    placeholder={
                      isLoadingProblems
                        ? "Loading problem catalog..."
                        : "Search by title or slug (e.g. Two Sum)..."
                    }
                    value={problemSearch}
                    onChange={(e) => {
                      setProblemSearch(e.target.value);
                      setIsDropdownOpen(true);
                      if (attachProblemId && selectedProblem?.title !== e.target.value) {
                        setAttachProblemId("");
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full pl-9 pr-9 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:text-slate-900 transition-all placeholder:text-slate-400 font-medium"
                  />

                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                    {attachProblemId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAttachProblemId("");
                          setProblemSearch("");
                          setIsDropdownOpen(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 pointer-events-none transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Selected Problem Confirmation Chip */}
                {selectedProblem && !isDropdownOpen && (
                  <div className="mt-1.5 p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          {selectedProblem.title}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                              selectedProblem.difficulty === "EASY"
                                ? "bg-emerald-100 text-emerald-800"
                                : selectedProblem.difficulty === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            [{selectedProblem.difficulty.charAt(0) + selectedProblem.difficulty.slice(1).toLowerCase()}]
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          /{selectedProblem.slug} • ID: {selectedProblem.id}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dropdown Options List */}
                {isDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50">
                    {isLoadingProblems ? (
                      <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        Loading problem catalog...
                      </div>
                    ) : filteredProblems.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        No matching problems found.
                      </div>
                    ) : (
                      filteredProblems.map((prob) => {
                        const isSelected = prob.id === attachProblemId;
                        const isAlreadyAttached = attachedProblemIds.has(prob.id);

                        return (
                          <button
                            key={prob.id}
                            type="button"
                            onClick={() => {
                              setAttachProblemId(prob.id);
                              setProblemSearch(prob.title);
                              setIsDropdownOpen(false);
                              setAttachError(null);
                            }}
                            className={`w-full text-left p-2.5 hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors ${
                              isSelected ? "bg-brand-50/60 font-medium" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-gray-900 truncate flex items-center gap-1.5">
                                {prob.title}
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase ${
                                    prob.difficulty === "EASY"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : prob.difficulty === "MEDIUM"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  [{prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}]
                                </span>
                                {isAlreadyAttached && (
                                  <span className="text-[10px] text-gray-400 italic font-normal">
                                    (Already attached)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate font-mono">
                                /{prob.slug}
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="orderIndex"
                  type="number"
                  label="Order Index"
                  value={attachOrderIndex}
                  onChange={(e) => setAttachOrderIndex(Number(e.target.value))}
                  min={0}
                  required
                />
                <Input
                  id="points"
                  type="number"
                  label="Points"
                  value={attachPoints}
                  onChange={(e) => setAttachPoints(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAttachModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAttaching}
                  disabled={!attachProblemId}
                >
                  Attach Problem
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
