import type {
  JudgeProvider,
  JudgeTestCase,
  JudgeLimits,
  JudgeResult,
  SubmissionVerdict,
} from "@campusoj/shared";

export class MockJudgeProvider implements JudgeProvider {
  async execute(
    code: string,
    language: string,
    testCases: JudgeTestCase[],
    limits: JudgeLimits
  ): Promise<JudgeResult[]> {
    await new Promise((res) => setTimeout(res, 50));

    const results: JudgeResult[] = [];

    const forcesCE = code.includes("@FORCE_CE") || code.includes("COMPILATION_ERROR");
    const forcesTLE = code.includes("@FORCE_TLE") || code.includes("TIME_LIMIT");
    const forcesRE = code.includes("@FORCE_RE") || code.includes("RUNTIME_ERROR");
    const forcesWA = code.includes("@FORCE_WA") || code.includes("WRONG_ANSWER");

    const trimmedCode = code.trim();
    const lang = (language ?? "").toLowerCase();

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let verdict: SubmissionVerdict = "ACCEPTED";
      let stdout: string = "";
      let stderr: string | undefined;
      let compileOutput: string | undefined;
      let executionTime = Math.floor(Math.random() * 25) + 15;
      let memoryUsage = Math.floor(Math.random() * 6) + 14;

      if (forcesCE) {
        verdict = "COMPILATION_ERROR";
        compileOutput = "SyntaxError: Compilation failed";
      } else if (forcesTLE) {
        verdict = "TIME_LIMIT_EXCEEDED";
        executionTime = limits.timeLimit + 100;
      } else if (forcesRE) {
        verdict = "RUNTIME_ERROR";
        stderr = "RuntimeError: Process exited with non-zero exit code";
      } else if (forcesWA) {
        verdict = "WRONG_ANSWER";
        stdout = "wrong_output_sample\n";
      } else if (trimmedCode.length === 0) {
        verdict = "COMPILATION_ERROR";
        compileOutput = "Error: Empty source code submitted";
      } else if (lang === "java" && !trimmedCode.includes("class")) {
        verdict = "COMPILATION_ERROR";
        compileOutput = "Main.java: error: class, interface, or enum expected";
      } else if (lang === "java" && !trimmedCode.includes("main")) {
        verdict = "RUNTIME_ERROR";
        stderr = "Error: Main method not found in class Main";
      } else if ((lang === "c" || lang === "cpp") && !trimmedCode.includes("main")) {
        verdict = "COMPILATION_ERROR";
        compileOutput = "/usr/bin/ld: undefined reference to `main'";
      } else {
        stdout = this.evaluateOrSimulateOutput(code, lang, tc.input, tc.expectedOutput);
        verdict = "ACCEPTED";
      }

      results.push({
        testCaseId: tc.id,
        verdict,
        executionTime,
        memoryUsage,
        stdout,
        stderr,
        compileOutput,
      });

      if (verdict === "COMPILATION_ERROR") break;
    }

    return results;
  }

  private evaluateOrSimulateOutput(
    code: string,
    language: string,
    input?: string,
    expectedOutput?: string
  ): string {
    if (expectedOutput && expectedOutput.trim().length > 0) {
      return expectedOutput;
    }

    const rawInput = (input ?? "").trim();
    const tokens = rawInput.split(/\s+/).filter(Boolean);

    // Sum of Two Numbers: e.g. "3 5"
    if (tokens.length === 2 && !isNaN(Number(tokens[0])) && !isNaN(Number(tokens[1]))) {
      try {
        const a = BigInt(tokens[0]);
        const b = BigInt(tokens[1]);
        return (a + b).toString() + "\n";
      } catch {
        const a = Number(tokens[0]);
        const b = Number(tokens[1]);
        return (a + b).toString() + "\n";
      }
    }

    // Two Sum: line 1 = n target, line 2 = array of length n
    if (tokens.length >= 3 && !isNaN(Number(tokens[0])) && !isNaN(Number(tokens[1]))) {
      const n = parseInt(tokens[0], 10);
      const target = Number(tokens[1]);
      if (tokens.length >= 2 + n) {
        const nums = tokens.slice(2, 2 + n).map(Number);
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
              return `${i} ${j}\n`;
            }
          }
        }
      }
    }

    // Binary Search
    if (tokens.length >= 3 && !isNaN(Number(tokens[0])) && !isNaN(Number(tokens[1]))) {
      const n = parseInt(tokens[0], 10);
      const target = Number(tokens[1]);
      if (tokens.length >= 2 + n) {
        const nums = tokens.slice(2, 2 + n).map(Number);
        const idx = nums.indexOf(target);
        return `${idx}\n`;
      }
    }

    // Maximum Subarray
    if (tokens.length >= 2 && !isNaN(Number(tokens[0]))) {
      const n = parseInt(tokens[0], 10);
      if (tokens.length >= 1 + n) {
        const nums = tokens.slice(1, 1 + n).map(Number);
        let maxSoFar = nums[0];
        let currMax = nums[0];
        for (let i = 1; i < nums.length; i++) {
          currMax = Math.max(nums[i], currMax + nums[i]);
          maxSoFar = Math.max(maxSoFar, currMax);
        }
        return `${maxSoFar}\n`;
      }
    }

    // Hello World
    if (rawInput === "") {
      if (code.includes("Hello") || code.includes("World") || code.includes("world")) {
        return "Hello, World!\n";
      }
    }

    // Extract printed literal
    const printMatch = code.match(/(?:println|print|cout\s*<<)\s*\(?\s*["']([^"']+)["']/i);
    if (printMatch && printMatch[1]) {
      return printMatch[1] + "\n";
    }

    if (rawInput.length > 0) {
      return rawInput + "\n";
    }

    return "Hello, World!\n";
  }
}
