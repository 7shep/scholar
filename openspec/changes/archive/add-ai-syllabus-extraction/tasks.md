## Tasks

### Edge Function (backend)

- [x] Scaffold `supabase/functions/extract-syllabus/` with the Deno entrypoint and shared types.
- [x] Implement `parseRequest` to validate body shape, mime type, and enforce the ~5 MB inline-PDF cap.
- [x] Implement `buildGeminiRequest` (system instruction, term + today's-date context, date rules, PDF inline vs DOCX text part, `responseSchema`, `temperature: 0`).
- [x] Implement `callGemini` against the `generateContent` REST endpoint using `GEMINI_API_KEY` and `GEMINI_MODEL` (default `gemini-2.5-flash`), mapping non-200s to structured errors.
- [x] Implement `parseGeminiResponse` to parse/validate items, drop malformed ones, and map `dueDate` to `dueAt`.
- [x] Wire the handler: JWT-gated, returns `{ candidates }` or `{ error: { code, message } }` with correct status and CORS for the renderer.
- [x] Add unit tests for `parseRequest`, `buildGeminiRequest`, and `parseGeminiResponse` (`node scripts/test-extract-syllabus.mjs`, runs the real `lib.ts` via esbuild).

### Renderer

- [x] Replace `syllabus-parser.ts` with a thin client exporting `extractSyllabusCandidates(file, { courseTerm })`; keep DOCX text extraction; extend `SyllabusAssignmentCandidate` with optional `type`/`confidence`.
- [x] Remove pdf.js usage, regex heuristics, and `buildIsoDate` from the renderer.
- [x] Update `add-assignment-modal.tsx` to call `extractSyllabusCandidates`, pass the resolved course term, keep the storage upload + review step, keep debug logging, and surface `type`/`confidence` in review rows.
- [x] Map function/Gemini/offline failures to specific modal error messages, plus a "read by AI" note in the upload UI.
- [ ] Add a renderer test that maps a stubbed `functions.invoke` response into candidates and handles errors. (Deferred: client is mostly pass-through; covered indirectly by manual smoke test.)

### Cleanup

- [x] Delete `src/vendor/pdfjs-dist/**`, `src/types/pdfjs-dist.d.ts`, and the worker wrapper.
- [x] Delete `scripts/test-syllabus-dates.mjs`.

### Config, docs, deploy

- [x] Document required secrets (`GEMINI_API_KEY`, optional `GEMINI_MODEL`) and the deploy command, keeping `verify_jwt` on (`docs/ai-syllabus-extraction.md`). Key is not in `.env`/`VITE_`.
- [ ] Deploy `extract-syllabus` and set the secret on the Supabase project. (Requires your Supabase project + Gemini key.)

### Verification

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build:renderer` passes (confirmed pdf.js chunks are gone from the bundle).
- [x] Function unit tests pass.
- [ ] Manual smoke test: upload a real syllabus PDF end-to-end and confirm reviewed candidates create assignments that appear in the list. (Requires the deployed function.)
