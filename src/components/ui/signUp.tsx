"use client";

import * as React from "react";
import { Chrome, Rocket } from "lucide-react";

import { AuthShell } from "@/components/ui/auth-shell";

type SignUpProps = {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onClearError?: () => void;
  onSubmit?: (input: {
    email: string;
    fullName: string;
    password: string;
  }) => Promise<void> | void;
  onSwitchToSignIn?: () => void;
};

export function SignUp({
  errorMessage,
  isSubmitting = false,
  onClearError,
  onSubmit,
  onSwitchToSignIn,
}: SignUpProps) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [localError, setLocalError] = React.useState("");

  const validateEmail = (nextEmail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError("Please fill out every field.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLocalError("");
    onClearError?.();
    await onSubmit?.({ email, fullName, password });
  };

  const visibleError = localError || errorMessage || "";

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create account"
      mobileTitle="Build your semester command center."
      heroTitle="Set up a workspace that keeps every deadline moving in sync."
      heroDescription="Create your account once, then bring courses, assignments, and calendar plans into one focused flow."
      heroImageAlt="Student planning a semester"
      heroImageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
      cardIcon={<Rocket className="h-6 w-6 text-white" />}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Name</span>
          <input
            placeholder="Alex Johnson"
            type="text"
            value={fullName}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
            onChange={(event) => {
              setFullName(event.target.value);
              setLocalError("");
              onClearError?.();
            }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Email</span>
          <input
            placeholder="you@example.com"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">Password</span>
            <input
              placeholder="At least 8 characters"
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

          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">Confirm password</span>
            <input
              placeholder="Repeat password"
              type="password"
              value={confirmPassword}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setLocalError("");
                onClearError?.();
              }}
            />
          </label>
        </div>

        {visibleError ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {visibleError}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSignUp()}
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-white underline underline-offset-4"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
