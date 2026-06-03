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
const SEMESTER_SELECTION_STORAGE_KEY_PREFIX = "scholar-selected-semester";

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

type SemesterTermAccumulator = {
  label: string;
  recencyCreatedAt: number | null;
  recencyIndex: number;
};

// Orders two courses from newest to oldest. A missing `created_at` is treated
// as the oldest possible value, and the source array index (courses load in
// ascending creation order) is only used to break exact ties.
function compareRecencyDescending(
  leftCreatedAt: number | null,
  leftIndex: number,
  rightCreatedAt: number | null,
  rightIndex: number,
) {
  if (leftCreatedAt !== rightCreatedAt) {
    if (leftCreatedAt == null) {
      return 1;
    }

    if (rightCreatedAt == null) {
      return -1;
    }

    return rightCreatedAt - leftCreatedAt;
  }

  return rightIndex - leftIndex;
}

export function buildSemesterOptions(courses: CourseRow[]): SemesterOption[] {
  const optionsByTerm = new Map<string, SemesterTermAccumulator>();

  courses.forEach((course, index) => {
    const normalizedTerm = normalizeSemesterTerm(course.term);

    if (!normalizedTerm) {
      return;
    }

    const trimmedLabel = course.term?.trim() ?? "";
    const createdAt = getTimestampValue(course.created_at);
    const existingOption = optionsByTerm.get(normalizedTerm);

    if (!existingOption) {
      optionsByTerm.set(normalizedTerm, {
        label: trimmedLabel,
        recencyCreatedAt: createdAt,
        recencyIndex: index,
      });
      return;
    }

    // Keep the first meaningful label for the term, but advance the recency
    // markers so the option still sorts by its most recently created course.
    if (
      compareRecencyDescending(
        createdAt,
        index,
        existingOption.recencyCreatedAt,
        existingOption.recencyIndex,
      ) < 0
    ) {
      existingOption.recencyCreatedAt = createdAt;
      existingOption.recencyIndex = index;
    }
  });

  const termOptions = Array.from(optionsByTerm.entries())
    .sort(([, leftValue], [, rightValue]) =>
      compareRecencyDescending(
        leftValue.recencyCreatedAt,
        leftValue.recencyIndex,
        rightValue.recencyCreatedAt,
        rightValue.recencyIndex,
      ),
    )
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

export function getSemesterSelectionStorageKey(userId: string) {
  return `${SEMESTER_SELECTION_STORAGE_KEY_PREFIX}:${userId}`;
}
