import { state, initData, updateState } from "./state.js";
import { renderSidebar, renderHeader, renderContent, renderRightPanel } from "./ui.js";

// Main UI orchestrator
export function renderApp() {
    renderSidebar();
    renderHeader();
    renderContent();
    renderRightPanel();
    updateUrl();
}

window.renderApp = renderApp;

window.switchTab = (tabId) => {
    updateState({ activeTab: tabId });
};

window.agentNavigate = ({ tab, filterFn, openMetric }) => {
    let updates = { activeTab: tab };
    if (tab === 'strategic-portfolio' && filterFn) {
        // Simple hack to apply filter to UI
        state.filters.q = ''; // reset
        // The real implementation would need a more robust filter system,
        // but for now we just switch tab.
    }
    if (openMetric) {
        updates.panel = { isOpen: true, mode: 'metric', id: openMetric };
    }
    updateState(updates);
};

window.openProjectDrawer = (projectId) => {
    updateState({ panel: { isOpen: true, mode: 'project', id: projectId }});
};

window.openRightPanel = (mode, id) => {
    updateState({ panel: { isOpen: true, mode, id }});
};

window.closeRightPanel = () => {
    updateState({ panel: { isOpen: false }});
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.panel.isOpen) {
        window.closeRightPanel();
    }
    // Command/Ctrl + K for copilot
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.openRightPanel('copilot', null);
    }
});

function updateUrl() {
    const url = new URL(window.location);
    url.searchParams.set("tab", state.activeTab);
    url.searchParams.set("view", state.view);
    url.searchParams.set("period", state.periodIndex);
    if (state.panel.isOpen) {
        url.searchParams.set("panel", state.panel.mode);
        if (state.panel.id) url.searchParams.set("panelId", state.panel.id);
    } else {
        url.searchParams.delete("panel");
        url.searchParams.delete("panelId");
    }
    window.history.replaceState({}, "", url);
}

function loadUrlState() {
    const url = new URL(window.location);
    const updates = {};
    if (url.searchParams.get("tab")) updates.activeTab = url.searchParams.get("tab");
    if (url.searchParams.get("view")) updates.view = url.searchParams.get("view");
    if (url.searchParams.get("period")) updates.periodIndex = parseInt(url.searchParams.get("period"), 10);

    if (url.searchParams.get("panel")) {
        updates.panel = {
            isOpen: true,
            mode: url.searchParams.get("panel"),
            id: url.searchParams.get("panelId")
        };
    }

    // Check initial theme
    const theme = localStorage.getItem('theme') || 'light';
    updates.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    updateState(updates);
}

window.toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    state.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    renderApp();
};

document.addEventListener("DOMContentLoaded", () => {
    initData();
    // initial agent run
    state.view = 'enterprise';
    state.periodIndex = 23;
    loadUrlState();

    // Force first render
    window.renderApp();

    // Bind global listeners
    document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
        document.getElementById("app-sidebar").classList.remove("-translate-x-full");
        document.getElementById("sidebar-overlay").classList.remove("hidden");
    });
    document.getElementById("sidebar-overlay")?.addEventListener("click", () => {
        document.getElementById("app-sidebar").classList.add("-translate-x-full");
        document.getElementById("sidebar-overlay").classList.add("hidden");
    });
});
