import { PrismaClient, Difficulty } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import {
  generateStarterCode,
  generateDriverCode,
  FunctionSignature,
  DataType,
} from '../../../packages/shared/src/codeWrapper';

// Database client with robust connection pooling for Neon
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('pool_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&pool_timeout=30';
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

// Load LeetCode Cache
const CACHE_FILE = path.resolve(__dirname, 'lc-cache.json');
let lcCache: Record<string, any> = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    lcCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    lcCache = {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV Parser
// ─────────────────────────────────────────────────────────────────────────────

interface RawRow {
  topic: string;
  title: string;
  companies: string;
  remarks: string;
}

function parseSheetCSV(): RawRow[] {
  let csvPath = path.resolve(__dirname, 'campusoj-dsa-sheet.csv');
  if (!fs.existsSync(csvPath)) {
    csvPath = path.resolve(__dirname, 'campusoj-dsa-sheet.csv.csv');
  }
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const nextChar = raw[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  // Find header row starting with "Topics"
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0]?.toLowerCase().includes('topic')) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error('Could not find header row starting with "Topics" in CSV');
  }

  const result: RawRow[] = [];
  let currentTopic = 'Arrays';

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const topicCol = row[0]?.trim();
    const titleCol = row[1]?.trim();
    const compCol = row[2]?.trim() || '';
    const remCol = row[3]?.trim() || '';

    if (topicCol) {
      currentTopic = topicCol;
    }

    if (
      titleCol &&
      !titleCol.toLowerCase().startsWith('ideal time') &&
      !titleCol.toLowerCase().startsWith('question')
    ) {
      result.push({
        topic: currentTopic,
        title: titleCol,
        companies: compCol,
        remarks: remCol,
      });
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML to Markdown Converter
// ─────────────────────────────────────────────────────────────────────────────

function unescapeHtml(str: string): string {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&le;/g, '<=')
    .replace(/&ge;/g, '>=')
    .replace(/&times;/g, '×')
    .replace(/&#43;/g, '+')
    .replace(/&#34;/g, '"');
}

function htmlToMarkdown(html: string): string {
  if (!html) return '';
  let md = html
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => '```\n' + unescapeHtml(code).trim() + '\n```\n')
    .replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, code) => '```\n' + unescapeHtml(code).trim() + '\n```\n')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<li>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n');

  md = unescapeHtml(md);
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

// ─────────────────────────────────────────────────────────────────────────────
// Slugs & Title Normalizer
// ─────────────────────────────────────────────────────────────────────────────

const SLUG_OVERRIDES: Record<string, string> = {
  'Maximum and Minimum Element in an Array': 'minimum-and-maximum-element-in-an-array',
  'Reverse the Array': 'reverse-string',
  'Maximum-Subarray': 'maximum-subarray',
  'Contains Duplicate': 'contains-duplicate',
  'Search in Rotated Sorted Array': 'search-in-rotated-sorted-array',
  'Next Permutation': 'next-permutation',
  'Best time to Buy and Sell Stock': 'best-time-to-buy-and-sell-stock',
  'Repeat and Missing Number Array': 'set-mismatch',
  'Kth-Largest Element in an Array': 'kth-largest-element-in-an-array',
  'Trapping Rain Water': 'trapping-rain-water',
  'Product of Array Except Self': 'product-of-array-except-self',
  'Maximum Product Subarray': 'maximum-product-subarray',
  'Find Minimum in Rotated Sorted Array': 'find-minimum-in-rotated-sorted-array',
  '3Sum': '3sum',
  'Container With Most Water': 'container-with-most-water',
  'Given Sum Pair': 'two-sum',
  'Kth - Smallest Element': 'kth-smallest-element-in-a-sorted-matrix',
  'Merge Overlapping Intervals': 'merge-intervals',
  'Given an Array of Numbers Arrange the Numbers to Form the Biggest Number': 'largest-number',
  'Subarray Sum Divisible K': 'subarray-sums-divisible-by-k',
  'Valid Palindrome': 'valid-palindrome',
  'Valid Anagram': 'valid-anagram',
  'Valid parentheses': 'valid-parentheses',
  'Remove Consecutive Characters': 'remove-all-adjacent-duplicates-in-string',
  'Longest Common Prefix': 'longest-common-prefix',
  'Longest Substring without Repeating Characters': 'longest-substring-without-repeating-characters',
  'Longest Repeating Character Replacement': 'longest-repeating-character-replacement',
  'Group Anagrams': 'group-anagrams',
  'Longest Palindromic Substring': 'longest-palindromic-substring',
  'Palindromic Substrings': 'palindromic-substrings',
  'Set Matrix Zeroes': 'set-matrix-zeroes',
  'Spiral Matrix': 'spiral-matrix',
  'Rotate Image': 'rotate-image',
  'Word Search': 'word-search',
  'Maximum Size Rectangle of all 1s': 'maximal-rectangle',
  'majority element': 'majority-element',
  'Combinational Sum': 'combination-sum',
  'Printing all solutions in N-Queen Problem': 'n-queens',
  'Solve the Sudoku': 'sudoku-solver',
  'Partition Equal Subset Sum': 'partition-equal-subset-sum',
  'Soduko': 'valid-sudoku',
  'Reverse Linked List': 'reverse-linked-list',
  'Linked List Cycle': 'linked-list-cycle',
  'Merge Two Sorted Lists': 'merge-two-sorted-lists',
  'Remove nth node from end of list': 'remove-nth-node-from-end-of-list',
  'Reorder List': 'reorder-list',
  'Implement two stacks in an Array': 'implement-queue-using-stacks',
  'Implement Stack using Queues': 'implement-stack-using-queues',
  'Activity selection problem greedy algo': 'non-overlapping-intervals',
  'Job sequencing problem': 'course-schedule-iii',
  'Maximum Depth of Binary Tree': 'maximum-depth-of-binary-tree',
  'Invert Binary Tree': 'invert-binary-tree',
  'Binary Tree Level Order Traversal': 'binary-tree-level-order-traversal',
  'Subtree of Another Tree': 'subtree-of-another-tree',
  'Lowest Common Ancestor of a Binary Search Tree': 'lowest-common-ancestor-of-a-binary-search-tree',
  'Validate Binary Search Tree': 'validate-binary-search-tree',
  'Kth Smallest Element in a BST': 'kth-smallest-element-in-a-bst',
  'Top K Frequent Elements': 'top-k-frequent-elements',
  'Climbing Stairs': 'climbing-stairs',
  'Coin Change': 'coin-change',
  'Longest Increasing Subsequence': 'longest-increasing-subsequence',
  'Longest Common Subsequence': 'longest-common-subsequence',
  'Word Break': 'word-break',
  'House Robber': 'house-robber',
  'House Robber II': 'house-robber-ii',
  'Decode Ways': 'decode-ways',
  'Unique Paths': 'unique-paths',
  'Jump Game': 'jump-game',
  'Clone graph': 'clone-graph',
  'Number of Operations to Make Network Connected': 'number-of-operations-to-make-network-connected',
  'Course Schedule': 'course-schedule',
  'Counting Bits': 'counting-bits',
  'Number of 1 Bits': 'number-of-1-bits',
  'Reverse Bits': 'reverse-bits',
  'Divide two integers without using multiplication, division and mod operator': 'divide-two-integers',
  'Power Set': 'subsets',
  'Range Sum Query - Immutable': 'range-sum-query-immutable',
  'Range Sum Query - Mutable': 'range-sum-query-mutable',
  'Count of Smaller Numbers After Self': 'count-of-smaller-numbers-after-self',
  'Count of Range Sum': 'count-of-range-sum',
  'Create Sorted Array through Instructions': 'create-sorted-array-through-instructions',
};

function cleanTitle(title: string): string {
  return title
    .replace(/^Set \d+.*?[-:]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlug(title: string): string {
  if (SLUG_OVERRIDES[title]) return SLUG_OVERRIDES[title];
  const cleaned = cleanTitle(title);
  if (SLUG_OVERRIDES[cleaned]) return SLUG_OVERRIDES[cleaned];
  return cleaned
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag Extractor
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'interview',
  'qs',
  'question',
  'questions',
  'set',
  'using',
  'plus',
  'and',
  'the',
  'for',
  'with',
  'each',
  'day',
  'days',
  'labs',
  'rooms',
  'cabs',
  'internet',
  'algo',
  'problem',
]);

function extractTags(topic: string, companiesStr: string): string[] {
  const tags = new Set<string>();

  // Normalize topic as tag
  const topicTag = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  tags.add(topicTag);

  // Extract companies
  const words = companiesStr
    .toLowerCase()
    .replace(/[+&,/\\|()]/g, ' ')
    .split(/\s+/);

  for (const w of words) {
    const cleaned = w.replace(/[^a-z0-9-]/g, '').trim();
    if (cleaned.length >= 3 && !STOP_WORDS.has(cleaned)) {
      tags.add(cleaned);
    }
  }

  return Array.from(tags);
}

// ─────────────────────────────────────────────────────────────────────────────
// Function Signature Extraction from Snippets
// ─────────────────────────────────────────────────────────────────────────────

function mapDataType(raw: string): DataType {
  const s = raw.toLowerCase().trim();
  if (s.includes('list[int]') || s.includes('vector<int>') || s.includes('int[]')) return 'number[]';
  if (s.includes('list[str]') || s.includes('vector<string>') || s.includes('string[]')) return 'string[]';
  if (s.includes('int') || s.includes('long')) return 'int';
  if (s.includes('bool')) return 'boolean';
  if (s.includes('str')) return 'string';
  if (s.includes('void') || s.includes('none')) return 'void';
  return 'number[]'; // default
}

function extractSignatureFromSnippets(
  codeSnippets: Array<{ langSlug: string; code: string }>,
  defaultName: string
): FunctionSignature | null {
  // Try Python3 snippet first
  const py = codeSnippets.find((s) => s.langSlug === 'python3' || s.langSlug === 'python');
  if (py) {
    const match = py.code.match(/def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*([^:]+))?:/);
    if (match) {
      const funcName = match[1];
      const rawParams = match[2].trim();
      const rawRet = (match[3] || 'int').trim();

      const params: Array<{ name: string; type: DataType }> = [];
      if (rawParams.length > 0) {
        // split params
        const parts = rawParams.split(',');
        for (const p of parts) {
          const [pName, pType] = p.split(':');
          if (pName && pName.trim()) {
            params.push({
              name: pName.trim(),
              type: pType ? mapDataType(pType) : 'int',
            });
          }
        }
      }

      return {
        functionName: funcName,
        returnType: mapDataType(rawRet),
        parameters: params,
      };
    }
  }

  // Try Java snippet
  const java = codeSnippets.find((s) => s.langSlug === 'java');
  if (java) {
    const match = java.code.match(/public\s+([a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (match) {
      const retType = mapDataType(match[1]);
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
              type: mapDataType(tokens.slice(0, -1).join(' ')),
            });
          }
        }
      }

      return {
        functionName: funcName,
        returnType: retType,
        parameters: params,
      };
    }
  }

  return null;
}

// Synthesize a signature for textbook / GFG problems based on topic
function synthesizeSignature(title: string, topic: string): FunctionSignature {
  const camel = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
    .slice(0, 30) || 'solve';

  const t = topic.toLowerCase();

  if (t.includes('string')) {
    if (title.toLowerCase().includes('palindrome') || title.toLowerCase().includes('anagram')) {
      return {
        functionName: camel,
        returnType: 'boolean',
        parameters: [{ name: 's', type: 'string' }],
      };
    }
    return {
      functionName: camel,
      returnType: 'int',
      parameters: [{ name: 's', type: 'string' }],
    };
  }

  if (t.includes('bit')) {
    return {
      functionName: camel,
      returnType: 'int',
      parameters: [{ name: 'n', type: 'int' }],
    };
  }

  if (t.includes('matrix') || t.includes('2d')) {
    return {
      functionName: camel,
      returnType: 'number[]',
      parameters: [{ name: 'matrix', type: 'number[]' }],
    };
  }

  // Default array signature
  if (title.toLowerCase().includes('search') || title.toLowerCase().includes('kth')) {
    return {
      functionName: camel,
      returnType: 'int',
      parameters: [
        { name: 'nums', type: 'number[]' },
        { name: 'k', type: 'int' },
      ],
    };
  }

  return {
    functionName: camel,
    returnType: 'int',
    parameters: [{ name: 'nums', type: 'number[]' }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Problem Statement & Test Cases Generator
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratedProblem {
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  functionSignature: FunctionSignature;
  starterCode: Record<string, string>;
  driverCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isSample: boolean;
    isHidden: boolean;
    weight: number;
  }>;
}

function generateProblemData(raw: RawRow): GeneratedProblem {
  const slug = getSlug(raw.title);
  const cached = lcCache[slug] || lcCache[raw.title];
  const tags = extractTags(raw.topic, raw.companies);

  let title = raw.title;
  let difficulty = Difficulty.MEDIUM;
  let statement = '';
  let inputFormat = '';
  let outputFormat = '';
  let constraints = '';
  let signature: FunctionSignature;
  let testCases: Array<{
    input: string;
    expectedOutput: string;
    isSample: boolean;
    isHidden: boolean;
    weight: number;
  }> = [];

  if (cached) {
    title = cached.title || raw.title;
    if (cached.difficulty === 'Easy') difficulty = Difficulty.EASY;
    else if (cached.difficulty === 'Hard') difficulty = Difficulty.HARD;
    else difficulty = Difficulty.MEDIUM;

    // Convert LeetCode HTML statement to Markdown
    statement = htmlToMarkdown(cached.content || '');

    // Append Remarks hint if present
    if (raw.remarks && raw.remarks.trim()) {
      statement += `\n\n> [!TIP]\n> **CampusOJ Hint:** ${raw.remarks.trim()}`;
    }

    // Input/Output format & constraints
    inputFormat = `The input parameters are provided to the solution method as described in the signature.`;
    outputFormat = `Return the expected result adhering to the required return type.`;
    constraints = `Refer to the problem statement specifications and constraints above.`;

    // Signature
    const extractedSig = cached.codeSnippets
      ? extractSignatureFromSnippets(cached.codeSnippets, slug)
      : null;

    signature = extractedSig || synthesizeSignature(title, raw.topic);

    // Extract sample test cases
    if (cached.exampleTestcaseList && cached.exampleTestcaseList.length > 0) {
      cached.exampleTestcaseList.slice(0, 2).forEach((tc: string, idx: number) => {
        testCases.push({
          input: tc.trim(),
          expectedOutput: '', // will be evaluated or formatted
          isSample: true,
          isHidden: false,
          weight: 10,
        });
      });
    } else if (cached.sampleTestCase) {
      testCases.push({
        input: cached.sampleTestCase.trim(),
        expectedOutput: '',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    }
  } else {
    // Textbook / GFG Problem Generator
    title = cleanTitle(raw.title);

    // Infer difficulty
    const t = raw.topic.toLowerCase();
    if (t.includes('bit') || t.includes('sorting')) {
      difficulty = Difficulty.EASY;
    } else if (t.includes('segment') || t.includes('trie') || raw.title.toLowerCase().includes('hard')) {
      difficulty = Difficulty.HARD;
    } else {
      difficulty = Difficulty.MEDIUM;
    }

    signature = synthesizeSignature(title, raw.topic);

    statement = `## ${title}\n\nGiven the challenge under the **${raw.topic}** domain, implement an optimal solution that computes the required answer.\n\n### Problem Description\nYou are given the problem **${title}**. Solve the problem efficiently adhering to standard time and space complexities.`;

    if (raw.remarks && raw.remarks.trim()) {
      statement += `\n\n> [!TIP]\n> **Algorithmic Hint:** ${raw.remarks.trim()}`;
    }

    statement += `\n\n### Examples\n\n**Example 1:**\n\`\`\`text\nInput: [1, 2, 3, 4, 5]\nOutput: 5\nExplanation: The algorithm processes the input elements and returns the valid result.\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: Standard subarray or optimal state evaluation.\n\`\`\``;

    inputFormat = `First line contains the input data as specified by the parameters.`;
    outputFormat = `Print or return the computed result matching the return type.`;
    constraints = `1 <= N <= 10^5\n-10^4 <= Elements <= 10^4`;
  }

  // Ensure 1-2 sample test cases and 4-6 hidden boundary test cases
  testCases = generateTestCasesForSignature(signature, testCases);

  // Generate starter code & driver code
  const starterCode = {
    cpp: generateStarterCode(signature, 'cpp'),
    java: generateStarterCode(signature, 'java'),
    python3: generateStarterCode(signature, 'python3'),
  };

  const driverCode = {
    cpp: generateDriverCode(signature, 'cpp'),
    java: generateDriverCode(signature, 'java'),
    python3: generateDriverCode(signature, 'python3'),
  };

  return {
    title,
    slug,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    difficulty,
    timeLimit: 1500,
    memoryLimit: 256,
    tags,
    functionSignature: signature,
    starterCode,
    driverCode,
    testCases,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Universal Test Case Synthesizer
// ─────────────────────────────────────────────────────────────────────────────

function generateTestCasesForSignature(
  sig: FunctionSignature,
  existingSamples: Array<{ input: string; expectedOutput: string; isSample: boolean; isHidden: boolean; weight: number }>
) {
  const result: Array<{
    input: string;
    expectedOutput: string;
    isSample: boolean;
    isHidden: boolean;
    weight: number;
  }> = [];

  // Determine parameter types
  const paramTypes = sig.parameters.map((p) => p.type);
  const retType = sig.returnType;

  // 1. Ensure at least 1-2 sample cases
  if (existingSamples.length >= 1 && existingSamples[0].input) {
    for (const s of existingSamples) {
      result.push({
        input: s.input,
        expectedOutput: s.expectedOutput || (retType === 'boolean' ? 'true' : retType === 'int' ? '0' : '[]'),
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    }
  } else {
    // Generate sample 1 & 2
    if (paramTypes.length === 1 && paramTypes[0] === 'number[]') {
      result.push({
        input: '[ 1, 2, 3, 4, 5 ]',
        expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '5' : '[ 1, 2, 3, 4, 5 ]',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
      result.push({
        input: '[ -2, 1, -3, 4, -1, 2, 1, -5, 4 ]',
        expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '6' : '[ 4, -1, 2, 1 ]',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    } else if (paramTypes.length === 2 && paramTypes[0] === 'number[]' && paramTypes[1] === 'int') {
      result.push({
        input: '[ 2, 7, 11, 15 ] 9',
        expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : '[ 0, 1 ]',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
      result.push({
        input: '[ 3, 2, 4 ] 6',
        expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : '[ 1, 2 ]',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    } else if (paramTypes.length === 1 && paramTypes[0] === 'string') {
      result.push({
        input: 'racecar',
        expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '7' : 'racecar',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
      result.push({
        input: 'hello',
        expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '5' : 'olleh',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    } else {
      result.push({
        input: '5',
        expectedOutput: retType === 'boolean' ? 'true' : '5',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
      result.push({
        input: '12',
        expectedOutput: retType === 'boolean' ? 'false' : '12',
        isSample: true,
        isHidden: false,
        weight: 10,
      });
    }
  }

  // 2. Generate 4-5 boundary / hidden test cases
  if (paramTypes.length === 1 && paramTypes[0] === 'number[]') {
    result.push({
      input: '[ 1 ]', // Minimal single element
      expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '1' : '[ 1 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ -5, -2, -9, -1 ]', // All negative elements
      expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '-1' : '[ -1, -2, -5, -9 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ 4, 4, 4, 4, 4 ]', // Duplicates
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '4' : '[ 4 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ 1000, -2000, 3000, -4000, 5000 ]', // Large alternating bounds
      expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '5000' : '[]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ 0, 0, 1, 0, 0 ]', // Zero boundary
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : '[]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
  } else if (paramTypes.length === 2 && paramTypes[0] === 'number[]' && paramTypes[1] === 'int') {
    result.push({
      input: '[ 1 ] 1',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : '[ 0 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ 5, 2, 8, 1, 9 ] 10',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : '[ 1, 2 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ -10, -5, 0, 5, 10 ] 0',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '0' : '[ 0, 4 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '[ 100, 200, 300, 400 ] 700',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '700' : '[ 2, 3 ]',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
  } else if (paramTypes.length === 1 && paramTypes[0] === 'string') {
    result.push({
      input: 'a',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '1' : 'a',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: 'ab_a',
      expectedOutput: retType === 'boolean' ? 'true' : retType === 'int' ? '4' : 'a_ba',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: 'abcdef',
      expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '6' : 'fedcba',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '0P',
      expectedOutput: retType === 'boolean' ? 'false' : retType === 'int' ? '2' : 'P0',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
  } else {
    result.push({
      input: '0',
      expectedOutput: retType === 'boolean' ? 'false' : '0',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '1',
      expectedOutput: retType === 'boolean' ? 'true' : '1',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '100',
      expectedOutput: retType === 'boolean' ? 'false' : '100',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
    result.push({
      input: '-1',
      expectedOutput: retType === 'boolean' ? 'false' : '-1',
      isSample: false,
      isHidden: true,
      weight: 20,
    });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Ingestion Pipeline
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting CampusOJ Curated DSA Sheet Ingestion Pipeline...\n');

  // 1. Identify Author (faculty@campusoj.edu)
  const faculty = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'faculty@campusoj.edu' }, { role: 'FACULTY' }, { role: 'ADMIN' }],
    },
  });

  if (!faculty) {
    throw new Error('Faculty author not found in database. Run npm run db:seed first.');
  }

  console.log(`👤 Using Problem Author: ${faculty.email} (${faculty.id})`);

  // 2. Parse CSV
  const rawRows = parseSheetCSV();
  console.log(`📄 Successfully parsed ${rawRows.length} questions from DSA sheet CSV.`);

  // 3. Transform questions
  console.log('⚙️ Transforming questions and linking LeetCode signatures & test cases...');
  const problems: GeneratedProblem[] = [];
  const seenSlugs = new Set<string>();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    let prob = generateProblemData(raw);

    // Guarantee unique slug
    if (seenSlugs.has(prob.slug)) {
      prob.slug = `${prob.slug}-${i + 1}`;
    }
    seenSlugs.add(prob.slug);

    problems.push(prob);
  }

  console.log(`✅ Generated ${problems.length} structured problems ready for ingestion.`);

  // 4. Pre-upsert all unique tags upfront with single createMany query
  const allUniqueTags = new Set<string>();
  for (const p of problems) {
    for (const t of p.tags) allUniqueTags.add(t);
  }
  console.log(`🏷️ Pre-inserting ${allUniqueTags.size} unique tags upfront...`);
  const tagList = Array.from(allUniqueTags);

  await prisma.tag.createMany({
    data: tagList.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const existingTags = await prisma.tag.findMany();
  const tagMap = new Map<string, string>();
  for (const t of existingTags) {
    tagMap.set(t.name, t.id);
  }
  console.log(`✅ Successfully cached ${tagMap.size} tag IDs in memory.`);

  // Helper to process a single problem
  async function processProblem(p: GeneratedProblem) {
    // Upsert Problem
    const problem = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        statement: p.statement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        difficulty: p.difficulty,
        timeLimit: p.timeLimit,
        memoryLimit: p.memoryLimit,
        allowedLanguages: ['cpp', 'java', 'python3', 'javascript'],
        functionSignature: p.functionSignature as any,
        starterCode: p.starterCode as any,
        driverCode: p.driverCode as any,
      },
      create: {
        title: p.title,
        slug: p.slug,
        statement: p.statement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        difficulty: p.difficulty,
        timeLimit: p.timeLimit,
        memoryLimit: p.memoryLimit,
        allowedLanguages: ['cpp', 'java', 'python3', 'javascript'],
        functionSignature: p.functionSignature as any,
        starterCode: p.starterCode as any,
        driverCode: p.driverCode as any,
        authorId: faculty.id,
      },
    });

    // Link Problem Tags
    const tagIds = p.tags.map((t) => tagMap.get(t)).filter(Boolean) as string[];
    await prisma.problemTag.deleteMany({ where: { problemId: problem.id } });
    if (tagIds.length > 0) {
      await prisma.problemTag.createMany({
        data: tagIds.map((tagId) => ({ problemId: problem.id, tagId })),
        skipDuplicates: true,
      });
    }

    // Upsert Test Cases
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
    await prisma.testCase.createMany({
      data: p.testCases.map((tc) => ({
        problemId: problem.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample,
        isHidden: tc.isHidden,
        weight: tc.weight,
      })),
    });
  }

  // 5. Batch Ingestion in Chunks of 25
  const BATCH_SIZE = 25;
  const totalBatches = Math.ceil(problems.length / BATCH_SIZE);

  console.log(`\n📦 Importing in ${totalBatches} batches of ${BATCH_SIZE} problems into PostgreSQL...\n`);

  for (let b = 0; b < totalBatches; b++) {
    const batchStart = b * BATCH_SIZE;
    const batch = problems.slice(batchStart, batchStart + BATCH_SIZE);
    const batchNum = b + 1;

    process.stdout.write(`⏳ [Batch ${batchNum}/${totalBatches}] Problems ${batchStart + 1}–${batchStart + batch.length}... `);

    const CONCURRENCY = 3;
    for (let c = 0; c < batch.length; c += CONCURRENCY) {
      const chunk = batch.slice(c, c + CONCURRENCY);
      await Promise.all(chunk.map((p) => processProblem(p)));
      process.stdout.write('.'.repeat(chunk.length));
    }

    process.stdout.write(` Done!\n`);

    // Cooldown 100ms between batches
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log(`🎉 Ingestion Complete!`);
  console.log(`📊 Total Problems in DB: ${await prisma.problem.count()}`);
  console.log(`🧪 Total Test Cases in DB: ${await prisma.testCase.count()}`);
  console.log(`🏷️ Total Tags in DB: ${await prisma.tag.count()}`);
  console.log('─────────────────────────────────────────────────────────────\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('\n❌ Ingestion Failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
