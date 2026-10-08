import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition",
            "bg-white text-slate-900 placeholder:text-slate-400 focus:text-slate-900",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-200",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Button ───────────────────────────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-400",
      secondary:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], className)}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── Alert ────────────────────────────────────────────────────────────────────
interface AlertProps {
  type: "error" | "success" | "info";
  message: string;
  className?: string;
}

export function Alert({ type, message, className }: AlertProps) {
  const styles = {
    error: "bg-red-50 border-red-300 text-red-700",
    success: "bg-green-50 border-green-300 text-green-700",
    info: "bg-blue-50 border-blue-300 text-blue-700",
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        styles[type],
        className
      )}
    >
      {message}
    </div>
  );
}
