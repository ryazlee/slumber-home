import { sessionKindChipLabel, type SleepSessionKind } from '../lib/sessionPost';

type Props = {
  kind?: SleepSessionKind;
  /** Show Overnight when this card is stacked with a nap. */
  stacked?: boolean;
  /** Always show Nap and Overnight (detail / composer). */
  always?: boolean;
  size?: 'sm' | 'md';
};

export default function SessionKindChip({
  kind,
  stacked = false,
  always = false,
  size = 'sm',
}: Props) {
  const label = sessionKindChipLabel(kind, { stacked: stacked || always });
  if (!label) return null;
  const isNap = kind === 'nap';
  const className = [
    'session-kind-chip',
    isNap ? 'session-kind-chip--nap' : 'session-kind-chip--overnight',
    size === 'md' ? 'session-kind-chip--md' : null,
  ].filter(Boolean).join(' ');

  return <span className={className}>{label}</span>;
}
