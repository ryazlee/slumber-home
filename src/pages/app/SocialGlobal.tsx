import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import ChallengePlaceBadge from '../../components/ChallengePlaceBadge';
import UserListRowsSkeleton from '../../components/UserListRowsSkeleton';
import { useGlobalSleepLeaderboard } from '../../hooks/useGlobalSleepLeaderboard';
import { formatPct } from '../../lib/format';
import type {
  GlobalLeaderboardEntry,
  GlobalLeaderboardMetric,
} from '../../lib/globalLeaderboard';
import { stageColor } from '../../lib/stageColors';

const METRICS: {
  key: GlobalLeaderboardMetric;
  label: string;
  subtitle: string;
}[] = [
  {
    key: 'deepPct',
    label: 'Deep %',
    subtitle: 'Share of asleep time in deep sleep',
  },
  {
    key: 'remPct',
    label: 'REM %',
    subtitle: 'Share of asleep time in REM',
  },
  {
    key: 'corePct',
    label: 'Core %',
    subtitle: 'Share of asleep time in core / light',
  },
  {
    key: 'avgHours',
    label: 'Avg hours',
    subtitle: 'Average nightly asleep time',
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
  return 'var(--accent)';
}

function LeaderboardRow({
  rank,
  entry,
  metric,
}: {
  rank: number;
  entry: GlobalLeaderboardEntry;
  metric: GlobalLeaderboardMetric;
}) {
  const accent = accentForMetric(metric);

  return (
    <Link
      to={`/profile/${entry.userId}`}
      className="social-row social-row--link social-row--compact social-row--leaderboard"
    >
      <Avatar
        userId={entry.userId}
        username={entry.username}
        avatarUrl={entry.avatarUrl ?? undefined}
      />
      <span className="social-row-main">
        <span className="social-row-title-row">
          <ChallengePlaceBadge place={rank} compact />
          <span className="social-row-title">@{entry.username}</span>
        </span>
        <span className="social-row-meta">
          {entry.nights} night{entry.nights === 1 ? '' : 's'}
        </span>
      </span>
      <span className="global-lb-value" style={{ color: accent }}>
        {formatMetric(metric, entry.value)}
      </span>
    </Link>
  );
}

export default function SocialGlobal() {
  const [metric, setMetric] = useState<GlobalLeaderboardMetric>('deepPct');
  const { data, isLoading, isError, refetch, isFetching } = useGlobalSleepLeaderboard(true);

  const activeMeta = METRICS.find((m) => m.key === metric) ?? METRICS[0];
  const entries = useMemo(() => {
    if (!data) return [];
    return data[metric] ?? [];
  }, [data, metric]);

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
  if (!anyEntries) {
    return (
      <section className="app-section social-section">
        <p className="social-empty app-muted">
          No rankings yet. Need at least {data?.minNights ?? 7} wearable nights in the last{' '}
          {data?.days ?? 60} days.
        </p>
      </section>
    );
  }

  return (
    <section className="app-section social-section global-lb">
      <div className="global-lb-header">
        <div className="global-lb-chips" role="tablist" aria-label="Leaderboard metrics">
          {METRICS.map((m) => {
            const active = m.key === metric;
            const accent = accentForMetric(m.key);
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`global-lb-chip${active ? ' global-lb-chip--active' : ''}`}
                style={active ? { borderColor: accent, color: accent } : undefined}
                onClick={() => setMetric(m.key)}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <p className="global-lb-subtitle">{activeMeta.subtitle}</p>
        <p className="global-lb-intro app-muted">
          Top 10 over the last {data?.days ?? 60} days · wearable nights only
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="social-empty app-muted">
          No {activeMeta.label} rankings yet for this metric.
        </p>
      ) : (
        <div className="social-list social-list--leaderboard">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={`${metric}-${entry.userId}`}
              rank={index + 1}
              entry={entry}
              metric={metric}
            />
          ))}
        </div>
      )}
    </section>
  );
}
