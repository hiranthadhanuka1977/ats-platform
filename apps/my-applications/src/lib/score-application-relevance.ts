import { ensureApplicationRelevanceScore } from "@ats-platform/db";
import { prisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/server-env";

/** Score once at apply; failures are logged and do not block submission. */
export async function scoreApplicationRelevanceOnApply(applicationId: string): Promise<void> {
  const apiKey = getServerEnv("OPENAI_API_KEY");
  if (!apiKey) return;

  try {
    await ensureApplicationRelevanceScore({
      applicationId,
      prisma,
      apiKey,
      model: getServerEnv("OPENAI_RELEVANCE_MODEL") || undefined,
      forceRefresh: true,
    });
  } catch (err) {
    console.error("[apply] relevance scoring failed:", err);
  }
}
