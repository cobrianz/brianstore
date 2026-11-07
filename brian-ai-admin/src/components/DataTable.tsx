'use client';

export interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  emptyTitle?: string;
  emptyText?: string;
}

export default function DataTable<T>({ rows, columns, emptyTitle = 'No items', emptyText = '' }: Props<T>) {
  if (!rows.length) return (
    <div className="empty-state">
      <strong>{emptyTitle}</strong>
      {emptyText}
    </div>
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c, i) => <th key={i} style={c.width ? { width: c.width } : {}}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c, j) => <td key={j}>{c.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const cls = `badge badge-${(value || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
  return <span className={cls}>{value || 'Unknown'}</span>;
}

export function money(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format((Number(cents) || 0) / 100);
}

export function fmtDate(v: string | Date | undefined) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
