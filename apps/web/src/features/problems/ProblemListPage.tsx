import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AppLayout } from "../../components/layout/Navbar";
import { Button, Alert } from "../../components/ui/FormElements";
import {
  Code2,
  Search,
  PlusCircle,
  Tag as TagIcon,
  Clock,
  HardDrive,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import type { IProblem, Difficulty } from "@campusoj/shared";

interface ProblemListItem extends IProblem {
  submissionCount: number;
}

export default function ProblemListPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPrivileged =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  // Debounce search input for backend query
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (difficulty) params.difficulty = difficulty;
      if (selectedTag.trim()) params.tag = selectedTag.trim();
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await api.get<{
        success: boolean;
        data: ProblemListItem[];
      }>("/problems", { params });
      setProblems(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problems");
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, selectedTag, debouncedSearch]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Instant reactive client-side filter
  const displayedProblems = useMemo(() => {
    if (!search.trim()) return problems;
    const q = search.toLowerCase();
    return problems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) &&
          p.tags.some((t) =>
            typeof t === "string" ? t.toLowerCase().includes(q) : false
          ))
    );
  }, [problems, search]);

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Problem Archive</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Sharpen your programming skills with practice problems across varying data structures and algorithms.
          </p>
        </div>

        {isPrivileged && (
          <Link to="/admin/problems/new">
            <Button variant="primary" className="whitespace-nowrap font-semibold shadow-sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Problem
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:text-slate-900 text-sm outline-none transition font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white text-slate-900 border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition w-full md:w-auto font-medium cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <TagIcon className="h-4 w-4 text-slate-400 hidden sm:block" />
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Filter by tag..."
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 pr-7 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:text-slate-900 transition w-full md:w-auto font-medium"
            />
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag("")}
                className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition"
                title="Clear tag"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Problems Table / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-3" />
          <p className="text-sm text-slate-500">Loading problem set...</p>
        </div>
      ) : displayedProblems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Code2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No problems found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or difficulty filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {displayedProblems.map((problem) => (
              <div
                key={problem.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/problems/${problem.id}`}
                      className="font-bold text-gray-900 hover:text-brand-600 transition text-base"
                    >
                      {problem.title}
                    </Link>

                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className="cursor-pointer text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md transition"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Limits & Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {problem.timeLimit} ms
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5" />
                      {problem.memoryLimit} MB
                    </span>
                    <span>{problem.submissionCount} submissions</span>
                  </div>
                </div>

                <div className="sm:self-center">
                  <Link to={`/problems/${problem.id}`}>
                    <Button variant="primary" className="text-xs px-4 py-2 w-full sm:w-auto">
                      Solve
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    EASY: "bg-emerald-100 text-emerald-800 border-emerald-200",
    MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
    HARD: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
