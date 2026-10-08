import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import fs from 'fs';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function main() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      statement: true,
      tags: true,
      functionSignature: true,
      testCases: {
        select: {
          input: true,
          expectedOutput: true,
          isSample: true,
        },
      },
    },
    orderBy: { title: 'asc' },
  });

  const placeholders: any[] = [];
  const valid: any[] = [];

  for (const p of problems) {
    const isPh =
      p.statement.includes('The algorithm processes the input elements') ||
      p.statement.includes('Given the challenge under') ||
      p.statement.includes('optimal state evaluation') ||
      p.statement.includes('Solve the problem efficiently adhering to standard time');

    const item = {
      id: p.id,
      title: p.title,
      slug: p.slug,
      tags: p.tags,
      tcCount: p.testCases.length,
      sampleInput: p.testCases.find((t) => t.isSample)?.input || '',
      sampleOutput: p.testCases.find((t) => t.isSample)?.expectedOutput || '',
      signature: p.functionSignature,
    };

    if (isPh) {
      placeholders.push(item);
    } else {
      valid.push(item);
    }
  }

  console.log(`Total problems: ${problems.length}`);
  console.log(`Valid: ${valid.length}`);
  console.log(`Placeholders: ${placeholders.length}`);

  fs.writeFileSync(
    path.resolve(__dirname, 'placeholder-report.json'),
    JSON.stringify({ total: problems.length, placeholders, validCount: valid.length }, null, 2)
  );
  console.log('Saved placeholder-report.json');

  await prisma.$disconnect();
}

main().catch(console.error);
