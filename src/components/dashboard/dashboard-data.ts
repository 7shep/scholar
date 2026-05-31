"use client";

import * as React from "react";

import { supabase } from "@/lib/supabase";

type CourseRow = {
  color: string | null;
  created_at: string | null;
  id: string;
  name: string;
  term: string | null;
  user_id: string;
};

type AssignmentRow = {
  course_id: string | null;
  created_at: string | null;
  difficulty: string | null;
  due_at: string | null;
  estimated_minutes: number | null;
  id: string;
  status: string | null;
  title: string;
  user_id: string;
};

export type DashboardStatus = "loading" | "error" | "empty" | "ready";

export type DashboardDifficulty = "Easy" | "Medium" | "Hard" | "Unspecified";

export type DashboardAssignment = {
  course: string;
  difficulty: DashboardDifficulty;
  difficultyClassName: string;
  dueLabel: string;
  id: string;
  title: string;
};

export type DashboardStats = {
  activeCourses: number;
  completedAssignments: number;
  completionRate: number;
  dueThisWeek: number;
  openAssignments: number;
};

export type DashboardFocus = {
  course: string;
  difficulty: DashboardDifficulty;
  dueLabel: string;
  estimatedLabel: string;
  title: string;
};

export type DashboardCalendarDay = {
  active: boolean;
  dateNumber: number;
  dots: number;
  key: string;
};

export type DashboardCalendarItem = {
  course: string;
  timeLabel: string;
  title: string;
  typeLabel: string;
};

export type DashboardViewModel = {
  assignments: DashboardAssignment[];
  calendarDays: DashboardCalendarDay[];
  focus: DashboardFocus | null;
  schedule: DashboardCalendarItem[];
  stats: DashboardStats;
};

type DashboardDataResult = {
  courses: DashboardCourseOption[];
  error: string | null;
  reload: () => Promise<void>;
  status: DashboardStatus;
  viewModel: DashboardViewModel | null;
};

export type DashboardCourseOption = {
  color: string | null;
  id: string;
  name: string;
  term: string | null;
};

export type CreateCourseInput = {
  color?: string | null;
  name: string;
  term?: string | null;
  userId: string;
};

export type UploadCourseDocumentInput = {
  courseId: string;
  documentType: "syllabus";
  file: File;
  userId: string;
};

export type CreateAssignmentInput = {
  courseId: string;
  difficulty?: string | null;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  title: string;
  userId: string;
};

export type UploadCourseDocumentResult = {
  fileName: string;
  id: string;
  mimeType: string;
  storagePath: string;
};

type SupabaseLikeError = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

const MAX_UP_NEXT_ASSIGNMENTS = 5;
const MAX_SCHEDULE_ITEMS = 4;
const WEEK_LENGTH = 7;
const COURSE_DOCUMENTS_BUCKET = "course-documents";
const ACCEPTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as SupabaseLikeError).message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Unable to load your dashboard right now.";
}

function slugifyFileName(fileName: string) {
  const normalized = fileName.trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");
  const baseName =
    lastDotIndex >= 0 ? normalized.slice(0, lastDotIndex) : normalized;
  const extension = lastDotIndex >= 0 ? normalized.slice(lastDotIndex) : "";
  const slug = baseName
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${slug || "document"}${extension}`;
}

function buildUploadPath(userId: string, courseId: string, fileName: string) {
  return `${userId}/${courseId}/${Date.now()}-${slugifyFileName(fileName)}`;
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeEstimatedMinutes(value: number | null | undefined) {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function isMissingDashboardTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { code, details, hint, message } = error as SupabaseLikeError;
  const normalizedCode = code?.trim().toUpperCase();
  const combinedText = [message, details, hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (normalizedCode === "PGRST205" || normalizedCode === "42P01") {
    return true;
  }

  return (
    combinedText.includes("schema cache") ||
    combinedText.includes("could not find the table") ||
    combinedText.includes("relation") ||
    combinedText.includes("does not exist")
  );
}

function isCompletedStatus(status: string | null) {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toLowerCase();

  return normalized === "done" || normalized === "completed";
}

function normalizeDifficulty(difficulty: string | null): DashboardDifficulty {
  const normalized = difficulty?.trim().toLowerCase();

  if (normalized === "easy") {
    return "Easy";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "hard") {
    return "Hard";
  }

  return "Unspecified";
}

function getDifficultyClassName(difficulty: DashboardDifficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-100 text-emerald-700";
    case "Medium":
      return "bg-amber-100 text-amber-700";
    case "Hard":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getWeekStart(currentDate: Date) {
  const weekStart = new Date(currentDate);
  const weekday = weekStart.getDay();
  const shift = weekday === 0 ? -6 : 1 - weekday;

  weekStart.setDate(weekStart.getDate() + shift);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function getWeekEnd(currentDate: Date) {
  const weekEnd = getWeekStart(currentDate);
  weekEnd.setDate(weekEnd.getDate() + WEEK_LENGTH);
  return weekEnd;
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isWithinThisWeek(date: Date, currentDate: Date) {
  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);

  return date >= weekStart && date < weekEnd;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function formatDueLabel(dueAt: string | null) {
  if (!dueAt) {
    return "No due date";
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return formatDateTime(date);
}

function formatRelativeDueLabel(dueAt: string | null, currentDate: Date) {
  if (!dueAt) {
    return "No due date";
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  const startOfToday = new Date(currentDate);
  startOfToday.setHours(0, 0, 0, 0);

  const dueDay = new Date(date);
  dueDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dueDay.getTime() - startOfToday.getTime()) / 86400000,
  );

  if (diffDays === 0) {
    return `Due today at ${formatTime(date)}`;
  }

  if (diffDays === 1) {
    return `Due tomorrow at ${formatTime(date)}`;
  }

  if (diffDays > 1 && diffDays <= 6) {
    return `Due in ${diffDays} days`;
  }

  if (diffDays < 0) {
    return `Past due by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
  }

  return `Due ${formatDateTime(date)}`;
}

function formatEstimatedLabel(estimatedMinutes: number | null) {
  if (!estimatedMinutes || estimatedMinutes <= 0) {
    return "No time estimate";
  }

  if (estimatedMinutes < 60) {
    return `About ${estimatedMinutes} min`;
  }

  const hours = estimatedMinutes / 60;

  if (Number.isInteger(hours)) {
    return `About ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `About ${hours.toFixed(1)} hours`;
}

function compareAssignments(left: AssignmentRow, right: AssignmentRow) {
  const leftDue = left.due_at ? new Date(left.due_at).getTime() : Number.MAX_SAFE_INTEGER;
  const rightDue = right.due_at ? new Date(right.due_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (leftDue !== rightDue) {
    return leftDue - rightDue;
  }

  const leftCreated = left.created_at ? new Date(left.created_at).getTime() : Number.MAX_SAFE_INTEGER;
  const rightCreated = right.created_at ? new Date(right.created_at).getTime() : Number.MAX_SAFE_INTEGER;

  return leftCreated - rightCreated;
}

function buildCalendarDays(
  currentDate: Date,
  assignments: AssignmentRow[],
): DashboardCalendarDay[] {
  const weekStart = getWeekStart(currentDate);

  return Array.from({ length: WEEK_LENGTH }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dots = assignments.filter((assignment) => {
      if (!assignment.due_at || isCompletedStatus(assignment.status)) {
        return false;
      }

      const dueDate = new Date(assignment.due_at);

      return !Number.isNaN(dueDate.getTime()) && isSameDate(dueDate, date);
    }).length;

    return {
      active: isSameDate(date, currentDate),
      dateNumber: date.getDate(),
      dots: Math.min(dots, 3),
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    };
  });
}

function buildViewModel(courses: CourseRow[], assignments: AssignmentRow[]) {
  const currentDate = new Date();
  const courseNames = new Map(courses.map((course) => [course.id, course.name]));
  const sortedAssignments = [...assignments].sort(compareAssignments);
  const openAssignments = sortedAssignments.filter(
    (assignment) => !isCompletedStatus(assignment.status),
  );
  const completedAssignments = sortedAssignments.filter((assignment) =>
    isCompletedStatus(assignment.status),
  );

  const assignmentCards = openAssignments
    .slice(0, MAX_UP_NEXT_ASSIGNMENTS)
    .map((assignment) => {
      const difficulty = normalizeDifficulty(assignment.difficulty);

      return {
        course: courseNames.get(assignment.course_id ?? "") ?? "Unassigned",
        difficulty,
        difficultyClassName: getDifficultyClassName(difficulty),
        dueLabel: formatDueLabel(assignment.due_at),
        id: assignment.id,
        title: assignment.title,
      } satisfies DashboardAssignment;
    });

  const focusSource = openAssignments[0] ?? null;

  const dueThisWeek = openAssignments.filter((assignment) => {
    if (!assignment.due_at) {
      return false;
    }

    const date = new Date(assignment.due_at);

    return !Number.isNaN(date.getTime()) && isWithinThisWeek(date, currentDate);
  }).length;

  const schedule = openAssignments
    .filter((assignment) => assignment.due_at)
    .slice(0, MAX_SCHEDULE_ITEMS)
    .map((assignment) => {
      const date = new Date(assignment.due_at as string);

      return {
        course: courseNames.get(assignment.course_id ?? "") ?? "Unassigned",
        timeLabel: Number.isNaN(date.getTime()) ? "TBD" : formatTime(date),
        title: assignment.title,
        typeLabel: "Deadline",
      } satisfies DashboardCalendarItem;
    });

  return {
    assignments: assignmentCards,
    calendarDays: buildCalendarDays(currentDate, assignments),
    focus: focusSource
      ? {
          course: courseNames.get(focusSource.course_id ?? "") ?? "Unassigned",
          difficulty: normalizeDifficulty(focusSource.difficulty),
          dueLabel: formatRelativeDueLabel(focusSource.due_at, currentDate),
          estimatedLabel: formatEstimatedLabel(focusSource.estimated_minutes),
          title: focusSource.title,
        }
      : null,
    schedule,
    stats: {
      activeCourses: courses.length,
      completedAssignments: completedAssignments.length,
      completionRate:
        assignments.length === 0
          ? 0
          : Math.round((completedAssignments.length / assignments.length) * 100),
      dueThisWeek,
      openAssignments: openAssignments.length,
    },
  } satisfies DashboardViewModel;
}

function buildCourseOptions(courses: CourseRow[]): DashboardCourseOption[] {
  return courses.map((course) => ({
    color: course.color,
    id: course.id,
    name: course.name,
    term: course.term,
  }));
}

async function loadDashboardViewModel(userId: string) {
  const [coursesResult, assignmentsResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, user_id, name, color, term, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("assignments")
      .select(
        "id, user_id, course_id, title, due_at, status, difficulty, estimated_minutes, created_at",
      )
      .eq("user_id", userId)
      .order("due_at", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const courses = (() => {
    if (!coursesResult.error) {
      return (coursesResult.data ?? []) as CourseRow[];
    }

    if (isMissingDashboardTableError(coursesResult.error)) {
      console.warn(
        "Dashboard fallback: `courses` table is missing, so the dashboard is using the empty state.",
        coursesResult.error,
      );
      return [] as CourseRow[];
    }

    throw coursesResult.error;
  })();

  const assignments = (() => {
    if (!assignmentsResult.error) {
      return (assignmentsResult.data ?? []) as AssignmentRow[];
    }

    if (isMissingDashboardTableError(assignmentsResult.error)) {
      console.warn(
        "Dashboard fallback: `assignments` table is missing, so the dashboard is using the empty state.",
        assignmentsResult.error,
      );
      return [] as AssignmentRow[];
    }

    throw assignmentsResult.error;
  })();

  return {
    courses: buildCourseOptions(courses),
    viewModel: buildViewModel(courses, assignments),
  };
}

export async function createCourse(input: CreateCourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      color: normalizeOptionalText(input.color),
      name: input.name.trim(),
      term: normalizeOptionalText(input.term),
      user_id: input.userId,
    })
    .select("id, user_id, name, color, term, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as CourseRow;
}

export async function uploadCourseSyllabus(
  input: UploadCourseDocumentInput,
): Promise<UploadCourseDocumentResult> {
  if (!ACCEPTED_DOCUMENT_TYPES.has(input.file.type)) {
    throw new Error("Only PDF and DOCX syllabus files are supported.");
  }

  const storagePath = buildUploadPath(
    input.userId,
    input.courseId,
    input.file.name,
  );
  const uploadResult = await supabase.storage
    .from(COURSE_DOCUMENTS_BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      contentType: input.file.type,
      upsert: false,
    });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  const { data, error } = await supabase
    .from("course_documents")
    .insert({
      course_id: input.courseId,
      document_type: input.documentType,
      file_name: input.file.name,
      file_size: input.file.size,
      mime_type: input.file.type,
      storage_path: storagePath,
      user_id: input.userId,
    })
    .select("id, file_name, mime_type, storage_path")
    .single();

  if (error) {
    await supabase.storage.from(COURSE_DOCUMENTS_BUCKET).remove([storagePath]);
    throw error;
  }

  return {
    fileName: data.file_name,
    id: data.id,
    mimeType: data.mime_type,
    storagePath: data.storage_path,
  };
}

export async function createAssignment(input: CreateAssignmentInput) {
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      course_id: input.courseId,
      difficulty: normalizeOptionalText(input.difficulty)?.toLowerCase(),
      due_at: input.dueAt ?? null,
      estimated_minutes: normalizeEstimatedMinutes(input.estimatedMinutes),
      status: "todo",
      title: input.title.trim(),
      user_id: input.userId,
    })
    .select(
      "id, user_id, course_id, title, due_at, status, difficulty, estimated_minutes, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as AssignmentRow;
}

export function useDashboardData(userId: string): DashboardDataResult {
  const [courses, setCourses] = React.useState<DashboardCourseOption[]>([]);
  const [status, setStatus] = React.useState<DashboardStatus>("loading");
  const [viewModel, setViewModel] = React.useState<DashboardViewModel | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const nextResult = await loadDashboardViewModel(userId);
      const hasAnyData =
        nextResult.viewModel.stats.activeCourses > 0 ||
        nextResult.viewModel.stats.openAssignments > 0 ||
        nextResult.viewModel.stats.completedAssignments > 0;

      setCourses(nextResult.courses);
      setViewModel(nextResult.viewModel);
      setStatus(hasAnyData ? "ready" : "empty");
    } catch (loadError) {
      const message = getErrorMessage(loadError);

      console.error("Dashboard load failed.", loadError);
      setCourses([]);
      setError(message);
      setViewModel(null);
      setStatus("error");
    }
  }, [userId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return {
    courses,
    error,
    reload,
    status,
    viewModel,
  };
}
