import { MET } from "./metrics.js";
import { signal, anomalies, S } from "./stats.js";
import { forecast } from "./forecast.js";
import { at } from "./series.js";

export const WATCHERS = [
  {
    id: "burn",
    name: "Budget-burn divergence",
    domain: "financial-health",
    run(ctx) {
      const findings = [];
      const { projects } = ctx;
      const troubled = projects.filter(p => (p.budgetUsedPct - p.pctComplete) > 18);

      if (troubled.length > 0) {
        // Calculate combined exposure
        let exposure = 0;
        let worst = troubled[0];
        let maxDiff = 0;

        troubled.forEach(p => {
            const diff = p.budgetUsedPct - p.pctComplete;
            if (diff > maxDiff) {
                maxDiff = diff;
                worst = p;
            }
            // Rough exposure calc: (budgetUsedPct - pctComplete)% of budget
            exposure += (diff / 100) * p.budgetM;
        });

        findings.push({
          id: 'w-burn',
          severity: troubled.length > 3 ? 'crit' : 'high',
          title: `${troubled.length} projects are burning budget faster than they are delivering scope`,
          evidence: `Combined exposure $${exposure.toFixed(1)}M at current pace. Worst: ${worst.name} (${maxDiff.toFixed(0)} pts divergence).`,
          metrics: ['fin.runrate', 'port.health'],
          projects: troubled.map(p => p.id),
          actions: [
            { label: 'Show these in portfolio', run: () => window.agentNavigate({ tab: 'strategic-portfolio', filterFn: (p) => troubled.find(t => t.id === p.id) }) },
            { label: 'Open worst offender', run: () => window.openProjectDrawer(worst.id) },
            { label: 'Queue for decision', run: () => window.queueDecision('Review budget recovery plans for divergent projects', 'burn') },
          ]
        });
      }
      return findings;
    }
  },
  {
    id: "slip",
    name: "Delivery slip risk",
    domain: "delivery-value",
    run(ctx) {
      const findings = [];
      const slipping = [];
      ctx.projects.forEach(p => {
          if (p.pctComplete < 93) {
              const fcast = forecast(p);
              if (fcast.pMiss > 0.55) {
                  slipping.push({ p, fcast });
              }
          }
      });

      if (slipping.length > 0) {
          slipping.sort((a,b) => b.fcast.pMiss - a.fcast.pMiss);
          const worst = slipping[0];
          findings.push({
            id: 'w-slip',
            severity: 'high',
            title: `${slipping.length} projects have >55% probability of missing committed dates`,
            evidence: `Highest risk: ${worst.p.name} has ${(worst.fcast.pMiss * 100).toFixed(0)}% miss probability, slipping ~${worst.fcast.slipMonths.toFixed(1)} months.`,
            metrics: ['del.ttv'],
            projects: slipping.map(s => s.p.id),
            actions: [
              { label: 'Open worst offender', run: () => window.openProjectDrawer(worst.p.id) },
              { label: 'Queue for decision', run: () => window.queueDecision('Review schedule relief or scope cuts for slipping projects', 'slip') }
            ]
          });
      }
      return findings;
    }
  },
  {
    id: "anomaly",
    name: "Statistical anomalies",
    domain: "operational-health",
    run(ctx) {
        const findings = [];
        const { view, periodIndex } = ctx;
        if (periodIndex < 12) return []; // need history

        let found = [];
        Object.keys(MET).forEach(metricId => {
            const sig = signal(metricId, view, periodIndex);
            if (sig.kind === 'breach') {
                found.push({ metricId, sig });
            }
        });

        if (found.length > 0) {
            found.sort((a,b) => Math.abs(b.sig.sigma) - Math.abs(a.sig.sigma));
            found = found.slice(0, 3); // cap at 3 largest

            const mNames = found.map(f => MET[f.metricId].name).join(', ');

            findings.push({
                id: 'w-anomaly',
                severity: 'crit',
                title: `${found.length} metrics breached control limits this period`,
                evidence: `Anomalies detected in: ${mNames}. Most severe deviation is ${MET[found[0].metricId].name} at ${found[0].sig.value}${MET[found[0].metricId].unit} (${Math.abs(found[0].sig.sigma).toFixed(1)}σ).`,
                metrics: found.map(f => f.metricId),
                projects: [],
                actions: [
                    { label: `View ${MET[found[0].metricId].name}`, run: () => window.agentNavigate({ tab: MET[found[0].metricId].domain, openMetric: found[0].metricId }) }
                ]
            });
        }
        return findings;
    }
  },
  {
    id: "trend",
    name: "Deteriorating trends",
    domain: "operational-health",
    run(ctx) {
        const findings = [];
        const { view, periodIndex } = ctx;
        if (periodIndex < 12) return [];

        let found = [];
        Object.keys(MET).forEach(metricId => {
            const sig = signal(metricId, view, periodIndex);
            if (sig.kind !== 'breach' && sig.trendDirection === 'deteriorating') {
                const startIdx = Math.max(0, periodIndex - 12);
                const trailing = [];
                for(let j = startIdx; j <= periodIndex; j++) {
                    trailing.push(at(metricId, view, j));
                }
                const tr = S.trend(trailing);
                if (tr.p < 0.02) {
                    const metric = MET[metricId];
                    // project months until cross warn
                    const targetVal = metric.warn;
                    let monthsToCross = Infinity;
                    if (tr.slope !== 0) {
                        const crossX = (targetVal - tr.intercept) / tr.slope;
                        monthsToCross = crossX - trailing.length; // From current point
                    }
                    if (monthsToCross > 0 && monthsToCross < 24) {
                        found.push({
                            metric,
                            monthsToCross,
                            p: tr.p
                        });
                    }
                }
            }
        });

        if (found.length > 0) {
            found.sort((a,b) => a.monthsToCross - b.monthsToCross);
            const worst = found[0];
            findings.push({
                id: 'w-trend',
                severity: 'high',
                title: `${worst.metric.name} trend is significantly deteriorating (p=${worst.p.toFixed(3)})`,
                evidence: `At the current rate, ${worst.metric.name} will cross its warning threshold of ${worst.metric.warn}${worst.metric.unit} in ${Math.ceil(worst.monthsToCross)} months.`,
                metrics: [worst.metric.id],
                projects: [],
                actions: [
                    { label: `View ${worst.metric.name}`, run: () => window.agentNavigate({ tab: worst.metric.domain, openMetric: worst.metric.id }) },
                    { label: 'Queue for decision', run: () => window.queueDecision(`Review intervention for ${worst.metric.name} trend`, 'trend') }
                ]
            });
        }
        return findings;
    }
  },
  {
    id: "concentration",
    name: "Risk concentration",
    domain: "people-capability",
    run(ctx) {
        const owners = {};
        ctx.projects.forEach(p => {
            if (p.health !== 'on-track') {
                owners[p.owner] = (owners[p.owner] || 0) + 1;
            }
        });
        const overloaded = Object.keys(owners).filter(k => owners[k] >= 3);
        if (overloaded.length > 0) {
            return [{
                id: 'w-concentration',
                severity: 'med',
                title: `${overloaded.length} owners hold 3+ non-on-track projects`,
                evidence: `${overloaded[0]} currently owns ${owners[overloaded[0]]} troubled projects.`,
                metrics: [],
                projects: ctx.projects.filter(p => p.owner === overloaded[0]).map(p=>p.id),
                actions: [
                    { label: 'Queue for decision', run: () => window.queueDecision(`Review portfolio load for ${overloaded[0]}`, 'concentration') }
                ]
            }];
        }
        return [];
    }
  },
  {
    id: "dataQuality",
    name: "Data Quality",
    domain: "business-trust",
    run(ctx) {
        const uncert = Object.values(MET).filter(m => !m.certified || m.quality < 0.86);
        if (uncert.length > 0) {
            return [{
                id: 'w-dq',
                severity: 'info',
                title: `${uncert.length} metrics lack certification or meet quality bar`,
                evidence: `${uncert[0].name} has quality score ${(uncert[0].quality*100).toFixed(0)}%.`,
                metrics: uncert.map(m => m.id),
                projects: [],
                actions: []
            }];
        }
        return [];
    }
  },
  {
    id: "mix",
    name: "Portfolio Mix",
    domain: "strategic-portfolio",
    run(ctx) {
        // Spec: Grow/Transform share more than 4 points below target
        // We will assume 'Transform' vs 'Run' vs 'Grow' exists, but our projects mock didn't explicitly add it.
        // Let's deduce it from 'phase' or 'isPriority'. Or just generate it deterministically based on name length for demo.
        let growTransformTotal = 0;
        let total = 0;
        ctx.projects.forEach(p => {
            const isGrowTransform = (p.name.length % 2 === 0);
            total += p.budgetM;
            if (isGrowTransform) growTransformTotal += p.budgetM;
        });

        if (total === 0) return [];
        const share = (growTransformTotal / total) * 100;
        const target = 65; // Mock target

        if (share < (target - 4)) {
            return [{
                id: 'w-mix',
                severity: 'med',
                title: `Grow/Transform portfolio mix is ${target - share.toFixed(0)} points below target`,
                evidence: `Current share is ${share.toFixed(1)}% vs target of ${target}%. Total investment: $${total.toFixed(1)}M.`,
                metrics: [],
                projects: [],
                actions: [
                    { label: 'View Portfolio', run: () => window.agentNavigate({ tab: 'strategic-portfolio' }) },
                    { label: 'Queue for decision', run: () => window.queueDecision(`Review portfolio rebalancing to hit ${target}% Grow/Transform`, 'mix') }
                ]
            }];
        }
        return [];
    }
  }
];

export const auditLog = [];
export const decisionQueue = [];

export function runAgent(ctx, reason) {
    const start = performance.now();
    let scanCount = 0;
    let found = [];

    WATCHERS.forEach(w => {
        const res = w.run(ctx);
        scanCount++;
        found.push(...res);
    });

    found.sort((a, b) => {
        const val = { 'crit': 3, 'high': 2, 'med': 1, 'info': 0 };
        return val[b.severity] - val[a.severity];
    });

    const elapsed = Math.round(performance.now() - start);

    auditLog.unshift({
        timestamp: new Date().toISOString(),
        reason,
        watchersEvaluated: WATCHERS.length,
        recordsScanned: scanCount + ctx.projects.length,
        findingsRaised: found.length,
        elapsed,
        findings: found
    });

    // Dispatch event to UI
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agentSweepComplete', { detail: { findings: found, log: auditLog[0] }}));
    }

    return found;
}

export function queueDecision(text, sourceWatcherId) {
    decisionQueue.unshift({
        id: 'dec-' + Date.now(),
        text,
        source: sourceWatcherId,
        timestamp: new Date().toISOString()
    });
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('decisionQueued', { detail: decisionQueue[0] }));

        // Log user action
        auditLog.unshift({
            timestamp: new Date().toISOString(),
            reason: 'User action: Queued decision',
            action: text,
            source: sourceWatcherId
        });

        if (window.renderApp) window.renderApp();
    }
}
window.queueDecision = queueDecision;
