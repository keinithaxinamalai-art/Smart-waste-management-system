import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
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
      submitted: reports.filter((r) => r.status === 'Submitted').length,
      underReview: reports.filter((r) => r.status === 'Under Review').length,
      scheduled: reports.filter((r) => r.status === 'Scheduled').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
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
        <h1>Public Waste Report Administration</h1>
        <p>Review citizen submissions, update status transitions, and assign collection routes</p>
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
          className={`public-filter-chip ${filter === 'Submitted' ? 'active' : ''}`}
          onClick={() => setFilter('Submitted')}
        >
          Submitted ({counts.submitted})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'Under Review' ? 'active' : ''}`}
          onClick={() => setFilter('Under Review')}
        >
          Under Review ({counts.underReview})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'Scheduled' ? 'active' : ''}`}
          onClick={() => setFilter('Scheduled')}
        >
          Scheduled ({counts.scheduled})
        </button>
        <button
          type="button"
          className={`public-filter-chip ${filter === 'Resolved' ? 'active' : ''}`}
          onClick={() => setFilter('Resolved')}
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
            <article
              key={report.id}
              className={`public-report-card status-${report.status.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="public-report-card-header">
                <span className="public-report-id">{report.id}</span>
                <span
                  className={`public-status-badge status-${report.status.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {report.status}
                </span>
              </div>
              <h3>{report.issueLabel || ISSUE_LABELS[report.issue] || report.issue}</h3>
              <p className="public-report-loc">
                <MapPin size={14} />
                {report.location} · {report.suburb}
              </p>
              {report.binId && (
                <p className="public-report-bin">Smart Bin: <strong>{report.binId}</strong></p>
              )}
              {report.description && (
                <p className="public-report-desc">&quot;{report.description}&quot;</p>
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
                <span>Urgency: <strong>{report.urgency}</strong></span>
              </div>
              {report.status !== 'Resolved' && (
                <div className="public-report-actions">
                  {report.status === 'Submitted' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setReportStatus(report.id, 'Under Review')}
                    >
                      <Eye size={16} />
                      Under Review
                    </button>
                  )}
                  {report.status === 'Under Review' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setReportStatus(report.id, 'Scheduled')}
                    >
                      <Calendar size={16} />
                      Schedule
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setReportStatus(report.id, 'Resolved')}
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
