import { supabase } from './supabase';

export type GlobalLeaderboardEntry = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  userRoles: string[] | null;
  nights: number;
  value: number;
};

export type GlobalLeaderboardMetric = 'deepPct' | 'remPct' | 'corePct' | 'avgHours' | 'dreamRate';

export type GlobalSleepLeaderboard = {
  days: number;
  minNights: number;
  deepPct: GlobalLeaderboardEntry[];
  remPct: GlobalLeaderboardEntry[];
  corePct: GlobalLeaderboardEntry[];
  avgHours: GlobalLeaderboardEntry[];
  dreamRate: GlobalLeaderboardEntry[];
};

function mapEntry(raw: unknown): GlobalLeaderboardEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const userId = typeof r.userId === 'string' ? r.userId : null;
  const username = typeof r.username === 'string' ? r.username : null;
  if (!userId || !username) return null;
  const nights = typeof r.nights === 'number' ? r.nights : Number(r.nights);
  const value = typeof r.value === 'number' ? r.value : Number(r.value);
  if (!Number.isFinite(nights) || !Number.isFinite(value)) return null;
  const rawRoles = r.userRoles;
  const userRoles = Array.isArray(rawRoles)
    ? rawRoles.filter((role): role is string => typeof role === 'string')
    : null;
  return {
    userId,
    username,
    avatarUrl: typeof r.avatarUrl === 'string' ? r.avatarUrl : null,
    userRoles: userRoles && userRoles.length > 0 ? userRoles : null,
    nights,
    value,
  };
}

function mapList(raw: unknown): GlobalLeaderboardEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapEntry).filter((e): e is GlobalLeaderboardEntry => e != null);
}

export async function fetchGlobalSleepLeaderboard(opts?: {
  days?: number;
  limit?: number;
  minNights?: number;
}): Promise<GlobalSleepLeaderboard> {
  const { data, error } = await supabase.rpc('get_global_sleep_leaderboard', {
    p_days: opts?.days ?? 60,
    p_limit: opts?.limit ?? 10,
    p_min_nights: opts?.minNights ?? 7,
  });
  if (error) throw error;

  const payload = (data ?? {}) as Record<string, unknown>;
  return {
    days: typeof payload.days === 'number' ? payload.days : 60,
    minNights: typeof payload.minNights === 'number' ? payload.minNights : 7,
    deepPct: mapList(payload.deepPct),
    remPct: mapList(payload.remPct),
    corePct: mapList(payload.corePct),
    avgHours: mapList(payload.avgHours),
    dreamRate: mapList(payload.dreamRate),
  };
}
