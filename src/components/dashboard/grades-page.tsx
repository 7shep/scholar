"use client";

import * as React from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  CircleAlert,
  ListChecks,
  PencilLine,
  Search,
  Save,
} from "lucide-react";

import {
  buildGradesViewModel,
  type AssignmentRow,
  type GradesListItem,
  type GradesStatusFilter,
  type CourseRow,
  type DashboardStatus,
  type UpdateAssignmentGradeInput,
} from "@/components/dashboard/dashboard-data";

type GradesPageProps = {
  assignments: AssignmentRow[];
  error: string | null;
  onReload: () => Promise<void>;
  onSaveAssignmentGrade: (input: UpdateAssignmentGradeInput) => Promise<void>;
  rawCourses: CourseRow[];
  status: DashboardStatus;
};

const FILTERS: { key: GradesStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "graded", label: "Graded" },
  { key: "ungraded", label: "Ungraded" },
];

const LETTER_GRADE_OPTIONS = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
];

function GradesLoadingState() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`grades-skeleton-card-${index}`}
            className="h-32 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="h-11 w-60 rounded-2xl bg-slate-100" />
          <div className="h-11 w-full max-w-sm rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`grades-skeleton-chip-${index}`}
              className="h-9 w-24 rounded-full bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`grades-skeleton-row-${index}`}
            className="h-20 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

function GradesErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="animate-fade-in-up rounded-[1.75rem] border border-rose-200 bg-rose-50/80 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
        Grades unavailable
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        We couldn&apos;t load your grades workspace.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {error ?? "Something went wrong while loading your completed assignments."}
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

function GradesSummaryCard({
  accent,
  caption,
  icon,
  label,
  value,
}: {
  accent?: "warning";
  caption: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const accentClasses =
    accent === "warning"
      ? "border-amber-200 bg-amber-50/70"
      : "border-slate-200 bg-white";
  const iconClasses =
    accent === "warning"
      ? "border-amber-100 bg-white text-amber-500"
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
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{caption}</p>
    </article>
  );
}

function GradeRow({
  item,
  onSave,
}: {
  item: GradesListItem;
  onSave: (input: UpdateAssignmentGradeInput) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = React.useState(!item.isGraded);
  const [gradeType, setGradeType] = React.useState<"letter" | "number">(
    item.gradeType ?? "number",
  );
  const [gradeNumberValue, setGradeNumberValue] = React.useState(
    item.gradeNumber != null ? `${item.gradeNumber}` : "",
  );
  const [gradeLetterValue, setGradeLetterValue] = React.useState(
    item.gradeLetter ?? LETTER_GRADE_OPTIONS[0],
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsEditing(!item.isGraded);
    setGradeType(item.gradeType ?? "number");
    setGradeNumberValue(item.gradeNumber != null ? `${item.gradeNumber}` : "");
    setGradeLetterValue(item.gradeLetter ?? LETTER_GRADE_OPTIONS[0]);
    setError(null);
  }, [item]);

  const parsedGradeNumber = React.useMemo(() => {
    const trimmed = gradeNumberValue.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const nextValue = Number(trimmed);
    return Number.isFinite(nextValue) ? nextValue : null;
  }, [gradeNumberValue]);

  const canSave =
    gradeType === "number"
      ? parsedGradeNumber != null
      : gradeLetterValue.trim().length > 0;

  const handleSave = React.useCallback(async () => {
    if (!canSave) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setFeedback(null);
      await onSave({
        assignmentId: item.id,
        gradeLetter: gradeType === "letter" ? gradeLetterValue : null,
        gradeNumber: gradeType === "number" ? parsedGradeNumber : null,
        gradeType,
      });
      setFeedback("Grade saved");
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save grade.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    gradeLetterValue,
    gradeType,
    item.id,
    onSave,
    parsedGradeNumber,
  ]);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {item.title}
            </h2>
            {!item.isGraded ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                Needs grade
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span
              className="rounded-full px-2.5 py-1"
              style={{
                backgroundColor: item.courseColor ? `${item.courseColor}20` : "#f1f5f9",
                color: "#475569",
              }}
            >
              {item.course}
            </span>
            <span>{item.completedLabel}</span>
          </div>
        </div>

        {!isEditing && item.isGraded ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center rounded-xl border border-lime-200 bg-lime-50 px-3 py-2 text-sm font-semibold text-lime-700">
              Grade: {item.gradeDisplay}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[22rem]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {(["number", "letter"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGradeType(option)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      gradeType === option
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {option === "number" ? "Number" : "Letter"}
                  </button>
                ))}
              </div>

              {gradeType === "number" ? (
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={gradeNumberValue}
                  onChange={(event) => setGradeNumberValue(event.target.value)}
                  placeholder="92"
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                />
              ) : (
                <select
                  value={gradeLetterValue}
                  onChange={(event) => setGradeLetterValue(event.target.value)}
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                >
                  {LETTER_GRADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!canSave || isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>

            {feedback ? (
              <p className="text-xs font-medium text-emerald-600">{feedback}</p>
            ) : null}
            {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
          </div>
        )}
      </div>
    </article>
  );
}

export function GradesPage({
  assignments,
  error,
  onReload,
  onSaveAssignmentGrade,
  rawCourses,
  status,
}: GradesPageProps) {
  const [activeFilter, setActiveFilter] =
    React.useState<GradesStatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [selectedCourseId, setSelectedCourseId] = React.useState("all");

  const viewModel = React.useMemo(
    () =>
      buildGradesViewModel(rawCourses, assignments, {
        courseId: selectedCourseId,
        query: deferredSearchQuery,
        status: activeFilter,
    }),
    [activeFilter, assignments, deferredSearchQuery, rawCourses, selectedCourseId],
  );

  React.useEffect(() => {
    if (
      selectedCourseId !== "all" &&
      !rawCourses.some((course) => course.id === selectedCourseId)
    ) {
      setSelectedCourseId("all");
    }
  }, [rawCourses, selectedCourseId]);

  const renderHeader = () => (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Grades
      </h1>
      <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
        Track grades for your completed assignments. Enter a numeric or letter
        grade for each one as you get it back.
      </p>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="space-y-6">
        {renderHeader()}
        <GradesLoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        {renderHeader()}
        <GradesErrorState error={error} onRetry={onReload} />
      </div>
    );
  }

  const showEmptyState = viewModel.items.length === 0;
  const hasNoCompletedAssignments = viewModel.completedCount === 0;

  return (
    <div className="space-y-6">
      {renderHeader()}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GradesSummaryCard
          caption="assignments"
          icon={<ListChecks className="h-5 w-5" />}
          label="Completed"
          value={viewModel.completedCount}
        />
        <GradesSummaryCard
          caption={
            viewModel.completedCount === 0
              ? "nothing logged yet"
              : `${Math.round((viewModel.gradedCount / viewModel.completedCount) * 100)}% logged`
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Graded"
          value={viewModel.gradedCount}
        />
        <GradesSummaryCard
          accent="warning"
          caption="needs entry"
          icon={<CircleAlert className="h-5 w-5" />}
          label="Missing a grade"
          value={viewModel.missingGradeCount}
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
                placeholder="Search assignments..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
              />
            </label>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              Most recent
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
            </button>
          ))}
        </div>
      </section>

      {showEmptyState ? (
        <section className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {hasNoCompletedAssignments ? "No completed work yet" : "Nothing to show"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {hasNoCompletedAssignments
              ? "This page fills in after assignments are completed."
              : "Your current filters are clear."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {viewModel.emptyMessage}
          </p>
          {!hasNoCompletedAssignments ? (
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
                setSelectedCourseId("all");
              }}
              className="mt-6 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset filters
            </button>
          ) : null}
        </section>
      ) : (
        <div className="space-y-3">
          {viewModel.items.map((item) => (
            <GradeRow
              key={item.id}
              item={item}
              onSave={onSaveAssignmentGrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
