# Scholar

Scholar is an Electron + React + TypeScript desktop app for organizing courses, assignments, and grades.

## Development

```bash
npm install
npm run dev
```

## Release Builds

- `npm run dist` builds local packaged artifacts into `release/` without publishing.
- `npm run release:win` builds and publishes the Windows installer to the configured GitHub Release.
- `npm run release:mac` builds and publishes macOS artifacts to the configured GitHub Release.

The repository includes a GitHub Actions workflow at [.github/workflows/release.yml](/C:/Users/alex/Desktop/school-organizer/.github/workflows/release.yml) that builds release assets on version tags such as `v0.1.1`.

See [docs/releasing.md](/C:/Users/alex/Desktop/school-organizer/docs/releasing.md) for the required GitHub, Windows signing, and Apple signing/notarization secrets.

Enjoy!
