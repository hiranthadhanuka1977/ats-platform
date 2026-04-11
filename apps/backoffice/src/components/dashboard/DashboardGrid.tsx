import { CuratorInsight } from "./CuratorInsight";
import { DashboardHeader } from "./DashboardHeader";
import { EfficiencyScoreCard } from "./EfficiencyScoreCard";
import { PipelineHealth } from "./PipelineHealth";
import { RecentActivity } from "./RecentActivity";
import { StatRow } from "./StatRow";

export function DashboardGrid() {
  return (
    <main id="main-content" className="bo-content">
      <DashboardHeader />
      <div className="bo-dash-grid">
        <EfficiencyScoreCard />
        <StatRow />
        <RecentActivity />
        <PipelineHealth />
        <CuratorInsight />
      </div>
    </main>
  );
}
