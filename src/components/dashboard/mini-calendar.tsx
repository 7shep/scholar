"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type {
  DashboardCalendarDay,
  DashboardCalendarItem,
} from "@/components/dashboard/dashboard-data";
import { formatMonthLabel } from "@/components/dashboard/dashboard-utils";

type MiniCalendarProps = {
  dates: DashboardCalendarDay[];
  schedule: DashboardCalendarItem[];
};

export function MiniCalendar({ dates, schedule }: MiniCalendarProps) {
  const currentDate = new Date();

  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "280ms" }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {formatMonthLabel(currentDate)}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
          <div
            key={day}
            className="mb-2 text-center text-xs font-semibold text-slate-400"
          >
            {day}
          </div>
        ))}

        {dates.map((date) => (
          <div key={date.key} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                date.active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {date.dateNumber}
            </div>
            <div className="flex h-1 gap-1">
              {Array.from({ length: date.dots }).map((_, index) => (
                <span
                  key={`${date.key}-dot-${index}`}
                  className={`h-1 w-1 rounded-full ${
                    date.active ? "bg-[#CCFF00]" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        {schedule.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Upcoming assignment deadlines will appear here once they exist.
          </div>
        ) : null}

        {schedule.map((item) => (
          <div key={`${item.title}-${item.timeLabel}`} className="flex items-start gap-3">
            <div className="w-16 shrink-0 pt-0.5 text-xs font-semibold text-slate-500">
              {item.timeLabel}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {item.title}
              </div>
              <div className="text-xs text-slate-400">
                {item.typeLabel} · {item.course}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
