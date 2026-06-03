## Why

Students can already add courses and record assignment grades, but the app still treats every course as structurally identical and the dashboard does not surface the metric many students care about most: current GPA.

To make the dashboard feel academically useful, course creation should capture whether a class spans two semesters, and the home dashboard should replace the "Active Courses" stat with a GPA card that reflects weighted course credits and shows how the GPA changed after the latest grade update.

## What Changes

- Extend course creation so a user can mark a course as a two-semester course.
- Persist course credits in the academic data model as `6` for two-semester courses and `3` otherwise.
- Extend assignment grade persistence with a grade update timestamp that can be used to compare current GPA against the GPA state before the latest grade change.
- Replace the dashboard's "Active Courses" stat card with a GPA card driven by real graded coursework.
- Show a GPA delta in the card based on the GPA before the most recent grade update batch.

## Non-Goals

- Building transcript import, term GPA breakdowns, or historical charts.
- Supporting arbitrary credit values beyond the 3-credit and 6-credit options in this UI.
- Redesigning the rest of the dashboard beyond the stat card swap needed for GPA.
- Backfilling historic grade-update timestamps beyond a safe default for existing rows.
