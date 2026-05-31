"use client";

import * as React from "react";

import { CourseGrades } from "@/components/dashboard/course-grades";
import {
  createAssignment,
  createCourse,
  type DashboardViewModel,
  uploadCourseSyllabus,
  useDashboardData,
} from "@/components/dashboard/dashboard-data";
import { getDisplayName } from "@/components/dashboard/dashboard-utils";
import { FocusCard } from "@/components/dashboard/focus-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { QuickAddModal } from "@/components/dashboard/quick-add-modal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { TopBar } from "@/components/dashboard/top-bar";
import { UpNextPanel } from "@/components/dashboard/up-next-panel";

type HomePageProps = {
  email?: string;
  fullName?: string;
  isSigningOut: boolean;
  onSignOut: () => Promise<void> | void;
  userId: string;
};

type QuickAddStep = "course" | "assignment";

type CourseFormState = {
  color: string;
  name: string;
  term: string;
};

type AssignmentFormState = {
  difficulty: string;
  dueAt: string;
  estimatedMinutes: string;
  title: string;
};

const INITIAL_COURSE_FORM: CourseFormState = {
  color: "#CCFF00",
  name: "",
  term: "",
};

const INITIAL_ASSIGNMENT_FORM: AssignmentFormState = {
  difficulty: "",
  dueAt: "",
  estimatedMinutes: "",
  title: "",
};

const ACCEPTED_SYLLABUS_EXTENSIONS = [".pdf", ".docx"];

function DashboardLoadingState() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`stat-skeleton-${index}`}
            className="h-36 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <div className="h-96 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
          <div className="h-72 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
        </div>
        <div className="space-y-6 xl:col-span-5">
          <div className="h-96 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
          <div className="h-60 rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}

function DashboardErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="animate-fade-in-up rounded-[1.75rem] border border-rose-200 bg-rose-50/80 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
        Dashboard unavailable
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        We couldn&apos;t load your academic overview.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {error ?? "Something went wrong while loading your dashboard data."}
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

function DashboardEmptyState({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <section className="animate-fade-in-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        First things first
      </p>
      <h2 className="mt-3 text-3xl font-bold text-slate-900">
        Your dashboard is ready for real coursework.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        You&apos;re signed in, but there aren&apos;t any courses or assignments
        connected to your account yet. Create a course with Quick Add, then add
        the first assignment to bring this dashboard to life.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Up Next</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upcoming assignments will appear here in one combined queue.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Focus</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The most urgent assignment will become the focus card
            automatically.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Calendar</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Deadlines from every course will show up together, not in separate
            dashboards.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          You can optionally attach a syllabus when creating the course, then
          move straight into the first assignment.
        </p>
        <button
          type="button"
          onClick={onQuickAdd}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Quick Add
        </button>
      </div>
    </section>
  );
}

function DashboardReadyState({
  viewModel,
}: {
  viewModel: DashboardViewModel;
}) {
  return (
    <>
      <StatsRow stats={viewModel.stats} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-7">
          <UpNextPanel assignments={viewModel.assignments} />
          <FocusCard focus={viewModel.focus} />
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <MiniCalendar
            dates={viewModel.calendarDays}
            schedule={viewModel.schedule}
          />
          <CourseGrades />
        </div>
      </div>
    </>
  );
}

function getDashboardErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

function isAcceptedSyllabusFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return ACCEPTED_SYLLABUS_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
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

export function HomePage({
  email,
  fullName,
  isSigningOut,
  onSignOut,
  userId,
}: HomePageProps) {
  const displayName = getDisplayName(fullName, email);
  const { error, reload, status, viewModel } = useDashboardData(userId);
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [quickAddStep, setQuickAddStep] = React.useState<QuickAddStep>("course");
  const [courseForm, setCourseForm] =
    React.useState<CourseFormState>(INITIAL_COURSE_FORM);
  const [assignmentForm, setAssignmentForm] = React.useState<AssignmentFormState>(
    INITIAL_ASSIGNMENT_FORM,
  );
  const [selectedSyllabusFile, setSelectedSyllabusFile] =
    React.useState<File | null>(null);
  const [createdCourseId, setCreatedCourseId] = React.useState<string | null>(
    null,
  );
  const [createdCourseName, setCreatedCourseName] = React.useState<string | null>(
    null,
  );
  const [quickAddError, setQuickAddError] = React.useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = React.useState<string | null>(null);
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = React.useState(false);

  const resetQuickAddState = React.useCallback(() => {
    setQuickAddStep("course");
    setCourseForm(INITIAL_COURSE_FORM);
    setAssignmentForm(INITIAL_ASSIGNMENT_FORM);
    setSelectedSyllabusFile(null);
    setCreatedCourseId(null);
    setCreatedCourseName(null);
    setQuickAddError(null);
    setUploadWarning(null);
    setIsSubmittingQuickAdd(false);
  }, []);

  const handleOpenQuickAdd = React.useCallback(() => {
    setIsQuickAddOpen(true);
  }, []);

  const handleCloseQuickAdd = React.useCallback(() => {
    setIsQuickAddOpen(false);
    resetQuickAddState();
  }, [resetQuickAddState]);

  const handleCourseValueChange = React.useCallback(
    (field: keyof CourseFormState, value: string) => {
      setCourseForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleAssignmentValueChange = React.useCallback(
    (field: keyof AssignmentFormState, value: string) => {
      setAssignmentForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleFileChange = React.useCallback((file: File | null) => {
    if (file && !isAcceptedSyllabusFile(file)) {
      setQuickAddError("Only PDF and DOCX syllabus files are supported.");
      setSelectedSyllabusFile(null);
      return;
    }

    setQuickAddError(null);
    setSelectedSyllabusFile(file);
  }, []);

  const handleCreateCourse = React.useCallback(async () => {
    if (!courseForm.name.trim()) {
      setQuickAddError("Course name is required.");
      return;
    }

    setIsSubmittingQuickAdd(true);
    setQuickAddError(null);
    setUploadWarning(null);

    try {
      const createdCourse = await createCourse({
        color: courseForm.color,
        name: courseForm.name,
        term: courseForm.term,
        userId,
      });

      setCreatedCourseId(createdCourse.id);
      setCreatedCourseName(createdCourse.name);
      await reload();

      if (selectedSyllabusFile) {
        try {
          await uploadCourseSyllabus({
            courseId: createdCourse.id,
            documentType: "syllabus",
            file: selectedSyllabusFile,
            userId,
          });
        } catch (uploadError) {
          setUploadWarning(
            `The course was created, but the syllabus upload failed: ${getDashboardErrorMessage(
              uploadError,
            )}`,
          );
        }
      }

      setQuickAddStep("assignment");
    } catch (submitError) {
      setQuickAddError(getDashboardErrorMessage(submitError));
    } finally {
      setIsSubmittingQuickAdd(false);
    }
  }, [courseForm, reload, selectedSyllabusFile, userId]);

  const handleCreateAssignment = React.useCallback(async () => {
    if (!createdCourseId) {
      setQuickAddError("Create the course first before adding an assignment.");
      return;
    }

    if (!assignmentForm.title.trim()) {
      setQuickAddError("Assignment title is required.");
      return;
    }

    setIsSubmittingQuickAdd(true);
    setQuickAddError(null);

    try {
      await createAssignment({
        courseId: createdCourseId,
        difficulty: assignmentForm.difficulty,
        dueAt: toIsoDateTime(assignmentForm.dueAt),
        estimatedMinutes: assignmentForm.estimatedMinutes
          ? Number(assignmentForm.estimatedMinutes)
          : null,
        title: assignmentForm.title,
        userId,
      });

      await reload();
      handleCloseQuickAdd();
    } catch (submitError) {
      setQuickAddError(getDashboardErrorMessage(submitError));
    } finally {
      setIsSubmittingQuickAdd(false);
    }
  }, [assignmentForm, createdCourseId, handleCloseQuickAdd, reload, userId]);

  const handleSkipAssignment = React.useCallback(() => {
    handleCloseQuickAdd();
  }, [handleCloseQuickAdd]);

  const handleQuickAddPrimaryAction = React.useCallback(() => {
    if (quickAddStep === "course") {
      void handleCreateCourse();
      return;
    }

    void handleCreateAssignment();
  }, [handleCreateAssignment, handleCreateCourse, quickAddStep]);

  const content = React.useMemo(() => {
    if (status === "loading") {
      return <DashboardLoadingState />;
    }

    if (status === "error") {
      return <DashboardErrorState error={error} onRetry={reload} />;
    }

    if (status === "empty") {
      return <DashboardEmptyState onQuickAdd={handleOpenQuickAdd} />;
    }

    if (!viewModel) {
      return <DashboardErrorState error={error} onRetry={reload} />;
    }

    return <DashboardReadyState viewModel={viewModel} />;
  }, [error, handleOpenQuickAdd, reload, status, viewModel]);

  return (
    <>
      <main className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#CCFF00] selection:text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
          <Sidebar
            displayName={displayName}
            email={email}
            isSigningOut={isSigningOut}
            onSignOut={onSignOut}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <TopBar
              displayName={displayName}
              onQuickAdd={handleOpenQuickAdd}
            />

            <div className="flex-1 px-4 pb-8 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">{content}</div>
            </div>
          </div>
        </div>
      </main>

      <QuickAddModal
        assignmentValues={assignmentForm}
        canSkipAssignment={Boolean(createdCourseId)}
        courseValues={courseForm}
        createdCourseName={createdCourseName}
        errorMessage={quickAddError}
        isOpen={isQuickAddOpen}
        isSubmitting={isSubmittingQuickAdd}
        onAssignmentValueChange={handleAssignmentValueChange}
        onClose={handleCloseQuickAdd}
        onCourseValueChange={handleCourseValueChange}
        onFileChange={handleFileChange}
        onPrimaryAction={handleQuickAddPrimaryAction}
        onSkipAssignment={handleSkipAssignment}
        selectedFile={selectedSyllabusFile}
        step={quickAddStep}
        uploadWarning={uploadWarning}
      />
    </>
  );
}
