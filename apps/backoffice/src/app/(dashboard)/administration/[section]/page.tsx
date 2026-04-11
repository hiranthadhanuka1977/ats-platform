import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaintenanceCrud } from "@/components/administration/MaintenanceCrud";
import {
  isMaintenanceSectionId,
  MAINTENANCE_SECTIONS,
  type MaintenanceSectionId,
} from "@/components/administration/maintenance-config";
import { loadAdministrationContent } from "@/lib/load-administration-content";

type Props = Readonly<{
  params: Promise<{ section: string }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  if (!isMaintenanceSectionId(section)) {
    return { title: "Not found" };
  }
  const title = MAINTENANCE_SECTIONS[section as MaintenanceSectionId].title;
  return { title: title };
}

export default async function AdministrationSectionPage({ params }: Props) {
  const { section } = await params;
  if (!isMaintenanceSectionId(section)) {
    notFound();
  }

  const content = await loadAdministrationContent(section);

  return (
    <main id="main-content">
      <MaintenanceCrud
        section={section}
        contentSummary={content.summary}
        bodyMarkdown={content.bodyMarkdown}
      />
    </main>
  );
}
