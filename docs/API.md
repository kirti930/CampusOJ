# CampusOJ REST API Reference (v1)

Base URL: `http://localhost:5000/api/v1`

All responses follow a standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Registers a new user account and sets an HTTP-only session cookie.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@campusoj.edu",
    "password": "Password123!",
    "fullName": "Alice Student",
    "college": "School of Engineering",
    "role": "STUDENT" // Optional: "STUDENT" | "FACULTY" (defaults to STUDENT)
  }
  ```
- **Response**: `201 Created` with User object and JWT token.

### `POST /auth/login`
Authenticates existing credentials and sets an HTTP-only cookie (`token`).
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@campusoj.edu",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with User object and JWT token string.

### `GET /auth/me`
Retrieves the currently authenticated user's profile and active session.
- **Access**: Authenticated (`STUDENT`, `FACULTY`, `ADMIN`, `SUPER_ADMIN`)
- **Headers**: `Authorization: Bearer <token>` or HTTP-only cookie.
- **Response**: `200 OK` with full profile.

### `POST /auth/logout`
Clears the HTTP-only session cookie.
- **Access**: Public / Authenticated
- **Response**: `200 OK`

---

## 2. Contests Endpoints (`/contests`)

### `GET /contests`
Lists contests with status filtering and pagination.
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `status`: `DRAFT` | `SCHEDULED` | `LIVE` | `ENDED` | `ARCHIVED` | `UPCOMING`
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)
- **Response**: `200 OK` with paginated contest list.

### `POST /contests`
Creates a new contest.
- **Access**: `FACULTY`, `ADMIN`, `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "title": "Spring Coding Challenge",
    "slug": "spring-coding-challenge",
    "description": "Annual department coding challenge",
    "startTime": "2026-04-01T10:00:00Z",
    "endTime": "2026-04-01T13:00:00Z",
    "scoringStrategy": "ICPC", // "ICPC" | "POINTS_BINARY"
    "freezeLeaderboard": true,
    "rules": "Allowed languages: C, C++, Java, Python, JS."
  }
  ```
- **Response**: `201 Created`

### `GET /contests/:id`
Retrieves contest details, problem roster, and user registration status.
- **Access**: Public / Authenticated
- **Security Rule**: Problems and points are only displayed if contest is `LIVE` or user has privileged role. Hidden test cases are never returned.
- **Response**: `200 OK` with contest object.

### `PUT /contests/:id`
Updates contest metadata, schedule, or status.
- **Access**: Contest Author, `ADMIN`, `SUPER_ADMIN`
- **Response**: `200 OK`

### `POST /contests/:id/register`
Self-registers authenticated user for the contest.
- **Access**: Authenticated
- **Response**: `201 Created`

### `POST /contests/:id/problems`
Attaches a problem to the contest.
- **Access**: `FACULTY`, `ADMIN`, `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "problemId": "uuid-v4",
    "orderIndex": 0,
    "points": 100
  }
  ```
- **Response**: `201 Created`

### `GET /contests/:id/leaderboard`
Returns current standings, problem status matrix, and freeze state.
- **Access**: Public / Authenticated
- **Security Rule**: If `freezeLeaderboard: true` and active in final hour, public/student views only calculate submissions before freeze time. Faculty/Admin see unmasked live results.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "contestId": "uuid",
      "contestTitle": "CampusOJ Cup",
      "scoringStrategy": "ICPC",
      "isFrozen": false,
      "problems": [...],
      "rows": [
        {
          "rank": 1,
          "userId": "uuid",
          "userName": "Alice Student",
          "solvedCount": 3,
          "totalScore": 300,
          "penalty": 142,
          "problemMatrix": {
            "problem-1-id": {
              "status": "ACCEPTED",
              "attempts": 2,
              "penaltyMinutes": 35,
              "solvedAtElapsedMinutes": 15
            }
          }
        }
      ]
    }
  }
  ```

### `POST /contests/:id/leaderboard/recalculate`
Forces a fresh recalculation of contest standings and broadcasts update over Socket.IO.
- **Access**: `FACULTY`, `ADMIN`, `SUPER_ADMIN`
- **Response**: `200 OK`

---

## 3. Problems Endpoints (`/problems`)

### `GET /problems`
Lists algorithmic problems with optional search, difficulty, and tag filters.
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `difficulty`: `EASY` | `MEDIUM` | `HARD`
  - `tag`: string
  - `search`: string
  - `page`: integer
  - `limit`: integer
- **Response**: `200 OK` with paginated problems list.

### `POST /problems`
Creates a new algorithmic problem.
- **Access**: `FACULTY`, `ADMIN`, `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "statement": "Find two numbers...",
    "inputFormat": "Array size and target...",
    "outputFormat": "Two indices...",
    "constraints": "2 <= n <= 10^5",
    "difficulty": "EASY",
    "timeLimit": 1000,
    "memoryLimit": 256,
    "allowedLanguages": ["c", "cpp", "java", "python3", "javascript"],
    "tags": ["arrays", "hash-table"]
  }
  ```
- **Response**: `201 Created`

### `GET /problems/:id`
Retrieves problem detail and sample test cases.
- **Access**: Public / Authenticated
- **Security Rule**: `isHidden: true` test cases are **always stripped** for non-faculty users.
- **Response**: `200 OK`

### `POST /problems/:id/testcases`
Uploads sample or hidden test cases in bulk.
- **Access**: Problem Author, `ADMIN`, `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "testCases": [
      {
        "input": "4 9\n2 7 11 15",
        "expectedOutput": "0 1",
        "isSample": true,
        "isHidden": false,
        "weight": 1
      },
      {
        "input": "3 6\n3 2 4",
        "expectedOutput": "1 2",
        "isSample": false,
        "isHidden": true,
        "weight": 1
      }
    ]
  }
  ```
- **Response**: `201 Created`

---

## 4. Submissions Endpoints (`/submissions`)

### `POST /submissions/run`
Executes code against sample or custom input without saving a database submission.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "problemId": "uuid",
    "language": "python3",
    "sourceCode": "print('test')",
    "customInput": "1 2" // Optional
  }
  ```
- **Response**: `200 OK` with execution results (verdict, stdout, stderr, executionTime, memoryUsage).

### `POST /submissions`
Submits code for official evaluation against full test suite.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "problemId": "uuid",
    "contestId": "uuid", // Optional (omit for practice submissions)
    "language": "python3",
    "sourceCode": "import sys..."
  }
  ```
- **Response**: `201 Created` with Submission record (`status: "QUEUED"`).

### `GET /submissions/:id`
Retrieves execution status, verdict, runtime metrics, and test case results.
- **Access**: Submission Owner, `FACULTY`, `ADMIN`, `SUPER_ADMIN`
- **Response**: `200 OK`

### `GET /submissions`
Lists submissions with query filters.
- **Access**: Authenticated (Students view their own; Faculty/Admin can view all).
- **Query Parameters**: `problemId`, `contestId`, `userId`, `status`, `page`, `limit`.
- **Response**: `200 OK`
