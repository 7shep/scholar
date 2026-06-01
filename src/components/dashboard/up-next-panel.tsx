"use client";

import { Circle, Clock } from "lucide-react";

import type { DashboardAssignment } from "@/components/dashboard/dashboard-data";

type UpNextPanelProps = {
  assignments: DashboardAssignment[];
};

export function UpNextPanel({ assignments }: UpNextPanelProps) {
  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "200ms" }}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Up Next</h2>
          <p className="mt-1 text-sm text-slate-500">
            Prioritized work across all of your courses.
          </p>
        </div>

        <button
          type="button"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {assignments.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No upcoming assignments yet. When coursework appears, this queue
            will keep everything in one place instead of splitting by course.
          </div>
        ) : null}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
          >
            <div className="shrink-0 text-slate-300">
              <Circle className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900">
                {assignment.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {assignment.course}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {assignment.dueLabel}
                </span>
              </div>
            </div>

            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${assignment.priorityClassName}`}
            >
              {assignment.priority}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
