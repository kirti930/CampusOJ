export interface RichProblemSpec {
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isSample: boolean;
    isHidden: boolean;
  }>;
}

export const SPECS_PART1: Record<string, RichProblemSpec> = {
  'aggressive-cows': {
    title: 'Aggressive Cows',
    statement: `You are given an array \`stalls\` of size \`n\` representing the positions of stalls along a straight line, and an integer \`k\` representing the number of aggressive cows.

You want to assign cows to stalls such that the **minimum distance** between any two cows is as **large as possible**.

Return the largest possible minimum distance.

### Examples

**Example 1:**
\`\`\`text
Input: stalls = [1, 2, 4, 8, 9], k = 3
Output: 3
Explanation: Assign cows to stalls at positions 1, 4, and 8 or 9. The minimum distance between any pair is 3.
\`\`\`

**Example 2:**
\`\`\`text
Input: stalls = [10, 1, 2, 7, 5], k = 3
Output: 4
Explanation: Sorted stalls: [1, 2, 5, 7, 10]. Place cows at 1, 5, 10. The minimum distance is min(5-1, 10-5) = 4.
\`\`\`

### Constraints
- \`2 <= n <= 10^5\`
- \`2 <= k <= n\`
- \`0 <= stalls[i] <= 10^9\`
- All stall positions are distinct.`,
    inputFormat: 'First line contains n and k. Second line contains the array of stall coordinates.',
    outputFormat: 'Return the maximum minimum distance between cows.',
    constraints: '2 <= n <= 10^5\n2 <= k <= n\n0 <= stalls[i] <= 10^9',
  },

  'allen-dictionary': {
    title: 'Alien Dictionary',
    statement: `There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.

You are given a list of strings \`words\` from the alien language's dictionary, where the strings are **sorted lexicographically** according to the language's rules.

Return a string of the unique letters in the new alien language sorted in **lexicographically increasing order** by the new language's rules. If no valid ordering exists, return \`""\`. If multiple orders are valid, return any of them.

### Examples

**Example 1:**
\`\`\`text
Input: words = ["wrt","wrf","er","ett","rftt"]
Output: "wertf"
Explanation:
- From "wrt" and "wrf", we get 't' < 'f'.
- From "wrt" and "er", we get 'w' < 'e'.
- From "er" and "ett", we get 'r' < 't'.
- From "ett" and "rftt", we get 'e' < 'r'.
Total ordering: "wertf".
\`\`\`

**Example 2:**
\`\`\`text
Input: words = ["z","x"]
Output: "zx"
\`\`\`

**Example 3:**
\`\`\`text
Input: words = ["z","x","z"]
Output: ""
Explanation: The order is invalid because 'z' cannot precede 'x' and follow 'x' at the same time.
\`\`\`

### Constraints
- \`1 <= words.length <= 500\`
- \`1 <= words[i].length <= 100\`
- \`words[i]\` consists of only lowercase English letters.`,
    inputFormat: 'A list of words sorted according to alien lexicographical order.',
    outputFormat: 'Return a string representing characters in topological order.',
    constraints: '1 <= words.length <= 500\n1 <= words[i].length <= 100',
  },

  'allocate-minimum-number-of-pages': {
    title: 'Allocate Minimum Number of Pages',
    statement: `You are given an array \`pages\` of integers where \`pages[i]\` represents the number of pages in the \`i\`-th book. There are \`m\` students and the books must be distributed among them.

The allocation must follow these rules:
1. Each book must be allocated to exactly one student.
2. Each student must be allocated at least one book.
3. The allocation of books must be contiguous (i.e. a student receives a continuous block of books).

Allocate books to \`m\` students such that the **maximum number of pages assigned to any student is minimized**. Return this minimum possible maximum page count. If allocation is not possible, return \`-1\`.

### Examples

**Example 1:**
\`\`\`text
Input: pages = [12, 34, 67, 90], m = 2
Output: 113
Explanation: Allocation: [12, 34, 67] to student 1 (113 pages), and [90] to student 2 (90 pages). Maximum is 113.
\`\`\`

**Example 2:**
\`\`\`text
Input: pages = [15, 17, 20], m = 2
Output: 32
Explanation: Allocation: [15, 17] (32 pages) and [20] (20 pages). Max is 32.
\`\`\`

### Constraints
- \`1 <= pages.length <= 10^5\`
- \`1 <= pages[i] <= 10^6\`
- \`1 <= m <= 10^5\``,
    inputFormat: 'Array of page counts and integer m denoting number of students.',
    outputFormat: 'Return the minimized maximum pages, or -1 if impossible.',
    constraints: '1 <= pages.length <= 10^5\n1 <= m <= 10^5',
  },

  'arithmetic-expressions': {
    title: 'Arithmetic Expressions',
    statement: `Given an array of integers \`arr\`, insert operators \`+\`, \`-\`, or \`*\` between the elements from left to right such that the resulting mathematical expression evaluates to a value divisible by \`101\`.

Evaluation is strictly from left to right without operator precedence.

Return the valid arithmetic expression as a string.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [22, 79, 21]
Output: "22*79-21"
Explanation: 22 * 79 = 1738; 1738 - 21 = 1717; 1717 % 101 = 0.
\`\`\`

**Example 2:**
\`\`\`text
Input: arr = [55, 3, 45, 33]
Output: "55+3-45*33"
Explanation: Evaluates to (55 + 3 - 45) * 33 = 13 * 33 = 429; 429 is not 0 mod 101, but another valid configuration can yield 0 mod 101.
\`\`\`

### Constraints
- \`2 <= arr.length <= 10^4\`
- \`1 <= arr[i] <= 100\``,
    inputFormat: 'Array of integers.',
    outputFormat: 'Expression string formatted with numbers and operators.',
    constraints: '2 <= arr.length <= 10^4\n1 <= arr[i] <= 100',
  },

  'backtracking-set-2-rat-in-a-maze': {
    title: 'Rat in a Maze',
    statement: `Consider a rat placed at \`(0, 0)\` in a square matrix \`maze\` of order \`n x n\`. It has to reach the destination at \`(n - 1, n - 1)\`.

The rat can move in four directions: **Down (D)**, **Left (L)**, **Right (R)**, and **Up (U)**. A cell \`(i, j)\` with value \`1\` is open, while \`0\` is blocked.

Find all possible paths the rat can take from \`(0, 0)\` to \`(n - 1, n - 1)\` without visiting any cell more than once in a path. Return the paths sorted in lexicographical order.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, maze = [
  [1, 0, 0, 0],
  [1, 1, 0, 1],
  [0, 1, 0, 0],
  [1, 1, 1, 1]
]
Output: ["DDRDRR", "DRDDRR"]
Explanation: Two paths reach (3, 3): DDRDRR and DRDDRR.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 2, maze = [[1, 0], [1, 0]]
Output: []
Explanation: Destination (1, 1) has value 0, so no path exists.
\`\`\`

### Constraints
- \`2 <= n <= 10\`
- \`maze[i][j] \\in {0, 1}\``,
    inputFormat: 'Matrix size n followed by n x n binary grid.',
    outputFormat: 'Sorted array of path direction strings.',
    constraints: '2 <= n <= 10',
  },

  'backtracking-set-7-hamiltonian-cycle': {
    title: 'Hamiltonian Cycle',
    statement: `A **Hamiltonian Cycle** in an undirected graph is a closed loop that visits each vertex of the graph exactly once and returns to the starting vertex.

Given an undirected graph with \`n\` vertices represented as an adjacency matrix \`graph\`, determine if a Hamiltonian Cycle exists. If so, return any valid cycle as an array of vertices. If no such cycle exists, return an empty array.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, graph = [
  [0, 1, 0, 1, 0],
  [1, 0, 1, 1, 1],
  [0, 1, 0, 0, 1],
  [1, 1, 0, 0, 1],
  [0, 1, 1, 1, 0]
]
Output: [0, 1, 2, 4, 3, 0]
Explanation: Visiting 0 -> 1 -> 2 -> 4 -> 3 -> 0 covers all vertices once.
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`graph[i][j] \\in {0, 1}\``,
    inputFormat: 'Number of vertices n followed by n x n adjacency matrix.',
    outputFormat: 'Array of vertices representing the cycle, or empty if none exists.',
    constraints: '1 <= n <= 20',
  },

  'backtracking-set-8-solving-cryptarithmetic-puzzles': {
    title: 'Cryptarithmetic Puzzle Solver',
    statement: `A **cryptarithmetic puzzle** is an arithmetic problem in which numbers are replaced with letters. Each unique letter represents a unique digit from \`0\` to \`9\`, and no leading digit of any word can be \`0\`.

Given three strings \`s1\`, \`s2\`, and \`s3\`, determine if there exists an assignment of digits to letters such that:
\`value(s1) + value(s2) = value(s3)\`

Return a map/dictionary of each character to its assigned digit, or an empty map if no solution exists.

### Examples

**Example 1:**
\`\`\`text
Input: s1 = "SEND", s2 = "MORE", s3 = "MONEY"
Output: {"S":9, "E":5, "N":6, "D":7, "M":1, "O":0, "R":8, "Y":2}
Explanation: 9567 + 1085 = 10652.
\`\`\`

### Constraints
- \`1 <= s1.length, s2.length, s3.length <= 10\`
- Number of unique characters across all strings <= 10.`,
    inputFormat: 'Three strings representing operands and result.',
    outputFormat: 'Character to digit mapping.',
    constraints: 'Unique letters <= 10',
  },

  'bbt-counter': {
    title: 'Count Balanced Binary Trees of Height H',
    statement: `Given the height \`h\` of a binary tree, count the number of **height-balanced** binary trees that can be formed of height \`h\`.

A binary tree is height-balanced if the absolute difference between heights of left and right subtrees for every node is at most 1.

Return the count modulo \`10^9 + 7\`.

### Examples

**Example 1:**
\`\`\`text
Input: h = 2
Output: 3
Explanation: Trees with height 2 can have (left, right) heights of (1, 1), (1, 0), or (0, 1). There are 3 such trees.
\`\`\`

**Example 2:**
\`\`\`text
Input: h = 3
Output: 15
\`\`\`

### Constraints
- \`1 <= h <= 10^3\``,
    inputFormat: 'Integer h denoting the height.',
    outputFormat: 'Number of balanced binary trees modulo 10^9 + 7.',
    constraints: '1 <= h <= 10^3',
  },

  'bellman-ford': {
    title: 'Bellman-Ford Algorithm',
    statement: `Given a weighted directed graph with \`n\` vertices numbered from \`0\` to \`n - 1\` and an array of directed edges \`edges\` where \`edges[i] = [u, v, w]\`, compute the shortest distances from source vertex \`src\` to all other vertices.

If the graph contains a **negative weight cycle** reachable from \`src\`, return an array with a single element \`[-1]\`.

Otherwise, return an array \`dist\` of size \`n\` where \`dist[i]\` is the shortest path distance from \`src\` to vertex \`i\`. If a vertex is unreachable, set its distance to \`10^8\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1, 4], [0, 2, 5], [1, 3, 2], [2, 3, -2]], src = 0
Output: [0, 4, 5, 3]
Explanation: Shortest distances from 0:
- to 0: 0
- to 1: 4
- to 2: 5
- to 3: min(0->1->3 = 6, 0->2->3 = 3) = 3.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 3, edges = [[0, 1, 1], [1, 2, -1], [2, 0, -1]], src = 0
Output: [-1]
Explanation: Edges form a negative weight cycle: 1 + (-1) + (-1) = -1 < 0.
\`\`\`

### Constraints
- \`1 <= n <= 500\`
- \`0 <= edges.length <= 5000\`
- \`-1000 <= w <= 1000\``,
    inputFormat: 'n, list of edges [u, v, w], and src.',
    outputFormat: 'Array of shortest distances or [-1] if negative cycle exists.',
    constraints: '1 <= n <= 500\n-1000 <= w <= 1000',
  },

  'bfs': {
    title: 'Breadth First Search (BFS)',
    statement: `Given an undirected graph with \`n\` vertices numbered \`0\` to \`n - 1\` represented as an adjacency list \`adj\`, return a list of all vertices in the order they are visited during a **Breadth First Search (BFS)** traversal starting from vertex \`0\`.

When exploring adjacent vertices of a node, visit them in increasing order of their indices.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, adj = [[1, 2, 3], [], [4], [], []]
Output: [0, 1, 2, 3, 4]
Explanation:
Start at 0: visit 0.
Explore neighbors of 0: visit 1, 2, 3.
Explore neighbors of 2: visit 4.
BFS traversal order: [0, 1, 2, 3, 4].
\`\`\`

### Constraints
- \`1 <= n <= 10^4\`
- \`0 <= edges <= 5 * 10^4\``,
    inputFormat: 'n vertices and adjacency list.',
    outputFormat: 'Array of visited vertices in BFS order.',
    constraints: '1 <= n <= 10^4',
  },

  'binary-search-tree-set-1-search-and-insertion': {
    title: 'Binary Search Tree - Search and Insertion',
    statement: `Given the root of a Binary Search Tree (BST) and a value \`val\`, implement the following operations:
1. **Search**: Return \`true\` if \`val\` exists in the BST, otherwise return \`false\`.
2. **Insert**: Insert \`val\` into the BST such that BST properties are maintained, and return the new root.

### Examples

**Example 1:**
\`\`\`text
Input: root = [4, 2, 7, 1, 3], val = 5 (Insert)
Output: [4, 2, 7, 1, 3, 5]
\`\`\`

**Example 2:**
\`\`\`text
Input: root = [4, 2, 7, 1, 3], val = 2 (Search)
Output: true
\`\`\`

### Constraints
- Number of nodes is in range \`[1, 10^4]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'BST root and target value.',
    outputFormat: 'Updated BST or boolean result.',
    constraints: '1 <= nodes <= 10^4',
  },

  'binary-tree-to-bst': {
    title: 'Binary Tree to BST',
    statement: `Given a Binary Tree, convert it to a **Binary Search Tree (BST)** such that the original structure of the binary tree is preserved.

That is, the converted tree must have the exact same shape and parent-child connections, but node values must satisfy the BST property (\`left.val < node.val < right.val\`).

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, -1, -1, 4]
Output: Inorder traversal of resulting BST: [1, 2, 3, 4]
Explanation: Store inorder values, sort them, and re-populate the tree in-order.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Root of converted BST.',
    constraints: '1 <= nodes <= 10^4',
  },

  'binary-tree-to-dll': {
    title: 'Binary Tree to Doubly Linked List',
    statement: `Given the root of a Binary Tree, convert it into a **Doubly Linked List (DLL)** in-place according to the **in-order traversal** of the tree.

The \`left\` pointer of a tree node should act as the \`prev\` pointer in the DLL, and the \`right\` pointer should act as the \`next\` pointer.

Return the head of the converted doubly linked list.

### Examples

**Example 1:**
\`\`\`text
Input: root = [10, 12, 15, 25, 30, 36]
Output: DLL nodes in order: 25 <-> 12 <-> 30 <-> 10 <-> 36 <-> 15
Explanation: In-order traversal visits nodes in this sequence.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Head node of the doubly linked list.',
    constraints: '1 <= nodes <= 10^5',
  },

  'bottom-view-of-binary-tree': {
    title: 'Bottom View of Binary Tree',
    statement: `Given a binary tree, return the **bottom view** of the tree.

The bottom view consists of the nodes that are visible when the tree is viewed from the bottom. If there are multiple bottom-most nodes at the same horizontal distance, the node that appears later (deeper / traversed later) in level order is visible.

Return the values of bottom-view nodes ordered from **leftmost horizontal distance to rightmost horizontal distance**.

### Examples

**Example 1:**
\`\`\`text
Input: root = [20, 8, 22, 5, 3, 4, 25, -1, -1, 10, 14]
Output: [5, 10, 4, 14, 25]
Explanation:
Horizontal distances:
- HD = -2: 5
- HD = -1: 10 (bottom of 8, 10)
- HD = 0: 4 (bottom of 20, 3, 4)
- HD = 1: 14 (bottom of 22, 14)
- HD = 2: 25
Result: [5, 10, 4, 14, 25]
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values in bottom view from left to right.',
    constraints: '1 <= nodes <= 10^5',
  },

  'boundary-traversal-of-binary-tree': {
    title: 'Boundary Traversal of Binary Tree',
    statement: `Given a Binary Tree, return its **boundary traversal** in anti-clockwise order starting from the root.

The boundary includes:
1. **Root node**.
2. **Left boundary**: Nodes from root towards left child excluding leaf nodes.
3. **Leaf nodes**: All leaves from left to right.
4. **Right boundary**: Nodes from right towards root (in reverse order) excluding leaf nodes.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, 2, 3, 4, 5, 6, 7]
Output: [1, 2, 4, 5, 6, 7, 3]
Explanation:
- Root: 1
- Left boundary: 2
- Leaves: 4, 5, 6, 7
- Right boundary: 3
Boundary traversal: [1, 2, 4, 5, 6, 7, 3]
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^5]\`.
- \`-10^5 <= Node.val <= 10^5\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Array of node values visited in anti-clockwise boundary traversal.',
    constraints: '1 <= nodes <= 10^5',
  },

  'boyer-moore-algorithm-for-pattern-searching': {
    title: 'Boyer-Moore Pattern Searching',
    statement: `Given a text string \`txt\` and a pattern string \`pat\`, find all starting indices of occurrences of \`pat\` in \`txt\` using the **Boyer-Moore algorithm** (bad character heuristic).

Return the 0-indexed starting positions in increasing order.

### Examples

**Example 1:**
\`\`\`text
Input: txt = "AABAACAADAABAABA", pat = "AABA"
Output: [0, 9, 12]
Explanation: "AABA" occurs starting at index 0, index 9, and index 12.
\`\`\`

### Constraints
- \`1 <= txt.length <= 10^5\`
- \`1 <= pat.length <= txt.length\`
- Strings contain ASCII characters.`,
    inputFormat: 'Text string and pattern string.',
    outputFormat: 'Array of 0-based match indices.',
    constraints: '1 <= pat.length <= txt.length <= 10^5',
  },

  'calculate-square-of-a-number-without-using-and-pow': {
    title: 'Calculate Square Without Multiplication, Division, or Pow',
    statement: `Given an integer \`n\`, calculate and return \`n^2\` **without** using multiplication (\`*\`), division (\`/\`), or built-in power functions (\`pow\`).

You may use bitwise operators and addition/subtraction.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5
Output: 25
Explanation: 5 * 5 = 25.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = -7
Output: 49
Explanation: (-7)^2 = 49.
\`\`\`

### Constraints
- \`-10^5 <= n <= 10^5\``,
    inputFormat: 'Integer n.',
    outputFormat: 'Integer n squared.',
    constraints: '-10^5 <= n <= 10^5',
  },

  'catalan-number': {
    title: 'Catalan Number',
    statement: `Given an integer \`n\`, calculate the \`n\`-th **Catalan number**.

The \`n\`-th Catalan number is given by:
\`C_n = (2n)! / ((n + 1)! * n!)\`

Return the \`n\`-th Catalan number modulo \`10^9 + 7\`.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4
Output: 14
Explanation: C_0=1, C_1=1, C_2=2, C_3=5, C_4=14.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 5
Output: 42
\`\`\`

### Constraints
- \`0 <= n <= 1000\``,
    inputFormat: 'Integer n.',
    outputFormat: 'n-th Catalan number mod 10^9 + 7.',
    constraints: '0 <= n <= 1000',
  },

  'check-for-palindrome': {
    title: 'Check Palindrome',
    statement: `Given a string \`s\`, determine if it is a **palindrome**, considering only alphanumeric characters and ignoring cases.

A palindrome reads the same forwards and backwards.

### Examples

**Example 1:**
\`\`\`text
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

**Example 2:**
\`\`\`text
Input: s = "race a car"
Output: false
\`\`\`

### Constraints
- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.`,
    inputFormat: 'String s.',
    outputFormat: 'Boolean indicating whether s is palindrome.',
    constraints: '1 <= s.length <= 2 * 10^5',
  },

  'check-if-a-given-graph-is-tree-or-not': {
    title: 'Check If Graph Is a Tree',
    statement: `An undirected graph is a **tree** if and only if:
1. It is **connected**.
2. It contains **no cycles**.

Given \`n\` vertices numbered from \`0\` to \`n - 1\` and a list of undirected edges \`edges\`, return \`true\` if the graph forms a valid tree, and \`false\` otherwise.

### Examples

**Example 1:**
\`\`\`text
Input: n = 5, edges = [[0, 1], [0, 2], [0, 3], [1, 4]]
Output: true
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 5, edges = [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]
Output: false
Explanation: Edge [2, 3] and [1, 3] forms a cycle.
\`\`\`

### Constraints
- \`1 <= n <= 2000\`
- \`0 <= edges.length <= 5000\``,
    inputFormat: 'Number of vertices n and list of edges.',
    outputFormat: 'Boolean true if graph is a tree, false otherwise.',
    constraints: '1 <= n <= 2000',
  },

  'check-if-tree-is-isomorphic': {
    title: 'Check If Tree Is Isomorphic',
    statement: `Two binary trees are **isomorphic** if one tree can be obtained from the other by swapping left and right subtrees at any number of nodes.

Given the roots of two binary trees \`root1\` and \`root2\`, determine whether the two trees are isomorphic.

### Examples

**Example 1:**
\`\`\`text
Input: root1 = [1, 2, 3, 4, 5], root2 = [1, 3, 2, -1, -1, 5, 4]
Output: true
Explanation: Swapping children of root and node 2 in root2 yields root1.
\`\`\`

### Constraints
- Number of nodes in each tree in range \`[1, 10^4]\`.
- \`-10^4 <= Node.val <= 10^4\``,
    inputFormat: 'Roots of two binary trees.',
    outputFormat: 'Boolean indicating if trees are isomorphic.',
    constraints: '1 <= nodes <= 10^4',
  },

  'check-whether-bst-contains-dead-end': {
    title: 'Check Whether BST Contains Dead End',
    statement: `Given a Binary Search Tree (BST) containing unique positive integers, determine whether it contains a **dead end**.

A dead end is a leaf node where no further node can be inserted as a child without violating the BST property, assuming all node values must be strictly greater than 0 and integers.

Return \`true\` if a dead end exists, otherwise \`false\`.

### Examples

**Example 1:**
\`\`\`text
Input: root = [8, 5, 9, 2, 7, -1, -1, 1]
Output: true
Explanation: Node 1 has range [1, 1] because its parent is 2 and minimum is 1. No integer can be inserted as a child.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Root of BST.',
    outputFormat: 'Boolean true if dead end exists, false otherwise.',
    constraints: '1 <= nodes <= 10^4',
  },

  'chinese-postman': {
    title: 'Chinese Postman Problem',
    statement: `The **Chinese Postman Problem** (or Route Inspection Problem) asks for the shortest closed walk (tour) that visits every edge of a connected, undirected, weighted graph at least once.

Given \`n\` vertices and a list of weighted edges \`edges\`, return the minimum total length of a closed walk traversing every edge.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4, edges = [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4]]
Output: 10
Explanation: All vertices have even degree (degree 2). An Eulerian circuit traverses every edge exactly once: 1+2+3+4 = 10.
\`\`\`

### Constraints
- \`1 <= n <= 20\`
- \`1 <= edges.length <= 100\`
- \`1 <= weight <= 1000\``,
    inputFormat: 'n vertices and edge list.',
    outputFormat: 'Minimum total tour weight.',
    constraints: '1 <= n <= 20',
  },

  'clone-a-linked-list-with-next-and-random-pointer': {
    title: 'Clone a Linked List with Next and Random Pointer',
    statement: `A linked list of length \`n\` is given such that each node contains an additional random pointer, which could point to any node in the list, or \`null\`.

Construct a **deep copy** of the list. The deep copy should consist of exactly \`n\` brand new nodes, where each new node has its value set to the value of its corresponding original node. Both the \`next\` and \`random\` pointer of the new nodes should point to new nodes in the copied list such that the pointers in the original list and copied list represent the same list state.

Return the head of the copied linked list.

### Examples

**Example 1:**
\`\`\`text
Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]
\`\`\`

### Constraints
- \`0 <= n <= 1000\`
- \`-10^4 <= Node.val <= 10^4\`
- \`Node.random\` is null or is pointing to some node in the linked list.`,
    inputFormat: 'Head node of the linked list.',
    outputFormat: 'Head of deep copied linked list.',
    constraints: '0 <= n <= 1000',
  },

  'connect-ropes': {
    title: 'Connect Ropes with Minimum Cost',
    statement: `There are \`n\` ropes of different lengths. You need to connect all ropes into a single rope.

The cost to connect two ropes of length \`x\` and \`y\` is \`x + y\`.

Find the **minimum total cost** to connect all ropes into one single rope.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [4, 3, 2, 6]
Output: 29
Explanation:
1. Connect 2 and 3: cost = 5, ropes = [4, 5, 6]
2. Connect 4 and 5: cost = 9, ropes = [6, 9]
3. Connect 6 and 9: cost = 15, ropes = [15]
Total cost = 5 + 9 + 15 = 29.
\`\`\`

### Constraints
- \`1 <= arr.length <= 10^5\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array of rope lengths.',
    outputFormat: 'Minimum cost to connect all ropes.',
    constraints: '1 <= arr.length <= 10^5',
  },

  'construct-a-trie-from-scratch': {
    title: 'Construct a Trie (Prefix Tree)',
    statement: `A **Trie** (pronounced "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.

Implement the \`Trie\` class:
- \`Trie()\`: Initializes the trie object.
- \`void insert(String word)\`: Inserts the string \`word\` into the trie.
- \`boolean search(String word)\`: Returns \`true\` if the string \`word\` is in the trie, and \`false\` otherwise.
- \`boolean startsWith(String prefix)\`: Returns \`true\` if there is a previously inserted string \`word\` that has the prefix \`prefix\`, and \`false\` otherwise.

### Examples

**Example 1:**
\`\`\`text
Input:
["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
Output:
[null, null, true, false, true, null, true]

Explanation:
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // return True
trie.search("app");     // return False
trie.startsWith("app"); // return True
trie.insert("app");
trie.search("app");     // return True
\`\`\`

### Constraints
- \`1 <= word.length, prefix.length <= 2000\`
- \`word\` and \`prefix\` consist only of lowercase English letters.
- At most \`3 * 10^4\` calls in total will be made to \`insert\`, \`search\`, and \`startsWith\`.`,
    inputFormat: 'Method calls with word or prefix parameters.',
    outputFormat: 'Results of search and startsWith operations.',
    constraints: '1 <= word.length <= 2000',
  },

  'construct-binary-tree-from-string-with-brackets': {
    title: 'Construct Binary Tree from String with Brackets',
    statement: `Given a string \`s\` that represents a binary tree in bracket notation, construct the binary tree and return its preorder/inorder traversal.

The format is \`root(left)(right)\`, where \`root\` is an integer, \`(left)\` is the left subtree in parentheses, and \`(right)\` is the right subtree in parentheses.

### Examples

**Example 1:**
\`\`\`text
Input: s = "4(2(3)(1))(6(5))"
Output: Root with value 4, left child 2 (with children 3, 1), right child 6 (with child 5).
\`\`\`

### Constraints
- \`1 <= s.length <= 10^5\`
- \`s\` consists of digits, '(', ')', and '-'.`,
    inputFormat: 'String formatted with bracket notation.',
    outputFormat: 'Root of constructed binary tree.',
    constraints: '1 <= s.length <= 10^5',
  },

  'construct-bst-from-given-preorder-traversal': {
    title: 'Construct BST from Given Preorder Traversal',
    statement: `Given an array of integers \`preorder\`, which represents the **preorder traversal** of a Binary Search Tree (BST), construct and return the root of the BST.

A binary search tree has the property that for every node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value.

### Examples

**Example 1:**
\`\`\`text
Input: preorder = [8, 5, 1, 7, 10, 12]
Output: [8, 5, 10, 1, 7, null, 12]
Explanation: 8 is root, [5, 1, 7] forms left subtree, [10, 12] forms right subtree.
\`\`\`

### Constraints
- \`1 <= preorder.length <= 1000\`
- \`1 <= preorder[i] <= 10^8\`
- All values in \`preorder\` are unique.`,
    inputFormat: 'Array of preorder traversal integers.',
    outputFormat: 'Root of reconstructed BST.',
    constraints: '1 <= preorder.length <= 1000',
  },

  'convert-normal-bst-to-balanced-bst': {
    title: 'Convert Normal BST to Balanced BST',
    statement: `Given the root of a Binary Search Tree (BST), return a **balanced** binary search tree with the same node values. If there is more than one valid answer, return any of them.

A binary search tree is balanced if the depth of the two subtrees of every node never differs by more than 1.

### Examples

**Example 1:**
\`\`\`text
Input: root = [1, null, 2, null, 3, null, 4]
Output: [2, 1, 3, null, null, null, 4]
Explanation: Convert skewed BST into height-balanced BST.
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Root of unbalanced BST.',
    outputFormat: 'Root of height-balanced BST.',
    constraints: '1 <= nodes <= 10^4',
  },

  'copy-set-bits-in-a-range': {
    title: 'Copy Set Bits in a Range',
    statement: `Given two integers \`x\` and \`y\` and a 1-based range \`[l, r]\` from the right side, copy the set bits (1s) of \`y\` into \`x\` in the bit positions from \`l\` to \`r\` inclusive.

Return the modified value of \`x\`.

### Examples

**Example 1:**
\`\`\`text
Input: x = 10, y = 13, l = 2, r = 3
Output: 14
Explanation:
- x in binary: 1010
- y in binary: 1101
- Bits of y in positions 2 to 3 (from right) are 10.
- Copying into x gives 1110 = 14.
\`\`\`

### Constraints
- \`1 <= x, y <= 10^9\`
- \`1 <= l <= r <= 32\``,
    inputFormat: 'Integers x, y, l, r.',
    outputFormat: 'Modified integer x.',
    constraints: '1 <= l <= r <= 32',
  },

  'count-all-subsequences-having-product-less-than-k': {
    title: 'Count Subsequences Having Product Less Than K',
    statement: `Given a non-empty array of positive integers \`arr\` and a positive integer \`k\`, find the number of non-empty **subsequences** having product strictly less than \`k\`.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [1, 2, 3, 4], k = 10
Output: 11
Explanation: Subsequences with product < 10:
[1], [2], [3], [4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [1, 2, 3], [1, 2, 4]. Total = 11.
\`\`\`

### Constraints
- \`1 <= arr.length <= 30\`
- \`1 <= arr[i] <= 100\`
- \`1 <= k <= 10^5\``,
    inputFormat: 'Array arr and integer k.',
    outputFormat: 'Count of qualifying subsequences.',
    constraints: '1 <= arr.length <= 30',
  },

  'count-bst-nodes-that-lie-in-a-given-range': {
    title: 'Count BST Nodes That Lie in a Given Range',
    statement: `Given the root of a Binary Search Tree (BST) and two integers \`low\` and \`high\`, return the number of nodes in the BST whose values lie in the inclusive range \`[low, high]\`.

### Examples

**Example 1:**
\`\`\`text
Input: root = [10, 5, 50, 1, null, 40, 100], low = 5, high = 45
Output: 3
Explanation: Nodes with values 10, 5, and 40 lie in [5, 45].
\`\`\`

### Constraints
- Number of nodes in range \`[1, 10^4]\`.
- \`1 <= low <= high <= 10^5\``,
    inputFormat: 'Root of BST and range boundaries low, high.',
    outputFormat: 'Count of nodes within range.',
    constraints: '1 <= nodes <= 10^4',
  },

  'count-distinct-elements-in-every-window-of-size-k': {
    title: 'Count Distinct Elements in Every Window of Size K',
    statement: `Given an array \`arr\` of size \`n\` and an integer \`k\`, return an array containing the count of **distinct elements** in every contiguous sliding window of size \`k\` from left to right.

### Examples

**Example 1:**
\`\`\`text
Input: arr = [1, 2, 1, 3, 4, 2, 3], k = 4
Output: [3, 4, 4, 3]
Explanation:
- Window [1, 2, 1, 3] -> 3 distinct (1, 2, 3)
- Window [2, 1, 3, 4] -> 4 distinct (1, 2, 3, 4)
- Window [1, 3, 4, 2] -> 4 distinct (1, 2, 3, 4)
- Window [3, 4, 2, 3] -> 3 distinct (2, 3, 4)
\`\`\`

### Constraints
- \`1 <= k <= n <= 10^5\`
- \`1 <= arr[i] <= 10^5\``,
    inputFormat: 'Array arr and window size k.',
    outputFormat: 'Array of distinct element counts per window.',
    constraints: '1 <= k <= n <= 10^5',
  },

  'count-natural-numbers-whose-permutation-greater-number': {
    title: 'Count Numbers with Non-Decreasing Digits',
    statement: `Given an integer \`n\`, count how many natural numbers \`x\` in the range \`[1, n]\` have digits in **non-decreasing order** (i.e. every digit is greater than or equal to the digit preceding it).

### Examples

**Example 1:**
\`\`\`text
Input: n = 15
Output: 14
Explanation: All numbers from 1 to 15 have non-decreasing digits except 10. Thus 15 - 1 = 14 numbers.
\`\`\`

### Constraints
- \`1 <= n <= 10^9\``,
    inputFormat: 'Integer n.',
    outputFormat: 'Count of qualifying numbers.',
    constraints: '1 <= n <= 10^9',
  },

  'count-number-of-bits-to-be-flipped-to-convert-a-to-b': {
    title: 'Count Bits to Flip to Convert A to B',
    statement: `Given two integers \`a\` and \`b\`, count the minimum number of bits you need to flip to convert \`a\` into \`b\`.

This is equivalent to the Hamming distance between \`a\` and \`b\` (number of set bits in \`a ^ b\`).

### Examples

**Example 1:**
\`\`\`text
Input: a = 10, b = 20
Output: 4
Explanation:
- a = 01010 (binary)
- b = 10100 (binary)
- a ^ b = 11110 (binary) has 4 set bits.
\`\`\`

### Constraints
- \`0 <= a, b <= 10^9\``,
    inputFormat: 'Two integers a and b.',
    outputFormat: 'Count of bit flips needed.',
    constraints: '0 <= a, b <= 10^9',
  },

  'count-set-bits-in-an-integer': {
    title: 'Count Set Bits in an Integer',
    statement: `Given a positive integer \`n\`, return the number of **set bits** (1s) in its binary representation.

### Examples

**Example 1:**
\`\`\`text
Input: n = 6
Output: 2
Explanation: Binary representation of 6 is 110, which has 2 set bits.
\`\`\`

**Example 2:**
\`\`\`text
Input: n = 13
Output: 3
Explanation: Binary of 13 is 1101, which has 3 set bits.
\`\`\`

### Constraints
- \`1 <= n <= 10^9\``,
    inputFormat: 'Integer n.',
    outputFormat: 'Count of set bits.',
    constraints: '1 <= n <= 10^9',
  },

  'count-total-set-bits-in-all-numbers-from-1-to-n': {
    title: 'Count Total Set Bits from 1 to N',
    statement: `Given a positive integer \`n\`, compute the **total number of set bits** in the binary representations of all numbers from \`1\` to \`n\` inclusive.

### Examples

**Example 1:**
\`\`\`text
Input: n = 4
Output: 5
Explanation:
1 -> 1
2 -> 10
3 -> 11
4 -> 100
Total set bits: 1 + 1 + 2 + 1 = 5.
\`\`\`

### Constraints
- \`1 <= n <= 10^8\``,
    inputFormat: 'Integer n.',
    outputFormat: 'Sum of set bits from 1 to n.',
    constraints: '1 <= n <= 10^8',
  },

  'create-a-matrix-with-alternating-rectangles-of-o-and-x': {
    title: 'Matrix with Alternating Rectangles of O and X',
    statement: `Given matrix dimensions \`m\` (rows) and \`n\` (columns), create and return a 2D grid containing concentric alternating rectangular rings of \`'X'\` and \`'O'\`, starting with \`'X'\` on the outermost perimeter.

### Examples

**Example 1:**
\`\`\`text
Input: m = 3, n = 3
Output:
[
  ['X', 'X', 'X'],
  ['X', 'O', 'X'],
  ['X', 'X', 'X']
]
\`\`\`

### Constraints
- \`1 <= m, n <= 100\``,
    inputFormat: 'Dimensions m and n.',
    outputFormat: '2D character grid.',
    constraints: '1 <= m, n <= 100',
  },

  'create-a-mirror-tree-from-the-given-binary-tree': {
    title: 'Mirror of a Binary Tree',
    statement: `Given the root of a binary tree, invert the tree in-place so that the left and right children of every node are swapped.

Return the root of the mirrored binary tree.

### Examples

**Example 1:**
\`\`\`text
Input: root = [4, 2, 7, 1, 3, 6, 9]
Output: [4, 7, 2, 9, 6, 3, 1]
\`\`\`

### Constraints
- Number of nodes in range \`[0, 1000]\`.
- \`-1000 <= Node.val <= 1000\``,
    inputFormat: 'Root of binary tree.',
    outputFormat: 'Root of mirrored tree.',
    constraints: '0 <= nodes <= 1000',
  },

  'crossword-puzzle': {
    title: 'Crossword Puzzle',
    statement: `Given a 10x10 crossword grid where empty cells are marked with \`-\` and blocked cells are marked with \`+\`, and a semicolon-separated list of words, place all words into the grid such that:
1. Each word fits horizontally or vertically into consecutive empty cells.
2. Intersecting words match at overlapping cells.

Return the solved 10x10 crossword grid.

### Constraints
- Grid size is 10 x 10.
- All words can be placed legally.`,
    inputFormat: '10x10 grid string and words list.',
    outputFormat: 'Completed 10x10 grid.',
    constraints: 'Grid size: 10x10',
  },

  'cuckoo-hashing': {
    title: 'Cuckoo Hashing',
    statement: `Implement **Cuckoo Hashing**, an open-addressing scheme with two hash functions that guarantees worst-case \`O(1)\` lookup time.

When inserting a key, if its primary slot is occupied, the resident key is evicted and re-hashed into its alternative slot using the second hash function, propagating if necessary.

### Constraints
- Keys are unique integers.`,
    inputFormat: 'Sequence of operations and keys.',
    outputFormat: 'State of hash tables.',
    constraints: '1 <= n <= 1000',
  },

  'delete-nodes-which-have-a-greater-value-on-right-side': {
    title: 'Delete Nodes with Greater Value on Right',
    statement: `Given a singly linked list, delete every node that has a node with a **strictly greater value** anywhere to its right in the list.

Return the head of the modified linked list.

### Examples

**Example 1:**
\`\`\`text
Input: head = [12, 15, 10, 11, 5, 6, 2, 3]
Output: [15, 11, 6, 3]
Explanation:
- 12 is deleted because 15 is to its right.
- 10 is deleted because 11 is to its right.
- 5 is deleted because 6 is to its right.
- 2 is deleted because 3 is to its right.
\`\`\`

### Constraints
- \`1 <= nodes <= 10^5\`
- \`1 <= Node.val <= 10^5\``,
    inputFormat: 'Head of linked list.',
    outputFormat: 'Head of modified linked list.',
    constraints: '1 <= nodes <= 10^5',
  },

  'delete-without-head-node': {
    title: 'Delete Node Without Head Pointer',
    statement: `You are given a pointer to the node \`del_node\` that is to be deleted from a singly linked list. You are **not** given access to the \`head\` of the list.

Delete the given node in-place such that its value does not exist in the list anymore and the rest of the list structure is preserved.

It is guaranteed that the node to be deleted is **not the last node** in the linked list.

### Examples

**Example 1:**
\`\`\`text
Input: head = [4, 5, 1, 9], del_node = node with value 5
Output: [4, 1, 9]
Explanation: After deleting node 5, the list becomes 4 -> 1 -> 9.
\`\`\`

### Constraints
- Number of nodes in range \`[2, 1000]\`.
- \`-1000 <= Node.val <= 1000\``,
    inputFormat: 'Pointer to target node.',
    outputFormat: 'Void (node is deleted in-place).',
    constraints: '2 <= nodes <= 1000',
  },

  'design-and-implement-special-stack': {
    title: 'Design Special Stack with GetMin in O(1)',
    statement: `Design a stack data structure that supports standard operations (\`push\`, \`pop\`, \`peek\`, \`isEmpty\`) along with an additional operation:
- \`int getMin()\`: Retrieves the minimum element in the stack.

All operations must run in **O(1) time complexity** and use **O(1) extra space**.

### Examples

**Example 1:**
\`\`\`text
Operations: push(18), push(19), push(29), push(15), push(16), getMin(), pop(), getMin()
Output:
getMin() returns 15.
pop() removes 16.
getMin() returns 15.
\`\`\`

### Constraints
- Up to \`10^5\` operations.
- \`-10^9 <= val <= 10^9\``,
    inputFormat: 'Sequence of stack commands.',
    outputFormat: 'Results of getMin and pop operations.',
    constraints: 'All operations O(1) time.',
  },

  'design-stack-with-middle-operation': {
    title: 'Design Stack with Middle Operations',
    statement: `Design a stack data structure that supports the following operations in **O(1) time complexity**:
1. \`push(x)\`: Adds element \`x\` to top of stack.
2. \`pop()\`: Removes and returns top element.
3. \`findMiddle()\`: Returns middle element of stack.
4. \`deleteMiddle()\`: Deletes middle element of stack.

If stack has \`n\` elements, middle is at position \`ceil(n / 2)\`.

### Constraints
- Doubly Linked List based implementation to achieve O(1) pointer updates.`,
    inputFormat: 'Stack commands.',
    outputFormat: 'Values from pop, findMiddle, and deleteMiddle.',
    constraints: 'O(1) time for all operations.',
  },
};
