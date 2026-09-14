import { METRICS, MET } from "./metrics.js";
import { at, PERIODS } from "./series.js";
import { S, signal } from "./stats.js";

// Basic charting without Chart.js
// 12-month sparkline
export function renderSparkline(metricId, view, periodIndex, width=60, height=20) {
    const startIdx = Math.max(0, periodIndex - 11);
    const pts = [];
    let min = Infinity, max = -Infinity;

    for (let i = startIdx; i <= periodIndex; i++) {
        const v = at(metricId, view, i);
        if (v < min) min = v;
        if (v > max) max = v;
        pts.push(v);
    }

    if (min === max) { min -= 1; max += 1; }

    const dx = width / Math.max(1, pts.length - 1);
    const dy = height / (max - min);

    let path = "";
    pts.forEach((p, i) => {
        const x = i * dx;
        const y = height - (p - min) * dy;
        path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="overflow-visible stroke-[var(--color-ink-muted)] fill-none"><path d="${path}" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// Control Chart (Shewhart)
export function renderControlChart(metricId, view, periodIndex, width=300, height=120) {
    const metric = MET[metricId];
    // We render 18 months, or whatever history is available
    const startIdx = Math.max(0, periodIndex - 17);
    const pts = [];

    for(let i = startIdx; i <= periodIndex; i++) {
        pts.push({ i, val: at(metricId, view, i) });
    }

    // We base limits on the trailing 12 before the current point, or full series if we want to be exact,
    // but a common simple XmR uses the whole visible series or a fixed baseline.
    // Spec says "an 18-month Shewhart control chart with the centre line, control limits...".
    // We calculate limits over the points shown.
    const rawVals = pts.map(p => p.val);
    const limits = S.xmr(rawVals);

    let min = Math.min(limits.lcl, ...rawVals, metric.target || Infinity);
    let max = Math.max(limits.ucl, ...rawVals, metric.target || -Infinity);
    const range = max - min;
    const padding = range * 0.1 || 1;
    min -= padding;
    max += padding;

    const dy = height / (max - min);
    const dx = width / Math.max(1, pts.length - 1);

    const getY = (v) => height - (v - min) * dy;

    // Limits lines
    const cY = getY(limits.centre);
    const uY = getY(limits.ucl);
    const lY = getY(limits.lcl);
    let targetLine = "";
    if (metric.target !== undefined) {
        const tY = getY(metric.target);
        targetLine = `<line x1="0" y1="${tY}" x2="${width}" y2="${tY}" stroke="var(--color-status-good)" stroke-width="1" stroke-dasharray="2 2" opacity="0.6"/>`;
    }

    // Data path
    let path = "";
    let pointsHtml = "";

    pts.forEach((p, idx) => {
        const x = idx * dx;
        const y = getY(p.val);
        path += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);

        let color = "var(--color-ink)";
        let isAnomaly = (p.val > limits.ucl || p.val < limits.lcl);
        if (isAnomaly) color = "var(--color-status-poor)";

        const periodStr = PERIODS[p.i] ? PERIODS[p.i].short : "";
        const dev = limits.mrBar > 0 ? ((p.val - limits.centre) / (limits.mrBar/1.128)).toFixed(1) : 0;
        const title = `${periodStr}: ${p.val}${metric.unit} (${dev}σ)${isAnomaly ? ' - Anomaly' : ' - Normal variation'}`;

        pointsHtml += `<circle cx="${x}" cy="${y}" r="${isAnomaly ? 4 : 2}" fill="${color}" stroke="white" stroke-width="1"><title>${title}</title></circle>`;
    });

    return `
        <svg width="100%" height="${height}" viewBox="0 -5 ${width} ${height+10}" class="overflow-visible">
            <!-- Limits -->
            <rect x="0" y="${uY}" width="${width}" height="${lY - uY}" fill="var(--color-surface-muted)" opacity="0.3" />
            <line x1="0" y1="${cY}" x2="${width}" y2="${cY}" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="4 4" />
            <line x1="0" y1="${uY}" x2="${width}" y2="${uY}" stroke="var(--color-border)" stroke-width="1" />
            <line x1="0" y1="${lY}" x2="${width}" y2="${lY}" stroke="var(--color-border)" stroke-width="1" />
            ${targetLine}
            <!-- Data -->
            <path d="${path}" stroke="var(--color-ink)" stroke-width="2" fill="none" />
            ${pointsHtml}
        </svg>
    `;
}

// Diverging Bar Chart for Attribution
export function renderDivergingBars(contributions, bias, width=300, height=200) {
    const keys = Object.keys(contributions);
    const rowH = height / (keys.length + 1); // +1 for bias
    let maxAbs = Math.abs(bias);
    keys.forEach(k => maxAbs = Math.max(maxAbs, Math.abs(contributions[k])));

    const cx = width / 2;
    const scale = (width * 0.4) / maxAbs; // 40% of width is max bar length

    let html = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">`;
    html += `<line x1="${cx}" y1="0" x2="${cx}" y2="${height}" stroke="var(--color-border)" stroke-width="1" />`;

    // Bias
    let bw = Math.abs(bias) * scale;
    let bx = bias < 0 ? cx - bw : cx;
    let fill = bias < 0 ? "var(--color-chart-1)" : "var(--color-status-poor)";
    html += `<rect x="${bx}" y="${5}" width="${bw}" height="${rowH-10}" fill="${fill}" rx="2"/>`;
    html += `<text x="${bias < 0 ? cx + 5 : cx - 5}" y="${5 + rowH/2}" font-size="10" fill="var(--color-ink)" alignment-baseline="middle" text-anchor="${bias < 0 ? 'start' : 'end'}">Baseline Bias</text>`;
    html += `<text x="${bias < 0 ? bx - 5 : bx + bw + 5}" y="${5 + rowH/2}" font-size="10" fill="var(--color-ink-muted)" alignment-baseline="middle" text-anchor="${bias < 0 ? 'end' : 'start'}">${bias.toFixed(2)}</text>`;

    keys.forEach((k, i) => {
        const val = contributions[k];
        let w = Math.abs(val) * scale;
        let x = val < 0 ? cx - w : cx;
        let c = val < 0 ? "var(--color-chart-1)" : "var(--color-status-poor)";
        let y = (i+1)*rowH + 5;

        // Find label
        const feat = import('./risk.js').then(r => r.FEATURES.find(f => f.key === k)); // Wait, we can't await here synchronously. We will just use the key for now.
        const labelText = k.replace(/([A-Z])/g, ' $1').toLowerCase();

        html += `<rect x="${x}" y="${y}" width="${w}" height="${rowH-10}" fill="${c}" rx="2"/>`;
        html += `<text x="${val < 0 ? cx + 5 : cx - 5}" y="${y + (rowH-10)/2}" font-size="10" fill="var(--color-ink)" alignment-baseline="middle" text-anchor="${val < 0 ? 'start' : 'end'}">${labelText}</text>`;
        html += `<text x="${val < 0 ? x - 5 : x + w + 5}" y="${y + (rowH-10)/2}" font-size="10" fill="var(--color-ink-muted)" alignment-baseline="middle" text-anchor="${val < 0 ? 'end' : 'start'}">${val > 0 ? '+' : ''}${val.toFixed(2)}</text>`;
    });

    html += `</svg>`;
    return html;
}

export function renderForecastHistogram(histogram, p50, p80, committedRemaining, width=300, height=100) {
    const { bins, min, max, binWidth } = histogram;
    const maxBin = Math.max(...bins);
    const dx = width / bins.length;
    const dy = height / maxBin;

    const getX = (val) => ((val - min) / (max - min)) * width;

    let html = `<svg width="100%" height="${height+20}" viewBox="0 0 ${width} ${height+20}">`;

    bins.forEach((count, i) => {
        const bh = count * dy;
        const x = i * dx;
        const y = height - bh;
        const binMidVal = min + i * binWidth + binWidth/2;

        // Color critical if beyond committed
        const color = binMidVal > committedRemaining ? "var(--color-status-poor)" : "var(--color-chart-1)";
        html += `<rect x="${x}" y="${y}" width="${dx - 1}" height="${bh}" fill="${color}" opacity="0.7"/>`;
    });

    // Lines
    const cX = getX(committedRemaining);
    if (cX >= 0 && cX <= width) {
        html += `<line x1="${cX}" y1="0" x2="${cX}" y2="${height+10}" stroke="var(--color-status-good)" stroke-width="2" />`;
        html += `<text x="${cX}" y="${height+18}" font-size="9" fill="var(--color-status-good)" text-anchor="middle">Plan</text>`;
    }

    const p50X = getX(p50);
    html += `<line x1="${p50X}" y1="0" x2="${p50X}" y2="${height+10}" stroke="var(--color-ink)" stroke-width="1" stroke-dasharray="2 2" />`;
    html += `<text x="${p50X}" y="${height+18}" font-size="9" fill="var(--color-ink)" text-anchor="middle">P50</text>`;

    const p80X = getX(p80);
    html += `<line x1="${p80X}" y1="0" x2="${p80X}" y2="${height+10}" stroke="var(--color-status-fair-text)" stroke-width="1" stroke-dasharray="2 2" />`;
    html += `<text x="${p80X}" y="${height+18}" font-size="9" fill="var(--color-status-fair-text)" text-anchor="middle">P80</text>`;

    html += `</svg>`;
    return html;
}
