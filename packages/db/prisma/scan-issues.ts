import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function check() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      statement: true,
      starterCode: true,
      functionSignature: true,
    },
  });

  console.log('Total problems in DB:', problems.length);
  let htmlArtifacts = 0;
  let mashedExamples = 0;
  let leakedInitJava = 0;
  let leakedInitCpp = 0;
  const leakedInitSlugs: string[] = [];
  const htmlArtifactSlugs: string[] = [];
  const mashedSlugs: string[] = [];

  for (const p of problems) {
    if (
      /&(?:nbsp|lt|gt|le|ge|amp|quot|#39|#43|#34);|<(?:sup|sub|code|strong|b|em|i|p|pre|font|span)[\s>]/i.test(
        p.statement
      )
    ) {
      htmlArtifacts++;
      if (htmlArtifactSlugs.length < 5) htmlArtifactSlugs.push(p.slug);
    }
    if (
      /[^\s#*>]Example\s+\d+:/i.test(p.statement) ||
      /Example\s+\d+:[^\S\r\n]*```/i.test(p.statement) ||
      /```[^\S\r\n]*\*\*Input/i.test(p.statement)
    ) {
      mashedExamples++;
      if (mashedSlugs.length < 5) mashedSlugs.push(p.slug);
    }
    const javaCode = (p.starterCode as any)?.java || '';
    if (javaCode.includes('__init__')) {
      leakedInitJava++;
      leakedInitSlugs.push(p.slug);
    }
    const cppCode = (p.starterCode as any)?.cpp || '';
    if (cppCode.includes('__init__')) {
      leakedInitCpp++;
    }
  }

  console.log('Problems with HTML artifacts:', htmlArtifacts, htmlArtifactSlugs);
  console.log('Problems with mashed Example headers / code fences:', mashedExamples, mashedSlugs);
  console.log('Problems with leaked __init__ in Java:', leakedInitJava, leakedInitSlugs);
  console.log('Problems with leaked __init__ in C++:', leakedInitCpp);

  // Check sample problems
  const sampleSlugs = ['reverse-linked-list', 'maximum-subarray', 'implement-queue-using-stacks'];
  for (const s of sampleSlugs) {
    const sp = await prisma.problem.findUnique({ where: { slug: s } });
    console.log(`\n--- ${sp?.title} (${s}) ---`);
    console.log('FunctionSignature:', JSON.stringify(sp?.functionSignature));
    console.log('Java Starter Stub:\n', (sp?.starterCode as any)?.java?.slice(0, 300));
  }

  await prisma.$disconnect();
}

check().catch(console.error);

