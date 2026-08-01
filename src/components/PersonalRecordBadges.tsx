import { useMemo } from 'react';
import { formatMins, formatPct } from '../lib/format';
import {
  PR_LABELS,
  formatPrDiffLabel,
  isNegativePrType,
  orderPrBadgeChips,
  type PRDiffs,
} from '../lib/pr';
import { computeMonthlyPrDiffs } from '../lib/prDiffs';
import { diff } from '../lib/diff';
import { useLifetimeStats } from '../hooks/useStats';
import type { SleepPost } from '../lib/types';

type Props = {
  post: Pick<
    SleepPost,
    'userId' | 'sleepDate' | 'prTypes' | 'monthlyPrTypes' | 'monthPostCount' | 'isPR'
  >;
};

function formatPrDiff(type: string, value: number): string {
  return formatPrDiffLabel(type, value, formatMins, formatPct);
}

function stagePct(stageMinutes: number, asleepMinutes: number): number {
  if (asleepMinutes <= 0 || stageMinutes <= 0) return 0;
  return (stageMinutes / asleepMinutes) * 100;
}

function prEmoji(type: string, scope: 'all-time' | 'monthly'): string {
  if (isNegativePrType(type)) return '🧊';
  return scope === 'monthly' ? '🥇' : '🏆';
}

function prLabel(type: string, scope: 'all-time' | 'monthly'): string {
  const base = PR_LABELS[type] ?? type;
  return scope === 'monthly' ? `Monthly ${base}` : base;
}

export default function PersonalRecordBadges({ post }: Props) {
  const chips = useMemo(() => orderPrBadgeChips(post), [post]);
  const { data: lifetime } = useLifetimeStats(chips.length > 0 ? post.userId : null);

  const allTimePrDiffs = useMemo<PRDiffs>(() => {
    if (!lifetime) return {} as PRDiffs;
    const shortest = lifetime.shortestNights.map((n) => n.asleepMinutes).filter((v) => v > 0);
    return {
      longest_sleep: diff(lifetime.bestNights.map((n) => n.asleepMinutes)),
      shortest_sleep: shortest.length >= 2 ? shortest[1] - shortest[0] : 0,
      most_deep_sleep: diff(lifetime.mostDeepNights.map((n) => n.deepMinutes)),
      most_rem: diff(lifetime.mostRemNights.map((n) => n.remMinutes)),
      most_core_sleep: diff(lifetime.mostCoreNights.map((n) => n.coreMinutes)),
      highest_deep_pct: diff(
        lifetime.highestDeepPctNights.map((n) => stagePct(n.deepMinutes, n.asleepMinutes)),
      ),
      highest_rem_pct: diff(
        lifetime.highestRemPctNights.map((n) => stagePct(n.remMinutes, n.asleepMinutes)),
      ),
      highest_core_pct: diff(
        lifetime.highestCorePctNights.map((n) => stagePct(n.coreMinutes, n.asleepMinutes)),
      ),
      lowest_deep_pct: (() => {
        const vals = lifetime.lowestDeepPctNights
          .map((n) => stagePct(n.deepMinutes, n.asleepMinutes))
          .filter((v) => v > 0)
          .sort((a, b) => a - b);
        return vals.length >= 2 ? vals[1] - vals[0] : 0;
      })(),
      lowest_rem_pct: (() => {
        const vals = lifetime.lowestRemPctNights
          .map((n) => stagePct(n.remMinutes, n.asleepMinutes))
          .filter((v) => v > 0)
          .sort((a, b) => a - b);
        return vals.length >= 2 ? vals[1] - vals[0] : 0;
      })(),
      lowest_core_pct: (() => {
        const vals = lifetime.lowestCorePctNights
          .map((n) => stagePct(n.coreMinutes, n.asleepMinutes))
          .filter((v) => v > 0)
          .sort((a, b) => a - b);
        return vals.length >= 2 ? vals[1] - vals[0] : 0;
      })(),
    };
  }, [lifetime]);

  const monthlyPrDiffs = useMemo<PRDiffs>(() => {
    if (!lifetime) return {} as PRDiffs;
    return computeMonthlyPrDiffs(lifetime.stageNights, post.sleepDate);
  }, [lifetime, post.sleepDate]);

  if (chips.length === 0) return null;

  return (
    <div className="post-pr-badges">
      {chips.map(({ type, scope }) => {
        const negative = isNegativePrType(type);
        const diffs = scope === 'monthly' ? monthlyPrDiffs : allTimePrDiffs;
        const diffLabel = formatPrDiff(type, diffs[type] ?? 0);
        const tone = negative ? 'negative' : scope === 'monthly' ? 'monthly' : 'alltime';
        return (
          <span
            key={`${scope}-${type}`}
            className={`post-pr-badge post-pr-badge--${tone}`}
          >
            {prEmoji(type, scope)} {prLabel(type, scope)}
            {diffLabel ? <span className="post-pr-diff">{diffLabel}</span> : null}
          </span>
        );
      })}
    </div>
  );
}
