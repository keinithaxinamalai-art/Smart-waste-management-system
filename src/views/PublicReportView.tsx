import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  LocateFixed,
  MapPin,
  Recycle,
  Search,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { ISSUE_LABELS } from '../constants/issueLabels';
import { CANBERRA_SUBURBS } from '../services/dataStore';
import type { ReportIssue, ReportUrgency, WasteType } from '../types';
import { validateWasteReport } from '../utils/binUtils';
import { useApp } from '../hooks/useApp';
import './PublicReportView.css';

interface PublicReportViewProps {
  onBack: () => void;
  demoSuccessId?: string;
  variant?: 'standalone' | 'embedded';
}

export function PublicReportView({
  onBack,
  demoSuccessId,
  variant = 'embedded',
}: PublicReportViewProps) {
  const { submitPublicReport, reports } = useApp();
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [submittedId, setSubmittedId] = useState<string | null>(demoSuccessId ?? null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRef, setSearchRef] = useState('');

  const [issue, setIssue] = useState<ReportIssue>('overflow');
  const [location, setLocation] = useState('');
  const [suburb, setSuburb] = useState<string>('Canberra City');
  const [urgency, setUrgency] = useState<ReportUrgency>('Medium');
  const [wasteType, setWasteType] = useState<WasteType>('General');
  const [binId, setBinId] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Location is not supported on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation(
          (prev) =>
            prev ||
            `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not get your location. Please enter the address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      issue,
      issueLabel: ISSUE_LABELS[issue],
      location: location.trim(),
      suburb,
      description: description.trim(),
      urgency,
      wasteType,
      binId: binId.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
      reporterEmail: reporterEmail.trim() || undefined,
      photoAttached,
      lat: coords?.lat,
      lng: coords?.lng,
    };

    const validation = validateWasteReport(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const report = submitPublicReport(payload);
    setSubmittedId(report.id);
  };

  const filteredHistory = reports.filter(
    (r) =>
      !searchRef ||
      r.id.toLowerCase().includes(searchRef.toLowerCase()) ||
      r.suburb.toLowerCase().includes(searchRef.toLowerCase()) ||
      r.location.toLowerCase().includes(searchRef.toLowerCase())
  );

  if (submittedId) {
    return (
      <div className={`public-page public-page--${variant}`}>
        <div className="public-success">
          <div className="public-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h1>Report Submitted Successfully</h1>
          <p>Thank you for keeping Canberra clean! TCCS operations team has received your report.</p>
          <div className="public-ref">
            <span>Reference ID</span>
            <strong>{submittedId}</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>
            Status: <span className="status-pill status-submitted">Submitted</span> — In Queue for TCCS Inspection
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setSubmittedId(null);
                setTab('history');
              }}
            >
              <FileText size={16} /> Track My Reports
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={onBack}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`public-page public-page--${variant}`}>
      <header className="public-header">
        <button type="button" className="public-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="public-header-brand">
          <Recycle size={22} />
          <span>Canberra SmartWaste Citizen Portal</span>
        </div>
      </header>

      <main className="public-main">
        <div className="citizen-nav-tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'new' ? 'active' : ''}`}
            onClick={() => setTab('new')}
          >
            <Send size={16} /> Report an Issue
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            <FileText size={16} /> Track Reports ({reports.length})
          </button>
        </div>

        {tab === 'new' ? (
          <>
            <div className="public-intro">
              <h1>Report a Waste Issue</h1>
              <p>
                Spotted an overflowing bin or illegal dumping in ACT? Submit a report directly to TCCS Operations.
              </p>
            </div>

            <form className="public-form" onSubmit={handleSubmit}>
              <fieldset className="public-field">
                <legend>What is the issue? *</legend>
                <div className="public-issue-grid">
                  {(Object.keys(ISSUE_LABELS) as ReportIssue[]).map((key) => (
                    <label key={key} className={`public-issue ${issue === key ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="issue"
                        value={key}
                        checked={issue === key}
                        onChange={() => setIssue(key)}
                      />
                      {ISSUE_LABELS[key]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="public-field-row">
                <label className="public-field">
                  <span>Urgency Level *</span>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as ReportUrgency)}
                  >
                    <option value="Low">Low — Routine maintenance</option>
                    <option value="Medium">Medium — Standard cleanup</option>
                    <option value="High">High — Overflowing / hazard</option>
                    <option value="Critical">Critical — Immediate response</option>
                  </select>
                </label>

                <label className="public-field">
                  <span>Waste Type (Optional)</span>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value as WasteType)}
                  >
                    <option value="General">General Waste</option>
                    <option value="Recyclable">Recyclables</option>
                    <option value="Organic">Organics / Food</option>
                    <option value="Hazardous">Hazardous / E-Waste</option>
                  </select>
                </label>
              </div>

              <label className="public-field">
                <span>Location / Street Address *</span>
                <div className="public-input-wrap">
                  <MapPin size={18} className="public-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. London Cct near Civic Square"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                {errors.location && (
                  <span className="field-error"><AlertTriangle size={14} /> {errors.location}</span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary public-locate"
                  onClick={useMyLocation}
                  disabled={locating}
                >
                  <LocateFixed size={18} />
                  {locating ? 'Acquiring GPS location…' : 'Use GPS location'}
                </button>
              </label>

              <label className="public-field">
                <span>Canberra Suburb *</span>
                <select value={suburb} onChange={(e) => setSuburb(e.target.value)}>
                  {CANBERRA_SUBURBS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="public-field">
                <span>Smart Bin ID (Optional)</span>
                <input
                  type="text"
                  placeholder="e.g. WDN-104 or CIV-016 (if stamped on bin)"
                  value={binId}
                  onChange={(e) => setBinId(e.target.value)}
                />
              </label>

              <label className="public-field">
                <span>Detailed Description</span>
                <textarea
                  rows={3}
                  placeholder="Provide additional details to assist TCCS cleanup crews…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div className="public-field-row">
                <label className="public-field">
                  <span>Your Name (Optional)</span>
                  <input
                    type="text"
                    placeholder="Jane Resident"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                </label>
                <label className="public-field">
                  <span>Email for Updates (Optional)</span>
                  <input
                    type="email"
                    placeholder="resident@canberra.example.au"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                  />
                </label>
              </div>

              <label className="public-field photo-upload-field">
                <span>Attach Photo Evidence</span>
                <button
                  type="button"
                  className={`btn ${photoAttached ? 'btn-success' : 'btn-secondary'} photo-btn`}
                  onClick={() => setPhotoAttached(!photoAttached)}
                >
                  <ImageIcon size={18} />
                  {photoAttached ? 'Photo Attached (simulated_photo.jpg)' : 'Select Photo / Capture Image'}
                </button>
              </label>

              <button type="submit" className="btn btn-primary public-submit">
                <Send size={18} />
                Submit Waste Report
              </button>
            </form>
          </>
        ) : (
          <div className="citizen-history-section">
            <div className="history-header">
              <h2>Citizen Report Tracking History</h2>
              <p>Track the status of reported issues in real-time.</p>
            </div>

            <div className="history-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by Reference ID (e.g. WST-2026-1001) or Suburb..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
              />
            </div>

            {filteredHistory.length === 0 ? (
              <div className="card public-empty">
                <ShieldAlert size={36} />
                <p>No matching report history found.</p>
              </div>
            ) : (
              <div className="history-list">
                {filteredHistory.map((rep) => (
                  <div key={rep.id} className="history-card">
                    <div className="history-card-top">
                      <strong className="history-ref">{rep.id}</strong>
                      <span className={`status-pill status-${rep.status.toLowerCase().replace(' ', '-')}`}>
                        {rep.status}
                      </span>
                    </div>
                    <h4>{rep.issueLabel || ISSUE_LABELS[rep.issue] || rep.issue}</h4>
                    <p className="history-loc">
                      <MapPin size={14} /> {rep.location} ({rep.suburb})
                    </p>
                    {rep.description && <p className="history-desc">&quot;{rep.description}&quot;</p>}
                    <div className="history-meta">
                      <span><Clock size={14} /> {new Date(rep.createdAt).toLocaleString('en-AU')}</span>
                      <span>Urgency: <strong>{rep.urgency}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
