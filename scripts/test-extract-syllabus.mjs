// Tests for the pure logic of the extract-syllabus Edge Function.
// The Deno entrypoint (index.ts) is verified by a manual smoke test on deploy;
// here we transpile lib.ts with esbuild and exercise the pure functions in Node.
//
//   node scripts/test-extract-syllabus.mjs
//
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";

const sourceUrl = new URL(
  "../supabase/functions/extract-syllabus/lib.ts",
  import.meta.url,
);
const source = await readFile(sourceUrl, "utf8");
const { code } = await esbuild.transform(source, {
  loader: "ts",
  format: "esm",
  target: "es2020",
});
const dir = await mkdtemp(path.join(os.tmpdir(), "extract-syllabus-"));
const file = path.join(dir, "lib.mjs");
await writeFile(file, code);
const lib = await import(pathToFileURL(file).href);
const { parseRequest, buildGeminiRequest, parseGeminiResponse } = lib;

let failures = 0;
function check(name, condition) {
  if (condition) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}`);
  }
}

// ---- parseRequest ----------------------------------------------------------
const smallPdf = {
  document: { kind: "pdf", mimeType: "application/pdf", dataBase64: "JVBERi0xLjQK" },
  courseTerm: "Fall 2026",
};
const okPdf = parseRequest(smallPdf);
check("parseRequest accepts a small PDF", okPdf.ok === true);
check(
  "parseRequest keeps the document kind",
  okPdf.ok === true && okPdf.value.document.kind === "pdf",
);

const okText = parseRequest({ document: { kind: "text", text: "Essay due Sep 1" } });
check("parseRequest accepts non-empty text", okText.ok === true);

const wrongMime = parseRequest({
  document: { kind: "pdf", mimeType: "image/png", dataBase64: "AAAA" },
});
check(
  "parseRequest rejects a non-PDF mime type",
  wrongMime.ok === false && wrongMime.code === "unsupported_type",
);

const hugePdf = parseRequest({
  document: { kind: "pdf", mimeType: "application/pdf", dataBase64: "A".repeat(7_000_000) },
});
check(
  "parseRequest rejects an oversized PDF",
  hugePdf.ok === false && hugePdf.code === "file_too_large" && hugePdf.status === 413,
);

const emptyText = parseRequest({ document: { kind: "text", text: "   " } });
check(
  "parseRequest rejects empty text",
  emptyText.ok === false && emptyText.code === "empty_text",
);

const badBody = parseRequest({ document: { kind: "audio" } });
check(
  "parseRequest rejects an unknown document kind",
  badBody.ok === false && badBody.code === "invalid_document",
);

const noBody = parseRequest(null);
check("parseRequest rejects a non-object body", noBody.ok === false);

// ---- buildGeminiRequest ----------------------------------------------------
const today = new Date("2026-05-31T12:00:00Z");
const pdfReq = buildGeminiRequest({
  document: smallPdf.document,
  courseTerm: "Fall 2026",
  today,
});
const pdfText = JSON.stringify(pdfReq);
check(
  "buildGeminiRequest includes the PDF as inline_data",
  pdfText.includes("application/pdf") && pdfText.includes("JVBERi0xLjQK"),
);
check("buildGeminiRequest passes the course term", pdfText.includes("Fall 2026"));
check("buildGeminiRequest passes today's date", pdfText.includes("2026-05-31"));
check(
  "buildGeminiRequest asks for JSON output",
  pdfReq.generationConfig?.responseMimeType === "application/json",
);
check(
  "buildGeminiRequest includes a response schema",
  pdfReq.generationConfig?.responseSchema != null,
);
check(
  "buildGeminiRequest uses deterministic temperature",
  pdfReq.generationConfig?.temperature === 0,
);

const textReq = buildGeminiRequest({
  document: { kind: "text", text: "Final exam Dec 10" },
  courseTerm: null,
  today,
});
const textReqStr = JSON.stringify(textReq);
check(
  "buildGeminiRequest sends DOCX text as a text part",
  textReqStr.includes("Final exam Dec 10") && !textReqStr.includes("inline_data"),
);

// ---- parseGeminiResponse ---------------------------------------------------
function geminiResponse(items) {
  return {
    candidates: [
      { content: { parts: [{ text: JSON.stringify(items) }] } },
    ],
  };
}

const parsed = parseGeminiResponse(
  geminiResponse([
    { title: "Essay 1", dueDate: "2026-09-15T23:59:00", type: "homework", confidence: 0.9 },
    { title: "Reading", dueDate: null, type: "reading", confidence: 0.4 },
  ]),
);
check("parseGeminiResponse returns both valid items", parsed.length === 2);
check(
  "parseGeminiResponse maps dueDate to dueAt",
  parsed[0]?.dueAt === "2026-09-15T23:59:00" && parsed[1]?.dueAt === null,
);

const cleaned = parseGeminiResponse(
  geminiResponse([
    { title: "  ", dueDate: "2026-09-15", type: "exam", confidence: 1 }, // dropped: blank title
    { title: "Quiz", dueDate: "not-a-date", type: "quiz", confidence: 0.5 }, // dueAt -> null
    { title: "Lab", dueDate: "2026-10-01", type: "weird", confidence: 5 }, // type -> other, conf clamped
  ]),
);
check("parseGeminiResponse drops items without a title", cleaned.length === 2);
check(
  "parseGeminiResponse nulls an unparseable date",
  cleaned[0]?.title === "Quiz" && cleaned[0]?.dueAt === null,
);
check(
  "parseGeminiResponse normalizes unknown type and clamps confidence",
  cleaned[1]?.type === "other" && cleaned[1]?.confidence === 1,
);

check(
  "parseGeminiResponse returns [] when there is no text",
  Array.isArray(parseGeminiResponse({ candidates: [] })) &&
    parseGeminiResponse({ candidates: [] }).length === 0,
);

console.log("");
console.log(`${failures === 0 ? "ALL PASS" : failures + " FAILED"}`);
process.exit(failures === 0 ? 0 : 1);
