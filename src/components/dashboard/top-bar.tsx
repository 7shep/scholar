"use client";

import { Bell, Plus, Search } from "lucide-react";

import {
  formatLongDate,
  getFirstName,
  getGreeting,
} from "@/components/dashboard/dashboard-utils";

type TopBarProps = {
  displayName: string;
};

export function TopBar({ displayName }: TopBarProps) {
  const today = new Date();
  const firstName = getFirstName(displayName);
  const greeting = getGreeting(today);
  const dateLabel = formatLongDate(today);

  return (
    <header className="px-4 pb-2 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
            {dateLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search assignments..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-16 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ctrl K
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-slate-900"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-[#FAFAFA] bg-rose-500" />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
