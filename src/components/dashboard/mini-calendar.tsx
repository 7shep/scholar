"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatMonthLabel } from "@/components/dashboard/dashboard-utils";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"] as const;
const dotPattern = [2, 1, 3, 1, 0, 0, 0] as const;
const upcomingEvents = [
  { time: "10:00 AM", title: "Calculus Lecture", type: "Class" },
  { time: "2:00 PM", title: "Study Group", type: "Personal" },
  { time: "5:00 PM", title: "Problem Set 3 Due", type: "Deadline" },
] as const;

function getWeekStart(currentDate: Date) {
  const weekStart = new Date(currentDate);
  const weekday = weekStart.getDay();
  const shift = weekday === 0 ? -6 : 1 - weekday;

  weekStart.setDate(weekStart.getDate() + shift);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function MiniCalendar() {
  const currentDate = React.useMemo(() => new Date(), []);
  const dates = React.useMemo(() => {
    const weekStart = getWeekStart(currentDate);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        active: isSameDate(date, currentDate),
        dateNumber: date.getDate(),
        dots: dotPattern[index],
      };
    });
  }, [currentDate]);

  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "280ms" }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900">
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

      <div className="mb-6 grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="mb-2 text-center text-xs font-semibold text-slate-400"
          >
            {day}
          </div>
        ))}

        {dates.map((date) => (
          <div key={date.dateNumber} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                date.active
                  ? "bg-slate-900 text-white"
                  : "cursor-pointer text-slate-700 hover:bg-slate-50"
              }`}
            >
              {date.dateNumber}
            </div>
            <div className="flex h-1 gap-1">
              {Array.from({ length: date.dots }).map((_, index) => (
                <span
                  key={`${date.dateNumber}-dot-${index}`}
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
        {upcomingEvents.map((event) => (
          <div key={event.title} className="flex items-start gap-3">
            <div className="w-16 shrink-0 pt-0.5 text-xs font-semibold text-slate-500">
              {event.time}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {event.title}
              </div>
              <div className="text-xs text-slate-400">{event.type}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
