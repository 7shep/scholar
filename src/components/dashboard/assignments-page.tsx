"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowUpDown,
  CalendarDays,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Clock3,
  ListChecks,
  Plus,
  Search,
} from "lucide-react";

import {
  buildAssignmentsViewModel,
  type AssignmentRow,
  type AssignmentsStatusFilter,
  type CourseRow,
  type DashboardStatus,
} from "@/components/dashboard/dashboard-data";
import { debugLog } from "@/lib/debug-log";

type AssignmentsPageProps = {
  assignments: AssignmentRow[];
  error: string | null;
  onOpenAddAssignment: () => void;
  onReload: () => Promise<void>;
  onToggleAssignmentStatus: (
    assignmentId: string,
    isCompleted: boolean,
  ) => Promise<void>;
  rawCourses: CourseRow[];
  status: DashboardStatus;
};

const FILTERS: { key: AssignmentsStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

function formatItemCount(count: number) {
  return `${count} item${count === 1 ? "" : "s"}`;
}

function formatWeightPercent(weightPercent: number | null) {
  if (weightPercent == null || Number.isNaN(weightPercent) || weightPercent <= 0) {
    return null;
  }

  return `${weightPercent}%`;
}

function getWeightBadgeClassName(weightPercent: number | null) {
  if (weightPercent == null || Number.isNaN(weightPercent) || weightPercent <= 0) {
    return null;
  }

  if (weightPercent >= 30) {
    return "bg-rose-100 text-rose-700";
  }

  if (weightPercent >= 15) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

function AssignmentsLoadingState() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-48 rounded-2xl bg-slate-200" />
          <div className="h-4 w-32 rounded-full bg-slate-100" />
        </div>
        <div className="h-12 w-40 rounded-2xl bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`assignments-skeleton-card-${index}`}
            className="h-36 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-11 rounded-2xl bg-slate-100" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`assignments-skeleton-chip-${index}`}
              className="h-9 w-24 rounded-full bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`assignments-skeleton-row-${index}`}
            className="h-20 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

function AssignmentsErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="animate-fade-in-up rounded-[1.75rem] border border-rose-200 bg-rose-50/80 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
        Assignments unavailable
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        We couldn&apos;t load your assignments right now.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {error ?? "Something went wrong while loading your assignments."}
      </p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Try again
      </button>
    </section>
  );
}

function AssignmentsSummaryCard({
  accent,
  caption,
  icon,
  label,
  value,
}: {
  accent?: "danger";
  caption: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const accentClasses =
    accent === "danger"
      ? "border-rose-200 bg-rose-50/60"
      : "border-slate-200 bg-white";
  const iconClasses =
    accent === "danger"
      ? "border-rose-100 bg-white text-rose-500"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <article
      className={`animate-fade-in-up rounded-[1.75rem] border p-5 shadow-sm ${accentClasses}`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${iconClasses}`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-400">{caption}</p>
    </article>
  );
}

export function AssignmentsPage({
  assignments,
  error,
  onOpenAddAssignment,
  onReload,
  onToggleAssignmentStatus,
  rawCourses,
  status,
}: AssignmentsPageProps) {
  const [activeFilter, setActiveFilter] =
    React.useState<AssignmentsStatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [selectedCourseId, setSelectedCourseId] = React.useState("all");
  const [pendingAssignmentId, setPendingAssignmentId] = React.useState<
    string | null
  >(null);

  const viewModel = React.useMemo(
    () =>
      buildAssignmentsViewModel(rawCourses, assignments, {
        courseId: selectedCourseId,
        query: deferredSearchQuery,
        status: activeFilter,
      }),
    [activeFilter, assignments, deferredSearchQuery, rawCourses, selectedCourseId],
  );

  React.useEffect(() => {
    debugLog("assignments-page", "Assignments available to render", {
      status,
      totalAssignments: assignments.length,
      courses: rawCourses.length,
      activeFilter,
      selectedCourseId,
      visibleSections: viewModel.sections.map((section) => ({
        section: section.id,
        items: section.itemCount,
      })),
    });
  }, [
    activeFilter,
    assignments,
    rawCourses,
    selectedCourseId,
    status,
    viewModel,
  ]);

  const handleToggleStatus = React.useCallback(
    async (assignmentId: string, isCompleted: boolean) => {
      try {
        setPendingAssignmentId(assignmentId);
        await onToggleAssignmentStatus(assignmentId, isCompleted);
      } finally {
        setPendingAssignmentId(null);
      }
    },
    [onToggleAssignmentStatus],
  );

  const renderHeader = () => (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
          {viewModel.openCount} open · {viewModel.completedCount} completed
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenAddAssignment}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Add Assignment
      </button>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="space-y-6">
        {renderHeader()}
        <AssignmentsLoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        {renderHeader()}
        <AssignmentsErrorState error={error} onRetry={onReload} />
      </div>
    );
  }

  const isZeroData = status === "empty";
  const showEmptyState = isZeroData || viewModel.sections.length === 0;
  const showCaughtUpMessage =
    !isZeroData &&
    (activeFilter === "all" ||
      activeFilter === "upcoming" ||
      activeFilter === "overdue") &&
    selectedCourseId === "all" &&
    deferredSearchQuery.trim().length === 0 &&
    viewModel.sections.length === 0;

  return (
    <div className="space-y-6">
      {renderHeader()}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AssignmentsSummaryCard
          caption="this semester"
          icon={<ListChecks className="h-5 w-5" />}
          label="Total"
          value={viewModel.totalCount}
        />
        <AssignmentsSummaryCard
          caption={
            viewModel.totalCount === 0
              ? "nothing completed yet"
              : `${Math.round((viewModel.completedCount / viewModel.totalCount) * 100)}% done`
          }
          icon={<CircleCheckBig className="h-5 w-5" />}
          label="Completed"
          value={viewModel.completedCount}
        />
        <AssignmentsSummaryCard
          caption="next 7 days"
          icon={<CalendarDays className="h-5 w-5" />}
          label="Due This Week"
          value={viewModel.dueThisWeekCount}
        />
        <AssignmentsSummaryCard
          accent="danger"
          caption="needs attention"
          icon={<AlertCircle className="h-5 w-5" />}
          label="Overdue"
          value={viewModel.overdueCount}
        />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
              />
            </label>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              Due date
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {viewModel.courseChips.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                selectedCourseId === course.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {course.color ? (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
              ) : null}
              {course.label}
              <span
                className={
                  selectedCourseId === course.id ? "text-white/70" : "text-slate-400"
                }
              >
                {course.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {showCaughtUpMessage ? (
        <p className="animate-fade-in-up px-2 text-base font-medium text-slate-500">
          Nothing to show here, you&apos;re all caught up!
        </p>
      ) : null}

      {showEmptyState && !showCaughtUpMessage ? (
        <section className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {isZeroData ? "Start here" : "Nothing to show"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {isZeroData
              ? "Your assignments workspace is ready."
              : "Your current filters are clear."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {viewModel.emptyMessage}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenAddAssignment}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Assignment
            </button>
            {!isZeroData ? (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                  setSelectedCourseId("all");
                }}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {!showEmptyState ? (
        <div className="space-y-5">
          {viewModel.sections.map((section) => (
            <section key={section.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">
                  {section.label}
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {formatItemCount(section.itemCount)}
                </span>
              </div>

              <div className="space-y-3">
                {section.items.map((assignment) => {
                  const isPending = pendingAssignmentId === assignment.id;
                  const weightLabel = formatWeightPercent(assignment.weightPercent);
                  const weightBadgeClassName = getWeightBadgeClassName(
                    assignment.weightPercent,
                  );

                  return (
                    <article
                      key={assignment.id}
                      className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void handleToggleStatus(
                            assignment.id,
                            !assignment.isCompleted,
                          )
                        }
                        disabled={isPending}
                        className="shrink-0 text-slate-300 transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={
                          assignment.isCompleted
                            ? `Mark ${assignment.title} as open`
                            : `Mark ${assignment.title} as completed`
                        }
                      >
                        {assignment.isCompleted ? (
                          <CircleCheckBig className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Circle
                            className={`h-6 w-6 ${
                              assignment.isOverdue
                                ? "text-rose-400"
                                : "text-slate-300"
                            }`}
                          />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {assignment.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span
                            className="rounded-full px-2.5 py-1"
                            style={{
                              backgroundColor: assignment.courseColor
                                ? `${assignment.courseColor}20`
                                : "#f1f5f9",
                              color: "#475569",
                            }}
                          >
                            {assignment.course}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {assignment.dueLabel}
                          </span>
                          {weightLabel && weightBadgeClassName ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 ${weightBadgeClassName}`}
                            >
                              Weight {weightLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-300">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
