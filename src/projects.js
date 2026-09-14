// Extracted from original it_executive_dashboard.js
export const generateProjects = () => {
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
        health: "on-track",
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
        riskRationale: "Contended data engineering capacity and an unresolved upstream dependency on the ERP cutover.",
        isPriority: true,
        health: "at-risk",
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
        riskRationale: "Scope growth in the field-force journey is compressing the pilot window.",
        isPriority: true,
        health: "at-risk",
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
        riskRationale: "Validated release path is proven and change volume is low.",
        isPriority: true,
        health: "on-track",
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
        riskRationale: "Decommissioning is blocked behind two migrations with no agreed cutover date.",
        isPriority: true,
        health: "off-track",
      },
    ];
    projects.push(...featured);

    const extraNames = [
      "Clinical Data Lake", "Veterinary Field Force Mobility", "GxP Cloud Landing Zone",
      "Commercial Analytics Modernization", "Identity & Access Modernization",
      "Serialization Track & Trace", "Manufacturing Execution Upgrade",
      "HR Core Consolidation", "Network Edge Refresh", "Endpoint Zero Trust Rollout",
      "LIMS Upgrade", "Supply Chain Visibility", "R&D Workflow Automation",
      "Customer Portal Revamp", "Data Privacy Shield", "Cloud Cost Optimization",
      "AI Chatbot for IT Support", "Mobile Device Management",
      "Warehouse Automation API", "Salesforce Consolidation",
    ];

    // We calibrate to hit ~16 on track, 17 at risk, 9 off track
    let counts = {
      HP: { "on-track": 5, "at-risk": 8, "off-track": 3 },
      AH: { "on-track": 5, "at-risk": 5, "off-track": 4 },
      Enterprise: { "on-track": 4, "at-risk": 2, "off-track": 1 },
    };

    let idCounter = 1;
    for (const bu of ["HP", "AH", "Enterprise"]) {
      for (const health of ["on-track", "at-risk", "off-track"]) {
        for (let i = 0; i < counts[bu][health]; i++) {
          let name = extraNames[idCounter % extraNames.length] + " " + Math.ceil(idCounter / extraNames.length);
          let budgetUsed = health === "on-track" ? 30 + Math.random() * 40 : health === "at-risk" ? 60 + Math.random() * 30 : 90 + Math.random() * 20;
          let planPctComplete = health === "on-track" ? 40 + Math.random() * 50 : health === "at-risk" ? 60 + Math.random() * 30 : 80 + Math.random() * 20;
          let actPctComplete = health === "on-track" ? planPctComplete - (Math.random() * 5) : health === "at-risk" ? planPctComplete - (10 + Math.random() * 15) : planPctComplete - (20 + Math.random() * 30);
          actPctComplete = Math.max(5, actPctComplete);

          projects.push({
            id: `proj-${idCounter}`,
            name: name,
            unit: bu,
            owner: `Owner ${idCounter % 5}`, // force some concentration
            sponsor: `Sponsor ${idCounter}`,
            phase: "Build",
            start: "2025-01-01",
            target: "2026-12-31",
            pctComplete: Math.floor(actPctComplete),
            planPctComplete: Math.floor(planPctComplete),
            budgetM: Math.floor(5 + Math.random() * 20),
            budgetUsedPct: Math.floor(budgetUsed),
            isPriority: idCounter <= 15,
            health: health,
          });
          idCounter++;
        }
      }
    }
    return projects;
  };
