import { useMemo, useState } from 'react';
import ChallengePlaceBadge from '../../components/ChallengePlaceBadge';
import UserLink from '../../components/UserLink';
import UserListRowsSkeleton from '../../components/UserListRowsSkeleton';
import { useAuth } from '../../context/AuthContext';
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
    key: 'avgHours',
    label: 'Average hours',
    subtitle: 'Average nightly asleep time',
  },
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
  if (delta == null) return <span className="global-lb-delta global-lb-delta--new">NEW</span>;
  if (delta === 0) return <span className="global-lb-delta global-lb-delta--flat">—</span>;
  const up = delta > 0;
  return (
    <span className={`global-lb-delta${up ? ' global-lb-delta--up' : ' global-lb-delta--down'}`}>
      {up ? `↑${delta}` : `↓${Math.abs(delta)}`}
    </span>
  );
}

export default function SocialGlobal() {
  const { user } = useAuth();
  const [metric, setMetric] = useState<GlobalLeaderboardMetric>('avgHours');
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
          No rankings yet. Need at least {data?.minNights ?? 5} wearable nights in the last{' '}
          {data?.days ?? 60} days.
        </p>
      </section>
    );
  }

  return (
    <section className="app-section social-section global-lb">
      <div className="global-lb-header">
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
        <p className="global-lb-subtitle">{activeMeta.subtitle}</p>
        <p className="global-lb-intro app-muted">
          Top 10 over the last {data?.days ?? 60} days · vs yesterday · wearable nights only
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="social-empty app-muted">
          No {activeMeta.label} rankings yet for this metric.
        </p>
      ) : (
        <div className="challenge-progress-list">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={`${metric}-${entry.userId}`}
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
