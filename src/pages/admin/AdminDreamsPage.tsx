import AdminAnalytics from '../../components/admin/AdminAnalytics';
import { useAnalyticsFilterPageState } from '../../hooks/useAnalyticsFilterPageState';

export default function AdminDreamsPage() {
  const filterProps = useAnalyticsFilterPageState();
  return <AdminAnalytics view="dreams" {...filterProps} />;
}
