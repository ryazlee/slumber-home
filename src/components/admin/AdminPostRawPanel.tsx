import { Link } from 'react-router-dom';
import { getOptionalQueryErrorMessage } from '../../lib/queryError';
import { useAdminPost } from '../../hooks/useAdmin';
import AdminPanel from './AdminPanel';
import AdminPostRawJson from './AdminPostRawJson';
import { ADMIN_POST_RAW_ID } from './adminScroll';

type Props = {
  postId: string;
  title?: string | null;
  username?: string | null;
  onClose: () => void;
};

export default function AdminPostRawPanel({ postId, title, username, onClose }: Props) {
  const query = useAdminPost(postId);
  const data = query.data ?? null;
  const error = getOptionalQueryErrorMessage(query.error, 'Could not load post.');
  const heading = title?.trim() || (typeof data?.title === 'string' && data.title ? data.title : 'Raw post');
  const meta = [
    username ? `@${username}` : null,
    postId,
  ].filter(Boolean).join(' · ');

  return (
    <AdminPanel
      id={ADMIN_POST_RAW_ID}
      title={heading}
      meta={meta}
      description="Full sleep_posts row, including raw_samples and session_breakdown."
      highlighted
      headerAction={(
        <button type="button" className="admin-button admin-button-ghost" onClick={onClose}>
          Close
        </button>
      )}
    >
      <div className="admin-user-detail-actions">
        <Link
          to={`/post/${postId}?from=admin`}
          className="admin-action-btn admin-action-btn--ghost"
        >
          Open post
        </Link>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {query.isLoading && !data ? <p className="admin-muted">Loading raw post…</p> : null}
      {!query.isLoading && !error && !data ? (
        <p className="admin-muted">Post not found.</p>
      ) : null}
      {data ? <AdminPostRawJson data={data} /> : null}
    </AdminPanel>
  );
}
