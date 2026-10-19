import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@campusoj/shared";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Alert } from "../components/ui/FormElements";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-700">CampusOJ</h1>
        <p className="mt-1 text-sm text-gray-500">Competitive Programming Platform</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

        {serverError && (
          <Alert type="error" message={serverError} className="mb-5" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@university.edu"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </p>

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-2">
            Demo Accounts (password: <code className="text-brand-600 bg-gray-100 px-1 py-0.5 rounded text-[11px]">Password123!</code>):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setValue("email", "student@campusoj.edu", { shouldValidate: true });
                setValue("password", "Password123!", { shouldValidate: true });
              }}
              className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("email", "faculty@campusoj.edu", { shouldValidate: true });
                setValue("password", "Password123!", { shouldValidate: true });
              }}
              className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("email", "admin@campusoj.edu", { shouldValidate: true });
                setValue("password", "Password123!", { shouldValidate: true });
              }}
              className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
