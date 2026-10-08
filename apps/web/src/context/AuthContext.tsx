import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../lib/api";
import type { IUser, IProfile, LoginInput, RegisterInput, Role } from "@campusoj/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser extends IUser {
  profile: Pick<IProfile, "fullName" | "college" | "avatarUrl" | "bio"> | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput & { role?: "STUDENT" | "FACULTY" }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // ── Persist / clear token ──
  const storeToken = (t: string | null) => {
    setToken(t);
    if (t) {
      localStorage.setItem("token", t);
    } else {
      localStorage.removeItem("token");
    }
  };

  // ── Hydrate session on mount ──
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: AuthUser }>("/auth/me");
      setUser(res.data.data);
    } catch {
      setUser(null);
      storeToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ── Login ──
  const login = useCallback(async (input: LoginInput) => {
    const res = await api.post<{ data: AuthUser; token: string }>("/auth/login", input);
    storeToken(res.data.token);
    setUser(res.data.data);
  }, []);

  // ── Register ──
  const register = useCallback(
    async (input: RegisterInput & { role?: "STUDENT" | "FACULTY" }) => {
      const res = await api.post<{ data: AuthUser; token: string }>(
        "/auth/register",
        input
      );
      storeToken(res.data.token);
      setUser(res.data.data);
    },
    []
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      storeToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Convenience: returns the current user's role string, or null when unauthenticated. */
export function useRole(): Role | null {
  return useAuth().user?.role ?? null;
}
