import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForVerdict(submissionId: string, token: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(500);
    const res = await axios.get(`${API_BASE}/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sub = res.data.data;
    if (sub.status !== "QUEUED" && sub.status !== "RUNNING" && sub.status !== "PENDING") {
      return sub;
    }
  }
  throw new Error(`Submission ${submissionId} timed out waiting for verdict`);
}

async function main() {
  console.log("===================================================================");
  console.log("🧪 Testing Universal Real Execution & Grading Engine in CampusOJ");
  console.log("===================================================================\n");

  // 1. Authenticate as student
  console.log("Step 1: Authenticating as student@campusoj.edu...");
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: "student@campusoj.edu",
    password: "Password123!",
  });
  const token = loginRes.data.token || loginRes.data.data?.token;
  console.log("  ✓ Authenticated successfully.\n");

  // 2. Fetch problems to find 'Sum of Two Numbers'
  console.log("Step 2: Locating problem 'Sum of Two Numbers'...");
  const problemsRes = await axios.get(`${API_BASE}/problems?search=Sum of Two Numbers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const problem = problemsRes.data.data.find(
    (p: any) => p.slug === "sum-of-two-numbers"
  );
  if (!problem) throw new Error("Could not find 'Sum of Two Numbers' problem");
  console.log(`  ✓ Found problem: "${problem.title}" (ID: ${problem.id})\n`);

  // 3. Test 1: Submit WRONG ANSWER code (e.g. prints wrong sum: a - b or "wrong")
  console.log("Step 3: Submitting WRONG answer Python solution (deliberately prints 99999)...");
  const wrongPythonCode = `import sys
# Deliberately output completely incorrect answer
print(99999)
`;
  const submitWrongRes = await axios.post(
    `${API_BASE}/submissions/submit`,
    {
      problemId: problem.id,
      language: "python3",
      sourceCode: wrongPythonCode,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const wrongSubId = submitWrongRes.data.data.id;
  console.log(`  ✓ Enqueued submission ID: ${wrongSubId}`);

  console.log("  ⏳ Awaiting worker evaluation of wrong answer...");
  const finishedWrongSub = await waitForVerdict(wrongSubId, token);
  console.log(`  ✓ Final Verdict: ${finishedWrongSub.status}`);
  console.log(`  ✓ Execution Time: ${finishedWrongSub.executionTime}ms, Memory: ${finishedWrongSub.memoryUsage}MB`);
  console.log(`  ✓ Per-TestCase Results count: ${finishedWrongSub.results?.length}`);
  if (finishedWrongSub.results?.length > 0) {
    console.log(`    First test case verdict: ${finishedWrongSub.results[0].verdict}`);
    console.log(`    First test case details: ${finishedWrongSub.results[0].stderr}`);
  }

  if (finishedWrongSub.status === "WRONG_ANSWER") {
    console.log("\n  🎉 SUCCESS: Incorrect answer was correctly graded as WRONG_ANSWER!\n");
  } else {
    console.error(`\n  ❌ FAILED: Expected WRONG_ANSWER but got ${finishedWrongSub.status}\n`);
    process.exit(1);
  }

  // 4. Test 2: Submit CORRECT answer code (e.g. actual sum of integers)
  console.log("Step 4: Submitting CORRECT answer Python solution (a + b)...");
  const correctPythonCode = `import sys
tokens = sys.stdin.read().split()
if tokens:
    a = int(tokens[0])
    b = int(tokens[1])
    print(a + b)
`;
  const submitCorrectRes = await axios.post(
    `${API_BASE}/submissions/submit`,
    {
      problemId: problem.id,
      language: "python3",
      sourceCode: correctPythonCode,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const correctSubId = submitCorrectRes.data.data.id;
  console.log(`  ✓ Enqueued submission ID: ${correctSubId}`);

  console.log("  ⏳ Awaiting worker evaluation of correct answer...");
  const finishedCorrectSub = await waitForVerdict(correctSubId, token);
  console.log(`  ✓ Final Verdict: ${finishedCorrectSub.status}`);
  console.log(`  ✓ Execution Time: ${finishedCorrectSub.executionTime}ms, Memory: ${finishedCorrectSub.memoryUsage}MB`);

  if (finishedCorrectSub.status === "ACCEPTED") {
    console.log("\n  🎉 SUCCESS: Correct answer was correctly graded as ACCEPTED!\n");
  } else {
    console.error(`\n  ❌ FAILED: Expected ACCEPTED but got ${finishedCorrectSub.status}\n`);
    process.exit(1);
  }

  // 5. Test 3: Submit RUNTIME ERROR code (e.g. ZeroDivisionError)
  console.log("Step 5: Submitting RUNTIME ERROR Python solution (1 / 0)...");
  const runtimeErrorCode = `import sys
x = 1 / 0
`;
  const submitRERes = await axios.post(
    `${API_BASE}/submissions/submit`,
    {
      problemId: problem.id,
      language: "python3",
      sourceCode: runtimeErrorCode,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const reSubId = submitRERes.data.data.id;
  console.log(`  ✓ Enqueued submission ID: ${reSubId}`);

  console.log("  ⏳ Awaiting worker evaluation of runtime error...");
  const finishedRESub = await waitForVerdict(reSubId, token);
  console.log(`  ✓ Final Verdict: ${finishedRESub.status}`);

  if (finishedRESub.status === "RUNTIME_ERROR") {
    console.log("\n  🎉 SUCCESS: Runtime exception was correctly graded as RUNTIME_ERROR!\n");
  } else {
    console.error(`\n  ❌ FAILED: Expected RUNTIME_ERROR but got ${finishedRESub.status}\n`);
    process.exit(1);
  }

  // 6. Test 4: Custom Run with Java (stdin "14 28" => stdout "42")
  console.log("Step 6: Testing Custom Run with Java code and stdin '14 28'...");
  const javaCode = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}
`;
  const customRunRes = await axios.post(
    `${API_BASE}/submissions/run`,
    {
      problemId: problem.id,
      language: "java",
      sourceCode: javaCode,
      customInput: "14 28",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const customStdout = customRunRes.data.stdout ?? customRunRes.data.data?.stdout;
  console.log(`  ✓ Custom Run stdout: JSON -> ${JSON.stringify(customStdout)}`);
  if (customStdout?.trim() === "42") {
    console.log("  🎉 SUCCESS: Real Java execution correctly returned '42'!\n");
  } else {
    console.error(`  ❌ FAILED: Expected '42', got '${customStdout}'\n`);
    process.exit(1);
  }

  console.log("===================================================================");
  console.log("🎉 ALL REAL EXECUTION & UNIVERSAL GRADING TESTS PASSED!");
  console.log("===================================================================");
}

main().catch((err) => {
  console.error("Test failed with error:", err.response?.data ?? err.message);
  process.exit(1);
});
