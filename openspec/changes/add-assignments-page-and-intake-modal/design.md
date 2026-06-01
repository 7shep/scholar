## Overview

This change adds a dedicated Assignments workspace inside the existing signed-in product shell. The new page should feel like a natural extension of the current dashboard visual language while giving assignments their own focused management surface.

The page should prioritize fast scanning and triage:

- show overall assignment health at the top
- let the user narrow the list by status and course
- make overdue and near-term work visually obvious
- provide a clear entry point for adding one assignment or importing many from a syllabus

## Product Direction

- Keep one authenticated shell with multiple views instead of treating Assignments as a separate product area.
- Reuse the current course and assignment data model wherever possible.
- Treat syllabus import as a guided workflow, not a blind one-click mutation.
- Preserve the lightweight, modern dashboard aesthetic already established in the app.

## Navigation And Shell

The current sidebar uses hard-coded active state. This change should move signed-in navigation to shared state so the shell can render either:

- `dashboard`
- `assignments`

Suggested shape:

- keep the top-level shell in `HomePage` for now unless a dedicated authenticated layout becomes cleaner during implementation
- pass the active view and navigation handler into `Sidebar`
- render `TopBar` only where it still makes sense, because the Assignments page has its own page header and primary action

This keeps the implementation small without introducing a full router before the app actually needs one.

## Assignments Page Structure

The page should follow the supplied mockup closely:

1. Header
   - title: `Assignments`
   - lightweight subtitle with open and completed counts
   - right-aligned `Add Assignment` button
2. Summary cards
   - total assignments
   - completed assignments
   - due this week
   - overdue
3. Filter surface
   - tabs: `All`, `Upcoming`, `Completed`, `Overdue`
   - search input
   - initial sort control: `Due date`
   - course filter chips including an `All courses` default
4. Grouped list
   - sections such as `Overdue`, `Today`, `This Week`, and `Later`
   - each row shows title, course, due time, completion control, and row affordance for future detail/edit behavior

## Data And View Model

The current dashboard already loads `courses` and `assignments` for the signed-in user. The Assignments page should follow the same pattern: fetch raw rows once, then derive a view model in one place instead of spreading logic across UI components.

Suggested responsibilities for an assignments data module:

- load courses and assignments for the signed-in user
- derive counts for the page header and summary cards
- split assignments into grouped sections by due date and completion state
- derive course chips from existing courses that have assignments or are selectable for manual creation
- apply client-side search and status filtering
- keep sort behavior centralized so later options can be added without rewriting the UI

The existing assignment fields are already sufficient for the first version:

- `title`
- `course_id`
- `due_at`
- `status`
- `difficulty`
- `estimated_minutes`

No schema change is required for the manual path.

## Manual Add Flow

Clicking `Add Assignment` should open the option-picker modal shown in the mockup. Choosing `Add manually` should continue into a manual entry flow that is optimized for assignment creation rather than the current dashboard-first course setup.

Suggested manual form fields:

- course selection
- assignment title
- due date and time
- optional difficulty
- optional estimated minutes

Behavior:

- require at least a title and course unless the product intentionally supports unassigned work
- insert the assignment through the existing assignments table
- close the modal and refresh both the Assignments page and dashboard-derived data after success

## Syllabus Import Flow

Choosing `Upload syllabus` should start a guided import flow:

1. choose an existing course or create/select the target course
2. upload a `PDF` or `DOCX` syllabus
3. parse the syllabus into assignment candidates
4. let the user review and edit extracted items
5. confirm bulk creation into `assignments`

For MVP, the uploaded syllabus can continue using the existing `course_documents` storage path and metadata table. The extracted assignment candidates do not need permanent persistence if the parse-and-review sequence can happen in one session.

The important product constraint is that AI extraction must be reviewable before assignments are written.

## State Model

The Assignments workspace should explicitly support:

- `loading`
- `error`
- `empty`
- `ready`

The add-assignment flow should explicitly support:

- chooser open
- manual form
- syllabus upload
- parsing
- review
- submitting
- success
- error

This avoids mixing unrelated async states into one boolean-heavy component.

## Reuse And Separation

- keep shared data access close to the existing dashboard data utilities when practical
- prefer a dedicated `AssignmentsPage` and add-assignment modal components over growing `HomePage` into one large file
- refresh shared assignment data after create or import so dashboard stats and assignments lists stay consistent

## Risks

- If navigation state remains ad hoc, future pages will become harder to add cleanly.
- If filtering and grouping are implemented directly inside presentational components, the page will become brittle quickly.
- If syllabus import skips a review step, incorrect assignment creation will damage user trust.
- If the page only works well on desktop widths, the dense filter and list layout will regress on smaller screens.
