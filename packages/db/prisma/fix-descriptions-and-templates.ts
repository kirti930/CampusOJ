import { PrismaClient } from "@prisma/client";
import {
  generateStarterCode,
  generateDriverCode,
  FunctionSignature,
} from "@campusoj/shared";

// Patch DATABASE_URL for Neon connection stability
if (!process.env.DATABASE_URL?.includes("pool_timeout")) {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL + "?connect_timeout=30&pool_timeout=30";
}

const prisma = new PrismaClient();

// ─── 1. Markdown Sanitizer ───────────────────────────────────────────────────

function cleanProblemMarkdown(statement: string | null | undefined): string {
  if (!statement) return "";
  let text = statement;

  // Normalize line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Strip leading tabs and 4+ space indentation from lists to prevent CommonMark
  // indented code blocks (<pre><code>) which create unwanted grey boxes.
  text = text
    .split("\n")
    .map((line) => {
      if (/^\t+/.test(line)) {
        return line.replace(/^\t+/, "");
      }
      if (/^ {4,}([-*+]|\d+\.)/.test(line)) {
        return line.replace(/^ +/, "");
      }
      return line;
    })
    .join("\n");

  // Convert any remaining stray tabs to standard spaces
  text = text.replace(/\t/g, "  ");

  // Strip unparsed asterisks/stars inside fenced code blocks (``` ... ```)
  text = text.replace(/```[\s\S]*?```/g, (block) => {
    return block.replace(/\*\*/g, "");
  });

  // Fix corrupted asterisks in prose in known problems
  text = text.replace(
    /\*\*strictly increasing \*\*\*\*\*\*subsequence\*\*\*/g,
    "**strictly increasing subsequence**"
  );
  text = text.replace(/`1 amortized\*\* `O\(1\)`/g, "amortized `O(1)`");
  text = text.replace(/\*\*([A-Za-z0-9_]+)\*\*\*\*/g, "**$1**");

  // Fix mangled scientific exponent notations in constraints
  text = text.replace(/\b10([4569])\b/g, (_m, p1) => `10^${p1}`);
  text = text.replace(/10\^5\^5/g, "10^5");
  text = text.replace(/10\^4\^4/g, "10^4");
  text = text.replace(/10\^6\^6/g, "10^6");
  text = text.replace(/10\^9\^9/g, "10^9");
  text = text.replace(/(?<!\^)-?231\s*-\s*1/g, "2^31 - 1");
  text = text.replace(/(?<!\^)-231\b/g, "-2^31");
  text = text.replace(/(?<!\^)231\b/g, "2^31");

  // Fix escaped brackets
  text = text.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");

  // Fix double-escaped quotes
  text = text.replace(/\\"/g, '"');

  // Collapse 3+ consecutive newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

function cleanGeneralText(str: string | null | undefined): string {
  if (!str) return "";
  let text = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/^\t+/gm, "");
  text = text.replace(/\t/g, "  ");
  text = text.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");
  text = text.replace(/\\"/g, '"');
  text = text.replace(/\b10([4569])\b/g, (_m, p1) => `10^${p1}`);
  return text.trim();
}

// ─── 2. Verified Canonical Signatures & Classes ───────────────────────────────

const VERIFIED_SIGNATURES: Record<string, FunctionSignature> = {
  // ── Reference Problem 1: Count of Range Sum
  "count-of-range-sum": {
    functionName: "countRangeSum",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "lower", type: "int" },
      { name: "upper", type: "int" },
    ],
    returnType: "int",
  },

  // ── Reference Problem 2: Range Sum Query - Mutable
  "range-sum-query-mutable": {
    isClass: true,
    className: "NumArray",
    constructorParams: [{ name: "nums", type: "int[]" }],
    methods: [
      {
        name: "update",
        returnType: "void",
        parameters: [
          { name: "index", type: "int" },
          { name: "val", type: "int" },
        ],
      },
      {
        name: "sumRange",
        returnType: "int",
        parameters: [
          { name: "left", type: "int" },
          { name: "right", type: "int" },
        ],
      },
    ],
  },

  // ── Other Class / Design Problems
  "range-sum-query-immutable": {
    isClass: true,
    className: "NumArray",
    constructorParams: [{ name: "nums", type: "int[]" }],
    methods: [
      {
        name: "sumRange",
        returnType: "int",
        parameters: [
          { name: "left", type: "int" },
          { name: "right", type: "int" },
        ],
      },
    ],
  },
  "lru-cache-implementation": {
    isClass: true,
    className: "LRUCache",
    constructorParams: [{ name: "capacity", type: "int" }],
    methods: [
      {
        name: "get",
        returnType: "int",
        parameters: [{ name: "key", type: "int" }],
      },
      {
        name: "put",
        returnType: "void",
        parameters: [
          { name: "key", type: "int" },
          { name: "value", type: "int" },
        ],
      },
    ],
  },
  "implement-queue-using-stacks": {
    isClass: true,
    className: "MyQueue",
    constructorParams: [],
    methods: [
      {
        name: "push",
        returnType: "void",
        parameters: [{ name: "x", type: "int" }],
      },
      { name: "pop", returnType: "int", parameters: [] },
      { name: "peek", returnType: "int", parameters: [] },
      { name: "empty", returnType: "boolean", parameters: [] },
    ],
  },
  "implement-stack-using-queues": {
    isClass: true,
    className: "MyStack",
    constructorParams: [],
    methods: [
      {
        name: "push",
        returnType: "void",
        parameters: [{ name: "x", type: "int" }],
      },
      { name: "pop", returnType: "int", parameters: [] },
      { name: "top", returnType: "int", parameters: [] },
      { name: "empty", returnType: "boolean", parameters: [] },
    ],
  },
  "construct-a-trie-from-scratch": {
    isClass: true,
    className: "Trie",
    constructorParams: [],
    methods: [
      {
        name: "insert",
        returnType: "void",
        parameters: [{ name: "word", type: "string" }],
      },
      {
        name: "search",
        returnType: "boolean",
        parameters: [{ name: "word", type: "string" }],
      },
      {
        name: "startsWith",
        returnType: "boolean",
        parameters: [{ name: "prefix", type: "string" }],
      },
    ],
  },
  "find-median-from-data-stream": {
    isClass: true,
    className: "MedianFinder",
    constructorParams: [],
    methods: [
      {
        name: "addNum",
        returnType: "void",
        parameters: [{ name: "num", type: "int" }],
      },
      {
        name: "findMedian",
        returnType: "double",
        parameters: [],
      },
    ],
  },
  "kth-largest-element-in-a-stream": {
    isClass: true,
    className: "KthLargest",
    constructorParams: [
      { name: "k", type: "int" },
      { name: "nums", type: "int[]" },
    ],
    methods: [
      {
        name: "add",
        returnType: "int",
        parameters: [{ name: "val", type: "int" }],
      },
    ],
  },

  // ── Algorithmic problems with parameter alignments
  "coin-change": {
    functionName: "coinChange",
    parameters: [
      { name: "coins", type: "int[]" },
      { name: "amount", type: "int" },
    ],
    returnType: "int",
  },
  "kth-largest-element-in-an-array": {
    functionName: "findKthLargest",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "top-k-frequent-elements": {
    functionName: "topKFrequent",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returnType: "int[]",
  },
  "sliding-window-maximum": {
    functionName: "maxSlidingWindow",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returnType: "int[]",
  },
  "subarray-sums-divisible-by-k": {
    functionName: "subarraysDivByK",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "remove-nth-node-from-end-of-list": {
    functionName: "removeNthFromEnd",
    parameters: [
      { name: "head", type: "ListNode" },
      { name: "n", type: "int" },
    ],
    returnType: "ListNode",
  },
  "circular-tour": {
    functionName: "canCompleteCircuit",
    parameters: [
      { name: "gas", type: "int[]" },
      { name: "cost", type: "int[]" },
    ],
    returnType: "int",
  },
  "chocolate-distribution-problem": {
    functionName: "findMinDiff",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "m", type: "int" },
    ],
    returnType: "int",
  },
  "longest-repeating-subsequence": {
    functionName: "characterReplacement",
    parameters: [
      { name: "s", type: "string" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "minimum-window-substring": {
    functionName: "minWindow",
    parameters: [
      { name: "s", type: "string" },
      { name: "t", type: "string" },
    ],
    returnType: "string",
  },
  "longest-common-substring": {
    functionName: "longestCommonSubsequence",
    parameters: [
      { name: "text1", type: "string" },
      { name: "text2", type: "string" },
    ],
    returnType: "int",
  },
  "same-tree": {
    functionName: "isSameTree",
    parameters: [
      { name: "p", type: "TreeNode" },
      { name: "q", type: "TreeNode" },
    ],
    returnType: "boolean",
  },
  "subtree-of-another-tree": {
    functionName: "isSubtree",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "subRoot", type: "TreeNode" },
    ],
    returnType: "boolean",
  },
  "construct-binary-tree-from-preorder-and-inorder-traversal": {
    functionName: "buildTree",
    parameters: [
      { name: "preorder", type: "int[]" },
      { name: "inorder", type: "int[]" },
    ],
    returnType: "TreeNode",
  },
  "two-sum": {
    functionName: "twoSum",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "int[]",
  },
  "3sum": {
    functionName: "threeSum",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  subsets: {
    functionName: "subsets",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "subsets-ii": {
    functionName: "subsetsWithDup",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "count-of-smaller-numbers-after-self": {
    functionName: "countSmaller",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<Integer>",
  },
  "combination-sum": {
    functionName: "combinationSum",
    parameters: [
      { name: "candidates", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "List<List<Integer>>",
  },
  "combination-sum-iv": {
    functionName: "combinationSum4",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "int",
  },
  "climbing-stairs": {
    functionName: "climbStairs",
    parameters: [{ name: "n", type: "int" }],
    returnType: "int",
  },
  "best-time-to-buy-and-sell-stock": {
    functionName: "maxProfit",
    parameters: [{ name: "prices", type: "int[]" }],
    returnType: "int",
  },
  "binary-search": {
    functionName: "search",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "int",
  },
  "contains-duplicate": {
    functionName: "containsDuplicate",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "boolean",
  },
  "container-with-most-water": {
    functionName: "maxArea",
    parameters: [{ name: "height", type: "int[]" }],
    returnType: "int",
  },
  "invert-binary-tree": {
    functionName: "invertTree",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "TreeNode",
  },
  "validate-binary-search-tree": {
    functionName: "isValidBST",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "boolean",
  },
  "kth-smallest-element-in-a-bst": {
    functionName: "kthSmallest",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "delete-node-in-a-bst": {
    functionName: "deleteNode",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "key", type: "int" },
    ],
    returnType: "TreeNode",
  },
  "lowest-common-ancestor-of-a-binary-search-tree": {
    functionName: "lowestCommonAncestor",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "p", type: "TreeNode" },
      { name: "q", type: "TreeNode" },
    ],
    returnType: "TreeNode",
  },
  "binary-tree-maximum-path-sum": {
    functionName: "maxPathSum",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "int",
  },
  "binary-tree-level-order-traversal": {
    functionName: "levelOrder",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "List<List<Integer>>",
  },
  "bipartitie-graph": {
    functionName: "isBipartite",
    parameters: [{ name: "graph", type: "int[][]" }],
    returnType: "boolean",
  },
  "cheapest-flights-within-k-stops": {
    functionName: "findCheapestPrice",
    parameters: [
      { name: "n", type: "int" },
      { name: "flights", type: "int[][]" },
      { name: "src", type: "int" },
      { name: "dst", type: "int" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "topological-sort": {
    functionName: "findOrder",
    parameters: [
      { name: "numCourses", type: "int" },
      { name: "prerequisites", type: "int[][]" },
    ],
    returnType: "int[]",
  },
  "detect-cycle-in-an-undirected-graph": {
    functionName: "canFinish",
    parameters: [
      { name: "numCourses", type: "int" },
      { name: "prerequisites", type: "int[][]" },
    ],
    returnType: "boolean",
  },
};

// ─── 3. Main Execution Function ───────────────────────────────────────────────

async function main() {
  console.log("=== STARTING GLOBAL CATALOG REPAIR & SANITIZATION ===");

  // Step A: Purge all dummy testcases
  console.log("\n1. Purging dummy testcases across all problems...");
  const deletedDummies = await prisma.testCase.deleteMany({
    where: {
      OR: [
        { input: { contains: "dummy_input" } },
        { expectedOutput: { contains: "dummy_output" } },
      ],
    },
  });
  console.log(`Deleted ${deletedDummies.count} dummy testcase records.`);

  // Step B: Sanitize testcases (clean brackets & trim)
  console.log("\n2. Sanitizing remaining testcase records...");
  const allTestCases = await prisma.testCase.findMany();
  let tcUpdated = 0;
  for (const tc of allTestCases) {
    let cleanIn = tc.input.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]").trim();
    let cleanOut = tc.expectedOutput
      .replace(/\\+\[/g, "[")
      .replace(/\\+\]/g, "]")
      .replace(/\*\*/g, "")
      .trim();

    if (cleanIn !== tc.input || cleanOut !== tc.expectedOutput) {
      await prisma.testCase.update({
        where: { id: tc.id },
        data: { input: cleanIn, expectedOutput: cleanOut },
      });
      tcUpdated++;
    }
  }
  console.log(`Sanitized ${tcUpdated} testcase records.`);

  // Step C: Ensure Reference Problem "count-of-range-sum" has verified testcases
  console.log("\n3. Verifying testcases for count-of-range-sum...");
  const corsProblem = await prisma.problem.findUnique({
    where: { slug: "count-of-range-sum" },
    include: { testCases: true },
  });

  if (corsProblem) {
    // Delete remaining if any
    await prisma.testCase.deleteMany({
      where: { problemId: corsProblem.id },
    });

    await prisma.testCase.createMany({
      data: [
        {
          problemId: corsProblem.id,
          input: "[-2,5,-1]\n-2\n2",
          expectedOutput: "3",
          isSample: true,
          isHidden: false,
          weight: 1,
        },
        {
          problemId: corsProblem.id,
          input: "[0]\n0\n0",
          expectedOutput: "1",
          isSample: true,
          isHidden: false,
          weight: 1,
        },
        {
          problemId: corsProblem.id,
          input: "[1,-1,2]\n-1\n2",
          expectedOutput: "6",
          isSample: false,
          isHidden: true,
          weight: 2,
        },
        {
          problemId: corsProblem.id,
          input: "[-2147483647,0,-2147483647,2147483647]\n-564\n3864",
          expectedOutput: "3",
          isSample: false,
          isHidden: true,
          weight: 2,
        },
        {
          problemId: corsProblem.id,
          input: "[0,-3,-3,1,1,2]\n3\n5",
          expectedOutput: "2",
          isSample: false,
          isHidden: true,
          weight: 2,
        },
      ],
    });
    console.log("Seeded 5 verified testcases for count-of-range-sum.");
  }

  // Step D: Iterate through all problems and repair formatting, signatures, starters, drivers
  console.log("\n4. Iterating through all problems to repair statements, templates, and drivers...");
  const problems = await prisma.problem.findMany({
    include: { testCases: true },
    orderBy: { slug: "asc" },
  });

  let statementsCleaned = 0;
  let signaturesRepaired = 0;

  for (const p of problems) {
    // 1. Clean Markdown
    const cleanedStatement = cleanProblemMarkdown(p.statement);
    const cleanedInputFormat = cleanGeneralText(p.inputFormat);
    const cleanedOutputFormat = cleanGeneralText(p.outputFormat);
    const cleanedConstraints = cleanProblemMarkdown(p.constraints);

    if (
      cleanedStatement !== p.statement ||
      cleanedInputFormat !== p.inputFormat ||
      cleanedOutputFormat !== p.outputFormat ||
      cleanedConstraints !== p.constraints
    ) {
      statementsCleaned++;
    }

    // 2. Resolve Signature
    let finalSig: FunctionSignature;
    if (VERIFIED_SIGNATURES[p.slug]) {
      finalSig = VERIFIED_SIGNATURES[p.slug];
    } else if (p.functionSignature && typeof p.functionSignature === "object") {
      finalSig = { ...(p.functionSignature as any) };

      // Purge any Object types or placeholder parameter names
      if (finalSig.parameters) {
        finalSig.parameters = finalSig.parameters.map((param, idx) => {
          let t = param.type;
          if (t === "Object" || t === "object" || !t) {
            t = "int";
          }
          let n = param.name;
          if (n === "arg0" || n === "arg1" || n === "arg2") {
            n = idx === 0 ? "nums" : idx === 1 ? "k" : "val";
          }
          return { name: n, type: t };
        });
      }
      if (finalSig.returnType === "Object" || !finalSig.returnType) {
        finalSig.returnType = "int";
      }

      // Check if target was used when statement actually mentions k or amount
      if (finalSig.parameters?.some((param) => param.name === "target")) {
        const stmt = p.statement.toLowerCase();
        if (!stmt.includes("target")) {
          if (stmt.includes(" k ") || stmt.includes("`k`")) {
            finalSig.parameters = finalSig.parameters.map((param) =>
              param.name === "target" ? { ...param, name: "k" } : param
            );
          } else if (stmt.includes("amount")) {
            finalSig.parameters = finalSig.parameters.map((param) =>
              param.name === "target" ? { ...param, name: "amount" } : param
            );
          }
        }
      }
    } else {
      // Default fallback
      finalSig = {
        functionName: "solution",
        parameters: [{ name: "nums", type: "int[]" }],
        returnType: "int",
      };
    }

    // 3. Generate canonical multi-language Starter Code
    const starterCode = {
      cpp: generateStarterCode(finalSig, "cpp"),
      java: generateStarterCode(finalSig, "java"),
      python: generateStarterCode(finalSig, "python"),
    };

    // 4. Generate canonical multi-language Driver Code
    const driverCode = {
      cpp: generateDriverCode(finalSig, "cpp"),
      java: generateDriverCode(finalSig, "java"),
      python: generateDriverCode(finalSig, "python"),
    };

    // 5. Update Database Record
    await prisma.problem.update({
      where: { id: p.id },
      data: {
        statement: cleanedStatement,
        inputFormat: cleanedInputFormat,
        outputFormat: cleanedOutputFormat,
        constraints: cleanedConstraints,
        functionSignature: finalSig as any,
        starterCode: starterCode as any,
        driverCode: driverCode as any,
      },
    });

    signaturesRepaired++;
  }

  console.log(`\n=== CATALOG REPAIR COMPLETED SUCCESSFULLY ===`);
  console.log(`Total problems updated: ${signaturesRepaired}`);
  console.log(`Statements cleaned: ${statementsCleaned}`);
}

main()
  .catch((err) => {
    console.error("FATAL ERROR in fix-descriptions-and-templates:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
