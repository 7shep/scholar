"use client";

import * as React from "react";
import {
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Plus,
  X,
} from "lucide-react";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type StepCardProps = {
  cue: string;
  description: string;
  icon: React.ReactNode;
  index: string;
  title: string;
};

function StepCard({ cue, description, icon, index, title }: StepCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
              {index}
            </span>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Where to click: <span className="text-slate-900">{cue}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  React.useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      <section
        aria-labelledby="onboarding-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
        role="dialog"
      >
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(204,255,0,0.2),rgba(255,255,255,0.95))] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Getting started
              </p>
              <h2
                id="onboarding-title"
                className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              >
                Everything you need to start using Scholar
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Use this quick guide to add a class, create assignments, mark
                work complete, and keep grades current.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <StepCard
              icon={<LayoutDashboard className="h-5 w-5 text-slate-700" />}
              index="1"
              title="Start from the dashboard"
              description="The dashboard shows your current GPA, open work, due dates, and the most important items across every class."
              cue="Dashboard tab in the sidebar"
            />
            <StepCard
              icon={<Plus className="h-5 w-5 text-slate-700" />}
              index="2"
              title="Add a course"
              description="Open Add Assignment, choose the create-course path, and fill in the name, color, term, and credits for a two-semester class if needed."
              cue="Add Assignment button"
            />
            <StepCard
              icon={<CalendarCheck2 className="h-5 w-5 text-slate-700" />}
              index="3"
              title="Add an assignment"
              description="Give the assignment a title, due date, estimated time, and weight so it shows up in Up Next and the calendar."
              cue="Add Assignment flow"
            />
            <StepCard
              icon={<CheckCircle2 className="h-5 w-5 text-slate-700" />}
              index="4"
              title="Mark work complete"
              description="When you finish something, switch to Assignments and use the completion control on the row to move it out of your active queue."
              cue="Assignments tab"
            />
            <StepCard
              icon={<BarChart3 className="h-5 w-5 text-slate-700" />}
              index="5"
              title="Check grades"
              description="Use the Course Grades card or open the Grades tab to see what has a score, what is missing, and how coursework affects GPA."
              cue="Course Grades card or Grades tab"
            />
            <StepCard
              icon={<GraduationCap className="h-5 w-5 text-slate-700" />}
              index="6"
              title="Set grades"
              description="Open a graded row, pick letter or number mode, enter the score, and save it to update the course summary."
              cue="Pencil/edit control in Grades"
            />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Ready to explore?
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  You can reopen this guide later from the dashboard shell.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
