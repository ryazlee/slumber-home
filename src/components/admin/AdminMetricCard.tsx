import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from './format';

type Props = {
  label: string;
  value: number | string;
  sub?: ReactNode;
  /** When set, the whole card navigates to this admin page. */
  to?: string;
};

export default function AdminMetricCard({ label, value, sub, to }: Props) {
  const body = (
    <>
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {sub ? <p className="admin-metric-sub">{sub}</p> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="admin-metric-card admin-metric-card--link">
        {body}
      </Link>
    );
  }

  return <div className="admin-metric-card">{body}</div>;
}
