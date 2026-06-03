## Overview

The signed-in sidebar already shows a semester button, but it currently only displays an automatically derived label from today's date and does not change the dashboard at all. At the same time, course creation already lets users type a semester on each class, so the product has the data needed for a real semester switcher but does not use it yet.

This change turns the sidebar control into a working semester selector that uses saved course terms as the source of truth. When a semester is selected, the dashboard, assignments view, grades view, and related course pickers should all reflect that semester context instead of mixing work from every class together.

## Scope

- Replace the display-only semester button in the sidebar with a working selector on desktop and mobile.
- Derive semester options from existing `courses.term` values, using trimmed and case-insensitive matching so equivalent entries group together reliably.
- Track the active semester in the signed-in shell and apply it consistently to dashboard stats, assignment lists, grade lists, and course choices used in add-assignment flows.
- Persist the selected semester locally and fall back sensibly when the saved selection no longer exists.
- Keep courses without a saved term visible from an `All semesters` view rather than inventing a new database field or migration.
