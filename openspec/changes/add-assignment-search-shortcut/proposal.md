## Why

The signed-in shell already suggests assignment search in two places, but the experience is incomplete. The Assignments page has a local filter input, while the dashboard top bar shows a `Search assignments...` field and `Ctrl K` hint that do not currently do anything. That leaves one of the app's most important retrieval actions feeling broken right where users expect quick access.

Students need a fast way to jump into their coursework list, narrow it by title or course, and do that without hunting for the Assignments tab first. A working keyboard shortcut is especially important here because the interface already teaches that pattern visually.

## What Changes

- Add a shared assignment search flow for the signed-in shell so dashboard search, Assignments search, and keyboard-triggered search all use the same query state.
- Make the dashboard top-bar search affordance functional by routing it into the Assignments search experience instead of leaving it as decorative UI.
- Add a global `Ctrl+K` shortcut in the authenticated app shell that opens the Assignments view and focuses the real search input.
- Update the Assignments page search input to accept shell-driven focus requests while keeping the existing assignment filtering, grouping, and empty states intact.
- Add keyboard and accessibility guardrails so the shortcut only intercepts when appropriate and does not interfere with typing inside forms or text editors.

## Non-Goals

- Building a generic command palette or omnibox for the whole app.
- Adding backend or fuzzy search infrastructure beyond the current client-side assignment filtering.
- Expanding search to grades, courses, uploaded documents, or marketing-site content in this phase.
- Redesigning the Assignments page beyond the interaction changes needed to support a functional search flow.
