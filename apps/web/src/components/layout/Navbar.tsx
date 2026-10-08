import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Trophy,
  Code2,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isPrivileged =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const isRouteActive = (basePath: string) => {
    if (basePath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(basePath);
  };

  const navLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: isRouteActive("/dashboard"),
    },
    {
      label: "Contests",
      path: "/contests",
      icon: <Trophy className="h-4 w-4 text-amber-400" />,
      active: isRouteActive("/contests"),
    },
    {
      label: "Problems",
      path: "/problems",
      icon: <Code2 className="h-4 w-4 text-sky-400" />,
      active: isRouteActive("/problems"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 transition-all backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 relative">
      {/* Subtle ambient light glow underneath header */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent pointer-events-none" />
      <div className="absolute -top-12 left-1/3 w-96 h-12 bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Main container: Full width with standard padding so brand hugs the left margin */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* ─── 1. Brand Logo & Main Nav (strictly pinned to the far left) ─── */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              {/* Glowing High-Tech Code Bracket SVG Emblem */}
              <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 p-[1.5px] shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors group-hover:bg-slate-900/90">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-sky-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                  >
                    <polyline points="7 8 3 12 7 16" />
                    <polyline points="17 8 21 12 17 16" />
                    <line
                      x1="14"
                      y1="4"
                      x2="10"
                      y2="20"
                      className="text-cyan-300 stroke-cyan-300"
                    />
                  </svg>
                </div>
                {/* Ambient glow behind mark */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-xl blur-sm opacity-30 group-hover:opacity-75 transition duration-300 -z-10" />
              </div>

              {/* Typography */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-100 font-extrabold tracking-tight text-lg">
                  Campus
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 font-black ml-0.5">
                    OJ
                  </span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-semibold tracking-wider">
                  PRO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                    link.active
                      ? "text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 shadow-sm shadow-sky-500/5"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ─── 2. Right-Hand Actions & Profile Area (pinned to far right) ─── */}
          <div className="flex items-center gap-3">
            {/* Privileged Shortcut Pills (Faculty / Admin) */}
            {isPrivileged && (
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-800 pr-3 mr-1">
                <Link
                  to="/admin/contests/new"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Contest
                </Link>
                <Link
                  to="/admin/problems/new"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 transition shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Problem
                </Link>
              </div>
            )}

            {/* User Profile Pill or Auth Action */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1 sm:pl-2.5 sm:pr-2 sm:py-1 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 transition-all text-left group"
                >
                  {/* User info text */}
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight max-w-[120px] truncate">
                      {user.profile?.fullName ?? user.email.split("@")[0]}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-emerald-400 uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>

                  {/* Avatar Circle with glowing gradient border */}
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-sky-500/30 ring-offset-2 ring-offset-slate-950">
                      {user.profile?.fullName?.[0]?.toUpperCase() ??
                        user.email[0].toUpperCase()}
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition-transform hidden sm:block ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu Card */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Summary Header */}
                    <div className="px-4 py-3 border-b border-slate-800/80">
                      <p className="text-sm font-semibold text-slate-100 truncate">
                        {user.profile?.fullName ?? "Competitive Programmer"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {user.role}
                        </span>
                        {user.profile?.college && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {user.profile.college}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1 text-xs">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-sky-400" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/problems"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                      >
                        <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                        Browse Problems
                      </Link>
                      <Link
                        to="/contests"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                      >
                        <Trophy className="h-3.5 w-3.5 text-amber-400" />
                        Live Contests
                      </Link>
                    </div>

                    {/* Privileged Shortcuts in Dropdown */}
                    {isPrivileged && (
                      <div className="py-1 border-t border-slate-800/80 text-xs">
                        <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Management
                        </div>
                        <Link
                          to="/admin/contests/new"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-amber-300 hover:bg-amber-500/10 transition"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
                          Create New Contest
                        </Link>
                        <Link
                          to="/admin/problems/new"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sky-300 hover:bg-sky-500/10 transition"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-sky-400" />
                          Create New Problem
                        </Link>
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="pt-1 mt-1 border-t border-slate-800/80 text-xs">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    Sign in
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-lg shadow-sm shadow-sky-500/20 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Direct Quick Logout Button (Desktop) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="hidden md:flex p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ─── 3. Mobile Navigation Drawer ─── */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Mobile Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    link.active
                      ? "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Privileged Actions on Mobile */}
            {isPrivileged && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <Link
                  to="/admin/contests/new"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Contest
                </Link>
                <Link
                  to="/admin/problems/new"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Problem
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
