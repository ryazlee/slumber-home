import AdminAnalytics from '../../components/admin/AdminAnalytics';
import { useAnalyticsFilterPageState } from '../../hooks/useAnalyticsFilterPageState';

export default function AdminActivityPage() {
  const filterProps = useAnalyticsFilterPageState();
  return <AdminAnalytics view="overview" {...filterProps} />;
}
