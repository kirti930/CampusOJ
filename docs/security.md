# CampusOJ Security Architecture & Hardening Guide

CampusOJ is designed from the ground up with defensive security principles to run in university environments where untrusted user-submitted code, high-stakes competition data, and academic evaluation assets are processed simultaneously.

---

## 1. Threat Model & Mitigations

| Threat | Impact | CampusOJ Defense Mechanism |
|---|---|---|
| **Untrusted Code Execution** | Remote Code Execution (RCE), host compromise, denial of service | Untrusted student code is **strictly decoupled** from the Express API server. Code is routed via Redis queues to isolated BullMQ workers and evaluated inside sandboxed Judge0 cgroups/seccomp containers. |
| **Hidden Test Case Leakage** | Academic dishonesty, cheating during live contests | Hidden test cases (`isHidden: true`) are systematically stripped at the database query layer for non-faculty users. Test case outputs are never returned to students. |
| **Contest Tampering** | Submitting after contest end, submitting without registration | Strict validation in `submitSolution`: contest must be in `LIVE` status, user must be enrolled in `contest_participants`, and submission timestamp must fall within `[startTime, endTime]`. |
| **Leaderboard Sniping in Final Hour** | Tactical stalling based on competitor updates | `freezeLeaderboard` automatically locks public standings 1 hour prior to contest end. Faculty retain unmasked live visibility. |
| **Privilege Escalation** | Student attempting faculty/admin endpoints | RBAC middleware (`requireRole`) checks decoded JWT payload directly from cryptographically signed tokens. |
| **Denial of Service (DoS)** | Brute force login, submission flooding | Global rate limiter (`express-rate-limit`) limits API requests; submission payload capped at 64 KB; execution time & memory strictly bounded. |

---

## 2. Code Sandboxing & Execution Isolation

1. **Process Isolation**:
   - The Express API (`apps/api`) **never** uses `eval`, `child_process.exec`, or local VM runners to execute user submissions.
   - Code execution is offloaded entirely to `judge/worker`.

2. **Judge0 Sandboxing (Production)**:
   - In production, `JUDGE_PROVIDER=judge0` directs jobs to a dedicated Judge0 instance.
   - Judge0 leverages Linux kernel security features:
     - **cgroups**: Enforces hard caps on CPU time, wall clock time, and memory usage.
     - **seccomp**: Blocks harmful syscalls (`fork` bombs, unauthorized network sockets, raw hardware access).
     - **chroot/isolated filesystem**: User code cannot access host filesystem or other submission artifacts.

3. **Mock Provider (Local Development)**:
   - `MockJudgeProvider` provides deterministic offline testing without spawning uncontained host processes.

---

## 3. Hidden Test Case Protection Rules

1. **Student Problem Detail View (`GET /api/v1/problems/:id`)**:
   - Queries `prisma.testCase` with `where: { isHidden: false, isSample: true }`.
   - Hidden test case inputs and expected outputs are never loaded into memory.

2. **Submission Results View (`GET /api/v1/submissions/:id`)**:
   - Returns only aggregate verdict, execution time, and memory usage.
   - For failed test cases, student accounts only receive the verdict category (`WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`); exact hidden inputs/outputs remain unexposed.
   - Only `COMPILATION_ERROR` stdout/stderr is returned to assist debugging.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint / Action | STUDENT | FACULTY | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|
| Browse Public Contests & Problems | ✅ | ✅ | ✅ | ✅ |
| Solve Practice Problems (`/submissions/run`, `/submissions`) | ✅ | ✅ | ✅ | ✅ |
| Register for Contests | ✅ | ✅ | ✅ | ✅ |
| View Unfrozen Leaderboard (during freeze) | ❌ | ✅ | ✅ | ✅ |
| Create & Edit Contests | ❌ | ✅ | ✅ | ✅ |
| Create & Edit Problems | ❌ | ✅ | ✅ | ✅ |
| Upload / Manage Hidden Test Cases | ❌ | ✅ (Own) | ✅ | ✅ |
| Recalculate Standings Broadcast | ❌ | ✅ | ✅ | ✅ |
| Access Faculty Live Monitor (`/admin/contests/:id/monitor`) | ❌ | ✅ | ✅ | ✅ |
| Promote User Roles / Platform Admin | ❌ | ❌ | ❌ | ✅ |

---

## 5. Token & Session Security

- **JWT Signing**:
  - Signed with `HMAC-SHA256` using a secret minimum 256 bits (`JWT_SECRET`).
  - Contains standard claims: `sub` (user UUID), `email`, `role`, `iat`, and `exp`.
- **Dual Authentication Vectors**:
  - **HTTP-Only Cookies**: Automatically set upon registration/login (`SameSite=Lax`, `HttpOnly=true`, `Secure=true` in production) to mitigate XSS-based token theft.
  - **Bearer Authorization Header**: Supported for external API integrations or environments where cookie transport is restricted.
- **Input Validation**:
  - Every request body, query parameter, and route parameter is validated using strongly-typed Zod schemas (`validateRequest` middleware) before reaching service logic.
