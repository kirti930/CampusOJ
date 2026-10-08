import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";
import { AppLayout } from "../../components/layout/Navbar";
import { Button, Input, Alert } from "../../components/ui/FormElements";
import { Trophy, ArrowLeft, Sparkles } from "lucide-react";
import type { ScoringStrategy } from "@campusoj/shared";

export default function CreateContestPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scoringStrategy, setScoringStrategy] = useState<ScoringStrategy>("ICPC");
  const [freezeLeaderboard, setFreezeLeaderboard] = useState(false);
  const [rules, setRules] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title if slug not manually changed
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim() || !description.trim() || !startTime || !endTime) {
      setError("Please fill in all required fields.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      setError("Contest End Time must be later than Start Time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; data: { id: string } }>("/contests", {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        scoringStrategy,
        freezeLeaderboard,
        rules: rules.trim() || undefined,
      });

      navigate(`/contests/${res.data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          to="/contests"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Contests
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create New Contest
              </h1>
              <p className="text-xs text-gray-500">
                Configure timing, rules, and scoring strategy for your campus competition.
              </p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="title"
                label="Contest Title *"
                placeholder="e.g. Code Clash 2026 Season 1"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <Input
                id="slug"
                label="Slug (URL identifier) *"
                placeholder="e.g. code-clash-2026-season-1"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Description *
              </label>
              <textarea
                className="w-full h-24 text-sm p-3 rounded-xl border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Describe the contest goals, eligibility, and format..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  className="w-full text-sm p-2.5 rounded-xl bg-white text-slate-900 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  className="w-full text-sm p-2.5 rounded-xl bg-white text-slate-900 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Scoring Strategy
                </label>
                <select
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-slate-900 font-medium"
                  value={scoringStrategy}
                  onChange={(e) => setScoringStrategy(e.target.value as ScoringStrategy)}
                >
                  <option value="ICPC">ICPC (Solved count + Penalty minutes)</option>
                  <option value="POINTS_BINARY">Points Binary (Total sum of problem points)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freezeLeaderboard}
                    onChange={(e) => setFreezeLeaderboard(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  Freeze Leaderboard (Hide last hour updates)
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Custom Contest Rules & Guidelines (Optional)
              </label>
              <textarea
                className="w-full h-24 text-sm p-3 rounded-xl border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Specify any special penalties, team collaboration rules, or resource restrictions..."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link to="/contests">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Publish Contest
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
