## Why

Scholar's current calendar surface is only a dashboard summary card. It shows a week-shaped slice of assignment deadlines, but it does not give students a dedicated place to scan an entire month, move between months, or treat deadlines as a first-class planning view.

The app also needs a clear product boundary for calendar data. The Scholar calendar should reflect Scholar-owned academic items, not become a generic personal calendar. That means the long-term model should support Scholar assignments and Scholar class times, but the first release should stay honest to the data the product already has: assignment deadlines.

## What Changes

- Add a dedicated `Calendar` destination to the signed-in sidebar.
- Add a full month calendar page inside the authenticated shell.
- Drive the calendar from Scholar assignment deadlines only in this first phase.
- Define the calendar view model around Scholar-owned event types so class times can be added later without redesigning the page.
- Keep the existing dashboard calendar card as a lightweight summary rather than treating it as the main calendar experience.

## Non-Goals

- Implementing class-time creation, editing, or ingestion in this change.
- Syncing with Google Calendar or Apple Calendar in this change.
- Importing external calendars or showing non-Scholar events.
- Building reminders, recurring events, drag-and-drop rescheduling, or agenda notifications.
