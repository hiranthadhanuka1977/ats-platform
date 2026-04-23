import { prisma } from "@/lib/prisma";

type CandidateSummaryCard = {
  label: string;
  value: string;
  trend: string;
  tone: "up" | "down" | "neutral";
};

function trendHoverText(tone: CandidateSummaryCard["tone"]): string {
  if (tone === "up") return "Up trending";
  if (tone === "down") return "Down trending";
  return "Stable";
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export async function CandidatesSummaryContent() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMonday = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const [totalRegistered, activeCandidates, newThisWeek, withApplications, shortlisted, rejected, hired] = await Promise.all([
    prisma.candidateAccount.count(),
    prisma.candidateAccount.count({
      where: { status: "active" },
    }),
    prisma.candidateAccount.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.candidateAccount.count({
      where: { applications: { some: {} } },
    }),
    prisma.candidateAccount.count({
      where: { applications: { some: { status: "shortlisted" } } },
    }),
    prisma.candidateAccount.count({
      where: { applications: { some: { status: "rejected" } } },
    }),
    prisma.candidateAccount.count({
      where: { applications: { some: { status: "offered" } } },
    }),
  ]);

  const withoutApplications = Math.max(totalRegistered - withApplications, 0);
  const activeRate = totalRegistered > 0 ? (activeCandidates / totalRegistered) * 100 : 0;
  const conversionRate = totalRegistered > 0 ? (withApplications / totalRegistered) * 100 : 0;
  const noApplicationRate = totalRegistered > 0 ? (withoutApplications / totalRegistered) * 100 : 0;
  const shortlistedRate = withApplications > 0 ? (shortlisted / withApplications) * 100 : 0;
  const rejectedRate = withApplications > 0 ? (rejected / withApplications) * 100 : 0;
  const hiredRate = withApplications > 0 ? (hired / withApplications) * 100 : 0;

  const summaryCards: CandidateSummaryCard[] = [
    {
      label: "Total Registered",
      value: formatNumber(totalRegistered),
      trend: `${formatNumber(newThisWeek)} new this week`,
      tone: newThisWeek > 0 ? "up" : "neutral",
    },
    {
      label: "Total Active",
      value: formatNumber(activeCandidates),
      trend: `${formatPercent(activeRate)} active rate`,
      tone: activeRate >= 60 ? "up" : "neutral",
    },
    {
      label: "With Applications",
      value: formatNumber(withApplications),
      trend: `${formatPercent(conversionRate)} conversion`,
      tone: conversionRate >= 50 ? "up" : "neutral",
    },
    {
      label: "Without Applications",
      value: formatNumber(withoutApplications),
      trend: `${formatPercent(noApplicationRate)} pending action`,
      tone: noApplicationRate > 40 ? "down" : "neutral",
    },
    {
      label: "Shortlisted",
      value: formatNumber(shortlisted),
      trend: `${formatPercent(shortlistedRate)} of applied candidates`,
      tone: shortlistedRate >= 20 ? "up" : "neutral",
    },
    {
      label: "Rejected",
      value: formatNumber(rejected),
      trend: `${formatPercent(rejectedRate)} of applied candidates`,
      tone: rejectedRate > 50 ? "down" : "neutral",
    },
    {
      label: "Hired",
      value: formatNumber(hired),
      trend: `${formatPercent(hiredRate)} of applied candidates`,
      tone: hiredRate > 0 ? "up" : "neutral",
    },
  ];

  return (
    <div className="bo-dash-grid">
      <section className="bo-span-12 bo-candidate-summary-section" aria-label="Candidate summary cards">
        <div className="bo-candidate-summary-grid">
          {summaryCards.map((card) => (
            <article key={card.label} className={`bo-candidate-summary-card bo-candidate-summary-card--${card.tone}`}>
              <div className="bo-candidate-summary-head">
                <p className="bo-candidate-summary-label">{card.label}</p>
                <span
                  className={`bo-candidate-summary-trend-line bo-candidate-summary-trend-line--${card.tone}`}
                  title={trendHoverText(card.tone)}
                  aria-label={trendHoverText(card.tone)}
                />
              </div>
              <div className="bo-candidate-summary-metric">
                <p className="bo-candidate-summary-value">{card.value}</p>
              </div>
              <p className={`bo-candidate-summary-trend bo-candidate-summary-trend--${card.tone}`}>
                {card.trend}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-registrations">
        <h2 id="candidate-chart-registrations" className="bo-card-title">
          Candidate registrations by month
        </h2>
        <div className="bo-candidate-chart-canvas">
          <svg viewBox="0 0 300 120" className="bo-candidate-svg-chart" aria-hidden="true">
            <polyline className="bo-candidate-svg-line" points="10,98 58,84 106,74 154,58 202,46 250,32 290,22" />
            <circle className="bo-candidate-svg-point" cx="10" cy="98" r="3" />
            <circle className="bo-candidate-svg-point" cx="58" cy="84" r="3" />
            <circle className="bo-candidate-svg-point" cx="106" cy="74" r="3" />
            <circle className="bo-candidate-svg-point" cx="154" cy="58" r="3" />
            <circle className="bo-candidate-svg-point" cx="202" cy="46" r="3" />
            <circle className="bo-candidate-svg-point" cx="250" cy="32" r="3" />
            <circle className="bo-candidate-svg-point" cx="290" cy="22" r="3" />
          </svg>
        </div>
        <div className="bo-candidate-chart-foot">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
        </div>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-status-breakdown">
        <h2 id="candidate-chart-status-breakdown" className="bo-card-title">
          Application status breakdown
        </h2>
        <div className="bo-candidate-chart-canvas bo-candidate-chart-canvas--center">
          <div className="bo-candidate-donut" role="img" aria-label="Status split: Submitted 42, Review 28, Shortlisted 18, Rejected 12">
            <div className="bo-candidate-donut-inner">42%</div>
          </div>
        </div>
        <div className="bo-candidate-legend">
          <span><i className="bo-candidate-legend-dot bo-candidate-legend-dot--1" />Submitted</span>
          <span><i className="bo-candidate-legend-dot bo-candidate-legend-dot--2" />Review</span>
          <span><i className="bo-candidate-legend-dot bo-candidate-legend-dot--3" />Shortlisted</span>
          <span><i className="bo-candidate-legend-dot bo-candidate-legend-dot--4" />Rejected</span>
        </div>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-top-jobs">
        <h2 id="candidate-chart-top-jobs" className="bo-card-title">
          Top applied job postings
        </h2>
        <ul className="bo-candidate-bars-list">
          <li><span>Senior QA Engineer</span><b style={{ width: "82%" }} /></li>
          <li><span>Product Designer</span><b style={{ width: "69%" }} /></li>
          <li><span>Backend Engineer</span><b style={{ width: "61%" }} /></li>
          <li><span>Frontend Engineer</span><b style={{ width: "52%" }} /></li>
        </ul>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-experience-level">
        <h2 id="candidate-chart-experience-level" className="bo-card-title">
          Candidates by experience level
        </h2>
        <div className="bo-candidate-column-chart" aria-hidden="true">
          <div><span style={{ height: "40%" }} /><label>Entry</label></div>
          <div><span style={{ height: "68%" }} /><label>Mid</label></div>
          <div><span style={{ height: "83%" }} /><label>Senior</label></div>
          <div><span style={{ height: "36%" }} /><label>Lead</label></div>
        </div>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-location">
        <h2 id="candidate-chart-location" className="bo-card-title">
          Candidates by location
        </h2>
        <ul className="bo-candidate-bars-list">
          <li><span>Colombo</span><b style={{ width: "78%" }} /></li>
          <li><span>Kandy</span><b style={{ width: "56%" }} /></li>
          <li><span>Galle</span><b style={{ width: "44%" }} /></li>
          <li><span>Remote</span><b style={{ width: "62%" }} /></li>
        </ul>
      </section>

      <section className="bo-card bo-span-4 bo-candidate-chart-card" aria-labelledby="candidate-chart-source">
        <h2 id="candidate-chart-source" className="bo-card-title">
          Candidate source mix
        </h2>
        <div className="bo-candidate-chart-canvas">
          <svg viewBox="0 0 300 120" className="bo-candidate-svg-chart" aria-hidden="true">
            <rect className="bo-candidate-svg-bar" x="24" y="38" width="36" height="64" />
            <rect className="bo-candidate-svg-bar" x="84" y="52" width="36" height="50" />
            <rect className="bo-candidate-svg-bar" x="144" y="65" width="36" height="37" />
            <rect className="bo-candidate-svg-bar" x="204" y="74" width="36" height="28" />
          </svg>
          <div className="bo-candidate-chart-foot">
            <span>LinkedIn</span>
            <span>Website</span>
            <span>Referral</span>
            <span>Other</span>
          </div>
        </div>
      </section>

    </div>
  );
}
