## Tasks

- [x] Add shared signed-in navigation state so the sidebar can switch between `Dashboard` and `Assignments` with correct active styling.
- [x] Create an assignments data/view-model layer that derives page counts, grouped sections, course chips, search results, and sort order from the signed-in user's courses and assignments.
- [x] Build the new Assignments page layout to match the approved mockup, including the header, summary cards, filters, and grouped assignment rows.
- [x] Add ready, loading, empty, and error states for the Assignments page.
- [x] Implement the `Add Assignment` option-picker modal with `Add manually` and `Upload syllabus` actions matching the provided design.
- [x] Implement the manual assignment creation flow from the Assignments page and refresh shared assignment data after success.
- [x] Implement the syllabus upload and parsing flow using course documents, with a required review step before bulk-creating assignments.
- [x] Keep dashboard and assignments-derived data in sync after manual adds, imports, and completion-state changes.
- [ ] Verify responsive behavior and realistic scenarios for overdue, due today, due this week, completed, and zero-data states.
