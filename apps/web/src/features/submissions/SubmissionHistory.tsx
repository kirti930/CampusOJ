import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { Clock, HardDrive, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import type { SubmissionVerdict } from "@campusoj/shared";

interface SubmissionHistoryItem {
  id: string;
  userId: string;
  userName: string;
  problemId: string;
  language: string;
  status: SubmissionVerdict;
  executionTime: number | null;
  memoryUsage: number | null;
  createdAt: string;
}

interface SubmissionHistoryProps {
  problemId: string;
  contestId?: string;
  refreshTrigger?: number;
}

export function SubmissionHistory({
  problemId,
  contestId,
  refreshTrigger = 0,
}: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        problemId,
        limit: 20,
      };
      if (contestId) params.contestId = contestId;

      const res = await api.get<{
        success: boolean;
        data: SubmissionHistoryItem[];
      }>("/submissions", { params });
      setSubmissions(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [problemId, contestId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-xs text-gray-500">
        <RotateCw className="h-4 w-4 animate-spin mr-2 text-brand-600" />
        Loading submission records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
        {error}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
        No submissions yet for this problem. Write code and hit &quot;Submit&quot; to test your solution!
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition text-xs"
          >
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={sub.status} />

              <span className="font-mono uppercase text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                {sub.language}
              </span>

              <span className="text-gray-400">
                {new Date(sub.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                {sub.executionTime !== null ? `${sub.executionTime} ms` : "—"}
              </span>

              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-gray-400" />
                {sub.memoryUsage !== null ? `${sub.memoryUsage} MB` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerdictBadge({ verdict }: { verdict: SubmissionVerdict }) {
  switch (verdict) {
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
        </span>
      );
    case "WRONG_ANSWER":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="h-3.5 w-3.5" /> Wrong Answer
        </span>
      );
    case "TIME_LIMIT_EXCEEDED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="h-3.5 w-3.5" /> Time Limit Exceeded
        </span>
      );
    case "MEMORY_LIMIT_EXCEEDED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <HardDrive className="h-3.5 w-3.5" /> Memory Limit Exceeded
        </span>
      );
    case "COMPILATION_ERROR":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
          <AlertCircle className="h-3.5 w-3.5" /> Compilation Error
        </span>
      );
    case "RUNTIME_ERROR":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="h-3.5 w-3.5" /> Runtime Error
        </span>
      );
    case "QUEUED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <RotateCw className="h-3.5 w-3.5 animate-spin" /> Queued
        </span>
      );
    case "RUNNING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <RotateCw className="h-3.5 w-3.5 animate-spin" /> Evaluating
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
          {verdict}
        </span>
      );
  }
}
