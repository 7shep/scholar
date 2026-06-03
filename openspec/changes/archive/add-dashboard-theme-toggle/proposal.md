## Why

The signed-in shell currently has one fixed visual mode. Users need a quick way to switch between light and dark presentation while staying inside the dashboard experience, and the sidebar already has a natural control area near the semester selector where this toggle can live.

## What Changes

- Add a light/dark mode toggle beside the semester control in the sidebar.
- Show a sun icon when light mode is active and a moon icon when dark mode is active.
- Persist the selected theme for the signed-in shell.
- Apply dark mode styling across the authenticated dashboard, assignments, grades, and modal surfaces.

## Non-Goals

- Redesigning the auth/sign-in experience around the same toggle.
- Adding more theme variants beyond light and dark.
- Reworking visual hierarchy or layout beyond what is needed to support the theme switch.
