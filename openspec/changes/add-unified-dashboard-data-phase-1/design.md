## Overview

This change introduces the first real dashboard data pipeline while keeping the existing dashboard layout intact. The dashboard remains a single signed-in landing page that summarizes the user's academic workload across all courses.

Because users cannot create courses yet, the dashboard must support a true zero-data state. That state is not an error. It is a valid first-run experience.

## Product Direction

- One dashboard per user, not one dashboard per course.
- Courses act as metadata for assignments and summary panels.
- The dashboard should remain useful as an overview layer, even as more course-specific workflows are added later.

## Initial Data Scope

Phase 1 should focus on the smallest data model that makes the dashboard feel real:

- `courses`
  - `id`
  - `user_id`
  - `name`
  - `color`
  - `term`
  - `created_at`
- `assignments`
  - `id`
  - `user_id`
  - `course_id`
  - `title`
  - `due_at`
  - `status`
  - `difficulty`
  - `estimated_minutes`
  - `created_at`

These entities are enough to drive:

- Up Next
- Focus Card
- Due This Week
- Completion Rate
- Mini calendar deadline markers

## Data Mapping

The UI should be driven from one aggregate dashboard view model rather than letting each component fetch independently.

```text
auth user
   |
   v
load courses + assignments
   |
   v
build dashboard view model
   |
   +-- stats
   +-- prioritized assignments
   +-- focus item
   +-- upcoming deadlines
   +-- course labels
```

Suggested frontend shape:

- `useDashboardData(userId)` loads raw rows from Supabase.
- A mapper builds derived dashboard values in one place.
- `HomePage` decides whether to render loading, empty, error, or ready content.
- Presentational dashboard widgets receive props instead of owning mock state.

## State Model

The dashboard should support four explicit states:

1. `loading`
2. `error`
3. `empty`
4. `ready`

Definitions:

- `empty` means the user has no courses and no assignments yet.
- `ready` means there is enough data to render at least one real panel.
- `error` means a fetch or mapping step failed unexpectedly.

## Empty State

The empty state should live inside the dashboard shell so the signed-in experience still feels complete.

It should:

- Explain that no academic data exists yet.
- Avoid implying that separate dashboards or course-specific pages are required.
- Leave room for a future course creation or import flow.

Phase 1 should not invent a fake creation flow. A placeholder call to action is acceptable only if it is clearly non-functional or intentionally deferred.

## Widget Strategy

- `UpNextPanel`: first widget to use real data, sourced from incomplete assignments ordered by due date.
- `FocusCard`: derived from the highest-priority incomplete assignment.
- `StatsRow`: replace assignment-based cards first; keep unsupported metrics hidden or clearly placeholder-only.
- `MiniCalendar`: use assignment due dates as the initial event source.
- `CourseGrades`: keep mocked, hide it, or convert it to a placeholder until grade data exists.

## Technical Notes

- Continue using the existing Supabase client and auth context.
- Keep fetch logic outside the presentational components under `src/components/dashboard/`.
- Avoid introducing a heavy data-fetching framework for this slice unless the codebase already needs it.
- Preserve the current dashboard visual language and responsive layout.

## Risks

- If unsupported metrics remain visible beside real data, the dashboard may feel inconsistent.
- If each widget fetches separately, loading behavior will become fragmented and harder to reason about.
- If the empty state is treated as an exception, first-run users will get a broken-feeling product.
