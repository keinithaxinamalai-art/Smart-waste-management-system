import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { fetchDatabaseSnapshot, type StoredUser } from '../services/api';
import { useApp } from '../hooks/useApp';
import './DatabaseView.css';

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="bin-table-wrap">
      <table className="bin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-muted">
                No rows
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${columns[cellIndex]}-${cellIndex}`}>
                    {cellIndex === 0 ? <strong className="bin-id">{String(cell)}</strong> : String(cell)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DatabaseView() {
  const { bins, reports, collections, tickets } = useApp();
  const [live, setLive] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchDatabaseSnapshot()
      .then((snap) => {
        if (cancelled) return;
        setLive(true);
        setUsers(snap.users);
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>SQLite database</h1>
        <p>Users from smartwaste.db — new citizen sign-ups appear here while the API is running</p>
      </div>

      <div className="card db-note">
        <Database size={18} />
        <p>
          {live
            ? 'Connected to SQLite at server/data/smartwaste.db. Refresh DB Browser (F5) to see the same users table.'
            : 'SQLite server is not running. Start it with npm run server, then create a citizen account.'}
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>users</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable
            columns={['id', 'name', 'email', 'password', 'role', 'suburb']}
            rows={users.map((u) => [u.id, u.name, u.email, u.password || '—', u.role, u.suburb || '—'])}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>bins (app)</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable
            columns={['id', 'suburb', 'fill', 'status']}
            rows={bins.map((b) => [b.id, b.suburb, `${b.fillLevel}%`, b.status])}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>reports / collections / tickets</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable
            columns={['table', 'id', 'detail']}
            rows={[
              ...reports.map((r) => ['public_reports', r.id, r.status]),
              ...collections.map((c) => ['collections', c.id, c.assignedTo]),
              ...tickets.map((t) => ['maintenance_tickets', t.id, t.status]),
            ]}
          />
        </div>
      </div>
    </>
  );
}
