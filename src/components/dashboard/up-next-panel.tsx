"use client";

import * as React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type Assignment = {
  course: string;
  difficulty: string;
  difficultyClassName: string;
  done: boolean;
  id: number;
  time: string;
  title: string;
};

const initialAssignments: Assignment[] = [
  {
    course: "Biology 101",
    difficulty: "Easy",
    difficultyClassName: "bg-emerald-100 text-emerald-700",
    done: true,
    id: 1,
    time: "Today, 11:59 PM",
    title: "Read Chapter 4-5",
  },
  {
    course: "Calculus II",
    difficulty: "Hard",
    difficultyClassName: "bg-rose-100 text-rose-700",
    done: false,
    id: 2,
    time: "Tomorrow, 5:00 PM",
    title: "Problem Set 3",
  },
  {
    course: "World History",
    difficulty: "Medium",
    difficultyClassName: "bg-amber-100 text-amber-700",
    done: false,
    id: 3,
    time: "Wed, 9:00 AM",
    title: "Midterm Essay Draft",
  },
  {
    course: "Biology 101",
    difficulty: "Hard",
    difficultyClassName: "bg-rose-100 text-rose-700",
    done: false,
    id: 4,
    time: "Thu, 11:59 PM",
    title: "Lab Report Analysis",
  },
  {
    course: "Chem 102",
    difficulty: "Medium",
    difficultyClassName: "bg-amber-100 text-amber-700",
    done: false,
    id: 5,
    time: "Fri, 10:00 AM",
    title: "Weekly Quiz",
  },
];

export function UpNextPanel() {
  const [assignments, setAssignments] =
    React.useState<Assignment[]>(initialAssignments);

  const toggleAssignment = React.useCallback((assignmentId: number) => {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, done: !assignment.done }
          : assignment,
      ),
    );
  }, []);

  return (
    <section
      className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: "200ms" }}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Up Next
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Prioritized work for the next few days.
          </p>
        </div>

        <button
          type="button"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className={`flex flex-col gap-3 rounded-[1.25rem] border p-4 transition sm:flex-row sm:items-center ${
              assignment.done
                ? "border-slate-100 bg-slate-50 opacity-70"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAssignment(assignment.id)}
              className="shrink-0 text-slate-300 transition hover:text-lime-500"
              aria-label={`Mark ${assignment.title} as ${
                assignment.done ? "not complete" : "complete"
              }`}
            >
              {assignment.done ? (
                <CheckCircle2 className="h-6 w-6 text-lime-500" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className={`truncate font-semibold ${
                  assignment.done
                    ? "text-slate-500 line-through"
                    : "text-slate-900"
                }`}
              >
                {assignment.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {assignment.course}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {assignment.time}
                </span>
              </div>
            </div>

            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${assignment.difficultyClassName}`}
            >
              {assignment.difficulty}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
