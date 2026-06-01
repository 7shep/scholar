# Releasing Scholar

This repository now uses `electron-builder` + `electron-updater` to publish desktop releases to GitHub Releases.

## What the release pipeline does

- Builds a Windows installer with `nsis`
- Builds macOS `dmg` and `zip` artifacts
- Uploads assets to a draft GitHub Release
- Lets packaged apps check GitHub Releases for updates

## GitHub Actions workflow

The release workflow lives at `.github/workflows/release.yml`.

It runs on:

- tag pushes matching `v*`
- manual `workflow_dispatch`

Recommended release flow:

1. Update `version` in `package.json`.
2. Commit the version bump.
3. Push a tag like `v0.1.1`.
4. Wait for the Windows and macOS jobs to upload artifacts to a draft GitHub Release.
5. Smoke test the artifacts.
6. Publish the GitHub Release when ready.

## Required GitHub configuration

- The workflow needs `contents: write`, which is already declared in the workflow.
- The release upload uses `secrets.GITHUB_TOKEN` through the `GH_TOKEN` environment variable.

## Windows signing secrets

For public distribution, configure these repository secrets:

- `WINDOWS_CSC_LINK`
- `WINDOWS_CSC_KEY_PASSWORD`

The workflow maps them to `CSC_LINK` and `CSC_KEY_PASSWORD` for the Windows build job.

If you skip Windows signing, Windows SmartScreen warnings are more likely.

## macOS signing and notarization secrets

For a proper macOS release and reliable auto-updates, configure:

- `MACOS_CSC_LINK`
- `MACOS_CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

The workflow maps the macOS certificate secrets into `CSC_LINK` and `CSC_KEY_PASSWORD` for the macOS build job.

Without signing and notarization:

- macOS installs will feel less trustworthy
- Gatekeeper warnings are likely
- auto-update behavior may be unreliable

## Local packaging commands

- `npm run dist`
- `npm run release:win`
- `npm run release:mac`

`npm run dist` is the safest local check because it packages without publishing.

## Auto-update behavior

Packaged builds call `electron-updater` on startup and check GitHub Releases for updates.

When an update finishes downloading, the app prompts the user to restart and install it.

## Notes

- This pipeline currently targets Windows and macOS only.
- The macOS workflow produces both `dmg` and `zip` because the `zip` artifact is needed for updater metadata.
- Draft GitHub Releases are used so assets can be inspected before the release goes live.
- The current build uses Electron's default packaged app icon. Add platform-specific `.ico` and `.icns` assets later if you want branded installer and app icons.
