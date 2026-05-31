"use client";

import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";

type CourseStepValues = {
  color: string;
  name: string;
  term: string;
};

type AssignmentStepValues = {
  difficulty: string;
  dueAt: string;
  estimatedMinutes: string;
  title: string;
};

type QuickAddModalProps = {
  assignmentValues: AssignmentStepValues;
  canSkipAssignment: boolean;
  courseValues: CourseStepValues;
  createdCourseName: string | null;
  errorMessage: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onAssignmentValueChange: (
    field: keyof AssignmentStepValues,
    value: string,
  ) => void;
  onClose: () => void;
  onCourseValueChange: (field: keyof CourseStepValues, value: string) => void;
  onFileChange: (file: File | null) => void;
  onPrimaryAction: () => void;
  onSkipAssignment: () => void;
  selectedFile: File | null;
  step: "course" | "assignment";
  uploadWarning: string | null;
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        {children}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
    </label>
  );
}

export function QuickAddModal({
  assignmentValues,
  canSkipAssignment,
  courseValues,
  createdCourseName,
  errorMessage,
  isOpen,
  isSubmitting,
  onAssignmentValueChange,
  onClose,
  onCourseValueChange,
  onFileChange,
  onPrimaryAction,
  onSkipAssignment,
  selectedFile,
  step,
  uploadWarning,
}: QuickAddModalProps) {
  if (!isOpen) {
    return null;
  }

  const isCourseStep = step === "course";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Quick Add
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {isCourseStep ? "Create Course" : "Add First Assignment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isCourseStep
                ? "Start with the course, then move straight into the first assignment."
                : `Now let’s make ${createdCourseName ?? "this course"} useful on the dashboard.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close quick add"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isCourseStep
                    ? "bg-slate-900 text-white"
                    : "bg-[#CCFF00] text-slate-900"
                }`}
              >
                1
              </div>
              <span className="text-sm font-semibold text-slate-700">Course</span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isCourseStep
                    ? "bg-slate-100 text-slate-400"
                    : "bg-slate-900 text-white"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-semibold ${
                  isCourseStep ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Assignment
              </span>
            </div>
          </div>

          {uploadWarning ? (
            <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{uploadWarning}</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          ) : null}

          {isCourseStep ? (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Course name</FieldLabel>
                  <input
                    type="text"
                    value={courseValues.name}
                    onChange={(event) =>
                      onCourseValueChange("name", event.target.value)
                    }
                    placeholder="Introduction to Biology"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>

                <div>
                  <FieldLabel>Term</FieldLabel>
                  <input
                    type="text"
                    value={courseValues.term}
                    onChange={(event) =>
                      onCourseValueChange("term", event.target.value)
                    }
                    placeholder="Fall 2026"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>

                <div>
                  <FieldLabel>Color</FieldLabel>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <input
                      type="color"
                      value={courseValues.color || "#ccff00"}
                      onChange={(event) =>
                        onCourseValueChange("color", event.target.value)
                      }
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={courseValues.color}
                      onChange={(event) =>
                        onCourseValueChange("color", event.target.value)
                      }
                      placeholder="#CCFF00"
                      className="w-full border-0 p-0 text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Optional syllabus upload
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Upload a `PDF` or `DOCX` now, or skip it and attach one
                      later.
                    </p>
                  </div>
                  <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-50">
                  <Upload className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedFile ? selectedFile.name : "Choose a syllabus file"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      PDF or DOCX
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) =>
                      onFileChange(event.target.files?.[0] ?? null)
                    }
                  />
                </label>

                {selectedFile ? (
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <span>{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => onFileChange(null)}
                      className="font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {createdCourseName ?? "Course"} is ready.
                    </p>
                    <p className="mt-1 text-emerald-800/90">
                      Add one assignment now so the dashboard immediately has
                      something real to show.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Assignment title</FieldLabel>
                  <input
                    type="text"
                    value={assignmentValues.title}
                    onChange={(event) =>
                      onAssignmentValueChange("title", event.target.value)
                    }
                    placeholder="Read Chapter 4"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>

                <div>
                  <FieldLabel>Due date</FieldLabel>
                  <input
                    type="datetime-local"
                    value={assignmentValues.dueAt}
                    onChange={(event) =>
                      onAssignmentValueChange("dueAt", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>

                <div>
                  <FieldLabel>Difficulty</FieldLabel>
                  <select
                    value={assignmentValues.difficulty}
                    onChange={(event) =>
                      onAssignmentValueChange("difficulty", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  >
                    <option value="">Unspecified</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Estimated minutes</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={assignmentValues.estimatedMinutes}
                    onChange={(event) =>
                      onAssignmentValueChange(
                        "estimatedMinutes",
                        event.target.value,
                      )
                    }
                    placeholder="90"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {!isCourseStep && canSkipAssignment ? (
                <button
                  type="button"
                  onClick={onSkipAssignment}
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  Done for now
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isSubmitting}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? isCourseStep
                    ? "Creating course..."
                    : "Saving assignment..."
                  : isCourseStep
                    ? "Create course"
                    : "Save assignment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
