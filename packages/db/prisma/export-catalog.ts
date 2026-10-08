import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
if (!process.env.DATABASE_URL?.includes('connect_timeout')) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany({
    include: { testCases: true },
    orderBy: { id: 'asc' }
  });

  const catalog = problems.map(p => {
    return {
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      description: p.statement,
      paramTypes: (p.functionSignature as any)?.parameters?.map((param: any) => param.type) || ['number[]'],
      returnType: (p.functionSignature as any)?.returnType || 'int',
      functionSignature: p.functionSignature,
      starterTemplates: p.starterCode,
      driverTemplates: p.driverCode,
      testCases: p.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample,
        isHidden: tc.isHidden,
        weight: tc.weight
      }))
    };
  });

  const dirPath = path.join(__dirname, 'data');
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  
  const dataPath = path.join(dirPath, 'curated-sheet-problems.json');
  fs.writeFileSync(dataPath, JSON.stringify(catalog, null, 2));
  console.log(`Exported ${catalog.length} problems to ${dataPath}`);

  await prisma.$disconnect();
}

main().catch(console.error);
