"use client";

import { CheckCircle2, Clock, Flame, TrendingUp } from "lucide-react";

export function StatsRow() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "60ms" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
            <TrendingUp className="h-5 w-5 text-slate-700" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> +0.12
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500">Current GPA</p>
        <p className="font-display mt-1 text-3xl font-bold text-slate-900">
          3.82
        </p>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
            <Clock className="h-5 w-5 text-slate-700" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Due This Week</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-display text-3xl font-bold text-slate-900">7</p>
          <span className="text-xs font-medium text-slate-400">assignments</span>
        </div>
        <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="w-[28%] bg-rose-400" title="2 hard tasks" />
          <div className="w-[43%] bg-amber-400" title="3 medium tasks" />
          <div className="w-[29%] bg-emerald-400" title="2 easy tasks" />
        </div>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "180ms" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
            <CheckCircle2 className="h-5 w-5 text-slate-700" />
          </div>

          <div className="relative h-10 w-10">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-slate-900"
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="94, 100"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Completion Rate</p>
        <p className="font-display mt-1 text-3xl font-bold text-slate-900">
          94%
        </p>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-lime-300 bg-[#CCFF00] p-5 shadow-sm"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55">
            <Flame className="h-5 w-5 text-slate-900" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-800">Study Streak</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-display text-3xl font-bold text-slate-900">12</p>
          <span className="text-sm font-bold text-slate-800">days</span>
        </div>
      </article>
    </section>
  );
}
