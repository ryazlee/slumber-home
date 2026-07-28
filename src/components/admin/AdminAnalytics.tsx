import { useMemo, useState } from 'react';
import {
  type AdminTagRow,
  type AnalyticsFilters,
  type AnalyticsMetrics,
  type DailyActivityRow,
} from '../../lib/admin';
import { formatRangeLabel } from '../../lib/analyticsRange';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useAdminAnalyticsBundle, useAppVersions } from '../../hooks/useAdmin';
import type { AdminAnalyticsScreenProps } from './adminAnalyticsTypes';
import AdminActivityChart from './AdminActivityChart';
import AdminAnalyticsFilters from './AdminAnalyticsFilters';
import AdminHealthSnapshot from './AdminHealthSnapshot';
import AdminMetricCard from './AdminMetricCard';
import AdminSection, { AdminTableSummary } from './AdminSection';
import AdminTabs from './AdminTabs';

type AnalyticsTab = 'health' | 'overview' | 'tags';

const TABS: { id: AnalyticsTab; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'overview', label: 'Overview' },
  { id: 'tags', label: 'Tags' },
];

type Props = AdminAnalyticsScreenProps;

function FilterSummary({
  rangeLabel,
  versionLabel,
  metrics,
}: {
  rangeLabel: string;
  versionLabel: string;
  metrics: AnalyticsMetrics | null;
}) {
  if (!metrics) return null;
  return (
    <AdminTableSummary>
      {rangeLabel} · {versionLabel}
      {metrics.version_user_count != null ? ` · ${metrics.version_user_count} users on this version` : ''}
    </AdminTableSummary>
  );
}

export default function AdminAnalytics({
  range,
  preset,
  appVersion,
  onPresetChange,
  onRangeChange,
  onAppVersionChange,
}: Props) {
  const { refreshing } = useAdmin();
  const [tab, setTab] = useState<AnalyticsTab>('health');
  const showRangeFilters = tab !== 'health';

  const filters = useMemo<AnalyticsFilters>(() => ({
    start: range.start,
    end: range.end,
    appVersion: appVersion || null,
  }), [range.start, range.end, appVersion]);

  const versionsQuery = useAppVersions();
  const versions = versionsQuery.data ?? [];
  const versionsLoading = versionsQuery.isLoading;

  const {
    metrics,
    activity,
    tags,
    loading,
    fetching,
    error,
  } = useAdminAnalyticsBundle(filters);

  const rangeLabel = formatRangeLabel(range);
  const versionLabel = appVersion ? `v${appVersion}` : 'all versions';
  const postsPerActive = metrics && metrics.active_users > 0
    ? (metrics.posts / metrics.active_users).toFixed(1)
    : '—';

  return (
    <AdminSection className="admin-overview">
      <AdminTabs
        ariaLabel="Analytics sections"
        active={tab}
        onChange={setTab}
        tabs={TABS}
      />

      {showRangeFilters ? (
        <AdminAnalyticsFilters
          range={range}
          preset={preset}
          appVersion={appVersion}
          versions={versions}
          versionsLoading={versionsLoading}
          loading={(loading || fetching || refreshing) && !metrics}
          onPresetChange={onPresetChange}
          onRangeChange={onRangeChange}
          onAppVersionChange={onAppVersionChange}
        />
      ) : null}

      {tab === 'health' ? <AdminHealthSnapshot /> : null}

      {showRangeFilters && error ? <p className="admin-error admin-error-banner">{error}</p> : null}

      {showRangeFilters && loading && !metrics ? <p className="admin-muted">Loading analytics…</p> : null}

      {showRangeFilters && metrics ? (
        <div className={fetching || refreshing ? 'admin-analytics-panel-wrap--refreshing' : undefined}>
          {tab === 'overview' && (
            <OverviewPanel
              metrics={metrics}
              activity={activity}
              rangeLabel={rangeLabel}
              versionLabel={versionLabel}
              postsPerActive={postsPerActive}
              appliedVersion={appVersion}
            />
          )}

          {tab === 'tags' && (
            <TagsPanel tags={tags} rangeLabel={rangeLabel} versionLabel={versionLabel} />
          )}
        </div>
      ) : null}
    </AdminSection>
  );
}

function OverviewPanel({
  metrics,
  activity,
  rangeLabel,
  versionLabel,
  postsPerActive,
  appliedVersion,
}: {
  metrics: AnalyticsMetrics;
  activity: DailyActivityRow[];
  rangeLabel: string;
  versionLabel: string;
  postsPerActive: string;
  appliedVersion: string;
}) {
  return (
    <div className="admin-analytics-panel">
      <FilterSummary rangeLabel={rangeLabel} versionLabel={versionLabel} metrics={metrics} />
      <p className="admin-muted admin-panel-lead">
        Headline metrics and daily trends for the selected range. Browse and fix individual posts on{' '}
        <Link to="/admin/posts">Posts</Link>.
      </p>

      <div className="admin-metric-grid admin-metric-grid--hero">
        <AdminMetricCard
          label="Signups"
          value={metrics.signups}
          sub={`Joined ${rangeLabel}`}
          to="/admin/users?filter=new"
        />
        <AdminMetricCard
          label="Active posters"
          value={metrics.active_users}
          sub={`${postsPerActive} posts per active user`}
          to="/admin/users"
        />
        <AdminMetricCard
          label="Sleep posts"
          value={metrics.posts}
          sub={rangeLabel}
          to="/admin/posts"
        />
      </div>

      <div className="admin-metric-grid admin-metric-grid--dense">
        <AdminMetricCard label="Comments" value={metrics.comments} sub={rangeLabel} />
        <AdminMetricCard label="Kudos" value={metrics.kudos} sub={rangeLabel} />
        <AdminMetricCard
          label="New friendships"
          value={metrics.friendships_accepted}
          sub="Accepted in range"
        />
        {appliedVersion ? (
          <AdminMetricCard
            label="Users on version"
            value={metrics.version_user_count ?? 0}
            sub={`Last reported v${appliedVersion}`}
          />
        ) : (
          <AdminMetricCard
            label="Version reporting"
            value={metrics.users_with_version_reported}
            sub="Users with a reported app version"
          />
        )}
      </div>

      {activity.length > 0 ? (
        <div className="admin-chart-grid admin-chart-grid--pair">
          <AdminActivityChart
            title="Daily active posters"
            rows={activity}
            series="active_users"
            color="var(--accent)"
          />
          <AdminActivityChart
            title="Daily sleep posts"
            rows={activity}
            series="posts"
            color="var(--deep)"
          />
          <AdminActivityChart
            title="Daily signups"
            rows={activity}
            series="signups"
            color="var(--rem)"
          />
          <AdminActivityChart
            title="Daily comments"
            rows={activity}
            series="comments"
            color="var(--text-muted)"
          />
        </div>
      ) : null}
    </div>
  );
}

function TagsPanel({
  tags,
  rangeLabel,
  versionLabel,
}: {
  tags: AdminTagRow[];
  rangeLabel: string;
  versionLabel: string;
}) {
  const usedTags = tags.filter((tag) => tag.usage_count > 0);
  const maxUsage = usedTags[0]?.usage_count ?? 1;

  return (
    <div className="admin-analytics-panel">
      <p className="admin-muted admin-panel-lead">
        Tag usage on posts created {rangeLabel} · {versionLabel}
      </p>
      {usedTags.length === 0 ? (
        <p className="admin-muted">No tagged posts in this range.</p>
      ) : (
        <div className="admin-tag-usage-list">
          {usedTags.map((tag) => (
            <div key={tag.value} className="admin-tag-usage-row">
              <span className="admin-tag-usage-label">{tag.emoji} {tag.label}</span>
              <span className="admin-tag-usage-bar-wrap">
                <span
                  className="admin-tag-usage-bar"
                  style={{ width: `${Math.max(8, (tag.usage_count / maxUsage) * 100)}%` }}
                />
              </span>
              <span className="admin-tag-usage-count">{tag.usage_count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
