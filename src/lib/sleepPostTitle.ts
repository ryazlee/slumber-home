/** Matches app default: `"June 15 Sleep"` / `"June 15 Nap"` from `lib/composerCustomSleep.ts`. */
export function defaultSleepPostTitle(
  sleepDateISO: string,
  kind?: 'nap' | 'overnight' | 'manual',
): string {
  const [year, month, day] = sleepDateISO.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return kind === 'nap' ? `${date} Nap` : `${date} Sleep`;
}

const GENERIC_TITLES = new Set(['my sleep', 'sleep log', 'sleep']);

export function isDefaultSleepPostTitle(
  title: string | null | undefined,
  sleepDateISO: string,
): boolean {
  const trimmed = (title ?? '').trim();
  if (!trimmed) return true;
  if (GENERIC_TITLES.has(trimmed.toLowerCase())) return true;
  return trimmed.toLowerCase() === defaultSleepPostTitle(sleepDateISO).toLowerCase()
    || trimmed.toLowerCase() === defaultSleepPostTitle(sleepDateISO, 'nap').toLowerCase();
}

/** Returns the title when the user set something custom; otherwise null. */
export function customSleepPostTitle(
  title: string | null | undefined,
  sleepDateISO: string,
): string | null {
  if (isDefaultSleepPostTitle(title, sleepDateISO)) return null;
  return trimmedOrNull(title);
}

/** Title shown on feed cards and post detail — always non-empty. */
export function sleepPostDisplayTitle(
  title: string | null | undefined,
  sleepDateISO: string,
  kind?: 'nap' | 'overnight' | 'manual',
): string {
  return trimmedOrNull(title) ?? defaultSleepPostTitle(sleepDateISO, kind);
}

function trimmedOrNull(title: string | null | undefined): string | null {
  const trimmed = (title ?? '').trim();
  return trimmed || null;
}
