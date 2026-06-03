## Overview

This change introduces the first dedicated Calendar workspace in Scholar.

The page should feel like a true month view, not a stretched version of the existing dashboard card. It should give students a reliable place to answer:

- What is due this month?
- What is due on this day?
- Which courses are creating the most deadline pressure?

Even though the long-term calendar should support both assignments and class times, phase 1 should only render assignment deadlines because assignments are the only calendar-backed academic entities that exist today.

## Product Boundaries

Scholar's calendar should be a Scholar data surface.

Initial event sources:

- assignment deadlines

Planned future event sources:

- class meeting times
- exam or course session events derived from future class data

Explicitly out of scope for this change:

- Google Calendar events
- Apple Calendar events
- arbitrary personal events

That keeps the product coherent and avoids turning Calendar into a second general-purpose planner before Scholar owns the right academic primitives.

## Shell Integration

The authenticated shell currently supports three destinations:

- `dashboard`
- `assignments`
- `grades`

Add a fourth:

- `calendar`

The sidebar should expose `Calendar` as a first-class destination on desktop and mobile using the same navigation model as the existing pages.

## Calendar Page Behavior

### Layout

The page should be organized around two coordinated surfaces:

1. a month grid
2. a day detail panel or agenda list

Suggested shape:

```text
+-----------------------------------------------+----------------------------+
| Month header                                  | Selected day               |
| [<]  October 2026  [Today]  [>]              | Thu Oct 15                 |
|                                               |                            |
| Mon Tue Wed Thu Fri Sat Sun                   | 10:00 PM                   |
| 28  29  30   1   2   3   4                    | Chemistry Lab Report       |
|  5   6   7   8   9  10  11                    | Deadline - Chemistry       |
| 12  13  14  15  16  17  18                    |                            |
| 19  20  21  22  23  24  25                    | 11:59 PM                   |
| 26  27  28  29  30  31   1                    | Midterm Reflection         |
|                                               | Deadline - English         |
+-----------------------------------------------+----------------------------+
```

### Navigation

The page needs real calendar state, not static labels:

- `visibleMonth`: the month currently shown in the grid
- `selectedDate`: the date currently being inspected in the agenda panel

Behavior:

- previous and next month controls move `visibleMonth`
- a `Today` action returns to the current month and selects today
- clicking a day selects it and updates the agenda panel

### Event Rendering

Phase 1 should derive events from assignments that have a valid `due_at`.

Each event should carry:

- `id`
- `title`
- `dateTime`
- `courseName`
- `courseColor`
- `status`
- `type = "assignment-deadline"`

Month cells should show compact density cues rather than full titles in-grid. The detail panel should show the readable assignment list for the selected date.

Completed assignments can remain visible in the selected-day list with subdued styling so the calendar remains an honest record of the student's coursework on that date.

## Data Model and Mapping

No database schema change is required for this phase.

The calendar should be derived from the existing academic data pipeline rather than fetched independently:

```text
courses + assignments
        |
        v
build calendar events
        |
        +-- month grid cells
        +-- selected-day agenda
        +-- event counts / density markers
```

This should be modeled as a dedicated calendar view model, not by stretching the current dashboard mini-calendar props.

Suggested types:

- `CalendarEvent`
- `CalendarMonthCell`
- `CalendarAgendaItem`
- `CalendarViewModel`

Even if only one event type exists now, the type shape should leave room for future Scholar-owned class events.

## Relationship to Existing Dashboard Calendar

The current dashboard calendar card is a summary card, not the main calendar surface.

This change should preserve that distinction:

- the dashboard card can remain a compact weekly summary
- the new `Calendar` page becomes the full month planning workspace

That avoids destabilizing the dashboard while still creating a proper calendar destination.

## External Sync Position

Google Calendar and Apple Calendar sync should not be bundled into this change.

Reason:

- the app does not yet own class-time data
- there is no provider OAuth or sync pipeline yet
- there is no durable Scholar event model beyond assignments

The right order is:

1. establish a stable in-app Scholar calendar model
2. add class times to that model
3. add external sync on top of the stable event surface

## Risks

- `due_at` is stored as `timestamptz`, so month/day placement must be consistent with the user's local timezone.
- A busy month could create crowded cells if the grid tries to show too much text inline.
- If the page duplicates logic already embedded in the dashboard card, calendar behavior may drift over time unless the event mapping is centralized.
