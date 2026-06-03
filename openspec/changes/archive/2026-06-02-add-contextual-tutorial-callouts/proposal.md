## Why

The current onboarding direction explains the app in a general modal, but the experience still feels too detached from the thing the user is looking at. For a friend trying the app for the first time, it is easier to understand a feature when the guidance appears next to the highlighted control itself.

This change makes the tutorial feel more like a guided tour:

- highlight one UI item at a time
- show a small callout directly below or near that item
- explain what the item is used for in plain language
- advance through the tutorial one step at a time with a clear Next action

## What Changes

- Add a contextual tutorial callout anchored to the highlighted UI element.
- Present the tutorial as a step-by-step sequence with progress like `1/3`.
- Explain each control in the context of the dashboard or sidebar item being highlighted.
- Keep the callout compact and visually attached to the target element instead of using a standalone full-screen modal.
- Allow the tutorial to be dismissed and reopened later from the app shell.

## Non-Goals

- Building a fully automated product tour that moves the mouse or scrolls the page.
- Adding branching flows for different user types.
- Reworking the dashboard layout, data model, or core navigation.
- Replacing all existing onboarding surfaces at once.
