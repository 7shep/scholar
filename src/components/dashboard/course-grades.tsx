"use client";

import { type DashboardGradesPanel } from "@/components/dashboard/dashboard-data";

type CourseGradesProps = {
  onOpenGrades: () => void;
  panel: DashboardGradesPanel;
};

export function CourseGrades({ onOpenGrades, panel }: CourseGradesProps) {
  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      style={{ animationDelay: "340ms" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Grades</h2>
        </div>

        <button
          type="button"
          onClick={onOpenGrades}
          className="text-sm font-medium text-indigo-500 transition hover:text-indigo-600"
        >
          Details
        </button>
      </div>

      {panel.items.length === 0 ? (
        <div className="mt-5 rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">
            No course grades yet.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add grades to completed assignments and this panel will turn them
            into course-level grade summaries.
          </p>
          {panel.missingGradeCount > 0 ? (
            <p className="mt-2 text-sm font-medium text-amber-700">
              {panel.missingGradeCount} completed assignment
              {panel.missingGradeCount === 1 ? "" : "s"} still need a grade.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {panel.items.map((item) => (
            <div key={item.courseId}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.courseName}
                </p>

                <span className="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {item.displayLabel}
                </span>
              </div>

              <div className="mt-2 h-1 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: item.courseColor ?? "#6366f1",
                    width: `${Math.max(4, Math.min(item.percentage, 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}

          {panel.missingGradeCount > 0 ? (
            <p className="pt-1 text-xs font-medium text-amber-700">
              {panel.missingGradeCount} completed assignment
              {panel.missingGradeCount === 1 ? "" : "s"} still need a grade.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
