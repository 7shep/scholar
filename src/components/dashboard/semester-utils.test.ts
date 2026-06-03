import { describe, expect, it } from "vitest";

import type {
  AssignmentRow,
  CourseRow,
} from "@/components/dashboard/dashboard-data";
import {
  buildSemesterOptions,
  filterAssignmentsBySemester,
  filterCoursesBySemester,
  getSemesterOptionById,
  getSemesterPrefillValue,
  getSemesterSelectionStorageKey,
  normalizeSemesterTerm,
  resolveSelectedSemesterId,
} from "@/components/dashboard/semester-utils";

function makeCourse(overrides: Partial<CourseRow> = {}): CourseRow {
  return {
    color: null,
    credits: 3,
    created_at: null,
    id: "course-id",
    name: "Course",
    term: null,
    user_id: "user-1",
    ...overrides,
  };
}

function makeAssignment(overrides: Partial<AssignmentRow> = {}): AssignmentRow {
  return {
    completed_at: null,
    course_id: null,
    created_at: null,
    difficulty: null,
    due_at: null,
    estimated_minutes: null,
    grade_letter: null,
    grade_number: null,
    grade_type: null,
    grade_updated_at: null,
    id: "assignment-id",
    status: null,
    title: "Assignment",
    user_id: "user-1",
    weight_percent: null,
    ...overrides,
  };
}

describe("normalizeSemesterTerm", () => {
  it("trims and lowercases a term", () => {
    expect(normalizeSemesterTerm("  Fall 2024 ")).toBe("fall 2024");
  });

  it("treats empty or whitespace-only terms as null", () => {
    expect(normalizeSemesterTerm("")).toBeNull();
    expect(normalizeSemesterTerm("   ")).toBeNull();
    expect(normalizeSemesterTerm(null)).toBeNull();
    expect(normalizeSemesterTerm(undefined)).toBeNull();
  });
});

describe("buildSemesterOptions", () => {
  it("always puts an 'All semesters' option first", () => {
    const options = buildSemesterOptions([]);

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ id: "all-semesters", kind: "all" });
  });

  it("creates one option per distinct non-empty term", () => {
    const options = buildSemesterOptions([
      makeCourse({ id: "a", term: "Fall 2024" }),
      makeCourse({ id: "b", term: "Spring 2025" }),
    ]);

    const termOptions = options.filter((option) => option.kind === "term");
    expect(termOptions).toHaveLength(2);
  });

  it("ignores courses with no usable term", () => {
    const options = buildSemesterOptions([
      makeCourse({ id: "a", term: null }),
      makeCourse({ id: "b", term: "   " }),
    ]);

    expect(options.filter((option) => option.kind === "term")).toHaveLength(0);
  });

  it("collapses duplicate terms that differ only by case or whitespace", () => {
    const options = buildSemesterOptions([
      makeCourse({ id: "a", term: "Fall 2024" }),
      makeCourse({ id: "b", term: " fall 2024 " }),
    ]);

    expect(options.filter((option) => option.kind === "term")).toHaveLength(1);
  });

  it("preserves the first meaningful display label for a collapsed term", () => {
    const options = buildSemesterOptions([
      makeCourse({
        id: "first",
        term: "Fall 2024",
        created_at: "2024-08-01T00:00:00Z",
      }),
      makeCourse({
        id: "second",
        term: "FALL 2024",
        created_at: "2024-09-01T00:00:00Z",
      }),
    ]);

    const fallOption = options.find(
      (option) => option.normalizedTerm === "fall 2024",
    );
    expect(fallOption?.label).toBe("Fall 2024");
  });

  it("orders term options with the most recently created term first", () => {
    const options = buildSemesterOptions([
      makeCourse({
        id: "older",
        term: "Spring 2024",
        created_at: "2024-01-01T00:00:00Z",
      }),
      makeCourse({
        id: "newer",
        term: "Fall 2024",
        created_at: "2024-08-01T00:00:00Z",
      }),
    ]);

    const termOptions = options.filter((option) => option.kind === "term");
    expect(termOptions[0]?.normalizedTerm).toBe("fall 2024");
    expect(termOptions[1]?.normalizedTerm).toBe("spring 2024");
  });

  it("treats a missing created_at as the oldest term when ordering", () => {
    const options = buildSemesterOptions([
      makeCourse({ id: "undated", term: "Summer 2024", created_at: null }),
      makeCourse({
        id: "dated",
        term: "Fall 2024",
        created_at: "2024-08-01T00:00:00Z",
      }),
    ]);

    const termOptions = options.filter((option) => option.kind === "term");
    expect(termOptions[0]?.normalizedTerm).toBe("fall 2024");
    expect(termOptions[1]?.normalizedTerm).toBe("summer 2024");
  });
});

describe("resolveSelectedSemesterId", () => {
  const options = buildSemesterOptions([
    makeCourse({
      id: "a",
      term: "Fall 2024",
      created_at: "2024-08-01T00:00:00Z",
    }),
    makeCourse({
      id: "b",
      term: "Spring 2025",
      created_at: "2025-01-01T00:00:00Z",
    }),
  ]);

  it("keeps the current selection when it is still valid", () => {
    expect(
      resolveSelectedSemesterId({
        currentAcademicTermLabel: "Spring 2025",
        currentSelectionId: "term:fall 2024",
        options,
        savedSelectionId: "term:spring 2025",
      }),
    ).toBe("term:fall 2024");
  });

  it("restores the saved selection when there is no valid current one", () => {
    expect(
      resolveSelectedSemesterId({
        currentAcademicTermLabel: "Fall 2024",
        currentSelectionId: null,
        options,
        savedSelectionId: "term:spring 2025",
      }),
    ).toBe("term:spring 2025");
  });

  it("falls back to the matching academic term when nothing is saved", () => {
    expect(
      resolveSelectedSemesterId({
        currentAcademicTermLabel: "Fall 2024",
        currentSelectionId: null,
        options,
        savedSelectionId: null,
      }),
    ).toBe("term:fall 2024");
  });

  it("falls back to the most recent term when no academic term matches", () => {
    expect(
      resolveSelectedSemesterId({
        currentAcademicTermLabel: "Winter 2030",
        currentSelectionId: null,
        options,
        savedSelectionId: "term:does-not-exist",
      }),
    ).toBe("term:spring 2025");
  });

  it("falls back to all semesters when there are no term options", () => {
    expect(
      resolveSelectedSemesterId({
        currentAcademicTermLabel: "Fall 2024",
        currentSelectionId: null,
        options: buildSemesterOptions([]),
        savedSelectionId: null,
      }),
    ).toBe("all-semesters");
  });
});

describe("getSemesterOptionById", () => {
  const options = buildSemesterOptions([
    makeCourse({ id: "a", term: "Fall 2024" }),
  ]);

  it("returns the matching option", () => {
    expect(getSemesterOptionById(options, "term:fall 2024")?.label).toBe(
      "Fall 2024",
    );
  });

  it("falls back to the first option when the id is unknown", () => {
    expect(getSemesterOptionById(options, "term:missing").id).toBe(
      "all-semesters",
    );
  });
});

describe("filterCoursesBySemester", () => {
  const courses = [
    makeCourse({ id: "fall", term: "Fall 2024" }),
    makeCourse({ id: "spring", term: "Spring 2025" }),
    makeCourse({ id: "untermed", term: null }),
  ];

  it("returns every course for the all-semesters option", () => {
    const [allOption] = buildSemesterOptions(courses);
    expect(filterCoursesBySemester(courses, allOption)).toHaveLength(3);
  });

  it("returns only courses whose normalized term matches", () => {
    const fallOption = buildSemesterOptions(courses).find(
      (option) => option.normalizedTerm === "fall 2024",
    );

    const result = filterCoursesBySemester(courses, fallOption!);
    expect(result.map((course) => course.id)).toEqual(["fall"]);
  });
});

describe("filterAssignmentsBySemester", () => {
  const courses = [makeCourse({ id: "fall", term: "Fall 2024" })];
  const assignments = [
    makeAssignment({ id: "in-fall", course_id: "fall" }),
    makeAssignment({ id: "other-course", course_id: "spring" }),
    makeAssignment({ id: "orphan", course_id: null }),
  ];

  it("returns every assignment for the all-semesters option", () => {
    const [allOption] = buildSemesterOptions(courses);
    expect(
      filterAssignmentsBySemester(assignments, courses, allOption),
    ).toHaveLength(3);
  });

  it("keeps only assignments whose course is visible in the semester", () => {
    const fallOption = buildSemesterOptions(courses).find(
      (option) => option.normalizedTerm === "fall 2024",
    );

    const result = filterAssignmentsBySemester(assignments, courses, fallOption!);
    expect(result.map((assignment) => assignment.id)).toEqual(["in-fall"]);
  });
});

describe("getSemesterPrefillValue", () => {
  it("returns the term label for a specific semester", () => {
    const fallOption = buildSemesterOptions([
      makeCourse({ id: "a", term: "Fall 2024" }),
    ]).find((option) => option.kind === "term");

    expect(getSemesterPrefillValue(fallOption!)).toBe("Fall 2024");
  });

  it("returns an empty string for the all-semesters option", () => {
    const [allOption] = buildSemesterOptions([]);
    expect(getSemesterPrefillValue(allOption)).toBe("");
  });
});

describe("getSemesterSelectionStorageKey", () => {
  it("namespaces the selection key by user id", () => {
    expect(getSemesterSelectionStorageKey("user-a")).toBe(
      "scholar-selected-semester:user-a",
    );
    expect(getSemesterSelectionStorageKey("user-b")).toBe(
      "scholar-selected-semester:user-b",
    );
  });
});
