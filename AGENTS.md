# AGENTS.md

## Purpose

Use OpenSpec as the default workflow for planning and implementing changes in this repository. The project is configured for the `spec-driven` schema in [openspec/config.yaml](/C:/Users/alex/Desktop/school-organizer/openspec/config.yaml).

## OpenSpec Workflow

1. Explore before implementing when the request is still forming.
   Use the `openspec-explore` skill to investigate the codebase, clarify requirements, compare options, and surface risks.
   In explore mode, do not write application code. It is for discovery, diagrams, and artifact discussion only.

2. Propose a change before starting new implementation work.
   Use the `openspec-propose` skill when the user wants to add a feature, change behavior, or fix something non-trivial.
   This creates a change under `openspec/changes/<change-name>/` with:
   - `proposal.md`
   - `design.md`
   - `tasks.md`

3. Implement through the change tasks.
   Use the `openspec-apply-change` skill to execute tasks from an existing change.
   Always read the change artifacts first, keep edits scoped to the current tasks, and update task checkboxes as work is completed.

4. Archive completed changes.
   Use the `openspec-archive-change` skill after implementation is done and the change is ready to be closed out.
   Archived changes live under `openspec/changes/archive/`.

## Working Rules

- Treat OpenSpec artifacts as the source of truth for planned work.
- Prefer continuing an existing relevant change over creating duplicate changes.
- If the user wants to brainstorm, investigate, or refine scope, use `openspec-explore` instead of jumping into code edits.
- If the user asks to implement but no change exists yet, create one with `openspec-propose` first unless the request is truly trivial.
- When implementing, keep `tasks.md` current so progress is visible in the repo.
- Keep repository specs in `openspec/specs/` aligned with completed changes when archiving.

## Repo Paths

- Active changes: `openspec/changes/`
- Archived changes: `openspec/changes/archive/`
- Long-lived specs: `openspec/specs/`

## Current Context

- There is currently one active change: `add-unified-dashboard-data-phase-1`

