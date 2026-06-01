// Supabase Edge Function: extract-syllabus
//
// Receives a syllabus (PDF bytes or extracted DOCX text) from the signed-in
// renderer, asks Google Gemini to extract assignments + due dates as structured
// JSON, and returns reviewable candidates. The Gemini API key lives only in this
// function's environment (a Supabase secret), never in the distributed client.
//
// Deploy (keep JWT verification ON so only signed-in users can call it):
//   supabase secrets set GEMINI_API_KEY=your-key
//   supabase functions deploy extract-syllabus
//
// Optional: supabase secrets set GEMINI_MODEL=gemini-2.5-flash

import {
  buildGeminiRequest,
  parseGeminiResponse,
  parseRequest,
} from "./lib.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): unknown;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, code: string, message: string): Response {
  return jsonResponse(status, { error: { code, message } });
}

async function callGemini(
  model: string,
  apiKey: string,
  request: Record<string, unknown>,
): Promise<Response> {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  return await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

function mapGeminiError(status: number): { status: number; code: string; message: string } {
  if (status === 400 || status === 403) {
    return {
      status: 502,
      code: "ai_config_error",
      message: "The AI service rejected the request. Check the API key configuration.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      code: "ai_rate_limited",
      message: "The AI service is rate limited right now. Try again in a moment.",
    };
  }

  return {
    status: 502,
    code: "ai_error",
    message: "The AI service could not process this syllabus. Please try again.",
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "method_not_allowed", "Use POST.");
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return errorResponse(
      500,
      "missing_api_key",
      "The syllabus AI is not configured (GEMINI_API_KEY is unset).",
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = parseRequest(body);
  if (!parsed.ok) {
    return errorResponse(parsed.status, parsed.code, parsed.message);
  }

  const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL;
  const geminiRequest = buildGeminiRequest({
    document: parsed.value.document,
    courseTerm: parsed.value.courseTerm,
    today: new Date(),
  });

  let geminiResponse: Response;
  try {
    geminiResponse = await callGemini(model, apiKey, geminiRequest);
  } catch {
    return errorResponse(
      502,
      "ai_unreachable",
      "Couldn't reach the AI service. Check your connection and try again.",
    );
  }

  if (!geminiResponse.ok) {
    const mapped = mapGeminiError(geminiResponse.status);
    return errorResponse(mapped.status, mapped.code, mapped.message);
  }

  let geminiJson: unknown;
  try {
    geminiJson = await geminiResponse.json();
  } catch {
    return errorResponse(502, "ai_bad_response", "The AI service returned an unreadable response.");
  }

  const candidates = parseGeminiResponse(geminiJson);

  return jsonResponse(200, { candidates });
});
