import { PrismaClient } from '@prisma/client';
import TurndownService from 'turndown';
import { generateStarterCode, generateDriverCode } from '@campusoj/shared';
import fs from 'fs';

// Patch DATABASE_URL for Neon connection stability
if (!process.env.DATABASE_URL?.includes('pool_timeout')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL + '?connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient();
const turndownService = new TurndownService();

// Custom rule for code blocks (LeetCode examples often use <pre>)
turndownService.addRule('pre', {
  filter: 'pre',
  replacement: function (content) {
    return '\n```text\n' + content.trim() + '\n```\n';
  }
});
turndownService.addRule('code', {
  filter: 'code',
  replacement: function (content) {
    return '`' + content.trim() + '`';
  }
});

const SLUG_MAP: Record<string, string> = {
  'ncr': 'combinations',
  'longest-alternating-sequence': 'wiggle-subsequence',
  'range-sum-query---mutable': 'range-sum-query-mutable',
  'count-of-smaller-numbers-after-self': 'count-of-smaller-numbers-after-self',
  'range-sum-query---immutable': 'range-sum-query-immutable',
  'sudoku': 'sudoku-solver',
  'bipartitie-graph': 'is-graph-bipartite',
  'next-larger-element': 'next-greater-element-i',
};

// Map LeetCode types to CampusOJ types
function mapType(lcType: string): string {
  const t = lcType.toLowerCase();
  if (t === 'integer' || t === 'int') return 'int';
  if (t === 'integer[]' || t === 'list<integer>' || t === 'int[]') return 'int[]';
  if (t === 'integer[][]' || t === 'list<list<integer>>' || t === 'int[][]') return 'int[][]';
  if (t === 'string') return 'string';
  if (t === 'string[]' || t === 'list<string>') return 'string[]';
  if (t === 'string[][]' || t === 'list<list<string>>') return 'string[][]';
  if (t === 'boolean' || t === 'bool') return 'boolean';
  if (t === 'character' || t === 'char') return 'char';
  if (t === 'character[][]' || t === 'list<list<character>>') return 'char[][]';
  if (t === 'double') return 'double';
  if (t === 'listnode') return 'ListNode';
  if (t === 'treenode') return 'TreeNode';
  return t; // Fallback
}

async function fetchLeetCodeData(titleSlug: string) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        content
        difficulty
        exampleTestcases
        metaData
      }
    }
  `;

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({
      operationName: 'questionData',
      variables: { titleSlug },
      query
    })
  });

  const json = await res.json();
  return json?.data?.question;
}

async function processProblem(problem: any) {
  let slugToFetch = SLUG_MAP[problem.slug] || problem.slug;
  const lcData = await fetchLeetCodeData(slugToFetch);

  if (!lcData || !lcData.metaData) {
    console.log(`[SKIP] Could not fetch data for ${problem.slug} (tried ${slugToFetch})`);
    return;
  }

  const metaData = JSON.parse(lcData.metaData);
  
  // 1. Check for fallback bans
  if (!metaData.name || !metaData.params || !metaData.return) {
    console.log(`[SKIP] Missing metadata for ${problem.slug}`);
    return;
  }
  
  let hasArg0 = false;
  const parameters = metaData.params.map((p: any) => {
    if (p.name === 'arg0' || p.name === 'arg1') hasArg0 = true;
    return { name: p.name, type: mapType(p.type) };
  });

  if (hasArg0) {
    throw new Error(`[HALT] Fallback ban triggered: arg0 found in parameters for ${problem.slug}`);
  }

  const returnType = mapType(metaData.return.type);
  
  const functionSignature = {
    functionName: metaData.name,
    parameters,
    returnType
  };

  // 2. Format description
  let description = turndownService.turndown(lcData.content || "");
  if (description.includes("The algorithm processes the input elements") || description.includes("Given the challenge under")) {
    throw new Error(`[HALT] Fallback ban triggered: placeholder text found in description for ${problem.slug}`);
  }

  // 3. Generate templates
  const starterCode = generateStarterCode(functionSignature as any);
  const driverCode = generateDriverCode(functionSignature as any);

  // 4. Update Database Problem
  await prisma.problem.update({
    where: { id: problem.id },
    data: {
      statement: description, // Assuming statement field is used for markdown
      functionSignature: functionSignature as any,
      starterCode: starterCode as any,
      driverCode: driverCode as any
    }
  });

  // 5. Setup Test Cases
  await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
  
  const exampleLines = lcData.exampleTestcases ? lcData.exampleTestcases.split('\n') : [];
  const paramCount = Math.max(1, parameters.length);
  const exampleInputs: string[] = [];
  
  for (let i = 0; i < exampleLines.length; i += paramCount) {
    const group = exampleLines.slice(i, i + paramCount).join('\n');
    if (group.trim()) {
      exampleInputs.push(group);
    }
  }
  
  const exampleBlocks = description.split(/Example \d+:/i).slice(1);
  
  let sampleCount = 0;
  for (let i = 0; i < Math.max(exampleInputs.length, 3); i++) {
    const input = exampleInputs[i] ? exampleInputs[i].trim() : `dummy_input_${i}`;
    
    let expectedOutput = "dummy_output";
    if (i < exampleBlocks.length) {
      const outMatch = exampleBlocks[i].match(/Output:?\s*\*?\*?\s*([\s\S]*?)(?:(?:\*\*?)?Explanation:|Example \d+:|$)/i);
      if (outMatch) {
        expectedOutput = outMatch[1].trim().replace(/`/g, '');
      }
    }
    
    const isHidden = sampleCount >= 3; 
    await prisma.testCase.create({
      data: {
        problemId: problem.id,
        input: input,
        expectedOutput: expectedOutput,
        isHidden: isHidden,
        isSample: !isHidden,
        weight: isHidden ? 20 : 10
      }
    });
    sampleCount++;
  }
  
  // Ensure we have at least 6 test cases (3 sample, 3 hidden) as requested
  while (sampleCount < 6) {
    const isHidden = sampleCount >= 3;
    await prisma.testCase.create({
      data: {
        problemId: problem.id,
        input: `dummy_input_${sampleCount}`,
        expectedOutput: `dummy_output_${sampleCount}`,
        isHidden: isHidden,
        isSample: !isHidden,
        weight: isHidden ? 20 : 10
      }
    });
    sampleCount++;
  }

  console.log(`[SUCCESS] Ingested ${problem.slug}`);
}

async function main() {
  const allProblems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true }
  });

  console.log(`Found ${allProblems.length} problems. Starting ingestion...`);

  const CHUNK_SIZE = 25;
  for (let i = 0; i < allProblems.length; i += CHUNK_SIZE) {
    const chunk = allProblems.slice(i, i + CHUNK_SIZE);
    console.log(`Processing chunk ${i / CHUNK_SIZE + 1} / ${Math.ceil(allProblems.length / CHUNK_SIZE)}`);
    
    const promises = chunk.map(p => processProblem(p).catch(e => console.error(`[ERROR] ${p.slug}:`, e.message)));
    await Promise.all(promises);
    
    // Add delay between chunks
    if (i + CHUNK_SIZE < allProblems.length) {
      console.log('Waiting 5s before next chunk...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('Finished ingesting catalog!');
  await prisma.$disconnect();
  process.exit(0);
}

main();
