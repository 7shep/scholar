## Why

The dashboard now has the right visual structure, but it still runs entirely on mock content. We need to start connecting it to real user data without overcommitting to a full academic data model too early.

The first version should stay as one unified dashboard across all courses. It should not create a separate dashboard per course, and it must work even when the user has no academic data yet.

## What Changes

- Add a real dashboard data layer for the signed-in user.
- Aggregate dashboard content across all courses into one home dashboard.
- Replace the current mock assignment and schedule content with fetched data where the supporting model exists.
- Add loading, empty, and error states for the dashboard.
- Introduce a zero-data empty state for users who do not yet have any courses or assignments.

## Non-Goals

- Creating a separate dashboard for each course.
- Building a course creation or course management flow.
- Implementing full gradebook or GPA calculation logic.
- Implementing calendar sync, recurring events, or notifications.
- Changing authentication or the general post-sign-in layout.
