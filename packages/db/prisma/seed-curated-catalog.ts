import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { generateStarterCode, generateDriverCode } from '../../shared/src/codeWrapper';

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'data', 'curated-sheet-problems.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`Catalog not found at ${dataPath}`);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Loaded ${catalog.length} problems from catalog.`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of catalog) {
    try {
      if (!item.returnType || !item.paramTypes) {
         console.warn(`[${item.slug}] Missing paramTypes/returnType. Skipping to avoid corruption.`);
         errorCount++;
         continue;
      }

      // Generate accurate driver and starter code using our shared lib and the verified signature
      const signature = {
        functionName: item.functionSignature?.functionName || item.slug.replace(/-./g, (m: string) => m[1].toUpperCase()),
        returnType: item.returnType,
        parameters: item.paramTypes.map((t: string, i: number) => ({ name: `arg${i}`, type: t }))
      };
      
      const starterTemplates = {
        cpp: generateStarterCode(signature as any, 'cpp'),
        java: generateStarterCode(signature as any, 'java'),
        python3: generateStarterCode(signature as any, 'python3')
      };
      
      const driverTemplates = {
        cpp: generateDriverCode(signature as any, 'cpp'),
        java: generateDriverCode(signature as any, 'java'),
        python3: generateDriverCode(signature as any, 'python3')
      };

      // Update Problem
      const problem = await prisma.problem.update({
        where: { slug: item.slug },
        data: {
          title: item.title,
          difficulty: item.difficulty,
          statement: item.description,
          functionSignature: signature as any,
          starterCode: starterTemplates as any,
          driverCode: driverTemplates as any,
        }
      });

      // Overwrite test cases
      await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
      
      if (item.testCases && item.testCases.length > 0) {
        await prisma.testCase.createMany({
          data: item.testCases.map((tc: any) => ({
            problemId: problem.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
            isHidden: tc.isHidden,
            weight: tc.weight || 1
          }))
        });
      }

      console.log(`✅ Seeded ${item.slug}`);
      successCount++;
    } catch (e) {
      console.error(`❌ Error seeding ${item.slug}:`, e);
      errorCount++;
    }
  }

  console.log(`\nSeeding complete. Success: ${successCount}, Errors: ${errorCount}`);
  
  // Validation Report
  const bogusCount = await prisma.problem.count({
    where: {
      OR: [
        { statement: { contains: 'The algorithm processes the input elements' } },
        { statement: { contains: 'Given the challenge under' } },
        { statement: { contains: 'Given the level order traversal array' } },
        { statement: { contains: 'Given a graph with `n` vertices' } }
      ]
    }
  });

  console.log(`\n=== Validation Report ===`);
  console.log(`Records with dummy boilerplate: ${bogusCount}`);
  if (bogusCount > 0) {
    console.warn(`WARNING: ${bogusCount} problems still have dummy descriptions!`);
  } else {
    console.log(`SUCCESS: 0 records with dummy descriptions.`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
