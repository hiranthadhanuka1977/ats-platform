import { NextResponse } from "next/server";
import { normalizeParsedPayload, type ParsedCvPayload } from "@/types/cv-parse";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";
import { getServerEnv } from "@/lib/server-env";

export const runtime = "nodejs";

function parseModelJson(content: string): unknown {
  let s = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```/im.exec(s);
  if (fenced) s = fenced[1].trim();
  try {
    return JSON.parse(s) as unknown;
  } catch {
    const i = s.indexOf("{");
    const j = s.lastIndexOf("}");
    if (i >= 0 && j > i) return JSON.parse(s.slice(i, j + 1)) as unknown;
    throw new Error("OPENAI_JSON_PARSE");
  }
}

function buildPrompt(): string {
  return `You extract structured profile data from pasted LinkedIn sections.
Return ONLY valid JSON with this exact shape:
{"candidate":{"fullName":"","email":"","phone":"","location":"","currentTitle":""},"education":[{"qualification":"","institution":"","startDate":"","endDate":""}],"experience":[{"company":"","role":"","startDate":"","endDate":""}]}

Rules:
- Parse all experience entries from the provided Experience text.
- Parse all education entries from the provided Education text.
- Keep dates as free-form strings exactly as seen.
- Use empty strings when a field is unknown.
- Do not invent data not present in the pasted text.
- If candidate details are visible in pasted text, fill candidate fields where possible.`;
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  const apiKey = getServerEnv("OPENAI_API_KEY");
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "CONFIG_ERROR", message: "OPENAI_API_KEY is required for LinkedIn text extraction." } },
      { status: 500 }
    );
  }

  let body: { experienceText?: string; educationText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON." } }, { status: 400 });
  }

  const experienceText = typeof body.experienceText === "string" ? body.experienceText.trim() : "";
  const educationText = typeof body.educationText === "string" ? body.educationText.trim() : "";

  if (!experienceText && !educationText) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Provide experienceText and/or educationText." } },
      { status: 400 }
    );
  }

  const userText = `Experience section text:\n${experienceText || "(empty)"}\n\nEducation section text:\n${
    educationText || "(empty)"
  }`.slice(0, 24000);

  const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getServerEnv("OPENAI_CV_MODEL") || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildPrompt() },
        { role: "user", content: userText },
      ],
    }),
  });

  if (!openAIRes.ok) {
    const errText = await openAIRes.text().catch(() => "");
    return NextResponse.json(
      { error: { code: "OPENAI_ERROR", message: `OpenAI request failed (${openAIRes.status}). ${errText.slice(0, 180)}` } },
      { status: 502 }
    );
  }

  const modelBody = (await openAIRes.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = modelBody.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: { code: "OPENAI_EMPTY", message: "OpenAI returned empty content." } }, { status: 502 });
  }

  let parsed: ParsedCvPayload;
  try {
    parsed = normalizeParsedPayload(parseModelJson(content)) as ParsedCvPayload;
  } catch {
    return NextResponse.json(
      { error: { code: "PARSE_ERROR", message: "Could not parse OpenAI extraction output." } },
      { status: 422 }
    );
  }

  return NextResponse.json({ data: { payload: parsed } });
}
