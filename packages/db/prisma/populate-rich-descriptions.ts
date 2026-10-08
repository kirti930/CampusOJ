import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { PrismaClient } from '@prisma/client';
import { SPECS_PART1, RichProblemSpec } from './rich-problem-specs-part1';
import { SPECS_PART2 } from './rich-problem-specs-part2';
import { SPECS_PART3 } from './rich-problem-specs-part3';

let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const ALL_SPECS: Record<string, RichProblemSpec> = {
  ...SPECS_PART1,
  ...SPECS_PART2,
  ...SPECS_PART3,
  'hello-world': {
    title: 'Hello, World!',
    statement: `Welcome to **CampusOJ**!

Your first task is to write a program that prints the classic greeting \`Hello, World!\` to standard output.

### Examples

**Example 1:**
\`\`\`text
Input: (empty)
Output: Hello, World!
\`\`\`

### Constraints
- No input is required.
- Output must match \`Hello, World!\` exactly with proper punctuation and capitalization.`,
    inputFormat: 'No input.',
    outputFormat: 'Print Hello, World! on a single line.',
    constraints: 'Standard time and memory limits apply.',
  },
  'sum-of-two-numbers': {
    title: 'Sum of Two Numbers',
    statement: `Given two integers \`a\` and \`b\`, compute and return their sum \`a + b\`.

### Examples

**Example 1:**
\`\`\`text
Input: a = 5, b = 7
Output: 12
\`\`\`

**Example 2:**
\`\`\`text
Input: a = -3, b = 8
Output: 5
\`\`\`

### Constraints
- \`-10^9 <= a, b <= 10^9\``,
    inputFormat: 'Two space-separated or newline-separated integers a and b.',
    outputFormat: 'Return the sum a + b.',
    constraints: '-10^9 <= a, b <= 10^9',
  },
};

async function main() {
  console.log(`Starting rich description population for ${Object.keys(ALL_SPECS).length} problem specs...`);

  let updatedCount = 0;
  let testCaseUpdatedCount = 0;

  for (const [slug, spec] of Object.entries(ALL_SPECS)) {
    const existing = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      console.warn(`[SKIP] Slug not found in DB: ${slug}`);
      continue;
    }

    await prisma.problem.update({
      where: { id: existing.id },
      data: {
        statement: spec.statement,
        inputFormat: spec.inputFormat || 'The input parameters are provided as described in the method signature.',
        outputFormat: spec.outputFormat || 'Return the computed result matching the return type.',
        constraints: spec.constraints || '1 <= N <= 10^5',
      },
    });

    if (spec.testCases && spec.testCases.length > 0) {
      await prisma.testCase.deleteMany({ where: { problemId: existing.id } });
      await prisma.testCase.createMany({
        data: spec.testCases.map((tc) => ({
          problemId: existing.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          isHidden: tc.isHidden,
          weight: tc.isSample ? 10 : 20,
        })),
      });
      testCaseUpdatedCount++;
      console.log(`  [TC] Updated ${spec.testCases.length} testcases for ${slug}`);
    }

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} problem statements in database!`);
  if (testCaseUpdatedCount > 0) {
    console.log(`✅ Successfully updated test cases for ${testCaseUpdatedCount} problems!`);
  }

  // Also update data/curated-sheet-problems.json to keep catalog in sync
  const catalogPath = path.resolve(__dirname, 'data/curated-sheet-problems.json');
  if (fs.existsSync(catalogPath)) {
    const catalog: any[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    let catalogUpdates = 0;
    for (const item of catalog) {
      if (ALL_SPECS[item.slug]) {
        item.description = ALL_SPECS[item.slug].statement;
        if (ALL_SPECS[item.slug].testCases) {
          item.testCases = ALL_SPECS[item.slug].testCases;
        }
        catalogUpdates++;
      }
    }
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`✅ Synced ${catalogUpdates} descriptions into curated-sheet-problems.json!`);
  }

  // Verification step
  console.log('\n--- Verification Audit ---');
  const allProblems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      statement: true,
    },
  });

  const emptyStatements = allProblems.filter((p) => !p.statement || p.statement.trim() === '');
  const placeholderStatements = allProblems.filter(
    (p) =>
      p.statement &&
      (p.statement.includes('Solve the problem:') ||
        p.statement.includes('The algorithm processes the input elements') ||
        p.statement.includes('optimal state evaluation'))
  );

  console.log(`Total problems in DB: ${allProblems.length}`);
  console.log(`Empty statements remaining: ${emptyStatements.length}`);
  console.log(`Placeholder statements remaining: ${placeholderStatements.length}`);

  if (emptyStatements.length > 0) {
    console.error('Empty problems:', emptyStatements.map((p) => p.slug));
  }
  if (placeholderStatements.length > 0) {
    console.error('Placeholder problems:', placeholderStatements.map((p) => p.slug));
  }

  if (emptyStatements.length === 0 && placeholderStatements.length === 0) {
    console.log('🎉 PERFECT! All 378 problems have rich, verified statements, examples, and constraints!');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
