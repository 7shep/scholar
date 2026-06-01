## Tasks

- [x] Add an Electron main-process utility that reads and writes persisted window bounds and screen state in the app user-data directory.
- [x] Restore the saved window bounds, maximized state, and fullscreen state when the main window is created.
- [x] Persist updated window state from the main window lifecycle events, excluding minimized relaunch behavior.
- [x] Verify the Electron build still passes and note that a manual reopen smoke test is still needed for maximized and fullscreen restoration.
