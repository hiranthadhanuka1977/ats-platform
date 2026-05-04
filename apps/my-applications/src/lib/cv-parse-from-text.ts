import type { ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload, normalizeParsedPayload, pickFullNameFromCvPlainText } from "@/types/cv-parse";

function heuristicParse(text: string): ParsedCvPayload {
  const out = emptyParsedCvPayload();
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return out;

  const emailMatch = t.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (emailMatch) out.candidate.email = emailMatch[0];

  const phoneMatch = t.match(/\+?\d[\d\s().-]{8,}\d/);
  if (phoneMatch) out.candidate.phone = phoneMatch[0].replace(/\s+/g, " ").trim();

  out.candidate.fullName = pickFullNameFromCvPlainText(t);

  return out;
}

async function parseWithOpenAI(text: string, apiKey: string): Promise<ParsedCvPayload> {
  const snippet = text.slice(0, 14_000);
  const system = `You extract structured CV / resume data. Return ONLY valid JSON (no markdown) with this exact top-level keys and shape:
{"candidate":{"fullName":"","email":"","phone":"","location":"","currentTitle":""},"education":[{"qualification":"","institution":"","startDate":"","endDate":""}],"experience":[{"company":"","role":"","startDate":"","endDate":""}]}

Rules:
- "candidate.fullName": the person's name only (typically given name + family name, 2–4 words). Do NOT append degrees (MBA, PhD, etc.), certifications, job titles, or taglines. If the CV shows a headline like "Jane Doe, MBA | Senior Engineer", use fullName "Jane Doe", put "MBA" only in education if appropriate, and put "Senior Engineer" in "currentTitle".
- "candidate.currentTitle": current or target job title / headline when clearly separate from the legal or display name.
- The work history MUST go in the "experience" array (not a different key name). One object per job.
- "company" = employer / organization name. "role" = job title / position name.
- Parse every distinct job from sections titled like Work Experience, Employment, Professional Experience, Career History, or similar.
- "education" = degrees and schools only; do not put jobs there.
- Use empty strings when unknown. Dates as free-form strings (e.g. "2019", "Jan 2020", "Present").`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CV_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `CV text:\n\n${snippet}` },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OPENAI_HTTP_${res.status}: ${errText.slice(0, 200)}`);
  }

  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("OPENAI_EMPTY");
  const parsed = parseModelJson(content);
  return normalizeParsedPayload(parsed);
}

/** OpenAI sometimes wraps JSON in markdown fences or adds prose; extract an object. */
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

export async function parseCvText(text: string): Promise<ParsedCvPayload> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (key) {
    try {
      return await parseWithOpenAI(text, key);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[cv-parse] OpenAI parse failed, using heuristic:", err instanceof Error ? err.message : err);
      }
    }
  }
  return heuristicParse(text);
}
