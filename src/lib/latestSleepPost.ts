import type { SleepPost } from './types';
import { daysAgoForDateISO, getLocalDateISO } from './dates';

/** Max age (viewer-local calendar days) for latest-night card highlighting. */
export const LATEST_POST_MAX_AGE_DAYS = 2;

export function compareSleepPostsByRecency(a: SleepPost, b: SleepPost): number {
  if (a.sleepDate !== b.sleepDate) {
    return a.sleepDate > b.sleepDate ? -1 : 1;
  }
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function buildLatestPostIdsByUser(posts: SleepPost[]): Set<string> {
  const bestByUser = new Map<string, SleepPost>();
  for (const post of posts) {
    const prev = bestByUser.get(post.userId);
    if (!prev || compareSleepPostsByRecency(post, prev) < 0) {
      bestByUser.set(post.userId, post);
    }
  }
  return new Set([...bestByUser.values()].map((p) => p.id));
}

export function isLatestSleepPost(
  post: SleepPost,
  latestIds: Set<string>,
  todayISO = getLocalDateISO(),
): boolean {
  if (!latestIds.has(post.id)) return false;
  return daysAgoForDateISO(post.sleepDate, todayISO) <= LATEST_POST_MAX_AGE_DAYS;
}
