"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  Building2
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return false;
    }
    return true;
  };

  const executeServerLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setErrorMessage(result.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        setActiveButton(null);
        return;
      }

      // Hard redirect to dashboard: forces clean browser session and purges Next.js router cache
      window.location.href = redirectedFrom || "/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during authentication.";
      setErrorMessage(msg);
      setLoading(false);
      setActiveButton(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActiveButton("form");
    await executeServerLogin(email.trim(), password);
  };

  const handleDirectLogin = async (tenantEmail: string, tenantPass: string, tenantKey: string) => {
    setEmail(tenantEmail);
    setPassword(tenantPass);
    setActiveButton(tenantKey);
    await executeServerLogin(tenantEmail, tenantPass);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 md:p-9 transition-all">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-3">
          <Image
            src="/logo.svg"
            alt="Insigra Reports Logo"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Insigra Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Marketing Analytics Platform
        </p>
      </div>

      {/* Redirect warning if arriving from protected route */}
      {redirectedFrom && (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Please sign in to access your dashboard.</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div 
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <div>
          <label 
            htmlFor="email" 
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alpha@test.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="login-submit-button"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium text-xs rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
        >
          {loading && activeButton === "form" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 1-Click Direct Test Logins */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          1-Click Test Access
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDirectLogin("alpha@test.com", "AlphaTest2026!", "alpha")}
            className="p-3 text-left border border-purple-200 bg-purple-50/80 hover:bg-purple-100 rounded-xl transition cursor-pointer disabled:opacity-60 flex flex-col justify-between group"
          >
            <div className="font-bold text-purple-900 group-hover:text-purple-950 flex items-center justify-between">
              <span>Alpha Ltd</span>
              {loading && activeButton === "alpha" ? (
                <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3 text-purple-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="text-purple-700/70 font-mono text-[10px] truncate mt-1">alpha@test.com</div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDirectLogin("beta@test.com", "BetaTest2026!", "beta")}
            className="p-3 text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-60 flex flex-col justify-between group"
          >
            <div className="font-bold text-slate-900 group-hover:text-black flex items-center justify-between">
              <span>Beta Ltd</span>
              {loading && activeButton === "beta" ? (
                <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3 text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="text-slate-500 font-mono text-[10px] truncate mt-1">beta@test.com</div>
          </button>
        </div>
      </div>
    </div>
  );
}
