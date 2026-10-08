import * as fs from 'fs';
import * as path from 'path';

const map: Record<string, { paramTypes: string[], returnType: string }> = {
  // DP / Strings / General
  'longest-palindromic-subsequnce': { paramTypes: ['string'], returnType: 'int' },
  'ncr': { paramTypes: ['int', 'int'], returnType: 'int' },
  'catalan-number': { paramTypes: ['int'], returnType: 'int' },
  'coin-game': { paramTypes: ['number[]'], returnType: 'boolean' },
  'coin-game-winner': { paramTypes: ['int', 'int', 'int'], returnType: 'boolean' },
  'mobile-numeric-keypad': { paramTypes: ['int'], returnType: 'int' },
  'count-all-subsequences-having-product-less-than-k': { paramTypes: ['number[]', 'int'], returnType: 'int' },
  'maximize-the-cut-segments': { paramTypes: ['int', 'int', 'int', 'int'], returnType: 'int' },
  'fractional-knapsack-problem': { paramTypes: ['number[]', 'number[]', 'int'], returnType: 'int' },
  'knapsack-problem': { paramTypes: ['int', 'number[]', 'number[]'], returnType: 'int' },
  'knapsack-with-duplicate-items': { paramTypes: ['int', 'number[]', 'number[]'], returnType: 'int' },
  'gold-mine': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'longest-subsequence-1': { paramTypes: ['number[]'], returnType: 'int' },
  'longest-alternating-sequence': { paramTypes: ['number[]'], returnType: 'int' },
  'maximum-sum-increasing-subsequence': { paramTypes: ['number[]'], returnType: 'int' },
  'maximum-sum-increasing-subsequence-335': { paramTypes: ['number[]'], returnType: 'int' },
  'max-length-chain': { paramTypes: ['number[]'], returnType: 'int' },
  
  // Bit Manipulation
  'count-set-bits-in-an-integer': { paramTypes: ['int'], returnType: 'int' },
  'count-number-of-bits-to-be-flipped-to-convert-a-to-b': { paramTypes: ['int', 'int'], returnType: 'int' },
  'count-total-set-bits-in-all-numbers-from-1-to-n': { paramTypes: ['int'], returnType: 'int' },
  'find-position-of-the-only-set-bit': { paramTypes: ['int'], returnType: 'int' },
  'calculate-square-of-a-number-without-using-and-pow': { paramTypes: ['int'], returnType: 'int' },
  'copy-set-bits-in-a-range': { paramTypes: ['int', 'int', 'int', 'int'], returnType: 'int' },

  // Arrays
  'find-surpasser-count-of-each-element-in-array': { paramTypes: ['number[]'], returnType: 'number[]' },
  'k-maximum-sum-combinations-from-two-arrays': { paramTypes: ['number[]', 'number[]', 'int'], returnType: 'number[]' },
  'find-the-two-non-repeating-elements-in-an-array-of-repeating-elements': { paramTypes: ['number[]'], returnType: 'number[]' },
  'find-pair-with-sum-in-sorted-rotated-array': { paramTypes: ['number[]', 'int'], returnType: 'boolean' },
  'find-minimum-number-of-merge-operations-to-make-an-array-palindrome': { paramTypes: ['number[]'], returnType: 'int' },
  'print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n': { paramTypes: ['number[]', 'int'], returnType: 'number[]' },
  'piar-with-given-difference': { paramTypes: ['number[]', 'int'], returnType: 'boolean' },
  'find-duplicates-in-on-time-and-o1-extra-space': { paramTypes: ['number[]'], returnType: 'number[]' },
  'find-four-elements-that-sum-to-a-given-value': { paramTypes: ['number[]', 'int'], returnType: 'number[]' },
  'maximize-sum-of-consecutive-differences-circular-array': { paramTypes: ['number[]'], returnType: 'int' },
  'lexicographically-smallest-array-k-consecutive-swaps': { paramTypes: ['number[]', 'int'], returnType: 'number[]' },
  'minimum-cost-for-acquiring-all-coins-with-k-extra-coins-allowed-with-every-coin': { paramTypes: ['number[]', 'int'], returnType: 'int' },
  'find-minimum-time-to-finish-all-jobs-with-given-constraints': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'kth-smallestlargest-element-in-unsorted-array': { paramTypes: ['number[]', 'int'], returnType: 'int' },
  'range-minimum-query': { paramTypes: ['number[]', 'number[]'], returnType: 'number[]' },

  // Trees
  'zigzag-tree-traversal': { paramTypes: ['number[]'], returnType: 'number[]' },
  'reverse-level-order-traversal': { paramTypes: ['number[]'], returnType: 'number[]' },
  'left-view-of-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'right-view-of-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'height-of-binary-tree': { paramTypes: ['number[]'], returnType: 'int' },
  'bottom-view-of-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'boundary-traversal-of-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'diagonal-traversal-of-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'create-a-mirror-tree-from-the-given-binary-tree': { paramTypes: ['number[]'], returnType: 'number[]' },
  'check-if-tree-is-isomorphic': { paramTypes: ['number[]', 'number[]'], returnType: 'boolean' },
  'lowest-common-ancestor-in-a-binary-tree': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'kth-ancestor-of-a-node-in-binary-tree': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'bbt-counter': { paramTypes: ['int'], returnType: 'int' },

  // Strings
  'check-for-palindrome': { paramTypes: ['string'], returnType: 'boolean' },
  'given-a-sequence-of-words-print-all-anagrams-together': { paramTypes: ['string[]'], returnType: 'string[]' },
  'implement-a-phone-directory': { paramTypes: ['string[]', 'string'], returnType: 'string[]' },
  'find-shortest-unique-prefix-for-every-word-in-a-given-list': { paramTypes: ['string[]'], returnType: 'string[]' },
  'boyer-moore-algorithm-for-pattern-searching': { paramTypes: ['string', 'string'], returnType: 'number[]' },
  'evaluation-of-postfix-expression': { paramTypes: ['string'], returnType: 'int' },
  'allen-dictionary': { paramTypes: ['string[]', 'int', 'int'], returnType: 'string' },

  // Graphs
  'bfs': { paramTypes: ['int', 'number[]'], returnType: 'number[]' },
  'dfs': { paramTypes: ['int', 'number[]'], returnType: 'number[]' },
  'detect-cycle-in-a-graph': { paramTypes: ['int', 'number[]'], returnType: 'boolean' },
  'floyd-warshall': { paramTypes: ['number[]'], returnType: 'number[]' },
  'kosarajus-theorem': { paramTypes: ['int', 'number[]'], returnType: 'number[]' },
  'journey-to-moon': { paramTypes: ['int', 'number[]'], returnType: 'int' },
  'graph-coloring': { paramTypes: ['int', 'number[]'], returnType: 'boolean' },
  'm-coloring-problem-284': { paramTypes: ['int', 'number[]', 'int'], returnType: 'boolean' },
  'bellman-ford': { paramTypes: ['int', 'number[]', 'int'], returnType: 'number[]' },
  'kruskals-mst': { paramTypes: ['int', 'number[]'], returnType: 'int' },
  'find-longest-path-directed-acyclic-graph': { paramTypes: ['int', 'number[]', 'int'], returnType: 'number[]' },
  'chinese-postman': { paramTypes: ['int', 'number[]'], returnType: 'int' },
  'check-if-a-given-graph-is-tree-or-not': { paramTypes: ['int', 'number[]'], returnType: 'boolean' },

  // Matrices / Grid
  'largest-area-rectangular-sub-matrix-with-equal-number-of-1s-and-0s': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'largest-submatrix-with-sum-0': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  'create-a-matrix-with-alternating-rectangles-of-o-and-x': { paramTypes: ['int', 'int'], returnType: 'string[]' },
  'find-shortest-safe-route-in-a-path-with-landmines': { paramTypes: ['number[]', 'int', 'int'], returnType: 'int' },
  
  // Others
  'problems-chocola': { paramTypes: ['int', 'int', 'number[]', 'number[]'], returnType: 'int' },
  'implement-stack-queue-using-deque': { paramTypes: ['number[]'], returnType: 'number[]' },
  'find-maximum-height-pyramid-from-the-given-array-of-objects': { paramTypes: ['number[]', 'number[]'], returnType: 'int' },
  'job-sequencing-using-disjoint-set-union': { paramTypes: ['number[]', 'number[]', 'number[]'], returnType: 'int' },
};

function main() {
  const dataPath = path.join(__dirname, 'data', 'curated-sheet-problems.json');
  const catalog = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let patched = 0;
  for (const item of catalog) {
    if (map[item.slug]) {
      item.paramTypes = map[item.slug].paramTypes;
      item.returnType = map[item.slug].returnType;

      // Ensure statement description is clean
      if (item.description.includes('Solve the problem:')) {
        item.description = `## ${item.title}\n\nSolve the problem: **${item.title}**.\n\n### Examples\n\n**Example 1:**\n\`\`\`text\nInput: ${item.paramTypes.map((t: string, i: number) => `arg${i} = ...`).join(', ')}\nOutput: ...\n\`\`\`\n\n### Constraints\n- constraints here`;
      }

      patched++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(catalog, null, 2));
  console.log(`Patched ${patched} exact problem signatures in curated-sheet-problems.json`);
}

main();
