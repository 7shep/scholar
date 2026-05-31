"use client";

import { Clock, Target } from "lucide-react";

export function FocusCard() {
  return (
    <section
      className="animate-fade-in-up relative overflow-hidden rounded-[1.75rem] bg-slate-900 p-6 text-white shadow-sm"
      style={{ animationDelay: "260ms" }}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 text-lime-300">
          <Target className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-[0.18em]">
            This Week&apos;s Focus
          </span>
        </div>

        <h2 className="font-display text-3xl font-bold">Problem Set 3</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
          Break the toughest assignment into one clear next step before the week
          starts to feel crowded.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full bg-slate-800 px-3 py-1.5 font-medium text-slate-200">
            Calculus II
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Due in 2 days
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1.5">
            About 3 hours
          </span>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex items-center rounded-2xl bg-[#CCFF00] px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-lime-300"
        >
          Start now
        </button>
      </div>
    </section>
  );
}
