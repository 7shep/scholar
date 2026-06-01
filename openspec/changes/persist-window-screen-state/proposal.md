## Why

The desktop app currently always reopens with the default 1280x800 window configuration, even if the user last used it maximized or fullscreen. That makes the app feel less native and forces repeated window adjustments every time it is relaunched.

## What Changes

- Persist the main window's last usable bounds between launches.
- Persist whether the app was last closed maximized or fullscreen.
- Restore the saved bounds and screen state the next time the app launches.
- Ignore minimized state so the app always relaunches in a visible window.

## Non-Goals

- Remembering per-monitor placement nuances beyond Electron's standard bounds handling.
- Restoring multiple windows or tabs.
- Adding a user-facing setting for this behavior.
