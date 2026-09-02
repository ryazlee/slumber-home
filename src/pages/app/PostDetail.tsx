import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AdminPostRawSection from '../../components/admin/AdminPostRawSection';
import PostDetailView from '../../components/PostDetailView';
import type { PostSocialPatch } from '../../components/PostSocial';
import { useAuth } from '../../context/AuthContext';
import { useIsModerator } from '../../hooks/useAdmin';
import { usePost } from '../../hooks/usePost';
import { patchPostInCache } from '../../lib/patchPostCache';
import { getOptionalQueryErrorMessage } from '../../lib/queryError';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const fromAdmin = searchParams.get('from') === 'admin';
  const { session } = useAuth();
  const isModerator = useIsModerator(Boolean(session)).data === true;
  const qc = useQueryClient();
  const { data: post, isLoading, error } = usePost(id);

  const handleSocialPatch = useCallback((postId: string, patch: PostSocialPatch) => {
    patchPostInCache(qc, postId, patch, { userPosts: 'all' });
  }, [qc]);

  if (isLoading) {
    return (
      <div className="app-page app-page--feed post-detail-page">
        <p className="app-muted">Loading post…</p>
      </div>
    );
  }

  const errorMessage = getOptionalQueryErrorMessage(error, 'Post not found.')
    ?? (!post ? 'Post not found.' : null);

  if (errorMessage || !post) {
    return (
      <div className="app-page app-page--feed post-detail-page">
        <p className="admin-error">{errorMessage ?? 'Post not found.'}</p>
        <Link to={fromAdmin ? '/admin/posts' : '/feed'} className="app-back-link">
          {fromAdmin ? '← Back to admin posts' : '← Back to feed'}
        </Link>
      </div>
    );
  }

  return (
    <div className="app-page app-page--feed post-detail-page">
      <header className="post-detail-page-header">
        <Link to={fromAdmin ? '/admin/posts' : '/feed'} className="app-back-link">
          {fromAdmin ? '← Admin posts' : '← Feed'}
        </Link>
        {fromAdmin ? (
          <p className="admin-muted post-detail-admin-note">Admin lookup — not shown in the friends feed.</p>
        ) : null}
      </header>

      <PostDetailView post={post} onSocialPatch={handleSocialPatch} />

      {isModerator ? (
        <AdminPostRawSection postId={post.id} defaultOpen={fromAdmin} />
      ) : null}
    </div>
  );
}
