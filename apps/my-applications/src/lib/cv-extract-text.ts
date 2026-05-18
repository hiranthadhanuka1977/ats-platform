import { readFile } from "node:fs/promises";

async function extractPdfText(buffer: Uint8Array): Promise<string> {
  const mod = await import("pdf-parse");
  const legacy = (mod as { default?: (b: Buffer) => Promise<{ text?: string }> }).default;
  if (typeof legacy === "function") {
    const res = await legacy(Buffer.from(buffer));
    return (res.text ?? "").trim();
  }
  const PDFParse = (mod as {
    PDFParse?: new (opts: { data: Uint8Array }) => {
      getText: () => Promise<{ text: string }>;
      destroy: () => Promise<void>;
    };
  }).PDFParse;
  if (!PDFParse) throw new Error("PDF_PARSE_UNAVAILABLE");
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromCvFile(mimeType: string, absPath: string): Promise<string> {
  const buf = await readFile(absPath);

  if (mimeType === "application/pdf") {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return extractPdfText(bytes);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return (res.value ?? "").trim();
  }

  throw new Error("UNSUPPORTED_TYPE");
}
