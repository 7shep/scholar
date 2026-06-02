## Overview

This change introduces a shared semester-selection state in the signed-in app shell and uses the existing `courses.term` field as the source of semester options. The implementation should stay client-side and lightweight:

- no schema changes
- no new backend queries
- no replacement of the current free-text term field

Instead, the shell should normalize existing term values, let the user switch between them from the sidebar, and derive filtered course and assignment views from the already loaded academic data.

## Semester Option Model

Add a small client-side model for semester options:

- `id`: stable selection key
- `label`: user-facing text shown in the sidebar
- `normalizedTerm`: lowercase, trimmed comparison value for matching
- `kind`: `all` or `term`

Behavior:

- Build one `term` option per distinct non-empty `courses.term` value.
- Collapse duplicates by comparing normalized values while preserving the first meaningful display label.
- Always include an `All semesters` option.
- Courses with no `term` remain reachable through `All semesters`.

## Default Selection And Persistence

The signed-in shell should own:

- `selectedSemesterId`

Suggested selection order:

1. Restore the last saved selection from local storage if it still matches an available option.
2. Otherwise, if the current academic term label matches one of the normalized course terms, select that term.
3. Otherwise, select the most recently created available term option.
4. Otherwise, fall back to `All semesters`.

Persist the selected semester in local storage so the shell reopens in the same context next time.

## Filtering Strategy

Keep the current `useDashboardData` loader as the single place that fetches the full course and assignment dataset. Apply semester filtering after load inside the signed-in shell or shared dashboard helpers.

Filtering rules:

- `All semesters` shows every course and assignment.
- A specific semester shows only courses whose normalized `term` matches the selected option.
- Assignments participate in a semester only when their `course_id` belongs to a visible course.
- Dashboard stats and panels should be recomputed from the filtered course and assignment arrays instead of trying to mask already derived totals.
- Assignments and grades pages should receive semester-filtered data so their existing search and course-chip filters continue to work inside the selected semester.

## Sidebar Interaction

The sidebar semester button should become an actual selector in both layouts:

- desktop: stay beside the theme toggle
- mobile: stay in the compact control row under the brand block

Interaction expectations:

- clicking the button opens a simple menu or popover of semester options
- the current selection is obvious through active styling or a checkmark
- choosing a semester closes the menu and updates the shell immediately
- the button label reflects the active selection instead of always calling `getAcademicTermLabel()`

`getAcademicTermLabel()` should remain useful as a defaulting helper, not as the active filter source of truth.

## Course Creation Alignment

The current add-assignment flow can create a course inline and already accepts a free-text term. This change should align that flow with the active semester state:

- when the user creates a new course while a specific semester is selected, prefill the course term input with that semester label
- when the user is in `All semesters`, keep the term field editable and blank by default
- when showing existing courses in selectors, limit the visible course options to the active semester unless `All semesters` is selected

This reduces the chance that users accidentally create a course in one semester while viewing another.

## Risks

- Free-text terms can still fragment options if users enter substantially different labels like `Autumn 2026` and `Fall 2026`; this change only normalizes whitespace and casing.
- If the saved semester disappears because the user renames or deletes the last course in that term, the shell must recover gracefully to another valid option.
- Filtering only in the client means any future server-driven pagination or partial loading would need follow-up work, but it matches the current data-loading architecture.
