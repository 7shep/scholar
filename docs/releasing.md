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
- macOS auto-update should be considered unavailable

## Local packaging commands

- `npm run dist`
- `npm run dist:win`
- `npm run dist:mac`
- `npm run dist:mac:dir`
- `npm run dist:mac:unsigned`
- `npm run release:win`
- `npm run release:mac`
- `npm run release:mac:unsigned`

`npm run dist` is the safest local check because it packages without publishing.

### Which machine should build what

- Build Windows installers on Windows.
- Build the final macOS `.dmg` and `.zip` on a Mac.
- Use Windows for normal development and release prep, then use the Mac only for the signed/notarized macOS packaging step.

`electron-builder` can package many targets cross-platform, but the official macOS signing and notarization flow depends on Apple tooling and credentials that run on macOS. The most reliable path is:

1. Do normal app development on Windows.
2. Push the release commit and tag from Windows.
3. Build the final macOS artifacts on either:
   - the GitHub Actions `macos-latest` runner, or
   - your local Mac with `npm run dist:mac` or `npm run release:mac`

The macOS scripts build a universal app so one download supports both Intel and Apple Silicon Macs.

## Free unsigned macOS release path

If you do not have an Apple Developer account yet, the repository can still publish an unsigned macOS build.

- The GitHub Actions macOS job now falls back to `npm run release:mac:unsigned` when the Apple signing and notarization secrets are not configured.
- Because the repository is public, the standard `macos-latest` GitHub-hosted runner can build that unsigned `.dmg` and `.zip` without paid Actions minutes.
- This is the cheapest way to produce a downloadable Mac build for friends.

Tradeoffs:

- macOS users will likely see Gatekeeper warnings.
- Users may need to right-click the app and choose `Open`, or allow it in `System Settings` -> `Privacy & Security`.
- Unsigned macOS releases are for manual download and install, not reliable auto-update.

Use these commands on a Mac if you want to build the same unsigned artifacts locally:

- `npm run dist:mac:unsigned`
- `npm run release:mac:unsigned`

## Building macOS locally on your Mac

On the Mac:

1. Install Node.js 22.
2. Clone the repo and run `npm ci`.
3. Build an unsigned local test app with `npm run dist:mac:dir`.
4. Build unsigned distributables with `npm run dist:mac:unsigned`.
5. Build and publish signed release assets with `npm run release:mac`.

Outputs will be written to `release/`.

Use `dist:mac:dir` first if you only want to verify that the packaged app launches before dealing with certificates.

## Apple signing and notarization setup

For a polished public macOS release you need:

- an active Apple Developer membership
- a `Developer ID Application` certificate
- an Apple Account with two-factor authentication enabled
- an app-specific password for notarization
- your Apple Team ID

### 1. Create the signing certificate on the Mac

Create or download a `Developer ID Application` certificate into the Mac keychain that will perform the build. `electron-builder` can use a suitable identity from the keychain automatically on a macOS machine, or you can export it for CI via `CSC_LINK` and `CSC_KEY_PASSWORD`. [electron-builder mac code signing](https://www.electron.build/code-signing-mac)

### 2. Export the certificate for GitHub Actions

If you want GitHub Actions to produce the final `.dmg`:

1. Open Keychain Access on the Mac.
2. Find the `Developer ID Application` certificate under `login` -> `My Certificates`.
3. Export it as a `.p12`.
4. Give the export a password.
5. Base64-encode the `.p12` and store that value in the GitHub secret `MACOS_CSC_LINK`.
6. Store the export password in `MACOS_CSC_KEY_PASSWORD`.

If you only build locally on your Mac, you do not need to export the certificate to GitHub.

### 3. Create the Apple app-specific password

Apple requires an app-specific password for notarization. Apple says you generate it from `account.apple.com` under `Sign-In and Security` -> `App-Specific Passwords`, and two-factor authentication must be enabled first. [Apple Support](https://support.apple.com/en-us/102654)

Store these values as GitHub secrets for CI or as local environment variables on your Mac:

- `APPLE_ID`: the Apple Account email
- `APPLE_APP_SPECIFIC_PASSWORD`: the generated app-specific password
- `APPLE_TEAM_ID`: your Apple Developer Team ID

### 4. Add the secrets

If you want GitHub Actions to sign and notarize the Mac build, add these repository secrets:

- `MACOS_CSC_LINK`
- `MACOS_CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

### 5. Build on the Mac

For a local signed build, export the values in the terminal session before running the build:

```bash
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID1234"
```

If the certificate is already in your login keychain, `electron-builder` can use it from there on the Mac. For CI builds, the workflow already maps the certificate secrets to `CSC_LINK` and `CSC_KEY_PASSWORD`.

## Auto-update behavior

Packaged builds call `electron-updater` on startup and check GitHub Releases for updates.

- Windows packaged builds can auto-update from GitHub Releases.
- Signed and notarized macOS packaged builds can also auto-update.
- Unsigned macOS releases are for manual download and install, not reliable auto-update.

When an update finishes downloading, the app prompts the user to restart and install it.

## Notes

- This pipeline currently targets Windows and macOS only.
- The macOS workflow produces both `dmg` and `zip` because the `zip` artifact is needed for updater metadata.
- The final signed/notarized macOS build should be produced on macOS, even if day-to-day development happens on Windows.
- If Apple signing secrets are missing, the macOS workflow publishes an unsigned universal build instead of failing.
- Draft GitHub Releases are used so assets can be inspected before the release goes live.
- The current build uses Electron's default packaged app icon. Add platform-specific `.ico` and `.icns` assets later if you want branded installer and app icons.
