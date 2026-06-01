"use client";

import { Clock, Target } from "lucide-react";

import type { DashboardFocus } from "@/components/dashboard/dashboard-data";

type FocusCardProps = {
  focus: DashboardFocus | null;
};

export function FocusCard({ focus }: FocusCardProps) {
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

        {focus ? (
          <>
            <h2 className="text-3xl font-bold">{focus.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Start with the closest deadline and let the rest of the week
              organize itself around one clear next step.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-slate-800 px-3 py-1.5 font-medium text-slate-200">
                {focus.course}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {focus.dueLabel}
              </span>
              {focus.estimatedLabel ? (
                <span className="rounded-full border border-slate-700 px-3 py-1.5">
                  {focus.estimatedLabel}
                </span>
              ) : null}
              <span className="rounded-full border border-slate-700 px-3 py-1.5">
                {focus.priority} priority
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold">
              Nothing urgent is competing for your attention.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              As soon as assignments exist, this card will spotlight the best
              next task across your full workload.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
