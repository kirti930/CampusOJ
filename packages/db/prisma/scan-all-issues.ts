import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany({
    include: { testCases: true },
    orderBy: { slug: 'asc' },
  });

  console.log(`Total problems in database: ${problems.length}`);

  let tabBoxCount = 0;
  const tabBoxSlugs: string[] = [];

  let starsInFencesCount = 0;
  const starsInFencesSlugs: string[] = [];

  let dummyTcCount = 0;
  const dummyTcSlugs: string[] = [];

  let undeclaredArgCount = 0;
  const undeclaredArgSlugs: string[] = [];

  let stubDriverCount = 0;
  const stubDriverSlugs: string[] = [];

  for (const p of problems) {
    const stmt = p.statement || '';

    // Check tabs causing indented code blocks
    if (stmt.includes('\t-') || stmt.includes('\t*') || stmt.includes('\t`') || /\n\t/.test(stmt) || /\n {4,}[-*]/.test(stmt)) {
      tabBoxCount++;
      tabBoxSlugs.push(p.slug);
    }

    // Check stars inside code blocks
    const codeFenceRegex = /```[\s\S]*?```/g;
    let match;
    let hasStarsInFence = false;
    while ((match = codeFenceRegex.exec(stmt)) !== null) {
      if (match[0].includes('**')) {
        hasStarsInFence = true;
        break;
      }
    }
    if (hasStarsInFence) {
      starsInFencesCount++;
      starsInFencesSlugs.push(p.slug);
    }

    // Check dummy testcases
    const hasDummyTc = p.testCases.some((tc) =>
      tc.input.includes('dummy_input') || tc.expectedOutput.includes('dummy_output')
    );
    if (hasDummyTc) {
      dummyTcCount++;
      dummyTcSlugs.push(p.slug);
    }

    // Check driver issues
    const driverCpp = (p.driverCode as any)?.cpp || '';
    if (driverCpp.includes('arg_0') && !driverCpp.includes('arg_0 =') && !driverCpp.includes('arg_0;') && !driverCpp.includes('arg_0{')) {
      // arg_0 is used but not defined/declared
      undeclaredArgCount++;
      undeclaredArgSlugs.push(p.slug);
    } else if (driverCpp.trim() === 'int main() { return 0; }' || driverCpp.trim() === '') {
      stubDriverCount++;
      stubDriverSlugs.push(p.slug);
    }
  }

  console.log(`\n=== SCAN RESULTS ===`);
  console.log(`Problems with tab-induced code boxes: ${tabBoxCount}`);
  console.log(`  Sample slugs:`, tabBoxSlugs.slice(0, 10));

  console.log(`\nProblems with ** stars inside code blocks: ${starsInFencesCount}`);
  console.log(`  Sample slugs:`, starsInFencesSlugs.slice(0, 10));

  console.log(`\nProblems with dummy test cases: ${dummyTcCount}`);
  console.log(`  Sample slugs:`, dummyTcSlugs.slice(0, 10));

  console.log(`\nProblems with undeclared arg_0 in C++ driver: ${undeclaredArgCount}`);
  console.log(`  Sample slugs:`, undeclaredArgSlugs.slice(0, 10));

  console.log(`\nProblems with stub / empty driver: ${stubDriverCount}`);
  console.log(`  Sample slugs:`, stubDriverSlugs.slice(0, 10));
}

main().catch(console.error).finally(() => prisma.$disconnect());
