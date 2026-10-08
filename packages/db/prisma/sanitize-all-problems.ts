import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { PrismaClient } from '@prisma/client';
import {
  generateStarterCode,
  generateDriverCode,
  FunctionSignature,
  DataType,
  FunctionParameter,
  ClassMethod,
} from '../../../packages/shared/src/codeWrapper';

let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const cache = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'lc-cache.json'), 'utf8')
);

// Known Design Problem outputs for sample testcases
const KNOWN_DESIGN_OUTPUTS: Record<string, { input: string; output: string }> = {
  'range-sum-query-immutable': {
    input: '["NumArray", "sumRange", "sumRange", "sumRange"]\n[[[-2, 0, 3, -5, 2, -1]], [0, 2], [2, 5], [0, 5]]',
    output: '[null, 1, -1, -3]',
  },
  'range-sum-query-mutable': {
    input: '["NumArray", "sumRange", "update", "sumRange"]\n[[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]',
    output: '[null, 9, null, 8]',
  },
  'implement-queue-using-stacks': {
    input: '["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]',
    output: '[null, null, null, 1, 1, false]',
  },
  'implement-stack-using-queues': {
    input: '["MyStack", "push", "push", "top", "pop", "empty"]\n[[], [1], [2], [], [], []]',
    output: '[null, null, null, 2, 2, false]',
  },
  'kth-largest-element-in-a-stream': {
    input: '["KthLargest", "add", "add", "add", "add", "add"]\n[[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]',
    output: '[null, 4, 5, 5, 8, 8]',
  },
  'find-median-from-data-stream': {
    input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]\n[[], [1], [2], [], [3], []]',
    output: '[null, null, null, 1.5, null, 2.0]',
  },
};

export function cleanTextToMarkdown(raw: string): string {
  if (!raw) return '';
  let s = raw;

  // 1. Math, exponents, subscripts
  s = s.replace(/<sup>(.*?)<\/sup>/gi, '^$1');
  s = s.replace(/<sub>(.*?)<\/sub>/gi, '_$1');

  // 2. Decode HTML entities
  s = s.replace(/&nbsp;/gi, ' ');
  s = s.replace(/&le;/gi, '<=');
  s = s.replace(/&ge;/gi, '>=');
  s = s.replace(/&lt;=/gi, '<=');
  s = s.replace(/&gt;=/gi, '>=');
  s = s.replace(/&lt;/gi, '<');
  s = s.replace(/&gt;/gi, '>');
  s = s.replace(/&amp;/gi, '&');
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&#39;/gi, "'");
  s = s.replace(/&#34;/gi, '"');
  s = s.replace(/&#43;/gi, '+');
  s = s.replace(/&times;/gi, '×');

  // 3. Preformatted code blocks
  s = s.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const cleaned = code.replace(/<[^>]+>/g, '').trim();
    return `\n\n\`\`\`text\n${cleaned}\n\`\`\`\n\n`;
  });
  s = s.replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, code) => {
    const cleaned = code.replace(/<[^>]+>/g, '').trim();
    return `\n\n\`\`\`text\n${cleaned}\n\`\`\`\n\n`;
  });

  // 4. Inline tags
  s = s.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  s = s.replace(/<strong class="example">\s*(.*?)\s*<\/strong>/gi, '\n\n### $1\n\n');
  s = s.replace(/<strong>\s*(Constraints:?)\s*<\/strong>/gi, '\n\n### $1\n\n');
  s = s.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  s = s.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  s = s.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  s = s.replace(/<i>(.*?)<\/i>/gi, '*$1*');

  // 5. Structure & lists
  s = s.replace(/<li>([\s\S]*?)<\/li>/gi, '- $1\n');
  s = s.replace(/<ul>([\s\S]*?)<\/ul>/gi, '\n\n$1\n\n');
  s = s.replace(/<ol>([\s\S]*?)<\/ol>/gi, '\n\n$1\n\n');
  s = s.replace(/<p>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // 6. Strip any lingering HTML tags like <div>, <span>, <font>, etc.
  s = s.replace(/<[^>]+>/g, '');

  // 7. Fix mashed headers and bold labels
  s = s.replace(/###\s*Examples?\s*\n*\s*(\d+)\s*:/gi, '### Example $1:\n\n');
  s = s.replace(/(?:^|\n)\s*(?:###\s*)?Example\s*(\d+)\s*:/gi, '\n\n### Example $1:\n\n');
  s = s.replace(/([^\n])\s*###\s*Example\s*(\d+)\s*:/gi, '$1\n\n### Example $2:\n\n');

  // Generic Examples header (not followed by number)
  s = s.replace(/(?:^|\n)\s*###\s*Examples(?!\s*\d)/gi, '\n\n### Examples\n\n');
  s = s.replace(/([^\n])\s*###\s*Examples(?!\s*\d)/gi, '$1\n\n### Examples\n\n');

  // Mashed bold labels: **Input:**, **Output:**, **Explanation:**
  s = s.replace(/([^\n])\s*\*\*(?:Input|Input:)\*\*/gi, '$1\n\n**Input:**\n');
  s = s.replace(/([^\n])\s*\*\*(?:Output|Output:)\*\*/gi, '$1\n\n**Output:**\n');
  s = s.replace(/([^\n])\s*\*\*(?:Explanation|Explanation:)\*\*/gi, '$1\n\n**Explanation:**\n');

  // Normalize labels inside code blocks vs outside
  s = s.replace(/\*\*Input\*\*:/gi, '**Input:**');
  s = s.replace(/\*\*Output\*\*:/gi, '**Output:**');
  s = s.replace(/\*\*Explanation\*\*:/gi, '**Explanation:**');

  // Ensure code fences have clean leading/trailing newlines
  s = s.replace(/([^\n])\s*```/g, '$1\n\n```');
  s = s.replace(/```([a-zA-Z0-9_-]*)\s*([^\n\s`])/g, '```$1\n$2');
  s = s.replace(/([^\n\s`])\s*```/g, '$1\n```');

  // Ensure Example header and code fence are separated by double newline
  s = s.replace(/(###\s*Example\s*\d+:)\s*\n*```/gi, '$1\n\n```');

  // Collapse 3+ newlines into 2
  s = s.replace(/\n{3,}/g, '\n\n').trim();

  return s;
}

function mapType(t: string): DataType {
  const clean = (t || '').trim().toLowerCase();
  if (clean.includes('int[]') || clean.includes('vector<int>') || clean.includes('list[int]')) return 'number[]';
  if (clean.includes('string[]') || clean.includes('vector<string>') || clean.includes('list[str]')) return 'string[]';
  if (clean.includes('bool')) return 'boolean';
  if (clean.includes('void') || clean.includes('none')) return 'void';
  if (clean.includes('string') || clean.includes('str')) return 'string';
  return 'int';
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

async function runSanitization() {
  console.log('Fetching all problems from database...');
  const problems = await prisma.problem.findMany({
    include: { testCases: true },
  });
  console.log(`Fetched ${problems.length} problems.`);

  let totalUpdated = 0;
  const batchSize = 25;

  for (let i = 0; i < problems.length; i += batchSize) {
    const chunk = problems.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${chunk.length} problems)...`);

    for (const p of chunk) {
      const q = cache[p.slug];

      // 1. Clean statement
      const rawStatement = q?.content || p.statement;
      const cleanStatement = cleanTextToMarkdown(rawStatement);

      let sig: FunctionSignature = p.functionSignature as any;
      let starterCode: Record<string, string> = (p.starterCode as any) || {};
      let driverCode: Record<string, string> = (p.driverCode as any) || {};

      const pySnippet = q?.codeSnippets?.find((s: any) => s.langSlug === 'python3' || s.langSlug === 'python')?.code || '';
      const javaSnippet = q?.codeSnippets?.find((s: any) => s.langSlug === 'java')?.code || '';
      const cppSnippet = q?.codeSnippets?.find((s: any) => s.langSlug === 'cpp')?.code || '';

      const isDesign =
        Boolean(KNOWN_DESIGN_OUTPUTS[p.slug]) ||
        /# Your .*? object will be instantiated and called as such/i.test(pySnippet) ||
        (!/class\s+Solution\b/.test(pySnippet) && /def\s+__init__\s*\(/.test(pySnippet));

      if (isDesign) {
        const classMatch = pySnippet.match(/class\s+([A-Za-z0-9_]+)\s*[:\(]/) ||
                           javaSnippet.match(/class\s+([A-Za-z0-9_]+)\s*\{/);
        const className = classMatch ? classMatch[1] : (p.title.replace(/[^a-zA-Z0-9]/g, '') || 'Solution');

        // Extract constructor parameters
        const initMatch = pySnippet.match(/def\s+__init__\s*\(\s*self\s*,?\s*([^)]*)\)/);
        const ctorParams: FunctionParameter[] = [];
        if (initMatch && initMatch[1].trim()) {
          const parts = initMatch[1].split(',').map((x: string) => x.trim()).filter(Boolean);
          for (const part of parts) {
            const [pName, pType] = part.split(':').map((x: string) => x.trim());
            ctorParams.push({ name: pName, type: mapType(pType || 'int') });
          }
        }

        // Extract methods
        const methodRegex = /def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*([^:]+))?:/g;
        const methods: ClassMethod[] = [];
        let mMatch;
        while ((mMatch = methodRegex.exec(pySnippet)) !== null) {
          if (mMatch[1] === '__init__') continue;
          const mName = mMatch[1];
          const mParamsStr = mMatch[2] ? mMatch[2].trim() : '';
          const mRet = mMatch[3] ? mapType(mMatch[3].trim()) : 'void';
          const mParams: FunctionParameter[] = [];
          if (mParamsStr) {
            const parts = mParamsStr.split(',').map((x: string) => x.trim()).filter(Boolean);
            for (const part of parts) {
              const [pName, pType] = part.split(':').map((x: string) => x.trim());
              mParams.push({ name: pName, type: mapType(pType || 'int') });
            }
          }
          methods.push({ name: mName, returnType: mRet, parameters: mParams });
        }

        sig = {
          isClass: true,
          className,
          constructorParams: ctorParams,
          methods,
          functionName: methods[0]?.name || 'execute',
          returnType: methods[0]?.returnType || 'void',
          parameters: methods[0]?.parameters || [],
        };

        // Generate clean starter code and driver code
        starterCode = {
          python: generateStarterCode(sig, 'python3'),
          python3: generateStarterCode(sig, 'python3'),
          java: generateStarterCode(sig, 'java'),
          cpp: generateStarterCode(sig, 'cpp'),
          'c++': generateStarterCode(sig, 'cpp'),
        };

        driverCode = {
          python: generateDriverCode(sig, 'python3'),
          python3: generateDriverCode(sig, 'python3'),
          java: generateDriverCode(sig, 'java'),
          cpp: generateDriverCode(sig, 'cpp'),
          'c++': generateDriverCode(sig, 'cpp'),
        };

        // Fix known design problem testcases
        if (KNOWN_DESIGN_OUTPUTS[p.slug]) {
          const known = KNOWN_DESIGN_OUTPUTS[p.slug];
          // Delete existing testcases and insert known clean testcase
          await prisma.testCase.deleteMany({ where: { problemId: p.id } });
          await prisma.testCase.create({
            data: {
              problemId: p.id,
              input: known.input,
              expectedOutput: known.output,
              isSample: true,
              isHidden: false,
              weight: 1,
            },
          });
        }
      } else {
        // Standard function problem
        let funcName = sig?.functionName;
        let retType: DataType = sig?.returnType || 'int';
        let parameters: FunctionParameter[] = sig?.parameters || [{ name: 'nums', type: 'number[]' }];

        if (q && q.codeSnippets) {
          const pyMatch = pySnippet.match(/class\s+Solution[\s\S]*?def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*([^:]+))?:/);
          const javaMatch = javaSnippet.match(/class\s+Solution[\s\S]*?public\s+([a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);

          if (pyMatch && pyMatch[1] !== '__init__') {
            funcName = pyMatch[1];
          } else if (javaMatch && javaMatch[2] !== '__init__') {
            funcName = javaMatch[2];
          }

          if (javaMatch && javaMatch[1]) {
            retType = mapType(javaMatch[1]);
          } else if (pyMatch && pyMatch[3]) {
            retType = mapType(pyMatch[3]);
          }

          // Use official snippets if available
          if (pySnippet) {
            starterCode['python'] = pySnippet;
            starterCode['python3'] = pySnippet;
          }
          if (javaSnippet) {
            starterCode['java'] = javaSnippet.replace(/public\s+class\s+Solution\b/, 'class Solution');
          }
          if (cppSnippet) {
            starterCode['cpp'] = cppSnippet;
            starterCode['c++'] = cppSnippet;
          }
        }

        // If funcName is STILL '__init__' or empty, fix it!
        if (!funcName || funcName === '__init__') {
          funcName = toCamelCase(p.slug);
        }

        sig = {
          functionName: funcName,
          returnType: retType,
          parameters,
        };

        // Ensure starter code doesn't contain __init__ in Java/CPP
        if (!starterCode['java'] || starterCode['java'].includes('__init__')) {
          starterCode['java'] = generateStarterCode(sig, 'java');
        }
        if (!starterCode['cpp'] || starterCode['cpp'].includes('__init__')) {
          starterCode['cpp'] = generateStarterCode(sig, 'cpp');
          starterCode['c++'] = starterCode['cpp'];
        }
        if (!starterCode['python3'] || starterCode['python3'].includes('def __init__')) {
          starterCode['python3'] = generateStarterCode(sig, 'python3');
          starterCode['python'] = starterCode['python3'];
        }

        // Generate driver code
        driverCode = {
          python: generateDriverCode(sig, 'python3'),
          python3: generateDriverCode(sig, 'python3'),
          java: generateDriverCode(sig, 'java'),
          cpp: generateDriverCode(sig, 'cpp'),
          'c++': generateDriverCode(sig, 'cpp'),
        };
      }

      await prisma.problem.update({
        where: { id: p.id },
        data: {
          statement: cleanStatement,
          functionSignature: sig as any,
          starterCode: starterCode as any,
          driverCode: driverCode as any,
        },
      });

      totalUpdated++;
    }
  }

  console.log(`\nMigration Complete! Total problems sanitized and updated: ${totalUpdated}`);
  await prisma.$disconnect();
}

runSanitization().catch(console.error);
