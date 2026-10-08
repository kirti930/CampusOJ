import fs from 'fs';
import path from 'path';

interface RawItem {
  index: number;
  topic: string;
  title: string;
  companies: string;
  remarks: string;
}

const items: RawItem[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'parsed-sheet.json'), 'utf8')
);

const CACHE_FILE = path.resolve(__dirname, 'lc-cache.json');
let cache: Record<string, any> = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

// Normalized title mappings to known LeetCode slugs
const SLUG_MAP: Record<string, string> = {
  "Maximum and Minimum Element in an Array": "minimum-and-maximum-element-in-an-array",
  "Reverse the Array": "reverse-string",
  "Maximum-Subarray": "maximum-subarray",
  "Contains Duplicate": "contains-duplicate",
  "Search in Rotated Sorted Array": "search-in-rotated-sorted-array",
  "Next Permutation": "next-permutation",
  "Best time to Buy and Sell Stock": "best-time-to-buy-and-sell-stock",
  "Repeat and Missing Number Array": "set-mismatch",
  "Kth-Largest Element in an Array": "kth-largest-element-in-an-array",
  "Trapping Rain Water": "trapping-rain-water",
  "Product of Array Except Self": "product-of-array-except-self",
  "Maximum Product Subarray": "maximum-product-subarray",
  "Find Minimum in Rotated Sorted Array": "find-minimum-in-rotated-sorted-array",
  "3Sum": "3sum",
  "Container With Most Water": "container-with-most-water",
  "Given Sum Pair": "two-sum",
  "Kth - Smallest Element": "kth-smallest-element-in-a-sorted-matrix",
  "Merge Overlapping Intervals": "merge-intervals",
  "Given an Array of Numbers Arrange the Numbers to Form the Biggest Number": "largest-number",
  "Subarray Sum Divisible K": "subarray-sums-divisible-by-k",
  "Valid Palindrome": "valid-palindrome",
  "Valid Anagram": "valid-anagram",
  "Valid parentheses": "valid-parentheses",
  "Remove Consecutive Characters": "remove-all-adjacent-duplicates-in-string",
  "Longest Common Prefix": "longest-common-prefix",
  "Longest Substring without Repeating Characters": "longest-substring-without-repeating-characters",
  "Longest Repeating Character Replacement": "longest-repeating-character-replacement",
  "Group Anagrams": "group-anagrams",
  "Longest Palindromic Substring": "longest-palindromic-substring",
  "Palindromic Substrings": "palindromic-substrings",
  "Set Matrix Zeroes": "set-matrix-zeroes",
  "Spiral Matrix": "spiral-matrix",
  "Rotate Image": "rotate-image",
  "Word Search": "word-search",
  "Maximum Size Rectangle of all 1s": "maximal-rectangle",
  "majority element": "majority-element",
  "Combinational Sum": "combination-sum",
  "Printing all solutions in N-Queen Problem": "n-queens",
  "Solve the Sudoku": "sudoku-solver",
  "Partition Equal Subset Sum": "partition-equal-subset-sum",
  "Soduko": "valid-sudoku",
  "Reverse Linked List": "reverse-linked-list",
  "Linked List Cycle": "linked-list-cycle",
  "Merge Two Sorted Lists": "merge-two-sorted-lists",
  "Remove nth node from end of list": "remove-nth-node-from-end-of-list",
  "Reorder List": "reorder-list",
  "Implement two stacks in an Array": "implement-queue-using-stacks",
  "Implement Stack using Queues": "implement-stack-using-queues",
  "Activity selection problem greedy algo": "non-overlapping-intervals",
  "Job sequencing problem": "course-schedule-iii",
  "Maximum Depth of Binary Tree": "maximum-depth-of-binary-tree",
  "Invert Binary Tree": "invert-binary-tree",
  "Binary Tree Level Order Traversal": "binary-tree-level-order-traversal",
  "Subtree of Another Tree": "subtree-of-another-tree",
  "Lowest Common Ancestor of a Binary Search Tree": "lowest-common-ancestor-of-a-binary-search-tree",
  "Validate Binary Search Tree": "validate-binary-search-tree",
  "Kth Smallest Element in a BST": "kth-smallest-element-in-a-bst",
  "Top K Frequent Elements": "top-k-frequent-elements",
  "Climbing Stairs": "climbing-stairs",
  "Coin Change": "coin-change",
  "Longest Increasing Subsequence": "longest-increasing-subsequence",
  "Longest Common Subsequence": "longest-common-subsequence",
  "Word Break": "word-break",
  "House Robber": "house-robber",
  "House Robber II": "house-robber-ii",
  "Decode Ways": "decode-ways",
  "Unique Paths": "unique-paths",
  "Jump Game": "jump-game",
  "Clone graph": "clone-graph",
  "Number of Operations to Make Network Connected": "number-of-operations-to-make-network-connected",
  "Course Schedule": "course-schedule",
  "Counting Bits": "counting-bits",
  "Number of 1 Bits": "number-of-1-bits",
  "Reverse Bits": "reverse-bits",
  "Divide two integers without using multiplication, division and mod operator": "divide-two-integers",
  "Power Set": "subsets",
  "Range Sum Query - Immutable": "range-sum-query-immutable",
  "Range Sum Query - Mutable": "range-sum-query-mutable",
  "Count of Smaller Numbers After Self": "count-of-smaller-numbers-after-self",
  "Count of Range Sum": "count-of-range-sum",
  "Create Sorted Array through Instructions": "create-sorted-array-through-instructions",
};

export function cleanTitle(title: string): string {
  return title
    .replace(/^Set \d+.*?[-:]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toSlug(title: string): string {
  if (SLUG_MAP[title]) return SLUG_MAP[title];
  const cleaned = cleanTitle(title);
  if (SLUG_MAP[cleaned]) return SLUG_MAP[cleaned];
  return cleaned
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function fetchFromLeetCode(titleSlug: string) {
  if (cache[titleSlug] !== undefined) {
    return cache[titleSlug];
  }

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              titleSlug
              content
              difficulty
              codeSnippets {
                langSlug
                code
              }
              sampleTestCase
              exampleTestcaseList
            }
          }
        `,
        variables: { titleSlug },
      }),
    });

    if (!res.ok) {
      cache[titleSlug] = null;
      return null;
    }

    const data = await res.json();
    const q = data?.data?.question;
    cache[titleSlug] = q || null;
    return q || null;
  } catch (err) {
    // Return null without throwing
    cache[titleSlug] = null;
    return null;
  }
}

async function main() {
  console.log(`Starting LeetCode metadata lookup for ${items.length} problems...`);
  let matched = 0;
  let missing = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = toSlug(item.title);
    const result = await fetchFromLeetCode(slug);
    if (result) {
      matched++;
      process.stdout.write(`✓ [${i + 1}/${items.length}] ${slug} (${result.difficulty})\n`);
    } else {
      missing++;
      process.stdout.write(`- [${i + 1}/${items.length}] ${slug} (Not on LC / GFG)\n`);
    }

    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
      console.log(`💾 Cache saved at problem ${i + 1}`);
    }

    // Delay 120ms to be polite
    await new Promise((r) => setTimeout(r, 120));
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\n🎉 Finished lookup: ${matched} matched on LeetCode, ${missing} textbook/GFG questions.`);
}

main().catch(console.error);
