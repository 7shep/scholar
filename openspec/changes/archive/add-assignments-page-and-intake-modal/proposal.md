## Why

The signed-in shell already exposes an `Assignments` item in the sidebar, but it does not yet lead anywhere. Students can see assignment highlights on the dashboard, yet they still lack a dedicated workspace to scan all coursework, filter by urgency or course, and add new assignments in a flow that matches the product direction shown in the provided mockups.

The current quick-add experience is also optimized around creating a course first and then adding one assignment. That is useful for first-run setup, but it is not the right primary workflow once a student already has active courses and needs to manage assignments directly.

## What Changes

- Add a dedicated signed-in Assignments page that opens when the user clicks `Assignments` in the sidebar.
- Match the new page to the provided layout with top-level counts, status summary cards, filter tabs, course chips, search, sort, and grouped assignment sections.
- Introduce app-level navigation state so Dashboard and Assignments can coexist inside the current authenticated shell.
- Add an `Add Assignment` call to action on the Assignments page that opens a two-option modal with `Add manually` and `Upload syllabus`.
- Support manual assignment creation from the Assignments workspace, including choosing a course and entering core assignment details.
- Support syllabus-assisted assignment intake by uploading a syllabus, extracting assignment candidates, and letting the user review them before bulk creation.
- Add loading, empty, error, upload, parsing, and success states needed to make the Assignments workflow feel complete.

## Non-Goals

- Redesigning the dashboard beyond the shared navigation and data refresh points needed to support the new page.
- Reworking the Grades or Calendar sections.
- Building reminder notifications, calendar sync, or recurring assignment logic.
- Guaranteeing perfect syllabus extraction for every document format without a user review step.
