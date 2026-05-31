"use client";

import { BookOpen, CheckCircle2, Clock3, ListTodo } from "lucide-react";

import type { DashboardStats } from "@/components/dashboard/dashboard-data";

type StatsRowProps = {
  stats: DashboardStats;
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        style={{ animationDelay: "60ms" }}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
          <BookOpen className="h-5 w-5 text-slate-700" />
        </div>
        <p className="text-sm font-medium text-slate-500">Active Courses</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">
            {stats.activeCourses}
          </p>
          <span className="text-xs font-medium text-slate-400">tracked</span>
        </div>
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
