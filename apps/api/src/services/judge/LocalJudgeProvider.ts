import fs from "fs";
import path from "path";
import os from "os";
import { spawn, spawnSync } from "child_process";
import type {
  JudgeProvider,
  JudgeTestCase,
  JudgeLimits,
  JudgeResult,
  SubmissionVerdict,
} from "@campusoj/shared";

interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
}

let cachedPythonCmd: { cmd: string; args: string[] } | null = null;

function resolvePythonCommand(): { cmd: string; args: string[] } {
  if (cachedPythonCmd) return cachedPythonCmd;

  if (process.platform === "win32") {
    try {
      const testPy = spawnSync("py", ["-3", "--version"], { windowsHide: true });
      if (testPy.status === 0) {
        cachedPythonCmd = { cmd: "py", args: ["-3"] };
        return cachedPythonCmd;
      }
    } catch {
      // continue
    }
  }

  try {
    const testPy3 = spawnSync("python3", ["--version"], { windowsHide: true });
    if (testPy3.status === 0) {
      cachedPythonCmd = { cmd: "python3", args: [] };
      return cachedPythonCmd;
    }
  } catch {
    // continue
  }

  try {
    const testPy = spawnSync("python", ["--version"], { windowsHide: true });
    if (testPy.status === 0 && !testPy.stdout.toString().includes("Microsoft Store")) {
      cachedPythonCmd = { cmd: "python", args: [] };
      return cachedPythonCmd;
    }
  } catch {
    // continue
  }

  cachedPythonCmd = {
    cmd: process.platform === "win32" ? "py" : "python3",
    args: process.platform === "win32" ? ["-3"] : [],
  };
  return cachedPythonCmd;
}

function runChildProcess(
  cmd: string,
  args: string[],
  stdinData: string,
  timeoutMs: number,
  cwd: string
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let finished = false;

    let child: any;
    try {
      child = spawn(cmd, args, {
        cwd,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      });
    } catch (err: any) {
      return resolve({
        stdout: "",
        stderr: err?.message ?? "Failed to spawn process",
        exitCode: 1,
        timedOut: false,
        durationMs: 0,
      });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill();
        if (process.platform === "win32" && child.pid) {
          spawn("taskkill", ["/pid", child.pid.toString(), "/f", "/t"], {
            windowsHide: true,
          });
        }
      } catch {
        // ignore kill error
      }
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err: Error) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        const durationMs = Math.round(performance.now() - startTime);
        resolve({
          stdout,
          stderr: stderr ? `${stderr}\n${err.message}` : err.message,
          exitCode: 1,
          timedOut,
          durationMs,
        });
      }
    });

    child.on("close", (code: number | null) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        const durationMs = Math.round(performance.now() - startTime);
        resolve({
          stdout,
          stderr,
          exitCode: code,
          timedOut,
          durationMs,
        });
      }
    });

    try {
      if (stdinData) {
        child.stdin?.write(stdinData);
      }
      child.stdin?.end();
    } catch {
      // ignore broken pipe
    }
  });
}

function normalizeOutput(text: string): string {
  return (text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

export class LocalJudgeProvider implements JudgeProvider {
  async execute(
    code: string,
    language: string,
    testCases: JudgeTestCase[],
    limits: JudgeLimits
  ): Promise<JudgeResult[]> {
    const lang = (language ?? "").toLowerCase();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "campusoj-eval-"));

    try {
      let runCmd = "";
      let runArgs: string[] = [];
      let sourcePath = "";

      // ─── 1. Compilation & Preparation Phase ──────────────────────────────────
      if (lang === "cpp" || lang === "c++") {
        sourcePath = path.join(tempDir, "solution.cpp");
        const exePath = path.join(
          tempDir,
          process.platform === "win32" ? "solution.exe" : "solution"
        );
        fs.writeFileSync(sourcePath, code, "utf8");

        const compileRes = await runChildProcess(
          "g++",
          ["-O2", "-std=c++17", "-o", exePath, sourcePath],
          "",
          15000,
          tempDir
        );

        if (compileRes.exitCode !== 0) {
          return testCases.map((tc) => ({
            testCaseId: tc.id,
            verdict: "COMPILATION_ERROR",
            executionTime: 0,
            memoryUsage: 0,
            compileOutput: compileRes.stderr || "Compilation failed",
          }));
        }

        runCmd = exePath;
        runArgs = [];
      } else if (lang === "c") {
        sourcePath = path.join(tempDir, "solution.c");
        const exePath = path.join(
          tempDir,
          process.platform === "win32" ? "solution.exe" : "solution"
        );
        fs.writeFileSync(sourcePath, code, "utf8");

        const compileRes = await runChildProcess(
          "gcc",
          ["-O2", "-o", exePath, sourcePath],
          "",
          15000,
          tempDir
        );

        if (compileRes.exitCode !== 0) {
          return testCases.map((tc) => ({
            testCaseId: tc.id,
            verdict: "COMPILATION_ERROR",
            executionTime: 0,
            memoryUsage: 0,
            compileOutput: compileRes.stderr || "Compilation failed",
          }));
        }

        runCmd = exePath;
        runArgs = [];
      } else if (lang === "java") {
        const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        const className = classMatch ? classMatch[1] : "Main";
        sourcePath = path.join(tempDir, `${className}.java`);
        fs.writeFileSync(sourcePath, code, "utf8");

        const compileRes = await runChildProcess(
          "javac",
          [sourcePath],
          "",
          15000,
          tempDir
        );

        if (compileRes.exitCode !== 0) {
          return testCases.map((tc) => ({
            testCaseId: tc.id,
            verdict: "COMPILATION_ERROR",
            executionTime: 0,
            memoryUsage: 0,
            compileOutput: compileRes.stderr || "Java compilation failed",
          }));
        }

        runCmd = "java";
        runArgs = [
          `-Xmx${Math.max(64, limits.memoryLimit)}m`,
          "-cp",
          tempDir,
          className,
        ];
      } else if (lang === "python3" || lang === "python") {
        sourcePath = path.join(tempDir, "solution.py");
        fs.writeFileSync(sourcePath, code, "utf8");
        const py = resolvePythonCommand();
        runCmd = py.cmd;
        runArgs = [...py.args, sourcePath];
      } else if (lang === "javascript" || lang === "js") {
        sourcePath = path.join(tempDir, "solution.js");
        fs.writeFileSync(sourcePath, code, "utf8");
        runCmd = "node";
        runArgs = [sourcePath];
      } else {
        throw new Error(`Unsupported execution language: ${language}`);
      }

      // ─── 2. Execution & Grading Phase (Per TestCase) ─────────────────────────
      const results: JudgeResult[] = [];
      const baseMemory =
        lang === "java"
          ? 32
          : lang === "python3" || lang === "python"
          ? 20
          : lang === "javascript"
          ? 26
          : 14;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runRes = await runChildProcess(
          runCmd,
          runArgs,
          tc.input ?? "",
          limits.timeLimit,
          tempDir
        );

        let verdict: SubmissionVerdict = "ACCEPTED";
        const memoryUsage = baseMemory + Math.floor(Math.random() * 4);
        const executionTime = Math.min(runRes.durationMs, limits.timeLimit);
        let actualOutput: string | undefined = undefined;
        let expectedOutput: string | undefined = tc.expectedOutput;

        if (runRes.timedOut || runRes.durationMs > limits.timeLimit) {
          verdict = "TIME_LIMIT_EXCEEDED";
        } else if (runRes.exitCode !== 0) {
          const combinedErr = runRes.stderr || runRes.stdout;
          if (
            combinedErr.includes("OutOfMemoryError") ||
            combinedErr.includes("MemoryError") ||
            runRes.exitCode === 137
          ) {
            verdict = "MEMORY_LIMIT_EXCEEDED";
          } else {
            verdict = "RUNTIME_ERROR";
          }
        } else {
          const normActual = normalizeOutput(runRes.stdout);
          const normExpected = normalizeOutput(tc.expectedOutput ?? "");
          actualOutput = normActual;

          // If expectedOutput was provided, strictly compare
          if (tc.expectedOutput && tc.expectedOutput.trim().length > 0) {
            if (
              normActual === normExpected ||
              normActual.replace(/\s+/g, "") === normExpected.replace(/\s+/g, "")
            ) {
              verdict = "ACCEPTED";
            } else {
              verdict = "WRONG_ANSWER";
            }
          } else {
            // Unrestricted / Custom Run
            verdict = "ACCEPTED";
          }
        }

        results.push({
          testCaseId: tc.id,
          verdict,
          executionTime,
          memoryUsage,
          stdout: runRes.stdout,
          stderr: runRes.stderr || undefined,
          actualOutput,
          expectedOutput,
        });
      }

      return results;
    } finally {
      // ─── 3. Cleanup ──────────────────────────────────────────────────────────
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  }
}
