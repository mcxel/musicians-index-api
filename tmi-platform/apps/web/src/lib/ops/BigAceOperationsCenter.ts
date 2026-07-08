import { getFleetSummary } from "@/lib/qa/QACertificationFleet";

export type CompanyId =
  | "tmi"
  | "usa-stream-team"
  | "danikas-law-bubble"
  | "berntoutglobal-hq"
  | "hot-screens"
  | "willdoit";

export type DepartmentKey =
  | "revenue"
  | "marketing"
  | "security"
  | "infrastructure"
  | "ai"
  | "legal"
  | "accounting"
  | "customer-support"
  | "content"
  | "advertising"
  | "analytics"
  | "operations";

export type DepartmentHealth = {
  key: DepartmentKey;
  label: string;
  status: "green" | "yellow" | "red" | "unknown";
  score: number | null;
  source: "certification-fleet" | "ops-runtime" | "manual" | "unknown";
};

export type CompanyKPI = {
  key: string;
  label: string;
  value: string;
};

export type CompanyIssue = {
  severity: "critical" | "warning";
  message: string;
};

export type CompanyOperationsSnapshot = {
  id: CompanyId;
  name: string;
  departments: DepartmentHealth[];
  overallScore: number | null;
  releaseRecommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK" | "N/A";
  activeIssues: CompanyIssue[];
  warnings: CompanyIssue[];
  kpis: CompanyKPI[];
  recommendedActions: string[];
};

export type LeadershipLane = {
  lane: "executive" | "operations" | "specialized";
  owner: string;
  responsibilities: string[];
};

const DEPARTMENT_TEMPLATE: Array<{ key: DepartmentKey; label: string }> = [
  { key: "revenue", label: "Revenue" },
  { key: "marketing", label: "Marketing" },
  { key: "security", label: "Security" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "ai", label: "AI" },
  { key: "legal", label: "Legal" },
  { key: "accounting", label: "Accounting" },
  { key: "customer-support", label: "Customer Support" },
  { key: "content", label: "Content" },
  { key: "advertising", label: "Advertising" },
  { key: "analytics", label: "Analytics" },
  { key: "operations", label: "Operations" },
];

const COMPANY_REGISTRY: Array<{ id: CompanyId; name: string }> = [
  { id: "tmi", name: "The Musician's Index" },
  { id: "usa-stream-team", name: "USA Stream Team" },
  { id: "danikas-law-bubble", name: "Danika's Law Bubble" },
  { id: "berntoutglobal-hq", name: "BerntoutGlobal HQ" },
  { id: "hot-screens", name: "Hot Screens" },
  { id: "willdoit", name: "WillDoIt" },
];

function statusFromScore(score: number | null): DepartmentHealth["status"] {
  if (score === null) return "unknown";
  if (score >= 99) return "green";
  if (score >= 95) return "yellow";
  return "red";
}

function createDepartments(scoreMap: Partial<Record<DepartmentKey, number>>): DepartmentHealth[] {
  return DEPARTMENT_TEMPLATE.map((d) => {
    const score = scoreMap[d.key] ?? null;
    return {
      key: d.key,
      label: d.label,
      status: statusFromScore(score),
      score,
      source: score === null ? "unknown" : "certification-fleet",
    };
  });
}

function buildIssuesFromFleet(): { activeIssues: CompanyIssue[]; warnings: CompanyIssue[]; recommendedActions: string[] } {
  const fleet = getFleetSummary();
  const categories = fleet.categories;
  const categoryByKey = new Map(categories.map((c) => [c.key, c]));
  const activeIssues: CompanyIssue[] = [];
  const warnings: CompanyIssue[] = [];
  const recommendedActions: string[] = [];

  for (const c of categories) {
    if (c.fail > 0) {
      activeIssues.push({ severity: "critical", message: `${c.label} has ${c.fail} failing checks` });
      recommendedActions.push(`Recover ${c.label} failures and rerun certification evidence.`);
    } else if (c.pending > 0) {
      warnings.push({ severity: "warning", message: `${c.label} has ${c.pending} pending checks` });
      recommendedActions.push(`Complete pending ${c.label} checks to remove inferred risk.`);
    }
  }

  if ((categoryByKey.get("payments")?.score ?? 0) < 100) {
    activeIssues.push({ severity: "critical", message: "Payments are below strict critical threshold" });
    recommendedActions.push("Block deploy and validate payment/webhook flow with live evidence.");
  }

  if (fleet.releaseGate.strictEvidencePass === false) {
    activeIssues.push({ severity: "critical", message: "Strict evidence gate is not passing" });
    recommendedActions.push("Resolve required failures/skips before release approval.");
  }

  return {
    activeIssues,
    warnings,
    recommendedActions: Array.from(new Set(recommendedActions)).slice(0, 4),
  };
}

function mapTmiDepartmentsFromFleet(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const categories = new Map(fleet.categories.map((c) => [c.key, c]));
  const score = (key: string, fallback = fleet.platformHealthScore): number => categories.get(key)?.score ?? fallback;
  const issueBundle = buildIssuesFromFleet();
  const departments = createDepartments({
    revenue: score("commerce"),
    marketing: score("discovery"),
    security: score("security"),
    infrastructure: score("liveStreaming"),
    ai: score("admin"),
    legal: score("policy"),
    accounting: score("payments"),
    "customer-support": score("messaging"),
    content: score("mediaUpload"),
    advertising: score("commerce"),
    analytics: score("admin"),
    operations: fleet.platformHealthScore,
  });

  return {
    id: "tmi",
    name: "The Musician's Index",
    departments,
    overallScore: fleet.platformHealthScore,
    releaseRecommendation: fleet.releaseGate.recommendation,
    activeIssues: issueBundle.activeIssues,
    warnings: issueBundle.warnings,
    kpis: [
      { key: "revenue-health", label: "Revenue Health", value: `${score("commerce").toFixed(1)}%` },
      { key: "memberships", label: "Memberships", value: `${score("authentication").toFixed(1)}% auth` },
      { key: "live-rooms", label: "Live Rooms", value: `${score("liveStreaming").toFixed(1)}% runtime` },
      { key: "discovery", label: "Discovery", value: `${score("discovery").toFixed(1)}%` },
      { key: "magazine", label: "Magazine", value: `${score("mediaUpload").toFixed(1)}% content` },
      { key: "battles", label: "Battles", value: `${score("liveStreaming").toFixed(1)}% event health` },
      { key: "tickets", label: "Tickets", value: `${score("payments").toFixed(1)}% payments` },
      { key: "ads", label: "Ads", value: `${score("commerce").toFixed(1)}% monetization` },
      { key: "sponsors", label: "Sponsors", value: `${score("commerce").toFixed(1)}% sponsor path` },
    ],
    recommendedActions: issueBundle.recommendedActions,
  };
}

function adaptFromFleet(company: { id: CompanyId; name: string }, config: {
  departmentScores: Partial<Record<DepartmentKey, number>>;
  kpis: CompanyKPI[];
  recommendations: string[];
}): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const issues = buildIssuesFromFleet();
  const derivedOverall = Number(
    (
      Object.values(config.departmentScores).reduce((sum, value) => sum + (value ?? 0), 0) /
      Math.max(1, Object.values(config.departmentScores).length)
    ).toFixed(1),
  );
  const releaseRecommendation = fleet.platformHealthScore >= 99 ? "AUTO_DEPLOY" : fleet.platformHealthScore >= 95 ? "HUMAN_APPROVAL" : "BLOCK";

  return {
    id: company.id,
    name: company.name,
    departments: createDepartments(config.departmentScores),
    overallScore: derivedOverall,
    releaseRecommendation,
    activeIssues: issues.activeIssues,
    warnings: issues.warnings,
    kpis: config.kpis,
    recommendedActions: config.recommendations,
  };
}

function mapUsaStreamTeamAdapter(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const category = new Map(fleet.categories.map((c) => [c.key, c.score]));
  const stream = category.get("liveStreaming") ?? 0;
  const discovery = category.get("discovery") ?? 0;
  const analytics = category.get("admin") ?? 0;

  return adaptFromFleet(COMPANY_REGISTRY.find((c) => c.id === "usa-stream-team")!, {
    departmentScores: {
      revenue: category.get("commerce") ?? 0,
      marketing: discovery,
      security: category.get("security") ?? 0,
      infrastructure: stream,
      ai: analytics,
      legal: category.get("policy") ?? 0,
      accounting: category.get("payments") ?? 0,
      "customer-support": category.get("messaging") ?? 0,
      content: category.get("mediaUpload") ?? 0,
      advertising: category.get("commerce") ?? 0,
      analytics,
      operations: fleet.platformHealthScore,
    },
    kpis: [
      { key: "live-streams", label: "Live Streams", value: `${stream.toFixed(1)}%` },
      { key: "charts", label: "Charts", value: `${discovery.toFixed(1)}%` },
      { key: "rankings", label: "Rankings", value: `${discovery.toFixed(1)}%` },
      { key: "broadcast-health", label: "Broadcast Health", value: `${stream.toFixed(1)}%` },
      { key: "viewer-analytics", label: "Viewer Analytics", value: `${analytics.toFixed(1)}%` },
    ],
    recommendations: [
      "Pin stream reconnect incidents >2% to MC incident queue.",
      "Escalate chart freshness lag above SLA threshold.",
    ],
  });
}

function mapDanikasLawAdapter(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const category = new Map(fleet.categories.map((c) => [c.key, c.score]));
  const content = category.get("mediaUpload") ?? 0;
  const support = category.get("messaging") ?? 0;
  const policy = category.get("policy") ?? 0;

  return adaptFromFleet(COMPANY_REGISTRY.find((c) => c.id === "danikas-law-bubble")!, {
    departmentScores: {
      revenue: category.get("commerce") ?? 0,
      marketing: category.get("discovery") ?? 0,
      security: category.get("security") ?? 0,
      infrastructure: category.get("liveStreaming") ?? 0,
      ai: category.get("admin") ?? 0,
      legal: policy,
      accounting: category.get("payments") ?? 0,
      "customer-support": support,
      content,
      advertising: category.get("commerce") ?? 0,
      analytics: category.get("admin") ?? 0,
      operations: fleet.platformHealthScore,
    },
    kpis: [
      { key: "articles", label: "Articles", value: `${content.toFixed(1)}% pipeline` },
      { key: "legal-resources", label: "Legal Resources", value: `${policy.toFixed(1)}% policy integrity` },
      { key: "user-activity", label: "User Activity", value: `${support.toFixed(1)}% messaging` },
      { key: "publishing", label: "Publishing Pipeline", value: `${content.toFixed(1)}%` },
    ],
    recommendations: [
      "Escalate legal-resource publishing failures in under 30 minutes.",
      "Route unresolved policy warnings to Big Ace executive lane.",
    ],
  });
}

function mapHotScreensAdapter(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const category = new Map(fleet.categories.map((c) => [c.key, c.score]));
  const media = category.get("mediaUpload") ?? 0;
  const commerce = category.get("commerce") ?? 0;

  return adaptFromFleet(COMPANY_REGISTRY.find((c) => c.id === "hot-screens")!, {
    departmentScores: {
      revenue: commerce,
      marketing: category.get("discovery") ?? 0,
      security: category.get("security") ?? 0,
      infrastructure: category.get("liveStreaming") ?? 0,
      ai: category.get("admin") ?? 0,
      legal: category.get("policy") ?? 0,
      accounting: category.get("payments") ?? 0,
      "customer-support": category.get("messaging") ?? 0,
      content: media,
      advertising: commerce,
      analytics: category.get("admin") ?? 0,
      operations: fleet.platformHealthScore,
    },
    kpis: [
      { key: "studio-bookings", label: "Studio Bookings", value: `${commerce.toFixed(1)}%` },
      { key: "equipment", label: "Equipment", value: `${media.toFixed(1)}% media readiness` },
      { key: "video-render", label: "Video Rendering", value: `${media.toFixed(1)}%` },
      { key: "recording-sessions", label: "Recording Sessions", value: `${category.get("liveStreaming")?.toFixed(1) ?? "0.0"}%` },
    ],
    recommendations: [
      "Queue rendering retries immediately when media score drops below 99%.",
      "Escalate studio booking conflicts to MC operations queue.",
    ],
  });
}

function mapWillDoItAdapter(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const category = new Map(fleet.categories.map((c) => [c.key, c.score]));
  const support = category.get("messaging") ?? 0;

  return adaptFromFleet(COMPANY_REGISTRY.find((c) => c.id === "willdoit")!, {
    departmentScores: {
      revenue: category.get("commerce") ?? 0,
      marketing: category.get("discovery") ?? 0,
      security: category.get("security") ?? 0,
      infrastructure: category.get("liveStreaming") ?? 0,
      ai: category.get("admin") ?? 0,
      legal: category.get("policy") ?? 0,
      accounting: category.get("payments") ?? 0,
      "customer-support": support,
      content: category.get("mediaUpload") ?? 0,
      advertising: category.get("commerce") ?? 0,
      analytics: category.get("admin") ?? 0,
      operations: fleet.platformHealthScore,
    },
    kpis: [
      { key: "job-requests", label: "Job Requests", value: `${support.toFixed(1)}% queue intake` },
      { key: "assignments", label: "Contractor Assignments", value: `${support.toFixed(1)}% dispatch` },
      { key: "customer-queue", label: "Customer Queue", value: `${support.toFixed(1)}% response` },
      { key: "completion-rate", label: "Completion Rate", value: `${(category.get("operations") ?? fleet.platformHealthScore).toFixed(1)}%` },
    ],
    recommendations: [
      "Auto-escalate customer queue backlog above SLA.",
      "Trigger contractor reassignment when completion rate drops below target.",
    ],
  });
}

function mapBerntoutGlobalHQAdapter(): CompanyOperationsSnapshot {
  const fleet = getFleetSummary();
  const category = new Map(fleet.categories.map((c) => [c.key, c.score]));

  return adaptFromFleet(COMPANY_REGISTRY.find((c) => c.id === "berntoutglobal-hq")!, {
    departmentScores: {
      revenue: category.get("commerce") ?? 0,
      marketing: category.get("discovery") ?? 0,
      security: category.get("security") ?? 0,
      infrastructure: category.get("liveStreaming") ?? 0,
      ai: category.get("admin") ?? 0,
      legal: category.get("policy") ?? 0,
      accounting: category.get("payments") ?? 0,
      "customer-support": category.get("messaging") ?? 0,
      content: category.get("mediaUpload") ?? 0,
      advertising: category.get("commerce") ?? 0,
      analytics: category.get("admin") ?? 0,
      operations: fleet.platformHealthScore,
    },
    kpis: [
      { key: "executive-runtime", label: "Executive Runtime", value: `${fleet.platformHealthScore.toFixed(1)}%` },
      { key: "deploy-gates", label: "Deploy Gates", value: fleet.releaseGate.recommendation },
      { key: "certification-fleet", label: "Certification Fleet", value: `${fleet.pass}/${fleet.total} pass` },
      { key: "critical-alerts", label: "Critical Alerts", value: `${fleet.fail}` },
    ],
    recommendations: [
      "Review unresolved critical categories before executive signoff.",
      "Keep strict evidence mode enabled for all production deploys.",
    ],
  });
}

export function getBigAceLeadershipLanes(): LeadershipLane[] {
  return [
    {
      lane: "executive",
      owner: "Big Ace",
      responsibilities: [
        "Company-wide strategy",
        "Certification gate approvals",
        "Financial oversight",
        "Deployment approval",
        "Executive alerting",
      ],
    },
    {
      lane: "operations",
      owner: "MC (Michael Charlie)",
      responsibilities: [
        "Runtime monitoring",
        "Workflow orchestration",
        "Bot supervision",
        "Department coordination",
        "Keep certifications green",
      ],
    },
    {
      lane: "specialized",
      owner: "Domain AI Leaders",
      responsibilities: [
        "Revenue AI",
        "Security AI",
        "Marketing AI",
        "Support AI",
        "Content AI",
      ],
    },
  ];
}

export function getBigAceOperationsSnapshot(): {
  generatedAt: string;
  companies: CompanyOperationsSnapshot[];
  leadership: LeadershipLane[];
} {
  const companies: CompanyOperationsSnapshot[] = [
    mapTmiDepartmentsFromFleet(),
    mapUsaStreamTeamAdapter(),
    mapDanikasLawAdapter(),
    mapBerntoutGlobalHQAdapter(),
    mapHotScreensAdapter(),
    mapWillDoItAdapter(),
  ];

  return {
    generatedAt: new Date().toISOString(),
    companies,
    leadership: getBigAceLeadershipLanes(),
  };
}
