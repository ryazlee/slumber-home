import { addDaysToDateISO } from './dates';

export const PR_LABELS: Record<string, string> = {
  longest_sleep: 'Longest Sleep',
  shortest_sleep: 'Shortest Sleep',
  most_wakes: 'Most Wakes',
  most_deep_sleep: 'Most Deep',
  most_rem: 'Most REM',
  most_core_sleep: 'Most Core',
  highest_deep_pct: 'Highest Deep %',
  highest_rem_pct: 'Highest REM %',
  highest_core_pct: 'Highest Core %',
  lowest_deep_pct: 'Lowest Deep %',
  lowest_rem_pct: 'Lowest REM %',
  lowest_core_pct: 'Lowest Core %',
};

export const PERCENT_PR_TYPES = new Set([
  'highest_deep_pct',
  'highest_rem_pct',
  'highest_core_pct',
  'lowest_deep_pct',
  'lowest_rem_pct',
  'lowest_core_pct',
]);

/** Count-based PRs (not minutes / %). */
export const COUNT_PR_TYPES = new Set([
  'most_wakes',
]);

/** "Anti-records" — shortest night / most wakes / lowest stage share. Styled distinctly from achievement PRs. */
export const NEGATIVE_PR_TYPES = new Set([
  'shortest_sleep',
  'most_wakes',
  'lowest_deep_pct',
  'lowest_rem_pct',
  'lowest_core_pct',
]);

export function isPercentPrType(type: string): boolean {
  return PERCENT_PR_TYPES.has(type);
}

export function isCountPrType(type: string): boolean {
  return COUNT_PR_TYPES.has(type);
}

export function isNegativePrType(type: string): boolean {
  return NEGATIVE_PR_TYPES.has(type);
}

// Maps record_type → diff vs #2 in the user's own lifetime top-3
export type PRDiffs = Record<string, number>;

/** Inclusive trailing window for feed/detail PR badges (not calendar month). */
export const RECENT_PR_WINDOW_DAYS = 30;

/** Wearable nights needed in the trailing window before recent PR chips show. */
export const RECENT_PR_MIN_POSTS = 5;

/** First sleep_date (inclusive) in the trailing window ending on `sleepDate`. */
export function recentPrWindowStart(sleepDate: string): string {
  return addDaysToDateISO(sleepDate, -(RECENT_PR_WINDOW_DAYS - 1));
}

export function isInRecentPrWindow(nightDate: string, anchorSleepDate: string): boolean {
  return nightDate >= recentPrWindowStart(anchorSleepDate) && nightDate <= anchorSleepDate;
}

type PrBadgePost = {
  prTypes?: string[];
  recentPrTypes?: string[];
  recentWindowPostCount?: number;
};

/**
 * Hide recent PR chips until the author has enough wearable posts in that
 * trailing window — a "30-day best" among a handful of nights is not meaningful.
 *
 * Missing count is treated as 1 so badges stay hidden until enrichment
 * provides a real count.
 */
export function isRecentPrBadgeHidden(post: Pick<PrBadgePost, 'recentWindowPostCount'>): boolean {
  return (post.recentWindowPostCount ?? 1) < RECENT_PR_MIN_POSTS;
}

export function getVisibleRecentPrTypes(post: PrBadgePost): string[] {
  const types = post.recentPrTypes ?? [];
  if (!types.length || isRecentPrBadgeHidden(post)) return [];
  return types;
}

export type PrBadgeChip = {
  type: string;
  scope: 'all-time' | 'recent';
};

/**
 * Display order: lifetime best → 30-day best → lifetime worst → 30-day worst.
 * Preserves relative order within each group. Does not apply visibility prefs.
 */
export function orderPrBadgeChips(post: PrBadgePost): PrBadgeChip[] {
  const lifetimeBest: PrBadgeChip[] = [];
  const lifetimeWorst: PrBadgeChip[] = [];
  const recentBest: PrBadgeChip[] = [];
  const recentWorst: PrBadgeChip[] = [];
  for (const type of post.prTypes ?? []) {
    (isNegativePrType(type) ? lifetimeWorst : lifetimeBest).push({ type, scope: 'all-time' });
  }
  for (const type of getVisibleRecentPrTypes(post)) {
    (isNegativePrType(type) ? recentWorst : recentBest).push({ type, scope: 'recent' });
  }
  return [...lifetimeBest, ...recentBest, ...lifetimeWorst, ...recentWorst];
}

/** Strip best and/or worst PR types for feed visibility (author prefs). */
export function filterPrTypesByVisibility(
  types: string[] | undefined,
  opts: { showBest: boolean; showWorst: boolean },
): string[] | undefined {
  if (!types?.length) return undefined;
  const next = types.filter((t) => (isNegativePrType(t) ? opts.showWorst : opts.showBest));
  return next.length > 0 ? next : undefined;
}

/** Format margin vs #2 — bests as +time/+%; min anti-records as -time/-%; max anti-records (most wakes) as +N. */
export function formatPrDiffLabel(
  type: string,
  value: number,
  formatMins: (n: number) => string,
  formatPct: (n: number) => string,
): string {
  if (value <= 0) return '';
  const mag = isPercentPrType(type)
    ? formatPct(value)
    : isCountPrType(type)
      ? String(Math.round(value))
      : formatMins(value);
  // Most wakes ranks by maximum (more = worse) so the margin is still a +.
  // Shortest / lowest % rank by minimum, so the margin is a -.
  if (isNegativePrType(type) && !isCountPrType(type)) return `-${mag}`;
  return `+${mag}`;
}

export function hasVisiblePrBadges(post: PrBadgePost): boolean {
  return (post.prTypes?.length ?? 0) > 0 || getVisibleRecentPrTypes(post).length > 0;
}
