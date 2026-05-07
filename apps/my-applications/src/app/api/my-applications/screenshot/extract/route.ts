import { NextResponse } from "next/server";
import { normalizeParsedPayload, type ParsedCvPayload } from "@/types/cv-parse";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";
import { getServerEnv } from "@/lib/server-env";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

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

function toDataUrl(mimeType: string, buffer: Buffer): string {
  const b64 = buffer.toString("base64");
  return `data:${mimeType};base64,${b64}`;
}

function buildPrompt(section: "experience" | "education"): string {
  if (section === "experience") {
    return `Read this screenshot of the LinkedIn Experience section and return ONLY valid JSON:
{"experience":[{"company":"","role":"","startDate":"","endDate":""}]}
Rules:
- One object per role listed in the screenshot.
- Keep dates as free-form strings exactly as seen (e.g., "Jan 2022 - Present").
- Do not include education rows.
- Use empty strings when unknown.`;
  }
  return `Read this screenshot of the LinkedIn Education section and return ONLY valid JSON:
{"education":[{"qualification":"","institution":"","startDate":"","endDate":""}]}
Rules:
- One object per education item shown.
- qualification = degree/program text.
- institution = school/university text.
- Keep dates as free-form strings exactly as seen.
- Do not include experience rows.
- Use empty strings when unknown.`;
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
      { error: { code: "CONFIG_ERROR", message: "OPENAI_API_KEY is required for screenshot extraction." } },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid form-data." } }, { status: 400 });
  }

  const sectionRaw = String(form.get("section") ?? "").trim();
  const section = sectionRaw === "experience" || sectionRaw === "education" ? sectionRaw : null;
  if (!section) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "section must be 'experience' or 'education'." } },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "file is required." } }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: { code: "FILE_TOO_LARGE", message: "Maximum upload size is 10 MB." } }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: { code: "UNSUPPORTED_TYPE", message: "Only image files are supported." } }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = toDataUrl(file.type, buffer);

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
        { role: "system", content: buildPrompt(section) },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract ${section} items from this screenshot.` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
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

  const body = (await openAIRes.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: { code: "OPENAI_EMPTY", message: "OpenAI returned empty content." } }, { status: 502 });
  }

  let payload: ParsedCvPayload;
  try {
    payload = normalizeParsedPayload(parseModelJson(content)) as ParsedCvPayload;
  } catch {
    return NextResponse.json(
      { error: { code: "PARSE_ERROR", message: "Could not parse OpenAI extraction output." } },
      { status: 422 }
    );
  }

  return NextResponse.json({
    data: {
      section,
      experience: section === "experience" ? payload.experience : [],
      education: section === "education" ? payload.education : [],
    },
  });
}
