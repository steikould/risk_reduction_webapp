import assert from 'assert';
import { score, BIAS, FEATURES, updateProjectHealth } from '../src/risk.js';
import { forecast } from '../src/forecast.js';

// Setup mock project
const proj = {
    id: 'test-1',
    name: 'Test Project',
    start: '2025-01-01',
    target: '2026-12-31',
    pctComplete: 30,
    planPctComplete: 50, // schedule variance
    budgetUsedPct: 60, // cost efficiency poor
    dependencyLoad: 0.8,
    scopeChurn: 0.5,
    teamChurn: 0.2,
    reportingStaleness: 0.1,
    isPriority: true,
    health: 'at-risk'
};

const res = score(proj);

// Test attribution sums exactly to z
let sum = BIAS;
for (const key in res.contributions) {
    sum += res.contributions[key];
}
assert.ok(Math.abs(sum - res.z) < 1e-9);

// Test forecasting percentile ordering
const fcast = forecast(proj);
assert.ok(fcast.p50 <= fcast.p80);
assert.ok(fcast.p80 <= fcast.p95);

console.log("Risk & Forecast tests passed.");
