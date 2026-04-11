import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/** Resolves a unique `job_postings.slug` from title or an explicit slug. */
export async function allocateJobSlug(title: string, explicitSlug?: string): Promise<string> {
  const base = explicitSlug?.trim() ? slugify(explicitSlug.trim()) : slugify(title);
  let slug = base || "job";
  let candidate = slug;
  let n = 0;
  while (await prisma.jobPosting.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}
