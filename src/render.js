import { MET, METRICS } from "./metrics.js";
import { at, PERIODS } from "./series.js";
import { signal } from "./stats.js";
import { renderSparkline, renderControlChart } from "./charts.js";

// Simplified icons since we drop Lucide CDN
export const ICONS = {
    'handshake': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3-6 6"/><path d="m21 14-6-6"/><path d="M3 21 9 15"/><path d="M7 13 3 17"/></svg>`,
    'activity': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    'briefcase': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    'bar-chart-3': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
    'circle-dollar-sign': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`,
    'users': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    'brain-circuit': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.968-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/></svg>`,
    'shield-check': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.82 0 5 1 7 2a1 1 0 0 1 1 1v7z"/><path d="m9 12 2 2 4-4"/></svg>`,
    'arrow-up': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
    'arrow-down': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>`,
    'minus': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`,
    'menu': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
    'x': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    'sun': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    'moon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    'cpu': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
};

export const DOMAINS = [
  { id: "business-trust", title: "BUSINESS TRUST", icon: "handshake" },
  { id: "operational-health", title: "OPERATIONAL HEALTH", icon: "activity" },
  { id: "delivery-value", title: "DELIVERY & VALUE", icon: "bar-chart-3" },
  { id: "financial-health", title: "FINANCIAL HEALTH", icon: "circle-dollar-sign" },
  { id: "people-capability", title: "PEOPLE & CAPABILITY", icon: "users" },
  { id: "ai-innovation", title: "AI & INNOVATION", icon: "brain-circuit" },
  { id: "cyber-compliance", title: "CYBER & COMPLIANCE", icon: "shield-check" }
];

export function renderDeltaHtml(sig) {
    if (sig.kind === 'noise') {
        return `<div class="flex items-center gap-1 text-[var(--color-ink-muted)]"><div class="w-3 h-3">${ICONS['minus']}</div><span class="text-sm font-bold text-[var(--color-ink-subtle)]">${Math.abs(sig.delta).toFixed(1)}</span></div>`;
    }
    const isGood = (sig.delta > 0 && sig.trendDirection === 'improving') || (sig.delta < 0 && sig.trendDirection === 'improving'); // Simplify: just check band or delta vs direction
    // Actually sig.band determines the absolute goodness, but for delta color, it's about direction
    let colorClass = "text-[var(--color-status-neutral)]";
    let icon = "minus";

    // Determine if move is good based on metric direction (which isn't directly in sig, let's infer from delta and if we know metric)
    // Actually we don't have metric direction in `sig`. Let's assume improving = good.
    if (sig.trendDirection === 'improving') colorClass = "text-[var(--color-status-good)]";
    else if (sig.trendDirection === 'deteriorating') colorClass = "text-[var(--color-status-poor)]";
    else colorClass = "text-[var(--color-status-fair-text)]";

    if (sig.delta > 0) icon = "arrow-up";
    else if (sig.delta < 0) icon = "arrow-down";

    // Breach or signal tags
    let tag = "";
    if (sig.kind === 'breach') tag = `<span class="ml-1 px-1 py-0 rounded text-[9px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">Breach</span>`;
    else if (sig.kind === 'signal') tag = `<span class="ml-1 px-1 py-0 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">Signal</span>`;
    else if (sig.kind === 'watch') tag = `<span class="ml-1 px-1 py-0 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">Watch</span>`;

    return `
        <div class="flex items-center gap-1 ${colorClass}">
            <div class="w-3 h-3">${ICONS[icon]}</div>
            <span class="text-sm font-bold">${Math.abs(sig.delta).toFixed(1)}</span>
            ${tag}
        </div>
    `;
}

export function generateLede(view, periodIndex, findings) {
    // Basic dynamic summary based on semantic layer
    const execScore = at('exec.health', view, periodIndex);
    const critCount = findings.filter(f => f.severity === 'crit').length;

    let moveText = "";
    // find largest move
    let maxSigma = 0;
    let maxMetric = null;
    METRICS.forEach(m => {
        const sig = signal(m.id, view, periodIndex);
        if (Math.abs(sig.sigma) > Math.abs(maxSigma)) {
            maxSigma = sig.sigma;
            maxMetric = m;
        }
    });

    if (maxMetric) {
        const dir = maxSigma > 0 ? 'increased' : 'decreased';
        moveText = ` The most significant move was ${maxMetric.name} which ${dir} beyond normal bounds.`;
    }

    let pOff = 0;
    // We don't have projects array here easily, but we can fake it or read from port.off_track metric if it existed.
    // Instead just use a generic stat
    const ptAtRisk = at('port.at_risk', view, periodIndex);

    let html = `<p class="text-[14px] leading-relaxed text-[var(--lead-ink)] mb-4">`;
    html += `IT composite health is currently <strong>${execScore}%</strong>.`;
    html += moveText;
    html += ` The portfolio shows <strong>${ptAtRisk}</strong> projects at risk.`;
    if (critCount > 0) {
        html += ` The agent has flagged <strong class="text-[var(--color-status-poor)]">${critCount} critical findings</strong> requiring attention.`;
    } else {
        html += ` No critical operational findings were detected this period.`;
    }
    html += `</p>`;

    return html;
}

export function renderDomain(domainId, view, periodIndex) {
    const domainMetrics = METRICS.filter(m => m.domain === domainId);
    if (domainMetrics.length === 0) return `<div class="p-8 text-center text-[var(--color-ink-muted)]">No metrics defined for this domain.</div>`;

    let html = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] mx-auto">`;

    domainMetrics.forEach(m => {
        const sig = signal(m.id, view, periodIndex);

        html += `
            <div class="bg-white border border-[var(--color-border)] rounded-md shadow-sm p-4 flex flex-col cursor-pointer hover:shadow-md transition-shadow" onclick="window.openRightPanel('metric', '${m.id}')">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)] font-bold">${m.name}</div>
                        <div class="text-3xl font-bold font-tabular mt-1 text-[var(--color-ink)]">${sig.value}<span class="text-sm font-normal text-[var(--color-ink-subtle)]">${m.unit}</span></div>
                    </div>
                    ${renderDeltaHtml(sig)}
                </div>

                <div class="mt-4 mb-2">
                    ${renderControlChart(m.id, view, periodIndex, 400, 100)}
                </div>

                <div class="text-xs text-[var(--color-ink-subtle)] line-clamp-2 mt-auto pt-2 border-t border-[var(--color-border)]">
                    ${m.definition}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}
