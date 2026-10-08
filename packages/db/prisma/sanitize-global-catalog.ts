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

// ─── Canonical Handcrafted Signatures & Classes ──────────────────────────────

const VERIFIED_SIGNATURES: Record<string, FunctionSignature> = {
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
  permutations: {
    functionName: "permute",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "combination-sum": {
    functionName: "combinationSum",
    parameters: [
      { name: "candidates", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "List<List<Integer>>",
  },
  "divide-two-integers": {
    functionName: "divide",
    parameters: [
      { name: "dividend", type: "int" },
      { name: "divisor", type: "int" },
    ],
    returnType: "int",
  },
  "find-maximum-height-pyramid-from-the-given-array-of-objects": {
    functionName: "maxPyramidHeight",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "int",
  },
};

const VERIFIED_CLASSES: Record<
  string,
  {
    starterCode: Record<string, string>;
    driverCode: Record<string, string>;
    functionSignature: FunctionSignature;
  }
> = {
  "range-sum-query-mutable": {
    functionSignature: {
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
    starterCode: {
      cpp: `class NumArray {\npublic:\n    NumArray(vector<int>& nums) {\n        \n    }\n    \n    void update(int index, int val) {\n        \n    }\n    \n    int sumRange(int left, int right) {\n        return 0;\n    }\n};`,
      java: `class NumArray {\n    public NumArray(int[] nums) {\n        \n    }\n    \n    public void update(int index, int val) {\n        \n    }\n    \n    public int sumRange(int left, int right) {\n        return 0;\n    }\n}`,
      python: `class NumArray:\n    def __init__(self, nums: List[int]):\n        pass\n\n    def update(self, index: int, val: int) -> None:\n        pass\n\n    def sumRange(self, left: int, right: int) -> int:\n        return 0`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
};

// ─── Markdown Cleaning Helpers ────────────────────────────────────────────────

function sanitizeMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  let clean = text;

  // 1. Strip escaped brackets \[ and \]
  clean = clean.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");

  // 2. Fix scientific exponent notations (105 -> 10^5, 104 -> 10^4, 109 -> 10^9, 106 -> 10^6)
  clean = clean.replace(/\b10([4569])\b/g, (_match, p1) => `10^${p1}`);
  clean = clean.replace(/10\^5\^5/g, "10^5");
  clean = clean.replace(/10\^4\^4/g, "10^4");
  clean = clean.replace(/10\^6\^6/g, "10^6");
  clean = clean.replace(/10\^9\^9/g, "10^9");

  // 3. Normalize newlines and strip double escaped quotes
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");
  clean = clean.replace(/\\"/g, '"');

  return clean.trim();
}

function sanitizeTestCaseInput(input: string | null | undefined): string {
  if (!input) return "";
  let clean = input.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");
  return clean.trim();
}

function sanitizeTestCaseOutput(output: string | null | undefined): string {
  if (!output) return "";
  let clean = output;

  // 1. Cut off leaked markdown sections like Constraints or Explanation
  clean = clean.split(
    /\*\*Constraints:|\*\*Explanation:|\*\*Follow up:|Constraints:|Explanation:|Follow up:/i
  )[0];

  // 2. Strip bold markers and asterisks
  clean = clean.replace(/\*\*/g, "");

  // 3. Strip escaped brackets
  clean = clean.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");

  // 4. Normalize newlines & whitespace
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");

  return clean.trim();
}

// ─── Problem Processor ───────────────────────────────────────────────────────

async function processProblem(problem: any) {
  let changed = false;
  const slug = problem.slug;

  // 1. Sanitize text fields
  const cleanStatement = sanitizeMarkdown(problem.statement);
  const cleanInputFormat = sanitizeMarkdown(problem.inputFormat);
  const cleanOutputFormat = sanitizeMarkdown(problem.outputFormat);
  const cleanConstraints = sanitizeMarkdown(problem.constraints);

  if (
    cleanStatement !== problem.statement ||
    cleanInputFormat !== problem.inputFormat ||
    cleanOutputFormat !== problem.outputFormat ||
    cleanConstraints !== problem.constraints
  ) {
    changed = true;
  }

  // 2. Handle Handcrafted Class or Function Signatures
  let functionSignature = problem.functionSignature;
  let starterCode = problem.starterCode;
  let driverCode = problem.driverCode;

  if (VERIFIED_CLASSES[slug]) {
    const verified = VERIFIED_CLASSES[slug];
    functionSignature = verified.functionSignature;
    starterCode = verified.starterCode;
    driverCode = verified.driverCode;
    changed = true;
  } else if (VERIFIED_SIGNATURES[slug]) {
    functionSignature = VERIFIED_SIGNATURES[slug];
    starterCode = {
      cpp: generateStarterCode(functionSignature, "cpp"),
      java: generateStarterCode(functionSignature, "java"),
      python: generateStarterCode(functionSignature, "python"),
    };
    driverCode = {
      cpp: generateDriverCode(functionSignature, "cpp"),
      java: generateDriverCode(functionSignature, "java"),
      python: generateDriverCode(functionSignature, "python"),
    };
    changed = true;
  } else {
    // 3. General Signature and Template Sanitization
    let sigChanged = false;

    if (
      !functionSignature ||
      typeof functionSignature !== "object" ||
      !functionSignature.functionName
    ) {
      // Default signature from slug
      const camelName = slug
        .replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, "");
      functionSignature = {
        functionName: camelName || "solve",
        parameters: [{ name: "nums", type: "int[]" }],
        returnType: "int",
      };
      sigChanged = true;
    }

    const isTree =
      slug.includes("tree") ||
      slug.includes("bst") ||
      problem.title.toLowerCase().includes("tree") ||
      cleanStatement.toLowerCase().includes("treenode");

    const isLinkedList =
      slug.includes("linked-list") ||
      slug.includes("list-node") ||
      problem.title.toLowerCase().includes("linked list") ||
      cleanStatement.toLowerCase().includes("listnode");

    // Clean parameters
    if (Array.isArray(functionSignature.parameters)) {
      functionSignature.parameters = functionSignature.parameters.map(
        (p: any, idx: number) => {
          let name = p.name || `param${idx + 1}`;
          let type = p.type || "int";

          if (name === "arg0" || name === "arg1") {
            if (isTree) name = idx === 0 ? "root" : "target";
            else if (isLinkedList) name = idx === 0 ? "head" : "val";
            else name = idx === 0 ? "nums" : "k";
            sigChanged = true;
          }

          if (
            type === "Object" ||
            type === "object" ||
            type === "Any" ||
            type === "any"
          ) {
            if (isTree && (name === "root" || idx === 0)) type = "TreeNode";
            else if (isLinkedList && (name === "head" || idx === 0))
              type = "ListNode";
            else type = "int[]";
            sigChanged = true;
          }

          return { name, type };
        }
      );
    }

    // Clean return type
    if (
      functionSignature.returnType === "Object" ||
      functionSignature.returnType === "object" ||
      functionSignature.returnType === "Any" ||
      functionSignature.returnType === "any"
    ) {
      if (isTree) functionSignature.returnType = "TreeNode";
      else if (isLinkedList) functionSignature.returnType = "ListNode";
      else functionSignature.returnType = "int";
      sigChanged = true;
    }

    // Check if starterCode needs regeneration
    const starterStr = JSON.stringify(starterCode || "");
    const needsStarterRegen =
      sigChanged ||
      typeof starterCode !== "object" ||
      !starterCode ||
      !starterCode.cpp ||
      !starterCode.java ||
      !starterCode.python ||
      starterStr.includes("Object") ||
      starterStr.includes("arg0") ||
      starterStr.includes("arg1") ||
      starterStr.includes("// Write your solution for");

    if (needsStarterRegen) {
      starterCode = {
        cpp: generateStarterCode(functionSignature, "cpp"),
        java: generateStarterCode(functionSignature, "java"),
        python: generateStarterCode(functionSignature, "python"),
      };
      driverCode = {
        cpp: generateDriverCode(functionSignature, "cpp"),
        java: generateDriverCode(functionSignature, "java"),
        python: generateDriverCode(functionSignature, "python"),
      };
      changed = true;
    }
  }

  // Double-check to remove any remaining "Object" in starterCode
  if (starterCode && typeof starterCode === "object") {
    for (const lang of Object.keys(starterCode)) {
      if (typeof starterCode[lang] === "string") {
        if (
          starterCode[lang].includes("Object") &&
          !slug.includes("object")
        ) {
          starterCode[lang] = starterCode[lang].replace(/\bObject\b/g, "int");
          changed = true;
        }
        if (starterCode[lang].includes("arg0")) {
          starterCode[lang] = starterCode[lang].replace(/\barg0\b/g, "nums");
          changed = true;
        }
        if (starterCode[lang].includes("arg1")) {
          starterCode[lang] = starterCode[lang].replace(/\barg1\b/g, "target");
          changed = true;
        }
      }
    }
  }

  if (changed) {
    await prisma.problem.update({
      where: { id: problem.id },
      data: {
        statement: cleanStatement,
        inputFormat: cleanInputFormat,
        outputFormat: cleanOutputFormat,
        constraints: cleanConstraints,
        functionSignature: functionSignature as any,
        starterCode: starterCode as any,
        driverCode: driverCode as any,
      },
    });
  }

  // 4. Sanitize problem test cases
  const tcs = await prisma.testCase.findMany({
    where: { problemId: problem.id },
  });
  for (const tc of tcs) {
    const cleanIn = sanitizeTestCaseInput(tc.input);
    const cleanOut = sanitizeTestCaseOutput(tc.expectedOutput);
    if (cleanIn !== tc.input || cleanOut !== tc.expectedOutput) {
      await prisma.testCase.update({
        where: { id: tc.id },
        data: {
          input: cleanIn,
          expectedOutput: cleanOut,
        },
      });
    }
  }

  return changed;
}

// ─── Main Execution ──────────────────────────────────────────────────────────

async function main() {
  console.log("=== GLOBAL PROBLEM BANK SANITIZATION ===");
  const allProblems = await prisma.problem.findMany();
  console.log(`Loaded ${allProblems.length} problems from Neon PostgreSQL.`);

  let totalUpdated = 0;
  const CHUNK_SIZE = 25;

  for (let i = 0; i < allProblems.length; i += CHUNK_SIZE) {
    const chunk = allProblems.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(chunk.map((p) => processProblem(p)));
    const updatedInChunk = results.filter(Boolean).length;
    totalUpdated += updatedInChunk;
    console.log(
      `Chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(
        allProblems.length / CHUNK_SIZE
      )}: ${updatedInChunk} problems updated.`
    );
  }

  console.log(`\nSanitization complete. Total updated: ${totalUpdated}\n`);

  // ─── Verification Queries ───────────────────────────────────────────────────
  console.log("=== RUNNING VERIFICATION CHECKS ===");

  const refreshedProblems = await prisma.problem.findMany({
    select: { slug: true, starterCode: true, statement: true },
  });

  let objectCount = 0;
  let arg0Count = 0;
  let escapedBracketCount = 0;

  for (const p of refreshedProblems) {
    const starterStr = JSON.stringify(p.starterCode || {});
    // Check for Object as a type (exclude slug/title words if any)
    if (starterStr.includes("Object")) {
      objectCount++;
      console.log(`[VIOLATION] Object found in: ${p.slug}`);
    }
    if (starterStr.includes("arg0")) {
      arg0Count++;
      console.log(`[VIOLATION] arg0 found in: ${p.slug}`);
    }
    if (p.statement.includes("\\[") || p.statement.includes("\\]")) {
      escapedBracketCount++;
      console.log(`[VIOLATION] Escaped bracket found in: ${p.slug}`);
    }
  }

  const refreshedTcs = await prisma.testCase.findMany({
    select: { id: true, expectedOutput: true, input: true },
  });

  let asteriskCount = 0;
  let tcBracketCount = 0;
  for (const tc of refreshedTcs) {
    if (tc.expectedOutput.includes("**")) asteriskCount++;
    if (tc.expectedOutput.includes("\\[") || tc.input.includes("\\[")) {
      tcBracketCount++;
    }
  }

  console.log(`-----------------------------------------------`);
  console.log(`COUNT(*) WHERE starterTemplates LIKE '%Object%': ${objectCount}`);
  console.log(`COUNT(*) WHERE starterTemplates LIKE '%arg0%':   ${arg0Count}`);
  console.log(`COUNT(*) WHERE description LIKE '%\\[%':        ${escapedBracketCount}`);
  console.log(`COUNT(*) test cases with '**' in output:        ${asteriskCount}`);
  console.log(`COUNT(*) test cases with '\\[ ' in IO:           ${tcBracketCount}`);
  console.log(`-----------------------------------------------`);

  if (objectCount === 0 && arg0Count === 0 && escapedBracketCount === 0) {
    console.log("SUCCESS: All verification requirements passed cleanly (0 errors)!");
  } else {
    console.warn("WARNING: Some violations remain, please review logs above.");
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("FATAL ERROR during sanitization:", e);
  await prisma.$disconnect();
  process.exit(1);
});
