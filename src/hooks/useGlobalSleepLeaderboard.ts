import { useQuery } from '@tanstack/react-query';
import { fetchGlobalSleepLeaderboard } from '../lib/globalLeaderboard';
import { queryKeys } from './queryKeys';

export function useGlobalSleepLeaderboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.globalSleepLeaderboard,
    queryFn: () => fetchGlobalSleepLeaderboard({ days: 60, limit: 10, minNights: 5 }),
    staleTime: 60_000,
    enabled,
  });
}
