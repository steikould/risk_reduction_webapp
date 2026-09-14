import { METRICS, MET } from "./metrics.js";
import { PERIODS } from "./series.js";
import { updateProjectHealth } from "./risk.js";
import { generateProjects } from "./projects.js"; // We need to extract project generation
import { runAgent, auditLog, decisionQueue } from "./agent.js";

export const state = {
  view: "enterprise",
  periodIndex: 23, // May 2026
  activeTab: "executive-summary",
  filters: {
    q: "",
    bu: "all",
    health: "all",
    sort: "risk",
    dir: "desc",
  },
  projects: [],
  findings: [],
  theme: "light",
  panel: {
      isOpen: false,
      mode: null, // 'project', 'metric', 'log', 'copilot'
      id: null
  }
};

export function initData() {
    state.projects = generateProjects();
    state.projects.forEach(p => updateProjectHealth(p));
}

export function updateState(updates) {
    let needsScan = false;
    let needsRender = false;

    if (updates.view !== undefined && updates.view !== state.view) {
        state.view = updates.view;
        needsScan = true;
        needsRender = true;
    }
    if (updates.periodIndex !== undefined && updates.periodIndex !== state.periodIndex) {
        state.periodIndex = updates.periodIndex;
        needsScan = true;
        needsRender = true;
    }
    if (updates.activeTab !== undefined && updates.activeTab !== state.activeTab) {
        state.activeTab = updates.activeTab;
        needsRender = true;
    }

    // Panel updates
    if (updates.panel) {
        state.panel = { ...state.panel, ...updates.panel };
        needsRender = true;
    }

    if (needsScan) {
        state.findings = runAgent({
            view: state.view,
            periodIndex: state.periodIndex,
            projects: state.projects
        }, "State transition");
    }

    // Also run initial scan if findings are empty but we have projects
    if (state.findings.length === 0 && state.projects.length > 0 && !needsScan) {
        state.findings = runAgent({
            view: state.view,
            periodIndex: state.periodIndex,
            projects: state.projects
        }, "Initial scan");
    }

    if (needsRender && typeof window !== 'undefined' && window.renderApp) {
        window.renderApp();
    }
}
