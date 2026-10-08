export const STARTER_TEMPLATES: Record<string, string> = {
  python3: `class Solution:
    def solve(self):
        # Write your solution logic here
        pass
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution logic here
        
    }
};
`,
  java: `import java.util.*;

class Solution {
    public void solve() {
        // Write your solution logic here
        
    }
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

void solve() {
    // Write your solution logic here
    
}
`,
  javascript: `class Solution {
    solve() {
        // Write your solution logic here
        
    }
}
`,
};

export const MONACO_LANGUAGES: Record<string, string> = {
  python3: "python",
  cpp: "cpp",
  java: "java",
  c: "c",
  javascript: "javascript",
};
