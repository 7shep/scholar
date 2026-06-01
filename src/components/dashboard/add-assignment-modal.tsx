"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CalendarDays,
  Check,
  FileUp,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  bulkCreateAssignments,
  createAssignment,
  createCourse,
  type DashboardCourseOption,
  uploadCourseSyllabus,
} from "@/components/dashboard/dashboard-data";
import {
  extractSyllabusCandidates,
  type SyllabusAssignmentCandidate,
} from "@/components/dashboard/syllabus-parser";
import { debugLog, debugTable } from "@/lib/debug-log";

type AddAssignmentModalProps = {
  courses: DashboardCourseOption[];
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => Promise<void>;
  userId: string;
};

type ModalStep =
  | "chooser"
  | "manual"
  | "syllabus-upload"
  | "syllabus-review";

type ManualFormState = {
  difficulty: string;
  dueAt: string;
  estimatedMinutes: string;
  title: string;
  weightPercent: string;
};

type CourseFormState = {
  color: string;
  name: string;
  term: string;
};

type EditableCandidate = {
  confidence: number | null;
  dueAt: string;
  id: string;
  title: string;
  type: string | null;
  weightPercent: string;
};

const NEW_COURSE_VALUE = "__new_course__";
const INITIAL_MANUAL_FORM: ManualFormState = {
  difficulty: "",
  dueAt: "",
  estimatedMinutes: "",
  title: "",
  weightPercent: "",
};
const INITIAL_COURSE_FORM: CourseFormState = {
  color: "#CCFF00",
  name: "",
  term: "",
};

function isRlsPolicyError(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const message = (error as { message?: unknown }).message;

  return (
    typeof message === "string" &&
    message.toLowerCase().includes("row-level security")
  );
}

function getSyllabusUploadWarning(error: unknown) {
  if (isRlsPolicyError(error)) {
    return "We couldn't save the syllabus file to Supabase storage because the current storage RLS policy is rejecting it, but you can still review and import assignments from this local file.";
  }

  return `We couldn't save the syllabus file for later access, but you can still review and import assignments from this local file: ${getErrorMessage(
    error,
  )}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

function toIsoDateTime(dateTimeLocal: string) {
  if (!dateTimeLocal) {
    return null;
  }

  const parsed = new Date(dateTimeLocal);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toDateTimeLocalValue(isoDateTime: string | null) {
  if (!isoDateTime) {
    return "";
  }

  const parsed = new Date(isoDateTime);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const hours = `${parsed.getHours()}`.padStart(2, "0");
  const minutes = `${parsed.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toWeightPercentValue(weightPercent: number | null | undefined) {
  if (weightPercent == null || Number.isNaN(weightPercent) || weightPercent < 0) {
    return "";
  }

  return `${weightPercent}`;
}

function toWeightPercent(weightPercent: string) {
  if (!weightPercent.trim()) {
    return null;
  }

  const parsed = Number(weightPercent);

  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

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

export function AddAssignmentModal({
  courses,
  isOpen,
  onClose,
  onDataChanged,
  userId,
}: AddAssignmentModalProps) {
  const [step, setStep] = React.useState<ModalStep>("chooser");
  const [selectedCourseId, setSelectedCourseId] = React.useState(
    courses[0]?.id ?? NEW_COURSE_VALUE,
  );
  const [courseForm, setCourseForm] =
    React.useState<CourseFormState>(INITIAL_COURSE_FORM);
  const [manualForm, setManualForm] =
    React.useState<ManualFormState>(INITIAL_MANUAL_FORM);
  const [syllabusFile, setSyllabusFile] = React.useState<File | null>(null);
  const [reviewCandidates, setReviewCandidates] = React.useState<
    EditableCandidate[]
  >([]);
  const [resolvedCourseId, setResolvedCourseId] = React.useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep("chooser");
    setSelectedCourseId(courses[0]?.id ?? NEW_COURSE_VALUE);
    setCourseForm(INITIAL_COURSE_FORM);
    setManualForm(INITIAL_MANUAL_FORM);
    setSyllabusFile(null);
    setReviewCandidates([]);
    setResolvedCourseId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setWarningMessage(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const shouldCreateCourse =
    selectedCourseId === NEW_COURSE_VALUE || courses.length === 0;

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCourseFormChange = React.useCallback(
    (field: keyof CourseFormState, value: string) => {
      setCourseForm((current) => ({
        ...current,
        [field]: value,
      }));
      setResolvedCourseId(null);
    },
    [],
  );

  const handleManualFormChange = React.useCallback(
    (field: keyof ManualFormState, value: string) => {
      setManualForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleSelectCourse = React.useCallback((value: string) => {
    setSelectedCourseId(value);
    setResolvedCourseId(null);
    setErrorMessage(null);
  }, []);

  const resolveCourseId = React.useCallback(async () => {
    if (resolvedCourseId) {
      return resolvedCourseId;
    }

    if (!shouldCreateCourse && selectedCourseId !== NEW_COURSE_VALUE) {
      setResolvedCourseId(selectedCourseId);
      return selectedCourseId;
    }

    if (!courseForm.name.trim()) {
      throw new Error("Course name is required before continuing.");
    }

    const createdCourse = await createCourse({
      color: courseForm.color,
      name: courseForm.name,
      term: courseForm.term,
      userId,
    });

    setResolvedCourseId(createdCourse.id);
    setSelectedCourseId(createdCourse.id);
    await onDataChanged();

    return createdCourse.id;
  }, [
    courseForm.color,
    courseForm.name,
    courseForm.term,
    onDataChanged,
    resolvedCourseId,
    selectedCourseId,
    shouldCreateCourse,
    userId,
  ]);

  const handleParseCandidates = React.useCallback(
    (candidates: SyllabusAssignmentCandidate[]) => {
      const editableCandidates = candidates.map((candidate, index) => ({
        confidence: candidate.confidence ?? null,
        dueAt: toDateTimeLocalValue(candidate.dueAt),
        id: `${index}-${candidate.title}`,
        title: candidate.title,
        type: candidate.type ?? null,
        weightPercent: toWeightPercentValue(candidate.weightPercent),
      }));

      debugTable(
        "syllabus-intake",
        "Review list shown to the user",
        editableCandidates.map((candidate) => ({
          title: candidate.title,
          dueAt: candidate.dueAt || "(none)",
          weightPercent: candidate.weightPercent || "(none)",
        })),
      );

      setReviewCandidates(editableCandidates);
    },
    [],
  );

  const handleSaveManual = React.useCallback(async () => {
    if (!manualForm.title.trim()) {
      setErrorMessage("Assignment title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const courseId = await resolveCourseId();

      await createAssignment({
        courseId,
        difficulty: manualForm.difficulty,
        dueAt: toIsoDateTime(manualForm.dueAt),
        estimatedMinutes: manualForm.estimatedMinutes
          ? Number(manualForm.estimatedMinutes)
          : null,
        title: manualForm.title,
        userId,
        weightPercent: toWeightPercent(manualForm.weightPercent),
      });

      await onDataChanged();
      setSuccessMessage("Assignment added.");
      handleClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [handleClose, manualForm, onDataChanged, resolveCourseId, userId]);

  const handleUploadSyllabus = React.useCallback(async () => {
    if (!syllabusFile) {
      setErrorMessage("Choose a PDF or DOCX syllabus file to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setWarningMessage(null);

    try {
      const courseId = await resolveCourseId();
      const courseTerm = shouldCreateCourse
        ? courseForm.term.trim() || null
        : courses.find((course) => course.id === selectedCourseId)?.term ?? null;
      const candidates = await extractSyllabusCandidates(syllabusFile, {
        courseTerm,
      });

      debugTable(
        "syllabus-intake",
        "Extracted assignment candidates from syllabus",
        candidates.map((candidate) => ({
          title: candidate.title,
          dueAt: candidate.dueAt ?? "(none)",
          type: candidate.type ?? "(none)",
          confidence: candidate.confidence ?? "(none)",
          weightPercent: candidate.weightPercent ?? "(none)",
        })),
      );

      try {
        await uploadCourseSyllabus({
          courseId,
          documentType: "syllabus",
          file: syllabusFile,
          userId,
        });
      } catch (uploadError) {
        setWarningMessage(getSyllabusUploadWarning(uploadError));
      }

      handleParseCandidates(candidates);
      setResolvedCourseId(courseId);
      setStep("syllabus-review");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    courseForm.term,
    courses,
    handleParseCandidates,
    resolveCourseId,
    selectedCourseId,
    shouldCreateCourse,
    syllabusFile,
    userId,
  ]);

  const handleCreateFromReview = React.useCallback(async () => {
    const validCandidates = reviewCandidates.filter((candidate) =>
      candidate.title.trim(),
    );

    if (validCandidates.length === 0) {
      setErrorMessage("Keep at least one assignment in the review list.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const courseId = await resolveCourseId();

      const payloads = validCandidates.map((candidate) => ({
        courseId,
        dueAt: toIsoDateTime(candidate.dueAt),
        title: candidate.title,
        userId,
        weightPercent: toWeightPercent(candidate.weightPercent),
      }));

      debugTable(
        "syllabus-intake",
        "Submitting assignments to create",
        payloads.map((payload) => ({
          title: payload.title,
          dueAt: payload.dueAt ?? "(none)",
          courseId: payload.courseId,
          weightPercent: payload.weightPercent ?? "(none)",
        })),
      );

      const createdAssignments = await bulkCreateAssignments(payloads);

      debugLog(
        "syllabus-intake",
        `Created ${createdAssignments.length} assignment(s); reloading dashboard data`,
        createdAssignments,
      );

      await onDataChanged();
      setSuccessMessage(
        `${validCandidates.length} assignment${validCandidates.length === 1 ? "" : "s"} created.`,
      );
      handleClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [handleClose, onDataChanged, resolveCourseId, reviewCandidates, userId]);

  if (!isOpen) {
    return null;
  }

  const currentCourseName =
    courses.find((course) => course.id === selectedCourseId)?.name ||
    courseForm.name.trim() ||
    "this course";

  const renderCourseFields = () => (
    <div className="space-y-4">
      {courses.length > 0 ? (
        <div>
          <FieldLabel required>Course</FieldLabel>
          <select
            value={selectedCourseId}
            onChange={(event) => handleSelectCourse(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
            <option value={NEW_COURSE_VALUE}>Create new course</option>
          </select>
        </div>
      ) : null}

      {shouldCreateCourse ? (
        <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel required>Course name</FieldLabel>
            <input
              type="text"
              value={courseForm.name}
              onChange={(event) =>
                handleCourseFormChange("name", event.target.value)
              }
              placeholder="Biology 101"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
            />
          </div>

          <div>
            <FieldLabel>Term</FieldLabel>
            <input
              type="text"
              value={courseForm.term}
              onChange={(event) =>
                handleCourseFormChange("term", event.target.value)
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
                value={courseForm.color}
                onChange={(event) =>
                  handleCourseFormChange("color", event.target.value)
                }
                className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={courseForm.color}
                onChange={(event) =>
                  handleCourseFormChange("color", event.target.value)
                }
                className="w-full border-0 p-0 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderChooser = () => (
    <div className="px-6 pb-6 pt-5">
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setStep("manual")}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <PencilLine className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            Add manually
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter a single assignment with title, course, and due date.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStep("syllabus-upload")}
          className="rounded-[1.5rem] border border-lime-300 bg-gradient-to-br from-[#F7FFD1] via-[#FBFFE6] to-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CCFF00] text-slate-900">
              <FileUp className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              <Bot className="h-3 w-3" />
              AI
            </span>
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            Upload syllabus
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We&apos;ll read your PDF or DOCX syllabus, pull out assignment
            candidates, and let you review everything before saving.
          </p>
        </button>
      </div>
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-5 px-6 pb-6 pt-5">
      {renderCourseFields()}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel required>Assignment title</FieldLabel>
          <input
            type="text"
            value={manualForm.title}
            onChange={(event) =>
              handleManualFormChange("title", event.target.value)
            }
            placeholder="Reading Reflection #4"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
          />
        </div>

        <div>
          <FieldLabel>Due date</FieldLabel>
          <input
            type="datetime-local"
            value={manualForm.dueAt}
            onChange={(event) =>
              handleManualFormChange("dueAt", event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
          />
        </div>

        <div>
          <FieldLabel>Difficulty</FieldLabel>
          <select
            value={manualForm.difficulty}
            onChange={(event) =>
              handleManualFormChange("difficulty", event.target.value)
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
            value={manualForm.estimatedMinutes}
            onChange={(event) =>
              handleManualFormChange("estimatedMinutes", event.target.value)
            }
            placeholder="90"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Weight (%)</FieldLabel>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={manualForm.weightPercent}
            onChange={(event) =>
              handleManualFormChange("weightPercent", event.target.value)
            }
            placeholder="15"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            This saves directly to {currentCourseName || "your course"}.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            You can come back later to mark it complete or edit the details.
          </p>
        </div>
        <CalendarDays className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
    </div>
  );

  const renderSyllabusUpload = () => (
    <div className="space-y-5 px-6 pb-6 pt-5">
      {renderCourseFields()}

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Upload syllabus
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              We support `PDF` and `DOCX`. Your file is read by AI (Google
              Gemini) to find assignments, then we create a review list before
              anything is added to your account.
            </p>
          </div>
          <Sparkles className="h-5 w-5 shrink-0 text-slate-400" />
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50">
          <FileUp className="h-5 w-5 text-slate-500" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {syllabusFile ? syllabusFile.name : "Choose a syllabus file"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              PDF or DOCX
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              setSyllabusFile(event.target.files?.[0] ?? null);
              setErrorMessage(null);
            }}
          />
        </label>
      </div>
    </div>
  );

  const renderSyllabusReview = () => (
    <div className="space-y-5 px-6 pb-6 pt-5">
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              Review before saving to {currentCourseName || "this course"}.
            </p>
            <p className="mt-1 text-emerald-800/90">
              Adjust titles or due dates, remove anything that doesn&apos;t
              belong, then create the assignments in one step.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reviewCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Assignment title</FieldLabel>
                  <input
                    type="text"
                    value={candidate.title}
                    onChange={(event) =>
                      setReviewCandidates((current) =>
                        current.map((item) =>
                          item.id === candidate.id
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel>Due date</FieldLabel>
                    <input
                      type="datetime-local"
                      value={candidate.dueAt}
                      onChange={(event) =>
                        setReviewCandidates((current) =>
                          current.map((item) =>
                            item.id === candidate.id
                              ? { ...item, dueAt: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                    />
                  </div>

                  <div>
                    <FieldLabel>Weight (%)</FieldLabel>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={candidate.weightPercent}
                      onChange={(event) =>
                        setReviewCandidates((current) =>
                          current.map((item) =>
                            item.id === candidate.id
                              ? { ...item, weightPercent: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="15"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setReviewCandidates((current) =>
                      current.filter((item) => item.id !== candidate.id),
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>

                {candidate.type || candidate.confidence != null ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {candidate.type ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {candidate.type}
                      </span>
                    ) : null}
                    {candidate.confidence != null ? (
                      <span className="text-xs font-medium text-slate-400">
                        {Math.round(candidate.confidence * 100)}% confident
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const headerTitle =
    step === "chooser"
      ? "Add an assignment"
      : step === "manual"
        ? "Add manually"
        : step === "syllabus-upload"
          ? "Upload syllabus"
          : "Review assignments";
  const primaryActionLabel =
    step === "manual"
      ? isSubmitting
        ? "Saving..."
        : "Save assignment"
      : step === "syllabus-upload"
        ? isSubmitting
          ? "Reading syllabus..."
          : "Review assignments"
        : step === "syllabus-review"
          ? isSubmitting
            ? "Creating assignments..."
            : "Create assignments"
          : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={handleClose} />

      <div className="relative z-10 flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            {step !== "chooser" ? (
              <button
                type="button"
                onClick={() =>
                  setStep(
                    step === "syllabus-review" ? "syllabus-upload" : "chooser",
                  )
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {headerTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === "chooser"
                ? "Choose the fastest way to get assignments into your workspace."
                : step === "manual"
                  ? "Create one assignment with all the details you need."
                  : step === "syllabus-upload"
                    ? "Pick the course first, then upload the syllabus for review."
                    : "Everything stays editable until you confirm."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close add assignment modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {errorMessage ? (
          <div className="mx-6 mt-5 flex items-start gap-3 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mx-6 mt-5 flex items-start gap-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{successMessage}</p>
          </div>
        ) : null}

        {warningMessage ? (
          <div className="mx-6 mt-5 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{warningMessage}</p>
          </div>
        ) : null}

        {step === "chooser" ? renderChooser() : null}
        {step === "manual" ? renderManualForm() : null}
        {step === "syllabus-upload" ? renderSyllabusUpload() : null}
        {step === "syllabus-review" ? renderSyllabusReview() : null}
        </div>

        {step !== "chooser" ? (
          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {step === "manual"
                ? "Manual entry is best when you only need one assignment."
                : step === "syllabus-upload"
                  ? "We only save assignments after the review step."
                  : `${reviewCandidates.length} item${reviewCandidates.length === 1 ? "" : "s"} ready to create.`}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              {step === "manual" ? (
                <button
                  type="button"
                  onClick={() => void handleSaveManual()}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {primaryActionLabel}
                </button>
              ) : null}

              {step === "syllabus-upload" ? (
                <button
                  type="button"
                  onClick={() => void handleUploadSyllabus()}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {primaryActionLabel}
                </button>
              ) : null}

              {step === "syllabus-review" ? (
                <button
                  type="button"
                  onClick={() => void handleCreateFromReview()}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {primaryActionLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
