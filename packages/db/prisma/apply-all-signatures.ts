import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import {
  FunctionSignature,
  generateStarterCode,
  generateDriverCode,
} from '../../shared/src/codeWrapper';

let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log('🚀 Starting master signature & template synchronization across all 378 problems...');

  const RESOLVED_PATH = path.resolve(__dirname, 'master-resolved-signatures.json');
  if (!fs.existsSync(RESOLVED_PATH)) {
    throw new Error('master-resolved-signatures.json not found!');
  }
  const resolvedSignatures: Record<string, FunctionSignature> = JSON.parse(
    fs.readFileSync(RESOLVED_PATH, 'utf8')
  );

  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  console.log(`Found ${problems.length} problems in database.`);

  let updatedCount = 0;
  let missingSigCount = 0;
  const batchSize = 25;

  for (let i = 0; i < problems.length; i += batchSize) {
    const batch = problems.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (p) => {
        const sig = resolvedSignatures[p.slug];
        if (!sig) {
          console.warn(`⚠️ No resolved signature found for slug: ${p.slug}`);
          missingSigCount++;
          return;
        }

        const starterCode = {
          cpp: generateStarterCode(sig, 'cpp'),
          'c++': generateStarterCode(sig, 'cpp'),
          java: generateStarterCode(sig, 'java'),
          python: generateStarterCode(sig, 'python'),
          python3: generateStarterCode(sig, 'python3'),
          javascript: generateStarterCode(sig, 'javascript'),
        };

        const driverCode = {
          cpp: generateDriverCode(sig, 'cpp'),
          'c++': generateDriverCode(sig, 'cpp'),
          java: generateDriverCode(sig, 'java'),
          python: generateDriverCode(sig, 'python'),
          python3: generateDriverCode(sig, 'python3'),
        };

        await prisma.problem.update({
          where: { id: p.id },
          data: {
            functionSignature: sig as any,
            starterCode: starterCode as any,
            driverCode: driverCode as any,
          },
        });

        updatedCount++;
      })
    );
    process.stdout.write(`  Updated ${Math.min(i + batchSize, problems.length)} / ${problems.length} problems...\r`);
  }

  console.log(`\n✅ Database update complete! Successfully updated ${updatedCount} problems.`);
  if (missingSigCount > 0) {
    console.warn(`⚠️ ${missingSigCount} problems were missing signatures.`);
  }

  // Also synchronize curated-sheet-problems.json
  const CURATED_PATH = path.resolve(__dirname, 'data/curated-sheet-problems.json');
  if (fs.existsSync(CURATED_PATH)) {
    console.log('🔄 Synchronizing data/curated-sheet-problems.json catalog...');
    const curatedData: any[] = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8'));
    let syncedCatalogCount = 0;

    for (const item of curatedData) {
      const sig = resolvedSignatures[item.slug];
      if (sig) {
        item.functionSignature = sig;
        item.starterTemplates = {
          cpp: generateStarterCode(sig, 'cpp'),
          'c++': generateStarterCode(sig, 'cpp'),
          java: generateStarterCode(sig, 'java'),
          python: generateStarterCode(sig, 'python'),
          python3: generateStarterCode(sig, 'python3'),
          javascript: generateStarterCode(sig, 'javascript'),
        };
        item.driverTemplates = {
          cpp: generateDriverCode(sig, 'cpp'),
          'c++': generateDriverCode(sig, 'cpp'),
          java: generateDriverCode(sig, 'java'),
          python: generateDriverCode(sig, 'python'),
          python3: generateDriverCode(sig, 'python3'),
        };
        syncedCatalogCount++;
      }
    }

    fs.writeFileSync(CURATED_PATH, JSON.stringify(curatedData, null, 2));
    console.log(`✅ Synced ${syncedCatalogCount} problems in curated-sheet-problems.json.`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error executing apply-all-signatures:', e);
  await prisma.$disconnect();
  process.exit(1);
});
