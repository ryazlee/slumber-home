import type { SleepPost } from './types';

export type SleepSessionKind = 'overnight' | 'nap' | 'manual';

export function isNightJournalPost(
  post: Pick<SleepPost, 'sessionKind' | 'isCustom'>,
): boolean {
  if (post.sessionKind === 'nap') return false;
  return true;
}

export function pickNightJournalPost<
  T extends Pick<SleepPost, 'id' | 'sessionKind' | 'isCustom' | 'asleepMinutes' | 'createdAt'>,
>(posts: T[]): T | null {
  const journals = posts.filter(isNightJournalPost);
  if (journals.length === 0) return null;
  return [...journals].sort((a, b) => {
    if (b.asleepMinutes !== a.asleepMinutes) return b.asleepMinutes - a.asleepMinutes;
    return a.createdAt.localeCompare(b.createdAt);
  })[0];
}

export type SleepNightGroup = {
  key: string;
  userId: string;
  sleepDate: string;
  primary: SleepPost;
  naps: SleepPost[];
};

export function nightGroupKey(userId: string, sleepDate: string): string {
  return `${userId}|${sleepDate}`;
}

export function groupSleepPostsByNight(posts: SleepPost[]): SleepNightGroup[] {
  const members = new Map<string, SleepPost[]>();
  const order: string[] = [];
  for (const post of posts) {
    const key = nightGroupKey(post.userId, post.sleepDate);
    const list = members.get(key);
    if (!list) {
      members.set(key, [post]);
      order.push(key);
    } else {
      list.push(post);
    }
  }

  return order.map((key) => {
    const night = members.get(key) ?? [];
    const primary = pickNightJournalPost(night) ?? night[0];
    const naps = night
      .filter((p) => p.id !== primary.id)
      .sort((a, b) => {
        const aStart = a.sessionStartedAt ?? a.createdAt;
        const bStart = b.sessionStartedAt ?? b.createdAt;
        return aStart.localeCompare(bStart);
      });
    return {
      key,
      userId: primary.userId,
      sleepDate: primary.sleepDate,
      primary,
      naps,
    };
  });
}

export function countDistinctDatesInWindow(
  dates: Iterable<string>,
  start: string,
  end: string,
): number {
  const seen = new Set<string>();
  for (const d of dates) {
    if (d >= start && d <= end) seen.add(d);
  }
  return seen.size;
}
