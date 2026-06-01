# AI syllabus extraction (Gemini)

The "Upload syllabus" flow sends the syllabus to a Supabase Edge Function
(`extract-syllabus`), which calls Google Gemini to extract assignments and due
dates as structured JSON. The user reviews the results before anything is saved.

The Gemini API key lives **only** as a Supabase secret — it is never bundled
into the distributed `.exe` and is never a `VITE_` variable.

## One-time setup

1. Get a Gemini API key from Google AI Studio (use a billing-enabled key; the
   paid tier is not used to train models).
2. Set it as a function secret on your Supabase project:

   ```sh
   supabase secrets set GEMINI_API_KEY=your-key
   # optional, defaults to gemini-2.5-flash:
   supabase secrets set GEMINI_MODEL=gemini-2.5-flash
   ```

3. Deploy the function. **Keep JWT verification on** so only signed-in users can
   call it (this is the default — do not pass `--no-verify-jwt`):

   ```sh
   supabase functions deploy extract-syllabus
   ```

## Local development

Run the function locally with a `.env` for the function (not the renderer):

```sh
supabase functions serve extract-syllabus --env-file supabase/functions/extract-syllabus/.env.local
```

Where `.env.local` (git-ignored) contains:

```
GEMINI_API_KEY=your-key
```

The renderer reaches the function through `supabase.functions.invoke`, so it
uses whatever Supabase URL the app is already configured with
(`VITE_SUPABASE_URL`).

## How it works

- Renderer (`src/components/dashboard/syllabus-parser.ts`):
  - PDF → base64 bytes, sent as `{ document: { kind: "pdf", ... } }`.
  - DOCX → text extracted locally, sent as `{ document: { kind: "text", text } }`.
  - Passes the course term so the model can resolve yearless/relative dates.
- Function (`supabase/functions/extract-syllabus/`):
  - `lib.ts` holds pure logic (request validation, Gemini request building,
    response parsing) and is unit-tested via `node scripts/test-extract-syllabus.mjs`.
  - `index.ts` is the Deno handler: validates input, calls Gemini with a JSON
    `responseSchema`, and returns `{ candidates }` or `{ error: { code, message } }`.

## Limits and notes

- PDFs are capped at ~5 MB (inline request limit). Larger or image-only PDFs
  return a clear "file too large" error.
- Syllabus content is sent to Google's Gemini API. For a small, known user base
  this is acceptable; the upload UI shows a short "read by AI" note.
- There is no offline fallback: on failure the user adds assignments manually.
