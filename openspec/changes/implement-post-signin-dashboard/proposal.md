## Why

The authenticated experience currently lands on a placeholder screen that does not reflect the intended product direction. We need to replace that screen with the designed student dashboard so users have an immediate, useful post-sign-in home base.

## What Changes

- Add the new post-sign-in dashboard layout to the renderer.
- Replace the placeholder authenticated home screen with the dashboard.
- Adapt the uploaded UI to the current Electron + React + Tailwind stack without introducing unsupported dependencies.
- Wire authenticated user details into the dashboard header and profile area.

## Non-Goals

- Connecting dashboard widgets to live assignment, grade, or calendar data.
- Implementing navigation targets for dashboard sidebar actions.
- Changing the sign-in or sign-up experience.
