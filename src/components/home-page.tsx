"use client";

import * as React from "react";

import { AddAssignmentModal } from "@/components/dashboard/add-assignment-modal";
import { AssignmentsPage } from "@/components/dashboard/assignments-page";
import { CourseGrades } from "@/components/dashboard/course-grades";
import { GradesPage } from "@/components/dashboard/grades-page";
import {
  type DashboardViewModel,
  updateAssignmentGrade,
  updateAssignmentStatus,
  useDashboardData,
} from "@/components/dashboard/dashboard-data";
import { getDisplayName } from "@/components/dashboard/dashboard-utils";
import { FocusCard } from "@/components/dashboard/focus-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
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

type AppView = "assignments" | "dashboard" | "grades";

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

function DashboardEmptyState({ onOpenAddAssignment }: { onOpenAddAssignment: () => void }) {
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
        connected to your account yet. Add one assignment manually or upload a
        syllabus and review the imported deadlines before saving.
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
          The add flow lets you choose between one manual assignment or a
          syllabus import with a review step.
        </p>
        <button
          type="button"
          onClick={onOpenAddAssignment}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add Assignment
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

export function HomePage({
  email,
  fullName,
  isSigningOut,
  onSignOut,
  userId,
}: HomePageProps) {
  const displayName = getDisplayName(fullName, email);
  const {
    assignments,
    error,
    rawCourses,
    reload,
    status,
    viewModel,
  } = useDashboardData(userId);
  const [activeView, setActiveView] = React.useState<AppView>("dashboard");
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = React.useState(false);

  const handleOpenAddAssignment = React.useCallback(() => {
    setIsAddAssignmentOpen(true);
  }, []);

  const handleCloseAddAssignment = React.useCallback(() => {
    setIsAddAssignmentOpen(false);
  }, []);

  const handleToggleAssignmentStatus = React.useCallback(
    async (assignmentId: string, isCompleted: boolean) => {
      await updateAssignmentStatus({
        assignmentId,
        isCompleted,
      });
      await reload();
    },
    [reload],
  );

  const handleSaveAssignmentGrade = React.useCallback(
    async (input: {
      assignmentId: string;
      gradeLetter?: string | null;
      gradeNumber?: number | null;
      gradeType: "letter" | "number";
    }) => {
      await updateAssignmentGrade(input);
      await reload();
    },
    [reload],
  );

  const dashboardContent = React.useMemo(() => {
    if (status === "loading") {
      return <DashboardLoadingState />;
    }

    if (status === "error") {
      return <DashboardErrorState error={error} onRetry={reload} />;
    }

    if (status === "empty") {
      return (
        <DashboardEmptyState onOpenAddAssignment={handleOpenAddAssignment} />
      );
    }

    if (!viewModel) {
      return <DashboardErrorState error={error} onRetry={reload} />;
    }

    return <DashboardReadyState viewModel={viewModel} />;
  }, [error, handleOpenAddAssignment, reload, status, viewModel]);

  return (
    <>
      <main className="app-scroll-shell min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#CCFF00] selection:text-slate-900">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          <Sidebar
            activeView={activeView}
            isSigningOut={isSigningOut}
            onNavigate={setActiveView}
            onSignOut={onSignOut}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            {activeView === "dashboard" ? (
              <TopBar
                displayName={displayName}
                onQuickAdd={handleOpenAddAssignment}
              />
            ) : null}

            <div className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                {activeView === "dashboard" ? (
                  dashboardContent
                ) : activeView === "assignments" ? (
                  <AssignmentsPage
                    assignments={assignments}
                    error={error}
                    onOpenAddAssignment={handleOpenAddAssignment}
                    onReload={reload}
                    onToggleAssignmentStatus={handleToggleAssignmentStatus}
                    rawCourses={rawCourses}
                    status={status}
                  />
                ) : (
                  <GradesPage
                    assignments={assignments}
                    error={error}
                    onReload={reload}
                    onSaveAssignmentGrade={handleSaveAssignmentGrade}
                    rawCourses={rawCourses}
                    status={status}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddAssignmentModal
        courses={rawCourses.map((course) => ({
          color: course.color,
          id: course.id,
          name: course.name,
          term: course.term,
        }))}
        isOpen={isAddAssignmentOpen}
        onClose={handleCloseAddAssignment}
        onDataChanged={reload}
        userId={userId}
      />
    </>
  );
}
