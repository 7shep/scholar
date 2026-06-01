## Why

The signed-in shell already shows a `Grades` destination in the sidebar, but students still have nowhere to record the results of completed work. The current product can track assignments and mark them complete, yet it stops short of the next natural step: logging the grade a student received after an assignment is returned.

Students need a focused page that uses their real completed assignments, makes missing grades easy to spot, and supports quick inline entry without turning the app into a full gradebook or GPA calculator.

## What Changes

- Add a dedicated signed-in Grades page reachable from the existing sidebar.
- Extend the assignment data model to persist either a numeric grade or a letter grade for each assignment.
- Build a Grades page that only shows completed assignments and derives summary counts, filters, and course chips from the signed-in user's real data.
- Support inline add, save, and edit behavior for assignment grades directly from the list.
- Add loading, error, zero-data, and filtered-empty states for the Grades page.
- Replace the deferred grades placeholder on the dashboard with a lightweight real-data grades panel.

## Non-Goals

- Building GPA, averages, trend charts, or analytics.
- Supporting grades for assignments that are not marked completed.
- Redesigning the dashboard or assignments page beyond the shared navigation/data hooks needed for Grades.
- Creating a separate grade entity when persisted assignment-level fields are sufficient for this version.
