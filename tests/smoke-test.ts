/**
 * CampusOJ End-to-End Smoke Test
 * 
 * Verifies core user flow:
 * 1. Authenticate as student
 * 2. Fetch live contest & problem roster
 * 3. Submit solution to "Sum of Two Numbers"
 * 4. Await judge evaluation -> ACCEPTED
 * 5. Verify contest leaderboard updates with solve and penalty
 * 
 * Usage:
 *   npx tsx tests/smoke-test.ts
 */

const API_BASE = process.env.API_URL || "http://localhost:5000/api/v1";

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  token?: string;
  error?: string;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const body = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !body.success) {
    throw new Error(body.error || `HTTP ${res.status} from ${path}`);
  }
  return (body.data !== undefined ? body.data : (body as unknown)) as T;
}

async function runSmokeTest() {
  console.log("======================================================");
  console.log("🧪 Starting CampusOJ Automated Integration Smoke Test");
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log("======================================================\n");

  // Step 0: Check Health
  console.log("Step 0: Checking API server reachability...");
  try {
    const healthUrl = API_BASE.replace("/api/v1", "/health");
    const healthRes = await fetch(healthUrl);
    if (!healthRes.ok) throw new Error(`Health status: ${healthRes.status}`);
    console.log("  ✓ API Server is live and responsive.\n");
  } catch (err: any) {
    console.error(`\n❌ Could not connect to API server at ${API_BASE}`);
    console.error("   Please start the server first: npm run dev --workspace=@campusoj/api");
    console.error(`   Details: ${err.message}\n`);
    process.exit(1);
  }

  // Step 1: Authentication
  console.log("Step 1: Authenticating as student@campusoj.edu...");
  let authToken = "";
  let studentUser: any = null;

  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student@campusoj.edu",
        password: "Password123!",
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(loginData.error || "Login failed");
    }
    authToken = loginData.token;
    studentUser = loginData.data;
    console.log(`  ✓ Authenticated as "${studentUser.email}" (Role: ${studentUser.role})\n`);
  } catch (err: any) {
    console.error(`❌ Authentication failed: ${err.message}`);
    console.error("   Have you seeded the database? Run: npm run db:seed\n");
    process.exit(1);
  }

  // Step 2: Fetch Live Contest
  console.log("Step 2: Fetching live contest...");
  let contest: any = null;
  try {
    const contestList = await request<any[]>("/contests?status=LIVE", {}, authToken);
    if (!contestList || contestList.length === 0) {
      throw new Error("No LIVE contest found. Please seed the database with: npm run db:seed");
    }
    contest = contestList[0];
    console.log(`  ✓ Found Contest: "${contest.title}" (${contest.id})`);
    console.log(`    Strategy: ${contest.scoringStrategy} | Status: ${contest.status}\n`);
  } catch (err: any) {
    console.error(`❌ Contest retrieval failed: ${err.message}\n`);
    process.exit(1);
  }

  // Step 3: Fetch Contest Problems
  console.log("Step 3: Fetching contest problems roster...");
  let targetProblem: any = null;
  try {
    const contestDetail = await request<any>(`/contests/${contest.id}`, {}, authToken);
    const problems = contestDetail.problems || [];
    console.log(`  ✓ Contest has ${problems.length} attached problem(s):`);
    for (const p of problems) {
      console.log(`    • [${p.orderIndex ?? "-"}] ${p.problem?.title || p.title} (${p.points} pts)`);
      if (
        (p.problem?.slug === "sum-of-two-numbers" || p.slug === "sum-of-two-numbers") ||
        (p.problem?.title === "Sum of Two Numbers" || p.title === "Sum of Two Numbers")
      ) {
        targetProblem = p.problem || p;
      }
    }

    if (!targetProblem) {
      targetProblem = problems[0]?.problem || problems[0];
    }
    if (!targetProblem) {
      throw new Error("No problems found in contest.");
    }
    const targetProblemId = targetProblem.problemId || targetProblem.id;
    console.log(`  ✓ Selected Target Problem: "${targetProblem.title}" (Problem ID: ${targetProblemId})\n`);
  } catch (err: any) {
    console.error(`❌ Problem fetch failed: ${err.message}\n`);
    process.exit(1);
  }

  // Step 4: Submit Working Solution
  const targetProblemId = targetProblem.problemId || targetProblem.id;
  console.log(`Step 4: Submitting working Python solution to "${targetProblem.title}"...`);
  const pythonCode = `import sys

def main():
    data = sys.stdin.read().split()
    if len(data) >= 2:
        a = int(data[0])
        b = int(data[1])
        print(a + b)

if __name__ == "__main__":
    main()
`;

  let submissionId = "";
  try {
    const submitRes = await request<any>(
      "/submissions",
      {
        method: "POST",
        body: JSON.stringify({
          problemId: targetProblemId,
          contestId: contest.id,
          language: "python3",
          sourceCode: pythonCode,
        }),
      },
      authToken
    );
    submissionId = submitRes.id;
    console.log(`  ✓ Submission created: ID ${submissionId} (Initial status: ${submitRes.status})\n`);
  } catch (err: any) {
    console.error(`❌ Submission failed: ${err.message}\n`);
    process.exit(1);
  }

  // Step 5: Poll Evaluation Status
  console.log("Step 5: Awaiting evaluation & judging completion...");
  let finalSubmission: any = null;
  const startTime = Date.now();
  const maxWaitMs = 20000;

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      finalSubmission = await request<any>(`/submissions/${submissionId}`, {}, authToken);
      const status = finalSubmission.status;
      process.stdout.write(`  ⏳ Current verdict: ${status}... `);

      if (status !== "QUEUED" && status !== "RUNNING" && status !== "PENDING") {
        console.log("Done!");
        break;
      }
      console.log("Waiting");
    } catch (e: any) {
      console.log(`(retry: ${e.message})`);
    }
  }

  if (!finalSubmission || finalSubmission.status === "QUEUED" || finalSubmission.status === "RUNNING") {
    console.error("\n❌ Submission evaluation timed out after 20 seconds.");
    process.exit(1);
  }

  console.log(`\n  ✓ Final Verdict: ${finalSubmission.status}`);
  console.log(`    Execution Time: ${finalSubmission.executionTime}ms`);
  console.log(`    Memory Usage  : ${finalSubmission.memoryUsage}MB`);

  if (finalSubmission.status !== "ACCEPTED") {
    console.error(`❌ Expected verdict ACCEPTED but got ${finalSubmission.status}`);
    process.exit(1);
  }

  // Step 6: Verify Contest Leaderboard Update
  console.log("\nStep 6: Verifying Contest Leaderboard Standing...");
  try {
    const leaderboard = await request<any>(
      `/contests/${contest.id}/leaderboard`,
      {},
      authToken
    );

    const studentRow = leaderboard.rows?.find(
      (r: any) => r.userId === studentUser.id || r.userEmail === studentUser.email
    );

    if (!studentRow) {
      throw new Error(`Student ${studentUser.email} not found in leaderboard rows.`);
    }

    console.log(`  ✓ Leaderboard Entry Found:`);
    console.log(`    • Participant : ${studentRow.userName} (${studentRow.userEmail})`);
    console.log(`    • Rank        : #${studentRow.rank}`);
    console.log(`    • Solved Count: ${studentRow.solvedCount}`);
    console.log(`    • Total Score : ${studentRow.totalScore}`);
    console.log(`    • Penalty     : ${studentRow.penalty} minutes`);

    const problemStatus = studentRow.problemMatrix?.[targetProblemId];
    if (!problemStatus || problemStatus.status !== "ACCEPTED") {
      throw new Error(
        `Problem ${targetProblem.title} matrix status is '${problemStatus?.status}', expected 'ACCEPTED'`
      );
    }
    console.log(`  ✓ Problem Matrix: Status = ${problemStatus.status}, Attempts = ${problemStatus.attempts}`);

    if (studentRow.solvedCount < 1) {
      throw new Error(`Solved count is ${studentRow.solvedCount}, expected >= 1`);
    }
  } catch (err: any) {
    console.error(`❌ Leaderboard verification failed: ${err.message}\n`);
    process.exit(1);
  }

  console.log("\n======================================================");
  console.log("🎉 ALL INTEGRATION SMOKE TESTS PASSED SUCCESSFULLY!");
  console.log("   • Auth, Problem, Contest, Judge, and Standings Verified");
  console.log("======================================================\n");
}

runSmokeTest().catch((err) => {
  console.error("Fatal Test Failure:", err);
  process.exit(1);
});
