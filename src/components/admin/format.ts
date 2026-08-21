export { pluralCount, pluralize } from '../../lib/format';

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString();
}

/** Current minus previous; null when the prior window is unavailable. */
export function metricDelta(current: number, previous: number | undefined): number | null {
  if (previous == null || Number.isNaN(previous)) return null;
  return current - previous;
}

export function formatDelta(delta: number): string {
  if (delta === 0) return '0';
  const abs = Math.abs(delta).toLocaleString();
  return delta > 0 ? `+${abs}` : `−${abs}`;
}

export function formatDeltaPercent(current: number, previous: number): string | null {
  if (previous === 0) return current === 0 ? '0%' : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return '0%';
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}
