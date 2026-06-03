"use client";

import * as React from "react";
import {
  BarChart3,
  Check,
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { ScholarMark } from "@/components/brand/scholar-mark";
import type { SemesterOption } from "@/components/dashboard/semester-utils";

type SidebarProps = {
  activeView: "assignments" | "dashboard" | "grades";
  isSigningOut: boolean;
  onNavigate: (view: "assignments" | "dashboard" | "grades") => void;
  onSelectSemester: (semesterId: string) => void;
  onSignOut: () => Promise<void> | void;
  onToggleTheme: () => void;
  selectedSemesterId: string;
  selectedSemesterLabel: string;
  semesterOptions: SemesterOption[];
  theme: "dark" | "light";
};

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: CheckSquare, label: "Assignments", view: "assignments" },
  { icon: BarChart3, label: "Grades", view: "grades" },
] as const;

function SemesterSelector({
  onSelectSemester,
  selectedSemesterId,
  selectedSemesterLabel,
  semesterOptions,
}: Pick<
  SidebarProps,
  "onSelectSemester" | "selectedSemesterId" | "selectedSemesterLabel" | "semesterOptions"
>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="inline-flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="truncate">{selectedSemesterLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 top-full z-20 mt-2 min-w-[15rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          role="menu"
        >
          {semesterOptions.map((option) => {
            const isSelected = option.id === selectedSemesterId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelectSemester(option.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
                role="menuitemradio"
                aria-checked={isSelected}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  activeView,
  isSigningOut,
  onNavigate,
  onSelectSemester,
  onSignOut,
  onToggleTheme,
  selectedSemesterId,
  selectedSemesterLabel,
  semesterOptions,
  theme,
}: SidebarProps) {
  const ThemeIcon = theme === "light" ? Sun : Moon;
  const semesterSelectorProps = {
    onSelectSemester,
    selectedSemesterId,
    selectedSemesterLabel,
    semesterOptions,
  };

  return (
    <aside className="border-b border-slate-200 bg-white/95 backdrop-blur lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
            <div className="flex items-center gap-3">
              <ScholarMark />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Scholar, by Alex
                </h2>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:mt-5 lg:inline-flex">
              <SemesterSelector {...semesterSelectorProps} />
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-slate-100"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <ThemeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 lg:hidden">
            <div className="min-w-0 flex-1">
              <SemesterSelector {...semesterSelectorProps} />
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-slate-100"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if ("view" in item) {
                    onNavigate(item.view);
                  }
                }}
                className={`inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  "view" in item && activeView === item.view
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {/* <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button> */}

            <button
              type="button"
              onClick={() => void onSignOut()}
              disabled={isSigningOut}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
