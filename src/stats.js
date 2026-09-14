import { MET } from "./metrics.js";
import { at } from "./series.js";

export const S = {
  mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  },
  sd(arr) {
    if (arr.length < 2) return 0;
    const m = S.mean(arr);
    const v = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (arr.length - 1);
    return Math.sqrt(v);
  },
  median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  },
  mad(arr) {
    if (arr.length === 0) return 0;
    const med = S.median(arr);
    const devs = arr.map(x => Math.abs(x - med));
    return 1.4826 * S.median(devs);
  },
  xmr(series) {
    // Shewhart individuals chart (XmR)
    if (series.length < 2) {
      return { centre: series[0] || 0, ucl: 0, lcl: 0, mrBar: 0 };
    }
    const centre = S.mean(series);
    const mRs = [];
    for (let i = 1; i < series.length; i++) {
      mRs.push(Math.abs(series[i] - series[i - 1]));
    }
    const mrBar = S.mean(mRs);
    const E2 = 2.66; // standard constant for n=2
    const ucl = centre + E2 * mrBar;
    const lcl = centre - E2 * mrBar;

    return { centre, ucl, lcl, mrBar };
  },
  trend(series) {
    // OLS slope + two-sided t-test
    const n = series.length;
    if (n < 2) return { slope: 0, intercept: 0, t: 0, p: 1, significant: false };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += series[i];
      sumXY += i * series[i];
      sumXX += i * i;
    }

    const xBar = sumX / n;
    const yBar = sumY / n;
    const SSxx = sumXX - n * xBar * xBar;
    const SSxy = sumXY - n * xBar * yBar;

    const slope = SSxx === 0 ? 0 : SSxy / SSxx;
    const intercept = yBar - slope * xBar;

    let SSE = 0;
    for (let i = 0; i < n; i++) {
      const yHat = intercept + slope * i;
      SSE += Math.pow(series[i] - yHat, 2);
    }

    const MSE = n > 2 ? SSE / (n - 2) : 0;
    const SE_slope = SSxx > 0 ? Math.sqrt(MSE / SSxx) : 0;

    let t = 0;
    if (SE_slope > 0) {
      t = slope / SE_slope;
    } else if (slope !== 0 && SE_slope === 0) {
       // perfect fit
       t = slope > 0 ? Infinity : -Infinity;
    }

    // Normal approximation to t-distribution
    const p = 2 * (1 - S.ncdf(Math.abs(t)));

    return { slope, intercept, t, p, significant: p < 0.05 };
  },
  ncdf(z) {
    // Standard normal CDF (Hart, 1968)
    const z2 = Math.abs(z);
    if (z2 > 6) return z > 0 ? 1 : 0;
    const b = [
      0.31938153, -0.356563782, 1.781477937, -1.821255978, 1.330274429
    ];
    const p = 0.2316419;
    const t = 1 / (1 + p * z2);
    let poly = 0;
    for (let i = 4; i >= 0; i--) {
      poly = (poly + b[i]) * t;
    }
    const pdf = Math.exp(-0.5 * z2 * z2) / Math.sqrt(2 * Math.PI);
    const prob = 1 - pdf * poly;
    return z > 0 ? prob : 1 - prob;
  }
};

export function signal(metricId, view, i) {
  const metric = MET[metricId];
  if (!metric) throw new Error(`Unknown metric: ${metricId}`);

  const val = at(metricId, view, i);
  const prev = i > 0 ? at(metricId, view, i - 1) : val;
  const delta = val - prev;

  // Calculate stats on trailing up to 12 periods prior to current
  const startIdx = Math.max(0, i - 12);
  const trailing = [];
  for (let j = startIdx; j <= i; j++) {
    trailing.push(at(metricId, view, j));
  }

  const xmr = S.xmr(trailing.slice(0, -1)); // stats excluding current point
  const stddev = xmr.mrBar / 1.128; // empirical relation d2=1.128 for n=2

  const sigma = stddev > 0 ? (val - xmr.centre) / stddev : 0;

  let kind = 'noise';
  if (val > xmr.ucl || val < xmr.lcl) {
    kind = 'breach';
  } else if (Math.abs(sigma) > 2) {
    kind = 'signal';
  } else if (Math.abs(sigma) > 1) {
    kind = 'watch';
  }

  const tr = S.trend(trailing);
  let trendDirection = 'stable';
  if (tr.significant) {
    if (tr.slope > 0) trendDirection = metric.direction === 'down' ? 'deteriorating' : 'improving';
    if (tr.slope < 0) trendDirection = metric.direction === 'down' ? 'improving' : 'deteriorating';
    if (metric.direction === 'flat') {
       // for flat, trend is stable if not diverging from target, but let's just mark it based on magnitude
       trendDirection = 'stable';
    }
  }

  let band = 'fair';
  if (metric.direction === 'up') {
    if (val >= metric.target) band = 'good';
    else if (val <= metric.warn) band = 'poor';
  } else if (metric.direction === 'down') {
    if (val <= metric.target) band = 'good';
    else if (val >= metric.warn) band = 'poor';
  } else {
    // flat
    if (Math.abs(val - metric.target) <= Math.abs(metric.warn - metric.target)) band = 'good';
    else band = 'poor';
  }

  return {
    value: val,
    previous: prev,
    delta: delta,
    sigma: sigma,
    kind: kind,
    trendDirection: trendDirection,
    band: band,
    controlLimits: {
      centre: xmr.centre,
      ucl: xmr.ucl,
      lcl: xmr.lcl
    }
  };
}

export function anomalies(metricId, view, fromIdx) {
  // Finds anomalies from `fromIdx` to the end of the series using trailing-12 XmR
  const res = [];
  for (let i = fromIdx; i < 24; i++) {
    const startIdx = Math.max(0, i - 12);
    const trailing = [];
    for (let j = startIdx; j < i; j++) {
      trailing.push(at(metricId, view, j));
    }
    if (trailing.length < 2) continue;
    const limits = S.xmr(trailing);
    const val = at(metricId, view, i);
    if (val > limits.ucl || val < limits.lcl) {
      res.push({
        i,
        value: val,
        controlLimits: limits
      });
    }
  }
  return res;
}
