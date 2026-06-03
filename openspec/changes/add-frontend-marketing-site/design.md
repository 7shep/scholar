## Overview

This change introduces a self-contained web marketing frontend under `frontend/` using Vite + React + TypeScript so it can be deployed independently from the Electron desktop app.

The page will be structured as a single-scroll landing experience:

1. Top navigation + hero with dual-column layout
2. Dark "everything in one place" showcase with layered mock windows
3. Feature grid cards
4. Bright free-pricing banner, final CTA card, and footer

## Frontend Architecture

### Tooling

- Vite (React + TypeScript) for fast local development and static production output
- Plain CSS with section-level components for exact visual control
- `lucide-react` for iconography consistent with the product style

### Layout Strategy

- Use semantic sections (`header`, `main`, `section`, `footer`)
- Centered container with max width and responsive breakpoints
- Reusable visual primitives for:
  - Mock app windows
  - Badge pills
  - Feature cards
  - Download buttons

### Visual System

- Custom CSS variables for neutral, navy, and lime palette
- Strong typographic hierarchy and generous spacing
- Subtle shadows/borders to reproduce screenshot depth
- Mobile-first fallback with stacked layouts under tablet breakpoints

## Vercel Deployment

The frontend directory will include `vercel.json` configured for Vite output and SPA deep-link rewrites:

- `framework`: `vite`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- `rewrites` rule from `/(.*)` to `/index.html`

This supports direct route loads and refresh behavior on deployed builds.

## Risks

- Pixel-perfect parity may differ slightly due to font rendering differences across environments.
- Without downloadable binary links finalized, CTA buttons may initially point to placeholders.
