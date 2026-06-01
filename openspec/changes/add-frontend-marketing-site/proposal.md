## Why

The project currently has an Electron product experience but no standalone public marketing website to introduce the product, explain its value proposition, and provide download calls-to-action for prospective users.

A dedicated frontend site is needed for launch messaging and web distribution, and it should match the provided visual direction.

## What Changes

- Add a standalone Vite-powered frontend app in `frontend/`.
- Implement a responsive landing page that matches the supplied screenshots across hero, feature showcase, value proposition, and CTA/footer sections.
- Add Vercel deployment configuration for SPA routing and production build output.
- Add a short deployment/readme guide for local run and Vercel setup.

## Non-Goals

- Building backend APIs or form submission endpoints.
- Integrating analytics, A/B testing, or CMS content editing.
- Replacing the existing Electron app codepath.
