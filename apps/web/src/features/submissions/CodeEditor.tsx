import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { STARTER_TEMPLATES, MONACO_LANGUAGES } from "./starterTemplates";
import { RotateCcw, Check, Sparkles, Code2 } from "lucide-react";

interface CodeEditorProps {
  problemId: string;
  userId?: string;
  allowedLanguages?: string[];
  initialLanguage?: string;
  starterCode?: string;
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function CodeEditor({
  problemId,
  userId,
  allowedLanguages = ["cpp", "python3", "java", "c", "javascript"],
  starterCode,
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const [fontSize, setFontSize] = useState(14);
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Storage key for debounced autosave
  const storageKey = `draft:${userId ?? "guest"}:${problemId}:${language}`;

  // On language or problem change, attempt to load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      onChange(savedDraft);
    } else if (!value || value.trim() === "") {
      const template = starterCode || STARTER_TEMPLATES[language] || "// Write your solution here";
      onChange(template);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId, language, starterCode]);

  const handleEditorChange = (newVal: string | undefined) => {
    const code = newVal ?? "";
    onChange(code);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, code);
      setIsSaved(true);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm("Reset code to standard starter template?")) {
      const template = starterCode || STARTER_TEMPLATES[language] || "// Write your solution here";
      onChange(template);
      localStorage.setItem(storageKey, template);
      setIsSaved(true);
    }
  };

  const monacoLang = MONACO_LANGUAGES[language] ?? "plaintext";

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
      {/* Editor Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-gray-800 text-gray-300 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-gray-200">
            <Code2 className="h-4 w-4 text-brand-400" />
            <span>Language:</span>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#1e1e1e] text-gray-200 border border-gray-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand-500 transition"
          >
            {allowedLanguages.map((l) => (
              <option key={l} value={l}>
                {l === "cpp"
                  ? "C++ (GCC 9.2)"
                  : l === "python3"
                  ? "Python 3"
                  : l === "java"
                  ? "Java (OpenJDK 13)"
                  : l === "c"
                  ? "C (GCC 9.2)"
                  : l === "javascript"
                  ? "JavaScript (Node.js)"
                  : l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Status */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            {isSaved ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3 w-3" /> Autosaved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
          </div>

          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs">
            <span>Font:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-[#1e1e1e] text-gray-300 border border-gray-700 rounded px-1.5 py-0.5 text-xs outline-none"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>
          </div>

          {/* Reset Code Button */}
          <button
            onClick={handleReset}
            title="Reset code to starter template"
            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="flex-1 min-h-[420px] w-full">
        <Editor
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={value}
          onChange={handleEditorChange}
          options={{
            fontSize,
            fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
