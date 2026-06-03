# Scholar Frontend

Standalone Vite frontend for the Scholar marketing site.

## Local development

```bash
cd frontend
npm install
npm run dev
```

## Production build

```bash
cd frontend
npm run build
npm run preview
```

## Vercel deployment

1. Import this repository into Vercel.
2. In project settings, set **Root Directory** to `frontend`.
3. Keep framework preset as **Vite**.
4. `vercel.json` already defines:
   - build command: `npm run build`
   - output directory: `dist`
   - SPA rewrite for deep links to `/index.html`

Optional CLI deploy:

```bash
cd frontend
npx vercel
```
