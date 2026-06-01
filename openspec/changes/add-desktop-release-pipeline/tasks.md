## Tasks

- [x] Add OpenSpec-scoped release pipeline artifacts covering packaging, auto-update, and GitHub Release publishing.
- [x] Add `electron-builder` packaging config and release scripts for Windows and macOS artifacts.
- [x] Add packaged-build auto-update checks in the Electron main process.
- [x] Add a GitHub Actions workflow that builds and publishes Windows and macOS release assets on version tags.
- [x] Document required signing and release secrets plus the release flow.
- [x] Verify the TypeScript build and a local Windows packaging run with the new release config.
- [x] Add documented local macOS packaging/signing steps and a universal mac build command for release handoff.
- [x] Add an unsigned macOS release fallback for public-repo GitHub Actions and manual friend distribution.
