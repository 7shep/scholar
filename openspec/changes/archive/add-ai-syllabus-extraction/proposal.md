## Why

The "Upload syllabus" intake is branded as AI, but it is actually a client-side regex parser running over pdf.js-extracted text. On real syllabi it extracts some assignments correctly and gets others wrong, with bad or missing due dates, because heuristics cannot reliably handle the variety of real syllabus formats (tables, multi-line entries, relative dates, scanned pages). The vendored pdf.js worker has also been a recurring source of runtime bugs. Patching the heuristics further has diminishing returns.

This change makes the feature genuinely AI-powered using Google Gemini, while keeping the existing human review step so nothing is written blindly.

## What Changes

- Replace the local regex/pdf.js syllabus parser with real LLM extraction using Google Gemini.
- Run the Gemini call inside a Supabase Edge Function so the API key never ships inside the distributed `.exe`, and gate the function behind the signed-in user's Supabase JWT.
- Send PDFs directly to Gemini for native document understanding (tables, layout, and scanned/image pages); send DOCX as locally extracted text.
- Pass the course term and today's date to the model so it returns absolute ISO 8601 due dates rather than ambiguous fragments.
- Keep the existing review step: extracted candidates remain fully editable before bulk creation.
- On any failure (offline, function error, quota, no assignments found), show a clear message and let the user add assignments manually. No local regex fallback.
- Remove the vendored pdf.js, its worker wrapper, the regex heuristics, and `buildIsoDate`, retiring that entire class of bugs.

## Non-Goals

- Per-school LMS integration (Canvas, Blackboard, Google Classroom) or `.ics` calendar import.
- Offline syllabus parsing. The app already requires connectivity for Supabase auth and data.
- Auto-detecting assignment difficulty or estimated effort. Those stay manual.
- Persisting raw model output or building a correction/feedback/training loop.
- Per-user rate limiting or usage quotas. Noted as future hardening, not part of this change.
