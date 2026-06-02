"use client";

import type {
  AssignmentRow,
  CourseRow,
} from "@/components/dashboard/dashboard-data";

export type SemesterOption = {
  id: string;
  kind: "all" | "term";
  label: string;
  normalizedTerm: string | null;
};

type ResolveSemesterSelectionInput = {
  currentAcademicTermLabel: string;
  currentSelectionId: string | null;
  options: SemesterOption[];
  savedSelectionId: string | null;
};

const ALL_SEMESTERS_OPTION: SemesterOption = {
  id: "all-semesters",
  kind: "all",
  label: "All semesters",
  normalizedTerm: null,
};

function getTimestampValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function normalizeSemesterTerm(term: string | null | undefined) {
  const trimmedTerm = term?.trim();

  if (!trimmedTerm) {
    return null;
  }

  return trimmedTerm.toLowerCase();
}

export function buildSemesterOptionId(normalizedTerm: string) {
  return `term:${normalizedTerm}`;
}

export function buildSemesterOptions(courses: CourseRow[]): SemesterOption[] {
  const optionsByTerm = new Map<
    string,
    { label: string; lastCreatedAt: number; lastSeenIndex: number }
  >();

  courses.forEach((course, index) => {
    const normalizedTerm = normalizeSemesterTerm(course.term);

    if (!normalizedTerm) {
      return;
    }

    const trimmedLabel = course.term?.trim() ?? "";
    const createdAt = getTimestampValue(course.created_at) ?? index;
    const currentOption = optionsByTerm.get(normalizedTerm);

    if (
      !currentOption ||
      createdAt > currentOption.lastCreatedAt ||
      (createdAt === currentOption.lastCreatedAt &&
        index > currentOption.lastSeenIndex)
    ) {
      optionsByTerm.set(normalizedTerm, {
        label: trimmedLabel,
        lastCreatedAt: createdAt,
        lastSeenIndex: index,
      });
    }
  });

  const termOptions = Array.from(optionsByTerm.entries())
    .sort((left, right) => {
      const [, leftValue] = left;
      const [, rightValue] = right;

      if (leftValue.lastCreatedAt !== rightValue.lastCreatedAt) {
        return rightValue.lastCreatedAt - leftValue.lastCreatedAt;
      }

      return rightValue.lastSeenIndex - leftValue.lastSeenIndex;
    })
    .map(([normalizedTerm, value]) => ({
      id: buildSemesterOptionId(normalizedTerm),
      kind: "term" as const,
      label: value.label,
      normalizedTerm,
    }));

  return [ALL_SEMESTERS_OPTION, ...termOptions];
}

export function getSemesterOptionById(
  options: SemesterOption[],
  selectedSemesterId: string | null,
) {
  return (
    options.find((option) => option.id === selectedSemesterId) ??
    options[0] ??
    ALL_SEMESTERS_OPTION
  );
}

export function resolveSelectedSemesterId({
  currentAcademicTermLabel,
  currentSelectionId,
  options,
  savedSelectionId,
}: ResolveSemesterSelectionInput) {
  const hasOption = (optionId: string | null) =>
    optionId != null && options.some((option) => option.id === optionId);

  if (hasOption(currentSelectionId)) {
    return currentSelectionId as string;
  }

  if (hasOption(savedSelectionId)) {
    return savedSelectionId as string;
  }

  const normalizedCurrentAcademicTerm =
    normalizeSemesterTerm(currentAcademicTermLabel);
  const matchingCurrentTermOption =
    normalizedCurrentAcademicTerm == null
      ? null
      : options.find(
          (option) =>
            option.kind === "term" &&
            option.normalizedTerm === normalizedCurrentAcademicTerm,
        );

  if (matchingCurrentTermOption) {
    return matchingCurrentTermOption.id;
  }

  const mostRecentTermOption = options.find((option) => option.kind === "term");

  if (mostRecentTermOption) {
    return mostRecentTermOption.id;
  }

  return ALL_SEMESTERS_OPTION.id;
}

export function filterCoursesBySemester(
  courses: CourseRow[],
  option: SemesterOption,
) {
  if (option.kind === "all") {
    return courses;
  }

  return courses.filter(
    (course) => normalizeSemesterTerm(course.term) === option.normalizedTerm,
  );
}

export function filterAssignmentsBySemester(
  assignments: AssignmentRow[],
  visibleCourses: CourseRow[],
  option: SemesterOption,
) {
  if (option.kind === "all") {
    return assignments;
  }

  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));

  return assignments.filter(
    (assignment) =>
      assignment.course_id != null && visibleCourseIds.has(assignment.course_id),
  );
}

export function getSemesterPrefillValue(option: SemesterOption) {
  return option.kind === "term" ? option.label : "";
}

export const SEMESTER_SELECTION_STORAGE_KEY = "scholar-selected-semester";
