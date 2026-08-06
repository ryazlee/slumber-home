import { Link } from 'react-router-dom';
import type { PR } from '../../lib/statsTypes';
import { formatSleepDate } from '../../lib/format';

export type StatsPrTone = 'best' | 'rough' | 'deep' | 'rem' | 'core' | 'awake';

export type StatsPrItem = {
  emoji: string;
  label: string;
  pr: PR;
  format: (v: number) => string;
  tone?: StatsPrTone;
};

export type StatsPrSection = {
  title: string;
  kind: 'best' | 'rough';
  items: StatsPrItem[];
};

type Props = {
  sections: StatsPrSection[];
};

export default function StatsPrStrip({ sections }: Props) {
  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((i) => i.pr?.value != null && i.pr.value > 0),
    }))
    .filter((section) => section.items.length > 0);
  if (!visibleSections.length) return null;

  return (
    <div className="stats-pr-sections">
      {visibleSections.map((section) => (
        <div key={section.title} className="stats-pr-section">
          <div className={`stats-pr-section-title stats-pr-section-title--${section.kind}`}>
            {section.title}
          </div>
          <div className="stats-pr-grid">
            {section.items.map((item) => {
              const className = [
                'stats-pr-tile',
                section.kind === 'best' ? 'stats-pr-tile--best' : 'stats-pr-tile--rough',
                item.tone ? `stats-pr-tile--${item.tone}` : '',
                item.pr?.postId ? 'stats-pr-tile--link' : '',
              ].filter(Boolean).join(' ');

              const content = (
                <>
                  <div className="stats-pr-tile-top">
                    <span className="stats-pr-emoji" aria-hidden>{item.emoji}</span>
                    <span className="stats-pr-value">{item.format(item.pr!.value)}</span>
                  </div>
                  <span className="stats-pr-label">{item.label}</span>
                  {item.pr?.date ? (
                    <span className="stats-pr-date">{formatSleepDate(item.pr.date.split('T')[0])}</span>
                  ) : null}
                </>
              );

              if (item.pr?.postId) {
                return (
                  <Link key={`${section.title}-${item.label}`} to={`/post/${item.pr.postId}`} className={className}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={`${section.title}-${item.label}`} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
