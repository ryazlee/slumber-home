import { useMemo, useState } from 'react';
import ChallengePlaceBadge from '../../components/ChallengePlaceBadge';
import UserLink from '../../components/UserLink';
import UserListRowsSkeleton from '../../components/UserListRowsSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useGlobalSleepLeaderboard } from '../../hooks/useGlobalSleepLeaderboard';
import { formatPct } from '../../lib/format';
import {
  LEADERBOARD_PERIODS,
  leaderboardPeriodConfig,
  type GlobalLeaderboardEntry,
  type GlobalLeaderboardMetric,
  type GlobalLeaderboardPeriod,
} from '../../lib/globalLeaderboard';
import { stageColor } from '../../lib/stageColors';

const METRICS: {
  key: GlobalLeaderboardMetric;
  label: string;
  subtitle: string;
}[] = [
  {
    key: 'avgHours',
    label: 'Avg hours',
    subtitle: 'Average nightly asleep time',
  },
  {
    key: 'deepPct',
    label: 'Avg Deep %',
    subtitle: 'Share of asleep time in deep sleep',
  },
  {
    key: 'remPct',
    label: 'Avg REM %',
    subtitle: 'Share of asleep time in REM',
  },
  {
    key: 'corePct',
    label: 'Avg Core %',
    subtitle: 'Share of asleep time in core / light',
  },
  {
    key: 'dreamRate',
    label: 'Dream rate',
    subtitle: 'Share of nights with a dream journal entry',
  },
];

function formatMetric(key: GlobalLeaderboardMetric, value: number): string {
  if (key === 'avgHours') {
    const whole = Math.floor(value);
    const mins = Math.round((value - whole) * 60);
    if (mins <= 0) return `${whole}h`;
    return `${whole}h ${mins}m`;
  }
  return formatPct(value);
}

function accentForMetric(key: GlobalLeaderboardMetric): string {
  if (key === 'deepPct') return stageColor('deep');
  if (key === 'remPct') return stageColor('rem');
  if (key === 'corePct') return stageColor('core');
  if (key === 'dreamRate') return 'var(--dream-good)';
  return 'var(--accent)';
}

function emptyCopy(
  period: GlobalLeaderboardPeriod,
  minNights: number,
  days: number | null | undefined,
): string {
  if (period === 'all_time' || days == null) {
    return `No rankings yet. Need at least ${minNights} wearable nights all-time.`;
  }
  return `No rankings yet. Need at least ${minNights} wearable nights in the rolling last ${days} days.`;
}

function LeaderboardRow({
  rank,
  entry,
  metric,
  isMe,
}: {
  rank: number;
  entry: GlobalLeaderboardEntry;
  metric: GlobalLeaderboardMetric;
  isMe: boolean;
}) {
  const accent = accentForMetric(metric);
  const valueColor = isMe ? 'var(--accent)' : accent;

  return (
    <div className={`challenge-progress-row${isMe ? ' challenge-progress-row--me' : ''}`}>
      <div className="challenge-progress-top global-lb-row-top">
        <div className="global-lb-place">
          <ChallengePlaceBadge
            place={rank}
            compact
            fallbackColor={isMe ? 'var(--accent)' : 'var(--text-dim)'}
          />
          <RankDelta delta={entry.rankDelta} />
        </div>
        <UserLink
          userId={entry.userId}
          username={entry.username}
          avatarUrl={entry.avatarUrl ?? undefined}
          userRoles={entry.userRoles}
          showAvatar
          avatarSize="sm"
          showStreak={false}
          className="challenge-progress-name"
        />
        <span className="challenge-progress-stats global-lb-stats">
          <span style={{ color: valueColor }}>{formatMetric(metric, entry.value)}</span>
          <span className="global-lb-nights">
            {entry.nights} night{entry.nights === 1 ? '' : 's'}
          </span>
        </span>
      </div>
    </div>
  );
}

function RankDelta({ delta }: { delta: number | null }) {
  // Only surface real place movement; hide flat (—) and first-time NEW.
  if (delta == null || delta === 0) return null;
  const up = delta > 0;
  return (
    <span className={`global-lb-delta${up ? ' global-lb-delta--up' : ' global-lb-delta--down'}`}>
      {up ? `↑${delta}` : `↓${Math.abs(delta)}`}
    </span>
  );
}

export default function SocialGlobal() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<GlobalLeaderboardPeriod>('all_time');
  const [metric, setMetric] = useState<GlobalLeaderboardMetric>('avgHours');
  const { data, isLoading, isError, refetch, isFetching } = useGlobalSleepLeaderboard(true, period);

  const periodConfig = leaderboardPeriodConfig(period);
  const activeMeta = METRICS.find((m) => m.key === metric) ?? METRICS[0];
  const entries = useMemo(() => {
    if (!data) return [];
    const list = data[metric] ?? [];
    // Deep / REM / Core / dream: omit 0% (matches RPC 148; also safe pre-migration).
    if (metric !== 'avgHours') {
      return list.filter((entry) => entry.value > 0);
    }
    return list;
  }, [data, metric]);

  const resolvedDays = data?.days ?? periodConfig.days;
  const minNights = data?.minNights ?? periodConfig.minNights;

  const periodSwitcher = (
    <div className="global-lb-periods" role="tablist" aria-label="Leaderboard period">
      {LEADERBOARD_PERIODS.map((p) => {
        const active = period === p.key;
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`global-lb-period${active ? ' global-lb-period--active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );

  const metricSwitcher = (
    <div className="global-lb-chip-scroll">
      <div className="global-lb-chips" role="tablist" aria-label="Leaderboard metrics">
        {METRICS.map((m) => {
          const active = m.key === metric;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`global-lb-chip${active ? ' global-lb-chip--active' : ''}`}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isLoading && !data) {
    return (
      <section className="app-section social-section">
        <UserListRowsSkeleton rows={6} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="app-section social-section">
        {periodSwitcher}
        <p className="admin-error">Couldn’t load rankings.</p>
        <button
          type="button"
          className="social-btn social-btn--ghost"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </section>
    );
  }

  const anyEntries = METRICS.some((m) => (data?.[m.key]?.length ?? 0) > 0);

  return (
    <section className="app-section social-section global-lb">
      <div className="global-lb-header">
        {periodSwitcher}
        {metricSwitcher}
        <p className="global-lb-subtitle">{activeMeta.subtitle}</p>
      </div>

      {!anyEntries ? (
        <p className="social-empty app-muted">
          {emptyCopy(period, minNights, resolvedDays)}
        </p>
      ) : entries.length === 0 ? (
        <p className="social-empty app-muted">
          No {activeMeta.label} rankings yet for this metric.
        </p>
      ) : (
        <div className="challenge-progress-list">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={`${period}-${metric}-${entry.userId}`}
              rank={index + 1}
              entry={entry}
              metric={metric}
              isMe={entry.userId === user?.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
