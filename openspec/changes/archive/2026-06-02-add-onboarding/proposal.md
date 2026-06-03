## Why

New users need a guided first-run path so they can understand the core flows without guessing how the app works. Right now the product already supports courses, assignments, grades, GPA, and theme preferences, but those capabilities are only obvious once someone has already learned the interface.

An onboarding modal will make the app easier to try with friends by showing the main actions up front:

- add a course
- add an assignment
- complete an assignment
- check and set grades

## What Changes

- Add a lightweight onboarding modal for first-time or manually triggered use.
- Explain the primary workflows in plain language with short steps or cards.
- Show where to add courses and assignments, how completion works, and how grades are edited.
- Keep the onboarding dismissible so experienced users can skip it after the first view.
- Make the modal reusable so it can also be opened later from a help or getting-started entry point.

## Non-Goals

- Building a full interactive product tour with step-by-step automation.
- Adding role-based onboarding paths or separate flows for teachers and students.
- Reworking the core dashboard layout or task management models.
- Changing the existing assignment, course, or grade data model beyond what is needed to explain it.
