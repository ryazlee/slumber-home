import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchGlobalSleepLeaderboard,
  type GlobalLeaderboardPeriod,
} from '../lib/globalLeaderboard';
import { queryKeys } from './queryKeys';

export function useGlobalSleepLeaderboard(
  enabled = true,
  period: GlobalLeaderboardPeriod = 'all_time',
) {
  return useQuery({
    queryKey: queryKeys.globalSleepLeaderboard(period),
    queryFn: () => fetchGlobalSleepLeaderboard({ period, limit: 10 }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled,
  });
}
