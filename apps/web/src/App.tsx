import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { PublicOnlyRoute } from "./components/guards/PublicOnlyRoute";
import { RoleRoute } from "./components/guards/RoleRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Phase 3 Contest & Problem Features
import ContestListPage from "./features/contests/ContestListPage";
import ContestLobbyPage from "./features/contests/ContestLobbyPage";
import CreateContestPage from "./features/contests/CreateContestPage";
import ContestMonitorPage from "./features/contests/ContestMonitorPage";
import ProblemListPage from "./features/problems/ProblemListPage";
import ProblemDetailPage from "./features/problems/ProblemDetailPage";
import CreateProblemPage from "./features/problems/CreateProblemPage";
import LeaderboardPage from "./features/leaderboard/LeaderboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Public-only routes (redirect if already logged in) ── */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Public / Semi-Public Browsing (Contests, Problems & Leaderboard) ── */}
          <Route path="/contests" element={<ContestListPage />} />
          <Route path="/contests/:id" element={<ContestLobbyPage />} />
          <Route path="/contests/:id/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/contests/:id/problems/:problemId"
            element={<ProblemDetailPage />}
          />
          <Route path="/problems" element={<ProblemListPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />

          {/* ── Authenticated routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Faculty & Admin routes */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={["FACULTY", "ADMIN", "SUPER_ADMIN"]}
                />
              }
            >
              <Route
                path="/admin/contests/new"
                element={<CreateContestPage />}
              />
              <Route
                path="/admin/contests/:id/monitor"
                element={<ContestMonitorPage />}
              />
              <Route
                path="/admin/problems/new"
                element={<CreateProblemPage />}
              />
            </Route>
          </Route>

          {/* ── Error pages ── */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <div className="text-6xl mb-4">🧭</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Page Not Found
                </h1>
                <p className="text-gray-500 mb-6">
                  The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <a
                  href="/dashboard"
                  className="text-brand-600 font-medium hover:underline"
                >
                  Go to Dashboard
                </a>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
