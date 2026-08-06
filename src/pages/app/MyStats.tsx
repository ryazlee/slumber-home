import { useMemo } from 'react';
import StatsScreenSkeleton from '../../components/StatsScreenSkeleton';
import { useQueryClient } from '@tanstack/react-query';
import StatsInsightChips from '../../components/stats/StatsInsightChips';
import StatsPeriodMetrics from '../../components/stats/StatsPeriodMetrics';
import StatsPrStrip from '../../components/stats/StatsPrStrip';
import StatsStageMix from '../../components/stats/StatsStageMix';
import StatsTopList from '../../components/stats/StatsTopList';
import StatsWeekChart from '../../components/stats/StatsWeekChart';
import { useAuth } from '../../context/AuthContext';
import { useComparePeriods } from '../../hooks/useCompare';
import { useLifetimeStats, useUserStats } from '../../hooks/useStats';
import { queryKeys } from '../../hooks/queryKeys';
import {
  chronotypeInsight,
  consistencyInsight,
  dreamInsight,
  weekVsMonthInsight,
} from '../../lib/statsInsights';
import { buildMonthMetrics } from '../../lib/statsMetrics';
import { resolvePctPr, resolvePr } from '../../lib/statsPr';
import { stageColor } from '../../lib/stageColors';
import { formatMins, formatPct } from '../../lib/format';
import { getQueryErrorMessage } from '../../lib/queryError';

export default function MyStats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id ?? null;

  const {
    data: stats,
    isLoading,
    isRefetching,
    isError: isStatsError,
    error: statsError,
  } = useUserStats(userId);

  const {
    data: lifetime,
    isError: isLifetimeError,
    error: lifetimeError,
  } = useLifetimeStats(userId);

  const { data: compare } = useComparePeriods(userId);

  const insightChips = useMemo(() => {
    if (!stats) return [];
    const chips = [];
    const weekTrend = weekVsMonthInsight(stats.avgAsleepMinutes, compare?.month?.asleep ?? null);
    if (weekTrend) chips.push(weekTrend);
    const consistency = consistencyInsight(stats.weeklyPosts);
    if (consistency) chips.push(consistency);
    const chrono = chronotypeInsight(compare?.month?.avgBedtime ?? lifetime?.avgBedtime ?? null);
    if (chrono) chips.push(chrono);
    const dream = dreamInsight(compare?.month?.dreamRate ?? null, compare?.month?.dreamsCount ?? null);
    if (dream) chips.push(dream);
    return chips;
  }, [stats, compare, lifetime]);

  const monthMetrics = useMemo(
    () => buildMonthMetrics(compare?.month ?? null),
    [compare?.month],
  );

  const personalRecordSections = useMemo(() => {
    if (!stats) return [];
    const best = lifetime?.bestNights[0];
    const shortest = lifetime?.shortestNights[0];
    const wakes = lifetime?.mostWakesNights[0];
    const deep = lifetime?.mostDeepNights[0];
    const rem = lifetime?.mostRemNights[0];
    const core = lifetime?.mostCoreNights[0];
    const deepPct = lifetime?.highestDeepPctNights[0];
    const remPct = lifetime?.highestRemPctNights[0];
    const corePct = lifetime?.highestCorePctNights[0];
    const lowDeepPct = lifetime?.lowestDeepPctNights[0];
    const lowRemPct = lifetime?.lowestRemPctNights[0];
    const lowCorePct = lifetime?.lowestCorePctNights[0];
    const formatCount = (v: number) => String(Math.round(v));

    return [
      {
        title: 'Highlights',
        kind: 'best' as const,
        items: [
          { emoji: '🏆', label: 'Longest sleep', pr: resolvePr(stats.prLongestSleep, best, 'asleepMinutes'), format: formatMins, tone: 'best' as const, featured: true },
          { emoji: '💜', label: 'Most deep', pr: resolvePr(stats.prMostDeep, deep, 'deepMinutes'), format: formatMins, tone: 'deep' as const },
          { emoji: '💗', label: 'Most REM', pr: resolvePr(stats.prMostRem, rem, 'remMinutes'), format: formatMins, tone: 'rem' as const },
          { emoji: '💙', label: 'Most core', pr: resolvePr(stats.prMostCore, core, 'coreMinutes'), format: formatMins, tone: 'core' as const },
          { emoji: '💜', label: 'Highest deep %', pr: resolvePctPr(stats.prHighestDeepPct, deepPct, 'deepMinutes'), format: formatPct, tone: 'deep' as const },
          { emoji: '💗', label: 'Highest REM %', pr: resolvePctPr(stats.prHighestRemPct, remPct, 'remMinutes'), format: formatPct, tone: 'rem' as const },
          { emoji: '💙', label: 'Highest core %', pr: resolvePctPr(stats.prHighestCorePct, corePct, 'coreMinutes'), format: formatPct, tone: 'core' as const },
        ],
      },
      {
        title: 'Rough nights',
        kind: 'rough' as const,
        items: [
          { emoji: '🧊', label: 'Lowest deep %', pr: resolvePctPr(stats.prLowestDeepPct, lowDeepPct, 'deepMinutes'), format: formatPct, tone: 'deep' as const },
          { emoji: '🧊', label: 'Lowest REM %', pr: resolvePctPr(stats.prLowestRemPct, lowRemPct, 'remMinutes'), format: formatPct, tone: 'rem' as const },
          { emoji: '🧊', label: 'Lowest core %', pr: resolvePctPr(stats.prLowestCorePct, lowCorePct, 'coreMinutes'), format: formatPct, tone: 'core' as const },
          { emoji: '⏱️', label: 'Shortest sleep', pr: resolvePr(stats.prShortestSleep, shortest, 'asleepMinutes'), format: formatMins, tone: 'rough' as const },
          { emoji: '😵', label: 'Most wakes', pr: resolvePr(stats.prMostWakes, wakes, 'awakeEvents'), format: formatCount, tone: 'awake' as const },
        ],
      },
    ];
  }, [stats, lifetime]);

  const onRefresh = () => {
    if (!userId) return;
    qc.invalidateQueries({ queryKey: queryKeys.userStats(userId) });
    qc.invalidateQueries({ queryKey: queryKeys.lifetimeStats(userId) });
    qc.invalidateQueries({ queryKey: queryKeys.comparePeriods(userId) });
  };

  if (isLoading && !isRefetching) {
    return <StatsScreenSkeleton />;
  }

  if (isStatsError || isLifetimeError) {
    const message = getQueryErrorMessage(statsError ?? lifetimeError, 'Failed to load stats');
    return (
      <div className="stats-error">
        <p className="admin-error">{message}</p>
        <button type="button" className="stats-refresh-btn" onClick={onRefresh}>Try again</button>
      </div>
    );
  }

  return (
    <div className="my-stats">
      <div className="my-stats-toolbar">
        <button type="button" className="stats-refresh-btn" onClick={onRefresh} disabled={isRefetching}>
          {isRefetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {insightChips.length > 0 ? (
        <section className="stats-section">
          <h2 className="stats-section-label">Insights</h2>
          <StatsInsightChips insights={insightChips} />
        </section>
      ) : null}

      {stats ? (
        <section className="stats-section">
          <h2 className="stats-section-label">This week</h2>
          <StatsWeekChart posts={stats.weeklyPosts} />
        </section>
      ) : null}

      {monthMetrics.length > 0 ? (
        <StatsPeriodMetrics metrics={monthMetrics} />
      ) : null}

      {compare?.month ? (
        <StatsStageMix
          deepPct={compare.month.deepPct}
          remPct={compare.month.remPct}
          corePct={compare.month.corePct}
        />
      ) : null}

      {(stats || lifetime) ? (
        <section className="stats-section">
          <h2 className="stats-section-label">Personal records</h2>
          {stats ? <StatsPrStrip sections={personalRecordSections} /> : null}
          {lifetime ? (
            <div className="stats-lifetime-summary">
              <div className="stats-summary-row">
                <div className="stats-summary-card">
                  <span className="stats-summary-value">{lifetime.totalNights}</span>
                  <span className="stats-summary-label">Nights</span>
                </div>
                <div className="stats-summary-card">
                  <span className="stats-summary-value">{formatMins(lifetime.avgAsleepMinutes)}</span>
                  <span className="stats-summary-label">Avg Sleep</span>
                </div>
                <div className="stats-summary-card">
                  <span className="stats-summary-value">{stats?.longestStreak ?? 0}</span>
                  <span className="stats-summary-label">Best Streak</span>
                </div>
              </div>
              {(lifetime.avgBedtime || lifetime.avgWakeTime) ? (
                <div className="stats-summary-row">
                  <div className="stats-summary-card">
                    <span className="stats-summary-value">{lifetime.avgBedtime ?? '—'}</span>
                    <span className="stats-summary-label">Avg Bedtime</span>
                  </div>
                  <div className="stats-summary-card">
                    <span className="stats-summary-value">{lifetime.avgWakeTime ?? '—'}</span>
                    <span className="stats-summary-label">Avg Wake-up</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {lifetime && lifetime.monthlyBests.length > 0 ? (
        <section className="stats-section">
          <h2 className="stats-section-label">Monthly Bests</h2>
          <div className="stats-table-scroll">
            <div className="stats-table-card stats-table-card--wide">
              <div className="stats-table-row stats-table-row--header">
                <span className="stats-table-cell stats-table-cell--label">Month</span>
                <span className="stats-table-cell" style={{ color: 'var(--accent)' }}>Sleep</span>
                <span className="stats-table-cell" style={{ color: stageColor('core') }}>Core</span>
                <span className="stats-table-cell" style={{ color: stageColor('deep') }}>Deep</span>
                <span className="stats-table-cell" style={{ color: stageColor('rem') }}>REM</span>
                <span className="stats-table-cell">Wakes</span>
              </div>
              {lifetime.monthlyBests.map((m) => (
                <div key={m.month} className="stats-table-row">
                  <span className="stats-table-cell stats-table-cell--label">{m.label}</span>
                  <span className="stats-table-cell" style={{ color: 'var(--accent)' }}>{formatMins(m.asleepMinutes)}</span>
                  <span className="stats-table-cell" style={{ color: stageColor('core') }}>
                    {m.coreMinutes > 0
                      ? `${formatMins(m.coreMinutes)}${m.corePct != null ? ` · ${formatPct(m.corePct)}` : ''}`
                      : '—'}
                  </span>
                  <span className="stats-table-cell" style={{ color: stageColor('deep') }}>
                    {m.deepMinutes > 0
                      ? `${formatMins(m.deepMinutes)}${m.deepPct != null ? ` · ${formatPct(m.deepPct)}` : ''}`
                      : '—'}
                  </span>
                  <span className="stats-table-cell" style={{ color: stageColor('rem') }}>
                    {m.remMinutes > 0
                      ? `${formatMins(m.remMinutes)}${m.remPct != null ? ` · ${formatPct(m.remPct)}` : ''}`
                      : '—'}
                  </span>
                  <span className="stats-table-cell">
                    {m.avgAwakeEvents != null ? m.avgAwakeEvents : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {lifetime && lifetime.monthlyBests.some((m) => m.avgBedtime || m.avgWakeTime) ? (
        <section className="stats-section">
          <h2 className="stats-section-label">Monthly Timing</h2>
          <div className="stats-table-card">
            <div className="stats-table-row stats-table-row--header">
              <span className="stats-table-cell stats-table-cell--label">Month</span>
              <span className="stats-table-cell">Avg Bed</span>
              <span className="stats-table-cell">Avg Wake</span>
            </div>
            {lifetime.monthlyBests.map((m) => (
              <div key={`${m.month}-timing`} className="stats-table-row">
                <span className="stats-table-cell stats-table-cell--label">{m.label}</span>
                <span className="stats-table-cell">{m.avgBedtime ?? '—'}</span>
                <span className="stats-table-cell">{m.avgWakeTime ?? '—'}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="stats-section">
        <h2 className="stats-section-label">Streaks</h2>
        <div className="stats-card stats-streak-card">
          <div className="stats-streak-row">
            <span className="stats-streak-emoji" aria-hidden>🔥</span>
            <span className="stats-streak-label">Log streak</span>
            <span className="stats-streak-value">{stats?.currentStreak ?? 0} nights</span>
          </div>
          <div className="stats-streak-row">
            <span className="stats-streak-emoji" aria-hidden>📈</span>
            <span className="stats-streak-label">Best log streak</span>
            <span className="stats-streak-value">{stats?.longestStreak ?? 0} nights</span>
          </div>
        </div>
      </section>

      {lifetime ? (
        <section className="stats-section">
          <h2 className="stats-section-label">All-Time Records</h2>
          <StatsTopList
            title="Best Nights"
            emoji="💤"
            nights={lifetime.bestNights}
            valueKey="asleepMinutes"
            accentColor="var(--accent)"
          />
          <StatsTopList
            title="Most Deep Sleep"
            emoji="💜"
            nights={lifetime.mostDeepNights}
            valueKey="deepMinutes"
            accentColor={stageColor('deep')}
          />
          <StatsTopList
            title="Most REM"
            emoji="💗"
            nights={lifetime.mostRemNights}
            valueKey="remMinutes"
            accentColor={stageColor('rem')}
          />
          <StatsTopList
            title="Most Core Sleep"
            emoji="💙"
            nights={lifetime.mostCoreNights}
            valueKey="coreMinutes"
            accentColor={stageColor('core')}
          />
        </section>
      ) : null}
    </div>
  );
}
