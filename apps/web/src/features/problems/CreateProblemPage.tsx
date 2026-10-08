import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";
import { AppLayout } from "../../components/layout/Navbar";
import { Button, Input, Alert } from "../../components/ui/FormElements";
import {
  Code2,
  ArrowLeft,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { Difficulty } from "@campusoj/shared";

interface DraftTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  isSample: boolean;
  weight: number;
}

const ALL_LANGUAGES = [
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python3", label: "Python 3" },
  { id: "javascript", label: "JavaScript (Node.js)" },
];

export default function CreateProblemPage() {
  const navigate = useNavigate();

  // Basic info
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>([
    "c",
    "cpp",
    "java",
    "python3",
    "javascript",
  ]);
  const [tagsInput, setTagsInput] = useState("algorithms, math");

  // Problem description specs
  const [statement, setStatement] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");

  // Test Cases builder
  const [testCases, setTestCases] = useState<DraftTestCase[]>([
    {
      input: "2 3",
      expectedOutput: "5",
      isSample: true,
      isHidden: false,
      weight: 1,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleLanguageToggle = (langId: string) => {
    setAllowedLanguages((prev) =>
      prev.includes(langId)
        ? prev.filter((l) => l !== langId)
        : [...prev, langId]
    );
  };

  const addTestCase = (sample = false) => {
    setTestCases((prev) => [
      ...prev,
      {
        input: "",
        expectedOutput: "",
        isSample: sample,
        isHidden: !sample,
        weight: 1,
      },
    ]);
  };

  const removeTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, patch: Partial<DraftTestCase>) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, ...patch } : tc))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !title.trim() ||
      !slug.trim() ||
      !statement.trim() ||
      !inputFormat.trim() ||
      !outputFormat.trim() ||
      !constraints.trim()
    ) {
      setError("Please fill in all problem description fields.");
      return;
    }

    if (allowedLanguages.length === 0) {
      setError("Please select at least one allowed programming language.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      // 1. Create Problem
      const res = await api.post<{ success: boolean; data: { id: string } }>(
        "/problems",
        {
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          statement: statement.trim(),
          inputFormat: inputFormat.trim(),
          outputFormat: outputFormat.trim(),
          constraints: constraints.trim(),
          difficulty,
          timeLimit: Number(timeLimit),
          memoryLimit: Number(memoryLimit),
          allowedLanguages,
          tags,
        }
      );

      const createdProblemId = res.data.data.id;

      // 2. Upload test cases if any defined
      const validTestCases = testCases.filter(
        (tc) => tc.input.trim() || tc.expectedOutput.trim()
      );

      if (validTestCases.length > 0) {
        await api.post(`/problems/${createdProblemId}/testcases`, {
          testCases: validTestCases,
        });
      }

      navigate(`/problems/${createdProblemId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Link
          to="/problems"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Problems
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Problem
              </h1>
              <p className="text-xs text-gray-500">
                Design problem specifications, execution constraints, and automated grading test cases.
              </p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="title"
                label="Problem Title *"
                placeholder="e.g. Invert Binary Tree"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <Input
                id="slug"
                label="Slug (URL identifier) *"
                placeholder="e.g. invert-binary-tree"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
              />
            </div>

            {/* Difficulty & Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Difficulty
                </label>
                <select
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <Input
                id="timeLimit"
                type="number"
                label="Time Limit (ms)"
                min={100}
                max={10000}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                required
              />

              <Input
                id="memoryLimit"
                type="number"
                label="Memory Limit (MB)"
                min={16}
                max={1024}
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                required
              />
            </div>

            {/* Allowed Languages */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Allowed Languages *
              </label>
              <div className="flex flex-wrap gap-3">
                {ALL_LANGUAGES.map((lang) => (
                  <label
                    key={lang.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                      allowedLanguages.includes(lang.id)
                        ? "bg-brand-50 border-brand-300 text-brand-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedLanguages.includes(lang.id)}
                      onChange={() => handleLanguageToggle(lang.id)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    {lang.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <Input
              id="tags"
              label="Tags (comma-separated)"
              placeholder="e.g. tree, dfs, recursion"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />

            {/* Statement */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Problem Statement *
              </label>
              <textarea
                className="w-full h-32 text-sm p-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900 font-sans"
                placeholder="Clearly describe the objective of the problem..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                required
              />
            </div>

            {/* Formats & Constraints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Input Format *
                </label>
                <textarea
                  className="w-full h-24 text-xs font-mono p-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900"
                  placeholder="e.g. First line contains integer N. Next line contains N space-separated integers."
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Output Format *
                </label>
                <textarea
                  className="w-full h-24 text-xs font-mono p-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900"
                  placeholder="e.g. Print the inverted binary tree root value."
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Constraints *
              </label>
              <textarea
                className="w-full h-20 text-xs font-mono p-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-gray-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:text-slate-900"
                placeholder="e.g. 1 <= N <= 10^5&#10;-10^9 <= A[i] <= 10^9"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                required
              />
            </div>

            {/* Test Cases Builder */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Test Cases ({testCases.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add sample test cases (visible to students) and hidden test cases (for grading).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => addTestCase(true)}
                  >
                    + Add Sample Case
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => addTestCase(false)}
                  >
                    + Add Hidden Case
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      tc.isHidden
                        ? "bg-rose-50/40 border-rose-200"
                        : "bg-emerald-50/40 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-800">
                          Case #{idx + 1}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            tc.isHidden
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {tc.isHidden ? "Hidden Case" : "Sample Example"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTestCase(idx)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                          Input (stdin)
                        </label>
                        <textarea
                          className="w-full h-20 text-xs font-mono p-2 rounded-lg border border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:text-slate-900"
                          value={tc.input}
                          onChange={(e) =>
                            updateTestCase(idx, { input: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                          Expected Output (stdout)
                        </label>
                        <textarea
                          className="w-full h-20 text-xs font-mono p-2 rounded-lg border border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:text-slate-900"
                          value={tc.expectedOutput}
                          onChange={(e) =>
                            updateTestCase(idx, {
                              expectedOutput: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) =>
                            updateTestCase(idx, { isHidden: e.target.checked })
                          }
                          className="rounded text-brand-600"
                        />
                        <span>Hidden from students</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isSample}
                          onChange={(e) =>
                            updateTestCase(idx, { isSample: e.target.checked })
                          }
                          className="rounded text-brand-600"
                        />
                        <span>Sample Example</span>
                      </label>

                      <div className="flex items-center gap-1 ml-auto">
                        <span>Weight:</span>
                        <input
                          type="number"
                          min={1}
                          value={tc.weight}
                          onChange={(e) =>
                            updateTestCase(idx, {
                              weight: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-0.5 border rounded text-xs bg-white text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Link to="/problems">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Publish Problem
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
