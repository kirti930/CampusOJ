# CampusOJ System Architecture

CampusOJ is an enterprise-grade campus online judge and competitive programming platform architected as a modular TypeScript monorepo. It features distributed asynchronous code execution, pluggable scoring engines, real-time leaderboard broadcasting, and strict role-based access control.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    User["Student / Faculty / Admin Browser"] -->|HTTP / REST| API["Express API Gateway (:5000)"]
    User -->|WebSocket (Socket.IO)| Sockets["Socket.IO Server"]
    API --> Sockets

    API -->|Read / Write| DB[("PostgreSQL 16")]
    API -->|Enqueue Jobs| Queue[("Redis 7 (BullMQ)")]

    Worker["Judge Worker Engine"] -->|Dequeue Jobs| Queue
    Worker -->|Fetch Problem & Tests| DB
    Worker -->|Execute Code| Judge["Judge Provider (Judge0 / Mock)"]
    Worker -->|Persist Verdicts| DB
    Worker -->|Recalculate Standings| Standings["Leaderboard Engine"]
    Standings -->|Upsert Standings| DB
    Standings -->|Broadcast Event| Sockets
```

---

## 2. Monorepo Organization

The codebase is organized into npm workspaces:

```
CampusOJ/
├── apps/
│   ├── api/             # Node.js + Express + TypeScript API server
│   └── web/             # React 18 + Vite + Tailwind CSS + Monaco Editor
├── packages/
│   ├── db/              # Prisma ORM schema, migrations, and seed script
│   └── shared/          # Shared interfaces, Zod schemas, constants, and enums
├── judge/
│   └── worker/          # BullMQ distributed background worker evaluating submissions
├── tests/
│   └── smoke-test.ts    # End-to-end integration and smoke test runner
└── docs/                # Production architectural & deployment documentation
```

### Dependency Graph

```
apps/api ─────────▶ packages/shared ◀───────── apps/web
   │                                              │
   ▼                                              ▼
packages/db ◀───── judge/worker ──────▶ packages/shared
```

- `@campusoj/shared` is zero-dependency and browser-safe.
- `@campusoj/db` exports a singleton `PrismaClient` with connection-pooling safeguards.
- `apps/api` handles authentication, contest CRUD, and request orchestration.
- `judge/worker` handles sandboxed execution orchestration independent of the API server.

---

## 3. Asynchronous Submission & Judging Pipeline

1. **Submission Ingestion**:
   - The user writes code in the Monaco Editor and clicks **Submit**.
   - `POST /api/v1/submissions` validates payload against Zod schema (`CreateSubmissionSchema`).
   - If in a contest, verifies user registration, contest status (`LIVE`), and allowed languages.
   - Creates a `Submission` record with `QUEUED` status and pushes a job to BullMQ queue (`submissionQueue`).
   - Emits `submission:status` event (`QUEUED`) to the user's Socket.IO room.

2. **Distributed Queue Processing**:
   - The BullMQ worker (`judge/worker`) picks up the job.
   - Marks the submission status as `RUNNING` and emits real-time notification.
   - Fetches full test cases (including hidden test cases) directly from database.

3. **Pluggable Judge Abstraction**:
   - `JudgeProvider` contract:
     ```ts
     interface JudgeProvider {
       execute(
         code: string,
         language: string,
         testCases: JudgeTestCase[],
         limits: JudgeLimits
       ): Promise<JudgeResult[]>;
     }
     ```
   - Two interchangeable implementations:
     - `MockJudgeProvider`: For offline and local development without Judge0 infrastructure.
     - `Judge0Provider`: Submits batches to Judge0 via REST API with base64-encoded I/O and resource limits.

4. **Verdict Aggregation & Scoring**:
   - Iterates through test case results.
   - Priority hierarchy for aggregate verdict:
     `COMPILATION_ERROR` > `INTERNAL_ERROR` > `TIME_LIMIT_EXCEEDED` > `MEMORY_LIMIT_EXCEEDED` > `RUNTIME_ERROR` > `WRONG_ANSWER` > `ACCEPTED`.
   - Saves individual `SubmissionResult` records and updates the main `Submission` record.

5. **Standings Recalculation & Socket Broadcast**:
   - If the submission belongs to a contest, `LeaderboardService.recalculateAndPersistLeaderboard(contestId)` runs.
   - Standings are recalculated using the contest's configured scoring strategy.
   - Upserts standings into `prisma.leaderboard`.
   - Broadcasts `leaderboard:update` event to the contest's Socket.IO room `contest:${contestId}`.

---

## 4. Scoring Engines

Located at `apps/api/src/modules/leaderboard/strategies/`:

### A. ICPCScoringStrategy
- **Rank 1 Criterion**: Count of solved unique problems descending.
- **Rank 2 Criterion (Tie Break)**: Lowest accumulated penalty minutes.
- **Penalty Formula**:
  $$\text{Penalty} = \text{elapsed minutes at AC} + (20 \times \text{rejected attempts before AC})$$
- **Rules**:
  - Attempts on problems that are never solved do **not** contribute to penalty.
  - Submissions submitted after the first AC on a problem are ignored.
  - Ties in both solved count and penalty are broken by the earliest last accepted timestamp.

### B. PointsBinaryScoringStrategy
- **Rank 1 Criterion**: Sum of point values from solved problems (`ContestProblem.points`).
- **Rank 2 Criterion (Tie Break)**: Earliest timestamp of the last accepted submission.

---

## 5. Leaderboard Freeze Mechanics

When `contest.freezeLeaderboard = true`:
- The freeze window activates in the final 1 hour before `contest.endTime`.
- **Public & Student Views**: Submissions created after `freezeTime` are excluded from calculation, returning `isFrozen: true` with a frozen notification banner.
- **Faculty / Admin Views**: Submissions are never filtered, providing full unmasked real-time telemetry.

---

## 6. Real-Time Socket.IO Channels

- `user:${userId}`: Personal submission lifecycle updates (`QUEUED`, `RUNNING`, verdict results).
- `contest:${contestId}`:
  - `leaderboard:update`: Full recalculation data payload for live standings matrix.
  - `contest:submission`: Incoming submission stream for the Faculty Contest Monitor.
