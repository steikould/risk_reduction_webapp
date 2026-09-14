import assert from 'assert';
import { S, signal } from '../src/stats.js';

// Setup mock metrics for signal test
import { METRICS, MET } from '../src/metrics.js';
import { SERIES } from '../src/series.js';

// Test XmR
const series1 = [10, 12, 11, 13, 10, 12];
const xmr = S.xmr(series1);
assert.ok(Math.abs(xmr.centre - 11.333) < 0.01);
assert.ok(xmr.mrBar > 0);

// Test trend
const linear = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const tLinear = S.trend(linear);
assert.ok(Math.abs(tLinear.slope - 1) < 0.001);
assert.ok(tLinear.significant === true);

const flat = [5, 5.1, 4.9, 5.2, 4.8, 5, 5.1, 4.9, 5.2, 4.8, 5, 5.1];
const tFlat = S.trend(flat);
assert.ok(Math.abs(tFlat.slope) < 0.1);
assert.ok(tFlat.significant === false);

// Test signal
SERIES['test'] = {};
SERIES['test']['mock.metric2'] = [10, 11, 9, 12, 8, 10, 11, 9, 10, 10, 11, 9, 10]; // jitter
MET['mock.metric2'] = {
    id: 'mock.metric2', direction: 'up', target: 10, warn: 5
};
const sig2 = signal('mock.metric2', 'test', 12);
assert.equal(sig2.kind, 'noise');

console.log("Stats tests passed.");
