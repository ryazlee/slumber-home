import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  useAppVersions,
  useCohortRetention,
  useHealthMetrics,
  useRepairInflatedStages,
} from '../../hooks/useAdmin';
import AdminCohortChart from './AdminCohortChart';
import AdminMetricCard from './AdminMetricCard';
import AdminSubsection from './AdminSubsection';
import AdminVersionChart from './AdminVersionChart';
import { formatNumber, metricDelta } from './format';

type HealthWindow = 1 | 7 | 30;

const HEALTH_WINDOW_CHIPS: { days: HealthWindow; label: string }[] = [
  { days: 1, label: 'Day' },
  { days: 7, label: 'Week' },
  { days: 30, label: 'Month' },
];

function pct(part: number, whole: number): string {
  if (!whole) return '0%';
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

function healthWindowLabel(days: number): string {
  if (days === 1) return '1 day';
  return `${days} days`;
}

function priorPeriodLabel(days: HealthWindow): string {
  if (days === 1) return 'vs prior day';
  if (days === 7) return 'vs prior week';
  return 'vs prior 30d';
}

function deltaProps(
  current: number,
  previous: number | undefined,
  label: string,
  invertDelta = false,
) {
  const delta = metricDelta(current, previous);
  if (delta == null || previous == null) return {};
  return { delta, previous, deltaLabel: label, invertDelta };
}

export default function AdminHealthSnapshot() {
  const { metrics } = useAdmin();
  const [windowDays, setWindowDays] = useState<HealthWindow>(7);
  const healthQuery = useHealthMetrics(windowDays);
  const versionsQuery = useAppVersions();
  const cohortQuery = useCohortRetention(8);
  const repairMutation = useRepairInflatedStages();

  const health = healthQuery.data ?? null;
  const versions = versionsQuery.data ?? [];
  const cohort = cohortQuery.data ?? [];
  const pendingReports = (metrics?.pending_post_reports ?? 0) + (metrics?.pending_comment_reports ?? 0);
  const windowLabel = healthWindowLabel(windowDays);

  const dreamRate = health && health.engagement.posts > 0
    ? pct(health.engagement.posts_with_dreams, health.engagement.posts)
    : '—';
  const postsPerActive = health && health.engagement.active_posters > 0
    ? (health.engagement.posts / health.engagement.active_posters).toFixed(1)
    : '—';
  const wauMau = health && health.retention.mau > 0
    ? pct(health.retention.wau, health.retention.mau)
    : '—';
  const inflatedWindow = health?.data_quality.inflated_stage_posts_window ?? 0;
  const inflatedTotal = health?.data_quality.inflated_stage_posts_total ?? 0;
  const previous = health?.previous;
  const vsPrior = priorPeriodLabel(windowDays);

  const repairAllInflated = async () => {
    if (!window.confirm(
      `Repair up to 50 inflated wearable posts${inflatedWindow ? ` from the last ${windowLabel}` : ''}?`,
    )) return;
    try {
      const result = await repairMutation.mutateAsync({ limit: 50, days: windowDays });
      const failed = result.errors.length;
      window.alert(
        failed
          ? `Repaired ${result.fixed}, unchanged ${result.skipped}, failed ${failed}.`
          : `Repaired ${result.fixed} post(s)${result.skipped ? ` · ${result.skipped} unchanged` : ''}.`,
      );
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : 'Repair failed.');
    }
  };

  return (
    <div className="admin-home admin-analytics-panel">
      {pendingReports > 0 ? (
        <Link to="/admin/reports" className="admin-attention-banner">
          <span className="admin-attention-banner-title">
            {pendingReports} report{pendingReports === 1 ? '' : 's'} need review
          </span>
          <span className="admin-attention-banner-action">Open reports →</span>
        </Link>
      ) : null}

      <div
        className={`admin-analytics-bar${healthQuery.isFetching ? ' admin-analytics-bar--loading' : ''}`}
        aria-busy={healthQuery.isFetching || undefined}
      >
        <div className="admin-tabs admin-tabs-sub" role="group" aria-label="Health window">
          {HEALTH_WINDOW_CHIPS.map((item) => (
            <button
              key={item.days}
              type="button"
              className={windowDays === item.days ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setWindowDays(item.days)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {inflatedWindow > 0 ? (
        <div className="admin-attention-banner admin-attention-banner--inline">
          <span className="admin-attention-banner-title">
            {inflatedWindow} wearable post{inflatedWindow === 1 ? '' : 's'} in the last {windowLabel} have inflated stage minutes
            {inflatedTotal > inflatedWindow ? ` (${inflatedTotal} total)` : ''}
          </span>
          <span className="admin-attention-banner-actions">
            <Link to="/admin/posts" className="admin-attention-banner-action">Browse posts</Link>
            <button
              type="button"
              className="admin-button admin-button-sm admin-button-ghost"
              disabled={repairMutation.isPending}
              onClick={() => void repairAllInflated()}
            >
              {repairMutation.isPending ? 'Repairing…' : 'Repair 50'}
            </button>
          </span>
        </div>
      ) : null}

      {health ? (
        <>
          <AdminSubsection title={`Activation (${windowLabel})`} className="admin-health-block">
            <div className="admin-metric-grid admin-metric-grid--dense">
              <AdminMetricCard
                label="Signups"
                value={health.activation.signups}
                sub={`${health.activation.first_time_posters} first-time posters`}
                to="/admin/users?filter=new"
                {...deltaProps(health.activation.signups, previous?.activation.signups, vsPrior)}
              />
              <AdminMetricCard
                label="Never logged sleep"
                value={health.activation.never_posted_in_window}
                sub={health.activation.never_posted_in_window > 0 ? 'View users' : 'In signup window'}
                to="/admin/users?filter=never-posted"
                {...deltaProps(
                  health.activation.never_posted_in_window,
                  previous?.activation.never_posted_in_window,
                  vsPrior,
                  true,
                )}
              />
              <AdminMetricCard
                label="Inactive posters"
                value={health.activation.inactive_posters}
                sub="No post in 14 days"
                to="/admin/users?filter=inactive"
              />
              <AdminMetricCard
                label="Never posted (all time)"
                value={health.activation.never_posted_total}
                sub="Accounts with zero sleep logs"
                to="/admin/users?filter=never-posted"
              />
            </div>
          </AdminSubsection>

          <AdminSubsection title={`Engagement (${windowLabel})`} className="admin-health-block">
            <div className="admin-metric-grid admin-metric-grid--dense">
              <AdminMetricCard
                label="Sleep posts"
                value={health.engagement.posts}
                sub={`${health.engagement.wearable_posts} wearable · ${health.engagement.manual_posts} manual`}
                to="/admin/posts"
                {...deltaProps(health.engagement.posts, previous?.engagement.posts, vsPrior)}
              />
              <AdminMetricCard
                label="Active posters"
                value={health.engagement.active_posters}
                sub={`${postsPerActive} posts per poster`}
                to="/admin/users"
                {...deltaProps(health.engagement.active_posters, previous?.engagement.active_posters, vsPrior)}
              />
              <AdminMetricCard
                label="Dream log rate"
                value={dreamRate}
                sub={`${health.engagement.posts_with_dreams} with dream text`}
                to="/admin/dreams"
              />
              <AdminMetricCard
                label="Push enabled"
                value={health.engagement.users_with_push}
                sub="Users with device tokens"
              />
            </div>
          </AdminSubsection>

          <AdminSubsection title="Retention & social" className="admin-health-block">
            <div className="admin-metric-grid admin-metric-grid--dense">
              <AdminMetricCard
                label="WAU / MAU"
                value={wauMau}
                sub={`${health.retention.wau} weekly · ${health.retention.mau} monthly posters`}
              />
              {metrics ? (
                <>
                  <AdminMetricCard
                    label="Friendships"
                    value={metrics.friendships}
                    sub={`${metrics.pending_friend_requests} pending requests`}
                  />
                  <AdminMetricCard
                    label="Challenges"
                    value={metrics.active_challenges}
                    sub={`${metrics.pending_challenges} pending`}
                    to="/admin/community"
                  />
                  <AdminMetricCard
                    label="Premium"
                    value={metrics.premium_users}
                    sub={`${metrics.total_users ? pct(metrics.premium_users, metrics.total_users) : '0%'} of ${formatNumber(metrics.total_users)} users`}
                    to="/admin/premium"
                  />
                </>
              ) : null}
            </div>
          </AdminSubsection>
        </>
      ) : (
        <p className="admin-muted">Loading health metrics…</p>
      )}

      <div className="admin-chart-grid admin-chart-grid--pair">
        <AdminVersionChart versions={versions} />
        <AdminCohortChart rows={cohort} />
      </div>
    </div>
  );
}
