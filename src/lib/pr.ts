export const PR_LABELS: Record<string, string> = {
  longest_sleep: 'Longest Sleep',
  shortest_sleep: 'Shortest Sleep',
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

/** "Anti-records" — shortest night / lowest stage share. Styled distinctly from achievement PRs. */
export const NEGATIVE_PR_TYPES = new Set([
  'shortest_sleep',
  'lowest_deep_pct',
  'lowest_rem_pct',
  'lowest_core_pct',
]);

export function isPercentPrType(type: string): boolean {
  return PERCENT_PR_TYPES.has(type);
}

export function isNegativePrType(type: string): boolean {
  return NEGATIVE_PR_TYPES.has(type);
}

// Maps record_type → diff vs #2 in the user's own lifetime top-3
export type PRDiffs = Record<string, number>;

type PrBadgePost = {
  prTypes?: string[];
  monthlyPrTypes?: string[];
  /** Wearable (non-custom) posts by this author in the post's calendar month. */
  monthPostCount?: number;
};

/**
 * Hide monthly PR chips when the author has fewer than two wearable posts
 * in that calendar month — a "monthly best" among one night is not meaningful.
 */
export function isMonthlyPrBadgeHidden(post: Pick<PrBadgePost, 'monthPostCount'>): boolean {
  return (post.monthPostCount ?? 1) < 2;
}

export function getVisibleMonthlyPrTypes(post: PrBadgePost): string[] {
  const types = post.monthlyPrTypes ?? [];
  if (!types.length || isMonthlyPrBadgeHidden(post)) return [];
  return types;
}

export type PrBadgeChip = {
  type: string;
  scope: 'all-time' | 'monthly';
};

/**
 * Display order: lifetime best → monthly best → lifetime worst → monthly worst.
 * Preserves relative order within each group. Does not apply visibility prefs.
 */
export function orderPrBadgeChips(post: PrBadgePost): PrBadgeChip[] {
  const lifetimeBest: PrBadgeChip[] = [];
  const lifetimeWorst: PrBadgeChip[] = [];
  const monthlyBest: PrBadgeChip[] = [];
  const monthlyWorst: PrBadgeChip[] = [];
  for (const type of post.prTypes ?? []) {
    (isNegativePrType(type) ? lifetimeWorst : lifetimeBest).push({ type, scope: 'all-time' });
  }
  for (const type of getVisibleMonthlyPrTypes(post)) {
    (isNegativePrType(type) ? monthlyWorst : monthlyBest).push({ type, scope: 'monthly' });
  }
  return [...lifetimeBest, ...monthlyBest, ...lifetimeWorst, ...monthlyWorst];
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

/** Format margin vs #2 — bests as +time/+%, worsts as -time/-%. */
export function formatPrDiffLabel(
  type: string,
  value: number,
  formatMins: (n: number) => string,
  formatPct: (n: number) => string,
): string {
  if (value <= 0) return '';
  const mag = isPercentPrType(type) ? formatPct(value) : formatMins(value);
  return isNegativePrType(type) ? `-${mag}` : `+${mag}`;
}

export function hasVisiblePrBadges(post: PrBadgePost): boolean {
  return (post.prTypes?.length ?? 0) > 0 || getVisibleMonthlyPrTypes(post).length > 0;
}
