import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterSchema } from "@campusoj/shared";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Alert } from "../components/ui/FormElements";

// ─── Schema ───────────────────────────────────────────────────────────────────
// Extends the shared schema with role + password confirmation, and applies a
// cross-field .superRefine() which avoids the z.output resolver type mismatch.
const RegisterFormSchema = RegisterSchema.extend({
  role: z.enum(["STUDENT", "FACULTY"]).default("STUDENT"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

const ROLE_OPTIONS = [
  { value: "STUDENT" as const, label: "Student" },
  { value: "FACULTY" as const, label: "Faculty / Teaching Assistant" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<RegisterFormValues, any, RegisterFormValues>({
    // zodResolver's generic doesn't align with superRefine output; cast is safe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(RegisterFormSchema) as any,
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setServerError(null);
    const { confirmPassword: _skip, ...payload } = data;
    void _skip;
    try {
      await authRegister(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-700">CampusOJ</h1>
        <p className="mt-1 text-sm text-gray-500">Competitive Programming Platform</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h2>

        {serverError && (
          <Alert type="error" message={serverError} className="mb-5" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Alice Turing"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            id="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="alice@university.edu"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="college"
            label="College / Department"
            placeholder="School of Engineering"
            error={errors.college?.message}
            {...register("college")}
          />

          {/* Role selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              I am a…
            </label>
            <select
              id="role"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              {...register("role")}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <Input
            id="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <p className="text-xs text-gray-400">
            Admin and Super Admin accounts can only be created by existing administrators.
          </p>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
