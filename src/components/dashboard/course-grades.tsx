"use client";

export function CourseGrades() {
  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "340ms" }}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">Grades Coming Later</h2>
        <p className="mt-1 text-sm text-slate-500">
          Phase 1 is focused on assignments, deadlines, and workload clarity.
        </p>
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-900">
          This space is intentionally deferred.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Once the app has a real grades model, this panel can show course
          standing, GPA trends, and breakdowns without mixing mock numbers into
          your live dashboard.
        </p>
      </div>
    </section>
  );
}
