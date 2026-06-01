## Tasks

- [x] Add a dashboard data module that loads the signed-in user's courses and assignments from Supabase.
- [x] Create a shared dashboard view model that aggregates data across all courses for the existing home dashboard.
- [x] Add dashboard `loading`, `error`, `empty`, and `ready` states at the `HomePage` level.
- [x] Replace mock data in `UpNextPanel`, `FocusCard`, and assignment-based stats with real derived data passed as props.
- [x] Update `MiniCalendar` to render upcoming assignment deadlines from fetched data.
- [x] Hide, defer, or clearly mark unsupported widgets such as grades or GPA until their backing data model exists.
- [ ] Build and verify the renderer with zero-data and populated-data scenarios.
