## Overview

This change adds a lightweight theme system for the signed-in app shell. The theme toggle should live beside the semester selector in the sidebar and switch between light and dark mode without requiring a page reload.

## Product Direction

- Keep the control close to the semester selector where users already look for app-wide context settings.
- Make the active mode obvious through the icon:
  - `Sun` for light mode
  - `Moon` for dark mode
- Persist the choice locally so the shell opens in the same mode next time.

## State Model

The authenticated shell should track:

- `theme = light | dark`

Suggested behavior:

- default to `light` if no saved preference exists
- save the value to local storage
- apply a wrapper class on the signed-in shell so child components inherit the theme

## Styling Strategy

The codebase currently uses many fixed utility classes across the dashboard surfaces. Instead of rewriting every component into a full token system, use a signed-in shell wrapper class to apply dark-theme overrides consistently.

That wrapper should cover:

- main app background
- sidebar surfaces
- cards and panels
- borders
- primary body text and muted text
- inputs and hover states
- modal surfaces used inside the signed-in shell

## Sidebar Control

Desktop:

- keep the semester control
- add the theme toggle beside it

Mobile:

- keep the same pairing in a compact row under the brand block

## Risks

- If dark-mode overrides are too narrow, some cards will remain visually inconsistent.
- If theme state is only local component state and not persisted, the toggle will feel broken between sessions.
