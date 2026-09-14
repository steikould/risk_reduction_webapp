import { state } from "./state.js";
import { DOMAINS, ICONS, generateLede, renderDomain, renderDeltaHtml } from "./render.js";
import { decisionQueue, auditLog } from "./agent.js";
import { MET, METRICS } from "./metrics.js";
import { at, PERIODS } from "./series.js";
import { renderDivergingBars, renderForecastHistogram, renderControlChart, renderSparkline } from "./charts.js";
import { score } from "./risk.js";
import { forecast } from "./forecast.js";
import { signal } from "./stats.js";

export function renderSidebar() {
    const nav = document.getElementById("sidebar-nav");
    if (!nav) return;

    const items = [
        { id: "executive-summary", label: "1. Executive Summary", icon: "menu" },
        ...DOMAINS.map((d, i) => ({ id: d.id, label: `${i+2}. ${d.title}`, icon: d.icon }))
    ];

    nav.innerHTML = items
        .map((item) => {
            let domainFindings = 0;
            if (item.id !== 'executive-summary') {
                domainFindings = state.findings.filter(f => f.metrics.some(m => MET[m] && MET[m].domain === item.id)).length;
            } else {
                domainFindings = state.findings.filter(f => f.severity === 'crit').length;
            }

            const badge = domainFindings > 0
                ? `<span class="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">${domainFindings}</span>`
                : '';

            return `
            <a href="#" class="sidebar-item ${state.activeTab === item.id ? "active" : ""} focus-visible-ring" data-tab="${item.id}" onclick="event.preventDefault(); window.switchTab('${item.id}')">
                <div class="w-4 h-4 flex-shrink-0">${ICONS[item.icon] || ICONS['activity']}</div>
                <span class="sidebar-label font-medium">${item.label}</span>
                ${badge}
            </a>
            `;
        })
        .join("");

    document.querySelectorAll('input[name="dataView"]').forEach((radio) => {
        radio.checked = radio.value === state.view;
        radio.onchange = (e) => window.updateState({ view: e.target.value });
    });
}

export function renderHeader() {
    const titles = {
        "executive-summary": "Executive Summary",
        ...Object.fromEntries(DOMAINS.map(d => [d.id, d.title]))
    };

    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.innerText = titles[state.activeTab] || "Dashboard";

    const selectEl = document.getElementById("period-select");
    if (selectEl) {
        if (selectEl.options.length === 0) {
            PERIODS.forEach((p, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.text = p.label;
                selectEl.appendChild(opt);
            });
            selectEl.onchange = (e) => window.updateState({ periodIndex: parseInt(e.target.value, 10) });
        }
        selectEl.value = state.periodIndex;
    }

    const histBadge = document.getElementById("historical-badge");
    if (histBadge) {
        if (state.periodIndex !== 23) histBadge.classList.remove("hidden");
        else histBadge.classList.add("hidden");
    }
}

export function renderContent() {
    const contentArea = document.getElementById("content-area");
    if (!contentArea) return;

    if (state.activeTab === 'executive-summary') {
        renderTab1(contentArea);
    } else if (state.activeTab === 'strategic-portfolio') {
        renderTab4(contentArea);
    } else {
        contentArea.innerHTML = renderDomain(state.activeTab, state.view, state.periodIndex);
    }
}

function renderTab1(container) {
    let html = `<div class="space-y-6 max-w-[1600px] mx-auto pb-10">`;

    html += `<div class="bg-[var(--lead-bg)] text-[var(--lead-ink)] p-5 rounded-md shadow-sm border border-transparent" style="border-color: var(--lead-line)">`;
    html += generateLede(state.view, state.periodIndex, state.findings);
    if (state.findings.length > 0) {
        html += `<div class="flex flex-wrap gap-2 mt-3">`;
        state.findings.slice(0,4).forEach(f => {
            let pillClass = f.severity === 'crit'
                ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                : 'bg-[var(--lead-line)] text-[var(--lead-ink)] hover:bg-[var(--lead-sub)] border border-transparent';
            html += `<button onclick="window.openRightPanel('finding', '${f.id}')" class="px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 focus-visible-ring cursor-pointer ${pillClass}">${f.title}</button>`;
        });
        html += `</div>`;
    }
    html += `</div>`;

    const kpis = [MET['exec.health'], MET['exec.ah_health'], MET['exec.hp_health'], MET['port.health'], MET['ai.readiness']];
    html += `<div class="grid grid-cols-2 md:grid-cols-5 gap-4">`;

    kpis.forEach(m => {
        if (!m) return;
        const sig = signal(m.id, state.view, state.periodIndex);

        let bandColor = "var(--color-status-neutral)";
        if (sig.band === 'good') bandColor = "var(--color-status-good)";
        else if (sig.band === 'poor') bandColor = "var(--color-status-poor)";
        else if (sig.band === 'fair') bandColor = "var(--color-status-fair-text)";

        html += `
            <div class="bg-white border border-[var(--color-border)] rounded-md shadow-sm p-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors" onclick="window.openRightPanel('metric', '${m.id}')">
                <div class="text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)] font-bold mb-2 line-clamp-1">${m.name}</div>
                <div class="flex items-end justify-between">
                    <div class="text-3xl font-bold font-tabular" style="color: ${bandColor}">${sig.value}<span class="text-sm font-normal text-[var(--color-ink-subtle)]">${m.unit}</span></div>
                    ${renderDeltaHtml(sig)}
                </div>
                <div class="mt-4 pt-3 border-t border-[var(--color-border)]">
                    <div class="text-[10px] text-[var(--color-ink-subtle)] mb-1">12 Mo Trend</div>
                    ${renderSparkline(m.id, state.view, state.periodIndex, 100, 24)}
                </div>
            </div>
        `;
    });
    html += `</div>`;

    // Decision Queue & Log
    html += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-[var(--color-border)] rounded-md shadow-sm flex flex-col h-80">
                <div class="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-gray-50">
                    <h3 class="text-sm font-bold uppercase tracking-wider">Decision Queue</h3>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">${decisionQueue.length}</span>
                </div>
                <div class="p-4 flex-1 overflow-y-auto space-y-3">
                    ${decisionQueue.length === 0 ? `<div class="text-[var(--color-ink-muted)] text-sm italic">Queue is empty.</div>` :
                    decisionQueue.map(d => `
                        <div class="flex gap-3 text-sm p-3 border border-[var(--color-border)] rounded bg-white shadow-sm">
                            <div class="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">${ICONS['briefcase']}</div>
                            <div>
                                <div class="font-medium">${d.text}</div>
                                <div class="text-xs text-[var(--color-ink-subtle)] mt-1">Source: ${d.source} · ${new Date(d.timestamp).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="bg-white border border-[var(--color-border)] rounded-md shadow-sm flex flex-col h-80">
                <div class="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-gray-50">
                    <h3 class="text-sm font-bold uppercase tracking-wider">Agent Findings</h3>
                    <button onclick="window.openRightPanel('log')" class="text-xs text-blue-600 hover:underline focus-visible-ring">View Full Log</button>
                </div>
                <div class="p-4 flex-1 overflow-y-auto space-y-3">
                    ${state.findings.length === 0 ? `<div class="text-[var(--color-ink-muted)] text-sm italic">No findings for current context.</div>` :
                    state.findings.slice(0, 5).map(f => `
                        <div class="text-sm pb-3 border-b border-[var(--color-border)] last:border-0">
                            <div class="font-bold flex items-center gap-2 mb-1">
                                <div class="w-2 h-2 rounded-full ${f.severity === 'crit' ? 'bg-red-500' : f.severity === 'high' ? 'bg-orange-500' : f.severity === 'med' ? 'bg-yellow-500' : 'bg-blue-500'}"></div>
                                ${f.title}
                            </div>
                            <div class="text-[var(--color-ink-muted)] text-xs mb-2">${f.evidence}</div>
                            ${f.actions.length > 0 ? `<button onclick="window.agentAction(${state.findings.indexOf(f)}, 0)" class="text-xs font-medium text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 focus-visible-ring">Action: ${f.actions[0].label}</button>` : ''}
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;

    html += `</div>`;
    container.innerHTML = html;
}

window.agentAction = (findingIdx, actionIdx) => {
    const f = state.findings[findingIdx];
    if (f && f.actions[actionIdx]) {
        f.actions[actionIdx].run();
    }
};

function renderTab4(container) {
    let filtered = state.projects.filter(p => {
        if (state.view === 'hp' && p.unit !== 'HP') return false;
        if (state.view === 'ah' && p.unit !== 'AH') return false;
        if (state.filters.bu !== 'all' && p.unit !== state.filters.bu) return false;
        if (state.filters.health !== 'all' && p.health !== state.filters.health) return false;
        if (state.filters.q && !p.name.toLowerCase().includes(state.filters.q.toLowerCase())) return false;
        return true;
    });

    filtered.sort((a,b) => {
        let valA = a.riskPct, valB = b.riskPct;
        if (state.filters.sort === 'name') { valA = a.name; valB = b.name; }
        else if (state.filters.sort === 'health') { valA = a.health; valB = b.health; }
        else if (state.filters.sort === 'budget') { valA = a.budgetUsedPct; valB = b.budgetUsedPct; }
        else if (state.filters.sort === 'p80') { valA = forecast(a).p80; valB = forecast(b).p80; }

        if (valA < valB) return state.filters.dir === 'asc' ? -1 : 1;
        if (valA > valB) return state.filters.dir === 'asc' ? 1 : -1;
        return 0;
    });

    let onTrack = filtered.filter(p => p.health === 'on-track').length;
    let atRisk = filtered.filter(p => p.health === 'at-risk').length;
    let offTrack = filtered.filter(p => p.health === 'off-track').length;

    let html = `<div class="space-y-4 max-w-[1600px] mx-auto pb-10">`;

    // Scenario Simulator
    html += `
        <div class="bg-white border border-[var(--color-border)] rounded-md p-4 mb-4 shadow-sm flex flex-col md:flex-row gap-6">
            <div class="md:w-1/3 border-r border-[var(--color-border)] pr-6">
                <div class="flex items-center gap-2 mb-3 text-[var(--color-ink)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c0-1.1.9-2 2-2"/><path d="M20 2c1.1 0 2 .9 2 2"/><path d="M22 8c0 1.1-.9 2-2 2"/><path d="M16 10c-1.1 0-2-.9-2-2"/><path d="m3 21 9-9"/><path d="m15 6-3 3"/></svg>
                    <h3 class="font-bold text-sm uppercase tracking-wider">Scenario Simulator</h3>
                </div>
                <div class="text-xs text-[var(--color-ink-muted)] mb-4">Adjust inputs to run a live Monte Carlo over all 42 projects and see delivery impacts.</div>

                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-xs mb-1"><label>Extra FTE Capacity</label><span id="scen-fte-val">0</span></div>
                        <input type="range" id="scen-fte" min="0" max="50" value="0" class="w-full accent-blue-600" oninput="window.runScenario()">
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-1"><label>Scope Cut on Red Projects</label><span id="scen-scope-val">0%</span></div>
                        <input type="range" id="scen-scope" min="0" max="30" value="0" step="5" class="w-full accent-blue-600" oninput="window.runScenario()">
                    </div>
                </div>
            </div>

            <div class="md:w-2/3 flex items-center justify-around text-center" id="scen-results">
                <!-- Re-rendered via JS -->
            </div>
        </div>
    `;

    html += `
        <div class="bg-white p-3 border border-[var(--color-border)] rounded-md flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 shadow-sm">
            <div class="flex gap-4 items-center">
                <input type="text" id="filter-q" placeholder="Search..." class="px-3 py-1.5 border border-[var(--color-border)] rounded text-sm w-48 focus-visible-ring bg-[var(--color-canvas)]" value="${state.filters.q}">
                <select id="filter-health" class="border border-[var(--color-border)] rounded px-3 py-1.5 text-sm bg-[var(--color-canvas)]">
                    <option value="all" ${state.filters.health === 'all'?'selected':''}>All Health</option>
                    <option value="on-track" ${state.filters.health === 'on-track'?'selected':''}>On Track</option>
                    <option value="at-risk" ${state.filters.health === 'at-risk'?'selected':''}>At Risk</option>
                    <option value="off-track" ${state.filters.health === 'off-track'?'selected':''}>Off Track</option>
                </select>
                ${(state.filters.q || state.filters.health !== 'all') ? `<button id="clear-filters" class="text-sm text-blue-600 hover:underline">Clear</button>` : ''}
            </div>
            <div class="text-sm text-[var(--color-ink-muted)]">Showing ${filtered.length} projects</div>
        </div>
    `;

    html += `<div class="bg-white border border-[var(--color-border)] rounded-md overflow-x-auto shadow-sm">
        <table class="data-table">
            <thead>
                <tr>
                    <th class="text-table-header cursor-pointer" onclick="window.toggleSort('name')">Project</th>
                    <th class="text-table-header">BU</th>
                    <th class="text-table-header cursor-pointer" onclick="window.toggleSort('health')">Health</th>
                    <th class="text-table-header cursor-pointer" onclick="window.toggleSort('budget')">Budget Used</th>
                    <th class="text-table-header">Progress</th>
                    <th class="text-table-header">Target</th>
                    <th class="text-table-header cursor-pointer" onclick="window.toggleSort('p80')">P80 Finish</th>
                    <th class="text-table-header cursor-pointer" onclick="window.toggleSort('risk')">Risk Score</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(p => {
                    const f = forecast(p);
                    const p80Date = f.d80.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    const targetDate = new Date(p.target).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    const isSlip = f.d80 > new Date(p.target);

                    return `
                    <tr class="cursor-pointer" onclick="window.openProjectDrawer('${p.id}')">
                        <td class="text-table-cell font-medium">${p.name}</td>
                        <td class="text-table-cell">${p.unit}</td>
                        <td class="text-table-cell">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-${p.health === 'on-track' ? 'green' : p.health === 'at-risk' ? 'yellow' : 'red'}-500"></div>
                                <span class="capitalize text-xs">${p.health.replace('-',' ')}</span>
                            </div>
                        </td>
                        <td class="text-table-cell">
                            <div class="flex items-center gap-2 w-24">
                                <div class="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded" style="width: ${Math.min(100, p.budgetUsedPct)}%"></div>
                                </div>
                                <span class="text-[11px] font-tabular w-8 text-right">${p.budgetUsedPct}%</span>
                            </div>
                        </td>
                        <td class="text-table-cell">
                            <div class="flex items-center gap-2 w-24">
                                <div class="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                                    <div class="h-full bg-green-500 rounded" style="width: ${p.pctComplete}%"></div>
                                </div>
                                <span class="text-[11px] font-tabular w-8 text-right">${p.pctComplete}%</span>
                            </div>
                        </td>
                        <td class="text-table-cell text-[11px] font-tabular">${targetDate}</td>
                        <td class="text-table-cell text-[11px] font-tabular ${isSlip ? 'text-[var(--color-status-poor)] font-bold' : ''}">${p80Date}</td>
                        <td class="text-table-cell text-[11px] font-tabular font-bold">${p.riskPct}%</td>
                    </tr>
                `}).join("")}
            </tbody>
        </table>
    </div>`;

    html += `</div>`;
    container.innerHTML = html;

    // Bind filters
    document.getElementById('filter-q')?.addEventListener('input', e => { state.filters.q = e.target.value; window.updateState({}); });
    document.getElementById('filter-health')?.addEventListener('change', e => { state.filters.health = e.target.value; window.updateState({}); });
    document.getElementById('clear-filters')?.addEventListener('click', () => {
        state.filters = { q: "", bu: "all", health: "all", sort: "risk", dir: "desc" };
        window.updateState({});
    });

    // Trigger initial scenario render
    if (document.getElementById('scen-fte')) {
        setTimeout(window.runScenario, 0);
    }
}

window.runScenario = () => {
    const fteEl = document.getElementById('scen-fte');
    const scopeEl = document.getElementById('scen-scope');
    if (!fteEl || !scopeEl) return;

    const extraFte = parseInt(fteEl.value, 10);
    const scopeCut = parseInt(scopeEl.value, 10) / 100;

    document.getElementById('scen-fte-val').innerText = extraFte;
    document.getElementById('scen-scope-val').innerText = `${scopeEl.value}%`;

    // Run base
    let baseMisses = 0;
    let baseMeanP = 0;

    // Run scenario
    let scenMisses = 0;
    let scenMeanP = 0;

    state.projects.forEach(p => {
        const b = forecast(p);
        baseMeanP += b.pMiss;
        if (b.pMiss > 0.5) baseMisses++;

        const sCut = p.health === 'off-track' ? scopeCut : 0; // only apply to red
        // Distribute FTE evenly across all projects for simple demo, or just troubled
        const sFte = (p.health !== 'on-track') ? (extraFte / state.projects.filter(x => x.health !== 'on-track').length) : 0;

        const s = forecast(p, { extraFte: sFte, scopeCut: sCut });
        scenMeanP += s.pMiss;
        if (s.pMiss > 0.5) scenMisses++;
    });

    baseMeanP /= state.projects.length;
    scenMeanP /= state.projects.length;

    // Cost: approx $200k/FTE/yr annualized
    const cost = (extraFte * 0.2).toFixed(1);

    const diff = baseMisses - scenMisses;

    const resEl = document.getElementById('scen-results');
    resEl.innerHTML = `
        <div class="px-4">
            <div class="text-[10px] uppercase text-[var(--color-ink-subtle)] font-bold mb-1">Projects forecast to miss</div>
            <div class="text-2xl font-tabular font-bold text-gray-400 line-through inline-block mr-2">${baseMisses}</div>
            <div class="text-3xl font-tabular font-bold text-[var(--color-ink)] inline-block">→ ${scenMisses}</div>
        </div>
        <div class="px-4 border-l border-[var(--color-border)]">
            <div class="text-[10px] uppercase text-[var(--color-ink-subtle)] font-bold mb-1">Annualized Cost</div>
            <div class="text-3xl font-tabular font-bold text-[var(--color-ink)]">$${cost}M</div>
        </div>
        <div class="px-4 border-l border-[var(--color-border)]">
            <div class="text-[10px] uppercase text-[var(--color-ink-subtle)] font-bold mb-1">Mean overrun prob</div>
            <div class="text-2xl font-tabular font-bold text-[var(--color-ink)]">${(scenMeanP*100).toFixed(0)}%</div>
            <div class="text-[10px] text-green-600 mt-1">-${((baseMeanP - scenMeanP)*100).toFixed(1)}pts</div>
        </div>
        <div class="px-4 border-l border-[var(--color-border)] flex flex-col justify-center">
            ${diff > 0 ? `<button onclick="window.queueDecision('Approve $${cost}M for +${extraFte} FTE and ${scopeEl.value}% scope cuts on red projects', 'scenario')" class="bg-[var(--color-ink)] text-white text-xs px-3 py-1.5 rounded focus-visible-ring hover:opacity-90">Queue Decision</button>` : `<div class="text-xs text-[var(--color-ink-muted)]">No impact</div>`}
        </div>
    `;
};

window.toggleSort = (key) => {
    if (state.filters.sort === key) {
        state.filters.dir = state.filters.dir === 'asc' ? 'desc' : 'asc';
    } else {
        state.filters.sort = key;
        state.filters.dir = key === 'name' ? 'asc' : 'desc';
    }
    window.updateState({});
};

export function renderRightPanel() {
    const drawer = document.getElementById("project-drawer");
    if (!drawer) return;

    if (!state.panel.isOpen) {
        drawer.classList.add("translate-x-full");
        return;
    }
    drawer.classList.remove("translate-x-full");

    const title = document.getElementById("drawer-title");
    const content = document.getElementById("drawer-content");
    const badges = document.getElementById("drawer-badges");

    badges.innerHTML = '';

    if (state.panel.mode === 'project') {
        const p = state.projects.find(x => x.id === state.panel.id);
        if (!p) return;

        title.innerText = p.name;
        badges.innerHTML = `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gray-100 border border-gray-200 text-gray-800">${p.unit}</span>`;

        const f = forecast(p);
        const s = score(p);

        let html = `<div class="space-y-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Owner</div><div class="font-medium">${p.owner}</div></div>
                <div><div class="text-[var(--color-ink-subtle)] text-[11px] uppercase mb-1">Target Date</div><div class="font-medium font-tabular">${new Date(p.target).toLocaleDateString()}</div></div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <h3 class="text-[12px] font-bold uppercase mb-3">Risk Attribution (Score: ${p.riskPct}%)</h3>
                ${renderDivergingBars(s.contributions, -3.25, 380, 200)}
                <div class="mt-2 p-2 bg-gray-50 rounded text-[10px] text-[var(--color-ink-muted)]">Model: Logistic Regression | Features: 7 | Calibrated: 2026-01</div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4 pb-10">
                <h3 class="text-[12px] font-bold uppercase mb-3">Monte Carlo Forecast (4,000 runs)</h3>
                <div class="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div class="bg-gray-50 p-2 rounded border border-gray-100">
                        <div class="text-[10px] uppercase text-gray-500">P(Miss)</div>
                        <div class="font-bold font-tabular ${(f.pMiss > 0.5) ? 'text-red-600' : 'text-gray-800'}">${(f.pMiss * 100).toFixed(0)}%</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded border border-gray-100">
                        <div class="text-[10px] uppercase text-gray-500">P50 Finish</div>
                        <div class="font-bold font-tabular text-gray-800 text-xs mt-1">${f.d50.toLocaleDateString(undefined, {month:'short', year:'2-digit'})}</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded border border-gray-100">
                        <div class="text-[10px] uppercase text-gray-500">P80 Finish</div>
                        <div class="font-bold font-tabular text-gray-800 text-xs mt-1">${f.d80.toLocaleDateString(undefined, {month:'short', year:'2-digit'})}</div>
                    </div>
                </div>
                ${renderForecastHistogram(f.histogram, f.p50, f.p80, Math.max(0.5, (new Date(p.target) - new Date('2026-05-31')) / (1000 * 60 * 60 * 24 * 30.44)), 380, 100)}
            </div>
        </div>`;
        content.innerHTML = html;

    } else if (state.panel.mode === 'metric') {
        const m = MET[state.panel.id];
        if (!m) return;

        title.innerText = m.name;
        badges.innerHTML = `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800">${m.domain}</span>`;

        let lineageHtml = `<ul class="list-disc pl-4 text-xs space-y-1 text-[var(--color-ink-muted)]">`;
        m.lineage.forEach(l => {
            lineageHtml += `<li><strong>${l[0]}</strong>: ${l[1]}</li>`;
        });
        lineageHtml += `</ul>`;

        let html = `<div class="space-y-6">
            <div class="bg-gray-50 p-3 rounded text-sm border border-gray-100 italic text-[var(--color-ink-muted)]">
                "${m.definition}"
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <h3 class="text-[12px] font-bold uppercase mb-3">Control Chart (18 Months)</h3>
                ${renderControlChart(m.id, state.view, state.periodIndex, 380, 140)}
            </div>

            <div class="border-t border-[var(--color-border)] pt-4">
                <h3 class="text-[12px] font-bold uppercase mb-3">Metadata</h3>
                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div><span class="text-[var(--color-ink-subtle)] block mb-1">Formula</span><code class="bg-gray-100 px-1 py-0.5 rounded text-[10px]">${m.formula}</code></div>
                    <div><span class="text-[var(--color-ink-subtle)] block mb-1">Grain</span>${m.grain}</div>
                    <div><span class="text-[var(--color-ink-subtle)] block mb-1">Owner</span>${m.owner}</div>
                    <div><span class="text-[var(--color-ink-subtle)] block mb-1">Refresh</span>${m.refresh}</div>
                    <div class="col-span-2">
                        <span class="text-[var(--color-ink-subtle)] block mb-1">Data Quality</span>
                        <div class="flex items-center gap-2">
                            <div class="w-full h-1.5 bg-gray-200 rounded overflow-hidden flex-1"><div class="h-full ${m.quality >= 0.9 ? 'bg-green-500' : 'bg-yellow-500'}" style="width: ${m.quality*100}%"></div></div>
                            <span class="font-tabular font-bold w-8 text-right">${(m.quality*100).toFixed(0)}%</span>
                        </div>
                        ${!m.certified ? `<div class="text-red-600 font-bold mt-1">⚠ Metric is uncertified</div>` : ''}
                    </div>
                </div>
            </div>

            <div class="border-t border-[var(--color-border)] pt-4 pb-10">
                <h3 class="text-[12px] font-bold uppercase mb-2">Lineage</h3>
                ${lineageHtml}
            </div>
        </div>`;
        content.innerHTML = html;

    } else if (state.panel.mode === 'finding') {
        const finding = state.findings.find(f => f.id === state.panel.id);
        if (!finding) return;

        title.innerText = "Insight Detail";
        badges.innerHTML = `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gray-100 border border-gray-200">${finding.severity}</span>`;

        let html = `<div class="space-y-6 pb-10">
            <div class="bg-gray-50 p-4 rounded-md border border-gray-100 text-sm">
                <h3 class="font-bold mb-2">${finding.title}</h3>
                <p class="text-[var(--color-ink-muted)] leading-relaxed">${finding.evidence}</p>
            </div>`;

        if (finding.actions && finding.actions.length > 0) {
            html += `<div class="flex gap-2">`;
            finding.actions.forEach((a, i) => {
                html += `<button onclick="window.agentAction(${state.findings.indexOf(finding)}, ${i})" class="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 focus-visible-ring">${a.label}</button>`;
            });
            html += `</div>`;
        }

        if (finding.projects && finding.projects.length > 0) {
            html += `
            <div class="border-t border-[var(--color-border)] pt-4">
                <h3 class="text-[12px] font-bold uppercase mb-3">Associated Projects</h3>
                <div class="space-y-2">
            `;
            finding.projects.forEach(projectId => {
                const p = state.projects.find(proj => proj.id === projectId);
                if (p) {
                    html += `
                        <div class="p-3 border border-[var(--color-border)] rounded-md hover:bg-gray-50 cursor-pointer transition-colors" onclick="window.openRightPanel('project', '${p.id}')">
                            <div class="flex justify-between items-center mb-1">
                                <div class="font-bold text-sm">${p.name}</div>
                                <div class="w-2 h-2 rounded-full ${p.health === 'on-track' ? 'bg-green-500' : p.health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}"></div>
                            </div>
                            <div class="flex gap-4 text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wide">
                                <span>Unit: ${p.unit}</span>
                                <span>Risk: ${p.riskPct}%</span>
                            </div>
                        </div>
                    `;
                }
            });
            html += `</div></div>`;
        }

        html += `</div>`;
        content.innerHTML = html;

    } else if (state.panel.mode === 'log') {
        title.innerText = "Agent Activity Log";
        let html = `<div class="space-y-4 pb-10">`;
        auditLog.forEach(l => {
            html += `
                <div class="p-3 border border-[var(--color-border)] rounded shadow-sm text-sm">
                    <div class="flex justify-between text-[10px] uppercase text-[var(--color-ink-subtle)] mb-2 border-b border-[var(--color-border)] pb-1">
                        <span>${new Date(l.timestamp).toLocaleString()}</span>
                        <span>${l.elapsed ? `${l.elapsed}ms` : ''}</span>
                    </div>
                    <div class="font-bold mb-1">${l.reason}</div>
                    ${l.action ? `<div class="text-blue-600 mb-2">User Action: ${l.action}</div>` : ''}
                    ${l.watchersEvaluated ? `
                        <div class="text-xs text-[var(--color-ink-muted)] mb-2">Evaluated ${l.watchersEvaluated} watchers over ${l.recordsScanned} records. Found ${l.findingsRaised} critical/high issues.</div>
                    ` : ''}
                </div>
            `;
        });
        html += `</div>`;
        content.innerHTML = html;
    } else if (state.panel.mode === 'copilot') {
        import('./copilot.js'); // Ensure it's loaded to bind submit
        title.innerText = "LLM Copilot";
        badges.innerHTML = `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gray-100 border border-gray-200">Local Rule Engine</span>`;
        let html = `
            <div class="flex flex-col h-[calc(100vh-140px)]">
                <div id="copilot-chat" class="flex-1 overflow-y-auto space-y-4 mb-4">
                    <div class="text-center text-[var(--color-ink-muted)] text-sm my-4">No model endpoint connected. Running local intent parser.</div>
                </div>
                <form class="flex gap-2" onsubmit="window.submitCopilot(event)">
                    <input type="text" id="copilot-input" class="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none focus-visible-ring" placeholder="Ask about risks, forecasts, or metrics...">
                    <button type="submit" class="bg-[var(--color-ink)] text-white px-3 py-2 rounded-md hover:opacity-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </form>
            </div>
        `;
        content.innerHTML = html;
    }
}
