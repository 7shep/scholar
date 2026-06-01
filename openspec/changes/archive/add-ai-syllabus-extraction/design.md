## Overview

This change swaps the heuristic syllabus parser for real AI extraction using Google Gemini, called from a Supabase Edge Function. The renderer uploads the syllabus to the function; the function asks Gemini to extract assignments and absolute due dates as structured JSON; the renderer maps the result into the existing review step before bulk-creating assignments.

The design has two hard constraints driven by the product shape (a downloadable `.exe` with a small number of users):

- The Gemini API key must never be present in the client bundle. It lives only as a Supabase Edge Function secret.
- The function must only be callable by signed-in users, so a leaked endpoint cannot drain the key.

A secondary goal is cleanup: sending the PDF straight to Gemini lets us delete the vendored pdf.js and its fragile worker wiring entirely.

## Data Flow

1. In the existing "Upload syllabus" modal step, the user selects a course and a `PDF` or `DOCX` file.
2. The renderer prepares a request:
   - `PDF`: read bytes, base64-encode, send as `{ kind: "pdf", mimeType, dataBase64 }`.
   - `DOCX`: extract text locally with the existing ZIP/XML reader, send as `{ kind: "text", text }`.
   - Both include the resolved course term (for date context).
3. The renderer calls `supabase.functions.invoke("extract-syllabus", { body })`. The Supabase client automatically attaches the user's access token.
4. The Edge Function verifies the JWT, calls Gemini, validates the JSON, and returns `{ candidates: SyllabusAssignmentCandidate[] }`.
5. The renderer maps candidates into the existing editable review list. The user edits, removes, or keeps rows.
6. On confirm, the existing `bulkCreateAssignments` writes the rows to Supabase and shared data reloads.
7. On any failure, the modal shows a specific error and the user can switch to manual entry.

## Edge Function: `supabase/functions/extract-syllabus`

A Deno function with JWT verification left on (the Supabase default).

Responsibilities, each as a small, separately testable piece:

- `parseRequest(body)`: validate the incoming shape (kind, mime type, size cap, presence of data/text). Reject early with a 400 and a clear message. Enforce an inline PDF size cap of ~5 MB to stay within request and Gemini inline-data limits.
- `buildGeminiRequest({ document, courseTerm, today })`: construct the Gemini `generateContent` body. A system instruction describes the extraction task; a user text part supplies context (today's date, course term, rules for resolving relative/yearless dates and defaulting missing times to 23:59); a second part carries either the PDF `inline_data` or the DOCX text. `generationConfig` sets `temperature: 0`, `responseMimeType: "application/json"`, and a `responseSchema`.
- `callGemini(request)`: `POST` to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}`. Model from `GEMINI_MODEL`, default `gemini-2.5-flash`. Handle non-200 responses by mapping them to a structured error (e.g. quota, invalid key).
- `parseGeminiResponse(json)`: pull `candidates[0].content.parts[0].text`, `JSON.parse` it, and validate every item against the expected shape. Drop malformed items rather than failing the whole request; if nothing valid remains, return an empty list so the renderer can show "no assignments found".

`callGemini` is the only piece that touches the network, so the other three are pure and unit-testable with stubbed input.

### Response schema (per assignment)

Gemini `responseSchema` (OpenAPI subset) describing an array of objects:

- `title`: STRING, the assignment name.
- `dueDate`: STRING, nullable. Absolute ISO 8601 datetime, or null when no date can be determined.
- `type`: STRING enum: `exam | quiz | homework | project | reading | presentation | other`.
- `confidence`: NUMBER between 0 and 1.

The function returns `{ candidates: [{ title, dueAt, type, confidence }] }`, mapping `dueDate` to `dueAt` to match the renderer's existing `SyllabusAssignmentCandidate` shape.

### Secrets and configuration

- `GEMINI_API_KEY` (required): set with `supabase secrets set GEMINI_API_KEY=...`. Never a `VITE_` variable and never committed.
- `GEMINI_MODEL` (optional): defaults to `gemini-2.5-flash`.

## Renderer Changes

- `src/components/dashboard/syllabus-parser.ts` becomes a thin client. Remove pdf.js usage, the regex heuristics, and `buildIsoDate`. Keep the DOCX text extraction (ZIP/XML), since the function still needs DOCX as text. Export `extractSyllabusCandidates(file, { courseTerm })` that builds the request body and calls `supabase.functions.invoke`. Consider renaming the module to `syllabus-intake.ts` for clarity; keep the `SyllabusAssignmentCandidate` type but extend it with optional `type` and `confidence`.
- `src/components/dashboard/add-assignment-modal.tsx`: call `extractSyllabusCandidates` instead of `parseSyllabusFile`, passing the resolved course term (from the selected course or the new-course form). Keep the best-effort `uploadCourseSyllabus` storage step. Keep the review step. Keep the debug logging added previously, and surface `type`/`confidence` in the review row (e.g. a small confidence chip) instead of the old `sourceText` line.
- Error messages map function/Gemini failures to user-facing text: offline, service error, file too large, and "no assignments found".

## Removals

- `src/vendor/pdfjs-dist/**`, `src/types/pdfjs-dist.d.ts`, and the worker wrapper.
- The regex constants, `buildIsoDate`, `parseTimeOfDay`, and PDF text-extraction helpers in the old parser.
- `scripts/test-syllabus-dates.mjs` (its subject, `buildIsoDate`, no longer exists).

This is a net code reduction and removes the PDF-worker and date-parsing bug classes.

## Security

- The function only runs for authenticated users (JWT verified by Supabase).
- The Gemini key exists only in Supabase secret storage.
- Future hardening (out of scope): a simple per-user daily call cap recorded in a table to bound cost and abuse.

## Error Handling

- Function: validate input and return `{ error: { code, message } }` with an appropriate HTTP status for bad input, oversized files, missing key, and Gemini failures.
- Renderer: translate `error.code` (and network failures from `invoke`) into specific modal messages; never leave the user on a spinner.

## Privacy

Syllabus content is sent to Google's Gemini API through the function. For a small, known user base this is acceptable. Add a short "processed by AI" note in the upload UI and use a billing-enabled Gemini key (the paid tier is not used to train models; free-tier terms differ).

## Testing

- Function unit tests (Deno): `parseRequest` accepts valid bodies and rejects bad mime/oversize/missing data; `buildGeminiRequest` includes the term, today's date, schema, and the right part (PDF inline vs text); `parseGeminiResponse` parses valid JSON, drops malformed items, and returns an empty list when nothing is valid. `callGemini` is exercised with a stubbed `fetch`.
- Renderer test: `extractSyllabusCandidates` maps a stubbed `functions.invoke` response into `SyllabusAssignmentCandidate[]` and surfaces errors correctly.
- Manual smoke test: `supabase functions serve extract-syllabus` with a real key and a sample syllabus PDF, confirming well-formed candidates.
- Whole-project gates: `npx tsc --noEmit` and `npm run build:renderer` must pass.

## Risks

- If date-resolution instructions are weak, the model may return ambiguous or wrong-year dates. Mitigated by passing the term and today's date, defaulting missing times to 23:59, and keeping the editable review step.
- If a syllabus PDF is very large or image-heavy, the inline path may exceed limits. Mitigated by the size cap and a clear "file too large" error (future: Gemini Files API).
- If the function is deployed without `verify_jwt`, the endpoint would be open. The deploy step and docs must keep JWT verification on.
