## Overview

This change adds a simple onboarding modal that introduces the app’s core workflows without requiring a separate tutorial mode. The modal should be quick to read, easy to dismiss, and visible enough that a new friend understands what to do next.

## Product Direction

- Keep the experience lightweight and friendly rather than formal or tutorial-heavy.
- Focus on the five actions that matter most to new users:
  - add a course
  - add an assignment
  - mark an assignment complete
  - check grades
  - edit grades
- Make the onboarding reusable so it can appear:
  - automatically on first launch after sign-in
  - from a help or getting-started trigger in the app shell

## Information Architecture

The modal should read like a short sequence of cards or sections:

1. Welcome and what the app does
2. Add your first course
3. Add your first assignment
4. Mark work complete
5. Review or set grades

Each section should answer one question and include a clear UI cue for where the user should click next.

## Triggering Strategy

Suggested behavior:

- show automatically once per user unless they dismiss it permanently
- provide a manual reopen action from the dashboard shell or help area
- store the dismissed state locally or in user preferences so it does not reappear unexpectedly

## Modal Behavior

- Use the existing modal pattern used elsewhere in the app so the interaction feels native.
- Support keyboard dismissal and a clear close button.
- Avoid forcing the user through every screen before they can use the app.
- If the user is already familiar with the app, the modal should be skippable in one action.

## Content Strategy

The copy should be direct and action-oriented:

- course creation: where to add a class and what fields matter
- assignment creation: how to attach work to a course and set a due date
- completion: where to mark done and why it matters
- grades: how to open grades, enter scores, and see the effect on GPA

Screenshots are not required in this phase; simple icons, labels, and short copy should be enough.

## Risks

- If the modal is too long, it will feel like friction instead of guidance.
- If onboarding is only auto-shown with no manual reopen path, users who dismiss it too early may not find it again.
- If the copy is too abstract, it will not help friends understand the actual controls in the app.
