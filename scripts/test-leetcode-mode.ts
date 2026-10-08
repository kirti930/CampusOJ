const API_BASE = "http://localhost:5000/api/v1";

async function login(email = "student@campusoj.edu", password = "Password123!") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as any;
  if (!data.success) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  return (data.token || data.data?.token) as string;
}

async function getProblemBySlug(slug: string, token: string) {
  const res = await fetch(`${API_BASE}/problems?search=${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as any;
  const found = data.data?.find((p: any) => p.slug === slug);
  if (!found) throw new Error(`Problem with slug ${slug} not found`);

  const detailRes = await fetch(`${API_BASE}/problems/${found.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const detailData = (await detailRes.json()) as any;
  return detailData.data;
}

async function runCustomCode(
  problemId: string,
  language: string,
  sourceCode: string,
  customInput: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/submissions/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      problemId,
      language,
      sourceCode,
      customInput,
    }),
  });
  return (await res.json()) as any;
}

async function submitCode(
  problemId: string,
  language: string,
  sourceCode: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/submissions/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      problemId,
      language,
      sourceCode,
    }),
  });
  const data = (await res.json()) as any;
  if (!data.success && !data.id && !data.data?.id) {
    throw new Error(`Submission failed: ${JSON.stringify(data)}`);
  }
  return data.id || data.data?.id;
}

async function pollSubmission(submissionId: string, token: string) {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as any;
    const sub = data.data || data;
    if (sub.status !== "QUEUED" && sub.status !== "RUNNING" && sub.status !== "PENDING") {
      return sub;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for submission ${submissionId}`);
}

async function main() {
  console.log("=================================================================");
  console.log("🚀 Testing CampusOJ LeetCode-Style Function-Only Mode Execution");
  console.log("=================================================================\n");

  const token = await login();
  console.log("✓ Logged in as student@campusoj.edu\n");

  const sumProblem = await getProblemBySlug("sum-of-two-numbers", token);
  console.log(`✓ Fetched problem: "${sumProblem.title}" (ID: ${sumProblem.id})`);
  console.log(`  Function Name: ${sumProblem.functionSignature?.functionName}`);
  console.log(`  Return Type  : ${sumProblem.functionSignature?.returnType}`);
  console.log(`  Parameters   : ${JSON.stringify(sumProblem.functionSignature?.parameters)}\n`);

  // ── Test 1: Python with JUST "return a + b" ──
  console.log("Test 1: Python Custom Run with just `return a + b` (stdin: 15 25)...");
  const pyRun1 = await runCustomCode(
    sumProblem.id,
    "python3",
    "return a + b",
    "15 25",
    token
  );
  console.log(`  Verdict: ${pyRun1.status}`);
  console.log(`  STDOUT : "${pyRun1.stdout?.trim()}"`);
  if (pyRun1.stdout?.trim() !== "40") {
    throw new Error(`Expected stdout '40', got '${pyRun1.stdout}'`);
  }
  console.log("  ✓ Test 1 Passed!\n");

  // ── Test 2: C++ with JUST "return a + b;" ──
  console.log("Test 2: C++ Custom Run with just `return a + b;` (stdin: 100 250)...");
  const cppRun1 = await runCustomCode(
    sumProblem.id,
    "cpp",
    "return a + b;",
    "100 250",
    token
  );
  console.log(`  Verdict: ${cppRun1.status}`);
  console.log(`  STDOUT : "${cppRun1.stdout?.trim()}"`);
  if (cppRun1.stdout?.trim() !== "350") {
    throw new Error(`Expected stdout '350', got '${cppRun1.stdout}'`);
  }
  console.log("  ✓ Test 2 Passed!\n");

  // ── Test 3: Java with JUST "return a + b;" ──
  console.log("Test 3: Java Custom Run with just `return a + b;` (stdin: 42 58)...");
  const javaRun1 = await runCustomCode(
    sumProblem.id,
    "java",
    "return a + b;",
    "42 58",
    token
  );
  console.log(`  Verdict: ${javaRun1.status}`);
  console.log(`  STDOUT : "${javaRun1.stdout?.trim()}"`);
  if (javaRun1.stdout?.trim() !== "100") {
    throw new Error(`Expected stdout '100', got '${javaRun1.stdout}'`);
  }
  console.log("  ✓ Test 3 Passed!\n");

  // ── Test 4: Official Worker Submission: Python with just `return a + b` across ALL test cases ──
  console.log("Test 4: Submitting Python solution with just `return a + b` to Judge Worker...");
  const pySubId = await submitCode(sumProblem.id, "python3", "return a + b", token);
  console.log(`  Submission ID: ${pySubId}`);
  const pyResult = await pollSubmission(pySubId, token);
  console.log(`  Final Verdict : ${pyResult.status}`);
  console.log(`  Execution Time: ${pyResult.executionTime}ms`);
  console.log(`  Memory Usage  : ${pyResult.memoryUsage}MB`);
  if (pyResult.status !== "ACCEPTED") {
    throw new Error(`Expected ACCEPTED verdict, got ${pyResult.status}`);
  }
  console.log("  ✓ Test 4 Passed: All test cases evaluated and passed!\n");

  // ── Test 5: Official Worker Submission: C++ with just `return a + b;` across ALL test cases ──
  console.log("Test 5: Submitting C++ solution with just `return a + b;` to Judge Worker...");
  const cppSubId = await submitCode(sumProblem.id, "cpp", "return a + b;", token);
  console.log(`  Submission ID: ${cppSubId}`);
  const cppResult = await pollSubmission(cppSubId, token);
  console.log(`  Final Verdict : ${cppResult.status}`);
  console.log(`  Execution Time: ${cppResult.executionTime}ms`);
  console.log(`  Memory Usage  : ${cppResult.memoryUsage}MB`);
  if (cppResult.status !== "ACCEPTED") {
    throw new Error(`Expected ACCEPTED verdict, got ${cppResult.status}`);
  }
  console.log("  ✓ Test 5 Passed: All test cases evaluated and passed!\n");

  // ── Test 6: Official Worker Submission: Java with just `return a + b;` across ALL test cases ──
  console.log("Test 6: Submitting Java solution with just `return a + b;` to Judge Worker...");
  const javaSubId = await submitCode(sumProblem.id, "java", "return a + b;", token);
  console.log(`  Submission ID: ${javaSubId}`);
  const javaResult = await pollSubmission(javaSubId, token);
  console.log(`  Final Verdict : ${javaResult.status}`);
  console.log(`  Execution Time: ${javaResult.executionTime}ms`);
  console.log(`  Memory Usage  : ${javaResult.memoryUsage}MB`);
  if (javaResult.status !== "ACCEPTED") {
    throw new Error(`Expected ACCEPTED verdict, got ${javaResult.status}`);
  }
  console.log("  ✓ Test 6 Passed: All test cases evaluated and passed!\n");

  // ── Test 7: Standard LeetCode class Solution for Two Sum ──
  console.log("Test 7: Submitting LeetCode class Solution for 'Two Sum' in C++...");
  const twoSumProblem = await getProblemBySlug("two-sum", token);
  const twoSumCode = `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < (int)nums.size(); ++i) {
            for (int j = i + 1; j < (int)nums.size(); ++j) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`;
  const twoSumSubId = await submitCode(twoSumProblem.id, "cpp", twoSumCode, token);
  console.log(`  Submission ID: ${twoSumSubId}`);
  const twoSumResult = await pollSubmission(twoSumSubId, token);
  console.log(`  Final Verdict : ${twoSumResult.status}`);
  console.log(`  Execution Time: ${twoSumResult.executionTime}ms`);
  console.log(`  Memory Usage  : ${twoSumResult.memoryUsage}MB`);
  if (twoSumResult.status !== "ACCEPTED") {
    throw new Error(`Expected ACCEPTED verdict, got ${twoSumResult.status}`);
  }
  console.log("  ✓ Test 7 Passed: Two Sum with vector<int> return evaluated and passed!\n");

  console.log("=================================================================");
  console.log("🎉 ALL LEETCODE FUNCTION-ONLY TESTS COMPLETED WITH 100% SUCCESS!");
  console.log("=================================================================");
}

main().catch((err) => {
  console.error("❌ Test script failed:", err);
  process.exit(1);
});
