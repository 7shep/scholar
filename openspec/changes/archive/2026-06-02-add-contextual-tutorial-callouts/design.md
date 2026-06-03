## Overview

This change replaces a generic tutorial presentation with an anchored callout pattern. The goal is to make the app feel like it is teaching the user directly where they are looking, rather than asking them to read a detached intro screen.

## Product Direction

- Keep the tutorial narrow and focused on one concept at a time.
- Use the highlighted item as the anchor point for the help bubble.
- Make the callout appear directly below or adjacent to the highlighted element, similar to the screenshot reference.
- Keep the copy short and action-oriented so the user can immediately connect the explanation to the control.

## Tutorial Flow

Suggested flow:

1. Highlight a target element.
2. Show a small callout anchored to that element.
3. Explain the item’s purpose in 1 to 2 short sentences.
4. Display progress such as `1/3`.
5. Advance with a `Next` button or dismiss with `Close`.

The flow should be sequential rather than modal-heavy. One step should be visible at a time.

## Placement Strategy

The tutorial callout should attach to the highlighted control using the same visual relationship seen in the screenshot:

- the target control is visually emphasized
- the callout sits below or near the target
- the callout has a pointer or directional cue back to the target

This can be implemented as an overlay layer in the signed-in shell that positions the callout relative to the highlighted element.

## State Model

The tutorial should track:

- `currentStep`
- `isOpen`
- `dismissed`

Suggested behavior:

- open automatically on first run unless dismissed
- allow reopening from a help or getting-started entry point
- persist dismissed state locally or in user preferences

## Content Strategy

Each step should answer one question:

- what is this control for?
- when do I use it?
- what happens if I click it?

The content should map to real controls already in the app, such as dashboard actions, assignments, grades, or the add flow.

## Risks

- If the anchor positioning is off, the callout can feel detached or broken.
- If the step copy is too long, it will cover too much of the interface and lose the tutorial feeling.
- If the overlay blocks the app too aggressively, users may feel trapped instead of guided.
