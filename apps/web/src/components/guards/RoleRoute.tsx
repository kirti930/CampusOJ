import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "@campusoj/shared";

interface RoleRouteProps {
  /** At least one of these roles is required to enter the route. */
  allowedRoles: Role[];
  /** Where to send users who don't have the required role (default: "/unauthorized"). */
  redirectTo?: string;
}

/**
 * Wraps routes that require a specific role (or set of roles).
 * Must be nested inside <ProtectedRoute> — assumes the user is already authenticated.
 */
export function RoleRoute({ allowedRoles, redirectTo = "/unauthorized" }: RoleRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
