// Pure, runtime-agnostic logic for the extract-syllabus Edge Function.
// Kept free of Deno/network APIs so it can be unit-tested in Node (see
// scripts/test-extract-syllabus.mjs). The Deno entrypoint lives in index.ts.

export type SyllabusDocument =
  | { kind: "pdf"; mimeType: string; dataBase64: string }
  | { kind: "text"; text: string };

export type ExtractRequest = {
  courseTerm?: string | null;
  document: SyllabusDocument;
};

export type AssignmentCandidate = {
  title: string;
  dueAt: string | null;
  type: string;
  confidence: number;
  weightPercent: number | null;
};

export type ParsedRequest =
  | { ok: true; value: ExtractRequest }
  | { ok: false; status: number; code: string; message: string };

// ~5 MB cap on the inline PDF to stay within request and Gemini inline-data limits.
const MAX_PDF_BYTES = 5 * 1024 * 1024;

export const ASSIGNMENT_TYPES = [
  "exam",
  "quiz",
  "homework",
  "project",
  "reading",
  "presentation",
  "other",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function fail(status: number, code: string, message: string): ParsedRequest {
  return { ok: false, status, code, message };
}

// Approximate decoded byte length of a base64 string (slightly conservative).
function approximateBase64Bytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}

export function parseRequest(body: unknown): ParsedRequest {
  if (!isRecord(body)) {
    return fail(400, "invalid_body", "Request body must be a JSON object.");
  }

  const document = body.document;

  if (!isRecord(document) || typeof document.kind !== "string") {
    return fail(400, "invalid_document", "Request is missing a valid document.");
  }

  const courseTerm =
    typeof body.courseTerm === "string" ? body.courseTerm : null;

  if (document.kind === "pdf") {
    if (document.mimeType !== "application/pdf") {
      return fail(
        415,
        "unsupported_type",
        "Only application/pdf is supported for PDF uploads.",
      );
    }

    if (typeof document.dataBase64 !== "string" || document.dataBase64.length === 0) {
      return fail(400, "invalid_document", "The PDF document is empty.");
    }

    if (approximateBase64Bytes(document.dataBase64) > MAX_PDF_BYTES) {
      return fail(
        413,
        "file_too_large",
        "This PDF is too large to parse with AI. Try a smaller or text-based file.",
      );
    }

    return {
      ok: true,
      value: {
        courseTerm,
        document: {
          kind: "pdf",
          mimeType: document.mimeType,
          dataBase64: document.dataBase64,
        },
      },
    };
  }

  if (document.kind === "text") {
    if (typeof document.text !== "string" || document.text.trim().length === 0) {
      return fail(400, "empty_text", "No readable text was provided.");
    }

    return {
      ok: true,
      value: { courseTerm, document: { kind: "text", text: document.text } },
    };
  }

  return fail(400, "invalid_document", `Unsupported document kind: ${document.kind}.`);
}

export const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      dueDate: { type: "STRING", nullable: true },
      type: { type: "STRING", enum: [...ASSIGNMENT_TYPES] },
      confidence: { type: "NUMBER" },
      weightPercent: { type: "NUMBER", nullable: true },
    },
    required: ["title", "dueDate", "type", "confidence", "weightPercent"],
    propertyOrdering: ["title", "dueDate", "type", "confidence", "weightPercent"],
  },
} as const;

const SYSTEM_INSTRUCTION =
  "You extract graded coursework from a university course syllabus. " +
  "Return only real, gradable items: assignments, homework, essays, projects, " +
  "quizzes, exams, presentations, labs, and readings or discussions that have a " +
  "deadline. Ignore office hours, policies, grading scales, holidays, and generic " +
  "schedule rows that have no deliverable. Give each item a concise title, an " +
  "absolute due date, a type, a weight percentage when stated, and your confidence. " +
  "Look carefully at grading breakdown, assessment, evaluation, and mark distribution " +
  "sections and connect those weights to assignment items when the title or category " +
  "clearly matches.";

function buildContextText(courseTerm: string | null | undefined, today: Date): string {
  const todayIso = today.toISOString().slice(0, 10);
  const term = courseTerm && courseTerm.trim() ? courseTerm.trim() : "unknown";

  return (
    `Today's date is ${todayIso}. The course term is "${term}". ` +
    "Resolve every due date to an absolute ISO 8601 datetime. If the syllabus omits " +
    "the year, infer it from the term and today's date so the date is the upcoming " +
    "occurrence. If a specific time is given, use it; otherwise use 23:59 local time. " +
    "If you cannot determine a date for an item, set dueDate to null. If a specific " +
    "item has an explicit grade weight like 10%, return weightPercent as the numeric " +
    "percentage without the percent sign; otherwise return null. Do not infer a weight " +
    "from the overall grading breakdown unless the syllabus clearly ties it to that " +
    "specific assignment or category. Use grading tables and category lists when they " +
    "clearly map to an extracted item, for example Essay 1 -> Essays 15%, Midterm -> " +
    "Midterm Exam 25%, Labs -> Lab Reports 20%. If a percentage only applies to a broad " +
    "participation bucket or to multiple items that cannot be matched confidently, return " +
    "null instead of guessing. Do not invent assignments that are not present in the document."
  );
}

export function buildGeminiRequest(opts: {
  document: SyllabusDocument;
  courseTerm?: string | null;
  today: Date;
}): Record<string, unknown> {
  const documentPart =
    opts.document.kind === "pdf"
      ? {
          inline_data: {
            mime_type: opts.document.mimeType,
            data: opts.document.dataBase64,
          },
        }
      : { text: `Syllabus text:\n${opts.document.text}` };

  return {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: "user",
        parts: [{ text: buildContextText(opts.courseTerm, opts.today) }, documentPart],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };
}

function normalizeCandidate(raw: unknown): AssignmentCandidate | null {
  if (!isRecord(raw)) {
    return null;
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";

  if (!title) {
    return null;
  }

  const dueRaw = raw.dueDate;
  const dueAt =
    typeof dueRaw === "string" && !Number.isNaN(Date.parse(dueRaw)) ? dueRaw : null;

  const type =
    typeof raw.type === "string" &&
    (ASSIGNMENT_TYPES as readonly string[]).includes(raw.type)
      ? raw.type
      : "other";

  let confidence =
    typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
      ? raw.confidence
      : 0.5;
  confidence = Math.min(1, Math.max(0, confidence));

  let weightPercent =
    typeof raw.weightPercent === "number" && Number.isFinite(raw.weightPercent)
      ? raw.weightPercent
      : null;

  if (weightPercent != null) {
    weightPercent = Math.min(100, Math.max(0, Math.round(weightPercent * 10) / 10));
  }

  return { title, dueAt, type, confidence, weightPercent };
}

export function parseGeminiResponse(response: unknown): AssignmentCandidate[] {
  if (!isRecord(response)) {
    return [];
  }

  const candidates = response.candidates;
  const firstCandidate = Array.isArray(candidates) ? candidates[0] : undefined;
  const content = isRecord(firstCandidate) ? firstCandidate.content : undefined;
  const parts = isRecord(content) ? content.parts : undefined;

  if (!Array.isArray(parts)) {
    return [];
  }

  const text = parts
    .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(normalizeCandidate)
    .filter((item): item is AssignmentCandidate => item !== null);
}
