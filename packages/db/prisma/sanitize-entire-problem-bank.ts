import { PrismaClient } from '@prisma/client';
import { generateStarterCode, generateDriverCode } from '@campusoj/shared';

// Patch DATABASE_URL for Neon connection stability
if (!process.env.DATABASE_URL?.includes('pool_timeout')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL + '?connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient();

const HARDCODED_SIGNATURES: Record<string, any> = {
  'count-of-smaller-numbers-after-self': {
    functionName: 'countSmaller',
    parameters: [{ name: 'nums', type: 'int[]' }],
    returnType: 'int[]'
  },
  'divide-two-integers': {
    functionName: 'divide',
    parameters: [
      { name: 'dividend', type: 'int' },
      { name: 'divisor', type: 'int' }
    ],
    returnType: 'int'
  }
};

const HARDCODED_CLASSES: Record<string, any> = {
  'range-sum-query-mutable': {
    starterCode: {
      cpp: "class NumArray {\npublic:\n    NumArray(vector<int>& nums) {\n        \n    }\n    \n    void update(int index, int val) {\n        \n    }\n    \n    int sumRange(int left, int right) {\n        \n    }\n};",
      java: "class NumArray {\n    public NumArray(int[] nums) {\n        \n    }\n    \n    public void update(int index, int val) {\n        \n    }\n    \n    public int sumRange(int left, int right) {\n        return 0;\n    }\n}",
      python: "class NumArray:\n    def __init__(self, nums: List[int]):\n        pass\n\n    def update(self, index: int, val: int) -> None:\n        pass\n\n    def sumRange(self, left: int, right: int) -> int:\n        return 0"
    },
    // Dummy driver code since we don't support custom class evaluation well yet.
    driverCode: {
      cpp: "int main() { return 0; }",
      java: "public class Main { public static void main(String[] args) {} }",
      python: "if __name__ == '__main__':\n    pass"
    }
  }
};

function fixMarkdown(text: string | null): string {
  if (!text) return "";
  let clean = text.replace(/\\\\\[/g, '[').replace(/\\\\\]/g, ']');
  
  // Fix exponents (104, 105, 106, 109) -> 10^4, etc
  clean = clean.replace(/\b10([4569])\b/g, (match, p1) => `10^${p1}`);
  
  // Remove \r
  clean = clean.replace(/\r/g, '');
  
  return clean.trim();
}

function fixTestCase(text: string | null): string {
  if (!text) return "";
  let clean = text.replace(/\\\\\[/g, '[').replace(/\\\\\]/g, ']');
  return clean.trim();
}

async function processProblem(problem: any) {
  let statement = fixMarkdown(problem.statement);
  let updated = false;
  let starterCode = problem.starterCode;
  let driverCode = problem.driverCode;
  let functionSignature = problem.functionSignature;

  // 1. Check Hardcoded Signatures
  if (HARDCODED_SIGNATURES[problem.slug]) {
    functionSignature = HARDCODED_SIGNATURES[problem.slug];
    starterCode = generateStarterCode(functionSignature as any);
    driverCode = generateDriverCode(functionSignature as any);
    updated = true;
  }
  
  // 2. Check Hardcoded Classes
  if (HARDCODED_CLASSES[problem.slug]) {
    starterCode = HARDCODED_CLASSES[problem.slug].starterCode;
    driverCode = HARDCODED_CLASSES[problem.slug].driverCode;
    updated = true;
  }

  // 3. Fix Tree & Linked List dummy placeholders in signature if they somehow have Object
  if (functionSignature && functionSignature.parameters) {
    let sigChanged = false;
    for (let p of functionSignature.parameters) {
      if (p.type === 'Object' || p.type === 'object') {
        if (statement.toLowerCase().includes('tree')) {
          p.type = 'TreeNode';
          sigChanged = true;
        } else if (statement.toLowerCase().includes('list')) {
          p.type = 'ListNode';
          sigChanged = true;
        } else {
          p.type = 'int'; // fallback
          sigChanged = true;
        }
      }
      if (p.name === 'arg0') { p.name = 'root'; sigChanged = true; }
      if (p.name === 'arg1') { p.name = 'target'; sigChanged = true; }
    }
    if (sigChanged && !HARDCODED_CLASSES[problem.slug]) {
      starterCode = generateStarterCode(functionSignature as any);
      driverCode = generateDriverCode(functionSignature as any);
      updated = true;
    }
  }

  if (statement !== problem.statement) updated = true;

  if (updated) {
    await prisma.problem.update({
      where: { id: problem.id },
      data: {
        statement,
        functionSignature: functionSignature as any,
        starterCode: starterCode as any,
        driverCode: driverCode as any
      }
    });
  }

  // Process testcases
  const tcs = await prisma.testCase.findMany({ where: { problemId: problem.id } });
  for (const tc of tcs) {
    const cleanIn = fixTestCase(tc.input);
    const cleanOut = fixTestCase(tc.expectedOutput);
    if (cleanIn !== tc.input || cleanOut !== tc.expectedOutput) {
      await prisma.testCase.update({
        where: { id: tc.id },
        data: { input: cleanIn, expectedOutput: cleanOut }
      });
    }
  }

  return updated;
}

async function main() {
  const problems = await prisma.problem.findMany();
  console.log(`Found ${problems.length} problems. Starting sanitization...`);

  let updatedCount = 0;
  const CHUNK_SIZE = 25;
  for (let i = 0; i < problems.length; i += CHUNK_SIZE) {
    const chunk = problems.slice(i, i + CHUNK_SIZE);
    
    const results = await Promise.all(chunk.map(p => processProblem(p)));
    updatedCount += results.filter(r => r).length;
    
    console.log(`Processed chunk ${i / CHUNK_SIZE + 1} / ${Math.ceil(problems.length / CHUNK_SIZE)}`);
  }

  console.log(`\n--- SANITIZATION COMPLETE ---`);
  console.log(`Total Problems Updated: ${updatedCount}`);
  
  // Verification Query
  const badProblems = await prisma.problem.findMany({
    where: {
      OR: [
        { statement: { contains: '\\[' } },
        { statement: { contains: '105 ' } } // bounded by space
      ]
    }
  });

  const allProblems = await prisma.problem.findMany();
  let objCount = 0;
  for (let p of allProblems) {
    const s = JSON.stringify(p.starterCode || {});
    if (s.includes('Object') || s.includes('arg0') || s.includes('dummy')) {
      objCount++;
    }
  }

  console.log(`Verification: ${badProblems.length} problems still contain raw artifacts (\\\[ or 105).`);
  console.log(`Verification: ${objCount} problems contain 'Object', 'arg0', or 'dummy' in starter code.`);

  await prisma.$disconnect();
  process.exit(0);
}

main();
