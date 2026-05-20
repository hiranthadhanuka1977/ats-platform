import type { Metadata } from "next";
import { InterviewsCalendar } from "@/components/interviews/InterviewsCalendar";
import { listInterviewsForCalendar } from "@/lib/interviews-list";

export const metadata: Metadata = {
  title: "Interviews",
  description: "Schedule and track interviews.",
};

export default async function InterviewsPage() {
  const interviews = await listInterviewsForCalendar();

  return (
    <main id="main-content" className="bo-content bo-content--interviews">
      <h1 className="bo-page-title">Interviews</h1>
      <p className="bo-page-sub">
        Calendar view of scheduled interviews across all applications. Select a day to see details.
      </p>
      <InterviewsCalendar interviews={interviews} />
    </main>
  );
}
