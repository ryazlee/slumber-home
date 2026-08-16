import { useMemo } from 'react';
import SleepPostCard from './SleepPostCard';
import { buildLatestPostIdsByUser, isLatestSleepPost } from '../lib/latestSleepPost';
import { groupSleepPostsByNight } from '../lib/sessionPost';
import { useLocalMidnightInvalidation } from '../hooks/useLocalMidnightInvalidation';
import FeedPostsSkeleton from './FeedPostsSkeleton';
import type { PostSocialPatch } from './PostSocial';
import type { SleepPost } from '../lib/types';

type PostListProps = {
  posts: SleepPost[];
  showAuthor?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPatchPost?: (postId: string, patch: PostSocialPatch) => void;
};

export default function PostList({
  posts,
  showAuthor = true,
  emptyMessage = 'No posts yet.',
  loading = false,
  loadingMore = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onPatchPost,
}: PostListProps) {
  const todayISO = useLocalMidnightInvalidation();
  const latestPostIds = useMemo(() => buildLatestPostIdsByUser(posts), [posts]);
  const nightGroups = useMemo(() => groupSleepPostsByNight(posts), [posts]);

  return (
    <>
      {loading && <FeedPostsSkeleton count={3} />}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="app-muted">{emptyMessage}</p>
      )}

      <div className="post-list">
        {!loading && nightGroups.map((group) => (
          <div
            key={group.key}
            className={group.naps.length > 0 ? 'post-night-group' : undefined}
          >
            <SleepPostCard
              post={group.primary}
              showAuthor={showAuthor}
              isLatestPost={isLatestSleepPost(group.primary, latestPostIds, todayISO)}
              stacked={group.naps.length > 0}
              onSocialPatch={onPatchPost}
            />
            {group.naps.map((nap) => (
              <SleepPostCard
                key={nap.id}
                post={nap}
                showAuthor={showAuthor}
                isLatestPost={isLatestSleepPost(nap, latestPostIds, todayISO)}
                stacked
                onSocialPatch={onPatchPost}
              />
            ))}
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <button
          className="admin-button admin-button-ghost app-load-more"
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </>
  );
}
