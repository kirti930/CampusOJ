import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import { DataType, FunctionSignature, generateStarterCode, generateDriverCode } from '../../shared/src/codeWrapper';

let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Load lc-cache
const CACHE_FILE = path.resolve(__dirname, 'lc-cache.json');
const lcCache: Record<string, any> = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  : {};

// Load curated sheet
const CURATED_FILE = path.resolve(__dirname, 'data/curated-sheet-problems.json');
const curatedData: any[] = fs.existsSync(CURATED_FILE)
  ? JSON.parse(fs.readFileSync(CURATED_FILE, 'utf8'))
  : [];
const curatedMap = new Map(curatedData.map((p) => [p.slug, p]));

function cleanType(raw: string): DataType {
  let s = raw.trim();
  if (s.startsWith('Optional[')) s = s.slice(9, -1).trim();
  s = s.replace(/&$/, '').replace(/\*$/, '').trim();
  const l = s.toLowerCase();

  if (l === 'int' || l === 'integer' || l === 'long' || l === 'long long') return 'int';
  if (l === 'double' || l === 'float') return 'double';
  if (l === 'bool' || l === 'boolean') return 'boolean';
  if (l === 'str' || l === 'string' || l === 'char' || l === 'character') return 'string';
  if (
    l === 'list[int]' ||
    l === 'int[]' ||
    l === 'integer[]' ||
    l === 'number[]' ||
    l === 'list<integer>' ||
    l === 'vector<int>'
  )
    return 'int[]';
  if (
    l === 'list[list[int]]' ||
    l === 'int[][]' ||
    l === 'integer[][]' ||
    l === 'number[][]' ||
    l === 'list<list<integer>>' ||
    l === 'vector<vector<int>>'
  )
    return 'int[][]';
  if (
    l === 'list[str]' ||
    l === 'string[]' ||
    l === 'list<string>' ||
    l === 'vector<string>'
  )
    return 'string[]';
  if (
    l === 'list[list[str]]' ||
    l === 'string[][]' ||
    l === 'vector<vector<string>>' ||
    l === 'vector<vector<char>>' ||
    l === 'char[][]'
  )
    return 'string[][]';
  if (l === 'treenode') return 'TreeNode';
  if (l === 'listnode') return 'ListNode';
  if (l === 'void') return 'void';
  return 'any';
}

function extractFromSnippets(codeSnippets: Array<{ langSlug: string; code: string }>): FunctionSignature | null {
  // Check C++ snippet first (very explicit types)
  const cpp = codeSnippets.find((s) => s.langSlug === 'cpp');
  if (cpp && cpp.code.includes('class Solution')) {
    const solBody = cpp.code.split('class Solution')[1] || '';
    const match = solBody.match(/([a-zA-Z0-9_<>\[\]&*:]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (match) {
      const rawRet = match[1];
      const funcName = match[2];
      const rawParams = match[3].trim();
      const params: Array<{ name: string; type: DataType }> = [];
      if (rawParams.length > 0) {
        const parts = rawParams.split(',');
        for (const p of parts) {
          const tokens = p.trim().split(/\s+/);
          if (tokens.length >= 2) {
            params.push({
              name: tokens[tokens.length - 1].replace(/^&/, '').replace(/^\*/, ''),
              type: cleanType(tokens.slice(0, -1).join(' ')),
            });
          }
        }
      }
      return {
        functionName: funcName,
        returnType: cleanType(rawRet),
        parameters: params,
      };
    }
  }

  // Check Java snippet
  const java = codeSnippets.find((s) => s.langSlug === 'java');
  if (java && java.code.includes('class Solution')) {
    const solBody = java.code.split('class Solution')[1] || '';
    const match = solBody.match(/public\s+([a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (match) {
      const rawRet = match[1];
      const funcName = match[2];
      const rawParams = match[3].trim();
      const params: Array<{ name: string; type: DataType }> = [];
      if (rawParams.length > 0) {
        const parts = rawParams.split(',');
        for (const p of parts) {
          const tokens = p.trim().split(/\s+/);
          if (tokens.length >= 2) {
            params.push({
              name: tokens[tokens.length - 1],
              type: cleanType(tokens.slice(0, -1).join(' ')),
            });
          }
        }
      }
      return {
        functionName: funcName,
        returnType: cleanType(rawRet),
        parameters: params,
      };
    }
  }

  // Check Python snippet
  const py = codeSnippets.find((s) => s.langSlug === 'python3' || s.langSlug === 'python');
  if (py && py.code.includes('class Solution:')) {
    const solBody = py.code.split('class Solution:')[1] || '';
    const match = solBody.match(/def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*([^:]+))?:/);
    if (match) {
      const funcName = match[1];
      const rawParams = match[2].trim();
      const rawRet = (match[3] || 'int').trim();
      const params: Array<{ name: string; type: DataType }> = [];
      if (rawParams.length > 0) {
        const parts = rawParams.split(',');
        for (const p of parts) {
          const [pName, pType] = p.split(':');
          if (pName && pName.trim()) {
            params.push({
              name: pName.trim(),
              type: pType ? cleanType(pType) : 'int',
            });
          }
        }
      }
      return {
        functionName: funcName,
        returnType: cleanType(rawRet),
        parameters: params,
      };
    }
  }

  return null;
}

// Specific canonical overrides for DSA Sheet problems that aren't pure LeetCode or where custom formatting is used
const EXPLICIT_OVERRIDES: Record<string, FunctionSignature> = {
  // Bit manipulation
  'calculate-square-of-a-number-without-using-and-pow': {
    functionName: 'calculateSquare',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },
  'count-total-set-bits-in-all-numbers-from-1-to-n': {
    functionName: 'countSetBits',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },
  'count-set-bits-in-an-integer': {
    functionName: 'setBits',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },
  'find-position-of-the-only-set-bit': {
    functionName: 'findPosition',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },
  'count-number-of-bits-to-be-flipped-to-convert-a-to-b': {
    functionName: 'countBitsFlip',
    returnType: 'int',
    parameters: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }],
  },
  'copy-set-bits-in-a-range': {
    functionName: 'setSetBit',
    returnType: 'int',
    parameters: [
      { name: 'x', type: 'int' },
      { name: 'y', type: 'int' },
      { name: 'l', type: 'int' },
      { name: 'r', type: 'int' },
    ],
  },
  'bbt-counter': {
    functionName: 'countBT',
    returnType: 'int',
    parameters: [{ name: 'h', type: 'int' }],
  },
  'catalan-number': {
    functionName: 'findCatalan',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },

  // Math / DP
  'ncr': {
    functionName: 'nCr',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }, { name: 'r', type: 'int' }],
  },
  'mobile-numeric-keypad': {
    functionName: 'getCount',
    returnType: 'int',
    parameters: [{ name: 'n', type: 'int' }],
  },
  'coin-game-winner': {
    functionName: 'findWinner',
    returnType: 'boolean',
    parameters: [
      { name: 'n', type: 'int' },
      { name: 'a', type: 'int' },
      { name: 'b', type: 'int' },
    ],
  },
  'coin-game': {
    functionName: 'findWinner',
    returnType: 'boolean',
    parameters: [
      { name: 'n', type: 'int' },
      { name: 'a', type: 'int' },
      { name: 'b', type: 'int' },
    ],
  },
  'maximize-the-cut-segments': {
    functionName: 'maximizeTheCuts',
    returnType: 'int',
    parameters: [
      { name: 'n', type: 'int' },
      { name: 'x', type: 'int' },
      { name: 'y', type: 'int' },
      { name: 'z', type: 'int' },
    ],
  },

  // Strings
  'check-for-palindrome': {
    functionName: 'isPalindrome',
    returnType: 'boolean',
    parameters: [{ name: 's', type: 'string' }],
  },
  'print-all-palindromic-partitions-of-a-string': {
    functionName: 'allPalindromicPerms',
    returnType: 'string[][]',
    parameters: [{ name: 's', type: 'string' }],
  },
  'given-a-sequence-of-words-print-all-anagrams-together': {
    functionName: 'anagrams',
    returnType: 'string[][]',
    parameters: [{ name: 'string_list', type: 'string[]' }],
  },
  'find-shortest-unique-prefix-for-every-word-in-a-given-list': {
    functionName: 'findPrefixes',
    returnType: 'string[]',
    parameters: [{ name: 'arr', type: 'string[]' }],
  },
  'implement-a-phone-directory': {
    functionName: 'displayContacts',
    returnType: 'string[][]',
    parameters: [{ name: 'contact', type: 'string[]' }, { name: 's', type: 'string' }],
  },
  'boyer-moore-algorithm-for-pattern-searching': {
    functionName: 'search',
    returnType: 'int[]',
    parameters: [{ name: 'txt', type: 'string' }, { name: 'pat', type: 'string' }],
  },
  'wildcard-string-matching': {
    functionName: 'match',
    returnType: 'boolean',
    parameters: [{ name: 'wild', type: 'string' }, { name: 'pattern', type: 'string' }],
  },
  'evaluation-of-postfix-expression': {
    functionName: 'evaluatePostfix',
    returnType: 'int',
    parameters: [{ name: 's', type: 'string' }],
  },
  'allen-dictionary': {
    functionName: 'findOrder',
    returnType: 'string',
    parameters: [{ name: 'dict', type: 'string[]' }, { name: 'k', type: 'int' }],
  },

  // Trees
  'binary-search-tree-set-1-search-and-insertion': {
    functionName: 'insert',
    returnType: 'TreeNode',
    parameters: [{ name: 'root', type: 'TreeNode' }, { name: 'val', type: 'int' }],
  },
  'check-if-tree-is-isomorphic': {
    functionName: 'isIsomorphic',
    returnType: 'boolean',
    parameters: [{ name: 'root1', type: 'TreeNode' }, { name: 'root2', type: 'TreeNode' }],
  },
  'check-whether-bst-contains-dead-end': {
    functionName: 'isDeadEnd',
    returnType: 'boolean',
    parameters: [{ name: 'root', type: 'TreeNode' }],
  },
  'print-all-k-sum-paths-in-a-binary-tree': {
    functionName: 'sumK',
    returnType: 'int',
    parameters: [{ name: 'root', type: 'TreeNode' }, { name: 'k', type: 'int' }],
  },
  'predecessor-and-successor': {
    functionName: 'findPreSuc',
    returnType: 'int[]',
    parameters: [{ name: 'root', type: 'TreeNode' }, { name: 'key', type: 'int' }],
  },
  'lowest-common-ancestor-in-a-binary-tree': {
    functionName: 'lca',
    returnType: 'TreeNode',
    parameters: [
      { name: 'root', type: 'TreeNode' },
      { name: 'n1', type: 'int' },
      { name: 'n2', type: 'int' },
    ],
  },
  'kth-ancestor-of-a-node-in-binary-tree': {
    functionName: 'kthAncestor',
    returnType: 'int',
    parameters: [
      { name: 'root', type: 'TreeNode' },
      { name: 'k', type: 'int' },
      { name: 'node', type: 'int' },
    ],
  },

  // Linked Lists
  'sum-of-two-linked-lists': {
    functionName: 'addTwoLists',
    returnType: 'ListNode',
    parameters: [{ name: 'l1', type: 'ListNode' }, { name: 'l2', type: 'ListNode' }],
  },
  'subtract-two-numbers-represented-as-linked-lists': {
    functionName: 'subLinkedList',
    returnType: 'ListNode',
    parameters: [{ name: 'l1', type: 'ListNode' }, { name: 'l2', type: 'ListNode' }],
  },
  'write-a-function-to-get-the-intersection-point-of-two-linked-lists': {
    functionName: 'intersectPoint',
    returnType: 'int',
    parameters: [{ name: 'head1', type: 'ListNode' }, { name: 'head2', type: 'ListNode' }],
  },

  // Graphs
  'bfs': {
    functionName: 'bfsOfGraph',
    returnType: 'int[]',
    parameters: [{ name: 'V', type: 'int' }, { name: 'adj', type: 'int[][]' }],
  },
  'dfs': {
    functionName: 'dfsOfGraph',
    returnType: 'int[]',
    parameters: [{ name: 'V', type: 'int' }, { name: 'adj', type: 'int[][]' }],
  },
  'detect-cycle-in-a-graph': {
    functionName: 'isCyclic',
    returnType: 'boolean',
    parameters: [{ name: 'V', type: 'int' }, { name: 'adj', type: 'int[][]' }],
  },
  'detect-cycle-in-an-undirected-graph': {
    functionName: 'isCycle',
    returnType: 'boolean',
    parameters: [{ name: 'V', type: 'int' }, { name: 'adj', type: 'int[][]' }],
  },
  'topological-sort': {
    functionName: 'topoSort',
    returnType: 'int[]',
    parameters: [{ name: 'V', type: 'int' }, { name: 'adj', type: 'int[][]' }],
  },
  'bellman-ford': {
    functionName: 'bellmanFord',
    returnType: 'int[]',
    parameters: [
      { name: 'V', type: 'int' },
      { name: 'edges', type: 'int[][]' },
      { name: 'src', type: 'int' },
    ],
  },
  'floyd-warshall': {
    functionName: 'shortestDistance',
    returnType: 'int[][]',
    parameters: [{ name: 'matrix', type: 'int[][]' }],
  },
  'dijkstras-shortest-path-algorithm': {
    functionName: 'dijkstra',
    returnType: 'int[]',
    parameters: [
      { name: 'V', type: 'int' },
      { name: 'adj', type: 'int[][]' },
      { name: 'src', type: 'int' },
    ],
  },
  'negative-weighted-cycle': {
    functionName: 'isNegativeWeightCycle',
    returnType: 'boolean',
    parameters: [{ name: 'n', type: 'int' }, { name: 'edges', type: 'int[][]' }],
  },
  'graph-coloring': {
    functionName: 'graphColoring',
    returnType: 'boolean',
    parameters: [
      { name: 'graph', type: 'int[][]' },
      { name: 'm', type: 'int' },
      { name: 'n', type: 'int' },
    ],
  },
  'm-coloring-problem-284': {
    functionName: 'graphColoring',
    returnType: 'boolean',
    parameters: [
      { name: 'graph', type: 'int[][]' },
      { name: 'm', type: 'int' },
      { name: 'n', type: 'int' },
    ],
  },
  'rat-in-a-maze-problem': {
    functionName: 'findPath',
    returnType: 'string[]',
    parameters: [{ name: 'm', type: 'int[][]' }, { name: 'n', type: 'int' }],
  },
  'backtracking-set-2-rat-in-a-maze': {
    functionName: 'findPath',
    returnType: 'string[]',
    parameters: [{ name: 'maze', type: 'int[][]' }, { name: 'n', type: 'int' }],
  },
  'word-search': {
    functionName: 'exist',
    returnType: 'boolean',
    parameters: [{ name: 'board', type: 'string[][]' }, { name: 'word', type: 'string' }],
  },

  // Arrays
  'aggressive-cows': {
    functionName: 'solve',
    returnType: 'int',
    parameters: [{ name: 'stalls', type: 'int[]' }, { name: 'k', type: 'int' }],
  },
  'allocate-minimum-number-of-pages': {
    functionName: 'findPages',
    returnType: 'int',
    parameters: [{ name: 'pages', type: 'int[]' }, { name: 'm', type: 'int' }],
  },
  'product-of-array-except-itself': {
    functionName: 'productExceptSelf',
    returnType: 'int[]',
    parameters: [{ name: 'nums', type: 'int[]' }],
  },
  'check-if-reversing-a-sub-array-make-the-array-sorted': {
    functionName: 'checkReverse',
    returnType: 'boolean',
    parameters: [{ name: 'arr', type: 'int[]' }],
  },
  'choose-k-array-elements-such-that-difference-of-maximum-and-minimum-is-minimized': {
    functionName: 'minDiff',
    returnType: 'int',
    parameters: [{ name: 'arr', type: 'int[]' }, { name: 'k', type: 'int' }],
  },
  'chocolate-distribution-problem': {
    functionName: 'findMinDiff',
    returnType: 'int',
    parameters: [{ name: 'arr', type: 'int[]' }, { name: 'm', type: 'int' }],
  },
  'k-maximum-sum-combinations-from-two-arrays': {
    functionName: 'maxCombinations',
    returnType: 'int[]',
    parameters: [
      { name: 'a', type: 'int[]' },
      { name: 'b', type: 'int[]' },
      { name: 'k', type: 'int' },
    ],
  },
  'find-pair-with-sum-in-sorted-rotated-array': {
    functionName: 'pairInSortedRotated',
    returnType: 'boolean',
    parameters: [{ name: 'arr', type: 'int[]' }, { name: 'target', type: 'int' }],
  },
  'piar-with-given-difference': {
    functionName: 'findPair',
    returnType: 'boolean',
    parameters: [{ name: 'arr', type: 'int[]' }, { name: 'n', type: 'int' }],
  },
  'the-celebrity-problem': {
    functionName: 'celebrity',
    returnType: 'int',
    parameters: [{ name: 'M', type: 'int[][]' }, { name: 'n', type: 'int' }],
  },
  'zigzag-or-diagonal-traversal-of-matrix': {
    functionName: 'diagonalOrder',
    returnType: 'int[]',
    parameters: [{ name: 'matrix', type: 'int[][]' }],
  },
  'travelling-salesman': {
    functionName: 'totalCost',
    returnType: 'int',
    parameters: [{ name: 'cost', type: 'int[][]' }],
  },
};

async function main() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      statement: true,
      functionSignature: true,
    },
    orderBy: { title: 'asc' },
  });

  console.log(`Auditing all ${problems.length} problems...`);

  let countExplicit = 0;
  let countLC = 0;
  let countPreservedClass = 0;
  let countCurated = 0;
  let countExisting = 0;

  const resolvedMap: Record<string, FunctionSignature> = {};

  for (const p of problems) {
    const existing = p.functionSignature as any;

    // 1. Explicit override
    if (EXPLICIT_OVERRIDES[p.slug]) {
      resolvedMap[p.slug] = EXPLICIT_OVERRIDES[p.slug];
      countExplicit++;
      continue;
    }

    // 2. Class problem
    if (existing?.isClass) {
      resolvedMap[p.slug] = existing;
      countPreservedClass++;
      continue;
    }

    // 3. LC cache
    const lc = lcCache[p.slug];
    if (lc && lc.codeSnippets) {
      const extracted = extractFromSnippets(lc.codeSnippets);
      if (extracted && extracted.parameters.length > 0) {
        resolvedMap[p.slug] = extracted;
        countLC++;
        continue;
      }
    }

    // 4. Curated map
    const cur = curatedMap.get(p.slug);
    if (cur && cur.functionSignature && cur.functionSignature.parameters.length > 0) {
      // If curated has generic n:int, arr:int[] but title or statement doesn't ask for n:
      const curParams = cur.functionSignature.parameters;
      if (curParams.length === 2 && curParams[0].name === 'n' && curParams[1].name === 'arr') {
        // Fix to nums: int[]
        resolvedMap[p.slug] = {
          functionName: cur.functionSignature.functionName || 'solve',
          returnType: cur.functionSignature.returnType || 'int',
          parameters: [{ name: 'nums', type: 'int[]' }],
        };
      } else {
        resolvedMap[p.slug] = cur.functionSignature;
      }
      countCurated++;
      continue;
    }

    // 5. Existing
    // Check if existing has n:int, arr:int[]:
    const exParams = existing?.parameters || [];
    if (exParams.length === 2 && exParams[0].name === 'n' && exParams[1].name === 'arr') {
      resolvedMap[p.slug] = {
        functionName: existing.functionName || 'solve',
        returnType: existing.returnType || 'int',
        parameters: [{ name: 'nums', type: 'int[]' }],
      };
    } else {
      resolvedMap[p.slug] = existing;
    }
    countExisting++;
  }

  console.log(`Resolution Summary:`);
  console.log(`  Explicit Overrides: ${countExplicit}`);
  console.log(`  LC Cache Snippets:  ${countLC}`);
  console.log(`  Preserved Classes:  ${countPreservedClass}`);
  console.log(`  Curated Map:        ${countCurated}`);
  console.log(`  Existing Clean:     ${countExisting}`);
  console.log(`  Total Mapped:       ${Object.keys(resolvedMap).length} / ${problems.length}`);

  // Now scan for any remaining (n:int, arr:int[])
  let remainingNArr = 0;
  for (const slug in resolvedMap) {
    const sig = resolvedMap[slug];
    const pStr = (sig.parameters || []).map((x) => `${x.name}:${x.type}`).join(', ');
    if (pStr.includes('n:int, arr:int[]')) {
      remainingNArr++;
      console.log(`⚠️ Remaining n,arr: [${slug}]: ${pStr}`);
    }
  }

  console.log(`Remaining n,arr problems: ${remainingNArr}`);

  fs.writeFileSync(
    path.resolve(__dirname, 'master-resolved-signatures.json'),
    JSON.stringify(resolvedMap, null, 2)
  );

  await prisma.$disconnect();
}

main().catch(console.error);
