// Synthetic demo data generator for analytics dashboard.
// Not real figures.
import { METRICS } from "./metrics.js";

// mulberry32 - deterministic RNG
function rng(seed) {
  return function () {
    var t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PERIODS = [];
let dt = new Date(2024, 5, 1); // June 2024
for (let i = 0; i < 24; i++) {
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1).toString().padStart(2, "0");
  const monthName = dt.toLocaleString("en-US", { month: "short" });
  PERIODS.push({
    key: `${y}-${m}`,
    label: `${monthName} ${y}`,
    short: monthName,
  });
  dt.setMonth(dt.getMonth() + 1);
}
// Last period is May 2026 (index 23)

export const SERIES = {
  enterprise: {},
  hp: {},
  ah: {},
};

// Target values for May 2026 (index 23) based on the provided endpoints
const ENDPOINTS = {
  "exec.health": { enterprise: 82, hp: 79, ah: 84 },
  "exec.ah_health": { enterprise: 84, hp: 84, ah: 84 },
  "exec.hp_health": { enterprise: 79, hp: 79, ah: 79 },
  "trust.nps": { enterprise: 32, hp: 28, ah: 36 },
  "trust.escalations": { enterprise: 12, hp: 7, ah: 5 },
  "trust.adoption": { enterprise: 68, hp: 65, ah: 71 },
  "ops.availability": { enterprise: 99.6, hp: 99.5, ah: 99.7 },
  "ops.major_incidents": { enterprise: 5, hp: 3, ah: 2 },
  "ops.sla_achievement": { enterprise: 84, hp: 82, ah: 86 },
  "port.health": { enterprise: 76, hp: 71, ah: 81 },
  "port.on_track": { enterprise: 26, hp: 12, ah: 14 },
  "port.at_risk": { enterprise: 11, hp: 6, ah: 5 },
  "del.benefits": { enterprise: 76, hp: 72, ah: 80 },
  "del.ttv": { enterprise: 4.2, hp: 4.5, ah: 3.9 },
  "del.velocity": { enterprise: 95, hp: 90, ah: 100 },
  "fin.budget_var": { enterprise: 82, hp: 85, ah: 79 },
  "fin.forecast_acc": { enterprise: 93, hp: 91, ah: 95 },
  "fin.runrate": { enterprise: 54, hp: 56, ah: 52 },
  "peo.engagement": { enterprise: 71, hp: 68, ah: 74 },
  "peo.open_pos": { enterprise: 18, hp: 19, ah: 17 },
  "peo.retention": { enterprise: 91, hp: 89, ah: 93 },
  "ai.readiness": { enterprise: 72, hp: 70, ah: 75 },
  "ai.adoption": { enterprise: 69, hp: 65, ah: 73 },
  "ai.prod_cases": { enterprise: 15, hp: 8, ah: 7 },
  "cyb.posture": { enterprise: 89, hp: 88, ah: 90 },
  "cyb.vulns": { enterprise: 7, hp: 4, ah: 3 },
  "cyb.compliance": { enterprise: 96, hp: 95, ah: 97 },
};

function generateSeries(metric, view, targetEndpoint, seedStr) {
  // Simple seed generation from string
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  const random = rng(seed);

  const points = [];
  const n = 24;

  // Decide base, drift, noise
  // We want the final value (index 23) to be exactly targetEndpoint
  // series[i] = base + drift * i + noise[i]

  // Set noise scale based on metric unit
  let noiseScale = 2; // default 2%
  if (metric.unit === "%" && metric.decimals === 2) noiseScale = 0.1;
  else if (metric.unit === "count") noiseScale = targetEndpoint * 0.2;
  else if (metric.unit === "mos") noiseScale = 0.3;
  else if (metric.unit === "pts" && metric.id === "trust.nps") noiseScale = 3;
  else if (metric.unit === "pts" && metric.id === "del.velocity") noiseScale = 5;

  let drift = (random() - 0.5) * 0.5; // slight random drift

  // Generate uniform noise
  const noise = [];
  for (let i = 0; i < n; i++) {
    noise.push((random() - 0.5) * 2 * noiseScale);
  }

  // Plant a shock to test anomalies
  // About 20% chance of a shock in a series
  if (random() > 0.8) {
    const shockIdx = Math.floor(random() * (n - 2)); // not the last couple
    noise[shockIdx] += (random() > 0.5 ? 1 : -1) * noiseScale * 4;
  }
  // Plant another specific shock for 'anomaly' watcher testing
  // Make sure at least some metrics have an anomaly in the last period
  if (metric.id === "ops.major_incidents" && view === "enterprise") {
      noise[23] = noiseScale * 5; // huge spike at the end
  }

  // Calculate base so that base + drift*23 + noise[23] = targetEndpoint
  const base = targetEndpoint - drift * 23 - noise[23];

  for (let i = 0; i < n; i++) {
    let val = base + drift * i + noise[i];

    // Bounds checking
    if (metric.unit === "%") {
        if (metric.decimals === 2) {
            val = Math.min(100, Math.max(0, val));
        } else {
            val = Math.min(100, Math.max(0, val));
        }
    } else if (metric.unit === "count") {
        val = Math.max(0, val);
    }

    // Rounding
    if (metric.decimals === 0) {
      val = Math.round(val);
    } else {
      const p = Math.pow(10, metric.decimals);
      val = Math.round(val * p) / p;
    }
    points.push(val);
  }

  // Force the last point to exactly match the target endpoint
  points[23] = targetEndpoint;

  return points;
}

const views = ["enterprise", "hp", "ah"];
METRICS.forEach((m) => {
  views.forEach((v) => {
    const target = ENDPOINTS[m.id][v];
    SERIES[v][m.id] = generateSeries(m, v, target, `${m.id}-${v}-v1`);
  });
});

export const at = (metricId, view, i) => SERIES[view][metricId][i];
