"use client";

import * as React from "react";
import { Chrome, GraduationCap } from "lucide-react";

import { AuthShell } from "@/components/ui/auth-shell";

type SignInProps = {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onClearError?: () => void;
  onSubmit?: (input: { email: string; password: string }) => Promise<void> | void;
  onSwitchToSignUp?: () => void;
};

export function SignIn({
  errorMessage,
  isSubmitting = false,
  onClearError,
  onSubmit,
  onSwitchToSignUp,
}: SignInProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState("");

  const validateEmail = (nextEmail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setLocalError("");
    onClearError?.();
    await onSubmit?.({ email, password });
  };

  const visibleError = localError || errorMessage || "";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      mobileTitle="Organize the semester from one home base."
      heroTitle="Turn syllabi, grades, and deadlines into one focused rhythm."
      heroDescription="Scan course plans, track progress, and sync the semester without losing your weekends to scattered tabs."
      heroImageAlt="Student workspace"
      heroImageUrl="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80"
      cardIcon={<GraduationCap className="h-6 w-6 text-white" />}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Email</span>
          <input
            placeholder="you@school.edu"
            type="email"
            value={email}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
            onChange={(event) => {
              setEmail(event.target.value);
              setLocalError("");
              onClearError?.();
            }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Password</span>
          <input
            placeholder="Enter your password"
            type="password"
            value={password}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
            onChange={(event) => {
              setPassword(event.target.value);
              setLocalError("");
              onClearError?.();
            }}
          />
        </label>

        {visibleError ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {visibleError}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-transparent px-3 text-xs uppercase tracking-[0.25em] text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <button className="flex items-center justify-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          <Chrome className="h-5 w-5 text-cyan-200" />
          Google
        </button>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-white underline underline-offset-4"
          >
            Create one
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
