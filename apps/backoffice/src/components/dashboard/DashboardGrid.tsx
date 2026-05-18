import type { DashboardStatsData } from "@/lib/dashboard-stats";
import { CuratorInsight } from "./CuratorInsight";
import { DashboardHeader } from "./DashboardHeader";
import { EfficiencyScoreCard } from "./EfficiencyScoreCard";
import { PipelineHealth } from "./PipelineHealth";
import { RecentActivity } from "./RecentActivity";
import { StatRow } from "./StatRow";

export function DashboardGrid({
  stats,
  efficiencyScore,
  pipelineStages,
  recentActivity,
  stalledInterviewCount,
}: DashboardStatsData) {
  return (
    <main id="main-content" className="bo-content">
      <DashboardHeader />
      <div className="bo-dash-grid">
        <EfficiencyScoreCard score={efficiencyScore} />
        <StatRow stats={stats} />
        <RecentActivity items={recentActivity} />
        <PipelineHealth stages={pipelineStages} />
        <CuratorInsight stalledInterviewCount={stalledInterviewCount} />
      </div>
    </main>
  );
}
