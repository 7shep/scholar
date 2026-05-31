## Overview

The dashboard will become the authenticated landing screen by keeping the existing `HomePage` entry point and replacing its placeholder content with a composed dashboard layout.

## Component Structure

- `home-page.tsx` becomes the dashboard shell for signed-in users.
- New dashboard components live under `src/components/dashboard/`.
- Shared display helpers live alongside the dashboard components for greeting, initials, and date formatting.

## Data Strategy

The uploaded design uses mock data for stats, assignments, events, and grades. That data will remain local to the dashboard components for now so the UI can ship without blocking on backend data modeling.

## Styling

- Preserve the uploaded light dashboard direction inside the existing dark-themed app shell.
- Replace `framer-motion` usage with lightweight CSS-based entrance and progress animations.
- Keep the layout responsive so the sidebar collapses into a top section on smaller screens.

## Integration Notes

- `App.tsx` will continue to own auth state and pass `fullName`, `email`, and sign-out behavior into `HomePage`.
- No Electron main-process changes are required.
