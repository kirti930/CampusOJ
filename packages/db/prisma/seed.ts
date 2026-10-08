import { PrismaClient, Difficulty, ContestStatus, ScoringStrategy } from "@prisma/client";
import bcrypt from "bcryptjs";

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("pool_timeout")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30";
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

const BCRYPT_ROUNDS = 10;
const TEST_PASSWORD = "Password123!";

interface SeedUser {
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";
  fullName: string;
  college: string;
}

const seedUsers: SeedUser[] = [
  {
    email: "student@campusoj.edu",
    role: "STUDENT",
    fullName: "Alice Student",
    college: "School of Engineering",
  },
  {
    email: "faculty@campusoj.edu",
    role: "FACULTY",
    fullName: "Dr. Bob Faculty",
    college: "Department of Computer Science",
  },
  {
    email: "admin@campusoj.edu",
    role: "ADMIN",
    fullName: "Carol Admin",
    college: "CampusOJ Platform",
  },
  {
    email: "superadmin@campusoj.edu",
    role: "SUPER_ADMIN",
    fullName: "Dave SuperAdmin",
    college: "CampusOJ Platform",
  },
];

interface SeedProblem {
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  timeLimit: number;
  memoryLimit: number;
  allowedLanguages: string[];
  tags: string[];
  functionSignature?: any;
  starterCode?: any;
  driverCode?: any;
  testCases: {
    input: string;
    expectedOutput: string;
    isSample: boolean;
    isHidden: boolean;
    weight: number;
  }[];
}

const seedProblems: SeedProblem[] = [
  {
    title: "Hello World",
    slug: "hello-world",
    statement: "Welcome to CampusOJ! Write a program that outputs the classic greeting `Hello, World!` to standard output.",
    inputFormat: "This problem has no input.",
    outputFormat: "A single line containing the exact string `Hello, World!`.",
    constraints: "None.",
    difficulty: Difficulty.EASY,
    timeLimit: 1000,
    memoryLimit: 256,
    allowedLanguages: ["c", "cpp", "java", "python3", "javascript"],
    tags: ["basics", "intro"],
    functionSignature: {
      functionName: "helloWorld",
      returnType: "string",
      parameters: [],
    },
    starterCode: {
      cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    string helloWorld() {\n        // Return "Hello, World!"\n        \n    }\n};\n`,
      java: `class Solution {\n    public String helloWorld() {\n        // Return "Hello, World!"\n        \n    }\n}\n`,
      python3: `class Solution:\n    def helloWorld(self) -> str:\n        # Return "Hello, World!"\n        pass\n`,
    },
    driverCode: {
      cpp: `int main() {\n    Solution solver;\n    cout << solver.helloWorld() << "\\n";\n    return 0;\n}\n`,
      java: `public class Main {\n    public static void main(String[] args) {\n        Solution solver = new Solution();\n        System.out.println(solver.helloWorld());\n    }\n}\n`,
      python3: `if __name__ == '__main__':\n    sol = Solution()\n    print(sol.helloWorld())\n`,
    },
    testCases: [
      {
        input: "",
        expectedOutput: "Hello, World!\n",
        isSample: true,
        isHidden: false,
        weight: 1,
      },
      {
        input: "",
        expectedOutput: "Hello, World!\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
    ],
  },
  {
    title: "Sum of Two Numbers",
    slug: "sum-of-two-numbers",
    statement: "Given two integers a and b, compute and print their sum.",
    inputFormat: "A single line containing two space-separated integers, a and b.",
    outputFormat: "Print the integer sum of a and b.",
    constraints: "-10^9 <= a, b <= 10^9",
    difficulty: Difficulty.EASY,
    timeLimit: 1000,
    memoryLimit: 256,
    allowedLanguages: ["c", "cpp", "java", "python3", "javascript"],
    tags: ["math", "basics"],
    functionSignature: {
      functionName: "sum",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
      ],
    },
    starterCode: {
      cpp: `#include <iostream>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int sum(int a, int b) {\n        // Write your solution here\n        \n    }\n};\n`,
      java: `class Solution {\n    public int sum(int a, int b) {\n        // Write your solution here\n        \n    }\n}\n`,
      python3: `class Solution:\n    def sum(self, a: int, b: int) -> int:\n        # Write your solution here\n        pass\n`,
    },
    driverCode: {
      cpp: `int main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int a, b;\n    if (cin >> a >> b) {\n        Solution solver;\n        cout << solver.sum(a, b) << "\\n";\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int a = scanner.nextInt();\n            int b = scanner.nextInt();\n            Solution solver = new Solution();\n            System.out.println(solver.sum(a, b));\n        }\n    }\n}\n`,
      python3: `import sys\n\nif __name__ == '__main__':\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        a = int(tokens[0])\n        b = int(tokens[1])\n        sol = Solution()\n        print(sol.sum(a, b))\n`,
    },
    testCases: [
      {
        input: "3 5\n",
        expectedOutput: "8\n",
        isSample: true,
        isHidden: false,
        weight: 1,
      },
      {
        input: "100 200\n",
        expectedOutput: "300\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "-50 50\n",
        expectedOutput: "0\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "1000000000 1000000000\n",
        expectedOutput: "2000000000\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
    ],
  },
  {
    title: "Two Sum",
    slug: "two-sum",
    statement: "Given an array of integers nums and an integer target, find two numbers such that they add up to target and print their 0-based indices separated by a space.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "The first line contains two space-separated integers, n (the array length) and target.\nThe second line contains n space-separated integers representing the array elements.",
    outputFormat: "Print the two 0-based indices separated by a space in ascending order.",
    constraints: "2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    difficulty: Difficulty.EASY,
    timeLimit: 1500,
    memoryLimit: 256,
    allowedLanguages: ["c", "cpp", "java", "python3", "javascript"],
    tags: ["arrays", "hash-table"],
    functionSignature: {
      functionName: "twoSum",
      returnType: "number[]",
      parameters: [
        { name: "nums", type: "number[]" },
        { name: "target", type: "int" },
      ],
    },
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};\n`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}\n`,
      python3: `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass\n`,
    },
    driverCode: {
      cpp: `int main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, target;\n    if (cin >> n >> target) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; ++i) cin >> nums[i];\n        Solution solver;\n        vector<int> res = solver.twoSum(nums, target);\n        if (res.size() >= 2) {\n            cout << res[0] << " " << res[1] << "\\n";\n        }\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int n = scanner.nextInt();\n            int target = scanner.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();\n            Solution solver = new Solution();\n            int[] res = solver.twoSum(nums, target);\n            if (res != null && res.length >= 2) {\n                System.out.println(res[0] + " " + res[1]);\n            }\n        }\n    }\n}\n`,
      python3: `import sys\n\nif __name__ == '__main__':\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        n = int(tokens[0])\n        target = int(tokens[1])\n        nums = [int(x) for x in tokens[2:2+n]]\n        sol = Solution()\n        res = sol.twoSum(nums, target)\n        if res and len(res) >= 2:\n            print(f"{res[0]} {res[1]}")\n`,
    },
    testCases: [
      {
        input: "4 9\n2 7 11 15\n",
        expectedOutput: "0 1\n",
        isSample: true,
        isHidden: false,
        weight: 1,
      },
      {
        input: "3 6\n3 2 4\n",
        expectedOutput: "1 2\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "2 6\n3 3\n",
        expectedOutput: "0 1\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "5 10\n1 2 3 7 11\n",
        expectedOutput: "2 3\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
    ],
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    statement: "Given an array of n distinct integers nums sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, print its 0-based index. Otherwise, print -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    inputFormat: "The first line contains two space-separated integers, n and target.\nThe second line contains n space-separated sorted integers.",
    outputFormat: "A single integer representing the 0-based index of target, or -1 if not found.",
    constraints: "1 <= n <= 10^5\n-10^9 <= nums[i], target <= 10^9\nAll elements in nums are unique and strictly sorted in ascending order.",
    difficulty: Difficulty.MEDIUM,
    timeLimit: 2000,
    memoryLimit: 256,
    allowedLanguages: ["c", "cpp", "java", "python3", "javascript"],
    tags: ["binary-search", "algorithms"],
    functionSignature: {
      functionName: "search",
      returnType: "int",
      parameters: [
        { name: "nums", type: "number[]" },
        { name: "target", type: "int" },
      ],
    },
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};\n`,
      java: `import java.util.*;\n\nclass Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}\n`,
      python3: `from typing import List\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass\n`,
    },
    driverCode: {
      cpp: `int main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, target;\n    if (cin >> n >> target) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; ++i) cin >> nums[i];\n        Solution solver;\n        cout << solver.search(nums, target) << "\\n";\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int n = scanner.nextInt();\n            int target = scanner.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();\n            Solution solver = new Solution();\n            System.out.println(solver.search(nums, target));\n        }\n    }\n}\n`,
      python3: `import sys\n\nif __name__ == '__main__':\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        n = int(tokens[0])\n        target = int(tokens[1])\n        nums = [int(x) for x in tokens[2:2+n]]\n        sol = Solution()\n        print(sol.search(nums, target))\n`,
    },
    testCases: [
      {
        input: "6 9\n-1 0 3 5 9 12\n",
        expectedOutput: "4\n",
        isSample: true,
        isHidden: false,
        weight: 1,
      },
      {
        input: "6 2\n-1 0 3 5 9 12\n",
        expectedOutput: "-1\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "1 5\n5\n",
        expectedOutput: "0\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "5 100\n10 20 30 40 50\n",
        expectedOutput: "-1\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
    ],
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    statement: "Given an integer array nums of length n, find the contiguous subarray (containing at least one number) which has the largest sum and print its sum (Kadane's Algorithm).",
    inputFormat: "The first line contains an integer n.\nThe second line contains n space-separated integers.",
    outputFormat: "A single integer denoting the maximum sum of a contiguous subarray.",
    constraints: "1 <= n <= 10^5\n-10^4 <= nums[i] <= 10^4",
    difficulty: Difficulty.MEDIUM,
    timeLimit: 2000,
    memoryLimit: 256,
    allowedLanguages: ["c", "cpp", "java", "python3", "javascript"],
    tags: ["dynamic-programming", "arrays"],
    functionSignature: {
      functionName: "maxSubArray",
      returnType: "int",
      parameters: [
        { name: "nums", type: "number[]" },
      ],
    },
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};\n`,
      java: `import java.util.*;\n\nclass Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        \n    }\n}\n`,
      python3: `from typing import List\n\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Write your solution here\n        pass\n`,
    },
    driverCode: {
      cpp: `int main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (cin >> n) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; ++i) cin >> nums[i];\n        Solution solver;\n        cout << solver.maxSubArray(nums) << "\\n";\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int n = scanner.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();\n            Solution solver = new Solution();\n            System.out.println(solver.maxSubArray(nums));\n        }\n    }\n}\n`,
      python3: `import sys\n\nif __name__ == '__main__':\n    tokens = sys.stdin.read().split()\n    if tokens:\n        n = int(tokens[0])\n        nums = [int(x) for x in tokens[1:1+n]]\n        sol = Solution()\n        print(sol.maxSubArray(nums))\n`,
    },
    testCases: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4\n",
        expectedOutput: "6\n",
        isSample: true,
        isHidden: false,
        weight: 1,
      },
      {
        input: "1\n1\n",
        expectedOutput: "1\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "5\n5 4 -1 7 8\n",
        expectedOutput: "23\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
      {
        input: "3\n-3 -2 -1\n",
        expectedOutput: "-1\n",
        isSample: false,
        isHidden: true,
        weight: 1,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting CampusOJ database seed...\n");

  await prisma.$connect();
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);

  // 1. Seed Users
  console.log("👥 Seeding Users...");
  const createdUsers: Record<string, { id: string; email: string }> = {};

  for (const seed of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        role: seed.role,
        passwordHash,
      },
      create: {
        email: seed.email,
        passwordHash,
        role: seed.role,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { fullName: seed.fullName, college: seed.college },
      create: {
        userId: user.id,
        fullName: seed.fullName,
        college: seed.college,
      },
    });

    createdUsers[seed.role] = { id: user.id, email: user.email };
    console.log(`  ✓ ${seed.role.padEnd(12)} : ${seed.email}`);
  }

  const facultyUser = createdUsers["FACULTY"];
  const studentUser = createdUsers["STUDENT"];

  // 2. Seed Problems
  console.log("\n📝 Seeding Problems with Test Cases...");
  const createdProblemIds: string[] = [];

  for (const sp of seedProblems) {
    // Upsert tags
    const tagRecords = await Promise.all(
      sp.tags.map((t) =>
        prisma.tag.upsert({
          where: { name: t },
          update: {},
          create: { name: t },
        })
      )
    );

    const problem = await prisma.problem.upsert({
      where: { slug: sp.slug },
      update: {
        title: sp.title,
        statement: sp.statement,
        inputFormat: sp.inputFormat,
        outputFormat: sp.outputFormat,
        constraints: sp.constraints,
        difficulty: sp.difficulty,
        timeLimit: sp.timeLimit,
        memoryLimit: sp.memoryLimit,
        allowedLanguages: sp.allowedLanguages,
        functionSignature: sp.functionSignature,
        starterCode: sp.starterCode,
        driverCode: sp.driverCode,
      },
      create: {
        title: sp.title,
        slug: sp.slug,
        statement: sp.statement,
        inputFormat: sp.inputFormat,
        outputFormat: sp.outputFormat,
        constraints: sp.constraints,
        difficulty: sp.difficulty,
        timeLimit: sp.timeLimit,
        memoryLimit: sp.memoryLimit,
        allowedLanguages: sp.allowedLanguages,
        functionSignature: sp.functionSignature,
        starterCode: sp.starterCode,
        driverCode: sp.driverCode,
        authorId: facultyUser.id,
      },
    });

    createdProblemIds.push(problem.id);

    // Link problem tags
    for (const tag of tagRecords) {
      await prisma.problemTag.upsert({
        where: { problemId_tagId: { problemId: problem.id, tagId: tag.id } },
        update: {},
        create: { problemId: problem.id, tagId: tag.id },
      });
    }

    // Refresh test cases
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
    for (const tc of sp.testCases) {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          isHidden: tc.isHidden,
          weight: tc.weight,
        },
      });
    }

    console.log(
      `  ✓ [${sp.difficulty.padEnd(6)}] ${sp.title.padEnd(24)} (${sp.testCases.length} test cases)`
    );
  }

  // 3. Seed Contest
  console.log("\n🏆 Seeding Contest: CampusOJ Inaugural Coding Cup 2026...");
  const contestSlug = "campusoj-inaugural-coding-cup-2026";
  const now = new Date();
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago (LIVE)
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);  // 24 hours from now

  const contest = await prisma.contest.upsert({
    where: { slug: contestSlug },
    update: {
      title: "CampusOJ Inaugural Coding Cup 2026",
      description:
        "Welcome to the CampusOJ Inaugural Coding Cup! Compete against fellow students across 5 algorithmic challenges with live ICPC penalty standings.",
      status: ContestStatus.LIVE,
      scoringStrategy: ScoringStrategy.ICPC,
      freezeLeaderboard: false,
      startTime,
      endTime,
    },
    create: {
      title: "CampusOJ Inaugural Coding Cup 2026",
      slug: contestSlug,
      description:
        "Welcome to the CampusOJ Inaugural Coding Cup! Compete against fellow students across 5 algorithmic challenges with live ICPC penalty standings.",
      status: ContestStatus.LIVE,
      scoringStrategy: ScoringStrategy.ICPC,
      freezeLeaderboard: false,
      startTime,
      endTime,
      createdById: facultyUser.id,
    },
  });

  // Attach all problems to the contest
  const pointsMap = [100, 100, 100, 200, 200];
  for (let i = 0; i < createdProblemIds.length; i++) {
    await prisma.contestProblem.upsert({
      where: {
        contestId_problemId: {
          contestId: contest.id,
          problemId: createdProblemIds[i],
        },
      },
      update: {
        orderIndex: i,
        points: pointsMap[i] ?? 100,
      },
      create: {
        contestId: contest.id,
        problemId: createdProblemIds[i],
        orderIndex: i,
        points: pointsMap[i] ?? 100,
      },
    });
  }
  console.log(`  ✓ Linked ${createdProblemIds.length} problems to contest`);

  // Pre-register student
  await prisma.contestParticipant.upsert({
    where: {
      contestId_userId: {
        contestId: contest.id,
        userId: studentUser.id,
      },
    },
    update: {},
    create: {
      contestId: contest.id,
      userId: studentUser.id,
    },
  });
  console.log(`  ✓ Pre-registered student "${studentUser.email}"`);

  console.log("\n=======================================================");
  console.log("🎉 CampusOJ Seed Completed Successfully!");
  console.log("=======================================================");
  console.log("🔐 Credentials for all seeded accounts:");
  console.log("   Password: Password123!");
  console.log("   • Super Admin : superadmin@campusoj.edu");
  console.log("   • Admin       : admin@campusoj.edu");
  console.log("   • Faculty     : faculty@campusoj.edu");
  console.log("   • Student     : student@campusoj.edu");
  console.log("🏆 Contest:");
  console.log(`   • Title: "${contest.title}" (LIVE)`);
  console.log(`   • ID   : ${contest.id}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
