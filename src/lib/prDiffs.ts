import { diff } from './diff';
import type { PRDiffs } from './pr';

export type PrDiffNight = {
  sleepDate: string;
  asleepMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  coreMinutes: number;
};

function stagePct(stageMinutes: number, asleepMinutes: number): number {
  if (asleepMinutes <= 0 || stageMinutes <= 0) return 0;
  return (stageMinutes / asleepMinutes) * 100;
}

function topValues(
  nights: PrDiffNight[],
  valueOf: (n: PrDiffNight) => number,
): number[] {
  return [...nights]
    .map(valueOf)
    .filter((v) => v > 0)
    .sort((a, b) => b - a);
}

function bottomValues(
  nights: PrDiffNight[],
  valueOf: (n: PrDiffNight) => number,
): number[] {
  return [...nights]
    .map(valueOf)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
}

/** Diff vs #2 across the given nights for every PR type. */
export function computePrDiffs(nights: PrDiffNight[]): PRDiffs {
  if (nights.length < 2) return {};

  const shortest = bottomValues(nights, (n) => n.asleepMinutes);

  return {
    longest_sleep: diff(topValues(nights, (n) => n.asleepMinutes)),
    shortest_sleep: shortest.length >= 2 ? shortest[1] - shortest[0] : 0,
    most_deep_sleep: diff(topValues(nights, (n) => n.deepMinutes)),
    most_rem: diff(topValues(nights, (n) => n.remMinutes)),
    most_core_sleep: diff(topValues(nights, (n) => n.coreMinutes)),
    highest_deep_pct: diff(topValues(nights, (n) => stagePct(n.deepMinutes, n.asleepMinutes))),
    highest_rem_pct: diff(topValues(nights, (n) => stagePct(n.remMinutes, n.asleepMinutes))),
    highest_core_pct: diff(topValues(nights, (n) => stagePct(n.coreMinutes, n.asleepMinutes))),
    lowest_deep_pct: (() => {
      const vals = bottomValues(nights, (n) => stagePct(n.deepMinutes, n.asleepMinutes));
      return vals.length >= 2 ? vals[1] - vals[0] : 0;
    })(),
    lowest_rem_pct: (() => {
      const vals = bottomValues(nights, (n) => stagePct(n.remMinutes, n.asleepMinutes));
      return vals.length >= 2 ? vals[1] - vals[0] : 0;
    })(),
    lowest_core_pct: (() => {
      const vals = bottomValues(nights, (n) => stagePct(n.coreMinutes, n.asleepMinutes));
      return vals.length >= 2 ? vals[1] - vals[0] : 0;
    })(),
  };
}

/** Diffs for nights in the same calendar month as `sleepDate` (YYYY-MM-DD). */
export function computeMonthlyPrDiffs(nights: PrDiffNight[], sleepDate: string): PRDiffs {
  const monthKey = sleepDate.slice(0, 7);
  return computePrDiffs(nights.filter((n) => n.sleepDate.startsWith(monthKey)));
}
