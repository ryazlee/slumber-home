import { addDaysToDateISO, getLastNightSleepDateISO, getLocalDateISO } from './dates';
import { filterWearableSleepRows } from './sleepPostCustom';
import { shouldReplaceNightClocks } from './sessionPost';
import {
  averageBedtimeMinutes,
  averageWakeTimeMinutes,
  extractBedtimeMinutes,
  extractWakeTimeMinutes,
  formatSleepClockMinutes,
} from './sleepTimeStats';
import { supabase } from './supabase';
import type { SleepSessionData } from './types';

export type PeriodStats = {
  asleep: number | null;
  deep: number | null;
  rem: number | null;
  core: number | null;
  awake: number | null;
  awakeEvents: number | null;
  inBed: number | null;
  avgBedtime: string | null;
  avgWakeTime: string | null;
  postsCount: number;
  dreamsCount: number;
  dreamRate: number | null;
  deepPct: number | null;
  remPct: number | null;
  corePct: number | null;
  awakePct: number | null;
  bestNight: number | null;
} | null;

export type ComparePeriods = {
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  allTime: PeriodStats;
};

type SleepRow = {
  sleep_date: string;
  asleep_minutes: number;
  deep_minutes: number | null;
  rem_minutes: number | null;
  core_minutes: number | null;
  awake_minutes: number | null;
  awake_events: number | null;
  in_bed_minutes: number | null;
  bedtime: string | null;
  wake_time: string | null;
  dream_log: string | null;
  session_kind?: string | null;
  session_breakdown?: SleepSessionData[] | null;
  is_custom?: boolean | null;
  source_device?: string | null;
};

const POST_COLS = 'sleep_date, asleep_minutes, deep_minutes, rem_minutes, core_minutes, awake_minutes, awake_events, in_bed_minutes, bedtime, wake_time, dream_log, session_kind, session_breakdown, is_custom, source_device';

export async function fetchComparePeriods(userId: string): Promise<ComparePeriods> {
  const todayLocal = getLocalDateISO();
  const lastNightDate = getLastNightSleepDateISO();
  const d7 = addDaysToDateISO(todayLocal, -7);
  const d30 = addDaysToDateISO(todayLocal, -30);

  const [todayRes, allRes] = await Promise.all([
    supabase.from('sleep_posts').select(POST_COLS)
      .eq('user_id', userId)
      .eq('sleep_date', lastNightDate)
      .is('deleted_at', null),
    supabase.from('sleep_posts').select(POST_COLS)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .not('asleep_minutes', 'is', null),
  ]);

  const rows = filterWearableSleepRows((allRes.data ?? []) as SleepRow[]);

  const hasDream = (r: Pick<SleepRow, 'dream_log'>) => !!r.dream_log?.trim();
  const countDreams = (subset: SleepRow[]) => subset.filter(hasDream).length;

  const pctOf = (subset: SleepRow[], numKey: keyof SleepRow, denomKey: keyof SleepRow) => {
    let num = 0;
    let denom = 0;
    for (const r of subset) {
      const n = (r[numKey] as number | null) ?? 0;
      const d = (r[denomKey] as number | null) ?? 0;
      if (d > 0 && n >= 0) {
        num += n;
        denom += d;
      }
    }
    return denom > 0 ? Math.round((num / denom) * 100) : null;
  };

  const stagePct = (subset: SleepRow[], stage: 'deep_minutes' | 'rem_minutes' | 'core_minutes') =>
    pctOf(subset, stage, 'asleep_minutes');

  const nightCount = (subset: SleepRow[]) => new Set(subset.map((r) => r.sleep_date)).size;
  const dreamRatePct = (subset: SleepRow[]) => {
    const nights = nightCount(subset);
    return nights ? Math.round((countDreams(subset) / nights) * 100) : null;
  };

  const bestNightMins = (subset: SleepRow[]) => {
    const values = subset.map((r) => r.asleep_minutes).filter((v) => v > 0);
    return values.length ? Math.max(...values) : null;
  };

  const avgN = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
  const avgWakes = (subset: SleepRow[]) => {
    if (subset.length === 0) return null;
    const total = subset.reduce((s, r) => s + (r.awake_events ?? 0), 0);
    return Math.round(total / subset.length);
  };
  const col = (subset: SleepRow[], key: keyof SleepRow) =>
    avgN(subset.map((r) => (r[key] as number | null) ?? 0).filter((v) => v > 0));

  const nightTotals = (subset: SleepRow[]): SleepRow[] => {
    const map = new Map<string, SleepRow & { longestSession: number }>();
    for (const r of subset) {
      const cur = map.get(r.sleep_date);
      if (!cur) {
        map.set(r.sleep_date, { ...r, longestSession: r.asleep_minutes });
        continue;
      }
      if (shouldReplaceNightClocks(
        { isNap: cur.session_kind === 'nap', asleep: cur.longestSession },
        { isNap: r.session_kind === 'nap', asleep: r.asleep_minutes },
      )) {
        cur.bedtime = r.bedtime;
        cur.wake_time = r.wake_time;
        cur.session_breakdown = r.session_breakdown;
        cur.longestSession = r.asleep_minutes;
        cur.session_kind = r.session_kind;
      }
      cur.asleep_minutes += r.asleep_minutes;
      cur.deep_minutes = (cur.deep_minutes ?? 0) + (r.deep_minutes ?? 0);
      cur.rem_minutes = (cur.rem_minutes ?? 0) + (r.rem_minutes ?? 0);
      cur.core_minutes = (cur.core_minutes ?? 0) + (r.core_minutes ?? 0);
      cur.awake_minutes = (cur.awake_minutes ?? 0) + (r.awake_minutes ?? 0);
      cur.awake_events = (cur.awake_events ?? 0) + (r.awake_events ?? 0);
      cur.in_bed_minutes = (cur.in_bed_minutes ?? 0) + (r.in_bed_minutes ?? 0);
      if (r.dream_log?.trim()) cur.dream_log = r.dream_log;
    }
    return [...map.values()];
  };

  const build = (subset: SleepRow[]): PeriodStats => {
    const nights = nightTotals(subset);
    if (nights.length === 0) return null;
    const bedtimeMins = nights
      .map((r) => extractBedtimeMinutes(r.bedtime, r.session_breakdown))
      .filter((v): v is number => v !== null);
    const wakeTimeMins = nights
      .map((r) => extractWakeTimeMinutes(r.wake_time, r.session_breakdown))
      .filter((v): v is number => v !== null);
    const btAvg = averageBedtimeMinutes(bedtimeMins);
    const wtAvg = averageWakeTimeMinutes(wakeTimeMins);
    return {
      asleep: col(nights, 'asleep_minutes'),
      deep: col(nights, 'deep_minutes'),
      rem: col(nights, 'rem_minutes'),
      core: col(nights, 'core_minutes'),
      awake: col(nights, 'awake_minutes'),
      awakeEvents: avgWakes(nights),
      inBed: col(nights, 'in_bed_minutes'),
      avgBedtime: btAvg != null ? formatSleepClockMinutes(btAvg) : null,
      avgWakeTime: wtAvg != null ? formatSleepClockMinutes(wtAvg) : null,
      postsCount: nights.length,
      dreamsCount: countDreams(nights),
      dreamRate: dreamRatePct(nights),
      deepPct: stagePct(nights, 'deep_minutes'),
      remPct: stagePct(nights, 'rem_minutes'),
      corePct: stagePct(nights, 'core_minutes'),
      awakePct: pctOf(nights, 'awake_minutes', 'in_bed_minutes'),
      bestNight: bestNightMins(nights),
    };
  };

  const week = rows.filter((r) => r.sleep_date >= d7);
  const month = rows.filter((r) => r.sleep_date >= d30);
  const todayRows = filterWearableSleepRows((todayRes.data ?? []) as SleepRow[]);
  const todayNight = nightTotals(todayRows)[0] ?? null;

  const todayBedtime = todayNight
    ? extractBedtimeMinutes(todayNight.bedtime, todayNight.session_breakdown)
    : null;
  const todayWake = todayNight
    ? extractWakeTimeMinutes(todayNight.wake_time, todayNight.session_breakdown)
    : null;

  return {
    today: todayNight ? {
      asleep: todayNight.asleep_minutes,
      deep: todayNight.deep_minutes,
      rem: todayNight.rem_minutes,
      core: todayNight.core_minutes,
      awake: todayNight.awake_minutes,
      awakeEvents: todayNight.awake_events ?? 0,
      inBed: todayNight.in_bed_minutes,
      avgBedtime: todayBedtime != null ? formatSleepClockMinutes(todayBedtime) : null,
      avgWakeTime: todayWake != null ? formatSleepClockMinutes(todayWake) : null,
      postsCount: 1,
      dreamsCount: hasDream(todayNight) ? 1 : 0,
      dreamRate: hasDream(todayNight) ? 100 : 0,
      deepPct: stagePct([todayNight], 'deep_minutes'),
      remPct: stagePct([todayNight], 'rem_minutes'),
      corePct: stagePct([todayNight], 'core_minutes'),
      awakePct: pctOf([todayNight], 'awake_minutes', 'in_bed_minutes'),
      bestNight: todayNight.asleep_minutes > 0 ? todayNight.asleep_minutes : null,
    } : {
      asleep: null,
      deep: null,
      rem: null,
      core: null,
      awake: null,
      awakeEvents: null,
      inBed: null,
      avgBedtime: null,
      avgWakeTime: null,
      postsCount: 0,
      dreamsCount: 0,
      dreamRate: null,
      deepPct: null,
      remPct: null,
      corePct: null,
      awakePct: null,
      bestNight: null,
    },
    week: build(week),
    month: build(month),
    allTime: build(rows),
  };
}
