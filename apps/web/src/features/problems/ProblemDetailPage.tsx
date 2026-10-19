import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "../../components/layout/Navbar";
import { Button, Alert, Input } from "../../components/ui/FormElements";
import { CodeEditor } from "../submissions/CodeEditor";
import { SubmissionHistory, VerdictBadge } from "../submissions/SubmissionHistory";
import { STARTER_TEMPLATES } from "../submissions/starterTemplates";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Clock,
  HardDrive,
  Plus,
  Shield,
  Eye,
  EyeOff,
  Play,
  Send,
  Terminal,
  History,
  RotateCw,
  Sparkles,
} from "lucide-react";
import {
  getProblemStarterCode,
  type IProblemDetail,
  type SubmissionVerdict,
} from "@campusoj/shared";

type WorkspaceTab = "RUN" | "SUBMIT" | "HISTORY";

interface RunResultData {
  verdict: SubmissionVerdict;
  executionTime: number;
  memoryUsage: number;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
}

interface SubmissionEvaluationData {
  id: string;
  status: SubmissionVerdict;
  executionTime: number | null;
  memoryUsage: number | null;
  results?: {
    id: string;
    verdict: SubmissionVerdict;
    executionTime: number;
    memoryUsage: number;
    stderr?: string;
  }[];
}

const formatTestCaseInput = (raw?: string) => {
  if (!raw) return "";
  if (raw.includes("=")) {
    return raw
      .replace(/[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/g, "")
      .replace(/,\s*/g, " ")
      .trim();
  }
  return raw;
};

export default function ProblemDetailPage() {
  const { id: rootProblemId, contestId, problemId } = useParams<{
    id?: string;
    contestId?: string;
    problemId?: string;
  }>();

  const activeProblemId = problemId ?? rootProblemId;

  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);

  // Editor State
  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>(STARTER_TEMPLATES["cpp"] ?? "");

  // Bottom Console / Workspace State
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("RUN");
  const [customInput, setCustomInput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResultData | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<SubmissionEvaluationData | null>(null);
  const [submissionHistoryTrigger, setSubmissionHistoryTrigger] = useState(0);

  // Faculty Test Case Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tcInput, setTcInput] = useState("");
  const [tcOutput, setTcOutput] = useState("");
  const [tcIsHidden, setTcIsHidden] = useState(true);
  const [tcIsSample, setTcIsSample] = useState(false);
  const [tcWeight, setTcWeight] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isPrivileged =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  const {
    data: problem,
    isLoading,
    error: queryError,
    refetch: fetchProblem,
  } = useQuery({
    queryKey: ["problem", activeProblemId],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: IProblemDetail }>(
        `/problems/${activeProblemId}`
      );
      return res.data.data;
    },
    enabled: !!activeProblemId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const error = actionError || (queryError instanceof Error ? queryError.message : null);

  useEffect(() => {
    if (!problem) return;
    if (problem.allowedLanguages.length > 0) {
      const defaultLang = problem.allowedLanguages.includes("cpp")
        ? "cpp"
        : problem.allowedLanguages[0];
      setLanguage(defaultLang);
      const starter =
        getProblemStarterCode(problem, defaultLang) ||
        STARTER_TEMPLATES[defaultLang] ||
        "";
      setCode(starter);
    }

    const firstSample = problem.testCases?.find((tc) => tc.isSample);
    if (firstSample && firstSample.input) {
      setCustomInput(formatTestCaseInput(firstSample.input));
    }
  }, [problem]);

  // ─── Run Code (POST /submissions/run) ───────────────────────────────────────
  const handleRunCode = async () => {
    if (!activeProblemId) return;
    setIsRunning(true);
    setActionError(null);
    setActiveTab("RUN");

    try {
      const res = await api.post<{
        success: boolean;
        data?: {
          results?: RunResultData[];
          primaryResult?: RunResultData;
          stdout?: string;
          stderr?: string | null;
          compile_output?: string | null;
          status?: SubmissionVerdict;
        };
        stdout?: string;
        stderr?: string | null;
        compile_output?: string | null;
        status?: SubmissionVerdict;
      }>("/submissions/run", {
        problemId: activeProblemId,
        language,
        sourceCode: code,
        customInput,
      });

      const root = res.data;
      const inner = root.data;
      const primary = inner?.primaryResult || inner?.results?.[0];

      const rawStdout =
        root.stdout !== undefined
          ? root.stdout
          : inner?.stdout !== undefined
          ? inner.stdout
          : primary?.stdout !== undefined
          ? primary.stdout
          : "";

      const rawStderr =
        root.stderr ??
        inner?.stderr ??
        primary?.stderr ??
        undefined;

      const rawCompileOutput =
        root.compile_output ??
        inner?.compile_output ??
        primary?.compileOutput ??
        undefined;

      const rawVerdict =
        root.status ??
        inner?.status ??
        primary?.verdict ??
        "ACCEPTED";

      const executionTime = primary?.executionTime ?? 0;
      const memoryUsage = primary?.memoryUsage ?? 0;

      setRunResult({
        verdict: rawVerdict as SubmissionVerdict,
        executionTime,
        memoryUsage,
        stdout: String(rawStdout),
        stderr: rawStderr ? String(rawStderr) : undefined,
        compileOutput: rawCompileOutput ? String(rawCompileOutput) : undefined,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Code run failed");
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Submit Code (POST /submissions/submit) ─────────────────────────────────
  const handleSubmitCode = async () => {
    if (!activeProblemId) return;
    setIsSubmitting(true);
    setActionError(null);
    setActiveTab("SUBMIT");

    try {
      const res = await api.post<{
        success: boolean;
        data: { id: string; status: SubmissionVerdict };
      }>("/submissions/submit", {
        problemId: activeProblemId,
        contestId: contestId ?? undefined,
        language,
        sourceCode: code,
      });

      const submissionId = res.data.data.id;
      setActiveSubmission({
        id: submissionId,
        status: res.data.data.status,
        executionTime: null,
        memoryUsage: null,
      });

      // Poll for completion
      pollSubmission(submissionId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Submission failed");
      setIsSubmitting(false);
    }
  };

  const pollSubmission = (subId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get<{
          success: boolean;
          data: SubmissionEvaluationData;
        }>(`/submissions/${subId}`);

        const current = res.data.data;
        setActiveSubmission(current);

        if (
          current.status !== "QUEUED" &&
          current.status !== "RUNNING" &&
          current.status !== "PENDING"
        ) {
          clearInterval(interval);
          setIsSubmitting(false);
          setSubmissionHistoryTrigger((n) => n + 1);
        } else if (attempts >= 40) {
          // Timeout after 20 seconds
          clearInterval(interval);
          setIsSubmitting(false);
        }
      } catch {
        clearInterval(interval);
        setIsSubmitting(false);
      }
    }, 500);
  };

  const handleUploadTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProblemId) return;
    setIsUploading(true);
    setUploadError(null);    try {
      await api.post(`/problems/${activeProblemId}/testcases`, {
        testCases: [
          {
            input: tcInput,
            expectedOutput: tcOutput,
            isHidden: tcIsHidden,
            isSample: tcIsSample,
            weight: Number(tcWeight),
          },
        ],
      });
      setTcInput("");
      setTcOutput("");
      setShowUploadModal(false);
      fetchProblem();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to add testcase");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
        <Navbar />
        <div className="flex flex-col flex-1 items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
          <p className="text-sm text-gray-500">Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !problem) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-2xl w-full mx-auto py-12 px-4">
          <Alert type="error" message={error ?? "Problem not found"} />
          <div className="mt-4 text-center">
            <Link to="/problems">
              <Button variant="secondary">Back to Problems</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) return null;

  const sampleTestCases = problem.testCases?.filter((tc) => tc.isSample && !tc.isHidden && tc.input) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
      <Navbar />
      
      <div className="h-[calc(100vh-4rem)] w-full flex overflow-hidden p-3 gap-3 bg-slate-100 dark:bg-slate-950">
        
        {/* Left Panel (Problem Description) */}
        <div className="w-1/2 min-w-[360px] h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Top Header: Title, Difficulty Badge, Tags */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{problem.title}</h1>
              {isPrivileged && (
                <Button variant="secondary" className="text-xs" onClick={() => setShowUploadModal(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1 text-brand-600" />
                  Test Case
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                problem.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
                problem.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                {problem.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-100 dark:border-brand-800/50">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 ml-auto text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {problem.timeLimit} ms</span>
                <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {problem.memoryLimit} MB</span>
              </div>
            </div>
          </div>

          {/* Scrollable Description Body */}
          <div className="flex-1 p-5 overflow-y-auto overflow-x-hidden text-slate-800 dark:text-slate-200">
            {problem.statement && problem.statement.trim() ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">{children}</h4>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed text-sm text-slate-800 dark:text-slate-200">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-sm text-slate-800 dark:text-slate-200">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-sm text-slate-800 dark:text-slate-200">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1 my-3 italic text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs text-left">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold">{children}</thead>,
                  th: ({ children }) => <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">{children}</td>,
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs my-3 overflow-x-auto border border-slate-800 leading-relaxed shadow-sm">
                      {children}
                    </pre>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const isInline = !className?.startsWith("language-") && !String(children).includes("\n");
                    if (isInline) {
                      return (
                        <code
                          className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono text-xs font-semibold"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {problem.statement}
              </ReactMarkdown>
            ) : (
              <div className="py-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-xs">
                  <p className="font-semibold mb-1">Problem Description</p>
                  <p>Implement the solution for <span className="font-bold">{problem.title}</span> adhering to the method signature and test cases below.</p>
                </div>
              </div>
            )}

            {/* Input & Output Format Sections (if provided and not already in statement) */}
            {problem.inputFormat &&
              !problem.inputFormat.includes("as described in the signature") &&
              !problem.statement?.toLowerCase().includes("input format") && (
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Input Format</h3>
                  <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                    {problem.inputFormat}
                  </div>
                </div>
              )}

            {problem.outputFormat &&
              !problem.outputFormat.includes("adhering to the required return type") &&
              !problem.statement?.toLowerCase().includes("output format") && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Output Format</h3>
                  <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                    {problem.outputFormat}
                  </div>
                </div>
              )}

            {/* Constraints Section (if provided and not already in statement) */}
            {problem.constraints &&
              !problem.constraints.includes("Refer to the problem statement specifications") &&
              !problem.statement?.toLowerCase().includes("constraints") && (
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Constraints</h3>
                  <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {problem.constraints}
                  </div>
                </div>
              )}

            {/* Examples Section Fallback: If statement has no Examples, render sample testcases */}
            {(!problem.statement || !problem.statement.toLowerCase().includes("example")) &&
              sampleTestCases.length > 0 && (
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Examples</h3>
                  <div className="space-y-3">
                    {sampleTestCases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Example {idx + 1}:
                        </div>
                        <div className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded-lg space-y-1">
                          <div>
                            <span className="text-slate-400 font-semibold">Input: </span>
                            <span>{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">Output: </span>
                            <span>{tc.expectedOutput}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            
            {/* Faculty/Admin Test Cases Inspector */}
            {isPrivileged && (
              <div className="mt-8 bg-amber-50/60 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-5 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-500">
                    <Shield className="h-4 w-4 text-amber-600" />
                    Admin Test Case Verification
                  </div>
                </div>
                <p className="text-amber-700 dark:text-amber-600/80 mb-3 text-[11px]">
                  Hidden test cases are masked for student responses per system security rules.
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {problem.testCases.map((tc, idx) => (
                    <div key={tc.id} className="p-2 bg-white dark:bg-slate-800/50 rounded-lg border border-amber-200 dark:border-amber-900/30 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">#{idx + 1}</span>
                        {tc.isHidden ? (
                          <span className="text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <EyeOff className="h-2.5 w-2.5" /> Hidden
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" /> Sample
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-500 truncate max-w-[150px]">
                        in: {tc.input?.slice(0, 15) ?? "(masked)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel (Editor + Submissions) */}
        <div className="w-1/2 flex flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setActiveTab("RUN")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === "RUN" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                <Terminal className="h-3.5 w-3.5" /> Editor
              </button>
              <button onClick={() => setActiveTab("SUBMIT")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === "SUBMIT" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                <Sparkles className="h-3.5 w-3.5" /> Submission
              </button>
              <button onClick={() => setActiveTab("HISTORY")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === "HISTORY" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                <History className="h-3.5 w-3.5" /> History
              </button>
            </div>
            
            <div className="flex items-center gap-2">
                <Button variant="secondary" className="text-xs px-3 py-1.5" isLoading={isRunning} onClick={handleRunCode}>
                  <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Run
                </Button>
                <Button variant="primary" className="text-xs px-3 py-1.5 font-semibold" isLoading={isSubmitting} onClick={handleSubmitCode}>
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Submit
                </Button>
            </div>
          </div>

          {/* Main Body (Flex-1) */}
          <div className="flex-1 min-h-0 relative flex flex-col bg-white dark:bg-slate-950">
            {activeTab === "HISTORY" ? (
              <div className="p-4 overflow-y-auto h-full">
                <SubmissionHistory problemId={problem.id} contestId={contestId} refreshTrigger={submissionHistoryTrigger} />
              </div>
            ) : activeTab === "SUBMIT" ? (
              <div className="p-4 overflow-y-auto h-full">
                {!activeSubmission ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    Hit "Submit" to queue your code for official evaluation against all test cases.
                  </div>
                ) : (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Submission #{activeSubmission.id.slice(0, 8)}
                        </span>
                        <VerdictBadge verdict={activeSubmission.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {activeSubmission.executionTime !== null && <span>{activeSubmission.executionTime} ms</span>}
                        {activeSubmission.memoryUsage !== null && <span>{activeSubmission.memoryUsage} MB</span>}
                      </div>
                    </div>
                    {activeSubmission.status === "QUEUED" || activeSubmission.status === "RUNNING" ? (
                      <div className="flex items-center gap-3 py-4 text-xs text-brand-700 bg-brand-50 dark:bg-brand-900/20 p-3 rounded-lg border border-brand-100 dark:border-brand-900/50">
                        <RotateCw className="h-4 w-4 animate-spin text-brand-600" />
                        <span>Evaluating...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {activeSubmission.results && activeSubmission.results.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                              Test Case Results ({activeSubmission.results.length})
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {activeSubmission.results.map((r, i) => (
                                <div key={r.id} className={`p-2 rounded-lg border text-center text-[11px] ${r.verdict === "ACCEPTED" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400"}`}>
                                  <div className="font-bold">Test #{i + 1}</div>
                                  <div className="text-[10px] mt-0.5">{r.verdict === "ACCEPTED" ? "Passed" : r.verdict}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // RUN / EDITOR tab
              <div className="flex flex-col h-full w-full">
                <div className="flex-1 relative min-h-[300px]">
                  <CodeEditor
                    problemId={problem.id}
                    userId={user?.id}
                    allowedLanguages={problem.allowedLanguages}
                    starterCode={getProblemStarterCode(problem, language)}
                    value={code}
                    onChange={setCode}
                    language={language}
                    onLanguageChange={(l) => {
                      setLanguage(l);
                      const starter = getProblemStarterCode(problem, l) || STARTER_TEMPLATES[l] || "";
                      setCode(starter);
                    }}
                  />
                </div>
                {/* Console Section */}
                <div className="h-48 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 overflow-y-auto flex flex-col gap-2">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {problem.testCases.filter(tc => tc.isSample).map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setCustomInput(formatTestCaseInput(tc.input))}
                        className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition ${
                          customInput === formatTestCaseInput(tc.input)
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Input (stdin)</div>
                  <textarea
                    rows={2}
                    className="w-full font-mono text-xs p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                    placeholder={problem?.functionSignature?.parameters ? problem.functionSignature.parameters.map((p: any) => `<${p.name}>`).join(" ") : "Enter custom test input here..."}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                  {problem.testCases.find(tc => formatTestCaseInput(tc.input) === customInput) && (
                    <div className="mt-1">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Output</div>
                      <div className="w-full font-mono text-[11px] p-2 rounded-md bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80">
                        {problem.testCases.find(tc => formatTestCaseInput(tc.input) === customInput)?.expectedOutput}
                      </div>
                    </div>
                  )}
                  {runResult && (
                    <div className="mt-2 p-3 bg-slate-950 text-slate-100 rounded-md font-mono text-xs space-y-2 border border-slate-800">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Result:</span>
                        <VerdictBadge verdict={runResult.verdict} />
                        <span className="ml-auto text-[11px] text-slate-400">{runResult.executionTime} ms</span>
                      </div>
                      {runResult.stdout !== undefined && runResult.stdout !== "" && (
                         <div><span className="text-emerald-400 text-[10px] uppercase font-bold block">STDOUT</span><pre className="text-emerald-300 whitespace-pre-wrap">{runResult.stdout}</pre></div>
                      )}
                      {runResult.stderr && (
                         <div><span className="text-rose-400 text-[10px] uppercase font-bold block">STDERR</span><pre className="text-rose-300 whitespace-pre-wrap">{runResult.stderr}</pre></div>
                      )}
                      {runResult.compileOutput && (
                         <div><span className="text-amber-400 text-[10px] uppercase font-bold block">COMPILE OUTPUT</span><pre className="text-amber-300 whitespace-pre-wrap">{runResult.compileOutput}</pre></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Upload Test Case Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Add Test Case</h3>
            <p className="text-xs text-slate-500 mb-4">Add a sample or hidden test case for validation and automated grading.</p>
            {uploadError && <Alert type="error" message={uploadError} className="mb-4 text-xs" />}
            <form onSubmit={handleUploadTestCase} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Test Case Input (stdin)</label>
                <textarea className="w-full h-24 font-mono text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500" value={tcInput} onChange={(e) => setTcInput(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Expected Output (stdout)</label>
                <textarea className="w-full h-24 font-mono text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500" value={tcOutput} onChange={(e) => setTcOutput(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={tcIsHidden} onChange={(e) => setTcIsHidden(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" /> Is Hidden
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={tcIsSample} onChange={(e) => setTcIsSample(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" /> Is Sample
                  </label>
                </div>
                <div>
                  <Input id="weight" type="number" label="Weight" value={tcWeight} onChange={(e) => setTcWeight(Number(e.target.value))} min={1} required />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isUploading}>Save Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

