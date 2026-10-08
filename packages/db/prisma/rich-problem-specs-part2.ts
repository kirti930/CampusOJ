import { RichProblemSpec } from './rich-problem-specs-part1';

export const SPECS_PART2: Record<string, RichProblemSpec> = {
  'detect-and-remove-loop-in-a-linked-list': {
    title: 'Detect and Remove Loop in a Linked List',
    statement: `Given the head of a linked list, check if the list contains a **cycle (loop)**. If a loop is present, **remove the loop** by unlinking the node that points back into the cycle, converting the list into a linear chain.

Return the head of the modified linked list without any loop.

### Examples

**Example 1:**
\`\`\`text
Input: 1 -> 3 -> 4 -> 3 (loop back to node with value 3)
Output: 1 -> 3 -> 4 -> null
Explanation: Node 4 was pointing back to node 3. Removing the loop makes node 4 point to null.
\`\`\`

### Constraints
- \`1 <= nodes <= 10^5\`
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Head of a singly linked list potentially containing a cycle.',
    outputFormat: 'Head of list with cycle removed.',
    constraints: '1 <= nodes <= 10^5',
  },

  'detect-cycle-in-a-graph': {
    title: 'Detect Cycle in a Graph',
    statement: `Given a graph with \`n\` vertices and a list of edges, determine whether the graph contains any **cycle**.

Return \`true\` if a cycle exists, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1], [1, 2], [2, 3], [3, 0]]
Output: true
Explanation: The path 0 -> 1 -> 2 -> 3 -> 0 forms a cycle.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 3, edges = [[0, 1], [1, 2]]
Output: false
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= edges.length <= 10^5\``,
    inputFormat: 'Number of vertices and edge list.',
    outputFormat: 'Boolean indicating presence of cycle.',
    constraints: '1 <= n <= 10^5',
  },

  'dfs': {
    title: 'Depth First Search (DFS)',
    statement: `Given a connected undirected graph with \`n\` vertices numbered from \`0\` to \`n - 1\` represented as an adjacency list \`adj\`, return a list of all vertices in the order they are visited during a **Depth First Search (DFS)** traversal starting from vertex \`0\`.

When exploring adjacent vertices of a node, visit them in increasing order of their indices.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, adj = [[1, 2, 4], [0], [0], [4], [0, 3]]
Output: [0, 1, 2, 4, 3]
Explanation:
Start at 0: visit 0.
Traverse neighbor 1: visit 1 (backtrack).
Traverse neighbor 2: visit 2 (backtrack).
Traverse neighbor 4: visit 4 -> visit 3.
DFS order: [0, 1, 2, 4, 3].
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`0 <= edges <= 5 * 10^4\``,
    inputFormat: 'Number of vertices and adjacency list.',
    outputFormat: 'Array of vertices in DFS traversal order.',
    constraints: '1 <= n <= 10^4',
  },

  'diagonal-traversal-of-binary-tree': {
    title: 'Diagonal Traversal of Binary Tree',
    statement: `Given the root of a binary tree, return the **diagonal traversal** of the tree.

In a diagonal traversal, all nodes in a diagonal have the same slope. From any node \`p\`, moving to \`p.right\` keeps you in the same diagonal, while moving to \`p.left\` shifts you to the next lower diagonal.

Return all node values ordered by diagonals from top-right to bottom-left.

### Examples

**Example 1:**
\`\`\`text
Input: root = [8, 3, 10, 1, 6, -1, 14, -1, -1, 4, 7, 13]
Output: [8, 10, 14, 3, 6, 7, 13, 1, 4]
Explanation:
- Diagonal 0: 8, 10, 14
- Diagonal 1: 3, 6, 7, 13
- Diagonal 2: 1, 4
Result: [8, 10, 14, 3, 6, 7, 13, 1, 4]
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values in diagonal order.',
    constraints: '1 <= nodes <= 10^5',
  },

  'dijkstras-shortest-path-algorithm': {
    title: "Dijkstra's Shortest Path Algorithm",
    statement: `Given a weighted graph with \`n\` vertices numbered \`0\` to \`n - 1\` and non-negative edge weights represented as an adjacency list or edge array, find the shortest distance from a given source vertex \`src\` to all other vertices.

Return an array \`dist\` where \`dist[i]\` represents the minimum path distance from \`src\` to vertex \`i\`. If a vertex is unreachable, set its distance to \`10^9\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 3, edges = [[[1, 1], [2, 6]], [[2, 3]], []], src = 0
Output: [0, 1, 4]
Explanation:
Shortest path from 0 to 0 is 0.
Shortest path from 0 to 1 is 1.
Shortest path from 0 to 2 is 0 -> 1 -> 2 with weight 1 + 3 = 4.
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= edges.length <= 2 * 10^5\`
- Edge weights are non-negative integers \`<= 10^4\`.`,
    inputFormat: 'Number of vertices, weighted adjacency list, and source vertex.',
    outputFormat: 'Array of shortest distances from source.',
    constraints: '1 <= n <= 10^5\n0 <= weight <= 10^4',
  },

  'distance-of-nearest-cell': {
    title: 'Distance of Nearest Cell with 1',
    statement: `Given an \`m x n\` binary matrix \`grid\`, find the distance of the nearest \`1\` for each cell.

The distance between two adjacent cells \`(i, j)\` and \`(r, c)\` is \`|i - r| + |j - c|\` (Manhattan distance).

Return a matrix \`ans\` where \`ans[i][j]\` is the distance to the nearest \`1\` from cell \`(i, j)\`.

### Examples

**Example 1:**
\`\`\`text
Input: grid = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
]
Output: [
  [2, 1, 2],
  [1, 0, 1],
  [2, 1, 2]
]
\`\`\`

### Constraints
- \`1 <= m, n <= 500\`
- \`grid[i][j] \\in {0, 1}\`
- At least one \`1\` exists in \`grid\`.`,
    inputFormat: 'Binary matrix grid.',
    outputFormat: 'Matrix of nearest distances.',
    constraints: '1 <= m, n <= 500',
  },

  'duplicate-subtree-in-binary-tree': {
    title: 'Duplicate Subtree in Binary Tree',
    statement: `Given the root of a binary tree, determine whether the tree contains **duplicate subtrees of size two or more**.

Two subtrees are duplicates if they have the exact same structure and identical node values. Leaf nodes alone (subtrees of size 1) do not count.

Return \`true\` if a duplicate subtree exists, otherwise \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, 5, -1, 2, -1, -1, -1, -1, 4, 5]
Output: true
Explanation: The subtree rooted at node 2 (with children 4, 5) occurs twice.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Boolean true if duplicate subtrees exist.',
    constraints: '1 <= nodes <= 10^4',
  },

  'duplicate-subtrees': {
    title: 'Find Duplicate Subtrees',
    statement: `Given the root of a binary tree, return all **duplicate subtrees**.

For each kind of duplicate subtrees, you only need to return the root node of any one of them.

Two trees are duplicate if they have the same structure with the same node values.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, null, 2, 4, null, null, 4]
Output: [[2, 4], [4]]
Explanation: The subtree [2, 4] occurs twice, and the leaf [4] occurs three times.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`-200 <= Node.val <= 200\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'List of roots of duplicate subtrees.',
    constraints: '1 <= nodes <= 10^4',
  },

  'evaluation-of-postfix-expression': {
    title: 'Evaluation of Postfix Expression',
    statement: `Given a string array or space-separated tokens representing an arithmetic expression in **Reverse Polish Notation (Postfix)**, evaluate and return its integer value.

Valid operators are \`+\`, \`-\`, \`*\`, and \`/\`. Each operand may be an integer or another expression. Division between two integers truncates toward zero.

### Examples

**Example 1:**
\`\`\`text
Input: tokens = ["2", "1", "+", "3", "*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
\`\`\`

**Example 2:**
\`\`\`text
Input: tokens = ["4", "13", "5", "/", "+"]
Output: 6
Explanation: (4 + (13 / 5)) = 4 + 2 = 6
\`\`\`

### Constraints
- \`1 <= tokens.length <= 10^4\`
- Operands are integers in range \`[-200, 200]\`.`,
    inputFormat: 'Array of postfix tokens.',
    outputFormat: 'Evaluated integer result.',
    constraints: '1 <= tokens.length <= 10^4',
  },

  'find-a-tour-that-visits-all-stations': {
    title: 'Find a Tour That Visits All Stations (Gas Station)',
    statement: `There are \`n\` gas stations along a circular route, where the amount of gas at the \`i\`-th station is \`gas[i]\`.

You have a car with an unlimited gas tank and it costs \`cost[i]\` of gas to travel from the \`i\`-th station to its next \`(i + 1)\`-th station. You begin the journey with an empty tank at one of the gas stations.

Given two integer arrays \`gas\` and \`cost\`, return the **starting gas station index (0-indexed)** if you can travel around the circuit once in the clockwise direction, otherwise return \`-1\`. If there exists a solution, it is guaranteed to be unique.

### Examples

**Example 1:**
\`\`\`text
Input: gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]
Output: 3
Explanation:
Start at station 3 (index 3) and fill up with 4 unit of gas.
Travel to station 4: gas = 4 - 1 + 5 = 8.
Travel to station 0: gas = 8 - 2 + 1 = 7.
Travel to station 1: gas = 7 - 3 + 2 = 6.
Travel to station 2: gas = 6 - 4 + 3 = 5.
Travel to station 3: gas = 5 - 5 = 0. Completed circular tour!
\`\`\`

### Constraints
- \`n == gas.length == cost.length\`
- \`1 <= n <= 10^5\`
- \`0 <= gas[i], cost[i] <= 10^4\``,
    inputFormat: 'Arrays gas and cost.',
    outputFormat: 'Starting station index or -1.',
    constraints: '1 <= n <= 10^5',
  },

  'find-duplicates-in-on-time-and-o1-extra-space': {
    title: 'Find Duplicates in O(N) Time and O(1) Extra Space',
    statement: `Given an array \`arr\` of \`n\` integers where each value is in the range \`[0, n - 1]\`, find all the elements that appear **more than once** in the array.

The algorithm must run in **O(n) time** and use **O(1) extra space** (excluding the return list).

Return the duplicate elements in increasing order. If no element appears more than once, return \`[-1]\`.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [2, 3, 1, 2, 3]
Output: [2, 3]
Explanation: 2 and 3 occur more than once in the array.
\`\`\`

**Example 2:**
\`\`\`text
Input: arr = [0, 3, 1, 2]
Output: [-1]
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= arr[i] <= n - 1\``,
    inputFormat: 'Array arr of size n.',
    outputFormat: 'List of duplicate elements in ascending order.',
    constraints: '1 <= n <= 10^5\n0 <= arr[i] <= n - 1',
  },

  'find-four-elements-that-sum-to-a-given-value': {
    title: 'Find Four Elements that Sum to a Given Value (4Sum)',
    statement: `Given an array \`nums\` of \`n\` integers and an integer \`target\`, find all **unique quadruplets** \`[nums[a], nums[b], nums[c], nums[d]]\` such that:
- \`0 <= a, b, c, d < n\`
- \`a\`, \`b\`, \`c\`, and \`d\` are distinct.
- \`nums[a] + nums[b] + nums[c] + nums[d] == target\`

Return the quadruplets in any order. The solution set must not contain duplicate quadruplets.

### Examples

**Example 1:**
\`\`\`text
Input: nums = [1, 0, -1, 0, -2, 2], target = 0
Output: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]
\`\`\`

### Constraints
- \`1 <= nums.length <= 200\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\``,
    inputFormat: 'Array nums and target integer.',
    outputFormat: 'List of unique quadruplets summing to target.',
    constraints: '1 <= nums.length <= 200',
  },

  'find-if-an-expression-has-duplicate-parenthesis-or-not': {
    title: 'Duplicate Parentheses in Expression',
    statement: `Given a string expression \`s\` containing balanced parentheses and operators, find if the expression contains **duplicate (redundant) parentheses**.

A set of parentheses is duplicate if sub-expressions are bounded by multiple parentheses without adding meaning, e.g., \`((a+b))\` has duplicate parentheses.

Return \`true\` if duplicate parentheses exist, otherwise \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: s = "((a+b)+((c+d)))"
Output: true
Explanation: ((c+d)) has redundant outer parentheses.
\`\`\`

**Example 2:**
\`\`\`text
Input: s = "((a+b)+(c+d))"
Output: false
\`\`\`

### Constraints
- \`1 <= s.length <= 10^4\`
- Characters include lowercase letters, \`+\`, \`-\`, \`*\`, \`/\`, \`(\`, \`)\`.`,
    inputFormat: 'String mathematical expression.',
    outputFormat: 'Boolean indicating redundant parentheses.',
    constraints: '1 <= s.length <= 10^4',
  },

  'find-if-there-is-a-path-of-more-than-k-length-from-a-source': {
    title: 'Path of Length Greater Than K from Source',
    statement: `Given a weighted undirected graph with \`n\` vertices, a source vertex \`src\`, and an integer \`k\`, determine whether there exists a **simple path** (a path with no repeated vertices) starting from \`src\` whose total edge weight is strictly greater than \`k\`.

Return \`true\` if such a path exists, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1, 5], [1, 2, 7], [2, 3, 10]], src = 0, k = 15
Output: true
Explanation: The path 0 -> 1 -> 2 -> 3 has total weight 5 + 7 + 10 = 22 > 15.
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`1 <= edges.length <= 50\`
- \`1 <= weight, k <= 1000\``,
    inputFormat: 'Vertices n, edges list, source vertex src, and threshold k.',
    outputFormat: 'Boolean indicating if qualifying simple path exists.',
    constraints: '1 <= n <= 20',
  },

  'find-k-closest-elements-to-a-given-value': {
    title: 'Find K Closest Elements',
    statement: `Given a sorted integer array \`arr\`, two integers \`k\` and \`x\`, return the \`k\` closest integers to \`x\` in the array. The result should also be sorted in ascending order.

An integer \`a\` is closer to \`x\` than an integer \`b\` if:
- \`|a - x| < |b - x|\`, or
- \`|a - x| == |b - x|\` and \`a < b\`

### Examples

**Example 1:**
\`\`\`text
Input: arr = [1, 2, 3, 4, 5], k = 4, x = 3
Output: [1, 2, 3, 4]
\`\`\`

**Example 2:**
\`\`\`text
Input: arr = [1, 1, 2, 3, 4, 5], k = 4, x = -1
Output: [1, 1, 2, 3]
\`\`\`

### Constraints
- \`1 <= k <= arr.length <= 10^4\`
- \`arr\` is sorted in ascending order.
- \`-10^4 <= arr[i], x <= 10^4\``,
    inputFormat: 'Sorted array arr, integer k, and query value x.',
    outputFormat: 'List of k closest elements in ascending order.',
    constraints: '1 <= k <= arr.length <= 10^4',
  },

  'find-longest-path-directed-acyclic-graph': {
    title: 'Longest Path in a Directed Acyclic Graph (DAG)',
    statement: `Given a Directed Acyclic Graph (DAG) with \`n\` vertices numbered from \`0\` to \`n - 1\` and a source vertex \`src\`, find the longest distance from \`src\` to all other vertices.

Return an array \`dist\` where \`dist[i]\` is the longest path distance from \`src\` to vertex \`i\`. If vertex \`i\` is not reachable from \`src\`, set \`dist[i] = -10^9\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 6, edges = [[0, 1, 5], [0, 2, 3], [1, 3, 6], [1, 2, 2], [2, 4, 4], [2, 5, 2], [2, 3, 7], [3, 5, 1], [3, 4, -1], [4, 5, -2]], src = 1
Output: [-10^9, 0, 2, 9, 8, 10]
Explanation: From source 1:
- to 1: 0
- to 2: 2
- to 3: max(1->3 = 6, 1->2->3 = 9) = 9
- to 4: max(1->2->4 = 6, 1->3->4 = 8) = 8
- to 5: max(1->2->5 = 4, 1->3->5 = 10, 1->2->4->5 = 4) = 10.
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`0 <= edges.length <= 5 * 10^4\``,
    inputFormat: 'n, edges [u, v, w], and src.',
    outputFormat: 'Array of longest path distances.',
    constraints: '1 <= n <= 10^4',
  },

  'find-maximum-equal-sum-of-every-three-stacks': {
    title: 'Find Maximum Equal Sum of Three Stacks',
    statement: `Given three stacks of positive integers represented as arrays \`stack1\`, \`stack2\`, and \`stack3\`, find the **maximum possible common sum** of all three stacks by repeatedly popping elements from the top of the stacks.

Elements can only be removed from the top (beginning) of the arrays.

Return the maximum possible equal sum. If no equal sum is possible, return \`0\`.

### Examples

**Example 1:**
\`\`\`text
Input: stack1 = [3, 2, 1, 1, 1], stack2 = [4, 3, 2], stack3 = [1, 1, 4, 1]
Output: 5
Explanation:
- Pop 3 from stack1 -> sum = 5
- Pop 4 from stack2 -> sum = 5
- Pop 1, 1 from stack3 -> sum = 5
All stacks now have sum 5.
\`\`\`

### Constraints
- \`1 <= stack1.length, stack2.length, stack3.length <= 10^5\`
- \`1 <= element <= 100\``,
    inputFormat: 'Three integer arrays representing stacks.',
    outputFormat: 'Maximum equal sum.',
    constraints: '1 <= length <= 10^5',
  },

  'find-median-of-bst-in-on-time-and-o1-space': {
    title: 'Find Median of BST in O(N) Time and O(1) Space',
    statement: `Given the root of a Binary Search Tree (BST), find its **median** value in **O(n) time complexity** and **O(1) auxiliary space** (using Morris Inorder Traversal).

If the total number of nodes \`n\` is odd, median is the \`((n + 1) / 2)\`-th node in inorder traversal.
If \`n\` is even, median is the average of \`(n / 2)\`-th and \`((n / 2) + 1)\`-th nodes.

### Examples

**Example 1:**
\`\`\`text
Input: root = [6, 3, 8, 1, 4, 7, 9]
Output: 6
Explanation: Inorder traversal is [1, 3, 4, 6, 7, 8, 9]. Count is 7 (odd), median is 4th element = 6.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of BST.',
    outputFormat: 'Median value as a float or integer.',
    constraints: 'O(1) auxiliary space.',
  },

  'find-minimum-time-to-finish-all-jobs-with-given-constraints': {
    title: 'Find Minimum Time to Finish All Jobs',
    statement: `You are given an integer array \`jobs\`, where \`jobs[i]\` is the amount of time it takes to complete the \`i\`-th job. There are \`k\` workers and each worker can work on any job.

Each job must be assigned to exactly one worker. The working time of a worker is the sum of the time of the jobs assigned to that worker.

Return the **minimum possible maximum working time** of any worker.

### Examples

**Example 1:**
\`\`\`text
Input: jobs = [3, 2, 3], k = 3
Output: 3
Explanation: Assign each job to a different worker. Max working time is 3.
\`\`\`

**Example 2:**
\`\`\`text
Input: jobs = [1, 2, 4, 7, 8], k = 2
Output: 11
Explanation: Assign jobs [1, 2, 8] to worker 1 (time = 11) and [4, 7] to worker 2 (time = 11).
\`\`\`

### Constraints
- \`1 <= k <= jobs.length <= 12\`
- \`1 <= jobs[i] <= 10^7\``,
    inputFormat: 'Array jobs and number of workers k.',
    outputFormat: 'Minimum possible maximum working time.',
    constraints: '1 <= k <= jobs.length <= 12',
  },

  'find-paths-from-corner-cell-to-middle-cell-in-maze': {
    title: 'Find Paths from Corner Cell to Middle Cell in Maze',
    statement: `Given an \`n x n\` square matrix where \`n\` is odd, find all paths from any of the four corner cells to the middle cell \`(n / 2, n / 2)\`.

From cell \`(i, j)\` with value \`k\`, a move can be made to:
- \`(i + k, j)\`
- \`(i - k, j)\`
- \`(i, j + k)\`
- \`(i, j - k)\`
provided the destination lies within the grid.

Return the sequence of cell coordinates from start to center.

### Constraints
- \`3 <= n <= 15\`, \`n\` is odd.
- \`1 <= grid[i][j] <= n\``,
    inputFormat: 'Matrix dimension n and n x n grid.',
    outputFormat: 'Coordinates of paths reaching center cell.',
    constraints: '3 <= n <= 15',
  },

  'find-position-of-the-only-set-bit': {
    title: 'Find Position of the Only Set Bit',
    statement: `Given an integer \`n\` which has at most one set bit (1), find the **position of this set bit** (1-indexed from right to left).

If \`n\` has no set bits or has more than one set bit, return \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 16
Output: 5
Explanation: 16 in binary is 10000. The set bit is at position 5 from right.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 12
Output: -1
Explanation: 12 in binary is 1100, which has two set bits.
\`\`\`

### Constraints
- \`0 <= n <= 10^9\``,
    inputFormat: 'Integer n.',
    outputFormat: '1-based bit index, or -1.',
    constraints: '0 <= n <= 10^9',
  },

  'find-shortest-safe-route-in-a-path-with-landmines': {
    title: 'Find Shortest Safe Route in a Path with Landmines',
    statement: `Given an \`m x n\` grid where \`0\` represents a landmine and \`1\` represents a safe cell. Any cell adjacent (up, down, left, right) to a landmine is also **unsafe**.

Find the length of the **shortest safe route** from any safe cell in the **first column** to any safe cell in the **last column**, moving only up, down, left, or right.

If no safe path exists, return \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: grid = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1]
]
Output: 5
\`\`\`

### Constraints
- \`1 <= m, n <= 100\`
- \`grid[i][j] \\in {0, 1}\``,
    inputFormat: 'Dimensions m, n and grid.',
    outputFormat: 'Length of shortest route or -1.',
    constraints: '1 <= m, n <= 100',
  },

  'find-shortest-unique-prefix-for-every-word-in-a-given-list': {
    title: 'Shortest Unique Prefix for Every Word',
    statement: `Given an array of unique words \`words\`, find the **shortest unique prefix** for each word that distinguishes it from all other words in the list.

It is guaranteed that no word is a prefix of another word.

Return the prefixes in the same order as the input words.

### Examples

**Example 1:**
\`\`\`text
Input: words = ["zebra", "dog", "duck", "dove"]
Output: ["z", "dog", "du", "dov"]
Explanation:
- "z" uniquely identifies "zebra".
- "dog" is needed because "d", "do" conflict with "duck" and "dove".
- "du" uniquely identifies "duck".
- "dov" uniquely identifies "dove".
\`\`\`

### Constraints
- \`1 <= words.length <= 1000\`
- \`1 <= words[i].length <= 100\`
- Words consist only of lowercase letters.`,
    inputFormat: 'Array of strings words.',
    outputFormat: 'Array of shortest unique prefix strings.',
    constraints: '1 <= words.length <= 1000',
  },

  'find-smallest-number-with-given-number-of-digits-and-digit-sum': {
    title: 'Find Smallest Number with Given Digits and Digit Sum',
    statement: `Given two integers \`s\` (sum of digits) and \`d\` (number of digits), find the **smallest positive number** that has \`d\` digits and the sum of its digits equals \`s\`.

If no such number exists (e.g. if \`s > 9 * d\` or \`s == 0\` when \`d > 1\`), return \`"-1"\`.

### Examples

**Example 1:**
\`\`\`text
Input: s = 9, d = 2
Output: "18"
Explanation: Smallest 2-digit number with digit sum 9 is 18 (1 + 8 = 9).
\`\`\`

**Example 2:**
\`\`\`text
Input: s = 20, d = 3
Output: "299"
Explanation: 2 + 9 + 9 = 20.
\`\`\`

### Constraints
- \`1 <= s <= 1000\`
- \`1 <= d <= 1000\``,
    inputFormat: 'Digit sum s and digit count d.',
    outputFormat: 'Smallest number string or "-1".',
    constraints: '1 <= s, d <= 1000',
  },

  'find-the-maximum-repeating-number-in-on-time-and-o1-extra-space': {
    title: 'Find Maximum Repeating Number',
    statement: `Given an array \`arr\` of \`n\` integers where every element is in the range \`[0, k - 1]\`, find the **maximum repeating element** (element with the highest frequency).

If there is a tie, return the smallest value among the maximum repeating elements.

The algorithm must run in **O(n) time** and use **O(1) extra space**.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [2, 3, 3, 5, 3, 4, 1, 7], k = 8
Output: 3
Explanation: 3 occurs 3 times, which is the highest frequency.
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`1 <= k <= n\`
- \`0 <= arr[i] < k\``,
    inputFormat: 'Array arr and upper bound k.',
    outputFormat: 'Most frequent integer.',
    constraints: '1 <= n <= 10^5\nO(1) extra space.',
  },

  'find-the-recurring-function': {
    title: 'Find Recurring Function Period and Cycle',
    statement: `Given an iterative function or state transition sequence generated by \`f(x)\`, detect if a cycle exists, and find the start index of the cycle and the period length.

Return the length of the recurring period.

### Constraints
- Sequence fits in standard memory.`,
    inputFormat: 'Initial state and transition parameters.',
    outputFormat: 'Period length of the recurring cycle.',
    constraints: 'Period length <= 10^5',
  },

  'find-the-smallest-positive-number': {
    title: 'First Missing Positive',
    statement: `Given an unsorted integer array \`nums\`, return the **smallest positive integer** that is not present in \`nums\`.

You must implement an algorithm that runs in **O(n) time** and uses **O(1) auxiliary space**.

### Examples

**Example 1:**
\`\`\`text
Input: nums = [1, 2, 0]
Output: 3
Explanation: Numbers in [1, 2] are all in the array. Smallest missing positive is 3.
\`\`\`

**Example 2:**
\`\`\`text
Input: nums = [3, 4, -1, 1]
Output: 2
Explanation: 1 is in the array, but 2 is missing.
\`\`\`

**Example 3:**
\`\`\`text
Input: nums = [7, 8, 9, 11, 12]
Output: 1
\`\`\`

### Constraints
- \`1 <= nums.length <= 10^5\`
- \`-2^{31} <= nums[i] <= 2^{31} - 1\``,
    inputFormat: 'Array of integers nums.',
    outputFormat: 'Smallest missing positive integer.',
    constraints: '1 <= nums.length <= 10^5\nO(1) auxiliary space.',
  },

  'find-whether-it-is-possible-to-finish-all-tasks-or-not-from-given-dependencies': {
    title: 'Course Schedule / Task Dependency Verification',
    statement: `There are a total of \`numTasks\` tasks you have to finish, labeled from \`0\` to \`numTasks - 1\`. Some tasks may have prerequisites, for example to finish task 0 you have to first finish task 1, which is expressed as a pair: \`[0, 1]\`.

Given the total number of tasks \`numTasks\` and an array of prerequisite pairs \`prerequisites\`, return \`true\` if it is possible to finish all tasks, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: numTasks = 2, prerequisites = [[1, 0]]
Output: true
Explanation: Finish task 0, then finish task 1.
\`\`\`

**Example 2:**
\`\`\`text
Input: numTasks = 2, prerequisites = [[1, 0], [0, 1]]
Output: false
Explanation: Tasks 0 and 1 depend on each other (cycle exists).
\`\`\`

### Constraints
- \`1 <= numTasks <= 2000\`
- \`0 <= prerequisites.length <= 5000\``,
    inputFormat: 'numTasks and list of dependency pairs.',
    outputFormat: 'Boolean indicating if all tasks can be finished.',
    constraints: '1 <= numTasks <= 2000',
  },

  'flatten-a-linked-list-with-next-and-child-pointers': {
    title: 'Flatten a Multilevel Doubly Linked List',
    statement: `You are given a doubly linked list, which contains nodes that have a next pointer, a previous pointer, and an additional **child pointer**. This child pointer may point to a separate doubly linked list, which can also have its own children, forming a multilevel data structure.

Given the \`head\` of the first level of the list, **flatten** the list so that all the nodes appear in a single-level, doubly linked list. Let \`curr\` be a node with a child list. The nodes in the child list should appear after \`curr\` and before \`curr.next\` in the flattened list.

Return the \`head\` of the flattened list.

### Examples

**Example 1:**
\`\`\`text
Input: head = [1, 2, 3, 4, 5, 6, null, null, null, 7, 8, 9, 10, null, null, 11, 12]
Output: [1, 2, 3, 7, 8, 11, 12, 9, 10, 4, 5, 6]
\`\`\`

### Constraints
- Number of nodes in range \`[0, 1000]\`.
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Multilevel linked list head.',
    outputFormat: 'Flattened doubly linked list head.',
    constraints: '0 <= nodes <= 1000',
  },

  'flatten-bst-to-sorted-list': {
    title: 'Flatten BST to Sorted List',
    statement: `Given the root of a Binary Search Tree (BST), flatten the tree into a sorted list in-place such that:
1. Each node's \`left\` pointer is \`null\`.
2. Each node's \`right\` pointer points to the next node in the in-order sorted sequence.

Return the root of the flattened right-skewed tree.

### Examples

**Example 1:**
\`\`\`text
Input: root = [5, 3, 7, 2, 4, 6, 8]
Output: 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of BST.',
    outputFormat: 'Head node of flattened right-skewed tree.',
    constraints: '1 <= nodes <= 10^5',
  },

  'flattening-a-linked-list': {
    title: 'Flattening a Linked List',
    statement: `Given a linked list where every node represents a sub-list and contains two pointers:
1. \`next\` pointer: Points to the next main node in the linked list.
2. \`bottom\` pointer: Points to a sub-linked list where nodes are already **sorted in ascending order**.

Flatten the entire data structure into a single sorted linked list connected by \`bottom\` pointers.

Return the head of the flattened sorted linked list.

### Examples

**Example 1:**
\`\`\`text
Input:
5 -> 10 -> 19 -> 28
|    |     |     |
7    20    22    35
|          |     |
8          50    40
|                |
30               45

Output: 5 -> 7 -> 8 -> 10 -> 19 -> 20 -> 22 -> 28 -> 30 -> 35 -> 40 -> 45 -> 50
\`\`\`

### Constraints
- \`1 <= nodes <= 10^5\`
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Head node of 2D linked list.',
    outputFormat: 'Head of single sorted linked list.',
    constraints: '1 <= nodes <= 10^5',
  },

  'floyd-warshall': {
    title: 'Floyd-Warshall Algorithm',
    statement: `The **Floyd-Warshall** algorithm solves the all-pairs shortest path problem for a directed weighted graph.

Given an \`n x n\` adjacency matrix \`matrix\` where \`matrix[i][j]\` represents the weight of the directed edge from vertex \`i\` to vertex \`j\` (or \`-1\` if no edge exists), update the matrix in-place so that \`matrix[i][j]\` contains the shortest path distance from \`i\` to \`j\`.

If vertex \`j\` is unreachable from \`i\`, leave \`matrix[i][j] = -1\`.

### Examples

**Example 1:**
\`\`\`text
Input: matrix = [
  [0, 2, -1, -1],
  [1, 0, 3, -1],
  [-1, -1, 0, -1],
  [3, 5, 4, 0]
]
Output: [
  [0, 2, 5, -1],
  [1, 0, 3, -1],
  [-1, -1, 0, -1],
  [3, 5, 4, 0]
]
\`\`\`

### Constraints
- \`1 <= n <= 100\`
- \`-1 <= matrix[i][j] <= 1000\``,
    inputFormat: 'n x n adjacency matrix.',
    outputFormat: 'Matrix of all-pairs shortest distances.',
    constraints: '1 <= n <= 100',
  },

  'given-a-sequence-of-words-print-all-anagrams-together': {
    title: 'Group Anagrams',
    statement: `Given an array of strings \`words\`, group the anagrams together. You can return the answer in any order.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Examples

**Example 1:**
\`\`\`text
Input: words = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
\`\`\`

**Example 2:**
\`\`\`text
Input: words = [""]
Output: [[""]]
\`\`\`

**Example 3:**
\`\`\`text
Input: words = ["a"]
Output: [["a"]]
\`\`\`

### Constraints
- \`1 <= words.length <= 10^4\`
- \`0 <= words[i].length <= 100\`
- \`words[i]\` consists of lowercase English letters.`,
    inputFormat: 'Array of strings words.',
    outputFormat: 'List of lists of grouped anagrams.',
    constraints: '1 <= words.length <= 10^4',
  },

  'given-n-appointments-find-all-conflicting-appointments': {
    title: 'Find All Conflicting Appointments',
    statement: `Given an array of \`n\` appointment intervals \`intervals\` where \`intervals[i] = [start, end]\`, find all pairs of appointments that **conflict (overlap)** with each other.

Two appointments \`[s1, e1]\` and \`[s2, e2]\` conflict if \`s1 < e2\` and \`s2 < e1\`.

Return all conflicting pairs.

### Examples

**Example 1:**
\`\`\`text
Input: intervals = [[1, 5], [3, 7], [2, 6], [10, 15], [5, 6], [4, 100]]
Output: Conflicting pairs:
[1, 5] conflicts with [3, 7], [2, 6], [4, 100]
[3, 7] conflicts with [2, 6], [5, 6], [4, 100]
...
\`\`\`

### Constraints
- \`1 <= n <= 10^5\`
- \`0 <= start < end <= 10^9\``,
    inputFormat: 'List of appointment intervals.',
    outputFormat: 'Pairs of overlapping appointments.',
    constraints: '1 <= n <= 10^5',
  },

  'gold-mine': {
    title: 'Gold Mine Problem',
    statement: `Given a gold mine of \`m x n\` dimensions, each field in this mine contains a positive integer which is the amount of gold in tons.

Initially the miner is in the first column but can be at any row \`0\` to \`m - 1\`. From cell \`(r, c)\`, the miner can move to:
1. Diagonally right-up: \`(r - 1, c + 1)\`
2. Right: \`(r, c + 1)\`
3. Diagonally right-down: \`(r + 1, c + 1)\`

Find the **maximum amount of gold** the miner can collect reaching the last column.

### Examples

**Example 1:**
\`\`\`text
Input: m = 3, n = 3, mine = [
  [1, 3, 3],
  [2, 1, 4],
  [0, 6, 4]
]
Output: 12
Explanation: Path (2,0) -> (1,1) -> (1,2) collects 0 + 6 + 4 = 10, or (1,0) -> (2,1) -> (2,2) collects 2 + 6 + 4 = 12.
\`\`\`

### Constraints
- \`1 <= m, n <= 500\`
- \`0 <= mine[i][j] <= 1000\``,
    inputFormat: 'Grid dimensions m, n and mine matrix.',
    outputFormat: 'Maximum gold collected.',
    constraints: '1 <= m, n <= 500',
  },

  'graph-coloring': {
    title: 'Graph Coloring Problem',
    statement: `Given an undirected graph with \`n\` vertices and an integer \`m\`, determine if the graph can be colored with at most \`m\` colors such that **no two adjacent vertices share the same color**.

Return \`true\` if an \`m\`-coloring is possible, otherwise return \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], m = 3
Output: true
Explanation: Graph can be colored with 3 colors.
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`1 <= m <= n\`
- \`0 <= edges.length <= 100\``,
    inputFormat: 'Number of vertices n, edges, and number of colors m.',
    outputFormat: 'Boolean indicating if m-coloring is possible.',
    constraints: '1 <= n <= 20',
  },

  'greedy-algorithm-egyptian-fraction': {
    title: 'Egyptian Fraction (Greedy Algorithm)',
    statement: `Every positive fraction can be represented as the sum of unique **unit fractions** (fractions of the form \`1 / x\`). A sum of unit fractions is called an **Egyptian Fraction**.

Given a positive fraction \`p / q\` (represented by numerator \`p\` and denominator \`q\`), find its Egyptian Fraction representation using Fibonacci's greedy algorithm.

Return the denominators of the unit fractions as an array.

### Examples

**Example 1:**
\`\`\`text
Input: p = 2, q = 3
Output: [2, 6]
Explanation: 2/3 = 1/2 + 1/6.
\`\`\`

**Example 2:**
\`\`\`text
Input: p = 6, q = 14
Output: [3, 11, 231]
Explanation: 6/14 = 3/7 = 1/3 + 1/11 + 1/231.
\`\`\`

### Constraints
- \`1 <= p, q <= 1000\``,
    inputFormat: 'Numerator p and denominator q.',
    outputFormat: 'Array of unit fraction denominators.',
    constraints: '1 <= p, q <= 1000',
  },

  'group-shifted-strings': {
    title: 'Group Shifted Strings',
    statement: `Perform the following shift operation on a string:
- Shift each letter to its successive letter in the alphabet: \`'a'\` becomes \`'b'\`, \`'b'\` becomes \`'c'\`, ..., and \`'z'\` becomes \`'a'\`.

For example, \`"abc"\` can be shifted to become \`"bcd"\`, and \`"az"\` can be shifted to become \`"ba"\`.

Given an array of strings \`strings\`, group all \`strings[i]\` that belong to the same shifting sequence. You may return the answer in any order.

### Examples

**Example 1:**
\`\`\`text
Input: strings = ["abc","bcd","acef","xyz","az","ba","a","z"]
Output: [["acef"],["a","z"],["abc","bcd","xyz"],["az","ba"]]
\`\`\`

**Example 2:**
\`\`\`text
Input: strings = ["a"]
Output: [["a"]]
\`\`\`

### Constraints
- \`1 <= strings.length <= 200\`
- \`1 <= strings[i].length <= 50\`
- \`strings[i]\` consists of lowercase English letters.`,
    inputFormat: 'An array of strings.',
    outputFormat: 'A list of grouped string arrays.',
    constraints: '1 <= strings.length <= 200\n1 <= strings[i].length <= 50',
    testCases: [
      {
        input: '["abc","bcd","acef","xyz","az","ba","a","z"]',
        expectedOutput: '[["acef"],["a","z"],["abc","bcd","xyz"],["az","ba"]]',
        isSample: true,
        isHidden: false,
      },
      {
        input: '["a"]',
        expectedOutput: '[["a"]]',
        isSample: true,
        isHidden: false,
      },
      {
        input: '["ab","ba"]',
        expectedOutput: '[["ab"],["ba"]]',
        isSample: false,
        isHidden: true,
      },
    ],
  },

  'heap-sort': {
    title: 'Heap Sort',
    statement: `Given an array of integers \`arr\`, sort the array in **ascending order** using the **Heap Sort** algorithm.

Heap Sort works by:
1. Building a Max Heap from the input array.
2. Swapping the root (maximum element) with the last unsorted element.
3. Heapifying the root to maintain max-heap property.
4. Repeating until the entire array is sorted.

Return the sorted array.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [4, 10, 3, 5, 1]
Output: [1, 3, 4, 5, 10]
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^5\`
- \`-10^9 <= arr[i] <= 10^9\``,
    inputFormat: 'Array of integers.',
    outputFormat: 'Sorted array.',
    constraints: '1 <= arr.length <= 10^5',
  },

  'height-of-binary-tree': {
    title: 'Height of Binary Tree',
    statement: `Given the root of a binary tree, find its **height** (maximum depth).

The height of a binary tree is the number of edges on the longest path from the root node to a leaf node (or number of nodes from root to farthest leaf).

### Examples

**Example 1:**
\`\`\`text
Input: root = [3, 9, 20, null, null, 15, 7]
Output: 3
Explanation: The longest root-to-leaf path is 3 -> 20 -> 15 with 3 nodes.
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [1, null, 2]
Output: 2
\`\`\`

### Constraints
- The number of nodes in the tree is in the range \`[0, 10^4]\`.
- \`-100 <= Node.val <= 100\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Integer height of the tree.',
    constraints: '0 <= nodes <= 10^4',
  },

  'implement-a-phone-directory': {
    title: 'Implement Phone Directory (Autocomplete)',
    statement: `Given a list of contacts \`contacts\` and a search query string \`query\`, implement a search mechanism that displays matching contacts for each prefix typed by the user.

For each prefix of length \`1\` to \`query.length\`, return the list of contacts that begin with that prefix, sorted lexicographically. If no contacts match a prefix, output \`0\` or \`["0"]\`.

### Examples

**Example 1:**
\`\`\`text
Input: contacts = ["geeikistest", "geeksforgeeks", "geeksfortest"], query = "geeips"
Output:
Prefix 'g': ["geeikistest", "geeksforgeeks", "geeksfortest"]
Prefix 'ge': ["geeikistest", "geeksforgeeks", "geeksfortest"]
Prefix 'gee': ["geeikistest", "geeksforgeeks", "geeksfortest"]
Prefix 'geei': ["geeikistest"]
Prefix 'geeip': ["0"]
\`\`\`

### Constraints
- \`1 <= contacts.length <= 50\`
- \`1 <= contacts[i].length <= 50\`
- Lowercase English letters only.`,
    inputFormat: 'Contacts list and query string.',
    outputFormat: 'Suggested contact list for each prefix.',
    constraints: '1 <= contacts.length <= 50',
  },

  'implement-stack-queue-using-deque': {
    title: 'Implement Stack and Queue Using Deque',
    statement: `Implement standard **Stack** (\`push\`, \`pop\`, \`peek\`) and **Queue** (\`enqueue\`, \`dequeue\`, \`front\`) data structures using a **Double-Ended Queue (Deque)**.

All operations must be performed using only the operations supported by Deque (\`insertFront\`, \`insertRear\`, \`deleteFront\`, \`deleteRear\`).

### Constraints
- Up to \`10^5\` operations.`,
    inputFormat: 'Method calls with parameters.',
    outputFormat: 'Outputs of pop / dequeue operations.',
    constraints: 'All operations O(1).',
  },

  'infix-to-postfix': {
    title: 'Infix to Postfix Conversion',
    statement: `Given an infix expression \`s\`, convert it to a **postfix expression (Reverse Polish Notation)**.

The operators include \`^\`, \`*\`, \`/\`, \`+\`, \`-\`, with precedence:
- \`^\` (highest, right-associative)
- \`*\`, \`/\` (middle, left-associative)
- \`+\`, \`-\` (lowest, left-associative)

Parentheses \`(\` and \`)\` alter normal precedence.

### Examples

**Example 1:**
\`\`\`text
Input: s = "a+b*(c^d-e)^(f+g*h)-i"
Output: "abcd^e-fgh*+^*+i-"
\`\`\`

### Constraints
- \`1 <= s.length <= 10^5\`
- Valid infix expression with single-character operands.`,
    inputFormat: 'Infix expression string.',
    outputFormat: 'Postfix expression string.',
    constraints: '1 <= s.length <= 10^5',
  },

  'iterative-tower-of-hanoi': {
    title: 'Iterative Tower of Hanoi',
    statement: `The **Tower of Hanoi** is a mathematical puzzle with 3 rods and \`n\` disks of different sizes.

The objective is to move the entire stack to another rod following these rules:
1. Only one disk can be moved at a time.
2. Each move takes the upper disk from one of the stacks and places it on top of another stack.
3. No disk may be placed on top of a smaller disk.

Implement an **iterative** (non-recursive) solution to solve Tower of Hanoi for \`n\` disks. Return the total number of moves made (\`2^n - 1\`).

### Examples

**Example 1:**
\`\`\`text
Input: n = 3
Output: 7
Explanation: Moves required for 3 disks: 2^3 - 1 = 7 moves.
\`\`\`

### Constraints
- \`1 <= n <= 30\``,
    inputFormat: 'Integer n representing number of disks.',
    outputFormat: 'Total moves count 2^n - 1.',
    constraints: '1 <= n <= 30',
  },

  'itinerary-from-a-list-of-tickets': {
    title: 'Reconstruct Itinerary from List of Tickets',
    statement: `You are given a list of flight tickets where \`tickets[i] = [from, to]\` represent the departure and arrival airports of one flight.

Find the complete **itinerary route** from start to finish. It is guaranteed that the tickets form a valid continuous itinerary with a single starting point and ending point.

Return the sequence of visited cities in order.

### Examples

**Example 1:**
\`\`\`text
Input: tickets = [["Chennai", "Bangalore"], ["Bombay", "Delhi"], ["Goa", "Chennai"], ["Delhi", "Goa"]]
Output: ["Bombay", "Delhi", "Goa", "Chennai", "Bangalore"]
Explanation: Starting city is "Bombay" (appears in 'from' but never in 'to').
\`\`\`

### Constraints
- \`1 <= tickets.length <= 10^4\`
- City names contain letters.`,
    inputFormat: 'List of ticket pairs [from, to].',
    outputFormat: 'Array of cities in itinerary order.',
    constraints: '1 <= tickets.length <= 10^4',
  },
};
