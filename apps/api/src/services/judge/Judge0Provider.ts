import type {
  JudgeProvider,
  JudgeTestCase,
  JudgeLimits,
  JudgeResult,
  SubmissionVerdict,
} from "@campusoj/shared";

// Judge0 language mappings
const LANGUAGE_IDS: Record<string, number> = {
  c: 50,          // C (GCC 9.2.0)
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python3: 71,    // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
};

interface Judge0BatchSubmissionResponse {
  token: string;
}

interface Judge0SubmissionResult {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;   // seconds e.g. "0.042"
  memory: number | null; // KB
}

export class Judge0Provider implements JudgeProvider {
  private baseUrl: string;
  private apiKey?: string;
  private apiHost?: string;

  constructor() {
    this.baseUrl = (
      process.env.JUDGE0_API_URL ?? "http://localhost:2358"
    ).replace(/\/$/, "");
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.apiHost = process.env.JUDGE0_API_HOST;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["X-RapidAPI-Key"] = this.apiKey;
    }
    if (this.apiHost) {
      headers["X-RapidAPI-Host"] = this.apiHost;
    }
    return headers;
  }

  async execute(
    code: string,
    language: string,
    testCases: JudgeTestCase[],
    limits: JudgeLimits
  ): Promise<JudgeResult[]> {
    const langId = LANGUAGE_IDS[language.toLowerCase()];
    if (!langId) {
      throw new Error(`Unsupported Judge0 language: ${language}`);
    }

    // 1. Submit Batch to Judge0
    const submissions = testCases.map((tc) => {
      const sub: Record<string, unknown> = {
        source_code: code,
        language_id: langId,
        stdin: tc.input ?? "",
        cpu_time_limit: Math.max(0.5, limits.timeLimit / 1000), // in seconds
        memory_limit: limits.memoryLimit * 1024,                // in KB
      };
      // Only include expected_output if it is non-empty.
      // If expected_output is "" or null, Judge0 marks it Wrong Answer when code outputs anything.
      if (tc.expectedOutput && tc.expectedOutput.trim().length > 0) {
        sub.expected_output = tc.expectedOutput;
      }
      return sub;
    });

    const createRes = await fetch(
      `${this.baseUrl}/submissions/batch?base64_encoded=false`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ submissions }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Judge0 batch submission failed: ${createRes.status} ${errText}`);
    }

    const tokens = (await createRes.json()) as Judge0BatchSubmissionResponse[];
    const tokenList = tokens.map((t) => t.token);

    // 2. Poll Judge0 until all submissions are processed
    const pollResults = await this.pollBatchResults(tokenList);

    // 3. Map to JudgeResult[]
    return testCases.map((tc, idx) => {
      const raw = pollResults[idx];
      const verdict = this.mapStatusIdToVerdict(raw?.status?.id ?? 13);
      const executionTime = raw?.time
        ? Math.round(parseFloat(raw.time) * 1000)
        : 0;
      const memoryUsage = raw?.memory
        ? Math.round(raw.memory / 1024)
        : 0; // Convert KB to MB

      const stdout =
        raw?.stdout !== null && raw?.stdout !== undefined
          ? String(raw.stdout)
          : undefined;
      const stderr =
        raw?.stderr !== null && raw?.stderr !== undefined
          ? String(raw.stderr)
          : undefined;
      const compileOutput =
        raw?.compile_output !== null && raw?.compile_output !== undefined
          ? String(raw.compile_output)
          : undefined;

      return {
        testCaseId: tc.id,
        verdict,
        executionTime,
        memoryUsage,
        stdout,
        stderr,
        compileOutput,
      };
    });
  }

  private async pollBatchResults(
    tokens: string[]
  ): Promise<Judge0SubmissionResult[]> {
    const maxAttempts = 30; // Max 15 seconds polling
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((res) => setTimeout(res, delayMs));

      const res = await fetch(
        `${this.baseUrl}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,status,stdout,stderr,compile_output,time,memory`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!res.ok) {
        continue;
      }

      const data = (await res.json()) as {
        submissions: Judge0SubmissionResult[];
      };
      const results = data.submissions;

      // Check if all are finished (status id > 2: 1 = In Queue, 2 = Processing)
      const allDone = results.every(
        (r) => r && r.status && r.status.id > 2
      );

      if (allDone) {
        return results;
      }
    }

    throw new Error("Judge0 submission polling timed out");
  }

  private mapStatusIdToVerdict(statusId: number): SubmissionVerdict {
    switch (statusId) {
      case 3:
        return "ACCEPTED";
      case 4:
        return "WRONG_ANSWER";
      case 5:
        return "TIME_LIMIT_EXCEEDED";
      case 6:
        return "COMPILATION_ERROR";
      case 7: // Runtime Error (SIGSEGV)
      case 8: // Runtime Error (SIGXFSZ)
      case 9: // Runtime Error (SIGFPE)
      case 10: // Runtime Error (SIGABRT)
      case 11: // Runtime Error (NZEC)
      case 12: // Runtime Error (Other)
        return "RUNTIME_ERROR";
      case 13: // Internal Error
        return "INTERNAL_ERROR";
      default:
        return "INTERNAL_ERROR";
    }
  }
}
