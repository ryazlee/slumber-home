import { Link } from 'react-router-dom';
import type { PR } from '../../lib/statsTypes';
import { formatSleepDate } from '../../lib/format';

export type StatsPrItem = {
  emoji: string;
  label: string;
  pr: PR;
  format: (v: number) => string;
};

type Props = {
  /** Each row is a pair (e.g. longest | shortest, most deep | deep %). */
  rows: StatsPrItem[][];
};

export default function StatsPrStrip({ rows }: Props) {
  const visibleRows = rows
    .map((row) => row.filter((i) => i.pr?.value != null && i.pr.value > 0))
    .filter((row) => row.length > 0);
  if (!visibleRows.length) return null;

  return (
    <div className="stats-card stats-pr-strip">
      {visibleRows.map((row, rowIndex) => (
        <div key={`pr-row-${rowIndex}`} className="stats-pr-row">
          {row.map((item) => {
            const content = (
              <>
                <span className="stats-pr-emoji" aria-hidden>{item.emoji}</span>
                <span className="stats-pr-value">{item.format(item.pr!.value)}</span>
                <span className="stats-pr-label">{item.label}</span>
                {item.pr?.date ? (
                  <span className="stats-pr-date">{formatSleepDate(item.pr.date.split('T')[0])}</span>
                ) : null}
              </>
            );

            if (item.pr?.postId) {
              return (
                <Link key={item.label} to={`/post/${item.pr.postId}`} className="stats-pr-tile stats-pr-tile--link">
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.label} className="stats-pr-tile">
                {content}
              </div>
            );
          })}
          {row.length === 1 ? <div className="stats-pr-tile stats-pr-tile--spacer" aria-hidden /> : null}
        </div>
      ))}
    </div>
  );
}
