# CampusOJ — Campus Online Judge & Competitive Programming Platform

[![CampusOJ CI](https://github.com/kirti930/CampusOJ/actions/workflows/ci.yml/badge.svg)](https://github.com/kirti930/CampusOJ/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CampusOJ** is a campus competitive programming platform and online judge built with TypeScript across the entire stack. It provides real-time ICPC penalty standings, distributed BullMQ code execution with Judge0 integration, hidden test case protection, live faculty telemetry, and role-based access control.

---

## 🏛 Architecture Mental Model

CampusOJ is built as a modular monorepo:

```
CampusOJ/
├── apps/
│   ├── api/             # Express REST API Gateway + Socket.IO Server (:5000)
│   └── web/             # React 18 + Vite + Tailwind CSS + Monaco Editor (:5173)
├── packages/
│   ├── db/              # Prisma ORM models, migrations & seed catalog
│   └── shared/          # Shared browser-safe interfaces, Zod schemas & constants
├── judge/
│   └── worker/          # BullMQ distributed background worker evaluating submissions
├── tests/
│   └── smoke-test.ts    # End-to-end integration and smoke test runner
└── docs/                # Architecture, API, Security & Deployment documentation
```

### Core Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Web as Web (Monaco Editor)
    participant API as Express API (:5000)
    participant DB as PostgreSQL
    participant Queue as Redis (BullMQ)
    participant Worker as Judge Worker
    participant Judge as Judge0 / Mock
    participant Sockets as Socket.IO

    Student->>Web: Write & Submit Solution
    Web->>API: POST /api/v1/submissions
    API->>DB: Save Submission (QUEUED)
    API->>Queue: Enqueue Job
    API->>Sockets: Emit submission:status (QUEUED)
    Sockets-->>Web: Real-time update
    Queue->>Worker: Pick up job
    Worker->>DB: Fetch problem & hidden test cases
    Worker->>Judge: Execute sandboxed code
    Judge-->>Worker: Return verdicts & metrics
    Worker->>DB: Save SubmissionResult & final status
    Worker->>DB: Recalculate contest leaderboard
    Worker->>Sockets: Emit leaderboard:update
    Sockets-->>Web: Update live standings matrix
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Docker & Docker Compose**: (for local PostgreSQL and Redis)

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/kirti930/CampusOJ.git
cd CampusOJ
npm install
```

---

### Step 2: Spin Up Infrastructure (PostgreSQL + Redis)

Use the included Docker Compose configuration to start local PostgreSQL 16 and Redis 7:

```bash
docker compose up -d
```

Verify services are healthy:
```bash
docker compose ps
```

---

### Step 3: Configure Environment Variables

Copy the template configuration:

```bash
cp .env.example .env
```

The default values in `.env.example` are pre-configured to work out of the box with the local Docker containers:
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/campusoj?schema=public`
- `REDIS_URL`: `redis://localhost:6379`
- `JUDGE_PROVIDER`: `mock` (enables instant offline local evaluation without Judge0)

---

### Step 4: Run Migrations & Seed Database

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Run Database Migrations
npm run db:migrate

# 3. Seed Default Users, Problems, Test Cases & Live Contest
npm run db:seed
```

---

### Step 5: Start the Development Servers

Run the API, Web frontend, and background worker simultaneously:

```bash
# In Terminal 1: Express API + Socket.IO Server (:5000)
npm run dev --workspace=@campusoj/api

# In Terminal 2: Vite React Frontend (:5173)
npm run dev --workspace=@campusoj/web

# In Terminal 3: BullMQ Judge Worker
npm run dev --workspace=@campusoj/judge-worker
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔐 Demo Credentials

All seeded accounts share the common password: **`Password123!`**

| Role | Email | Permissions / Features |
|---|---|---|
| **Super Admin** | `superadmin@campusoj.edu` | Full platform control, user role management, system settings |
| **Admin** | `admin@campusoj.edu` | Contest & problem management, leaderboard administration |
| **Faculty** | `faculty@campusoj.edu` | Author contests/problems, test case management, Live Faculty Monitor |
| **Student** | `student@campusoj.edu` | Contest participant, Monaco workspace, practice problem solver |

---

## 🧪 Automated Integration Smoke Test

CampusOJ includes an end-to-end integration test that verifies authentication, problem retrieval, submission evaluation, and real-time leaderboard score updates:

```bash
npm run test:smoke
```

---

## 📚 Documentation Index

- **[System Architecture](docs/architecture.md)** — Architectural diagrams, monorepo dependency graph, scoring engine mechanics, and queue pipelines.
- **[REST API Reference](docs/API.md)** — Comprehensive catalog of all authentication, contest, problem, submission, and leaderboard endpoints.
- **[Security & Hardening](docs/security.md)** — Sandboxed execution rules, RBAC matrix, hidden test case protection, and cookie/JWT security.
- **[Production Deployment](docs/deployment.md)** — Step-by-step instructions for deploying to Vercel, Render, Supabase, Upstash, and Judge0.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, TypeScript, Socket.IO Server, Zod, Helmet, Cookie-Parser, Morgan, Compression.
- **Database & Queue**: PostgreSQL 16, Prisma ORM, Redis 7, BullMQ.
- **Judge Execution**: Judge0 REST API integration + local Mock fallback provider.
- **Testing & Quality**: TypeScript strict mode (`noEmit`), GitHub Actions CI.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
