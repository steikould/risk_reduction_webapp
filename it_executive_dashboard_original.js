// State Management
let currentState = {
  view: "enterprise", // 'enterprise', 'hp', 'ah'
  period: "2026-05",
  activeTab: "executive-summary",
  filters: {
    q: "",
    bu: "all",
    health: "all",
    sort: "risk",
    dir: "desc",
  },
};

// Seed Data
const kpisData = {
  enterprise: [
    {
      id: "overall",
      label: "OVERALL US IT HEALTH SCORE",
      score: 82,
      emphasis: true,
      delta: { value: 5, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ah",
      label: "AH HEALTH SCORE",
      score: 84,
      delta: { value: 6, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "hp",
      label: "HP HEALTH SCORE",
      score: 79,
      delta: { value: 3, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "portfolio",
      label: "PORTFOLIO HEALTH",
      score: 76,
      delta: { value: -2, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ai-readiness",
      label: "AI READINESS",
      score: 72,
      delta: { value: 4, comparedTo: "Apr 12, 2026" },
    },
  ],
  hp: [
    {
      id: "overall",
      label: "OVERALL US IT HEALTH SCORE",
      score: 79,
      emphasis: true,
      delta: { value: 3, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ah",
      label: "AH HEALTH SCORE",
      score: 84,
      delta: { value: 6, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "hp",
      label: "HP HEALTH SCORE",
      score: 79,
      delta: { value: 3, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "portfolio",
      label: "PORTFOLIO HEALTH",
      score: 71,
      delta: { value: -4, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ai-readiness",
      label: "AI READINESS",
      score: 70,
      delta: { value: 3, comparedTo: "Apr 12, 2026" },
    },
  ],
  ah: [
    {
      id: "overall",
      label: "OVERALL US IT HEALTH SCORE",
      score: 84,
      emphasis: true,
      delta: { value: 6, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ah",
      label: "AH HEALTH SCORE",
      score: 84,
      delta: { value: 6, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "hp",
      label: "HP HEALTH SCORE",
      score: 79,
      delta: { value: 3, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "portfolio",
      label: "PORTFOLIO HEALTH",
      score: 81,
      delta: { value: 1, comparedTo: "Apr 12, 2026" },
    },
    {
      id: "ai-readiness",
      label: "AI READINESS",
      score: 75,
      delta: { value: 5, comparedTo: "Apr 12, 2026" },
    },
  ],
};

const domainsData = {
  enterprise: [
    {
      id: "business-trust",
      title: "BUSINESS TRUST",
      accent: "var(--color-domain-trust)",
      icon: "handshake",
      visual: { kind: "donut", score: 85 },
      metrics: [
        { label: "NPS Score", value: "+32", direction: "higher-is-better" },
        {
          label: "Escalations (MTD)",
          value: "-12",
          direction: "lower-is-better",
          tone: "good",
        },
        { label: "Adoption Rate", value: "68%", direction: "higher-is-better" },
      ],
      trend: {
        caption: "NPS Trend",
        kind: "line",
        points: [
          { l: "Feb", v: 22 },
          { l: "Mar", v: 26 },
          { l: "Apr", v: 29 },
          { l: "May", v: 32 },
        ],
        color: "var(--color-domain-trust)",
      },
    },
    {
      id: "operational-health",
      title: "OPERATIONAL HEALTH",
      accent: "var(--color-domain-ops)",
      icon: "settings",
      visual: { kind: "gauge", score: 87 },
      metrics: [
        {
          label: "Major Incidents (MTD)",
          value: "5",
          direction: "lower-is-better",
        },
        {
          label: "Availability",
          value: "99.6%",
          direction: "higher-is-better",
        },
        {
          label: "SLA Achievement",
          value: "84%",
          direction: "higher-is-better",
        },
      ],
      trend: {
        caption: "Incidents Trend (6 Months)",
        kind: "bar",
        points: [
          { l: "Dec", v: 14 },
          { l: "Jan", v: 11 },
          { l: "Feb", v: 16 },
          { l: "Mar", v: 9 },
          { l: "Apr", v: 7 },
          { l: "May", v: 12 },
        ],
        color: "var(--color-domain-ops)",
      },
    },
    {
      id: "strategic-portfolio",
      title: "STRATEGIC PORTFOLIO",
      accent: "var(--color-domain-portfolio)",
      icon: "briefcase",
      visual: {
        kind: "donut-legend",
        score: 74,
        segments: [
          { val: 26, col: "var(--color-status-good)" },
          { val: 11, col: "var(--color-status-fair)" },
          { val: 5, col: "var(--color-status-poor)" },
        ],
      },
      legend: [
        { label: "On Track", count: 26, color: "var(--color-status-good)" },
        { label: "At Risk", count: 11, color: "var(--color-status-fair)" },
        { label: "Off Track", count: 5, color: "var(--color-status-poor)" },
        { label: "Total", count: 42, color: "transparent", isTotal: true },
      ],
      stackedBar: {
        caption: "Top 10-20 Priority Projects",
        segments: [
          { val: 12, col: "var(--color-status-good)" },
          { val: 6, col: "var(--color-status-fair)" },
          { val: 2, col: "var(--color-status-poor)" },
        ],
      },
    },
    {
      id: "delivery-value",
      title: "DELIVERY & VALUE",
      accent: "var(--color-domain-delivery)",
      icon: "rocket",
      visual: { kind: "gauge", score: 79 },
      metrics: [
        {
          label: "Benefits Realization",
          value: "76%",
          direction: "higher-is-better",
        },
        {
          label: "Projects On Track",
          value: "68%",
          direction: "higher-is-better",
        },
        {
          label: "Time to Value (avg)",
          value: "4.2 mos",
          direction: "lower-is-better",
          valueColor: "var(--color-domain-delivery)",
        },
      ],
      trend: {
        caption: "Benefits Realization Trend",
        kind: "line",
        points: [
          { l: "", v: 38 },
          { l: "Feb", v: 79 },
          { l: "Mar", v: 72 },
          { l: "Apr", v: 70 },
          { l: "May", v: 76 },
        ],
        color: "var(--color-domain-delivery)",
      },
    },
    {
      id: "financial-health",
      title: "FINANCIAL HEALTH",
      accent: "var(--color-domain-finance)",
      icon: "circle-dollar-sign",
      visual: { kind: "bars" },
      bars: [
        {
          label: "Budget vs Actual (YTD)",
          percent: 82,
          value: "82%",
          color: "var(--color-domain-finance)",
        },
        {
          label: "Forecast Accuracy",
          percent: 93,
          value: "93%",
          color: "var(--color-domain-finance)",
        },
        {
          label: "Cost Savings (YTD)",
          percent: 68,
          value: "$2.4M",
          color: "var(--color-domain-finance)",
        },
        {
          label: "Run vs Change",
          percent: 54,
          value: "54% / 46%",
          split: true,
          color1: "var(--color-chart-1)",
          color2: "#0d2b52",
        },
      ],
    },
    {
      id: "people-capability",
      title: "PEOPLE & CAPABILITY",
      accent: "var(--color-domain-people)",
      icon: "users",
      visual: { kind: "gauge", score: 71 },
      metrics: [
        {
          label: "Engagement Score",
          value: "71%",
          direction: "higher-is-better",
        },
        { label: "Open Positions", value: "18%", direction: "lower-is-better" },
        {
          label: "Retention (TTM)",
          value: "91%",
          direction: "higher-is-better",
        },
        {
          label: "Learning Hours (YTD)",
          value: "4.1K",
          direction: "higher-is-better",
        },
      ],
      trend: {
        caption: "Engagement Trend",
        kind: "line",
        points: [
          { l: "Feb", v: 68 },
          { l: "Mar", v: 73 },
          { l: "Apr", v: 69 },
          { l: "May", v: 71 },
        ],
        color: "var(--color-domain-people)",
      },
    },
    {
      id: "ai-innovation",
      title: "AI & INNOVATION",
      accent: "var(--color-domain-ai)",
      icon: "brain-circuit",
      visual: { kind: "donut", score: 72 },
      metrics: [
        {
          label: "AI Adoption Index",
          value: "69%",
          direction: "higher-is-better",
        },
        {
          label: "AI Use Cases in Prod",
          value: "15",
          direction: "higher-is-better",
        },
        {
          label: "Copilot Utilization",
          value: "62%",
          direction: "higher-is-better",
        },
        {
          label: "Automation Impact (YTD)",
          value: "11.2K hrs",
          direction: "higher-is-better",
        },
      ],
      trend: {
        caption: "AI Adoption Trend",
        kind: "line",
        points: [
          { l: "Feb", v: 58 },
          { l: "Mar", v: 63 },
          { l: "Apr", v: 65 },
          { l: "May", v: 69 },
        ],
        color: "var(--color-domain-ai)",
      },
    },
    {
      id: "cyber-compliance",
      title: "CYBER & COMPLIANCE",
      accent: "var(--color-domain-cyber)",
      icon: "shield-check",
      visual: { kind: "donut", score: 89 },
      metrics: [
        {
          label: "Security Posture Score",
          value: "89%",
          direction: "higher-is-better",
        },
        {
          label: "Critical Vulnerabilities",
          value: "7",
          direction: "lower-is-better",
          valueColor: "var(--color-status-poor)",
        },
        {
          label: "Policy Compliance",
          value: "96%",
          direction: "higher-is-better",
        },
        {
          label: "Audit Issues (Open)",
          value: "3",
          direction: "lower-is-better",
          valueColor: "var(--color-status-poor)",
        },
      ],
      trend: {
        caption: "Security Events Trend (6 Months)",
        kind: "line",
        points: [
          { l: "Dec", v: 6 },
          { l: "Jan", v: 13 },
          { l: "Feb", v: 9 },
          { l: "Mar", v: 15 },
          { l: "Apr", v: 8 },
          { l: "May", v: 7 },
        ],
        color: "var(--color-domain-cyber)",
      },
    },
  ],
  // HP and AH data derived proportionally for demo as requested by spec 9.8
  hp: [],
  ah: [],
};

// Copy enterprise data to hp/ah and adjust scores for demo
domainsData.hp = JSON.parse(JSON.stringify(domainsData.enterprise));
domainsData.hp.forEach((d) => {
  if (d.visual.score) d.visual.score = Math.max(0, d.visual.score - 4);
});

domainsData.ah = JSON.parse(JSON.stringify(domainsData.enterprise));
domainsData.ah.forEach((d) => {
  if (d.visual.score) d.visual.score = Math.min(100, d.visual.score + 2);
});

const priorityProjectsPanel = [
  {
    id: "sap-s4hana-modernization",
    name: "SAP S/4HANA Modernization",
    unit: "HP",
    health: "on-track",
    schedule: "On Track",
    budget: "On Plan",
    riskLevel: "Low",
    riskPct: 12,
  },
  {
    id: "data-platform-transformation",
    name: "Data Platform Transformation",
    unit: "Enterprise",
    health: "at-risk",
    schedule: "At Risk",
    budget: "At Risk",
    riskLevel: "High",
    riskPct: 75,
  },
  {
    id: "omnichannel-experience",
    name: "Omnichannel Experience",
    unit: "AH",
    health: "at-risk",
    schedule: "At Risk",
    budget: "On Plan",
    riskLevel: "Medium",
    riskPct: 40,
  },
  {
    id: "quality-regulatory-systems",
    name: "Quality & Regulatory Systems",
    unit: "HP",
    health: "on-track",
    schedule: "On Track",
    budget: "On Plan",
    riskLevel: "Low",
    riskPct: 18,
  },
  {
    id: "legacy-application-retirement",
    name: "Legacy Application Retirement",
    unit: "Enterprise",
    health: "off-track",
    schedule: "Off Track",
    budget: "At Risk",
    riskLevel: "High",
    riskPct: 80,
  },
];

const risksData = [
  {
    id: "risk-1",
    rank: 1,
    title: "Data Platform Transformation",
    detail:
      "High likelihood of schedule delay based on resource and dependency constraints across the ingestion and governance workstreams.",
  },
  {
    id: "risk-2",
    rank: 2,
    title: "Legacy Application Retirement",
    detail:
      "Off track on schedule with budget at risk; decommissioning dependencies on SAP S/4HANA cutover remain unresolved.",
  },
  {
    id: "risk-3",
    rank: 3,
    title: "Engagement decline in delivery teams",
    detail:
      "Engagement has softened while open positions sit at 18%, increasing key-person risk on the two highest-risk programmes.",
  },
];

const decisionsData = [
  {
    id: "dec-1",
    rank: 1,
    text: "Approve additional resources for 2 at-risk projects.",
  },
  {
    id: "dec-2",
    rank: 2,
    text: "Prioritize investment in AI and automation initiatives.",
  },
  {
    id: "dec-3",
    rank: 3,
    text: "Endorse portfolio rebalancing toward Data Platform and Security.",
  },
];

const aiSummaryText =
  "US IT overall health is Good (82%) with strong operational performance and cybersecurity posture. Strategic Portfolio shows moderate risk due to 2 high-risk projects requiring executive attention. People engagement is declining and should be addressed. AI adoption momentum is positive with 15 use cases in production. Focus on data platform stabilization and resource alignment to improve delivery confidence across HP and AH.";

// Generate 42 Full Projects
const generateProjects = () => {
  const projects = [];

  // Add the 5 priority featured
  const featured = [
    {
      id: "sap-s4hana-modernization",
      name: "SAP S/4HANA Modernization",
      unit: "HP",
      owner: "A. Whitfield",
      sponsor: "CFO",
      phase: "Build",
      start: "2025-01-15",
      target: "2027-03-31",
      pctComplete: 46,
      budgetM: 28.0,
      budgetUsedPct: 44,
      riskRationale: "Stable velocity and no unresolved critical dependencies.",
      isPriority: true,
      isFeatured: true,
      health: "on-track",
      schedule: "On Track",
      budget: "On Plan",
      riskLevel: "Low",
      riskPct: 12,
    },
    {
      id: "data-platform-transformation",
      name: "Data Platform Transformation",
      unit: "Enterprise",
      owner: "R. Nakamura",
      sponsor: "CIO",
      phase: "Build",
      start: "2025-06-01",
      target: "2026-11-30",
      pctComplete: 38,
      budgetM: 14.5,
      budgetUsedPct: 61,
      riskRationale:
        "Contended data engineering capacity and an unresolved upstream dependency on the ERP cutover.",
      isPriority: true,
      isFeatured: true,
      health: "at-risk",
      schedule: "At Risk",
      budget: "At Risk",
      riskLevel: "High",
      riskPct: 75,
    },
    {
      id: "omnichannel-experience",
      name: "Omnichannel Experience",
      unit: "AH",
      owner: "L. Okafor",
      sponsor: "CCO",
      phase: "Pilot",
      start: "2025-09-01",
      target: "2026-12-31",
      pctComplete: 52,
      budgetM: 9.2,
      budgetUsedPct: 47,
      riskRationale:
        "Scope growth in the field-force journey is compressing the pilot window.",
      isPriority: true,
      isFeatured: true,
      health: "at-risk",
      schedule: "At Risk",
      budget: "On Plan",
      riskLevel: "Medium",
      riskPct: 40,
    },
    {
      id: "quality-regulatory-systems",
      name: "Quality & Regulatory Systems",
      unit: "HP",
      owner: "M. Brennan",
      sponsor: "Head of Quality",
      phase: "Build",
      start: "2025-03-01",
      target: "2026-10-31",
      pctComplete: 61,
      budgetM: 11.8,
      budgetUsedPct: 55,
      riskRationale:
        "Validated release path is proven and change volume is low.",
      isPriority: true,
      isFeatured: true,
      health: "on-track",
      schedule: "On Track",
      budget: "On Plan",
      riskLevel: "Low",
      riskPct: 18,
    },
    {
      id: "legacy-application-retirement",
      name: "Legacy Application Retirement",
      unit: "Enterprise",
      owner: "D. Castellano",
      sponsor: "CIO",
      phase: "Execute",
      start: "2024-11-01",
      target: "2026-08-31",
      pctComplete: 27,
      budgetM: 6.4,
      budgetUsedPct: 78,
      riskRationale:
        "Decommissioning is blocked behind two migrations with no agreed cutover date.",
      isPriority: true,
      isFeatured: true,
      health: "off-track",
      schedule: "Off Track",
      budget: "At Risk",
      riskLevel: "High",
      riskPct: 80,
    },
  ];
  projects.push(...featured);

  const extraNames = [
    "Clinical Data Lake",
    "Veterinary Field Force Mobility",
    "GxP Cloud Landing Zone",
    "Commercial Analytics Modernization",
    "Identity & Access Modernization",
    "Serialization Track & Trace",
    "Manufacturing Execution Upgrade",
    "HR Core Consolidation",
    "Network Edge Refresh",
    "Endpoint Zero Trust Rollout",
    "LIMS Upgrade",
    "Supply Chain Visibility",
    "R&D Workflow Automation",
    "Customer Portal Revamp",
    "Data Privacy Shield",
    "Cloud Cost Optimization",
    "AI Chatbot for IT Support",
    "Mobile Device Management",
    "Warehouse Automation API",
    "Salesforce Consolidation",
  ];

  // We need 42 total. HP:18, AH:14, Ent:10.
  // Currently have: HP:2, AH:1, Ent:2.
  // Need: HP:16, AH:13, Ent:8.
  // On-track: 26 (have 2, need 24)
  // At-risk: 11 (have 2, need 9)
  // Off-track: 5 (have 1, need 4)

  let counts = {
    HP: { "on-track": 9, "at-risk": 5, "off-track": 2 },
    AH: { "on-track": 9, "at-risk": 3, "off-track": 1 },
    Enterprise: { "on-track": 6, "at-risk": 1, "off-track": 1 },
  };

  let idCounter = 1;
  for (const bu of ["HP", "AH", "Enterprise"]) {
    for (const health of ["on-track", "at-risk", "off-track"]) {
      for (let i = 0; i < counts[bu][health]; i++) {
        let name =
          extraNames[idCounter % extraNames.length] +
          " " +
          Math.ceil(idCounter / extraNames.length);

        let schedule =
          health === "on-track"
            ? "On Track"
            : health === "at-risk"
              ? "At Risk"
              : "Off Track";
        let budget =
          health === "on-track"
            ? "On Plan"
            : health === "at-risk"
              ? "At Risk"
              : "Over Budget";
        let riskLevel =
          health === "on-track"
            ? "Low"
            : health === "at-risk"
              ? "Medium"
              : "High";
        let riskPct =
          health === "on-track"
            ? 10 + Math.random() * 20
            : health === "at-risk"
              ? 40 + Math.random() * 20
              : 75 + Math.random() * 20;
        let budgetUsed =
          health === "on-track"
            ? 30 + Math.random() * 40
            : health === "at-risk"
              ? 60 + Math.random() * 30
              : 90 + Math.random() * 20;

        projects.push({
          id: `proj-${idCounter}`,
          name: name,
          unit: bu,
          owner: `Owner ${idCounter}`,
          sponsor: `Sponsor ${idCounter}`,
          phase: "Build",
          start: "2025-01-01",
          target: "2026-12-31",
          pctComplete: Math.floor(20 + Math.random() * 60),
          budgetM: Math.floor(5 + Math.random() * 20),
          budgetUsedPct: Math.floor(budgetUsed),
          riskRationale: "AI-generated rationale based on project parameters.",
          isPriority: idCounter <= 15, // 15 more priority
          isFeatured: false,
          health: health,
          schedule: schedule,
          budget: budget,
          riskLevel: riskLevel,
          riskPct: Math.floor(riskPct),
        });
        idCounter++;
      }
    }
  }
  return projects;
};
const allProjects = generateProjects();

// Helpers
const bandForScore = (score) => {
  if (score >= 80) return "good";
  if (score >= 60) return "fair";
  return "poor";
};

const getBandColor = (band) => {
  if (band === "good") return "var(--color-status-good)";
  if (band === "fair") return "var(--color-status-fair)";
  if (band === "poor") return "var(--color-status-poor)";
  return "var(--color-status-neutral)";
};

// SVG Draw Helpers for Gauges/Donuts to match spec perfectly
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
  return d;
}

// Rendering Logic
const renderSidebar = () => {
  const nav = document.getElementById("sidebar-nav");
  const items = [
    { id: "executive-summary", label: "1. Executive Summary", icon: "home" },
    { id: "business-trust", label: "2. Business Trust", icon: "handshake" },
    {
      id: "operational-health",
      label: "3. Operational Health",
      icon: "activity",
    },
    {
      id: "strategic-portfolio",
      label: "4. Strategic Portfolio",
      icon: "briefcase",
    },
    { id: "delivery-value", label: "5. Delivery & Value", icon: "bar-chart-3" },
    {
      id: "financial-health",
      label: "6. Financial Health",
      icon: "circle-dollar-sign",
    },
    { id: "people-capability", label: "7. People & Capability", icon: "users" },
    { id: "ai-innovation", label: "8. AI & Innovation", icon: "brain-circuit" },
    {
      id: "cyber-compliance",
      label: "9. Cyber & Compliance",
      icon: "shield-check",
    },
  ];

  nav.innerHTML = items
    .map(
      (item) => `
        <a href="#" class="sidebar-item ${currentState.activeTab === item.id ? "active" : ""}" data-tab="${item.id}">
            <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0"></i>
            <span class="sidebar-label font-medium">${item.label}</span>
        </a>
    `,
    )
    .join("");
  lucide.createIcons();

  nav.querySelectorAll(".sidebar-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      currentState.activeTab = e.currentTarget.dataset.tab;
      renderSidebar();
      renderContent();
      updateUrl();
      if (window.innerWidth < 768) {
        document.getElementById("app-sidebar").classList.add("-translate-x-full");
        document.getElementById("sidebar-overlay").classList.add("hidden"); // close mobile sidebar
      }
    });
  });
};

const renderDelta = (delta, direction = "higher-is-better") => {
  if (!delta) return "";
      direction === "higher-is-better"
        ? "text-[var(--color-status-good)]"
        : "text-[var(--color-status-poor)]";
    icon = "arrow-up";
  } else if (delta.value < 0) {
    colorClass =
      direction === "higher-is-better"
        ? "text-[var(--color-status-poor)]"
        : "text-[var(--color-status-good)]";
    icon = "arrow-down";
  }

  return `
        <div class="flex items-center gap-1 ${colorClass}">
            <i data-lucide="${icon}" class="w-3 h-3"></i>
            <span class="text-sm font-bold">${Math.abs(delta.value)}%</span>
            ${delta.comparedTo ? `<span class="text-[10px] text-[var(--color-ink-subtle)] font-normal ml-1">vs ${delta.comparedTo}</span>` : ""}
        </div>
    `;
};

const drawSVGScoreGauge = (value, label, isLarge = false) => {
  const band = bandForScore(value);
  const color = getBandColor(band);

  // SVG paths
  const r = isLarge ? 55 : 35;
  const cx = isLarge ? 70 : 50;
  const cy = isLarge ? 65 : 45;

  const bgPath = describeArc(cx, cy, r, -90, 90);
  const valAngle = -90 + (value / 100) * 180;
  const valPath = describeArc(cx, cy, r, -90, valAngle);

  return `
        <div class="flex flex-col items-center">
            <div class="text-card-header text-center mb-2" style="color: var(--color-ink-muted)">${label}</div>
            <div class="gauge-container mb-2" style="width: ${isLarge ? 140 : 100}px; height: ${isLarge ? 75 : 55}px;">
                <svg class="gauge-svg absolute inset-0 w-full h-full" viewBox="0 0 ${isLarge ? 140 : 100} ${isLarge ? 75 : 55}">
                    <path d="${bgPath}" fill="none" stroke="var(--color-border)" stroke-width="10" stroke-linecap="round" />
                    <path d="${valPath}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" />
                </svg>
                <div class="absolute bottom-0 flex flex-col items-center" style="margin-bottom: ${isLarge ? "-5px" : "-5px"}">
                    <div class="${isLarge ? "text-hero-score" : "text-card-score"}">${value}<span style="font-size: 60%">%</span></div>
                </div>
            </div>
            <div class="text-band-label mt-1" style="color: ${color}">${band.toUpperCase()}</div>
        </div>
    `;
};

const renderTab1 = () => {
  const kpis = kpisData[currentState.view];
  const domains = domainsData[currentState.view];

  let html = `
        <div class="space-y-4 max-w-[1600px] mx-auto">
            <!-- Band A: Hero KPI Strip -->
            <div class="kpi-card p-4 xl:p-6 overflow-x-auto">
                <div class="flex items-end justify-between min-w-[900px] gap-4">
                    ${kpis
                      .map(
                        (kpi, i) => `
                        <div class="flex flex-col items-center min-w-[120px] ${i === 0 ? "px-4 border-r border-gray-200" : ""}">
                            ${drawSVGScoreGauge(kpi.score, kpi.label, kpi.emphasis)}
                            <div class="mt-2">${renderDelta(kpi.delta)}</div>
                        </div>
                    `,
                      )
                      .join("")}

                    <div class="flex-shrink-0 min-w-[250px] border-l border-gray-200 pl-6 h-full flex flex-col justify-end">
                        <div class="text-[11px] uppercase text-[var(--color-ink-muted)] font-bold mb-4 tracking-widest text-center">NOW → NEXT → FUTURE</div>
                        <div class="flex justify-between w-full">
                            <div class="flex flex-col items-center">
                                <i data-lucide="crosshair" class="w-5 h-5 text-teal-600 mb-1"></i>
                                <span class="text-[10px] text-[var(--color-ink-subtle)]">0-3 Months</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <i data-lucide="arrow-right" class="w-5 h-5 text-blue-600 mb-1"></i>
                                <span class="text-[10px] text-[var(--color-ink-subtle)]">3-12 Months</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <i data-lucide="rocket" class="w-5 h-5 text-purple-600 mb-1"></i>
                                <span class="text-[10px] text-[var(--color-ink-subtle)]">12+ Months</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Band B: Domain Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                ${domains.map((domain) => renderDomainCard(domain)).join("")}
            </div>

            <!-- Band C: Bottom Panels -->
            <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
                <div class="panel-card flex flex-col">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="table-2" class="w-4 h-4"></i>
                        <h3 class="text-section-heading">TOP PRIORITY PROJECTS <span class="font-normal">(Top 10-20)</span></h3>
                    </div>
                    <div class="overflow-x-auto flex-1">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th class="text-table-header">Project</th>
                                    <th class="text-table-header">BU</th>
                                    <th class="text-table-header">Health</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${priorityProjectsPanel
                                  .map(
                                    (p) => `
                                    <tr class="cursor-pointer" onclick="openProjectDrawer('${p.id}')">
                                        <td class="text-table-cell font-medium">${p.name}</td>
                                        <td class="text-table-cell">${p.unit}</td>
                                        <td class="text-table-cell">
                                            <div class="flex items-center gap-1">
                                                <div class="w-2 h-2 rounded-full" style="background-color: ${getBandColor(p.health === "on-track" ? "good" : p.health === "at-risk" ? "fair" : "poor")}"></div>
                                                <span class="sr-only">${p.health}</span>
                                            </div>
                                        </td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="panel-card flex flex-col">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i>
                        <h3 class="text-section-heading">TOP RISKS REQUIRING ATTENTION</h3>
                    </div>
                    <div class="space-y-4">
                        ${risksData
                          .map(
                            (r) => `
                            <div class="flex gap-3">
                                <div class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">${r.rank}</div>
                                <div>
                                    <div class="text-sm font-bold mb-1">${r.title}</div>
                                    <div class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${r.detail}</div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="panel-card flex flex-col">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="gavel" class="w-4 h-4"></i>
                        <h3 class="text-section-heading">KEY DECISIONS REQUIRED</h3>
                    </div>
                    <div class="space-y-4">
                        ${decisionsData
                          .map(
                            (d) => `
                            <div class="flex gap-3 items-center">
                                <div class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">${d.rank}</div>
                                <div class="text-sm">${d.text}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="panel-card flex flex-col">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                        <h3 class="text-section-heading">AI-GENERATED EXECUTIVE SUMMARY</h3>
                    </div>
                    <p class="text-[12px] leading-[1.55] text-[var(--color-ink)] flex-1">${aiSummaryText}</p>
                    <div class="text-[10px] text-[var(--color-ink-subtle)] mt-4">Generated from May 2026 reporting data.</div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("content-area").innerHTML = html;
  lucide.createIcons();

  // Render micro charts
  domains.forEach((domain) => {
    if (domain.trend) {
      renderMicroChart(`chart-${domain.id}`, domain.trend);
    }
  });
};

const renderDomainCard = (d) => {
  let visualHtml = "";

  if (d.visual.kind === "donut" || d.visual.kind === "donut-legend") {
    const band = bandForScore(d.visual.score);
    const color = getBandColor(band);
    let segments = [];
    if (d.visual.segments) {
      let total = d.visual.segments.reduce((acc, s) => acc + s.val, 0);
      let start = -90;
      d.visual.segments.forEach((s) => {
        let deg = (s.val / total) * 360;
        segments.push(describeArc(45, 45, 35, start, start + deg));
        start += deg;
      });
    }

    visualHtml = `
            <div class="flex flex-col items-center justify-center h-full">
                <div class="relative w-[90px] h-[90px]">
                    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 90 90">
                        ${
                          d.visual.segments
                            ? d.visual.segments
                                .map(
                                  (s, i) =>
                                    `<path d="${segments[i]}" fill="none" stroke="${s.col}" stroke-width="10" />`,
                                )
                                .join("")
                            : `<path d="${describeArc(45, 45, 35, -90, 270)}" fill="none" stroke="var(--color-border)" stroke-width="10" />
                               <path d="${describeArc(45, 45, 35, -90, -90 + (d.visual.score / 100) * 360)}" fill="none" stroke="${color}" stroke-width="10" />`
                        }
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <div class="text-[20px] font-bold font-tabular leading-none">${d.visual.score}%</div>
                        <div class="text-[9px] font-bold mt-1 uppercase" style="color: ${color}">${band}</div>
                    </div>
                </div>
            </div>
        `;
  } else if (d.visual.kind === "gauge") {
    visualHtml = `
            <div class="flex flex-col items-center justify-center h-full pt-4">
                ${drawSVGScoreGauge(d.visual.score, "", false)}
                <div class="w-[100px] flex justify-between text-[10px] text-[var(--color-ink-subtle)] mt-1">
                    <span>0</span><span>50</span><span>100</span>
                </div>
            </div>
        `;
  } else if (d.visual.kind === "bars") {
    visualHtml = ""; // Bars span full width
  }

  let rightColHtml = "";
  if (d.metrics) {
    rightColHtml = `
            <div class="space-y-2">
                ${d.metrics
                  .map(
                    (m) => `
                    <div class="flex justify-between items-center">
                        <span class="text-metric-label">${m.label}</span>
                        <span class="text-metric-value" style="color: ${m.valueColor || "var(--color-ink)"}">${m.value}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  } else if (d.legend) {
    rightColHtml = `
            <div class="space-y-1">
                ${d.legend
                  .map(
                    (l) => `
                    <div class="flex justify-between items-center text-[12px] ${l.isTotal ? "font-bold mt-2 pt-2 border-t border-[var(--color-border)]" : ""}">
                        <div class="flex items-center gap-2">
                            ${!l.isTotal ? `<div class="w-3 h-3 rounded-sm" style="background-color: ${l.color}"></div>` : ""}
                            <span>${l.label}</span>
                        </div>
                        <span class="font-tabular">${l.count}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  } else if (d.bars) {
    rightColHtml = `
            <div class="space-y-3 w-full">
                ${d.bars
                  .map(
                    (b) => `
                    <div>
                        <div class="flex justify-between items-center mb-1 text-[12px]">
                            <span>${b.label}</span>
                            <span class="font-tabular font-medium">${b.value}</span>
                        </div>
                        <div class="w-full h-[10px] bg-[var(--color-surface-muted)] rounded-[2px] overflow-hidden flex">
                            ${
                              b.split
                                ? `<div class="h-full" style="width: ${b.percent}%; background-color: ${b.color1}"></div><div class="h-full flex-1" style="background-color: ${b.color2}"></div>`
                                : `<div class="h-full" style="width: ${b.percent}%; background-color: ${b.color}"></div>`
                            }
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  let footerHtml = "";
  if (d.trend) {
    footerHtml = `
            <div class="px-3 pb-3 border-t border-[var(--color-border)] pt-2">
                <div class="text-[11px] text-[var(--color-ink-muted)] mb-1">${d.trend.caption}</div>
                <div class="h-[64px] relative w-full">
                    <canvas id="chart-${d.id}"></canvas>
                </div>
            </div>
        `;
  } else if (d.stackedBar) {
    let total = d.stackedBar.segments.reduce((a, b) => a + b.val, 0);
    footerHtml = `
            <div class="px-3 pb-3 border-t border-[var(--color-border)] pt-2">
                <div class="text-[11px] text-[var(--color-ink-muted)] mb-2">${d.stackedBar.caption}</div>
                <div class="w-full h-4 rounded-sm overflow-hidden flex mb-2">
                    ${d.stackedBar.segments.map((s) => `<div class="h-full flex items-center justify-center text-white text-[10px] font-bold" style="width: ${(s.val / total) * 100}%; background-color: ${s.col}">${s.val}</div>`).join("")}
                </div>
                <a href="#" onclick="switchTab('strategic-portfolio')" class="text-[11px] text-[var(--color-chart-1)] hover:underline">See all in Portfolio tab</a>
            </div>
        `;
  }

  return `
        <div class="domain-card" onclick="${d.id !== "strategic-portfolio" ? `switchTab('${d.id}')` : ""}">
            <div class="domain-header" style="background-color: ${d.accent}">
                <i data-lucide="${d.icon}" class="w-3.5 h-3.5 text-white"></i>
                <span class="text-card-header text-white">${d.title}</span>
            </div>
            <div class="flex-1 p-3 flex items-center gap-4">
                ${visualHtml ? `<div class="w-[40%]">${visualHtml}</div><div class="w-[60%]">${rightColHtml}</div>` : `<div class="w-full">${rightColHtml}</div>`}
            </div>
            ${footerHtml}
        </div>
    `;
};

const renderMicroChart = (canvasId, trend) => {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const config = {
    type: trend.kind === "line" ? "line" : "bar",
    data: {
      labels: trend.points.map((p) => p.l),
      datasets: [
        {
          data: trend.points.map((p) => p.v),
          borderColor: trend.color,
          backgroundColor: trend.color,
          borderWidth: 2,
          pointRadius: trend.kind === "line" ? 3 : 0,
          pointBackgroundColor: trend.color,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "white",
          titleColor: "var(--color-ink)",
          bodyColor: "var(--color-ink)",
          borderColor: "var(--color-border)",
          borderWidth: 1,
          padding: 8,
          displayColors: false,
          callbacks: {
            label: function (c) {
              return c.raw;
            },
          },
        },
      },
      scales: {
        x: { display: false },
        y: {
          display: true,
          border: { display: false },
          grid: { color: "var(--color-border)", drawTicks: false },
          ticks: {
            color: "var(--color-ink-subtle)",
            font: { size: 10 },
            maxTicksLimit: 3,
          },
        },
      },
      animation: false,
    },
  };
  new Chart(ctx, config);
};

const renderTab4 = () => {
  // Filter projects
  let filtered = allProjects.filter((p) => {
    if (currentState.view === "hp" && p.unit !== "HP") return false;
    if (currentState.view === "ah" && p.unit !== "AH") return false;
    if (currentState.filters.bu !== "all" && p.unit !== currentState.filters.bu)
      return false;
    if (
      currentState.filters.health !== "all" &&
      p.health !== currentState.filters.health
    )
      return false;
    if (
      currentState.filters.q &&
      !p.name.toLowerCase().includes(currentState.filters.q.toLowerCase())
    )
      return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let valA, valB;
    if (currentState.filters.sort === "name") {
      valA = a.name;
      valB = b.name;
    } else if (currentState.filters.sort === "unit") {
      valA = a.unit;
      valB = b.unit;
    } else if (currentState.filters.sort === "health") {
      valA = a.health;
      valB = b.health;
    } else if (currentState.filters.sort === "budget") {
      valA = a.budgetUsedPct;
      valB = b.budgetUsedPct;
    } else {
      valA = a.riskPct;
      valB = b.riskPct;
    } // risk

    if (valA < valB) return currentState.filters.dir === "asc" ? -1 : 1;
    if (valA > valB) return currentState.filters.dir === "asc" ? 1 : -1;
    return 0;
  });

  let totals = {
    total: filtered.length,
    onTrack: filtered.filter((p) => p.health === "on-track").length,
    atRisk: filtered.filter((p) => p.health === "at-risk").length,
    offTrack: filtered.filter((p) => p.health === "off-track").length,
  };

  let html = `
        <div class="space-y-4 max-w-[1600px] mx-auto pb-10">
            <!-- Summary Strip -->
            <div class="grid grid-cols-4 gap-4 mb-4">
                ${[
                  {
                    l: "Total Projects",
                    v: totals.total,
                    c: "var(--color-ink)",
                  },
                  {
                    l: "On Track",
                    v: totals.onTrack,
                    c: "var(--color-status-good)",
                  },
                  {
                    l: "At Risk",
                    v: totals.atRisk,
                    c: "var(--color-status-fair)",
                  },
                  {
                    l: "Off Track",
                    v: totals.offTrack,
                    c: "var(--color-status-poor)",
                  },
                ]
                  .map(
                    (s) => `
                    <div class="bg-white p-4 border border-[var(--color-border)] rounded-md shadow-sm border-l-4" style="border-left-color: ${s.c}">
                        <div class="text-[12px] text-[var(--color-ink-muted)] uppercase tracking-wider">${s.l}</div>
                        <div class="text-3xl font-bold font-tabular mt-1">${s.v}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <div class="w-full h-2 rounded-sm overflow-hidden flex mb-6 shadow-sm">
                <div class="h-full" style="width: ${(totals.onTrack / totals.total) * 100}%; background-color: var(--color-status-good)"></div>
                <div class="h-full" style="width: ${(totals.atRisk / totals.total) * 100}%; background-color: var(--color-status-fair)"></div>
                <div class="h-full" style="width: ${(totals.offTrack / totals.total) * 100}%; background-color: var(--color-status-poor)"></div>
            </div>

            <!-- Filters -->
            <div class="bg-white p-3 border border-[var(--color-border)] rounded-md flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 shadow-sm">
                <div class="flex gap-4 items-center">
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                        <input type="text" id="filter-q" placeholder="Search projects..." class="pl-9 pr-3 py-1.5 border border-[var(--color-border)] rounded-md text-sm outline-none w-64" value="${currentState.filters.q}">
                    </div>
                    <select id="filter-bu" class="border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm outline-none bg-white">
                        <option value="all" ${currentState.filters.bu === "all" ? "selected" : ""}>All units</option>
                        <option value="HP" ${currentState.filters.bu === "HP" ? "selected" : ""}>HP</option>
                        <option value="AH" ${currentState.filters.bu === "AH" ? "selected" : ""}>AH</option>
                        <option value="Enterprise" ${currentState.filters.bu === "Enterprise" ? "selected" : ""}>Enterprise</option>
                    </select>
                    <select id="filter-health" class="border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm outline-none bg-white">
                        <option value="all" ${currentState.filters.health === "all" ? "selected" : ""}>All Health</option>
                        <option value="on-track" ${currentState.filters.health === "on-track" ? "selected" : ""}>On Track</option>
                        <option value="at-risk" ${currentState.filters.health === "at-risk" ? "selected" : ""}>At Risk</option>
                        <option value="off-track" ${currentState.filters.health === "off-track" ? "selected" : ""}>Off Track</option>
                    </select>
                    ${currentState.filters.q || currentState.filters.bu !== "all" || currentState.filters.health !== "all" ? `<button id="clear-filters" class="text-sm text-blue-600 hover:underline">Clear filters</button>` : ""}
                </div>
                <div class="text-sm text-[var(--color-ink-muted)]">Showing ${filtered.length} of ${allProjects.filter((p) => currentState.view === "enterprise" || p.unit === currentState.view.toUpperCase()).length} projects</div>
            </div>

            <!-- Table -->
            <div class="bg-white border border-[var(--color-border)] rounded-md overflow-x-auto shadow-sm">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${[
                              "name:Project",
                              "unit:Business Unit",
                              "none:Owner",
                              "health:Health",
                              "none:Schedule",
                              "none:Budget",
                              "budget:Budget Used",
                              "none:% Complete",
                              "none:Target Date",
                              "risk:Overall Risk",
                            ]
                              .map((h) => {
                                let parts = h.split(":");
                                let sortKey = parts[0];
                                let label = parts[1];
                                if (sortKey === "none")
                                  return `<th class="text-table-header">${label}</th>`;

                                let sortIcon = "";
                                if (currentState.filters.sort === sortKey) {
                                  sortIcon =
                                    currentState.filters.dir === "asc"
                                      ? '<i data-lucide="arrow-up" class="w-3 h-3 inline"></i>'
                                      : '<i data-lucide="arrow-down" class="w-3 h-3 inline"></i>';
                                }
                                return `<th class="text-table-header cursor-pointer hover:bg-gray-50 select-none" onclick="toggleSort('${sortKey}')">${label} ${sortIcon}</th>`;
                              })
                              .join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          filtered.length === 0
                            ? `<tr><td colspan="10" class="text-center py-10 text-[var(--color-ink-muted)]">No projects match these filters.</td></tr>`
                            : filtered
                                .map(
                                  (p) => `
                            <tr class="cursor-pointer" onclick="openProjectDrawer('${p.id}')">
                                <td class="text-table-cell font-medium">${p.name}</td>
                                <td class="text-table-cell">${p.unit}</td>
                                <td class="text-table-cell text-[var(--color-ink-muted)]">${p.owner}</td>
                                <td class="text-table-cell">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full" style="background-color: ${getBandColor(p.health === "on-track" ? "good" : p.health === "at-risk" ? "fair" : "poor")}"></div>
                                        <span class="sr-only">${p.health}</span>
                                    </div>
                                </td>
                                <td class="text-table-cell" style="color: ${p.schedule === "On Track" ? "var(--color-status-good)" : p.schedule === "At Risk" ? "var(--color-status-fair-text)" : "var(--color-status-poor)"}">${p.schedule}</td>
                                <td class="text-table-cell" style="color: ${p.budget === "On Plan" ? "var(--color-status-good)" : p.budget === "At Risk" ? "var(--color-status-fair-text)" : "var(--color-status-poor)"}">${p.budget}</td>
                                <td class="text-table-cell">
                                    <div class="flex items-center gap-2 w-32">
                                        <div class="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                                            <div class="h-full rounded" style="width: ${Math.min(100, p.budgetUsedPct)}%; background-color: ${p.budgetUsedPct > 100 ? "var(--color-status-poor)" : p.budgetUsedPct >= 90 ? "var(--color-status-fair)" : "var(--color-chart-1)"}"></div>
                                        </div>
                                        <span class="text-[11px] font-tabular w-8 text-right">${p.budgetUsedPct}%</span>
                                    </div>
                                </td>
                                <td class="text-table-cell">
                                    <div class="flex items-center gap-2 w-24">
                                        <div class="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                                            <div class="h-full bg-green-500 rounded" style="width: ${p.pctComplete}%"></div>
                                        </div>
                                        <span class="text-[11px] font-tabular w-6 text-right">${p.pctComplete}%</span>
                                    </div>
                                </td>
                                <td class="text-table-cell font-tabular text-[var(--color-ink-muted)]">${new Date(p.target).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</td>
                                <td class="text-table-cell">
                                    <span style="color: ${p.riskLevel === "Low" ? "var(--color-status-good)" : p.riskLevel === "Medium" ? "var(--color-status-fair-text)" : "var(--color-status-poor)"}">${p.riskLevel} (${p.riskPct}%)</span>
                                </td>
                            </tr>
                        `,
                                )
                                .join("")
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;

  document.getElementById("content-area").innerHTML = html;
  lucide.createIcons();

  // Attach filter listeners
  document.getElementById("filter-q")?.addEventListener("input", (e) => {
    currentState.filters.q = e.target.value;
    renderTab4();
  });
  document.getElementById("filter-bu")?.addEventListener("change", (e) => {
    currentState.filters.bu = e.target.value;
    renderTab4();
  });
  document.getElementById("filter-health")?.addEventListener("change", (e) => {
    currentState.filters.health = e.target.value;
    renderTab4();
  });
  document.getElementById("clear-filters")?.addEventListener("click", () => {
    currentState.filters = {
      q: "",
      bu: "all",
      health: "all",
      sort: "risk",
      dir: "desc",
    };
    renderTab4();
  });
};

window.toggleSort = (key) => {
  if (currentState.filters.sort === key) {
    currentState.filters.dir =
      currentState.filters.dir === "asc" ? "desc" : "asc";
  } else {
    currentState.filters.sort = key;
    currentState.filters.dir =
      key === "name" || key === "unit" ? "asc" : "desc";
  }
  renderTab4();
};

window.switchTab = (tabId) => {
  currentState.activeTab = tabId;
  renderSidebar();
  renderContent();
  updateUrl();
};

const renderPlaceholder = (title) => {
  const html = `
        <div class="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto pt-20">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <i data-lucide="clock" class="w-8 h-8 text-blue-500"></i>
            </div>
            <h2 class="text-xl font-bold mb-2">${title}</h2>
            <p class="text-[var(--color-ink-muted)] mb-6">This view is planned for a later release. The Executive Summary card for ${title} is live today.</p>
            <button onclick="switchTab('executive-summary')" class="px-4 py-2 bg-white border border-[var(--color-border)] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">View on Executive Summary</button>
        </div>
    `;
  document.getElementById("content-area").innerHTML = html;
  lucide.createIcons();
};

const renderContent = () => {
  // Set Header Title
  const titles = {
    "executive-summary": "Executive Summary",
    "business-trust": "Business Trust",
    "operational-health": "Operational Health",
    "strategic-portfolio": "Strategic Portfolio",
    "delivery-value": "Delivery & Value",
    "financial-health": "Financial Health",
    "people-capability": "People & Capability",
    "ai-innovation": "AI & Innovation",
    "cyber-compliance": "Cyber & Compliance",
  };
  document.getElementById("page-title").innerText =
    titles[currentState.activeTab] || "Dashboard";
  document.getElementById("last-updated").innerText =
    `Last updated May 31, 2026 at 11:00 AM`;

  if (currentState.activeTab === "executive-summary") {
    renderTab1();
  } else if (currentState.activeTab === "strategic-portfolio") {
    renderTab4();
  } else {
    renderPlaceholder(titles[currentState.activeTab]);
  }
};

window.openProjectDrawer = (projectId) => {
  const p = allProjects.find((x) => x.id === projectId);
  if (!p) return;

  document.getElementById("drawer-title").innerText = p.name;
  document.getElementById("drawer-badges").innerHTML = `
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gray-100 border border-gray-200">${p.unit}</span>
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white" style="background-color: ${getBandColor(p.health === "on-track" ? "good" : p.health === "at-risk" ? "fair" : "poor")}">${p.health.replace("-", " ")}</span>
    `;

  document.getElementById("drawer-content").innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Owner</div><div class="font-medium">${p.owner}</div></div>
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Sponsor</div><div class="font-medium">${p.sponsor}</div></div>
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Phase</div><div class="font-medium">${p.phase}</div></div>
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Target Date</div><div class="font-medium font-tabular">${new Date(p.target).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div></div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <div class="flex justify-between text-sm mb-1"><span class="font-medium">% Complete</span><span class="font-tabular">${p.pctComplete}%</span></div>
                <div class="w-full h-2 bg-gray-100 rounded overflow-hidden"><div class="h-full bg-green-500" style="width: ${p.pctComplete}%"></div></div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <div class="flex justify-between text-sm mb-1"><span class="font-medium">Budget Used</span><span class="font-tabular">${p.budgetUsedPct}% of $${p.budgetM}M</span></div>
                <div class="w-full h-2 bg-gray-100 rounded overflow-hidden"><div class="h-full" style="width: ${Math.min(100, p.budgetUsedPct)}%; background-color: ${p.budgetUsedPct > 100 ? "var(--color-status-poor)" : "var(--color-chart-1)"}"></div></div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <h3 class="text-[12px] font-bold uppercase mb-2">Overall Risk (AI Prediction)</h3>
                <div class="flex items-center gap-2 mb-2">
                    <span class="font-bold text-lg" style="color: ${p.riskLevel === "Low" ? "var(--color-status-good)" : p.riskLevel === "Medium" ? "var(--color-status-fair-text)" : "var(--color-status-poor)"}">${p.riskLevel}</span>
                    <span class="bg-gray-100 px-2 py-0.5 rounded text-xs font-tabular">${p.riskPct}%</span>
                </div>
                <p class="text-sm text-[var(--color-ink-muted)] leading-relaxed">${p.riskRationale}</p>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4 pb-10">
                <h3 class="text-[12px] font-bold uppercase mb-3">Milestones</h3>
                <div class="space-y-3">
                    ${[
                      "Requirements Signoff",
                      "Architecture Review",
                      "Initial Release",
                    ]
                      .map(
                        (m, i) => `
                        <div class="flex items-start gap-3">
                            <div class="mt-0.5"><i data-lucide="${i === 0 ? "check-circle" : "circle"}" class="w-4 h-4 ${i === 0 ? "text-green-500" : "text-gray-300"}"></i></div>
                            <div>
                                <div class="text-sm font-medium">${m}</div>
                                <div class="text-xs text-[var(--color-ink-subtle)] font-tabular">${new Date(p.start).toLocaleDateString()}</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;
  lucide.createIcons();
  document
    .getElementById("project-drawer")
    .classList.remove("translate-x-full");
};

const closeDrawer = () =>
  document.getElementById("project-drawer").classList.add("translate-x-full");
document.getElementById("drawer-close").addEventListener("click", closeDrawer);

// URL Sync
const updateUrl = () => {
  const url = new URL(window.location);
  url.searchParams.set("tab", currentState.activeTab);
  url.searchParams.set("view", currentState.view);
  url.searchParams.set("period", currentState.period);
  window.history.replaceState({}, "", url);
};

const loadUrlState = () => {
  const url = new URL(window.location);
  if (url.searchParams.get("tab"))
    currentState.activeTab = url.searchParams.get("tab");
  if (url.searchParams.get("view"))
    currentState.view = url.searchParams.get("view");
  if (url.searchParams.get("period"))
    currentState.period = url.searchParams.get("period");

  // Sync UI controls
  document.querySelector(
    `input[name="dataView"][value="${currentState.view}"]`,
  ).checked = true;
  document.getElementById("period-select").value = currentState.period;
  if (currentState.period !== "2026-05")
    document.getElementById("historical-badge").classList.remove("hidden");
};

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadUrlState();

  // Bind listeners
  document.querySelectorAll('input[name="dataView"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentState.view = e.target.value;
      renderContent();
      updateUrl();
    });
  });

  document.getElementById("period-select").addEventListener("change", (e) => {
    currentState.period = e.target.value;
    if (e.target.value !== "2026-05") {
      document.getElementById("historical-badge").classList.remove("hidden");
    } else {
      document.getElementById("historical-badge").classList.add("hidden");
    }
    updateUrl();
  });

  document.getElementById("refresh-btn").addEventListener("click", () => {
    renderContent();
  });

  // Mobile menu
  document.getElementById("mobile-menu-btn").addEventListener("click", () => {
    document
      .getElementById("app-sidebar")
      .classList.remove("-translate-x-full");
    document.getElementById("sidebar-overlay").classList.remove("hidden");
  });
  document.getElementById("sidebar-overlay").addEventListener("click", () => {
    document.getElementById("app-sidebar").classList.add("-translate-x-full");
    document.getElementById("sidebar-overlay").classList.add("hidden");
  });

  renderSidebar();
  renderContent();
});
