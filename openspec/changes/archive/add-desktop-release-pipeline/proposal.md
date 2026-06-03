## Why

The app is close to release-ready, but the repository still behaves like a local development setup. It can compile the renderer and Electron main process, yet it does not package installable builds, publish release assets, or check GitHub Releases for updates after install.

To ship the app confidently, the repo needs a desktop release pipeline that produces download files for Windows and macOS and wires packaged builds to auto-update from future GitHub Releases.

## What Changes

- Add Electron packaging and publishing configuration for GitHub Releases.
- Add in-app auto-update checks for packaged builds using `electron-updater`.
- Add a GitHub Actions workflow that builds Windows and macOS release artifacts on tag pushes and uploads them to the matching GitHub Release.
- Document the required signing and release secrets so future releases are repeatable.

## Non-Goals

- Building Linux installers in this phase.
- Solving every platform-specific signing edge case automatically inside the app code.
- Adding release-channel concepts such as beta/nightly builds.
