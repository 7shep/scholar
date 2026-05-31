"use client";

import { LogOut } from "lucide-react";

type HomePageProps = {
  email?: string;
  isSigningOut: boolean;
  onSignOut: () => Promise<void> | void;
};

export function HomePage({ email, isSigningOut, onSignOut }: HomePageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060816] px-6 py-10">
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur-xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
              Home
            </p>
            <h1 className="mt-4 text-5xl font-semibold text-white">
              Hello World
            </h1>
            {email ? (
              <p className="mt-4 text-base text-slate-300">
                Signed in as {email}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}
