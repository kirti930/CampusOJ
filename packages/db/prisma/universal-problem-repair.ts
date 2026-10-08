import { PrismaClient } from "@prisma/client";
import {
  generateStarterCode,
  generateDriverCode,
  FunctionSignature,
  ClassMethod,
  FunctionParameter,
} from "@campusoj/shared";

// Patch DATABASE_URL for Neon connection stability
if (!process.env.DATABASE_URL?.includes("pool_timeout")) {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL + "?connect_timeout=30&pool_timeout=30";
}

const prisma = new PrismaClient();

// ─── 1. Canonical Verified Signatures & Classes ──────────────────────────────

const VERIFIED_CLASSES: Record<
  string,
  {
    functionSignature: FunctionSignature;
    starterCode: Record<string, string>;
    driverCode: Record<string, string>;
  }
> = {
  "range-sum-query-mutable": {
    functionSignature: {
      isClass: true,
      className: "NumArray",
      constructorParams: [{ name: "nums", type: "int[]" }],
      methods: [
        {
          name: "update",
          returnType: "void",
          parameters: [
            { name: "index", type: "int" },
            { name: "val", type: "int" },
          ],
        },
        {
          name: "sumRange",
          returnType: "int",
          parameters: [
            { name: "left", type: "int" },
            { name: "right", type: "int" },
          ],
        },
      ],
    },
    starterCode: {
      cpp: `class NumArray {\npublic:\n    NumArray(vector<int>& nums) {\n        \n    }\n    \n    void update(int index, int val) {\n        \n    }\n    \n    int sumRange(int left, int right) {\n        return 0;\n    }\n};`,
      java: `class NumArray {\n    public NumArray(int[] nums) {\n        \n    }\n    \n    public void update(int index, int val) {\n        \n    }\n    \n    public int sumRange(int left, int right) {\n        return 0;\n    }\n}`,
      python: `class NumArray:\n    def __init__(self, nums: List[int]):\n        pass\n\n    def update(self, index: int, val: int) -> None:\n        pass\n\n    def sumRange(self, left: int, right: int) -> int:\n        return 0`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
  "range-sum-query-immutable": {
    functionSignature: {
      isClass: true,
      className: "NumArray",
      constructorParams: [{ name: "nums", type: "int[]" }],
      methods: [
        {
          name: "sumRange",
          returnType: "int",
          parameters: [
            { name: "left", type: "int" },
            { name: "right", type: "int" },
          ],
        },
      ],
    },
    starterCode: {
      cpp: `class NumArray {\npublic:\n    NumArray(vector<int>& nums) {\n        \n    }\n    \n    int sumRange(int left, int right) {\n        return 0;\n    }\n};`,
      java: `class NumArray {\n    public NumArray(int[] nums) {\n        \n    }\n    \n    public int sumRange(int left, int right) {\n        return 0;\n    }\n}`,
      python: `class NumArray:\n    def __init__(self, nums: List[int]):\n        pass\n\n    def sumRange(self, left: int, right: int) -> int:\n        return 0`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
  "lru-cache-implementation": {
    functionSignature: {
      isClass: true,
      className: "LRUCache",
      constructorParams: [{ name: "capacity", type: "int" }],
      methods: [
        {
          name: "get",
          returnType: "int",
          parameters: [{ name: "key", type: "int" }],
        },
        {
          name: "put",
          returnType: "void",
          parameters: [
            { name: "key", type: "int" },
            { name: "value", type: "int" },
          ],
        },
      ],
    },
    starterCode: {
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        \n    }\n    \n    int get(int key) {\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        \n    }\n};`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
  "implement-queue-using-stacks": {
    functionSignature: {
      isClass: true,
      className: "MyQueue",
      constructorParams: [],
      methods: [
        {
          name: "push",
          returnType: "void",
          parameters: [{ name: "x", type: "int" }],
        },
        { name: "pop", returnType: "int", parameters: [] },
        { name: "peek", returnType: "int", parameters: [] },
        { name: "empty", returnType: "boolean", parameters: [] },
      ],
    },
    starterCode: {
      cpp: `class MyQueue {\npublic:\n    MyQueue() {\n        \n    }\n    \n    void push(int x) {\n        \n    }\n    \n    int pop() {\n        return 0;\n    }\n    \n    int peek() {\n        return 0;\n    }\n    \n    bool empty() {\n        return true;\n    }\n};`,
      java: `class MyQueue {\n    public MyQueue() {\n        \n    }\n    \n    public void push(int x) {\n        \n    }\n    \n    public int pop() {\n        return 0;\n    }\n    \n    public int peek() {\n        return 0;\n    }\n    \n    public boolean empty() {\n        return true;\n    }\n}`,
      python: `class MyQueue:\n    def __init__(self):\n        pass\n\n    def push(self, x: int) -> None:\n        pass\n\n    def pop(self) -> int:\n        return 0\n\n    def peek(self) -> int:\n        return 0\n\n    def empty(self) -> bool:\n        return True`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
  "implement-stack-using-queues": {
    functionSignature: {
      isClass: true,
      className: "MyStack",
      constructorParams: [],
      methods: [
        {
          name: "push",
          returnType: "void",
          parameters: [{ name: "x", type: "int" }],
        },
        { name: "pop", returnType: "int", parameters: [] },
        { name: "top", returnType: "int", parameters: [] },
        { name: "empty", returnType: "boolean", parameters: [] },
      ],
    },
    starterCode: {
      cpp: `class MyStack {\npublic:\n    MyStack() {\n        \n    }\n    \n    void push(int x) {\n        \n    }\n    \n    int pop() {\n        return 0;\n    }\n    \n    int top() {\n        return 0;\n    }\n    \n    bool empty() {\n        return true;\n    }\n};`,
      java: `class MyStack {\n    public MyStack() {\n        \n    }\n    \n    public void push(int x) {\n        \n    }\n    \n    public int pop() {\n        return 0;\n    }\n    \n    public int top() {\n        return 0;\n    }\n    \n    public boolean empty() {\n        return true;\n    }\n}`,
      python: `class MyStack:\n    def __init__(self):\n        pass\n\n    def push(self, x: int) -> None:\n        pass\n\n    def pop(self) -> int:\n        return 0\n\n    def top(self) -> int:\n        return 0\n\n    def empty(self) -> bool:\n        return True`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
  "construct-a-trie-from-scratch": {
    functionSignature: {
      isClass: true,
      className: "Trie",
      constructorParams: [],
      methods: [
        {
          name: "insert",
          returnType: "void",
          parameters: [{ name: "word", type: "string" }],
        },
        {
          name: "search",
          returnType: "boolean",
          parameters: [{ name: "word", type: "string" }],
        },
        {
          name: "startsWith",
          returnType: "boolean",
          parameters: [{ name: "prefix", type: "string" }],
        },
      ],
    },
    starterCode: {
      cpp: `class Trie {\npublic:\n    Trie() {\n        \n    }\n    \n    void insert(string word) {\n        \n    }\n    \n    bool search(string word) {\n        return false;\n    }\n    \n    bool startsWith(string prefix) {\n        return false;\n    }\n};`,
      java: `class Trie {\n    public Trie() {\n        \n    }\n    \n    public void insert(String word) {\n        \n    }\n    \n    public boolean search(String word) {\n        return false;\n    }\n    \n    public boolean startsWith(String prefix) {\n        return false;\n    }\n}`,
      python: `class Trie:\n    def __init__(self):\n        pass\n\n    def insert(self, word: str) -> None:\n        pass\n\n    def search(self, word: str) -> bool:\n        return False\n\n    def startsWith(self, prefix: str) -> bool:\n        return False`,
    },
    driverCode: {
      cpp: `int main() { return 0; }`,
      java: `public class Main { public static void main(String[] args) {} }`,
      python: `if __name__ == '__main__': pass`,
    },
  },
};

const VERIFIED_SIGNATURES: Record<string, FunctionSignature> = {
  subsets: {
    functionName: "subsets",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "subsets-ii": {
    functionName: "subsetsWithDup",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "count-of-smaller-numbers-after-self": {
    functionName: "countSmaller",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<Integer>",
  },
  permutations: {
    functionName: "permute",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "List<List<Integer>>",
  },
  "combination-sum": {
    functionName: "combinationSum",
    parameters: [
      { name: "candidates", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "List<List<Integer>>",
  },
  "divide-two-integers": {
    functionName: "divide",
    parameters: [
      { name: "dividend", type: "int" },
      { name: "divisor", type: "int" },
    ],
    returnType: "int",
  },
  "two-sum": {
    functionName: "twoSum",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "int[]",
  },
  "lowest-common-ancestor-of-a-binary-search-tree": {
    functionName: "lowestCommonAncestor",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "p", type: "TreeNode" },
      { name: "q", type: "TreeNode" },
    ],
    returnType: "TreeNode",
  },
  "lowest-common-ancestor-in-a-binary-tree": {
    functionName: "lowestCommonAncestor",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "p", type: "TreeNode" },
      { name: "q", type: "TreeNode" },
    ],
    returnType: "TreeNode",
  },
  "binary-tree-maximum-path-sum": {
    functionName: "maxPathSum",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "int",
  },
  "maximum-path-sum": {
    functionName: "maxPathSum",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "int",
  },
  "invert-binary-tree": {
    functionName: "invertTree",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "TreeNode",
  },
  "validate-binary-search-tree": {
    functionName: "isValidBST",
    parameters: [{ name: "root", type: "TreeNode" }],
    returnType: "boolean",
  },
  "delete-node-in-a-bst": {
    functionName: "deleteNode",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "key", type: "int" },
    ],
    returnType: "TreeNode",
  },
  "kth-smallest-element-in-a-bst": {
    functionName: "kthSmallest",
    parameters: [
      { name: "root", type: "TreeNode" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  "find-maximum-height-pyramid-from-the-given-array-of-objects": {
    functionName: "maxPyramidHeight",
    parameters: [{ name: "nums", type: "int[]" }],
    returnType: "int",
  },
};

// ─── 2. Markdown & Test Case Sanitization ────────────────────────────────────

function sanitizeMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  let clean = text;

  // Replace escaped brackets
  clean = clean.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");

  // Fix exponents
  clean = clean.replace(/\b10([4569])\b/g, (_m, p1) => `10^${p1}`);
  clean = clean.replace(/10\^5\^5/g, "10^5");
  clean = clean.replace(/10\^4\^4/g, "10^4");
  clean = clean.replace(/10\^6\^6/g, "10^6");
  clean = clean.replace(/10\^9\^9/g, "10^9");

  // Fix 231 - 1 and -231
  clean = clean.replace(/(?<!\^)-?231\s*-\s*1/g, "2^31 - 1");
  clean = clean.replace(/(?<!\^)-231\b/g, "-2^31");
  clean = clean.replace(/(?<!\^)231\b/g, "2^31");

  // Normalize linebreaks and strip double escaped quotes
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");
  clean = clean.replace(/\\"/g, '"');

  return clean.trim();
}

function sanitizeTestCaseInput(input: string | null | undefined): string {
  if (!input) return "";
  let clean = input.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");
  return clean.trim();
}

function sanitizeTestCaseOutput(output: string | null | undefined): string {
  if (!output) return "";
  let clean = output;

  // Cut off leaked markdown sections like Constraints or Explanation
  clean = clean.split(
    /\*\*Constraints:|\*\*Explanation:|\*\*Follow up:|Constraints:|Explanation:|Follow up:/i
  )[0];

  // Strip bold markers and asterisks
  clean = clean.replace(/\*\*/g, "");

  // Strip escaped brackets
  clean = clean.replace(/\\+\[/g, "[").replace(/\\+\]/g, "]");

  // Normalize linebreaks and trim
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "");

  return clean.trim();
}

// ─── 3. Automated Signature & Parameter Alignment Engine ──────────────────────

function inferReturnType(
  slug: string,
  title: string,
  statement: string,
  expectedOutput: string | null | undefined
): string {
  if (!expectedOutput) return "int";
  const out = expectedOutput.trim();

  // 1. 2D List / Array
  if (out.startsWith("[[") || out.startsWith("[ [")) {
    return "List<List<Integer>>";
  }

  // 2. 1D List / Array
  if (out.startsWith("[") && out.endsWith("]")) {
    if (out.includes('"') || out.includes("'")) return "string[]";
    return "int[]";
  }

  // If space-separated numbers e.g. "20 10 30 40"
  if (/^-?\d+(\s+-?\d+)+$/.test(out)) {
    return "int[]";
  }

  // 3. Boolean
  if (out.toLowerCase() === "true" || out.toLowerCase() === "false") {
    return "boolean";
  }

  // 4. Scalar Integer
  if (/^-?\d+$/.test(out)) {
    // Check if constraints or problem description implies long
    if (
      statement.includes("modulo 10^9") ||
      statement.includes("10^9 + 7") ||
      statement.includes("109 + 7") ||
      statement.includes("2^63")
    ) {
      return "long";
    }
    return "int";
  }

  // 5. String
  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith("'") && out.endsWith("'")) ||
    (/^[a-zA-Z0-9_-]+$/.test(out) && !/^-?\d+$/.test(out))
  ) {
    return "string";
  }

  // 6. Tree output
  const isTree = /tree|bst/i.test(slug) || /tree|bst/i.test(title);
  if (isTree && out.startsWith("[") && out.includes("null")) {
    return "TreeNode";
  }

  return "int";
}

function inferParameters(
  slug: string,
  title: string,
  statement: string,
  input: string | null | undefined,
  existingParams?: FunctionParameter[]
): FunctionParameter[] {
  if (!input) {
    if (existingParams && existingParams.length > 0) return existingParams;
    return [{ name: "nums", type: "int[]" }];
  }

  const clean = input.trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  const isTree =
    (/tree|bst/i.test(slug) ||
      /tree|bst/i.test(title) ||
      statement.toLowerCase().includes("treenode")) &&
    !slug.includes("trie");

  const isLinkedList =
    /linked-list|list-node/i.test(slug) ||
    /linked list/i.test(title) ||
    statement.toLowerCase().includes("listnode");

  // ── Tree problems ─────────────────────────────────────────────────────────
  if (isTree) {
    if (lines.length >= 2 && lines[0].startsWith("[")) {
      if (/^-?\d+$/.test(lines[1])) {
        return [
          { name: "root", type: "TreeNode" },
          { name: "val", type: "int" },
        ];
      }
    }
    return [{ name: "root", type: "TreeNode" }];
  }

  // ── Linked list problems ──────────────────────────────────────────────────
  if (isLinkedList) {
    if (lines.length >= 2 && lines[0].startsWith("[") && lines[1].startsWith("[")) {
      return [
        { name: "list1", type: "ListNode" },
        { name: "list2", type: "ListNode" },
      ];
    }
    return [{ name: "head", type: "ListNode" }];
  }

  // ── Matrix / 2D Array ─────────────────────────────────────────────────────
  if (clean.startsWith("[[") || (lines.length > 0 && lines[0].startsWith("[["))) {
    return [{ name: "matrix", type: "int[][]" }];
  }

  // ── Array + Integer (e.g. nums + target in Two Sum) ───────────────────────
  if (
    lines.length >= 2 &&
    lines[0].startsWith("[") &&
    lines[0].endsWith("]") &&
    /^-?\d+$/.test(lines[1])
  ) {
    return [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ];
  }

  // ── Single Array in JSON ──────────────────────────────────────────────────
  if (lines.length === 1 && lines[0].startsWith("[") && lines[0].endsWith("]")) {
    if (lines[0].includes('"') || lines[0].includes("'")) {
      return [{ name: "strs", type: "string[]" }];
    }
    return [{ name: "nums", type: "int[]" }];
  }

  // ── Two Strings (e.g. Longest Common Subsequence) ─────────────────────────
  if (
    lines.length === 2 &&
    !/^\d+$/.test(lines[0]) &&
    !/^\d+$/.test(lines[1]) &&
    !lines[0].startsWith("[")
  ) {
    return [
      { name: "text1", type: "string" },
      { name: "text2", type: "string" },
    ];
  }

  // ── Single String ─────────────────────────────────────────────────────────
  if (
    lines.length === 1 &&
    ((clean.startsWith('"') && clean.endsWith('"')) ||
      (/^[a-zA-Z]+$/.test(clean) && clean.length > 1 && !/^\d+$/.test(clean)))
  ) {
    return [{ name: "s", type: "string" }];
  }

  // ── Length N + Array elements (e.g. 4 \n 3 2 6 5) ─────────────────────────
  if (
    lines.length >= 2 &&
    /^\d+$/.test(lines[0]) &&
    lines[1].split(/\s+/).length > 1
  ) {
    if (lines.length >= 3 && /^\d+$/.test(lines[2])) {
      return [
        { name: "n", type: "int" },
        { name: "arr", type: "int[]" },
        { name: "k", type: "int" },
      ];
    }
    return [
      { name: "n", type: "int" },
      { name: "arr", type: "int[]" },
    ];
  }

  // ── Two Integers (e.g. 10 3 in Divide Two Integers, or n, r in nCr) ────────
  const allTokens = clean.split(/\s+/);
  if (allTokens.length === 2 && allTokens.every((t) => /^-?\d+$/.test(t))) {
    return [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
    ];
  }

  // ── Single Integer (e.g. 5 or 12) ─────────────────────────────────────────
  if (allTokens.length === 1 && /^-?\d+$/.test(allTokens[0])) {
    return [{ name: "n", type: "int" }];
  }

  // ── Fallback: preserve existing parameters if valid, or default nums ──────
  if (existingParams && existingParams.length > 0) {
    return existingParams.map((p, idx) => {
      let name = p.name || `param${idx + 1}`;
      let type = p.type || "int";
      if (name === "arg0" || name === "arg1") name = idx === 0 ? "nums" : "k";
      if (type === "Object" || type === "object") type = "int[]";
      return { name, type };
    });
  }

  return [{ name: "nums", type: "int[]" }];
}

// ─── 4. Problem Reconciliation ────────────────────────────────────────────────

async function reconcileProblem(problem: any) {
  let changed = false;
  const slug = problem.slug;

  // 1. Text & Markdown Cleanup
  const cleanStatement = sanitizeMarkdown(problem.statement);
  const cleanInputFormat = sanitizeMarkdown(problem.inputFormat);
  const cleanOutputFormat = sanitizeMarkdown(problem.outputFormat);
  const cleanConstraints = sanitizeMarkdown(problem.constraints);

  if (
    cleanStatement !== problem.statement ||
    cleanInputFormat !== problem.inputFormat ||
    cleanOutputFormat !== problem.outputFormat ||
    cleanConstraints !== problem.constraints
  ) {
    changed = true;
  }

  // 2. Sample Test Case Extraction
  const sampleTc = await prisma.testCase.findFirst({
    where: { problemId: problem.id, isSample: true },
    orderBy: { createdAt: "asc" },
  });

  const sampleInput = sampleTc?.input ?? "";
  const sampleOutput = sampleTc?.expectedOutput ?? "";

  // 3. Signature & Template Alignment
  let functionSignature: FunctionSignature = problem.functionSignature || {};
  let starterCode = problem.starterCode;
  let driverCode = problem.driverCode;

  if (VERIFIED_CLASSES[slug]) {
    const verified = VERIFIED_CLASSES[slug];
    functionSignature = verified.functionSignature;
    starterCode = verified.starterCode;
    driverCode = verified.driverCode;
    changed = true;
  } else if (VERIFIED_SIGNATURES[slug]) {
    functionSignature = VERIFIED_SIGNATURES[slug];
    starterCode = {
      cpp: generateStarterCode(functionSignature, "cpp"),
      java: generateStarterCode(functionSignature, "java"),
      python: generateStarterCode(functionSignature, "python"),
    };
    driverCode = {
      cpp: generateDriverCode(functionSignature, "cpp"),
      java: generateDriverCode(functionSignature, "java"),
      python: generateDriverCode(functionSignature, "python"),
    };
    changed = true;
  } else {
    // Generate/Align Function Name
    let funcName = functionSignature.functionName;
    if (!funcName || funcName === "solution" || funcName === "solve") {
      const camel = slug
        .replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, "");
      funcName = camel || "solve";
    }

    // Align Parameters
    const alignedParams = inferParameters(
      slug,
      problem.title,
      cleanStatement,
      sampleInput,
      functionSignature.parameters
    );

    // Align Return Type
    const alignedReturn = inferReturnType(
      slug,
      problem.title,
      cleanStatement,
      sampleOutput
    );

    // Check if signature changed
    const currentSigStr = JSON.stringify(functionSignature);
    functionSignature = {
      functionName: funcName,
      parameters: alignedParams,
      returnType: alignedReturn,
    };

    if (currentSigStr !== JSON.stringify(functionSignature)) {
      changed = true;
    }

    // Check if starterCode needs regeneration
    const starterStr = JSON.stringify(starterCode || "");
    const needsStarterRegen =
      changed ||
      typeof starterCode !== "object" ||
      !starterCode ||
      !starterCode.cpp ||
      !starterCode.java ||
      !starterCode.python ||
      starterStr.includes("Object") ||
      starterStr.includes("arg0") ||
      starterStr.includes("arg1") ||
      starterStr.includes("// Write your solution for");

    if (needsStarterRegen) {
      starterCode = {
        cpp: generateStarterCode(functionSignature, "cpp"),
        java: generateStarterCode(functionSignature, "java"),
        python: generateStarterCode(functionSignature, "python"),
      };
      driverCode = {
        cpp: generateDriverCode(functionSignature, "cpp"),
        java: generateDriverCode(functionSignature, "java"),
        python: generateDriverCode(functionSignature, "python"),
      };
      changed = true;
    }
  }

  // 4. Update Problem in Database
  if (changed) {
    await prisma.problem.update({
      where: { id: problem.id },
      data: {
        statement: cleanStatement,
        inputFormat: cleanInputFormat,
        outputFormat: cleanOutputFormat,
        constraints: cleanConstraints,
        functionSignature: functionSignature as any,
        starterCode: starterCode as any,
        driverCode: driverCode as any,
      },
    });
  }

  // 5. Sanitize ALL Test Cases for Problem
  const tcs = await prisma.testCase.findMany({
    where: { problemId: problem.id },
  });

  for (const tc of tcs) {
    const cleanIn = sanitizeTestCaseInput(tc.input);
    const cleanOut = sanitizeTestCaseOutput(tc.expectedOutput);

    if (cleanIn !== tc.input || cleanOut !== tc.expectedOutput) {
      await prisma.testCase.update({
        where: { id: tc.id },
        data: {
          input: cleanIn,
          expectedOutput: cleanOut,
        },
      });
    }
  }

  return changed;
}

// ─── 5. Main Execution Engine ────────────────────────────────────────────────

async function main() {
  console.log("=================================================");
  console.log("UNIVERSAL PROBLEM BANK REPAIR & RECONCILIATION");
  console.log("=================================================");

  const allProblems = await prisma.problem.findMany();
  console.log(`Found ${allProblems.length} problems in Neon PostgreSQL database.\n`);

  let updatedCount = 0;
  const BATCH_SIZE = 20;

  for (let i = 0; i < allProblems.length; i += BATCH_SIZE) {
    const chunk = allProblems.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map((p) => reconcileProblem(p)));
    const chunkUpdated = results.filter(Boolean).length;
    updatedCount += chunkUpdated;

    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        allProblems.length / BATCH_SIZE
      )}: ${chunkUpdated} problems updated.`
    );
  }

  console.log(`\nReconciliation completed. Total problems updated: ${updatedCount}\n`);

  // ─── 6. Verification Queries ───────────────────────────────────────────────
  console.log("=== RUNNING POST-REPAIR VERIFICATION CHECKS ===");

  const problemsAfter = await prisma.problem.findMany({
    select: { slug: true, starterCode: true, statement: true, functionSignature: true },
  });

  let objectCount = 0;
  let arg0Count = 0;
  let escapedBracketCount = 0;

  for (const p of problemsAfter) {
    const s = JSON.stringify(p.starterCode || {});
    if (s.includes("Object")) {
      objectCount++;
      console.log(`[VIOLATION] 'Object' detected in starter code: ${p.slug}`);
    }
    if (s.includes("arg0")) {
      arg0Count++;
      console.log(`[VIOLATION] 'arg0' detected in starter code: ${p.slug}`);
    }
    if (p.statement.includes("\\[") || p.statement.includes("\\]")) {
      escapedBracketCount++;
      console.log(`[VIOLATION] Escaped brackets in statement: ${p.slug}`);
    }
  }

  const tcsAfter = await prisma.testCase.findMany({
    select: { id: true, expectedOutput: true, input: true },
  });

  let asteriskCount = 0;
  let tcBracketCount = 0;
  for (const tc of tcsAfter) {
    if (tc.expectedOutput.includes("**")) asteriskCount++;
    if (tc.expectedOutput.includes("\\[") || tc.input.includes("\\[")) {
      tcBracketCount++;
    }
  }

  console.log("-------------------------------------------------");
  console.log(`COUNT(*) problems with 'Object' in starter code: ${objectCount}`);
  console.log(`COUNT(*) problems with 'arg0' in starter code:   ${arg0Count}`);
  console.log(`COUNT(*) problems with '\\[ ' in statement:       ${escapedBracketCount}`);
  console.log(`COUNT(*) test cases with '**' in expected output: ${asteriskCount}`);
  console.log(`COUNT(*) test cases with '\\[ ' in input/output:  ${tcBracketCount}`);
  console.log("-------------------------------------------------");

  if (
    objectCount === 0 &&
    arg0Count === 0 &&
    escapedBracketCount === 0 &&
    asteriskCount === 0 &&
    tcBracketCount === 0
  ) {
    console.log("SUCCESS: 0 errors detected across the entire problem bank!");
  } else {
    console.warn("WARNING: Some errors were detected, please review the log above.");
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("FATAL ERROR in universal repair script:", err);
  await prisma.$disconnect();
  process.exit(1);
});
