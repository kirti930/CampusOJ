import { RichProblemSpec } from './rich-problem-specs-part1';

export const SPECS_PART3: Record<string, RichProblemSpec> = {
  'job-sequencing-using-disjoint-set-union': {
    title: 'Job Sequencing Using Disjoint Set Union',
    statement: `Given a set of \`n\` jobs where each job \`i\` has a deadline and profit, maximize total profit earned such that each job is completed on or before its deadline. Each job takes 1 unit of time to complete.

Use the **Disjoint Set Union (DSU)** data structure to find the latest available time slot for each job efficiently.

Return an array \`[numberOfJobsDone, maxProfit]\`.

### Examples

**Example 1:**
\`\`\`text
Input: jobs = [[1, 4, 20], [2, 1, 10], [3, 1, 40], [4, 1, 30]] (format: [jobId, deadline, profit])
Output: [2, 60]
Explanation: Job 3 (profit 40) is scheduled at time slot 1. Job 1 (profit 20) is scheduled at slot 4. Total profit = 60.
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`1 <= deadline <= 10^5\`
- \`1 <= profit <= 10^5\``,
    inputFormat: 'Array of jobs [id, deadline, profit].',
    outputFormat: '[count, maxProfit].',
    constraints: '1 <= n <= 10^5',
  },

  'journey-to-moon': {
    title: 'Journey to the Moon',
    statement: `The member states of the UN are planning to send 2 astronauts to the moon. They want them to be from **different countries**.

You are given the number of astronauts \`n\` and an array of astronaut pairs from the same country \`astronaut\`.

Determine how many pairs of astronauts from different countries can be chosen to embark on the mission.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, astronaut = [[0, 1], [2, 3], [0, 4]]
Output: 6
Explanation:
Country 1: [0, 1, 4] (size 3)
Country 2: [2, 3] (size 2)
Pairs from different countries: 3 * 2 = 6.
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= astronaut.length <= 10^4\``,
    inputFormat: 'Total astronauts n and pairs array.',
    outputFormat: 'Total valid pairs count.',
    constraints: '1 <= n <= 10^5',
  },

  'k-th-smallest-element-after-removing-some-integers-from-natural-numbers': {
    title: 'K-th Smallest Element After Removing Natural Numbers',
    statement: `Given an array of integers \`removed\` that are removed from natural numbers (\`1, 2, 3, 4, ...\`), find the **k-th smallest natural number** remaining after removals.

### Examples

**Example 1:**
\`\`\`text
Input: removed = [1, 3], k = 4
Output: 6
Explanation: Remaining numbers: 2, 4, 5, 6, 7, ... The 4th smallest is 6.
\`\`\`

### Constraints
- \`1 <= removed.length <= 10^5\`
- \`1 <= k <= 10^9\``,
    inputFormat: 'Array removed and integer k.',
    outputFormat: 'k-th remaining natural number.',
    constraints: '1 <= k <= 10^9',
  },

  'knight-tour': {
    title: "Knight's Tour Problem",
    statement: `A **Knight's Tour** is a sequence of moves of a knight on a chessboard such that the knight visits every square exactly once.

Given an \`n x n\` chessboard, find a valid Knight's Tour starting from position \`(0, 0)\`.

Return an \`n x n\` grid where \`grid[r][c]\` is the step number (from \`0\` to \`n^2 - 1\`) at which square \`(r, c)\` was visited.

### Examples

**Example 1:**
\`\`\`text
Input: n = 8
Output: An 8x8 matrix filled with step numbers 0 to 63 representing a valid knight's tour.
\`\`\`

### Constraints
- \`1 <= n <= 8\``,
    inputFormat: 'Board size n.',
    outputFormat: 'n x n step matrix.',
    constraints: '1 <= n <= 8',
  },

  'kosarajus-theorem': {
    title: "Kosaraju's Algorithm for Strongly Connected Components",
    statement: `Given a directed graph with \`n\` vertices numbered from \`0\` to \`n - 1\` and an adjacency list \`adj\`, find the number of **Strongly Connected Components (SCCs)** in the graph using **Kosaraju's two-pass algorithm**.

A Strongly Connected Component is a maximal subgraph where every vertex is reachable from every other vertex in the subgraph.

Return the total count of SCCs.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, adj = [[2, 3], [0], [1], [4], []]
Output: 3
Explanation: The SCCs are {0, 1, 2}, {3}, and {4}.
\`\`\`

### Constraints
- \`1 <= n <= 5000\`
- \`0 <= edges <= 5 * 10^4\``,
    inputFormat: 'Number of vertices and adjacency list.',
    outputFormat: 'Count of strongly connected components.',
    constraints: '1 <= n <= 5000',
  },

  'kruskals-mst': {
    title: "Kruskal's Minimum Spanning Tree Algorithm",
    statement: `Given a connected, undirected, weighted graph with \`n\` vertices and a list of edges \`edges\` where \`edges[i] = [u, v, w]\`, find the total weight of the **Minimum Spanning Tree (MST)** using **Kruskal's algorithm** with Disjoint Set Union (DSU).

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]
Output: 19
Explanation: Minimum spanning tree includes edges:
- [2, 3] with weight 4
- [0, 3] with weight 5
- [0, 1] with weight 10
Total MST weight = 4 + 5 + 10 = 19.
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`1 <= edges.length <= 10^5\`
- \`1 <= w <= 10^4\``,
    inputFormat: 'Number of vertices n and edge list [u, v, w].',
    outputFormat: 'Sum of weights of edges in the MST.',
    constraints: '1 <= n <= 10^4',
  },

  'kth-ancestor-of-a-node-in-binary-tree': {
    title: 'K-th Ancestor of a Node in Binary Tree',
    statement: `Given a binary tree and a target node value \`node\`, find the value of its **k-th ancestor**.

If no such ancestor exists (the node is fewer than \`k\` levels below the root), return \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, 5], node = 4, k = 2
Output: 1
Explanation: 1st ancestor of 4 is 2. 2nd ancestor is 1.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`1 <= k <= 10^5\``,
    inputFormat: 'Binary tree root, target node, and integer k.',
    outputFormat: 'Value of k-th ancestor or -1.',
    constraints: '1 <= nodes <= 10^5',
  },

  'kth-largest-element-in-bst': {
    title: 'K-th Largest Element in BST',
    statement: `Given the root of a Binary Search Tree (BST) and an integer \`k\`, find the **k-th largest element** in the BST.

Use reverse in-order traversal (right -> root -> left) to visit nodes in descending order.

### Examples

**Example 1:**
\`\`\`text
Input: root = [4, 2, 9, 1, 3, 7, 10], k = 3
Output: 7
Explanation: Elements in descending order: 10, 9, 7, 4, 3, 2, 1. The 3rd largest is 7.
\`\`\`

### Constraints
- Number of nodes is in range \`[1, 10^4]\`.
- \`1 <= k <= number of nodes\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of BST and integer k.',
    outputFormat: 'Value of k-th largest element.',
    constraints: '1 <= k <= nodes <= 10^4',
  },

  'largest-area-rectangular-sub-matrix-with-equal-number-of-1s-and-0s': {
    title: "Largest Rectangular Sub-matrix with Equal 0's and 1's",
    statement: `Given a binary matrix \`mat\` of size \`m x n\` containing only \`0\`s and \`1\`s, find the **area of the largest rectangular sub-matrix** that contains an equal number of \`0\`s and \`1\`s.

Return the maximum area. If no such sub-matrix exists, return \`0\`.

### Examples

**Example 1:**
\`\`\`text
Input: mat = [
  [0, 0, 1, 1],
  [0, 1, 1, 0],
  [1, 1, 1, 0]
]
Output: 6
Explanation: Sub-matrix from row 0 to 1 and col 0 to 2 has area 2 * 3 = 6 with three 0s and three 1s.
\`\`\`

### Constraints
- \`1 <= m, n <= 300\`
- \`mat[i][j] \\in {0, 1}\``,
    inputFormat: 'Dimensions m, n and binary matrix.',
    outputFormat: 'Maximum submatrix area.',
    constraints: '1 <= m, n <= 300',
  },

  'largest-bst-in-a-binary-tree': {
    title: 'Largest BST Subtree in a Binary Tree',
    statement: `Given the root of a binary tree, find the **size (number of nodes) of the largest subtree** that is also a Binary Search Tree (BST).

A subtree must include all of its descendants.

### Examples

**Example 1:**
\`\`\`text
Input: root = [10, 5, 15, 1, 8, null, 7]
Output: 3
Explanation: The subtree rooted at 5 (with children 1 and 8) is a valid BST of size 3.
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 10^4]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Size of largest BST subtree.',
    constraints: '0 <= nodes <= 10^4',
  },

  'largest-submatrix-with-sum-0': {
    title: 'Largest Submatrix with Sum 0',
    statement: `Given an \`m x n\` matrix of integers \`mat\`, find the **maximum area** of a rectangular sub-matrix whose elements sum to \`0\`.

Return the maximum area. If no such sub-matrix exists, return \`0\`.

### Examples

**Example 1:**
\`\`\`text
Input: mat = [
  [9, 7, 16, 5],
  [1, -6, -7, 3],
  [1, 8, 7, 9],
  [7, -2, 0, 10]
]
Output: 6
\`\`\`

### Constraints
- \`1 <= m, n <= 300\`
- \`-1000 <= mat[i][j] <= 1000\``,
    inputFormat: 'Dimensions m, n and integer matrix.',
    outputFormat: 'Maximum zero-sum submatrix area.',
    constraints: '1 <= m, n <= 300',
  },

  'leaf-at-same-level': {
    title: 'Check If All Leaf Nodes Are at the Same Level',
    statement: `Given a Binary Tree, determine whether all leaf nodes are at the exact same depth level.

Return \`true\` if all leaves are at the same level, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3]
Output: true
Explanation: Leaf nodes 2 and 3 are both at depth 2.
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [10, 20, 30, 10, 15]
Output: false
Explanation: Leaf 10 is at depth 3 while leaf 30 is at depth 2.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Boolean true if all leaves are at the same depth.',
    constraints: '1 <= nodes <= 10^5',
  },

  'left-view-of-binary-tree': {
    title: 'Left View of Binary Tree',
    statement: `Given a Binary Tree, return the **left view** of the tree.

The left view consists of the nodes that are visible when the tree is viewed from the left side (i.e. the first node at each level of the tree from top to bottom).

Return the node values as an array.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, 5, 6, 7]
Output: [1, 2, 4]
Explanation:
- Level 1: 1
- Level 2: 2
- Level 3: 4
Left view: [1, 2, 4].
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [1, 3, null, null, 4]
Output: [1, 3, 4]
\`\`\`

### Constraints
- Number of nodes in range \`[0, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values visible from left side.',
    constraints: '0 <= nodes <= 10^5',
  },

  'lexicographically-smallest-array-k-consecutive-swaps': {
    title: 'Lexicographically Smallest Array with At Most K Swaps',
    statement: `Given an array of \`n\` integers \`arr\` and an integer \`k\`, find the **lexicographically smallest array** that can be obtained by performing at most \`k\` consecutive element swaps.

In each step, you can greedily swap the smallest available element within range into the current index.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [7, 6, 9, 2, 1], k = 3
Output: [2, 7, 6, 9, 1]
Explanation: Element 2 is at distance 3 from index 0. Swapping 2 to index 0 uses 3 swaps.
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`1 <= k <= 10^9\`
- \`1 <= arr[i] <= 10^9\``,
    inputFormat: 'Array arr and integer k.',
    outputFormat: 'Lexicographically smallest array.',
    constraints: '1 <= n <= 10^4',
  },

  'linked-list-in-zig-zag-fashion': {
    title: 'Rearrange Linked List in Zig-Zag Fashion',
    statement: `Given a singly linked list, rearrange its nodes in-place so that they alternate in a **zig-zag fashion**:
\`a < b > c < d > e < f ...\`

That is:
- For even indices \`i\` (0, 2, 4...): \`node[i].val < node[i+1].val\`
- For odd indices \`i\` (1, 3, 5...): \`node[i].val > node[i+1].val\`

Return the head of the rearranged linked list.

### Examples

**Example 1:**
\`\`\`text
Input: head = [4, 3, 7, 8, 6, 2, 1]
Output: [3, 7, 4, 8, 2, 6, 1]
Explanation: 3 < 7 > 4 < 8 > 2 < 6 > 1.
\`\`\`

### Constraints
- \`1 <= nodes <= 10^5\`
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Head of linked list.',
    outputFormat: 'Head of rearranged zig-zag list.',
    constraints: '1 <= nodes <= 10^5',
  },

  'longest-palindromic-subsequnce': {
    title: 'Longest Palindromic Subsequence',
    statement: `Given a string \`s\`, find the **longest palindromic subsequence's length** in \`s\`.

A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.

### Examples

**Example 1:**
\`\`\`text
Input: s = "bbbab"
Output: 4
Explanation: One possible longest palindromic subsequence is "bbbb".
\`\`\`

**Example 2:**
\`\`\`text
Input: s = "cbbd"
Output: 2
Explanation: One possible longest palindromic subsequence is "bb".
\`\`\`

### Constraints
- \`1 <= s.length <= 1000\`
- \`s\` consists only of lowercase English letters.`,
    inputFormat: 'String s.',
    outputFormat: 'Integer length of longest palindromic subsequence.',
    constraints: '1 <= s.length <= 1000',
  },

  'longest-possible-route-in-a-matrix-with-hurdles': {
    title: 'Longest Possible Route in a Matrix with Hurdles',
    statement: `Given an \`m x n\` matrix where \`1\` represents an open cell and \`0\` represents a hurdle. Given starting cell \`(xs, ys)\` and destination \`(xd, yd)\`, find the **longest route** from source to destination without visiting any cell more than once.

Return the maximum number of steps. If no path exists, return \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: matrix = [
  [1, 1, 1, 1],
  [1, 1, 0, 1],
  [1, 1, 1, 1]
], src = [0, 0], dest = [1, 1]
Output: 9
\`\`\`

### Constraints
- \`1 <= m, n <= 10\`
- \`matrix[i][j] \\in {0, 1}\``,
    inputFormat: 'Grid, source coordinates, and destination coordinates.',
    outputFormat: 'Length of longest path or -1.',
    constraints: '1 <= m, n <= 10',
  },

  'longest-subsequence-1': {
    title: 'Longest Subsequence with Adjacent Difference 1',
    statement: `Given an array \`arr\` of \`n\` integers, find the length of the **longest subsequence** such that the absolute difference between every two adjacent elements in the subsequence is strictly **1**.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [10, 9, 4, 5, 4, 8, 6]
Output: 3
Explanation: The subsequence [4, 5, 4] or [10, 9, 8] has adjacent difference 1 and length 3.
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^5\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array of integers.',
    outputFormat: 'Length of longest valid subsequence.',
    constraints: '1 <= arr.length <= 10^5',
  },

  'longest-valid-string': {
    title: 'Longest Valid Parentheses',
    statement: `Given a string \`s\` containing just the characters \`'('\` and \`')'\`, return the length of the **longest valid (well-formed) parentheses** substring.

### Examples

**Example 1:**
\`\`\`text
Input: s = "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()".
\`\`\`

**Example 2:**
\`\`\`text
Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()".
\`\`\`

### Constraints
- \`0 <= s.length <= 3 * 10^4\`
- \`s[i]\` is \`'('\` or \`')'\`.`,
    inputFormat: 'Parentheses string s.',
    outputFormat: 'Length of longest valid parentheses substring.',
    constraints: '0 <= s.length <= 3 * 10^4',
  },

  'lowest-common-ancestor-in-a-binary-tree': {
    title: 'Lowest Common Ancestor in a Binary Tree',
    statement: `Given a binary tree, find the **Lowest Common Ancestor (LCA)** of two given nodes \`p\` and \`q\`.

The LCA is defined between two nodes \`p\` and \`q\` as the lowest node in the tree that has both \`p\` and \`q\` as descendants (where we allow a node to be a descendant of itself).

### Examples

**Example 1:**
\`\`\`text
Input: root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1
Output: 3
Explanation: The LCA of nodes 5 and 1 is 3.
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4
Output: 5
Explanation: The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[2, 10^5]\`.
- \`-10^9 <= Node.val <= 10^9\`
- All \`Node.val\` are unique.`,
    inputFormat: 'Binary tree root and target nodes p and q.',
    outputFormat: 'Root node of the lowest common ancestor.',
    constraints: '2 <= nodes <= 10^5',
  },

  'm-coloring-problem': {
    title: 'M-Coloring Problem',
    statement: `Given an undirected graph with \`n\` vertices and an integer \`m\`, determine if the graph can be colored with at most \`m\` colors such that **no two adjacent vertices share the same color**.

Return \`true\` if the graph can be colored, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], m = 3
Output: true
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`1 <= m <= n\`
- \`0 <= edges.length <= 100\``,
    inputFormat: 'n, edges, and m.',
    outputFormat: 'Boolean indicating if m-coloring is possible.',
    constraints: '1 <= n <= 20',
  },

  'm-coloring-problem-284': {
    title: 'M-Coloring Problem',
    statement: `Given an undirected graph with \`n\` vertices and an integer \`m\`, determine if the graph can be colored with at most \`m\` colors such that **no two adjacent vertices share the same color**.

Return \`true\` if the graph can be colored, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], m = 3
Output: true
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`1 <= m <= n\`
- \`0 <= edges.length <= 100\``,
    inputFormat: 'n, edges, and m.',
    outputFormat: 'Boolean indicating if m-coloring is possible.',
    constraints: '1 <= n <= 20',
  },

  'max-length-chain': {
    title: 'Maximum Length Chain of Pairs',
    statement: `You are given an array of \`n\` pairs of numbers \`pairs\` where \`pairs[i] = [left_i, right_i]\` and \`left_i < right_i\`.

A pair \`p2 = [c, d]\` follows a pair \`p1 = [a, b]\` if \`b < c\`. A chain of pairs can be formed in this fashion.

Return the **length longest chain** which can be formed.

### Examples

**Example 1:**
\`\`\`text
Input: pairs = [[1, 2], [2, 3], [3, 4]]
Output: 2
Explanation: The longest chain is [1, 2] -> [3, 4].
\`\`\`

**Example 2:**
\`\`\`text
Input: pairs = [[1, 2], [7, 8], [4, 5]]
Output: 3
Explanation: The longest chain is [1, 2] -> [4, 5] -> [7, 8].
\`\`\`

### Constraints
- \`1 <= pairs.length <= 2250\`
- \`-1000 <= left_i < right_i <= 1000\``,
    inputFormat: 'Array of pairs [a, b].',
    outputFormat: 'Maximum chain length.',
    constraints: '1 <= pairs.length <= 2250',
  },

  'maximize-the-cut-segments': {
    title: 'Maximize the Cut Segments',
    statement: `Given a line segment of length \`n\`, you want to cut it into the **maximum number of segments** such that each segment has length \`x\`, \`y\`, or \`z\`.

Return the maximum number of cuts possible. If it is impossible to make any cut such that the remaining length is 0, return \`0\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, x = 2, y = 1, z = 1
Output: 4
Explanation: Cut into 4 segments of length 1 (1 + 1 + 1 + 1 = 4).
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 5, x = 5, y = 3, z = 2
Output: 2
Explanation: Cut into segments of length 3 and 2 (3 + 2 = 5).
\`\`\`

### Constraints
- \`1 <= n, x, y, z <= 10^4\``,
    inputFormat: 'Integers n, x, y, z.',
    outputFormat: 'Maximum number of cut segments.',
    constraints: '1 <= n, x, y, z <= 10^4',
  },

  'maximum-possible-number-by-doing-at-most-k-swaps': {
    title: 'Maximum Number by Doing At Most K Swaps',
    statement: `Given a positive number represented as a string \`s\` and an integer \`k\`, find the **maximum possible number** that can be created by doing at most \`k\` swaps of digits.

Return the maximum number as a string.

### Examples

**Example 1:**
\`\`\`text
Input: s = "254", k = 1
Output: "524"
Explanation: Swap 2 and 5 to get 524.
\`\`\`

**Example 2:**
\`\`\`text
Input: s = "129814999", k = 4
Output: "999984211"
\`\`\`

### Constraints
- \`1 <= s.length <= 30\`
- \`1 <= k <= 10\``,
    inputFormat: 'String s of digits and integer k.',
    outputFormat: 'Maximum numeric string possible.',
    constraints: '1 <= s.length <= 30',
  },

  'maximum-sum-increasing-subsequence': {
    title: 'Maximum Sum Increasing Subsequence',
    statement: `Given an array \`arr\` of \`n\` positive integers, find the **maximum sum** of an increasing subsequence.

An increasing subsequence is a sequence of elements where each element is strictly greater than the preceding element.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [1, 101, 2, 3, 100]
Output: 106
Explanation: The subsequence [1, 2, 3, 100] is increasing and has the maximum sum 1 + 2 + 3 + 100 = 106.
\`\`\`

**Example 2:**
\`\`\`text
Input: arr = [4, 1, 2, 3]
Output: 6
Explanation: Subsequence [1, 2, 3] gives sum 6.
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^4\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array of positive integers.',
    outputFormat: 'Maximum sum of an increasing subsequence.',
    constraints: '1 <= arr.length <= 10^4',
  },

  'maximum-sum-increasing-subsequence-335': {
    title: 'Maximum Sum Increasing Subsequence',
    statement: `Given an array \`arr\` of \`n\` positive integers, find the **maximum sum** of an increasing subsequence.

An increasing subsequence is a sequence of elements where each element is strictly greater than the preceding element.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [1, 101, 2, 3, 100]
Output: 106
Explanation: The subsequence [1, 2, 3, 100] is increasing and has the maximum sum 1 + 2 + 3 + 100 = 106.
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^4\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array of positive integers.',
    outputFormat: 'Maximum sum of an increasing subsequence.',
    constraints: '1 <= arr.length <= 10^4',
  },

  'maximum-sum-subsequence-with-no-adjacent-elements': {
    title: 'Maximum Sum Subsequence with No Adjacent Elements (House Robber)',
    statement: `You are given an integer array \`nums\`. Find the **maximum sum** of a subsequence such that **no two chosen elements are adjacent** in the original array.

### Examples

**Example 1:**
\`\`\`text
Input: nums = [1, 2, 3, 1]
Output: 4
Explanation: Pick nums[0] = 1 and nums[2] = 3. Total sum = 1 + 3 = 4.
\`\`\`

**Example 2:**
\`\`\`text
Input: nums = [2, 7, 9, 3, 1]
Output: 12
Explanation: Pick nums[0] = 2, nums[2] = 9, and nums[4] = 1. Total sum = 2 + 9 + 1 = 12.
\`\`\`

### Constraints
- \`1 <= nums.length <= 10^5\`
- \`0 <= nums[i] <= 10^4\``,
    inputFormat: 'Array of non-negative integers.',
    outputFormat: 'Maximum possible sum without adjacent elements.',
    constraints: '1 <= nums.length <= 10^5',
  },

  'median-of-stream-of-integers-running-integers': {
    title: 'Find Median from Data Stream',
    statement: `The **median** is the middle value in an ordered integer list. If the size of the list is even, the median is the mean of the two middle values.

Implement the \`MedianFinder\` class:
- \`MedianFinder()\`: Initializes the object.
- \`void addNum(int num)\`: Adds the integer \`num\` from the data stream.
- \`double findMedian()\`: Returns the median of all elements so far.

Use two heaps (max-heap for lower half, min-heap for upper half) to support insertions in \`O(log n)\` and median query in \`O(1)\`.

### Examples

**Example 1:**
\`\`\`text
Operations:
MedianFinder mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
mf.findMedian(); // returns 1.5
mf.addNum(3);
mf.findMedian(); // returns 2.0
\`\`\`

### Constraints
- \`-10^5 <= num <= 10^5\`
- At most \`5 * 10^4\` calls will be made to \`addNum\` and \`findMedian\`.`,
    inputFormat: 'Sequence of addNum and findMedian operations.',
    outputFormat: 'Median values returned.',
    constraints: 'O(log n) insertion, O(1) median query.',
  },

  'minimum-swap-required-to-convert-binary-tree-to-binary-search-tree': {
    title: 'Minimum Swaps to Convert Binary Tree to BST',
    statement: `Given the level-order array representation of a complete binary tree, find the **minimum number of element swaps** required to convert it into a Binary Search Tree (BST).

Recall that the inorder traversal of a BST is always sorted. The problem reduces to finding the minimum swaps needed to sort the inorder array of the tree.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [5, 6, 7, 8, 9, 10, 11]
Output: 3
Explanation: Inorder traversal is [8, 6, 9, 5, 10, 7, 11]. Minimum swaps to sort this array is 3.
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^5\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array representing binary tree in level order.',
    outputFormat: 'Minimum swaps needed.',
    constraints: '1 <= arr.length <= 10^5',
  },

  'mobile-numeric-keypad': {
    title: 'Mobile Numeric Keypad Problem',
    statement: `Given a standard 3x4 mobile numeric keypad:
\`\`\`text
1  2  3
4  5  6
7  8  9
*  0  #
\`\`\`
You can only press keys adjacent to the current key (up, down, left, right) or press the same key again. You cannot press \`*\` or \`#\`.

Given a number \`n\`, find the total number of possible key sequences of length \`n\` that can be typed.

### Examples

**Example 1:**
\`\`\`text
Input: n = 1
Output: 10
Explanation: Any single digit [0-9] is valid.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 2
Output: 36
\`\`\`

### Constraints
- \`1 <= n <= 25\``,
    inputFormat: 'Integer n representing sequence length.',
    outputFormat: 'Total count of valid key sequences.',
    constraints: '1 <= n <= 25',
  },

  'piar-with-given-difference': {
    title: 'Find Pair with Given Difference',
    statement: `Given an array of integers \`arr\` of size \`n\` and an integer \`diff\`, determine whether there exists a pair of elements \`(a, b)\` in the array such that:
\`|a - b| == diff\` and the two elements are at distinct indices.

Return \`true\` if such a pair exists, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [5, 20, 3, 2, 50, 80], diff = 78
Output: true
Explanation: The pair (2, 80) has absolute difference |80 - 2| = 78.
\`\`\`

**Example 2:**
\`\`\`text
Input: arr = [90, 70, 20, 80, 50], diff = 45
Output: false
\`\`\`

### Constraints
- \`2 <= arr.length <= 10^5\`
- \`0 <= arr[i], diff <= 10^5\``,
    inputFormat: 'Array arr and target difference diff.',
    outputFormat: 'Boolean true if pair exists, false otherwise.',
    constraints: '2 <= arr.length <= 10^5',
  },

  'preorder-to-postorder': {
    title: 'Convert Preorder to Postorder for BST',
    statement: `Given an array \`preorder\` representing the preorder traversal of a Binary Search Tree (BST), construct the tree and return its **postorder traversal** array.

### Examples

**Example 1:**
\`\`\`text
Input: preorder = [40, 30, 35, 80, 100]
Output: [35, 30, 100, 80, 40]
\`\`\`

### Constraints
- \`1 <= preorder.length <= 10^4\`
- \`1 <= preorder[i] <= 10^5\``,
    inputFormat: 'Preorder traversal array of BST.',
    outputFormat: 'Postorder traversal array.',
    constraints: '1 <= preorder.length <= 10^4',
  },

  'prims-algo': {
    title: "Prim's Algorithm for Minimum Spanning Tree",
    statement: `Given a connected undirected weighted graph with \`n\` vertices numbered from \`0\` to \`n - 1\` and an adjacency list \`adj\`, find the total weight of the **Minimum Spanning Tree (MST)** using **Prim's algorithm**.

### Examples

**Example 1:**
\`\`\`text
Input: n = 3, adj = [[[1, 5], [2, 1]], [[0, 5], [2, 3]], [[0, 1], [1, 3]]]
Output: 4
Explanation: Minimum spanning tree edges:
- (0, 2) with weight 1
- (1, 2) with weight 3
Total MST weight = 1 + 3 = 4.
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`1 <= edges <= 10^5\`
- \`1 <= weight <= 10^4\``,
    inputFormat: 'Number of vertices and weighted adjacency list.',
    outputFormat: 'Total weight of MST.',
    constraints: '1 <= n <= 10^4',
  },

  'print-all-k-sum-paths-in-a-binary-tree': {
    title: 'Path Sum III (All K-Sum Paths in a Binary Tree)',
    statement: `Given the root of a binary tree and an integer \`targetSum\`, return the number of paths where the sum of the values along the path equals \`targetSum\`.

The path does not need to start or end at the root or a leaf, but it must go downwards (i.e. traveling only from parent nodes to child nodes).

### Examples

**Example 1:**
\`\`\`text
Input: root = [10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], targetSum = 8
Output: 3
Explanation: The paths with sum 8 are:
1. 5 -> 3
2. 5 -> 2 -> 1
3. -3 -> 11
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 1000]\`.
- \`-10^9 <= Node.val <= 10^9\`
- \`-1000 <= targetSum <= 1000\``,
    inputFormat: 'Root of binary tree and targetSum.',
    outputFormat: 'Number of paths summing to targetSum.',
    constraints: '0 <= nodes <= 1000',
  },

  'problems-chocola': {
    title: 'Chocolate Break Problem (CHOCOLA)',
    statement: `You are given a chocolate bar consisting of \`m x n\` square pieces. You want to break it into individual \`1 x 1\` pieces.

Breaking a piece requires cutting horizontally or vertically across the entire current piece. The cost of a cut along a grid line is proportional to the number of pieces currently being cut across:
\`Total Cost = Base Cost * (number of segments already created in perpendicular direction + 1)\`

Given horizontal cut costs \`x\` of size \`m - 1\` and vertical cut costs \`y\` of size \`n - 1\`, find the **minimum total cost** to break the chocolate into \`1 x 1\` squares.

### Examples

**Example 1:**
\`\`\`text
Input: m = 6, n = 4, x = [2, 1, 3, 1, 4], y = [4, 1, 2]
Output: 42
Explanation: Always pick the cut with the highest base cost first.
\`\`\`

### Constraints
- \`2 <= m, n <= 1000\`
- \`1 <= cost <= 1000\``,
    inputFormat: 'Dimensions m, n and cost arrays x and y.',
    outputFormat: 'Minimum cutting cost.',
    constraints: '2 <= m, n <= 1000',
  },

  'range-minimum-query': {
    title: 'Range Minimum Query (RMQ)',
    statement: `Given an integer array \`arr\` of size \`n\` and multiple range queries \`[L, R]\`, answer each query with the **minimum value** in the sub-array \`arr[L...R]\` (0-indexed).

Use a Segment Tree or Sparse Table to answer each query in \`O(log n)\` or \`O(1)\` time.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [2, 5, 1, 4, 9, 3], query = [1, 4]
Output: 1
Explanation: Subarray arr[1...4] is [5, 1, 4, 9], minimum is 1.
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`-10^9 <= arr[i] <= 10^9\`
- \`0 <= L <= R < n\``,
    inputFormat: 'Array arr and query range [L, R].',
    outputFormat: 'Minimum value in range.',
    constraints: '1 <= n <= 10^5',
  },

  'remove-duplicates-from-an-unsorted-linked-list': {
    title: 'Remove Duplicates From an Unsorted Linked List',
    statement: `Given the \`head\` of a linked list, find all the values that appear **more than once** in the list and delete all the nodes that have any of those values.

Return the linked list after the deletions.

### Examples

**Example 1:**
\`\`\`text
Input: head = [1, 2, 3, 2]
Output: [1, 3]
Explanation: 2 appears twice in the linked list, so all nodes with value 2 should be deleted. After deleting, we are left with [1, 3].
\`\`\`

**Example 2:**
\`\`\`text
Input: head = [2, 1, 1, 2]
Output: []
Explanation: 2 and 1 both appear twice. All the nodes should be deleted.
\`\`\`

**Example 3:**
\`\`\`text
Input: head = [3, 2, 2, 1, 3, 2, 4]
Output: [1, 4]
Explanation: 3 appears twice and 2 appears three times. After deleting them, we are left with [1, 4].
\`\`\`

### Constraints
- The number of nodes in the list is in the range \`[1, 10^5]\`.
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Head node of a singly linked list.',
    outputFormat: 'Head node of the modified linked list.',
    constraints: '1 <= nodes <= 10^5\n1 <= Node.val <= 10^5',
    testCases: [
      {
        input: '[1, 2, 3, 2]',
        expectedOutput: '[1, 3]',
        isSample: true,
        isHidden: false,
      },
      {
        input: '[2, 1, 1, 2]',
        expectedOutput: '[]',
        isSample: true,
        isHidden: false,
      },
      {
        input: '[3, 2, 2, 1, 3, 2, 4]',
        expectedOutput: '[1, 4]',
        isSample: true,
        isHidden: false,
      },
    ],
  },

  'replace-every-element': {
    title: 'Replace Every Element with the Least Greater Element on Its Right',
    statement: `Given an array of integers \`arr\`, replace every element with the **least greater element** on its right side in the array.

If there is no greater element on the right, replace it with \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [8, 58, 71, 18, 31, 32, 63, 92, 43, 3, 91, 93, 25, 80, 28]
Output: [18, 63, 80, 25, 32, 43, 80, 93, 80, 25, 93, -1, 28, -1, -1]
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^5\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array of integers arr.',
    outputFormat: 'Array with replaced elements.',
    constraints: '1 <= arr.length <= 10^5',
  },

  'reverse-level-order-traversal': {
    title: 'Reverse Level Order Traversal',
    statement: `Given the root of a binary tree, return the **bottom-up level order traversal** of its nodes' values (i.e. from left to right, level by level from leaf to root).

### Examples

**Example 1:**
\`\`\`text
Input: root = [3, 9, 20, null, null, 15, 7]
Output: [[15, 7], [9, 20], [3]]
Explanation:
- Level 3 (bottom): [15, 7]
- Level 2: [9, 20]
- Level 1 (top): [3]
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 2000]\`.
- \`-1000 <= Node.val <= 1000\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'List of lists of level order values from bottom to top.',
    constraints: '0 <= nodes <= 2000',
  },

  'right-view-of-binary-tree': {
    title: 'Right View of Binary Tree',
    statement: `Given the root of a binary tree, imagine yourself standing on the **right side** of it, return the values of the nodes you can see ordered from top to bottom.

The right view consists of the last node at each level of the tree.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, null, 5, null, 4]
Output: [1, 3, 4]
Explanation:
- Level 1: 1
- Level 2: 3
- Level 3: 4
Right view: [1, 3, 4].
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [1, null, 3]
Output: [1, 3]
\`\`\`

**Example 3:**
\`\`\`text
Input: root = []
Output: []
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 100]\`.
- \`-100 <= Node.val <= 100\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values visible from right side.',
    constraints: '0 <= nodes <= 100',
  },

  'top-view-of-binary-tree': {
    title: 'Top View of Binary Tree',
    statement: `Given a binary tree, return the **top view** of the tree.

The top view of a binary tree is the set of nodes visible when the tree is viewed from the top. For each horizontal distance from the root, the topmost node (first node visited in level order) is visible.

Return the node values ordered from **leftmost horizontal distance to rightmost**.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, 5, 6, 7]
Output: [4, 2, 1, 3, 7]
Explanation:
- HD = -2: 4
- HD = -1: 2
- HD = 0: 1
- HD = 1: 3
- HD = 2: 7
Top view: [4, 2, 1, 3, 7].
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values in top view from left to right.',
    constraints: '1 <= nodes <= 10^5',
  },

  'tournament-tree-and-binary-heap': {
    title: 'Tournament Tree: Find Second Smallest Element',
    statement: `A **Tournament Tree** is a complete binary tree where each node represents the winner (minimum) of its two children, similar to a knockout tournament.

Given an array of \`n\` integers, build a tournament tree to find the smallest element, and then determine the **second smallest element** using at most \`n + ceil(log2(n)) - 2\` comparisons.

Return the second smallest element.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [5, 2, 8, 1, 9, 3]
Output: 2
Explanation: Minimum is 1. Elements compared directly with 1 along its root path are 9, 3, and 2. The minimum among these is 2.
\`\`\`

### Constraints
- \`2 <= arr.length <= 10^5\`
- \`-10^9 <= arr[i] <= 10^9\``,
    inputFormat: 'Array of integers.',
    outputFormat: 'Second smallest element.',
    constraints: '2 <= arr.length <= 10^5',
  },

  'word-break-problem-trie-solution': {
    title: 'Word Break Problem (Trie Solution)',
    statement: `Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

Implement the dictionary lookup using a **Trie (Prefix Tree)** for optimal prefix matching.

### Examples

**Example 1:**
\`\`\`text
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: Return true because "leetcode" can be segmented as "leet code".
\`\`\`

**Example 2:**
\`\`\`text
Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
Explanation: Return true because "applepenapple" can be segmented as "apple pen apple".
\`\`\`

**Example 3:**
\`\`\`text
Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: false
\`\`\`

### Constraints
- \`1 <= s.length <= 300\`
- \`1 <= wordDict.length <= 1000\`
- \`1 <= wordDict[i].length <= 20\`
- \`s\` and \`wordDict[i]\` consist of only lowercase English letters.
- All strings in \`wordDict\` are unique.`,
    inputFormat: 'String s and dictionary wordDict.',
    outputFormat: 'Boolean indicating if word can be broken.',
    constraints: '1 <= s.length <= 300',
  },

  'zigzag-tree-traversal': {
    title: 'Binary Tree Zigzag Level Order Traversal',
    statement: `Given the root of a binary tree, return the **zigzag level order traversal** of its nodes' values (i.e. from left to right, then right to left for the next level and alternate between).

### Examples

**Example 1:**
\`\`\`text
Input: root = [3, 9, 20, null, null, 15, 7]
Output: [[3], [20, 9], [15, 7]]
Explanation:
- Level 1: [3] (left to right)
- Level 2: [20, 9] (right to left)
- Level 3: [15, 7] (left to right)
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [1]
Output: [[1]]
\`\`\`

**Example 3:**
\`\`\`text
Input: root = []
Output: []
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 2000]\`.
- \`-100 <= Node.val <= 100\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'List of lists of integers in zigzag level order.',
    constraints: '0 <= nodes <= 2000',
  },
};
