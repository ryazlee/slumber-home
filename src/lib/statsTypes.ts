import type { SleepPost } from './types';
import type { PeriodStats } from './compareStats';

export type PR = { value: number; date: string; postId: string | null } | null;

export type UserStats = {
  currentStreak: number;
  longestStreak: number;
  weeklyPosts: SleepPost[];
  avgAsleepMinutes: number;
  prLongestSleep: PR;
  prShortestSleep: PR;
  prMostDeep: PR;
  prMostRem: PR;
  prMostCore: PR;
  prHighestDeepPct: PR;
  prHighestRemPct: PR;
  prHighestCorePct: PR;
  prLowestDeepPct: PR;
  prLowestRemPct: PR;
  prLowestCorePct: PR;
};

export type TopNight = {
  postId: string;
  sleepDate: string;
  asleepMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  coreMinutes: number;
};

export type MonthBest = {
  month: string;
  label: string;
  asleepMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  coreMinutes: number;
  deepPct: number | null;
  remPct: number | null;
  corePct: number | null;
  avgAwakeEvents: number | null;
  avgBedtime: string | null;
  avgWakeTime: string | null;
};

export type LifetimeStats = {
  totalNights: number;
  avgAsleepMinutes: number;
  avgBedtime: string | null;
  avgWakeTime: string | null;
  bestNights: TopNight[];
  shortestNights: TopNight[];
  mostDeepNights: TopNight[];
  mostRemNights: TopNight[];
  mostCoreNights: TopNight[];
  highestDeepPctNights: TopNight[];
  highestRemPctNights: TopNight[];
  highestCorePctNights: TopNight[];
  lowestDeepPctNights: TopNight[];
  lowestRemPctNights: TopNight[];
  lowestCorePctNights: TopNight[];
  /** Recent wearable nights with stages — used for monthly PR diffs. */
  stageNights: TopNight[];
  monthlyBests: MonthBest[];
};

export type StatsMetric = {
  label: string;
  value: string;
  accent?: string;
};

export type InsightChip = {
  emoji: string;
  label: string;
  detail?: string;
};

export type MonthPeriod = NonNullable<PeriodStats>;
