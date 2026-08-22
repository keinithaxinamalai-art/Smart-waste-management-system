import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  Users,
} from 'lucide-react';
import { ISSUE_LABELS } from '../constants/issueLabels';
import { useApp } from '../hooks/useApp';
import type { ReportStatus } from '../types';
import './PublicReportsAdminView.css';

type FilterStatus = 'all' | ReportStatus;

export function PublicReportsAdminView() {
  const { reports, setReportStatus } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const counts = useMemo(
    () => ({
      new: reports.filter((r) => r.status === 'new').length,
      assigned: reports.filter((r) => r.status === 'assigned').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
    }),
    [reports]
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="page-header">
        <h1>Public Reports</h1>
        <p>Citizen and staff submissions — review, assign routes, and resolve</p>
      </div>

      <div className="public-admin-stats">
        <button
          type="button"
          className={`public-filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({reports.length})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'new' ? 'active' : ''}`}
          onClick={() => setFilter('new')}
        >
          New ({counts.new})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Assigned ({counts.assigned})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({counts.resolved})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card public-empty">
          <Users size={40} className="public-empty-icon" />
          <p>No reports in this category.</p>
        </div>
      ) : (
        <div className="public-reports-grid">
          {filtered.map((report) => (
            <article key={report.id} className={`public-report-card status-${report.status}`}>
              <div className="public-report-card-header">
                <span className="public-report-id">{report.id}</span>
                <span className={`public-status-badge status-${report.status}`}>
                  {report.status}
                </span>
              </div>
              <h3>{report.issueLabel || ISSUE_LABELS[report.issue] || report.issue}</h3>
              <p className="public-report-loc">
                <MapPin size={14} />
                {report.location} · {report.suburb}
              </p>
              {report.binId && (
                <p className="public-report-bin">Bin: {report.binId}</p>
              )}
              {report.description && (
                <p className="public-report-desc">{report.description}</p>
              )}
              <div className="public-report-meta">
                <span>
                  <Clock size={14} />
                  {formatDate(report.createdAt)}
                </span>
                {report.reporterName && (
                  <span>
                    <Users size={14} />
                    {report.reporterName}
                  </span>
                )}
              </div>
              {report.status !== 'resolved' && (
                <div className="public-report-actions">
                  {report.status === 'new' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setReportStatus(report.id, 'assigned')}
                    >
                      <UserCheck size={16} />
                      Assign
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setReportStatus(report.id, 'resolved')}
                  >
                    <CheckCircle2 size={16} />
                    Resolve
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
