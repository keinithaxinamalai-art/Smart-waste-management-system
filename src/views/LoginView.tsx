import { useState } from 'react';
import { AlertCircle, LogIn, Recycle, Shield, Truck, User } from 'lucide-react';
import { BinGlyph, CitySkyline, RecycleMark } from '../components/Visuals';
import { useApp } from '../hooks/useApp';
import { authenticate, MIN_PASSWORD_LENGTH, PORTAL_ACCOUNTS } from '../lib/residentAccounts';
import { CANBERRA_SUBURBS } from '../services/dataStore';
import './LoginView.css';

interface LoginViewProps {
  onPublicReport: () => void;
  onManagerLogin?: () => void;
  onDriverLogin?: () => void;
  onCitizenLogin?: () => void;
}

type AuthMode = 'signin' | 'register';

export function LoginView({
  onPublicReport,
  onManagerLogin,
  onDriverLogin,
  onCitizenLogin,
}: LoginViewProps) {
  const { login, registerResident } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | 'citizen'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [suburb, setSuburb] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const routeAfterLogin = (role: 'admin' | 'staff' | 'citizen') => {
    if (role === 'admin') onManagerLogin?.();
    else if (role === 'staff') onDriverLogin?.();
    else onCitizenLogin?.();
  };

  const handleRoleSelect = (acc: (typeof PORTAL_ACCOUNTS)[number]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = authenticate(email, password);
    if (!result.ok || !result.user) {
      setErrorMessage(result.error ?? 'Check your email and password, then try again.');
      return;
    }
    login(result.user.role, result.user.name, result.user.email, result.user.suburb);
    routeAfterLogin(result.user.role);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = registerResident({ name, email, password, confirmPassword, suburb });
    if (!result.ok) {
      setErrorMessage(result.error ?? 'Unable to create this account.');
      return;
    }
    onCitizenLogin?.();
  };

  const quickSignIn = (r: 'admin' | 'staff' | 'citizen') => {
    const account = PORTAL_ACCOUNTS.find((a) => a.role === r);
    if (!account) return;
    login(account.role, account.name, account.email, account.suburb);
    routeAfterLogin(account.role);
  };

  return (
    <div className="login-page">
      <div className="login-official-bar">Transport Canberra and City Services · Canberra SmartWaste</div>
      <div className="login-bg" aria-hidden />
      <div className="login-container">
        <div className="login-brand">
          <div className="login-hero">
            <CitySkyline className="login-skyline" />
            <div className="login-hero-bins">
              <BinGlyph />
              <BinGlyph />
              <RecycleMark className="login-hero-mark" />
            </div>
          </div>
          <div className="login-logo">
            <Recycle size={36} strokeWidth={2.25} />
          </div>
          <h1>Canberra SmartWaste</h1>
          <p>Transport Canberra and City Services · Municipal operations</p>
          <ul className="login-highlights">
            <li>Live bin fill levels across Canberra suburbs</li>
            <li>Resident reports with an on-screen receipt</li>
            <li>Collection runs for TCCS staff</li>
          </ul>
        </div>

        <div className="login-card">
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={mode === 'signin' ? 'active' : ''}
              aria-selected={mode === 'signin'}
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              className={mode === 'register' ? 'active' : ''}
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
            >
              Create a resident account
            </button>
          </div>

          <h2>{mode === 'signin' ? 'Sign in' : 'Create a resident account'}</h2>
          <p className="login-card-sub">
            {mode === 'signin'
              ? 'Use a TCCS staff email or your resident account.'
              : 'Register once to submit reports and track them after you leave this page.'}
          </p>

          {errorMessage && (
            <div className="login-error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <>
              <div className="demo-role-selector">
                {PORTAL_ACCOUNTS.map((acc) => {
                  const IconComp = acc.role === 'admin' ? Shield : acc.role === 'staff' ? Truck : User;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      className={`demo-role-chip ${selectedRole === acc.role ? 'active' : ''}`}
                      onClick={() => handleRoleSelect(acc)}
                    >
                      <IconComp size={18} />
                      <span>{acc.role === 'admin' ? 'Administrator' : acc.role === 'staff' ? 'Collection staff' : 'Resident'}</span>
                    </button>
                  );
                })}
              </div>

              <form className="login-form" onSubmit={handleSignIn}>
                <label className="login-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </label>
                <label className="login-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="login-btn login-btn--primary">
                  <LogIn size={20} />
                  Sign in
                </button>
              </form>

              <div className="login-divider">
                <span>or sign in as</span>
              </div>
              <div className="login-quick-actions">
                <button type="button" className="btn btn-secondary" onClick={() => quickSignIn('admin')}>
                  <Shield size={16} /> Admin
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => quickSignIn('staff')}>
                  <Truck size={16} /> Staff
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => quickSignIn('citizen')}>
                  <User size={16} /> Resident
                </button>
              </div>
            </>
          ) : (
            <form className="login-form" onSubmit={handleRegister} noValidate>
              <label className="login-field">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  required
                />
              </label>
              <label className="login-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label className="login-field">
                <span>Suburb</span>
                <select value={suburb} onChange={(e) => setSuburb(e.target.value)} required>
                  <option value="">Select a Canberra suburb</option>
                  {CANBERRA_SUBURBS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="login-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
              </label>
              <label className="login-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </label>
              <button type="submit" className="login-btn login-btn--primary">
                Create account and continue
              </button>
            </form>
          )}

          {mode === 'signin' && (
            <>
              <div className="login-divider">
                <span>or report without signing in</span>
              </div>
              <button type="button" className="login-btn login-btn--public" onClick={onPublicReport}>
                <Recycle size={20} />
                Report a waste issue
                <span className="login-btn-hint">No account required</span>
              </button>
            </>
          )}
        </div>

        <p className="login-footer">
          Transport Canberra and City Services · Personal details are used only to follow up a waste report.
        </p>
      </div>
    </div>
  );
}
