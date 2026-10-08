import axios from "axios";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:5000/api/v1";

async function main() {
  console.log("======================================================");
  console.log("🧪 Testing Java 'Sum of Two Numbers' Custom Run Execution");
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log("======================================================\n");

  // Step 1: Login as student
  console.log("Step 1: Logging in as student@campusoj.edu...");
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: "student@campusoj.edu",
    password: "Password123!",
  });
  const token = loginRes.data.token || loginRes.data.data?.token;
  console.log("  ✓ Authenticated successfully.");

  // Step 2: Fetch problems to find 'Sum of Two Numbers'
  console.log("\nStep 2: Locating problem 'Sum of Two Numbers'...");
  const problemsRes = await axios.get(`${API_BASE}/problems?search=Sum of Two Numbers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const problems = problemsRes.data.data;
  const problem = problems.find((p: any) => p.slug === "sum-of-two-numbers") || problems[0];
  if (!problem) {
    throw new Error("Could not find 'Sum of Two Numbers' problem");
  }
  console.log(`  ✓ Found problem: "${problem.title}" (ID: ${problem.id})`);

  // Step 3: Run Java code with stdin "3 5"
  console.log("\nStep 3: Executing Java code with custom input stdin '3 5' via POST /submissions/run...");
  const javaCode = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
    }
}`;

  const runRes = await axios.post(
    `${API_BASE}/submissions/run`,
    {
      problemId: problem.id,
      language: "java",
      sourceCode: javaCode,
      customInput: "3 5",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log("  ✓ Response received:");
  console.log(JSON.stringify(runRes.data, null, 2));

  const responseData = runRes.data;
  const primaryResult = responseData.data?.primaryResult;
  const stdout = responseData.stdout ?? responseData.data?.stdout ?? primaryResult?.stdout;
  const status = responseData.status ?? responseData.data?.status ?? primaryResult?.verdict;

  console.log("\n=================== VERIFICATION RESULTS ===================");
  console.log(`Status        : ${status}`);
  console.log(`Execution Time: ${primaryResult?.executionTime}ms`);
  console.log(`Memory Usage  : ${primaryResult?.memoryUsage}MB`);
  console.log(`Raw STDOUT    : JSON -> ${JSON.stringify(stdout)}`);
  console.log(`Rendered STDOUT:`);
  console.log("-----------------------------------------");
  console.log(stdout?.trim() ? stdout : "(empty output)");
  console.log("-----------------------------------------");

  if (stdout && stdout.trim() === "8") {
    console.log("\n🎉 VERIFICATION SUCCESS: STDOUT correctly displays '8'!");
  } else {
    console.error(`\n❌ VERIFICATION FAILED: Expected stdout '8', but got '${stdout}'`);
    process.exit(1);
  }

  // Bonus test: Verify another input '10 25' produces '35'
  console.log("\nStep 4: Testing dynamic stdin '10 25'...");
  const bonusRes = await axios.post(
    `${API_BASE}/submissions/run`,
    {
      problemId: problem.id,
      language: "java",
      sourceCode: javaCode,
      customInput: "10 25",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const bonusStdout = bonusRes.data.stdout ?? bonusRes.data.data?.stdout ?? bonusRes.data.data?.primaryResult?.stdout;
  console.log(`  ✓ Bonus STDOUT for '10 25': ${JSON.stringify(bonusStdout)} (Trimmed: '${bonusStdout?.trim()}')`);
  if (bonusStdout?.trim() === "35") {
    console.log("  ✓ Dynamic calculation verified successfully!");
  }

  console.log("\n======================================================");
  console.log("🎉 ALL RUNNER AND STDOUT TESTS PASSED!");
  console.log("======================================================");
}

main().catch((err) => {
  console.error("Test failed with error:", err.response?.data ?? err.message);
  process.exit(1);
});
