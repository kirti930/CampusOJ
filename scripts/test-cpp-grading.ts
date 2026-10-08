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
  throw new Error(`Submission ${submissionId} timed out`);
}

async function main() {
  console.log("===================================================================");
  console.log("🧪 Testing C++ (g++) Real Compilation & Grading in CampusOJ");
  console.log("===================================================================\n");

  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: "student@campusoj.edu",
    password: "Password123!",
  });
  const token = loginRes.data.token || loginRes.data.data?.token;

  const problemsRes = await axios.get(`${API_BASE}/problems?search=Sum of Two Numbers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const problem = problemsRes.data.data.find((p: any) => p.slug === "sum-of-two-numbers");
  if (!problem) throw new Error("Could not find problem");

  // 1. C++ WRONG ANSWER
  console.log("Submitting C++ solution that subtracts instead of adding (Wrong Answer)...");
  const cppWrongCode = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a - b) << endl;
    }
    return 0;
}
`;
  const resWrong = await axios.post(
    `${API_BASE}/submissions/submit`,
    { problemId: problem.id, language: "cpp", sourceCode: cppWrongCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const verdictWrong = await waitForVerdict(resWrong.data.data.id, token);
  console.log(`✓ C++ Wrong Submission Verdict: ${verdictWrong.status}`);
  if (verdictWrong.status !== "WRONG_ANSWER") {
    throw new Error(`Expected WRONG_ANSWER, got ${verdictWrong.status}`);
  }

  // 2. C++ ACCEPTED
  console.log("\nSubmitting C++ solution that correctly adds a + b (Accepted)...");
  const cppCorrectCode = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << endl;
    }
    return 0;
}
`;
  const resCorrect = await axios.post(
    `${API_BASE}/submissions/submit`,
    { problemId: problem.id, language: "cpp", sourceCode: cppCorrectCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const verdictCorrect = await waitForVerdict(resCorrect.data.data.id, token);
  console.log(`✓ C++ Correct Submission Verdict: ${verdictCorrect.status} (${verdictCorrect.executionTime}ms, ${verdictCorrect.memoryUsage}MB)`);
  if (verdictCorrect.status !== "ACCEPTED") {
    throw new Error(`Expected ACCEPTED, got ${verdictCorrect.status}`);
  }

  // 3. C++ COMPILATION ERROR
  console.log("\nSubmitting C++ solution with syntax error (Compilation Error)...");
  const cppCeCode = `#include <iostream>
int main() {
    broken syntax error here;
}
`;
  const resCe = await axios.post(
    `${API_BASE}/submissions/submit`,
    { problemId: problem.id, language: "cpp", sourceCode: cppCeCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const verdictCe = await waitForVerdict(resCe.data.data.id, token);
  console.log(`✓ C++ Syntax Error Verdict: ${verdictCe.status}`);
  if (verdictCe.status !== "COMPILATION_ERROR") {
    throw new Error(`Expected COMPILATION_ERROR, got ${verdictCe.status}`);
  }

  console.log("\n===================================================================");
  console.log("🎉 ALL C++ (g++) COMPILATION & GRADING TESTS PASSED!");
  console.log("===================================================================");
}

main().catch((err) => {
  console.error("Test failed:", err.response?.data ?? err.message);
  process.exit(1);
});
