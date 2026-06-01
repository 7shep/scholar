"use client";

import * as React from "react";

import { supabase } from "@/lib/supabase";
import { debugLog, debugTable } from "@/lib/debug-log";

export type CourseRow = {
  color: string | null;
  credits: number;
  created_at: string | null;
  id: string;
  name: string;
  term: string | null;
  user_id: string;
};

export type AssignmentRow = {
  completed_at: string | null;
  course_id: string | null;
  created_at: string | null;
  difficulty: string | null;
  due_at: string | null;
  estimated_minutes: number | null;
  grade_letter: string | null;
  grade_number: number | null;
  grade_type: "letter" | "number" | null;
  grade_updated_at: string | null;
  id: string;
  status: string | null;
  title: string;
  user_id: string;
  weight_percent: number | null;
};

export type DashboardStatus = "loading" | "error" | "empty" | "ready";

export type DashboardPriority = "High" | "Low" | "Medium" | "Unspecified";

export type DashboardAssignment = {
  course: string;
  priority: DashboardPriority;
  priorityClassName: string;
  dueLabel: string;
  id: string;
  title: string;
};

export type DashboardStats = {
  activeCourses: number;
  completedAssignments: number;
  completionRate: number;
  currentGpa: number | null;
  dueThisWeek: number;
  gpaDelta: number | null;
  openAssignments: number;
};

export type DashboardFocus = {
  course: string;
  priority: DashboardPriority;
  dueLabel: string;
  estimatedLabel: string | null;
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

export type DashboardLetterGrade = (typeof LETTER_GRADE_SCALE)[number]["letter"];

export type DashboardCourseGradeItem = {
  courseColor: string | null;
  courseId: string;
  courseName: string;
  displayLabel: string;
  letterGrade: DashboardLetterGrade;
  percentage: number;
};

export type DashboardGradesPanel = {
  gradedCount: number;
  items: DashboardCourseGradeItem[];
  missingGradeCount: number;
};

export type DashboardViewModel = {
  assignments: DashboardAssignment[];
  calendarDays: DashboardCalendarDay[];
  focus: DashboardFocus | null;
  gradesPanel: DashboardGradesPanel;
  schedule: DashboardCalendarItem[];
  stats: DashboardStats;
};

export type DashboardDataResult = {
  assignments: AssignmentRow[];
  courses: DashboardCourseOption[];
  error: string | null;
  rawCourses: CourseRow[];
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

export type AssignmentsStatusFilter =
  | "all"
  | "upcoming"
  | "completed"
  | "overdue";

export type AssignmentsSortOption = "due-date";

export type AssignmentsCourseChip = {
  color: string | null;
  count: number;
  id: string;
  label: string;
};

export type AssignmentsListItem = {
  course: string;
  courseColor: string | null;
  courseId: string | null;
  dueLabel: string;
  id: string;
  isCompleted: boolean;
  isOverdue: boolean;
  title: string;
  weightPercent: number | null;
};

export type AssignmentsSection = {
  id: string;
  itemCount: number;
  items: AssignmentsListItem[];
  label: string;
};

export type AssignmentsViewModel = {
  completedCount: number;
  courseChips: AssignmentsCourseChip[];
  dueThisWeekCount: number;
  emptyMessage: string;
  openCount: number;
  overdueCount: number;
  sections: AssignmentsSection[];
  totalCount: number;
};

export type CreateCourseInput = {
  color?: string | null;
  credits: number;
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
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  title: string;
  userId: string;
  weightPercent?: number | null;
};

export type UploadCourseDocumentResult = {
  fileName: string;
  id: string;
  mimeType: string;
  storagePath: string;
};

export type UpdateAssignmentStatusInput = {
  assignmentId: string;
  isCompleted: boolean;
};

export type UpdateAssignmentGradeInput = {
  assignmentId: string;
  gradeLetter?: string | null;
  gradeNumber?: number | null;
  gradeType: "letter" | "number";
};

export type GradesStatusFilter = "all" | "graded" | "ungraded";

export type GradesSortOption = "most-recent";

export type GradesCourseChip = {
  color: string | null;
  count: number;
  id: string;
  label: string;
};

export type GradesListItem = {
  completedLabel: string;
  course: string;
  courseColor: string | null;
  courseId: string | null;
  gradeDisplay: string | null;
  gradeLetter: string | null;
  gradeNumber: number | null;
  gradeType: "letter" | "number" | null;
  id: string;
  isGraded: boolean;
  title: string;
};

export type GradesViewModel = {
  completedCount: number;
  courseChips: GradesCourseChip[];
  emptyMessage: string;
  gradedCount: number;
  items: GradesListItem[];
  missingGradeCount: number;
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
const DEFAULT_COURSE_CREDITS = 3;
const TWO_SEMESTER_COURSE_CREDITS = 6;
const ASSIGNMENT_SELECT_COLUMNS =
  "id, user_id, course_id, title, due_at, status, difficulty, estimated_minutes, weight_percent, completed_at, grade_type, grade_number, grade_letter, grade_updated_at, created_at";
const ACCEPTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const LETTER_GRADE_SCALE = [
  { letter: "A+", max: 100, midpoint: 95, min: 90 },
  { letter: "A", max: 89.9, midpoint: 87.45, min: 85 },
  { letter: "A-", max: 84.9, midpoint: 82.45, min: 80 },
  { letter: "B+", max: 79.9, midpoint: 78.45, min: 77 },
  { letter: "B", max: 76.9, midpoint: 74.95, min: 73 },
  { letter: "B-", max: 72.9, midpoint: 71.45, min: 70 },
  { letter: "C+", max: 69.9, midpoint: 68.45, min: 67 },
  { letter: "C", max: 66.9, midpoint: 64.95, min: 63 },
  { letter: "C-", max: 62.9, midpoint: 61.45, min: 60 },
  { letter: "D+", max: 59.9, midpoint: 58.45, min: 57 },
  { letter: "D", max: 56.9, midpoint: 54.95, min: 53 },
  { letter: "D-", max: 52.9, midpoint: 51.45, min: 50 },
  { letter: "F", max: 49.9, midpoint: 24.95, min: 0 },
] as const;

const GPA_POINTS_BY_LETTER_GRADE: Record<DashboardLetterGrade, number> = {
  "A+": 4,
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  "D+": 1.3,
  D: 1,
  "D-": 0.7,
  F: 0,
};

type CourseGradeSummary = DashboardCourseGradeItem & {
  credits: number;
  gpaPoints: number;
};

function getErrorMessage(error: unknown) {
  if (isMissingAssignmentsGradeColumnsError(error)) {
    return getMissingAssignmentsGradeColumnsMessage();
  }

  if (isMissingAssignmentsGradeUpdatedAtColumnError(error)) {
    return getMissingCourseCreditsAndGradeUpdatedAtMessage();
  }

  if (isMissingAssignmentsWeightColumnError(error)) {
    return getMissingAssignmentsWeightColumnMessage();
  }

  if (isMissingCoursesCreditsColumnError(error)) {
    return getMissingCourseCreditsAndGradeUpdatedAtMessage();
  }

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

function normalizeWeightPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value) || value < 0) {
    return null;
  }

  return Math.min(100, Math.round(value * 10) / 10);
}

function normalizeCourseCredits(value: number | null | undefined) {
  return value === TWO_SEMESTER_COURSE_CREDITS
    ? TWO_SEMESTER_COURSE_CREDITS
    : DEFAULT_COURSE_CREDITS;
}

function normalizeGradeNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value) || value < 0) {
    return null;
  }

  return Math.round(value * 100) / 100;
}

function normalizeGradeLetter(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();
  return normalized ? normalized : null;
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

function isMissingAssignmentsWeightColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { details, hint, message } = error as SupabaseLikeError;
  const combinedText = [message, details, hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    combinedText.includes("weight_percent") &&
    (combinedText.includes("schema cache") ||
      combinedText.includes("column") ||
      combinedText.includes("does not exist"))
  );
}

function isMissingCoursesCreditsColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { details, hint, message } = error as SupabaseLikeError;
  const combinedText = [message, details, hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    combinedText.includes("credits") &&
    (combinedText.includes("schema cache") ||
      combinedText.includes("column") ||
      combinedText.includes("does not exist"))
  );
}

function isMissingAssignmentsGradeColumnsError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { details, hint, message } = error as SupabaseLikeError;
  const combinedText = [message, details, hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  const mentionsGradeColumn =
    combinedText.includes("completed_at") ||
    combinedText.includes("grade_type") ||
    combinedText.includes("grade_number") ||
    combinedText.includes("grade_letter");

  return (
    mentionsGradeColumn &&
    (combinedText.includes("schema cache") ||
      combinedText.includes("column") ||
      combinedText.includes("does not exist"))
  );
}

function isMissingAssignmentsGradeUpdatedAtColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { details, hint, message } = error as SupabaseLikeError;
  const combinedText = [message, details, hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    combinedText.includes("grade_updated_at") &&
    (combinedText.includes("schema cache") ||
      combinedText.includes("column") ||
      combinedText.includes("does not exist"))
  );
}

function getMissingAssignmentsWeightColumnMessage() {
  return "Your database is missing the new assignments weight column. Run the SQL in docs/supabase-add-weight-percent.sql, then try again.";
}

function getMissingAssignmentsGradeColumnsMessage() {
  return "Your database is missing the new assignments grade columns. Run the SQL in docs/supabase-add-grades-columns.sql, then try again.";
}

function getMissingCourseCreditsAndGradeUpdatedAtMessage() {
  return "Your database is missing the new course credits or grade update tracking columns. Run the SQL in docs/supabase-add-course-credits-and-grade-updated-at.sql, then try again.";
}

function isCompletedStatus(status: string | null) {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toLowerCase();

  return normalized === "done" || normalized === "completed";
}

function hasAssignmentGrade(
  assignment: Pick<AssignmentRow, "grade_letter" | "grade_number" | "grade_type">,
) {
  if (assignment.grade_type === "number") {
    return assignment.grade_number != null && !Number.isNaN(assignment.grade_number);
  }

  if (assignment.grade_type === "letter") {
    return normalizeGradeLetter(assignment.grade_letter) != null;
  }

  return false;
}

function formatGradeValue(
  assignment: Pick<AssignmentRow, "grade_letter" | "grade_number" | "grade_type">,
) {
  if (assignment.grade_type === "number") {
    const normalizedNumber = normalizeGradeNumber(assignment.grade_number);

    if (normalizedNumber == null) {
      return null;
    }

    return Number.isInteger(normalizedNumber)
      ? `${normalizedNumber}`
      : normalizedNumber.toFixed(2).replace(/\.?0+$/, "");
  }

  if (assignment.grade_type === "letter") {
    return normalizeGradeLetter(assignment.grade_letter);
  }

  return null;
}

function getGradePercentageFromAssignment(
  assignment: Pick<
    AssignmentRow,
    "grade_letter" | "grade_number" | "grade_type"
  >,
) {
  if (assignment.grade_type === "number") {
    return normalizeGradeNumber(assignment.grade_number);
  }

  if (assignment.grade_type === "letter") {
    const normalizedLetter = normalizeGradeLetter(assignment.grade_letter);

    if (!normalizedLetter) {
      return null;
    }

    return (
      LETTER_GRADE_SCALE.find((entry) => entry.letter === normalizedLetter)
        ?.midpoint ?? null
    );
  }

  return null;
}

function getLetterGradeFromPercentage(percentage: number) {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    LETTER_GRADE_SCALE.find(
      (entry) =>
        normalizedPercentage >= entry.min && normalizedPercentage <= entry.max,
    )?.letter ?? "F"
  );
}

function getGpaPointsFromLetterGrade(letterGrade: DashboardLetterGrade) {
  return GPA_POINTS_BY_LETTER_GRADE[letterGrade];
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function getTimestampValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getPriorityFromWeightPercent(
  weightPercent: number | null | undefined,
): DashboardPriority {
  const normalizedWeight = normalizeWeightPercent(weightPercent);

  if (normalizedWeight == null || normalizedWeight <= 0) {
    return "Unspecified";
  }

  if (normalizedWeight >= 30) {
    return "High";
  }

  if (normalizedWeight >= 15) {
    return "Medium";
  }

  return "Low";
}

function getPriorityClassName(priority: DashboardPriority) {
  switch (priority) {
    case "Low":
      return "bg-emerald-100 text-emerald-700";
    case "Medium":
      return "bg-amber-100 text-amber-700";
    case "High":
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
    return null;
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

function getStartOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getDayDifference(left: Date, right: Date) {
  return Math.round(
    (getStartOfDay(left).getTime() - getStartOfDay(right).getTime()) / 86400000,
  );
}

function isOverdueAssignment(
  assignment: AssignmentRow,
  currentDate: Date,
  completed = isCompletedStatus(assignment.status),
) {
  if (completed || !assignment.due_at) {
    return false;
  }

  const dueDate = new Date(assignment.due_at);

  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < currentDate.getTime();
}

function formatAssignmentTimeline(dueAt: string | null, currentDate: Date) {
  if (!dueAt) {
    return "No due date";
  }

  const dueDate = new Date(dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return "No due date";
  }

  const dayDifference = getDayDifference(dueDate, currentDate);
  const timeLabel = formatTime(dueDate);

  if (dayDifference === 0) {
    return `Today, ${timeLabel}`;
  }

  if (dayDifference === -1) {
    return `Yesterday, ${timeLabel}`;
  }

  if (dayDifference === 1) {
    return `Tomorrow, ${timeLabel}`;
  }

  if (dayDifference > 1 && dayDifference <= 6) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      weekday: "short",
    }).format(dueDate);
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(dueDate);
}

function getAssignmentGroup(
  assignment: AssignmentRow,
  currentDate: Date,
  completed = isCompletedStatus(assignment.status),
) {
  if (completed) {
    return "completed";
  }

  if (isOverdueAssignment(assignment, currentDate, completed)) {
    return "overdue";
  }

  if (!assignment.due_at) {
    return "later";
  }

  const dueDate = new Date(assignment.due_at);

  if (Number.isNaN(dueDate.getTime())) {
    return "later";
  }

  if (isSameDate(dueDate, currentDate)) {
    return "today";
  }

  if (isWithinThisWeek(dueDate, currentDate)) {
    return "this-week";
  }

  return "later";
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

function getAssignmentCompletedSortTime(assignment: AssignmentRow) {
  const completedAt = assignment.completed_at
    ? new Date(assignment.completed_at).getTime()
    : Number.NaN;

  if (!Number.isNaN(completedAt)) {
    return completedAt;
  }

  const dueAt = assignment.due_at ? new Date(assignment.due_at).getTime() : Number.NaN;

  if (!Number.isNaN(dueAt)) {
    return dueAt;
  }

  const createdAt = assignment.created_at
    ? new Date(assignment.created_at).getTime()
    : Number.NaN;

  if (!Number.isNaN(createdAt)) {
    return createdAt;
  }

  return 0;
}

function compareCompletedAssignments(left: AssignmentRow, right: AssignmentRow) {
  return getAssignmentCompletedSortTime(right) - getAssignmentCompletedSortTime(left);
}

function buildCourseGradeSummaries(
  courses: CourseRow[],
  assignments: AssignmentRow[],
): CourseGradeSummary[] {
  const gradedCompletedAssignments = assignments.filter(
    (assignment) =>
      isCompletedStatus(assignment.status) && hasAssignmentGrade(assignment),
  );

  return courses
    .map((course) => {
      const gradedAssignments = gradedCompletedAssignments
        .filter((assignment) => assignment.course_id === course.id)
        .map((assignment) => ({
          percentage: getGradePercentageFromAssignment(assignment),
          weightPercent: normalizeWeightPercent(assignment.weight_percent),
        }))
        .filter(
          (
            assignment,
          ): assignment is {
            percentage: number;
            weightPercent: number | null;
          } => assignment.percentage != null,
        );

      if (gradedAssignments.length === 0) {
        return null;
      }

      const shouldUseWeightedAverage = gradedAssignments.every(
        (assignment) =>
          assignment.weightPercent != null && assignment.weightPercent > 0,
      );
      const averagePercentage = shouldUseWeightedAverage
        ? gradedAssignments.reduce(
            (sum, assignment) =>
              sum +
              assignment.percentage * ((assignment.weightPercent ?? 0) / 100),
            0,
          ) /
          gradedAssignments.reduce(
            (sum, assignment) => sum + ((assignment.weightPercent ?? 0) / 100),
            0,
          )
        : gradedAssignments.reduce(
            (sum, assignment) => sum + assignment.percentage,
            0,
          ) / gradedAssignments.length;
      const roundedPercentage = Math.round(averagePercentage);
      const letterGrade = getLetterGradeFromPercentage(averagePercentage);

      return {
        courseColor: course.color,
        courseId: course.id,
        courseName: course.name,
        credits: normalizeCourseCredits(course.credits),
        displayLabel: `${letterGrade}, ${roundedPercentage}%`,
        gpaPoints: getGpaPointsFromLetterGrade(letterGrade),
        letterGrade,
        percentage: roundedPercentage,
      } satisfies CourseGradeSummary;
    })
    .filter((course): course is CourseGradeSummary => course != null);
}

function calculateWeightedGpa(courseGrades: CourseGradeSummary[]) {
  if (courseGrades.length === 0) {
    return null;
  }

  const totalCredits = courseGrades.reduce(
    (sum, course) => sum + normalizeCourseCredits(course.credits),
    0,
  );

  if (totalCredits <= 0) {
    return null;
  }

  return roundToTwoDecimals(
    courseGrades.reduce(
      (sum, course) =>
        sum + getGpaPointsFromLetterGrade(course.letterGrade) * course.credits,
      0,
    ) / totalCredits,
  );
}

function getLatestGradeUpdateTimestamp(assignments: AssignmentRow[]) {
  const timestamps = assignments
    .filter((assignment) => hasAssignmentGrade(assignment))
    .map((assignment) => getTimestampValue(assignment.grade_updated_at))
    .filter((timestamp): timestamp is number => timestamp != null);

  if (timestamps.length === 0) {
    return null;
  }

  return Math.max(...timestamps);
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

export function buildDashboardViewModel(
  courses: CourseRow[],
  assignments: AssignmentRow[],
) {
  const currentDate = new Date();
  const courseLookup = new Map(
    courses.map((course) => [
      course.id,
      { color: course.color, name: course.name },
    ]),
  );
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
      const priority = getPriorityFromWeightPercent(assignment.weight_percent);

      return {
        course: courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned",
        priority,
        priorityClassName: getPriorityClassName(priority),
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
        course: courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned",
        timeLabel: Number.isNaN(date.getTime()) ? "TBD" : formatTime(date),
        title: assignment.title,
        typeLabel: "Deadline",
      } satisfies DashboardCalendarItem;
    });

  const gradedCompletedAssignments = completedAssignments.filter((assignment) =>
    hasAssignmentGrade(assignment),
  );
  const courseGrades = buildCourseGradeSummaries(courses, assignments);
  const currentGpa = calculateWeightedGpa(courseGrades);
  const latestGradeUpdateTimestamp = getLatestGradeUpdateTimestamp(assignments);
  const previousGpa =
    latestGradeUpdateTimestamp == null
      ? null
      : calculateWeightedGpa(
          buildCourseGradeSummaries(
            courses,
            assignments.filter(
              (assignment) =>
                getTimestampValue(assignment.grade_updated_at) !==
                latestGradeUpdateTimestamp,
            ),
          ),
        );
  const gpaDelta =
    currentGpa != null && previousGpa != null
      ? roundToTwoDecimals(currentGpa - previousGpa)
      : null;
  const gradesPanel = {
    gradedCount: gradedCompletedAssignments.length,
    items: courseGrades,
    missingGradeCount:
      completedAssignments.length - gradedCompletedAssignments.length,
  } satisfies DashboardGradesPanel;

  return {
    assignments: assignmentCards,
    calendarDays: buildCalendarDays(currentDate, assignments),
    focus: focusSource
      ? {
          course: courseLookup.get(focusSource.course_id ?? "")?.name ?? "Unassigned",
          priority: getPriorityFromWeightPercent(focusSource.weight_percent),
          dueLabel: formatRelativeDueLabel(focusSource.due_at, currentDate),
          estimatedLabel: formatEstimatedLabel(focusSource.estimated_minutes),
          title: focusSource.title,
        }
      : null,
    gradesPanel,
    schedule,
    stats: {
      activeCourses: courses.length,
      completedAssignments: completedAssignments.length,
      completionRate:
        assignments.length === 0
          ? 0
          : Math.round((completedAssignments.length / assignments.length) * 100),
      currentGpa,
      dueThisWeek,
      gpaDelta:
        gpaDelta != null && Object.is(gpaDelta, -0) ? 0 : gpaDelta,
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

export function buildAssignmentsViewModel(
  courses: CourseRow[],
  assignments: AssignmentRow[],
  options: {
    courseId?: string;
    query?: string;
    status?: AssignmentsStatusFilter;
    sort?: AssignmentsSortOption;
  } = {},
): AssignmentsViewModel {
  const currentDate = new Date();
  const selectedCourseId = options.courseId ?? "all";
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";
  const activeStatus = options.status ?? "all";
  const courseLookup = new Map(
    courses.map((course) => [
      course.id,
      { color: course.color, name: course.name },
    ]),
  );

  const matchingStatusAssignments = assignments.filter((assignment) => {
    const completed = isCompletedStatus(assignment.status);
    const overdue = isOverdueAssignment(assignment, currentDate, completed);

    if (activeStatus === "completed") {
      return completed;
    }

    if (activeStatus === "overdue") {
      return overdue;
    }

    if (activeStatus === "upcoming") {
      return !completed && !overdue;
    }

    return !completed;
  });

  const filteredAssignments = matchingStatusAssignments.filter((assignment) => {
    const matchesCourse =
      selectedCourseId === "all" || assignment.course_id === selectedCourseId;
    const courseName =
      courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned";
    const searchText = `${assignment.title} ${courseName}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || searchText.includes(normalizedQuery);

    return matchesCourse && matchesQuery;
  });

  const sortedAssignments = [...filteredAssignments].sort(compareAssignments);
  const groupedAssignments = new Map<string, AssignmentsListItem[]>();

  sortedAssignments.forEach((assignment) => {
    const groupId = getAssignmentGroup(assignment, currentDate);
    const course = courseLookup.get(assignment.course_id ?? "");
    const bucket = groupedAssignments.get(groupId) ?? [];

    bucket.push({
      course: course?.name ?? "Unassigned",
      courseColor: course?.color ?? null,
      courseId: assignment.course_id,
      dueLabel: formatAssignmentTimeline(assignment.due_at, currentDate),
      id: assignment.id,
      isCompleted: isCompletedStatus(assignment.status),
      isOverdue: isOverdueAssignment(assignment, currentDate),
      title: assignment.title,
      weightPercent: assignment.weight_percent,
    });

    groupedAssignments.set(groupId, bucket);
  });

  const sectionsOrder = [
    { id: "overdue", label: "Overdue" },
    { id: "today", label: "Today" },
    { id: "this-week", label: "This Week" },
    { id: "later", label: "Later" },
    { id: "completed", label: "Completed" },
  ] as const;

  const sections = sectionsOrder
    .map((section) => {
      const items = groupedAssignments.get(section.id) ?? [];

      return {
        id: section.id,
        itemCount: items.length,
        items,
        label: section.label,
      } satisfies AssignmentsSection;
    })
    .filter((section) => {
      if (section.itemCount === 0) {
        return false;
      }

      if (activeStatus === "all") {
        return section.id !== "completed";
      }

      if (activeStatus === "upcoming") {
        return section.id !== "overdue" && section.id !== "completed";
      }

      if (activeStatus === "overdue") {
        return section.id === "overdue";
      }

      return section.id === "completed";
    });

  const courseCounts = new Map<string, number>();
  matchingStatusAssignments.forEach((assignment) => {
    if (normalizedQuery.length > 0) {
      const courseName =
        courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned";
      const searchText = `${assignment.title} ${courseName}`.toLowerCase();

      if (!searchText.includes(normalizedQuery)) {
        return;
      }
    }

    if (!assignment.course_id) {
      return;
    }

    courseCounts.set(
      assignment.course_id,
      (courseCounts.get(assignment.course_id) ?? 0) + 1,
    );
  });

  const courseChips: AssignmentsCourseChip[] = [
    {
      color: null,
      count: filteredAssignments.length,
      id: "all",
      label: "All courses",
    },
    ...courses
      .map((course) => ({
        color: course.color,
        count: courseCounts.get(course.id) ?? 0,
        id: course.id,
        label: course.name,
      }))
      .filter((course) => course.count > 0 || course.id === selectedCourseId),
  ];

  const openAssignments = assignments.filter(
    (assignment) => !isCompletedStatus(assignment.status),
  );
  const completedAssignments = assignments.filter((assignment) =>
    isCompletedStatus(assignment.status),
  );
  const dueThisWeekCount = openAssignments.filter((assignment) => {
    if (!assignment.due_at) {
      return false;
    }

    const date = new Date(assignment.due_at);
    return !Number.isNaN(date.getTime()) && isWithinThisWeek(date, currentDate);
  }).length;
  const overdueCount = openAssignments.filter((assignment) =>
    isOverdueAssignment(assignment, currentDate),
  ).length;

  let emptyMessage = "No assignments match your current filters.";

  if (assignments.length === 0) {
    emptyMessage =
      courses.length === 0
        ? "Start by creating a course or importing a syllabus, then your assignments will appear here."
        : "No assignments yet. Add one manually or import them from a syllabus to get started.";
  } else if (activeStatus === "completed") {
    emptyMessage = "No completed assignments match this view yet.";
  } else if (activeStatus === "overdue") {
    emptyMessage = "Nothing is overdue right now.";
  } else if (activeStatus === "upcoming") {
    emptyMessage = "No upcoming assignments match this view.";
  }

  return {
    completedCount: completedAssignments.length,
    courseChips,
    dueThisWeekCount,
    emptyMessage,
    openCount: openAssignments.length,
    overdueCount,
    sections,
    totalCount: assignments.length,
  };
}

function formatCompletedLabel(assignment: AssignmentRow) {
  const completedAt = assignment.completed_at
    ? new Date(assignment.completed_at)
    : null;

  if (completedAt && !Number.isNaN(completedAt.getTime())) {
    return `Completed ${new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(completedAt)}`;
  }

  const dueAt = assignment.due_at ? new Date(assignment.due_at) : null;

  if (dueAt && !Number.isNaN(dueAt.getTime())) {
    return `Due ${new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(dueAt)}`;
  }

  return "Completed date unavailable";
}

export function buildGradesViewModel(
  courses: CourseRow[],
  assignments: AssignmentRow[],
  options: {
    courseId?: string;
    query?: string;
    sort?: GradesSortOption;
    status?: GradesStatusFilter;
  } = {},
): GradesViewModel {
  const selectedCourseId = options.courseId ?? "all";
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";
  const activeStatus = options.status ?? "all";
  const courseLookup = new Map(
    courses.map((course) => [
      course.id,
      { color: course.color, name: course.name },
    ]),
  );

  const completedAssignments = assignments.filter((assignment) =>
    isCompletedStatus(assignment.status),
  );
  const gradedAssignments = completedAssignments.filter((assignment) =>
    hasAssignmentGrade(assignment),
  );
  const matchingStatusAssignments = completedAssignments.filter((assignment) => {
    const graded = hasAssignmentGrade(assignment);

    if (activeStatus === "graded") {
      return graded;
    }

    if (activeStatus === "ungraded") {
      return !graded;
    }

    return true;
  });

  const filteredAssignments = matchingStatusAssignments.filter((assignment) => {
    const matchesCourse =
      selectedCourseId === "all" || assignment.course_id === selectedCourseId;
    const courseName =
      courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned";
    const searchText = `${assignment.title} ${courseName}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || searchText.includes(normalizedQuery);

    return matchesCourse && matchesQuery;
  });

  const items = [...filteredAssignments].sort(compareCompletedAssignments).map((assignment) => {
    const course = courseLookup.get(assignment.course_id ?? "");

    return {
      completedLabel: formatCompletedLabel(assignment),
      course: course?.name ?? "Unassigned",
      courseColor: course?.color ?? null,
      courseId: assignment.course_id,
      gradeDisplay: formatGradeValue(assignment),
      gradeLetter: normalizeGradeLetter(assignment.grade_letter),
      gradeNumber: normalizeGradeNumber(assignment.grade_number),
      gradeType: assignment.grade_type,
      id: assignment.id,
      isGraded: hasAssignmentGrade(assignment),
      title: assignment.title,
    } satisfies GradesListItem;
  });

  const courseCounts = new Map<string, number>();
  matchingStatusAssignments.forEach((assignment) => {
    if (normalizedQuery.length > 0) {
      const courseName =
        courseLookup.get(assignment.course_id ?? "")?.name ?? "Unassigned";
      const searchText = `${assignment.title} ${courseName}`.toLowerCase();

      if (!searchText.includes(normalizedQuery)) {
        return;
      }
    }

    if (!assignment.course_id) {
      return;
    }

    courseCounts.set(
      assignment.course_id,
      (courseCounts.get(assignment.course_id) ?? 0) + 1,
    );
  });

  const courseChips: GradesCourseChip[] = [
    {
      color: null,
      count: items.length,
      id: "all",
      label: "All courses",
    },
    ...courses
      .map((course) => ({
        color: course.color,
        count: courseCounts.get(course.id) ?? 0,
        id: course.id,
        label: course.name,
      }))
      .filter((course) => course.count > 0 || course.id === selectedCourseId),
  ];

  let emptyMessage = "No completed assignments match your current filters.";

  if (completedAssignments.length === 0) {
    emptyMessage =
      assignments.length === 0
        ? "Completed assignments will show up here after you add coursework and mark it done."
        : "You have assignments, but none are marked completed yet.";
  } else if (activeStatus === "graded") {
    emptyMessage = "No graded assignments match this view yet.";
  } else if (activeStatus === "ungraded") {
    emptyMessage = "Every completed assignment in this view already has a grade.";
  }

  return {
    completedCount: completedAssignments.length,
    courseChips,
    emptyMessage,
    gradedCount: gradedAssignments.length,
    items,
    missingGradeCount: completedAssignments.length - gradedAssignments.length,
  };
}

async function loadAcademicData(userId: string) {
  const [coursesResult, assignmentsResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, user_id, name, color, term, credits, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("assignments")
      .select(ASSIGNMENT_SELECT_COLUMNS)
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

    if (isMissingCoursesCreditsColumnError(coursesResult.error)) {
      throw new Error(getMissingCourseCreditsAndGradeUpdatedAtMessage());
    }

    throw coursesResult.error;
  })();

  const assignments = (() => {
    if (!assignmentsResult.error) {
      return (assignmentsResult.data ?? []) as AssignmentRow[];
    }

    if (isMissingAssignmentsGradeColumnsError(assignmentsResult.error)) {
      throw new Error(getMissingAssignmentsGradeColumnsMessage());
    }

    if (isMissingAssignmentsGradeUpdatedAtColumnError(assignmentsResult.error)) {
      throw new Error(getMissingCourseCreditsAndGradeUpdatedAtMessage());
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
    assignments,
    courses,
  };
}

async function loadDashboardViewModel(userId: string) {
  const data = await loadAcademicData(userId);

  return {
    assignments: data.assignments,
    courses: buildCourseOptions(data.courses),
    rawCourses: data.courses,
    viewModel: buildDashboardViewModel(data.courses, data.assignments),
  };
}

export async function createCourse(input: CreateCourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      color: normalizeOptionalText(input.color),
      credits: normalizeCourseCredits(input.credits),
      name: input.name.trim(),
      term: normalizeOptionalText(input.term),
      user_id: input.userId,
    })
    .select("id, user_id, name, color, term, credits, created_at")
    .single();

  if (error) {
    if (isMissingCoursesCreditsColumnError(error)) {
      throw new Error(getMissingCourseCreditsAndGradeUpdatedAtMessage());
    }

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
  const normalizedWeightPercent = normalizeWeightPercent(input.weightPercent);
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      course_id: input.courseId,
      due_at: input.dueAt ?? null,
      estimated_minutes: normalizeEstimatedMinutes(input.estimatedMinutes),
      status: "todo",
      title: input.title.trim(),
      user_id: input.userId,
      ...(normalizedWeightPercent != null
        ? { weight_percent: normalizedWeightPercent }
        : {}),
    })
    .select(ASSIGNMENT_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isMissingAssignmentsGradeColumnsError(error)) {
      throw new Error(getMissingAssignmentsGradeColumnsMessage());
    }

    if (isMissingAssignmentsWeightColumnError(error)) {
      throw new Error(getMissingAssignmentsWeightColumnMessage());
    }

    throw error;
  }

  return data as AssignmentRow;
}

export async function bulkCreateAssignments(inputs: CreateAssignmentInput[]) {
  if (inputs.length === 0) {
    return [] as AssignmentRow[];
  }

  const payload = inputs.map((input) => {
    const normalizedWeightPercent = normalizeWeightPercent(input.weightPercent);

    return {
      course_id: input.courseId,
      due_at: input.dueAt ?? null,
      estimated_minutes: normalizeEstimatedMinutes(input.estimatedMinutes),
      status: "todo",
      title: input.title.trim(),
      user_id: input.userId,
      ...(normalizedWeightPercent != null
        ? { weight_percent: normalizedWeightPercent }
        : {}),
    };
  });

  debugTable(
    "assignments-db",
    "Inserting assignments into Supabase",
    payload.map((row) => ({
      title: row.title,
      due_at: row.due_at ?? "(none)",
      status: row.status,
      course_id: row.course_id,
      user_id: row.user_id,
    })),
  );

  const { data, error } = await supabase
    .from("assignments")
    .insert(payload)
    .select(ASSIGNMENT_SELECT_COLUMNS);

  if (error) {
    if (isMissingAssignmentsGradeColumnsError(error)) {
      throw new Error(getMissingAssignmentsGradeColumnsMessage());
    }

    if (isMissingAssignmentsWeightColumnError(error)) {
      throw new Error(getMissingAssignmentsWeightColumnMessage());
    }

    debugLog("assignments-db", "Insert failed", error);
    throw error;
  }

  debugLog(
    "assignments-db",
    `Insert succeeded: ${(data ?? []).length} row(s) returned`,
    data,
  );

  return (data ?? []) as AssignmentRow[];
}

export async function updateAssignmentStatus(
  input: UpdateAssignmentStatusInput,
) {
  const { data, error } = await supabase
    .from("assignments")
    .update({
      completed_at: input.isCompleted ? new Date().toISOString() : null,
      status: input.isCompleted ? "done" : "todo",
    })
    .eq("id", input.assignmentId)
    .select(ASSIGNMENT_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isMissingAssignmentsGradeColumnsError(error)) {
      throw new Error(getMissingAssignmentsGradeColumnsMessage());
    }

    throw error;
  }

  return data as AssignmentRow;
}

export async function updateAssignmentGrade(
  input: UpdateAssignmentGradeInput,
) {
  const nextGradeType = input.gradeType;
  const nextGradeNumber =
    nextGradeType === "number" ? normalizeGradeNumber(input.gradeNumber) : null;
  const nextGradeLetter =
    nextGradeType === "letter" ? normalizeGradeLetter(input.gradeLetter) : null;

  if (nextGradeType === "number" && nextGradeNumber == null) {
    throw new Error("Enter a numeric grade before saving.");
  }

  if (nextGradeType === "letter" && nextGradeLetter == null) {
    throw new Error("Choose a letter grade before saving.");
  }

  const { data, error } = await supabase
    .from("assignments")
    .update({
      grade_letter: nextGradeLetter,
      grade_number: nextGradeNumber,
      grade_type: nextGradeType,
      grade_updated_at: new Date().toISOString(),
    })
    .eq("id", input.assignmentId)
    .select(ASSIGNMENT_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isMissingAssignmentsGradeColumnsError(error)) {
      throw new Error(getMissingAssignmentsGradeColumnsMessage());
    }

    if (isMissingAssignmentsGradeUpdatedAtColumnError(error)) {
      throw new Error(getMissingCourseCreditsAndGradeUpdatedAtMessage());
    }

    throw error;
  }

  return data as AssignmentRow;
}

export function useDashboardData(userId: string): DashboardDataResult {
  const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);
  const [courses, setCourses] = React.useState<DashboardCourseOption[]>([]);
  const [rawCourses, setRawCourses] = React.useState<CourseRow[]>([]);
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
        nextResult.rawCourses.length > 0 ||
        nextResult.viewModel.stats.openAssignments > 0 ||
        nextResult.viewModel.stats.completedAssignments > 0;

      debugLog("dashboard", "Reloaded academic data from Supabase", {
        status: hasAnyData ? "ready" : "empty",
        courses: nextResult.rawCourses.length,
        assignments: nextResult.assignments.length,
        openAssignments: nextResult.viewModel.stats.openAssignments,
        completedAssignments: nextResult.viewModel.stats.completedAssignments,
      });

      setAssignments(nextResult.assignments);
      setCourses(nextResult.courses);
      setRawCourses(nextResult.rawCourses);
      setViewModel(nextResult.viewModel);
      setStatus(hasAnyData ? "ready" : "empty");
    } catch (loadError) {
      const message = getErrorMessage(loadError);

      console.error("Dashboard load failed.", loadError);
      setAssignments([]);
      setCourses([]);
      setRawCourses([]);
      setError(message);
      setViewModel(null);
      setStatus("error");
    }
  }, [userId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return {
    assignments,
    courses,
    error,
    rawCourses,
    reload,
    status,
    viewModel,
  };
}
