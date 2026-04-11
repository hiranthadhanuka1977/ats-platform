import { readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { MaintenanceSectionId } from "@/components/administration/maintenance-config";

export type AdministrationContent = {
  /** Short line under the section title (from frontmatter `summary`). */
  summary: string;
  /** Markdown body for the expandable “About this list” (content after frontmatter). */
  bodyMarkdown: string;
};

/**
 * Loads `content/administration/<section>.md` from the backoffice app root.
 * Missing or invalid files yield empty strings.
 */
export async function loadAdministrationContent(
  section: MaintenanceSectionId
): Promise<AdministrationContent> {
  const filePath = path.join(process.cwd(), "content", "administration", `${section}.md`);
  try {
    const raw = await readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const summary = typeof data.summary === "string" ? data.summary.trim() : "";
    const bodyMarkdown = typeof content === "string" ? content.trim() : "";
    return { summary, bodyMarkdown };
  } catch {
    return { summary: "", bodyMarkdown: "" };
  }
}
