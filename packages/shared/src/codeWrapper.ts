// ─────────────────────────────────────────────────────────────────────────────
// Universal Code Wrapper & Starter Generator
// LeetCode-style Function-Only Execution Engine for CampusOJ
// ─────────────────────────────────────────────────────────────────────────────

export type DataType =
  | "int"
  | "string"
  | "boolean"
  | "number[]"
  | "int[]"
  | "number[][]"
  | "int[][]"
  | "List<Integer>"
  | "List<List<Integer>>"
  | "string[]"
  | "string[][]"
  | "TreeNode"
  | "ListNode"
  | "void"
  | (string & {});

export interface FunctionParameter {
  name: string;
  type: DataType;
}

export interface ClassMethod {
  name: string;
  returnType: DataType;
  parameters: FunctionParameter[];
}

export interface FunctionSignature {
  functionName?: string;
  returnType?: DataType;
  parameters?: FunctionParameter[];
  isClass?: boolean;
  className?: string;
  constructorParams?: FunctionParameter[];
  methods?: ClassMethod[];
}


export type StarterCodeMap = Record<string, string>;
export type DriverCodeMap = Record<string, string>;

export interface ProblemCodeMeta {
  title?: string;
  functionSignature?: FunctionSignature | null;
  starterCode?: StarterCodeMap | null;
  driverCode?: DriverCodeMap | null;
}

// ─── Type Maps ───────────────────────────────────────────────────────────────

export function getCppType(type: DataType | string): string {
  switch (type) {
    case "int":
      return "int";
    case "long":
      return "long long";
    case "double":
    case "float":
      return "double";
    case "string":
      return "string";
    case "boolean":
      return "bool";
    case "number[]":
    case "int[]":
      return "vector<int>";
    case "number[][]":
    case "int[][]":
    case "List<List<Integer>>":
      return "vector<vector<int>>";
    case "List<Integer>":
      return "vector<int>";
    case "string[]":
      return "vector<string>";
    case "string[][]":
      return "vector<vector<string>>";
    case "TreeNode":
      return "TreeNode*";
    case "ListNode":
      return "ListNode*";
    case "void":
      return "void";
    default:
      return type || "auto";
  }
}

export function getJavaType(type: DataType | string): string {
  switch (type) {
    case "int":
      return "int";
    case "long":
      return "long";
    case "double":
    case "float":
      return "double";
    case "string":
      return "String";
    case "boolean":
      return "boolean";
    case "number[]":
    case "int[]":
      return "int[]";
    case "number[][]":
    case "int[][]":
      return "int[][]";
    case "List<Integer>":
      return "List<Integer>";
    case "List<List<Integer>>":
      return "List<List<Integer>>";
    case "string[]":
      return "String[]";
    case "string[][]":
      return "String[][]";
    case "TreeNode":
      return "TreeNode";
    case "ListNode":
      return "ListNode";
    case "void":
      return "void";
    default:
      return type || "int";
  }
}

export function getPythonType(type: DataType | string): string {
  switch (type) {
    case "int":
    case "long":
      return "int";
    case "double":
    case "float":
      return "float";
    case "string":
      return "str";
    case "boolean":
      return "bool";
    case "number[]":
    case "int[]":
      return "List[int]";
    case "number[][]":
    case "int[][]":
    case "List<List<Integer>>":
      return "List<List<int>>";
    case "List<Integer>":
      return "List[int]";
    case "string[]":
      return "List[str]";
    case "string[][]":
      return "List[List[str]]";
    case "TreeNode":
      return "Optional[TreeNode]";
    case "ListNode":
      return "Optional[ListNode]";
    case "void":
      return "None";
    default:
      return type || "Any";
  }
}

// ─── Starter Code Generator ──────────────────────────────────────────────────

export function generateStarterCode(
  sig: FunctionSignature,
  language: string
): string {
  const lang = (language || "").toLowerCase();

  if (sig.isClass && sig.className) {
    const className = sig.className;
    const ctorParams = sig.constructorParams || [];
    const methods = sig.methods || [];

    if (lang === "cpp" || lang === "c++") {
      const ctorParamsStr = ctorParams
        .map((p) => {
          const t = getCppType(p.type);
          const ref = p.type.endsWith("[]") ? "&" : "";
          return `${t}${ref ? " " + ref : " "}${p.name}`;
        })
        .join(", ");

      const methodsStr = methods
        .map((m) => {
          const mParams = m.parameters
            .map((p) => {
              const t = getCppType(p.type);
              const ref = p.type.endsWith("[]") ? "&" : "";
              return `${t}${ref ? " " + ref : " "}${p.name}`;
            })
            .join(", ");
          return `    ${getCppType(m.returnType)} ${m.name}(${mParams}) {\n        // Write your solution here\n        \n    }`;
        })
        .join("\n\n");

      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class ${className} {
public:
    ${className}(${ctorParamsStr}) {
        // Initialize your data structure here
        
    }
    
${methodsStr}
};
`;
    }

    if (lang === "java") {
      const ctorParamsStr = ctorParams
        .map((p) => `${getJavaType(p.type)} ${p.name}`)
        .join(", ");

      const methodsStr = methods
        .map((m) => {
          const mParams = m.parameters
            .map((p) => `${getJavaType(p.type)} ${p.name}`)
            .join(", ");
          return `    public ${getJavaType(m.returnType)} ${m.name}(${mParams}) {\n        // Write your solution here\n        \n    }`;
        })
        .join("\n\n");

      return `import java.util.*;

class ${className} {
    public ${className}(${ctorParamsStr}) {
        // Initialize your data structure here
        
    }

${methodsStr}
}
`;
    }

    if (lang === "python3" || lang === "python") {
      const ctorParamsStr = [
        "self",
        ...ctorParams.map((p) => `${p.name}: ${getPythonType(p.type)}`),
      ].join(", ");

      const methodsStr = methods
        .map((m) => {
          const mParams = [
            "self",
            ...m.parameters.map((p) => `${p.name}: ${getPythonType(p.type)}`),
          ].join(", ");
          return `    def ${m.name}(${mParams}) -> ${getPythonType(m.returnType)}:\n        # Write your solution here\n        pass`;
        })
        .join("\n\n");

      return `from typing import List, Optional

class ${className}:
    def __init__(${ctorParamsStr}):
        # Initialize your data structure here
        pass

${methodsStr}
`;
    }

    if (lang === "javascript" || lang === "js") {
      const ctorParamsStr = ctorParams.map((p) => p.name).join(", ");
      const methodsStr = methods
        .map((m) => {
          const mParams = m.parameters.map((p) => p.name).join(", ");
          return `    ${m.name}(${mParams}) {\n        // Write your solution here\n        \n    }`;
        })
        .join("\n\n");

      return `class ${className} {
    constructor(${ctorParamsStr}) {
        // Initialize your data structure here
        
    }

${methodsStr}
}
`;
    }

    return `// Write your solution for class ${className}\n`;
  }

  const funcName = sig.functionName || "solution";
  const paramsList = sig.parameters || [];
  const retType = sig.returnType || "void";

  const usesTree =
    retType === "TreeNode" || paramsList.some((p) => p.type === "TreeNode");
  const usesList =
    retType === "ListNode" || paramsList.some((p) => p.type === "ListNode");

  if (lang === "cpp" || lang === "c++") {
    const params = paramsList
      .map((p) => {
        const t = getCppType(p.type);
        const ref = p.type.endsWith("[]") ? "&" : "";
        return `${t}${ref ? " " + ref : " "}${p.name}`;
      })
      .join(", ");
    const ret = getCppType(retType);

    const treeDef = usesTree
      ? `// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\n`
      : "";
    const listDef = usesList
      ? `// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\n`
      : "";

    return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

${treeDef}${listDef}class Solution {
public:
    ${ret} ${funcName}(${params}) {
        // Write your solution here
        
    }
};
`;
  }

  if (lang === "java") {
    const params = paramsList
      .map((p) => `${getJavaType(p.type)} ${p.name}`)
      .join(", ");
    const ret = getJavaType(retType);

    const treeDef = usesTree
      ? `// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\n`
      : "";
    const listDef = usesList
      ? `// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\n`
      : "";

    return `import java.util.*;

${treeDef}${listDef}class Solution {
    public ${ret} ${funcName}(${params}) {
        // Write your solution here
        
    }
}
`;
  }

  if (lang === "python3" || lang === "python") {
    const params = [
      "self",
      ...paramsList.map((p) => `${p.name}: ${getPythonType(p.type)}`),
    ].join(", ");
    const ret = getPythonType(retType);

    const treeDef = usesTree
      ? `# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n`
      : "";
    const listDef = usesList
      ? `# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n`
      : "";

    return `from typing import List, Optional

${treeDef}${listDef}class Solution:
    def ${funcName}(${params}) -> ${ret}:
        # Write your solution here
        pass
`;
  }

  if (lang === "javascript" || lang === "js") {
    const params = paramsList.map((p) => p.name).join(", ");
    return `class Solution {
    ${funcName}(${params}) {
        // Write your solution here
        
    }
}
`;
  }

  // Fallback
  return `// Write your solution for ${funcName}\n`;
}


// ─── Driver Code Generator ───────────────────────────────────────────────────

export function generateDriverCode(
  sig: FunctionSignature,
  language: string
): string {
  const lang = (language || "").toLowerCase();

  // ─── Design/Class Problem Drivers ──────────────────────────────────────────
  if (sig.isClass && sig.className) {
    const className = sig.className;
    const ctorParams = sig.constructorParams || [];
    const methods = sig.methods || [];

    if (lang === "python3" || lang === "python") {
      return `import sys
import json

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if not raw_input:
        sys.exit(0)
    lines = [line.strip() for line in raw_input.splitlines() if line.strip()]
    if len(lines) >= 2:
        commands = json.loads(lines[0])
        arguments = json.loads(lines[1])
        obj = None
        outputs = []
        for cmd, args in zip(commands, arguments):
            if cmd == "${className}":
                obj = ${className}(*args)
                outputs.append(None)
            elif hasattr(obj, cmd):
                res = getattr(obj, cmd)(*args)
                outputs.append(res)
            else:
                outputs.append(None)
        print(json.dumps(outputs))
`;
    }

    if (lang === "cpp" || lang === "c++") {
      const ctorArgDispatch = ctorParams.length > 0
        ? `
            ${ctorParams.map((p, idx) => {
              if (p.type === 'number[]' || p.type === 'int[]' || p.type === 'List<Integer>') return `vector<int> c_arg_${idx} = parseIntArray(argsParsed[${idx}]);`;
              if (p.type === 'int') return `int c_arg_${idx} = stoi(argsParsed[${idx}]);`;
              if (p.type === 'double' || p.type === 'float') return `double c_arg_${idx} = stod(argsParsed[${idx}]);`;
              if (p.type === 'boolean') return `bool c_arg_${idx} = (argsParsed[${idx}] == "true" || argsParsed[${idx}] == "1");`;
              return `string c_arg_${idx} = argsParsed[${idx}];`;
            }).join('\n            ')}
            obj = new ${className}(${ctorParams.map((_, idx) => `c_arg_${idx}`).join(', ')});
            `
        : `
            obj = new ${className}();
            `;

      const methodDispatches = methods.map((m) => {
        const parseArgs = m.parameters.map((p, idx) => {
          if (p.type === 'number[]' || p.type === 'int[]' || p.type === 'List<Integer>') return `vector<int> m_arg_${idx} = parseIntArray(argsParsed[${idx}]);`;
          if (p.type === 'int') return `int m_arg_${idx} = stoi(argsParsed[${idx}]);`;
          if (p.type === 'double' || p.type === 'float') return `double m_arg_${idx} = stod(argsParsed[${idx}]);`;
          if (p.type === 'boolean') return `bool m_arg_${idx} = (argsParsed[${idx}] == "true" || argsParsed[${idx}] == "1");`;
          return `string m_arg_${idx} = argsParsed[${idx}];`;
        }).join('\n            ');
        const call = `obj->${m.name}(${m.parameters.map((_, idx) => `m_arg_${idx}`).join(', ')})`;
        if (m.returnType === 'void') {
          return `else if (cmd == "${m.name}") {
            ${parseArgs}
            ${call};
            outputs.push_back("null");
        }`;
        } else if (m.returnType === 'boolean') {
          return `else if (cmd == "${m.name}") {
            ${parseArgs}
            outputs.push_back(${call} ? "true" : "false");
        }`;
        } else if (m.returnType === 'double' || m.returnType === 'float') {
          return `else if (cmd == "${m.name}") {
            ${parseArgs}
            outputs.push_back(to_string(${call}));
        }`;
        } else {
          return `else if (cmd == "${m.name}") {
            ${parseArgs}
            outputs.push_back(to_string(${call}));
        }`;
        }
      }).join(' ');

      return `static vector<string> parseStringArray(string s) {
    vector<string> list;
    size_t first = s.find('[');
    size_t last = s.rfind(']');
    if (first != string::npos && last != string::npos && last > first) {
        s = s.substr(first + 1, last - first - 1);
    }
    bool inQuotes = false;
    string cur = "";
    for (char c : s) {
        if (c == '"') {
            inQuotes = !inQuotes;
        } else if (c == ',' && !inQuotes) {
            while (!cur.empty() && isspace(cur.front())) cur.erase(cur.begin());
            while (!cur.empty() && isspace(cur.back())) cur.pop_back();
            if (!cur.empty()) list.push_back(cur);
            cur = "";
        } else {
            cur += c;
        }
    }
    while (!cur.empty() && isspace(cur.front())) cur.erase(cur.begin());
    while (!cur.empty() && isspace(cur.back())) cur.pop_back();
    if (!cur.empty()) list.push_back(cur);
    return list;
}

static vector<string> splitTopLevel(string s) {
    vector<string> list;
    size_t first = s.find('[');
    size_t last = s.rfind(']');
    if (first != string::npos && last != string::npos && last > first) {
        s = s.substr(first + 1, last - first - 1);
    }
    int depth = 0;
    bool inQuotes = false;
    string cur = "";
    for (char c : s) {
        if (c == '"') inQuotes = !inQuotes;
        else if (!inQuotes && (c == '[' || c == '{')) depth++;
        else if (!inQuotes && (c == ']' || c == '}')) depth--;
        else if (!inQuotes && c == ',' && depth == 0) {
            while (!cur.empty() && isspace(cur.front())) cur.erase(cur.begin());
            while (!cur.empty() && isspace(cur.back())) cur.pop_back();
            list.push_back(cur);
            cur = "";
            continue;
        }
        cur += c;
    }
    while (!cur.empty() && isspace(cur.front())) cur.erase(cur.begin());
    while (!cur.empty() && isspace(cur.back())) cur.pop_back();
    if (!cur.empty()) list.push_back(cur);
    return list;
}

static vector<int> parseIntArray(string s) {
    vector<string> items = splitTopLevel(s);
    vector<int> res;
    for (const auto& item : items) {
        if (!item.empty()) res.push_back(stoi(item));
    }
    return res;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line1, line2;
    if (!getline(cin, line1) || !getline(cin, line2)) return 0;

    vector<string> commands = parseStringArray(line1);
    vector<string> argList = splitTopLevel(line2);

    ${className}* obj = nullptr;
    vector<string> outputs;

    for (size_t i = 0; i < commands.size(); ++i) {
        string cmd = commands[i];
        string rawArgs = i < argList.size() ? argList[i] : "[]";
        vector<string> argsParsed = splitTopLevel(rawArgs);

        if (cmd == "${className}") {
            ${ctorArgDispatch}
            outputs.push_back("null");
        } ${methodDispatches} else {
            outputs.push_back("null");
        }
    }

    cout << "[";
    for (size_t i = 0; i < outputs.size(); ++i) {
        if (i > 0) cout << ", ";
        cout << outputs[i];
    }
    cout << "]\\n";

    delete obj;
    return 0;
}
`;
    }

    if (lang === "java") {
      const ctorArgDispatch = ctorParams.length > 0
        ? `
                ${ctorParams.map((p, idx) => {
                  if (p.type === 'number[]' || p.type === 'int[]' || p.type === 'List<Integer>') return `int[] c_arg_${idx} = parseIntArray(argsParsed.get(${idx}));`;
                  if (p.type === 'int') return `int c_arg_${idx} = Integer.parseInt(argsParsed.get(${idx}).trim());`;
                  if (p.type === 'double' || p.type === 'float') return `double c_arg_${idx} = Double.parseDouble(argsParsed.get(${idx}).trim());`;
                  if (p.type === 'boolean') return `boolean c_arg_${idx} = Boolean.parseBoolean(argsParsed.get(${idx}).trim());`;
                  return `String c_arg_${idx} = argsParsed.get(${idx}).trim();`;
                }).join('\n                ')}
                obj = new ${className}(${ctorParams.map((_, idx) => `c_arg_${idx}`).join(', ')});
                `
        : `
                obj = new ${className}();
                `;

      const methodDispatches = methods.map((m) => {
        const parseArgs = m.parameters.map((p, idx) => {
          if (p.type === 'number[]' || p.type === 'int[]' || p.type === 'List<Integer>') return `int[] m_arg_${idx} = parseIntArray(argsParsed.get(${idx}));`;
          if (p.type === 'int') return `int m_arg_${idx} = Integer.parseInt(argsParsed.get(${idx}).trim());`;
          if (p.type === 'double' || p.type === 'float') return `double m_arg_${idx} = Double.parseDouble(argsParsed.get(${idx}).trim());`;
          if (p.type === 'boolean') return `boolean m_arg_${idx} = Boolean.parseBoolean(argsParsed.get(${idx}).trim());`;
          return `String m_arg_${idx} = argsParsed.get(${idx}).trim();`;
        }).join('\n                ');
        const call = `obj.${m.name}(${m.parameters.map((_, idx) => `m_arg_${idx}`).join(', ')})`;
        if (m.returnType === 'void') {
          return `else if (cmd.equals("${m.name}")) {
                ${parseArgs}
                ${call};
                outputs.add("null");
            }`;
        } else {
          return `else if (cmd.equals("${m.name}")) {
                ${parseArgs}
                outputs.add(String.valueOf(${call}));
            }`;
        }
      }).join(' ');

      return `public class Main {
    private static List<String> parseStringArray(String s) {
        List<String> list = new ArrayList<>();
        s = s.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
            s = s.substring(1, s.length() - 1).trim();
        }
        if (s.isEmpty()) return list;
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                list.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        if (sb.length() > 0) list.add(sb.toString().trim());
        return list;
    }

    private static List<String> splitTopLevel(String s) {
        List<String> list = new ArrayList<>();
        s = s.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
            s = s.substring(1, s.length() - 1).trim();
        }
        if (s.isEmpty()) return list;
        int depth = 0;
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') inQuotes = !inQuotes;
            else if (!inQuotes && (c == '[' || c == '{')) depth++;
            else if (!inQuotes && (c == ']' || c == '}')) depth--;
            else if (!inQuotes && c == ',' && depth == 0) {
                list.add(sb.toString().trim());
                sb.setLength(0);
                continue;
            }
            sb.append(c);
        }
        if (sb.length() > 0) list.add(sb.toString().trim());
        return list;
    }

    private static int[] parseIntArray(String s) {
        List<String> items = splitTopLevel(s);
        int[] arr = new int[items.size()];
        for (int i = 0; i < items.size(); i++) {
            String it = items.get(i).trim();
            if (!it.isEmpty()) arr[i] = Integer.parseInt(it);
        }
        return arr;
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        if (line1 == null || line2 == null) return;

        List<String> commands = parseStringArray(line1);
        List<String> argList = splitTopLevel(line2);

        ${className} obj = null;
        List<String> outputs = new ArrayList<>();

        for (int i = 0; i < commands.size(); i++) {
            String cmd = commands.get(i);
            String rawArgs = i < argList.size() ? argList.get(i) : "[]";
            List<String> argsParsed = splitTopLevel(rawArgs);

            if (cmd.equals("${className}")) {
                ${ctorArgDispatch}
                outputs.add("null");
            } ${methodDispatches} else {
                outputs.add("null");
            }
        }

        System.out.println("[" + String.join(", ", outputs) + "]");
    }
}
`;
    }
  }

  // ─── Standard Function Problem Drivers ──────────────────────────────────────
  const funcName = sig.functionName || "solution";
  const paramsList = sig.parameters || [];
  const retType = sig.returnType || "void";

  if (lang === "python3" || lang === "python") {
    const paramParsers: string[] = [];

    paramsList.forEach((p, i) => {
      if (p.type === "int" || p.type === "long") {
        paramParsers.push(`        arg_${i} = int(tokens[ptr]); ptr += 1`);
      } else if (p.type === "double" || p.type === "float") {
        paramParsers.push(`        arg_${i} = float(tokens[ptr]); ptr += 1`);
      } else if (p.type === "string") {
        paramParsers.push(`        arg_${i} = tokens[ptr].strip('"').strip("'"); ptr += 1`);
      } else if (p.type === "boolean") {
        paramParsers.push(`        arg_${i} = tokens[ptr].lower() in ("true", "1"); ptr += 1`);
      } else if (
        p.type === "number[]" ||
        p.type === "int[]" ||
        p.type === "List<Integer>"
      ) {
        paramParsers.push(`        if ptr < len(tokens) and tokens[ptr].startswith("["):
            sub = " ".join(tokens[ptr:])
            depth = 0
            end_idx = 0
            for s_i, ch in enumerate(sub):
                if ch == '[': depth += 1
                elif ch == ']':
                    depth -= 1
                    if depth == 0:
                        end_idx = s_i + 1
                        break
            arg_${i} = json.loads(sub[:end_idx])
            ptr += len(sub[:end_idx].split())
        elif ptr < len(tokens):
            n_${i} = int(tokens[ptr]); ptr += 1
            arg_${i} = [int(x) for x in tokens[ptr:ptr+n_${i}]]
            ptr += n_${i}
        else:
            arg_${i} = []`);
      } else if (
        p.type === "number[][]" ||
        p.type === "int[][]" ||
        p.type === "List<List<Integer>>"
      ) {
        paramParsers.push(`        if ptr < len(tokens) and tokens[ptr].startswith("["):
            sub = " ".join(tokens[ptr:])
            depth = 0
            end_idx = 0
            for s_i, ch in enumerate(sub):
                if ch == '[': depth += 1
                elif ch == ']':
                    depth -= 1
                    if depth == 0:
                        end_idx = s_i + 1
                        break
            arg_${i} = json.loads(sub[:end_idx])
            ptr += len(sub[:end_idx].split())
        else:
            arg_${i} = []`);
      } else if (p.type === "string[]") {
        paramParsers.push(`        if ptr < len(tokens) and tokens[ptr].startswith("["):
            sub = " ".join(tokens[ptr:])
            depth = 0
            end_idx = 0
            for s_i, ch in enumerate(sub):
                if ch == '[': depth += 1
                elif ch == ']':
                    depth -= 1
                    if depth == 0:
                        end_idx = s_i + 1
                        break
            arg_${i} = json.loads(sub[:end_idx])
            ptr += len(sub[:end_idx].split())
        elif ptr < len(tokens):
            n_${i} = int(tokens[ptr]); ptr += 1
            arg_${i} = tokens[ptr:ptr+n_${i}]
            ptr += n_${i}
        else:
            arg_${i} = []`);
      } else {
        paramParsers.push(`        arg_${i} = None`);
      }
    });

    const callArgs = paramsList.map((_, i) => `arg_${i}`).join(", ");

    return `import sys
import json

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if not raw_input and ${paramsList.length} == 0:
        sol = Solution()
        res = sol.${funcName}()
        if res is not None:
            if isinstance(res, bool):
                print(str(res).lower())
            elif isinstance(res, (list, tuple)):
                print(json.dumps(res))
            else:
                print(res)
    elif raw_input:
        tokens = raw_input.split()
        ptr = 0
${paramParsers.join("\n")}
        sol = Solution()
        res = sol.${funcName}(${callArgs})
        if res is not None:
            if isinstance(res, bool):
                print(str(res).lower())
            elif isinstance(res, (list, tuple)):
                print(json.dumps(res))
            else:
                print(res)
`;
  }

  if (lang === "cpp" || lang === "c++") {
    const paramReads: string[] = [];

    paramsList.forEach((p, i) => {
      const cppType = getCppType(p.type);
      if (p.type === "int") {
        paramReads.push(`    int arg_${i} = 0;\n    cin >> arg_${i};`);
      } else if (p.type === "long") {
        paramReads.push(`    long long arg_${i} = 0;\n    cin >> arg_${i};`);
      } else if (p.type === "double" || p.type === "float") {
        paramReads.push(`    double arg_${i} = 0.0;\n    cin >> arg_${i};`);
      } else if (p.type === "string") {
        paramReads.push(`    string arg_${i};\n    cin >> arg_${i};\n    if (arg_${i}.size() >= 2 && arg_${i}.front() == '"' && arg_${i}.back() == '"') arg_${i} = arg_${i}.substr(1, arg_${i}.size() - 2);`);
      } else if (p.type === "boolean") {
        paramReads.push(`    string bool_str_${i};\n    cin >> bool_str_${i};\n    bool arg_${i} = (bool_str_${i} == "true" || bool_str_${i} == "1");`);
      } else if (
        p.type === "number[]" ||
        p.type === "int[]" ||
        p.type === "List<Integer>"
      ) {
        paramReads.push(`    vector<int> arg_${i} = readVectorInt();`);
      } else if (
        p.type === "number[][]" ||
        p.type === "int[][]" ||
        p.type === "List<List<Integer>>"
      ) {
        paramReads.push(`    vector<vector<int>> arg_${i} = readVectorVectorInt();`);
      } else if (p.type === "string[]") {
        paramReads.push(`    vector<string> arg_${i} = readVectorString();`);
      } else {
        paramReads.push(`    ${cppType} arg_${i} = nullptr;`);
      }
    });

    const callArgs = paramsList.map((_, i) => `arg_${i}`).join(", ");

    let printLogic = "";
    if (
      retType === "number[]" ||
      retType === "int[]" ||
      retType === "List<Integer>"
    ) {
      printLogic = `    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]\\n";`;
    } else if (
      retType === "number[][]" ||
      retType === "int[][]" ||
      retType === "List<List<Integer>>"
    ) {
      printLogic = `    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        if (i > 0) cout << ",";
        cout << "[";
        for (size_t j = 0; j < result[i].size(); ++j) {
            if (j > 0) cout << ",";
            cout << result[i][j];
        }
        cout << "]";
    }
    cout << "]\\n";`;
    } else if (retType === "string[]") {
      printLogic = `    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        if (i > 0) cout << ",";
        cout << "\\"" << result[i] << "\\"";
    }
    cout << "]\\n";`;
    } else if (retType === "boolean") {
      printLogic = `    cout << (result ? "true" : "false") << "\\n";`;
    } else if (retType === "void") {
      printLogic = ``;
    } else {
      printLogic = `    cout << result << "\\n";`;
    }

    return `static vector<int> readVectorInt() {
    while (cin && isspace(cin.peek())) cin.get();
    if (!cin) return {};
    if (cin.peek() == '[') {
        string s;
        char c;
        int depth = 0;
        while (cin.get(c)) {
            s += c;
            if (c == '[') depth++;
            else if (c == ']') { depth--; if (depth <= 0) break; }
        }
        vector<int> res;
        string cur;
        for (char ch : s) {
            if (ch == '-' || (ch >= '0' && ch <= '9')) cur += ch;
            else {
                if (!cur.empty()) { res.push_back(stoi(cur)); cur.clear(); }
            }
        }
        if (!cur.empty()) res.push_back(stoi(cur));
        return res;
    } else {
        int n = 0;
        if (cin >> n) {
            vector<int> res(n);
            for (int i = 0; i < n; ++i) cin >> res[i];
            return res;
        }
        return {};
    }
}

static vector<vector<int>> readVectorVectorInt() {
    while (cin && isspace(cin.peek())) cin.get();
    if (!cin) return {};
    if (cin.peek() == '[') {
        string s;
        char c;
        int depth = 0;
        while (cin.get(c)) {
            s += c;
            if (c == '[') depth++;
            else if (c == ']') { depth--; if (depth <= 0) break; }
        }
        vector<vector<int>> res;
        vector<int> curRow;
        string cur;
        bool inRow = false;
        for (char ch : s) {
            if (ch == '[') inRow = true;
            else if (ch == ']') {
                if (!cur.empty()) { curRow.push_back(stoi(cur)); cur.clear(); }
                if (inRow) { res.push_back(curRow); curRow.clear(); }
                inRow = false;
            } else if (ch == '-' || (ch >= '0' && ch <= '9')) {
                cur += ch;
            } else if (ch == ',' || isspace(ch)) {
                if (!cur.empty()) { curRow.push_back(stoi(cur)); cur.clear(); }
            }
        }
        return res;
    }
    return {};
}

static vector<string> readVectorString() {
    while (cin && isspace(cin.peek())) cin.get();
    if (!cin) return {};
    if (cin.peek() == '[') {
        string s;
        char c;
        int depth = 0;
        while (cin.get(c)) {
            s += c;
            if (c == '[') depth++;
            else if (c == ']') { depth--; if (depth <= 0) break; }
        }
        vector<string> res;
        bool inQuotes = false;
        string cur;
        for (char ch : s) {
            if (ch == '"') {
                if (inQuotes) { res.push_back(cur); cur.clear(); }
                inQuotes = !inQuotes;
            } else if (inQuotes) {
                cur += ch;
            }
        }
        return res;
    } else {
        int n = 0;
        if (cin >> n) {
            vector<string> res(n);
            for (int i = 0; i < n; ++i) cin >> res[i];
            return res;
        }
        return {};
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

${paramReads.join("\n")}
    Solution solver;
    ${retType !== "void" ? "auto result = " : ""}solver.${funcName}(${callArgs});
${printLogic}
    return 0;
}
`;
  }

  if (lang === "java") {
    const paramReads: string[] = [];

    paramsList.forEach((p, i) => {
      const javaType = getJavaType(p.type);
      if (p.type === "int") {
        paramReads.push(`            int arg_${i} = scanner.hasNextInt() ? scanner.nextInt() : 0;`);
      } else if (p.type === "long") {
        paramReads.push(`            long arg_${i} = scanner.hasNextLong() ? scanner.nextLong() : 0L;`);
      } else if (p.type === "double" || p.type === "float") {
        paramReads.push(`            double arg_${i} = scanner.hasNextDouble() ? scanner.nextDouble() : 0.0;`);
      } else if (p.type === "string") {
        paramReads.push(`            String arg_${i} = scanner.hasNext() ? scanner.next().replace("\"", "") : "";`);
      } else if (p.type === "boolean") {
        paramReads.push(`            boolean arg_${i} = scanner.hasNextBoolean() ? scanner.nextBoolean() : (scanner.hasNext() && scanner.next().equalsIgnoreCase("true"));`);
      } else if (p.type === "number[]" || p.type === "int[]") {
        paramReads.push(`            int[] arg_${i} = readIntArray(scanner);`);
      } else if (p.type === "List<Integer>") {
        paramReads.push(`            List<Integer> arg_${i} = readIntList(scanner);`);
      } else if (p.type === "number[][]" || p.type === "int[][]") {
        paramReads.push(`            int[][] arg_${i} = read2DIntArray(scanner);`);
      } else if (p.type === "List<List<Integer>>") {
        paramReads.push(`            List<List<Integer>> arg_${i} = read2DIntList(scanner);`);
      } else if (p.type === "string[]") {
        paramReads.push(`            String[] arg_${i} = readStringArray(scanner);`);
      } else {
        paramReads.push(`            ${javaType} arg_${i} = null;`);
      }
    });

    const callArgs = paramsList.map((_, i) => `arg_${i}`).join(", ");

    let printLogic = "";
    if (retType === "number[]" || retType === "int[]") {
      printLogic = `            if (res != null) {
                System.out.print("[");
                for (int i = 0; i < res.length; i++) {
                    if (i > 0) System.out.print(",");
                    System.out.print(res[i]);
                }
                System.out.println("]");
            }`;
    } else if (retType === "List<Integer>" || retType === "List<List<Integer>>") {
      printLogic = `            System.out.println(res);`;
    } else if (retType === "void") {
      printLogic = ``;
    } else {
      printLogic = `            System.out.println(res);`;
    }

    return `public class Main {
    private static int[] readIntArray(Scanner scanner) {
        if (!scanner.hasNext()) return new int[0];
        String token = scanner.next();
        if (token.startsWith("[")) {
            StringBuilder sb = new StringBuilder(token);
            while (!token.endsWith("]") && scanner.hasNext()) {
                token = scanner.next();
                sb.append(" ").append(token);
            }
            String s = sb.toString().replace("[", "").replace("]", "").trim();
            if (s.isEmpty()) return new int[0];
            String[] parts = s.split("[,\\\\s]+");
            List<Integer> list = new ArrayList<>();
            for (String p : parts) {
                if (!p.trim().isEmpty()) list.add(Integer.parseInt(p.trim()));
            }
            int[] res = new int[list.size()];
            for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
            return res;
        } else {
            int n = Integer.parseInt(token);
            int[] res = new int[n];
            for (int i = 0; i < n; i++) res[i] = scanner.nextInt();
            return res;
        }
    }

    private static List<Integer> readIntList(Scanner scanner) {
        int[] arr = readIntArray(scanner);
        List<Integer> list = new ArrayList<>();
        for (int x : arr) list.add(x);
        return list;
    }

    private static int[][] read2DIntArray(Scanner scanner) {
        return new int[0][0];
    }

    private static List<List<Integer>> read2DIntList(Scanner scanner) {
        return new ArrayList<>();
    }

    private static String[] readStringArray(Scanner scanner) {
        return new String[0];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
${paramReads.join("\n")}
        Solution solver = new Solution();
        ${retType !== "void" ? `${getJavaType(retType)} res = ` : ""}solver.${funcName}(${callArgs});
${printLogic}
    }
}
`;
  }

  return "";
}


// ─── Starter Code Lookup ─────────────────────────────────────────────────────

export function getProblemStarterCode(
  problem: ProblemCodeMeta | null | undefined,
  language: string
): string {
  if (!problem) return "";
  const langKey = (language || "").toLowerCase();

  // 1. Check explicit stored starter code
  if (problem.starterCode && typeof problem.starterCode === "object") {
    if (problem.starterCode[langKey]) {
      return problem.starterCode[langKey];
    }
    // Alias checks (python3 vs python, cpp vs c++)
    if (langKey === "python3" && problem.starterCode["python"]) {
      return problem.starterCode["python"];
    }
    if (langKey === "python" && problem.starterCode["python3"]) {
      return problem.starterCode["python3"];
    }
    if (langKey === "cpp" && problem.starterCode["c++"]) {
      return problem.starterCode["c++"];
    }
  }

  // 2. Generate on the fly from functionSignature
  if (problem.functionSignature && (problem.functionSignature.functionName || problem.functionSignature.isClass)) {
    return generateStarterCode(problem.functionSignature, langKey);
  }

  return "";
}

// ─── Universal Code Wrapper ──────────────────────────────────────────────────

export function wrapCodeWithDriver(
  sourceCode: string,
  language: string,
  problem?: ProblemCodeMeta | null
): string {
  const lang = (language || "").toLowerCase();
  const trimmed = (sourceCode || "").trim();

  // If no problem metadata or function signature provided, return unmodified
  if (!problem || (!problem.functionSignature && !problem.driverCode)) {
    return sourceCode;
  }

  const sig = problem.functionSignature;
  const driverMap = problem.driverCode;

  // ─── A. Full Program Detection (Backwards compatibility) ─────────────────────
  if (lang === "cpp" || lang === "c++" || lang === "c") {
    if (/\b(int|void)\s+main\s*\(/.test(trimmed)) {
      return sourceCode;
    }
  } else if (lang === "java") {
    if (/\bstatic\s+void\s+main\s*\(/.test(trimmed)) {
      return sourceCode;
    }
  } else if (lang === "python3" || lang === "python") {
    if (/if\s+__name__\s*==\s*['"]__main__['"]/.test(trimmed)) {
      return sourceCode;
    }
  }

  // ─── B. Obtain Driver Code ──────────────────────────────────────────────────
  let driver = "";
  if (driverMap && typeof driverMap === "object") {
    driver =
      driverMap[lang] ||
      (lang === "python3" ? driverMap["python"] : undefined) ||
      (lang === "python" ? driverMap["python3"] : undefined) ||
      (lang === "cpp" ? driverMap["c++"] : undefined) ||
      "";
  }

  if (!driver && sig) {
    driver = generateDriverCode(sig, lang);
  }

  if (!driver) {
    return sourceCode;
  }

  // ─── C. Wrap Language-Specific Solution Stub if Needed ───────────────────────
  let normalizedUserCode = trimmed;

  if (lang === "python3" || lang === "python") {
    const hasClass = sig?.isClass && sig?.className
      ? new RegExp(`\\bclass\\s+${sig.className}\\b`).test(normalizedUserCode)
      : /class\s+Solution\b/.test(normalizedUserCode);

    if (!hasClass) {
      if (sig?.isClass) {
        // Class definition missing, keep user code intact
      } else if (sig && sig.functionName && !new RegExp(`def\\s+${sig.functionName}\\b`).test(normalizedUserCode)) {
        // User wrote just the body, e.g. "return a + b"
        const params = [
          "self",
          ...(sig.parameters || []).map((p) => `${p.name}: ${getPythonType(p.type)}`),
        ].join(", ");
        const indentedBody = normalizedUserCode
          .split("\n")
          .map((l) => "        " + l)
          .join("\n");
        normalizedUserCode = `from typing import List, Optional\n\nclass Solution:\n    def ${sig.functionName}(${params}) -> ${getPythonType(sig.returnType || "void")}:\n${indentedBody}`;
      } else {
        // User wrote def functionName(...) without class Solution
        const indented = normalizedUserCode
          .split("\n")
          .map((l) => "    " + l)
          .join("\n");
        normalizedUserCode = `from typing import List, Optional\n\nclass Solution:\n${indented}`;
      }
    }
    return `${normalizedUserCode}\n\n${driver}`;
  }

  if (lang === "cpp" || lang === "c++") {
    const hasClass = sig?.isClass && sig?.className
      ? new RegExp(`\\bclass\\s+${sig.className}\\b`).test(normalizedUserCode)
      : /class\s+Solution\b/.test(normalizedUserCode);

    if (!hasClass) {
      if (sig?.isClass) {
        // Class definition missing, keep user code intact
      } else if (sig && sig.functionName && !new RegExp(`\\b${sig.functionName}\\s*\\(`).test(normalizedUserCode)) {
        // User wrote just the body, e.g. "return a + b;"
        const params = (sig.parameters || [])
          .map((p) => {
            const t = getCppType(p.type);
            const ref = p.type.endsWith("[]") ? "&" : "";
            return `${t}${ref ? " " + ref : " "}${p.name}`;
          })
          .join(", ");
        normalizedUserCode = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    ${getCppType(sig.returnType || "void")} ${sig.functionName}(${params}) {
        ${normalizedUserCode}
    }
};`;
      } else {
        // User wrote member function or functions without class Solution
        normalizedUserCode = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
${normalizedUserCode}
};`;
      }
    } else {
      // Ensure basic headers exist
      if (!/#include\s*<iostream>/.test(normalizedUserCode)) {
        normalizedUserCode = `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\n${normalizedUserCode}`;
      }
    }
    return `${normalizedUserCode}\n\n${driver}`;
  }

  if (lang === "java") {
    // In Java, ensure class Solution or class <className> is not public so public class Main can be compiled in Main.java
    normalizedUserCode = normalizedUserCode.replace(
      /public\s+class\s+Solution\b/,
      "class Solution"
    );
    if (sig?.isClass && sig?.className) {
      normalizedUserCode = normalizedUserCode.replace(
        new RegExp(`public\\s+class\\s+${sig.className}\\b`),
        `class ${sig.className}`
      );
    }

    const hasClass = sig?.isClass && sig?.className
      ? new RegExp(`\\bclass\\s+${sig.className}\\b`).test(normalizedUserCode)
      : /class\s+Solution\b/.test(normalizedUserCode);

    if (!hasClass) {
      if (sig?.isClass) {
        // Class definition missing, keep user code intact
      } else if (sig && sig.functionName && !new RegExp(`\\b${sig.functionName}\\s*\\(`).test(normalizedUserCode)) {
        // User wrote just the body, e.g. "return a + b;"
        const params = (sig.parameters || [])
          .map((p) => `${getJavaType(p.type)} ${p.name}`)
          .join(", ");
        normalizedUserCode = `class Solution {
    public ${getJavaType(sig.returnType || "void")} ${sig.functionName}(${params}) {
        ${normalizedUserCode}
    }
}`;
      } else {
        normalizedUserCode = `class Solution {
${normalizedUserCode}
}`;
      }
    }

    // Extract and hoist all imports to the top of the file
    const fullSource = `${normalizedUserCode}\n\n${driver}`;
    const importRegex = /^\s*import\s+[^;]+;\s*$/gm;
    const imports = new Set<string>();
    imports.add("import java.util.*;");
    imports.add("import java.io.*;");

    const matches = fullSource.match(importRegex);
    if (matches) {
      matches.forEach((imp) => imports.add(imp.trim()));
    }

    const cleanedSource = fullSource.replace(importRegex, "").trim();
    return `${Array.from(imports).join("\n")}\n\n${cleanedSource}\n`;
  }

  return `${normalizedUserCode}\n\n${driver}`;
}

