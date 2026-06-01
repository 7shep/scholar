## Overview

This change adds a dedicated Grades workspace inside the existing authenticated shell. The page should match the product direction from the provided mockup: practical, compact, and optimized for entering grades against completed assignments that already belong to the signed-in user.

The implementation should reuse the current shared course-and-assignment loading flow instead of introducing a separate grade fetch path.

## Product Direction

- Keep one authenticated shell with multiple views instead of introducing a router.
- Treat grades as assignment metadata for this phase.
- Only surface completed assignments on the Grades page.
- Make missing grades feel actionable and already-graded items easy to scan.

## Data Model

The existing `assignments` table should store the first version of grade data directly.

Add nullable fields:

- `grade_type`
  - string enum-like value: `number` or `letter`
- `grade_number`
  - numeric value for numeric grades
- `grade_letter`
  - string value for letter grades

Rules:

- an assignment can have no grade yet
- if `grade_type = number`, `grade_number` should be set and `grade_letter` should be null
- if `grade_type = letter`, `grade_letter` should be set and `grade_number` should be null
- only completed assignments should be editable from the page, but persisted grade fields may still exist on any assignment row

The repo already documents lightweight SQL patches under `docs/`, so this change should follow that pattern with a new SQL file for the grade columns.

## Navigation And Shell

The current shell already switches between `dashboard` and `assignments` using shared state in `HomePage`. Extend that state to also support:

- `grades`

The sidebar `Grades` item should become a working navigation item with correct active styling.

## Grades View Model

Add a dedicated builder alongside the existing dashboard and assignments view models.

Suggested responsibilities:

- filter the raw assignment list down to completed assignments only
- derive summary counts:
  - completed assignments
  - graded assignments
  - assignments missing a grade
- derive course chips from completed assignments
- support status tabs:
  - `all`
  - `graded`
  - `ungraded`
- support client-side search by assignment title and course name
- support initial sort by most recent completed items first
- return an empty-state message that distinguishes:
  - no completed assignments at all
  - no items matching the current filters

## Page Structure

1. Header
   - title: `Grades`
   - short subtitle about tracking grades for completed assignments
2. Summary cards
   - completed
   - graded
   - missing a grade
3. Filter surface
   - status tabs
   - search input
   - sort control
   - dynamic course chips
4. List of completed assignments
   - each row shows title, course, and completion date/timeline
   - graded rows show current value and an `Edit` action
   - ungraded rows show a `Needs grade` badge and inline entry controls

## Inline Grade Entry

Each editable row should support two modes:

- display mode
  - used when a grade exists and the user is not editing
- edit mode
  - used for ungraded items by default
  - reused when editing an existing grade

Inputs:

- grade type toggle: `Number` or `Letter`
- number input when `Number` is selected
- letter select when `Letter` is selected
- save button

Behavior:

- save inline without leaving the page
- keep only one grade representation populated at a time
- show lightweight success feedback after save
- keep interaction scoped to the row that changed

## State Model

The Grades workspace should support:

- `loading`
- `error`
- `empty`
- `ready`

Within the ready state, it should also support:

- filtered empty state
- row-level saving state
- row-level editing state

## Risks

- If grade fields are not documented clearly, local databases will drift from the UI expectation.
- If the page mixes raw Supabase update logic directly into presentational markup, future grade features will become harder to extend.
- If ungraded and graded rows are not visually distinct, the page will feel noisy rather than task-oriented.
