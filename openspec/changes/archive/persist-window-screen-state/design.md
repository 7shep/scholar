## Overview

This change adds a small Electron main-process persistence layer for the primary `BrowserWindow`. The state should live in the app's `userData` directory so it survives relaunches in development and in packaged builds without introducing a new dependency.

## State To Persist

Persist the following fields:

- `x`
- `y`
- `width`
- `height`
- `isMaximized`
- `isFullScreen`

The bounds should come from `getNormalBounds()` so they represent the last non-maximized, non-fullscreen size the user had chosen. This avoids saving the expanded monitor-sized rectangle as the default restored size.

## Storage Strategy

Store the state as JSON in a file under:

- `path.join(app.getPath('userData'), 'window-state.json')`

This keeps the implementation dependency-free and local to Electron.

## Restore Flow

1. Before creating the main window, attempt to read the saved JSON.
2. If the file is missing or invalid, fall back to the current default dimensions.
3. Pass restored bounds into the `BrowserWindow` constructor.
4. After creation:
   - call `maximize()` when `isMaximized` is true and `isFullScreen` is false
   - call `setFullScreen(true)` when `isFullScreen` is true

Fullscreen should take precedence over maximized because that is the more specific screen state from the user's perspective.

## Save Flow

Update the saved file whenever the window meaningfully changes state:

- `resize`
- `move`
- `maximize`
- `unmaximize`
- `enter-full-screen`
- `leave-full-screen`
- `close`

When saving:

- capture `getNormalBounds()`
- capture the current maximized/fullscreen flags
- do not persist minimized state

## Risks

- A saved position may later be off-screen if the monitor layout changes; this change accepts Electron's default behavior here and does not add display-bound clamping yet.
- Writing state on every resize event is slightly chatty, but acceptable for this single-window app and small JSON payload.
