import CollapsibleSection from '../CollapsibleSection';
import { getOptionalQueryErrorMessage } from '../../lib/queryError';
import { useAdminPost } from '../../hooks/useAdmin';
import AdminPostRawJson from './AdminPostRawJson';

type Props = {
  postId: string;
  defaultOpen?: boolean;
};

export default function AdminPostRawSection({ postId, defaultOpen = false }: Props) {
  const query = useAdminPost(postId);
  const data = query.data ?? null;
  const error = getOptionalQueryErrorMessage(query.error, 'Could not load post.');

  return (
    <div className="post-detail-admin-raw">
      <CollapsibleSection title="Raw post data" defaultOpen={defaultOpen}>
        {error ? <p className="admin-error">{error}</p> : null}
        {query.isLoading && !data ? <p className="admin-muted">Loading raw post…</p> : null}
        {!query.isLoading && !error && !data ? (
          <p className="admin-muted">Post not found.</p>
        ) : null}
        {data ? <AdminPostRawJson data={data} /> : null}
      </CollapsibleSection>
    </div>
  );
}
