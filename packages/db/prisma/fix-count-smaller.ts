import { PrismaClient } from '@prisma/client';
import { 
  generateStarterCode, 
  generateDriverCode 
} from '@campusoj/shared';

if (!process.env.DATABASE_URL?.includes('pool_timeout')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL + '?connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient();

async function fixProblem() {
  const problemId = 'dbad99fe-1e5e-40bd-a83f-20c7e142997f';
  
  // Verify problem exists
  const problem = await prisma.problem.findUnique({
    where: { slug: 'count-of-smaller-numbers-after-self' },
    include: { testCases: true }
  });

  if (!problem) {
    console.error("Problem not found!");
    return;
  }
  console.log(`Found problem: ${problem.title}`);

  // 1. Update functionSignature and returnType
  const functionSignature = {
    parameters: [
      { name: 'nums', type: 'number[]' }
    ],
    returnType: 'number[]',
    functionName: 'countSmaller'
  };

  const starterTemplates = generateStarterCode(functionSignature);
  const driverTemplates = generateDriverCode(functionSignature);

  await prisma.problem.update({
    where: { id: problem.id },
    data: {
      functionSignature: functionSignature as any,
      starterCode: starterTemplates as any,
      driverCode: driverTemplates as any
    }
  });
  console.log("Updated problem signature and templates.");

  // 2. Fix test cases
  // Delete existing corrupted test cases
  await prisma.testCase.deleteMany({
    where: { problemId: problem.id }
  });

  // Re-create the correct test cases
  const correctTestCases = [
    {
      input: "[5,2,6,1]",
      expectedOutput: "[2, 1, 1, 0]",
      isSample: true,
      isHidden: false,
      weight: 10
    },
    {
      input: "[-1]",
      expectedOutput: "[0]",
      isSample: true,
      isHidden: false,
      weight: 10
    },
    {
      input: "[-1,-1]",
      expectedOutput: "[0, 0]",
      isSample: true,
      isHidden: false,
      weight: 10
    },
    {
      input: "[2, 0, 1]",
      expectedOutput: "[2, 0, 0]",
      isSample: false,
      isHidden: true,
      weight: 20
    },
    {
      input: "[26, 78, 27, 100, 33, 67, 90, 23, 66, 5, 38, 7, 35, 23, 52, 22, 83, 51, 98, 69, 81, 32, 78, 28, 94, 13, 2, 97, 3, 76, 99, 51, 9, 21, 84, 66, 65, 36, 100, 41]",
      expectedOutput: "[10, 27, 9, 34, 12, 22, 28, 8, 19, 2, 12, 2, 9, 6, 12, 5, 17, 9, 19, 12, 14, 6, 12, 5, 12, 3, 0, 10, 0, 7, 8, 4, 0, 0, 4, 3, 2, 0, 1, 0]",
      isSample: false,
      isHidden: true,
      weight: 50
    }
  ];

  for (const tc of correctTestCases) {
    await prisma.testCase.create({
      data: {
        ...tc,
        problemId: problem.id
      }
    });
  }
  
  console.log("Re-created correct test cases.");
}

fixProblem()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
