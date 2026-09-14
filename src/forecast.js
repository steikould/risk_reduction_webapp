export function forecast(project, { extraFte = 0, scopeCut = 0 } = {}) {
  // Use a pseudo-random generator keyed off the project ID and inputs to ensure deterministic runs
  let seed = 0;
  const seedStr = project.id + extraFte + scopeCut;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Box-Muller transform for standard normal distribution
  function randn() {
    let u = 0, v = 0;
    while(u === 0) u = random();
    while(v === 0) v = random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  const now = new Date('2026-05-31');
  const targetDate = new Date(project.target);
  const plannedRemaining = Math.max(0.5, (targetDate - now) / (1000 * 60 * 60 * 24 * 30.44));

  // Determine features (using same mock access as score, or defaults)
  let scheduleVariance = 0, dependencyLoad = 0, teamChurn = 0, costEfficiency = 0;
  if (project.health === 'on-track') {
      // defaults for on track
  } else if (project.health === 'off-track') {
      scheduleVariance = 0.8; dependencyLoad = 0.8; teamChurn = 0.5; costEfficiency = 0.7;
  } else {
      scheduleVariance = 0.4; dependencyLoad = 0.5; teamChurn = 0.3; costEfficiency = 0.4;
  }

  const teamSize = project.teamSize || 8;
  const capacity = 1 + (extraFte / Math.max(4, teamSize)) * 0.55;
  const drag = (0.77 + 0.50 * scheduleVariance + 0.17 * dependencyLoad + 0.14 * teamChurn + 0.12 * costEfficiency) / capacity;

  const runs = 4000;
  const finishes = new Float32Array(runs);

  let misses = 0;
  for (let i = 0; i < runs; i++) {
    const noise = Math.exp(randn() * (0.17 + 0.10 * teamChurn));
    const duration = plannedRemaining * drag * (1 - scopeCut) * noise;
    finishes[i] = duration;
    if (duration > plannedRemaining) {
        misses++;
    }
  }

  finishes.sort();
  const pMiss = misses / runs;
  const p50 = finishes[Math.floor(runs * 0.50)];
  const p80 = finishes[Math.floor(runs * 0.80)];
  const p95 = finishes[Math.floor(runs * 0.95)];

  // Convert month durations back to dates
  const d50 = new Date(now.getTime() + p50 * 30.44 * 24 * 60 * 60 * 1000);
  const d80 = new Date(now.getTime() + p80 * 30.44 * 24 * 60 * 60 * 1000);

  const slipMonths = Math.max(0, p50 - plannedRemaining);

  // Generate histogram (e.g. 20 bins)
  const minF = finishes[0];
  const maxF = finishes[runs - 1];
  const binCount = 20;
  const binWidth = (maxF - minF) / binCount;
  const histogram = new Array(binCount).fill(0);

  for (let i = 0; i < runs; i++) {
      let bin = Math.floor((finishes[i] - minF) / binWidth);
      if (bin >= binCount) bin = binCount - 1;
      histogram[bin]++;
  }

  return {
    p50, p80, p95, pMiss, d50, d80, slipMonths,
    histogram: { bins: histogram, min: minF, max: maxF, binWidth }
  };
}
