import { state, updateState } from "./state.js";
import { MET } from "./metrics.js";
import { at, PERIODS } from "./series.js";
import { forecast } from "./forecast.js";

export const tools = [
  { name: 'query_portfolio', description: 'filter/sort the ledger → ≤12 rows with risk + pMiss' },
  { name: 'get_metric', description: 'definition, lineage, quality, last 12 points, control limits, this month\'s tested move' },
  { name: 'list_metrics', description: 'cheap orientation call' },
  { name: 'list_signals', description: 'current watcher findings with evidence' },
  { name: 'navigate_dashboard', description: 'set tab / view / project filter — then re-render' },
  { name: 'run_scenario', description: 're-run the Monte Carlo under an intervention' }
];

// deterministic intent parser
export function handleCopilotQuery(query) {
    const q = query.toLowerCase();
    let trace = [];
    let response = "";

    // Tools logic
    function list_signals() {
        trace.push(`call: list_signals()`);
        return state.findings;
    }

    function navigate_dashboard(args) {
        trace.push(`call: navigate_dashboard(${JSON.stringify(args)})`);
        updateState(args);
    }

    function query_portfolio(filterFn) {
        trace.push(`call: query_portfolio(...)`);
        return state.projects.filter(filterFn);
    }

    if (q.includes('decision') || q.includes('queue') || q.includes('finding')) {
        const sigs = list_signals();
        if (sigs.length > 0) {
            response = `There are ${sigs.length} agent findings currently raised. The highest priority is: <strong>${sigs[0].title}</strong>.`;
            response += `<ul class="list-disc pl-4 mt-2 mb-2 text-sm">`;
            sigs.slice(0,3).forEach(s => {
                response += `<li>${s.evidence}</li>`;
            });
            response += `</ul>`;
        } else {
            response = "There are currently no agent findings requiring decisions.";
        }
    }
    else if (q.includes('trust') && (q.includes('not') || q.includes('un'))) {
        trace.push(`call: list_metrics()`);
        const uncert = Object.values(MET).filter(m => !m.certified || m.quality < 0.86);
        response = `You should be cautious with ${uncert.length} metrics that are uncertified or have low data quality.`;
        if (uncert.length > 0) {
            response += `<ul class="list-disc pl-4 mt-2 mb-2 text-sm">`;
            uncert.slice(0,4).forEach(m => {
                response += `<li><strong>${m.name}</strong> (${m.quality*100}% quality, ${m.certified ? 'certified' : 'uncertified'})</li>`;
            });
            response += `</ul>`;
        }
    }
    else if (q.includes('likely to miss') || q.includes('slipping') || q.includes('miss its date')) {
        const slipping = query_portfolio(p => p.pctComplete < 100 && forecast(p).pMiss > 0.50);
        response = `There are ${slipping.length} projects likely to miss their committed delivery dates.`;
        if (slipping.length > 0) {
            response += `<ul class="list-disc pl-4 mt-2 mb-2 text-sm">`;
            slipping.slice(0,3).forEach(p => {
                const f = forecast(p);
                response += `<li><strong>${p.name}</strong> (${(f.pMiss*100).toFixed(0)}% chance of miss, P80 finish ${f.d80.toLocaleDateString()})</li>`;
            });
            response += `</ul>`;
            response += `<button class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2" onclick="window.agentNavigate({tab: 'strategic-portfolio'})">View Portfolio</button>`;
        }
    }
    else if (q.includes('ah') && q.includes('risk')) {
        const atRiskAH = query_portfolio(p => p.unit === 'AH' && p.health !== 'on-track');
        navigate_dashboard({ view: 'ah', activeTab: 'strategic-portfolio', filters: { ...state.filters, health: 'all' } }); // Ideally filter to at-risk
        response = `I have navigated the dashboard to the AH portfolio. There are ${atRiskAH.length} projects currently at-risk or off-track in Animal Health.`;
    }
    else {
        response = `I am currently running in <strong>local deterministic mode</strong> without model access. Try asking: <br>
        • "what needs a decision"<br>
        • "show me every project likely to miss its date"<br>
        • "which numbers should I not trust"<br>
        • "show me AH work at risk"`;
    }

    return { response, trace };
}

// Global UI handler for Copilot
if (typeof window !== 'undefined') {
    window.submitCopilot = (e) => {
        e.preventDefault();
        const input = document.getElementById('copilot-input');
        const q = input.value.trim();
        if (!q) return;

        input.value = '';

        const chat = document.getElementById('copilot-chat');
        chat.innerHTML += `
            <div class="mb-4 text-right">
                <div class="inline-block bg-[var(--color-chart-1)] text-white px-3 py-2 rounded-lg text-sm max-w-[80%]">${q}</div>
            </div>
        `;

        setTimeout(() => {
            const res = handleCopilotQuery(q);
            let traceHtml = res.trace.length > 0 ?
                `<div class="text-[10px] font-mono text-[var(--color-ink-subtle)] mt-2 bg-gray-100 p-2 rounded">${res.trace.join('<br>')}</div>`
                : '';

            chat.innerHTML += `
                <div class="mb-4 text-left">
                    <div class="inline-block bg-[var(--color-surface-muted)] text-[var(--color-ink)] px-3 py-2 rounded-lg text-sm max-w-[90%] border border-[var(--color-border)] shadow-sm">
                        ${res.response}
                        ${traceHtml}
                    </div>
                </div>
            `;
            chat.scrollTop = chat.scrollHeight;
        }, 300);
    };
}
