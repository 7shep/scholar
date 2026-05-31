"use client";

const courses = [
  { colorClassName: "bg-emerald-500", grade: "A", name: "Biology 101", percent: 94 },
  { colorClassName: "bg-lime-400", grade: "B+", name: "Calculus II", percent: 88 },
  { colorClassName: "bg-sky-500", grade: "A-", name: "World History", percent: 91 },
  { colorClassName: "bg-indigo-500", grade: "A", name: "English Lit", percent: 96 },
  { colorClassName: "bg-amber-500", grade: "B-", name: "Chem 102", percent: 81 },
] as const;

export function CourseGrades() {
  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "340ms" }}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Course Grades
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Snapshot of your current standing.
          </p>
        </div>

        <button
          type="button"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Details
        </button>
      </div>

      <div className="space-y-5">
        {courses.map((course, index) => (
          <div key={course.name}>
            <div className="mb-2 flex items-end justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                {course.name}
              </span>
              <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900">
                {course.grade}, {course.percent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`animate-progress-grow h-full ${course.colorClassName}`}
                style={{
                  animationDelay: `${360 + index * 90}ms`,
                  width: `${course.percent}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
