"use client";

import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  Layers,
  LogOut,
  Calculator,
  Settings,
} from "lucide-react";

import {
  getAcademicTermLabel,
  getInitials,
} from "@/components/dashboard/dashboard-utils";

type SidebarProps = {
  displayName: string;
  email?: string;
  isSigningOut: boolean;
  onSignOut: () => Promise<void> | void;
};

const navigationItems = [
  { icon: LayoutDashboard, isActive: true, label: "Dashboard" },
  { icon: CheckSquare, isActive: false, label: "Assignments" },
  { icon: BarChart3, isActive: false, label: "Grades" },
  { icon: Calendar, isActive: false, label: "Calendar" },
  { icon: Calculator, isActive: false, label: "Calculator" },
  { icon: Layers, isActive: false, label: "Flashcards" },
] as const;

export function Sidebar({
  displayName,
  email,
  isSigningOut,
  onSignOut,
}: SidebarProps) {
  const initials = getInitials(displayName);
  const semesterLabel = getAcademicTermLabel();

  return (
    <aside className="border-b border-slate-200 bg-white/95 backdrop-blur lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#CCFF00] p-2 text-slate-900 shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
                  Scholar
                </h2>
              </div>
            </div>

            <button
              type="button"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 lg:mt-5 lg:inline-flex"
            >
              {semesterLabel}
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 lg:hidden"
          >
            {semesterLabel}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  item.isActive
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
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {email ?? "student@school.edu"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

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
