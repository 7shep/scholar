## Overview

This change adds a minimal course-credit model and uses the existing assignment-grade data to derive a dashboard GPA summary.

The implementation should stay lightweight:

- store credits directly on `courses`
- store the last grade update time directly on `assignments`
- compute course averages from graded completed assignments
- convert course averages to GPA points using the existing letter-grade scale
- weight the overall GPA by course credits

## Data Model

### Courses

Add `credits integer not null default 3` to `courses`, constrained to `3` or `6`.

This keeps the UI simple and avoids translating a boolean at every read site.

### Assignments

Add `grade_updated_at timestamptz` to `assignments`.

Whenever a grade is saved:

- update `grade_type`
- update `grade_number`
- update `grade_letter`
- set `grade_updated_at = now()`

Existing rows can leave `grade_updated_at` null until the next save.

## GPA Derivation

### Course average

For each course:

1. gather completed assignments with a usable grade
2. convert numeric or letter grades to a percentage
3. use weighted average when every graded assignment in the course has a positive `weight_percent`
4. otherwise use a simple average

### Course GPA points

Convert the course average percentage to a letter using the existing grade scale, then map that letter to GPA points:

- `A+`, `A` => `4.0`
- `A-` => `3.7`
- `B+` => `3.3`
- `B` => `3.0`
- `B-` => `2.7`
- `C+` => `2.3`
- `C` => `2.0`
- `C-` => `1.7`
- `D+` => `1.3`
- `D` => `1.0`
- `D-` => `0.7`
- `F` => `0.0`

### Overall GPA

The current GPA is:

```text
sum(course_gpa_points * course_credits) / sum(course_credits)
```

Only courses with at least one graded completed assignment participate.

### GPA delta

To approximate "before they last updated their grades", derive a comparison GPA by excluding any assignments whose `grade_updated_at` matches the latest grade-update timestamp found in the user's data.

That supports the common case where a user updates one grade or saves a small batch in one moment, without introducing a full grade history table.

If there is no prior GPA after excluding the latest batch, the delta should be omitted.

## UI Notes

- Replace the first dashboard stat card with a GPA card.
- Preserve the current card grid and visual language.
- Label should read `Current GPA`.
- The main value should render to two decimals.
- The small comparison badge should show signed delta like `+0.12` or `-0.08` when available.
- If the user has no graded coursework yet, show a neutral placeholder such as `--` and omit the delta.

## Risks

- Existing databases need the new columns before the UI can fully load data. Error messages should stay actionable.
- A delta based on the latest grade-update batch is an approximation, not a full audit trail.
- Null `grade_updated_at` values on older rows mean only future grade saves contribute to the delta behavior.
