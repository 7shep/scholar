## Overview

This change turns assignment search into a shared shell capability instead of a page-local detail. The app already has the core filtering logic on the Assignments page, so the main design job is to connect the dashboard search affordance and the `Ctrl+K` shortcut to that existing search surface in a way that feels intentional and predictable.

The implementation should avoid inventing a second search system. There should be one assignment query value, one canonical search input on the Assignments page, and a small amount of shell state that can move the user there and focus it when requested.

## Current Behavior

- `AssignmentsPage` owns its own `searchQuery` state and filters assignments client-side through `buildAssignmentsViewModel`.
- `TopBar` renders a search field with a `Ctrl K` badge, but the input is not wired to any state, navigation, or filtering.
- `HomePage` owns signed-in shell state such as the active view, theme, and add-assignment modal, which makes it the right place to coordinate cross-view search behavior.
- There is no global keyboard listener for `Ctrl+K`, so the advertised shortcut is currently non-functional.

## Product Direction

- Keep the actual assignment filtering logic on the Assignments page and in the shared dashboard-data view-model layer.
- Treat the dashboard search field as an entry point into assignment search, not as a separate dashboard-only search implementation.
- Make `Ctrl+K` work from anywhere inside the authenticated shell, including Dashboard, Assignments, and Grades.
- Preserve the current app structure in `HomePage` unless the search coordination becomes complex enough to justify a small hook or helper module.

## Interaction Model

### Dashboard Search Entry

The dashboard top-bar search control should become a functional launcher into assignment search:

- focusing or clicking the dashboard search field should switch to the `assignments` view and focus the Assignments page search input
- if the user types into the dashboard field, the first entered value should be preserved and carried into the Assignments page query
- the query should remain visible when the user lands on the Assignments page so the behavior feels continuous rather than like a page jump

This lets the UI keep the familiar search affordance without maintaining a second independent filter surface on the dashboard itself.

### Global Keyboard Shortcut

`Ctrl+K` should register at the authenticated shell level:

- when pressed from a non-editable context, prevent the browser default and open the Assignments search input
- if the user is already on the Assignments page, focus the search input and select the existing query for quick replacement
- if the user is on Dashboard or Grades, switch to `assignments`, then focus the search input after the view renders
- do not hijack the shortcut when the active target is a text input, textarea, select, or contenteditable region unless the focused element is the app's own assignment search input

On macOS keyboards, supporting `Meta+K` alongside `Ctrl+K` is acceptable if it comes naturally from the implementation, but `Ctrl+K` is the explicit requirement for this phase.

## State Ownership

The signed-in shell should own the cross-view search state. A lightweight shape in `HomePage` is sufficient:

- `assignmentSearchQuery`: the canonical query string
- `assignmentSearchFocusToken`: a monotonically changing value or timestamp used to request focus from child components

Suggested behaviors:

- `TopBar` receives the shared query value and callbacks for query changes and search activation
- `AssignmentsPage` receives the shared query value, a query setter, and the latest focus token
- `AssignmentsPage` keeps using `useDeferredValue` for filtering, but it should defer the shared query prop instead of private local state

This keeps the search result logic centralized while allowing the shell to trigger focus from multiple entry points.

## Component Responsibilities

### `HomePage`

- own the canonical assignment search state
- register and clean up the global `keydown` listener
- handle view switching when search is activated
- issue focus requests after navigation so the Assignments page can focus its input reliably

### `TopBar`

- render the visible dashboard search affordance
- forward click, focus, and query-change events to shell callbacks
- avoid keeping its own unsynchronized search state

### `AssignmentsPage`

- render the canonical searchable input
- focus and optionally select the input value when the focus token changes
- keep existing status filters, course chips, grouped sections, and empty states working with the shared query

### `buildAssignmentsViewModel`

- continue being the only place that applies assignment query matching for the page
- no schema changes or server-side search are needed for this phase

## Accessibility And UX Constraints

- the focused search input should have an obvious visible focus state after `Ctrl+K`
- keyboard activation should not create a focus trap or unexpected scroll jumps
- placeholder and shortcut hint text should stay aligned with actual behavior
- existing loading, error, and empty states should still render safely when search activation occurs before data finishes loading

## Risks

- If both `TopBar` and `AssignmentsPage` keep private query state, the UI will drift and confuse users.
- If focus requests rely only on immediate DOM access during view changes, the shortcut may fail intermittently on navigation.
- If the shortcut intercepts inside other form fields, it will feel broken during assignment creation and grading workflows.
- If the dashboard control tries to become a full second search surface, implementation complexity will grow without improving the core experience.
