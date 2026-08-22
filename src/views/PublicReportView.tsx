import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Recycle,
  Send,
} from 'lucide-react';
import { ISSUE_LABELS } from '../constants/issueLabels';
import { useApp } from '../hooks/useApp';
import type { ReportIssue } from '../types';
import './PublicReportView.css';

const ACT_SUBURBS = [
  'Civic',
  'Belconnen',
  'Gungahlin',
  'Tuggeranong',
  'Woden',
  'Weston Creek',
  'Manuka',
  'Fyshwick',
  'Dickson',
  'Braddon',
  'Other',
];

interface PublicReportViewProps {
  onBack: () => void;
  demoSuccessId?: string;
  /** Narrow mobile column only when opened from login (not from manager shell). */
  variant?: 'standalone' | 'embedded';
}

export function PublicReportView({
  onBack,
  demoSuccessId,
  variant = 'embedded',
}: PublicReportViewProps) {
  const { submitPublicReport } = useApp();
  const [submittedId, setSubmittedId] = useState<string | null>(demoSuccessId ?? null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [issue, setIssue] = useState<ReportIssue>('full_bin');
  const [location, setLocation] = useState('');
  const [suburb, setSuburb] = useState('Civic');
  const [binId, setBinId] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

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
    if (!location.trim()) return;

    const report = submitPublicReport({
      issue,
      issueLabel: ISSUE_LABELS[issue],
      location: location.trim(),
      suburb,
      description: description.trim(),
      urgency: 'Medium',
      binId: binId.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
      reporterEmail: reporterEmail.trim() || undefined,
      photoAttached: false,
      lat: coords?.lat,
      lng: coords?.lng,
    });
    setSubmittedId(report.id);
  };

  if (submittedId) {
    return (
      <div className={`public-page public-page--${variant}`}>
        <div className="public-success">
          <div className="public-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h1>Report submitted</h1>
          <p>Thank you. TCCS operations will review your report shortly.</p>
          <div className="public-ref">
            <span>Reference</span>
            <strong>{submittedId}</strong>
          </div>
          <button type="button" className="btn btn-primary public-submit" onClick={onBack}>
            Back to home
          </button>
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
          <span>Report a bin</span>
        </div>
      </header>

      <main className="public-main">
        <div className="public-intro">
          <h1>Report an issue</h1>
          <p>
            Help keep Canberra clean. Report full bins, overflow, or damage — no account
            needed.
          </p>
        </div>

        <form className="public-form" onSubmit={handleSubmit}>
          <fieldset className="public-field">
            <legend>What&apos;s the issue?</legend>
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

          <label className="public-field">
            <span>Location / address</span>
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
            <button
              type="button"
              className="btn btn-secondary public-locate"
              onClick={useMyLocation}
              disabled={locating}
            >
              <LocateFixed size={18} />
              {locating ? 'Getting location…' : 'Use my location'}
            </button>
          </label>

          <label className="public-field">
            <span>Suburb</span>
            <select value={suburb} onChange={(e) => setSuburb(e.target.value)}>
              {ACT_SUBURBS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="public-field">
            <span>Bin ID (optional)</span>
            <input
              type="text"
              placeholder="e.g. WDN-104 — if shown on the bin"
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
            />
          </label>

          <label className="public-field">
            <span>Description</span>
            <textarea
              rows={3}
              placeholder="Describe what you see…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="public-field-row">
            <label className="public-field">
              <span>Your name (optional)</span>
              <input
                type="text"
                placeholder="Jane Citizen"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
            </label>
            <label className="public-field">
              <span>Email (optional)</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary public-submit">
            <Send size={18} />
            Submit report
          </button>
        </form>
      </main>
    </div>
  );
}
