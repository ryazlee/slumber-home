import AdminAnalytics from '../../components/admin/AdminAnalytics';
import { useAnalyticsFilterPageState } from '../../hooks/useAnalyticsFilterPageState';

export default function AdminTagUsagePage() {
  const filterProps = useAnalyticsFilterPageState();
  return <AdminAnalytics view="tags" {...filterProps} />;
}
