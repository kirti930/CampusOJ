import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        You don&apos;t have permission to view this page. If you believe this is
        a mistake, please contact your administrator.
      </p>
      <div className="flex gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Sign in with another account
        </Link>
      </div>
    </div>
  );
}
