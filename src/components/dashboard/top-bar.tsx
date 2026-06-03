"use client";

import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";

import {
  formatLongDate,
  getFirstName,
  getGreeting,
} from "@/components/dashboard/dashboard-utils";

type TopBarProps = {
  displayName: string;
  onQuickAdd?: () => void;
  onActivateSearch?: (options?: {
    query?: string;
    selectText?: boolean;
  }) => void;
  onSearchQueryChange?: (query: string) => void;
  searchQuery?: string;
};

function isPlainTextEntryKey(event: KeyboardEvent<HTMLInputElement>) {
  return (
    event.key.length === 1 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}

function getNextSearchValue(
  input: HTMLInputElement,
  nextText: string,
  fallbackValue: string,
) {
  const selectionStart = input.selectionStart ?? fallbackValue.length;
  const selectionEnd = input.selectionEnd ?? fallbackValue.length;

  return `${fallbackValue.slice(0, selectionStart)}${nextText}${fallbackValue.slice(selectionEnd)}`;
}

export function TopBar({
  displayName,
  onActivateSearch,
  onQuickAdd,
  onSearchQueryChange,
  searchQuery = "",
}: TopBarProps) {
  const today = new Date();
  const firstName = getFirstName(displayName);
  const greeting = getGreeting(today);
  const dateLabel = formatLongDate(today);

  return (
    <header className="px-4 pb-2 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
            {dateLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onQuickAdd ? (
            <button
              type="button"
              onClick={onQuickAdd}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Assignment
            </button>
          ) : null}

          <label className="relative block min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange?.(event.target.value)}
              onFocus={() => onActivateSearch?.({ selectText: false })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onActivateSearch?.({ selectText: false });
                  return;
                }

                if (!isPlainTextEntryKey(event)) {
                  return;
                }

                const nextQuery = getNextSearchValue(
                  event.currentTarget,
                  event.key,
                  searchQuery,
                );

                event.preventDefault();
                onSearchQueryChange?.(nextQuery);
                onActivateSearch?.({
                  query: nextQuery,
                  selectText: false,
                });
              }}
              placeholder="Search assignments..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-16 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ctrl K
            </span>
          </label>
        </div>
      </div>
    </header>
  );
}
