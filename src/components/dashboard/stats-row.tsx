"use client";

import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Minus,
  TrendingUp,
} from "lucide-react";

import type { DashboardStats } from "@/components/dashboard/dashboard-data";

type StatsRowProps = {
  stats: DashboardStats;
};

export function StatsRow({ stats }: StatsRowProps) {
  const gpaDeltaLabel =
    stats.gpaDelta == null
      ? null
      : `${stats.gpaDelta >= 0 ? "+" : ""}${stats.gpaDelta.toFixed(2)}`;
  const gpaValue =
    stats.currentGpa == null ? "--" : stats.currentGpa.toFixed(2);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
            <TrendingUp className="h-5 w-5 text-slate-700" />
          </div>

          {gpaDeltaLabel ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                stats.gpaDelta != null && stats.gpaDelta < 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {stats.gpaDelta != null && stats.gpaDelta < 0 ? (
                <Minus className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {gpaDeltaLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-8 text-sm font-medium text-slate-500">Current GPA</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{gpaValue}</p>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
          <ListTodo className="h-5 w-5 text-slate-700" />
        </div>
        <p className="text-sm font-medium text-slate-500">Open Assignments</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">
            {stats.openAssignments}
          </p>
          <span className="text-xs font-medium text-slate-400">remaining</span>
        </div>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "180ms" }}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
          <Clock3 className="h-5 w-5 text-slate-700" />
        </div>
        <p className="text-sm font-medium text-slate-500">Due This Week</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">
            {stats.dueThisWeek}
          </p>
          <span className="text-xs font-medium text-slate-400">deadlines</span>
        </div>
      </article>

      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-lime-300 bg-[#CCFF00] p-5 shadow-sm"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55">
          <CheckCircle2 className="h-5 w-5 text-slate-900" />
        </div>
        <p className="text-sm font-medium text-slate-800">Completion Rate</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">
            {stats.completionRate}%
          </p>
          <span className="text-xs font-medium text-slate-700">
            {stats.completedAssignments} done
          </span>
        </div>
      </article>
    </section>
  );
}
