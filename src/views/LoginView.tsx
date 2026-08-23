import { useState } from 'react';
import { AlertCircle, LogIn, Recycle, Shield, Truck, User } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import './LoginView.css';

interface LoginViewProps {
  onPublicReport: () => void;
  onManagerLogin?: () => void;
  onDriverLogin?: () => void;
  onCitizenLogin?: () => void;
}

export function LoginView({
  onPublicReport,
  onManagerLogin,
  onDriverLogin,
  onCitizenLogin,
}: LoginViewProps) {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | 'citizen'>('admin');
  const [email, setEmail] = useState('admin@smartwaste.demo');
  const [password, setPassword] = useState('DemoAdmin123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const DEMO_ACCOUNTS = [
    {
      role: 'admin' as const,
      title: 'Administrator',
      email: 'admin@smartwaste.demo',
      pass: 'DemoAdmin123!',
      name: 'TCCS Manager (Bijay P.)',
      desc: 'System oversight, statistics, priority management & report administration',
      icon: Shield,
    },
    {
      role: 'staff' as const,
      title: 'Collection Staff',
      email: 'staff@smartwaste.demo',
      pass: 'DemoStaff123!',
      name: 'Route Driver 1 (Krishna / Samir)',
      desc: 'Priority collection queue, bin pickup & route execution',
      icon: Truck,
    },
    {
      role: 'citizen' as const,
      title: 'Citizen',
      email: 'citizen@smartwaste.demo',
      pass: 'DemoCitizen123!',
      name: 'Canberra Resident (Ayush A. / Charanpal K.)',
      desc: 'Report waste issues, track report status & view personal report history',
      icon: User,
    },
  ];

  const handleRoleSelect = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const matchingAccount = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === trimmedEmail && a.pass === password
    );

    if (!matchingAccount) {
      setErrorMessage(
        'Invalid prototype login credentials. Please use admin@smartwaste.demo / DemoAdmin123!, staff@smartwaste.demo / DemoStaff123!, or citizen@smartwaste.demo / DemoCitizen123!.'
      );
      return;
    }

    login(matchingAccount.role, matchingAccount.name, matchingAccount.email);
    if (matchingAccount.role === 'admin') onManagerLogin?.();
    else if (matchingAccount.role === 'staff') onDriverLogin?.();
    else onCitizenLogin?.();
  };

  const quickSignIn = (r: 'admin' | 'staff' | 'citizen') => {
    setErrorMessage(null);
    const account = DEMO_ACCOUNTS.find((a) => a.role === r);
    if (account) {
      setEmail(account.email);
      setPassword(account.pass);
      setSelectedRole(account.role);
      login(r, account.name, account.email);
      if (r === 'admin') onManagerLogin?.();
      else if (r === 'staff') onDriverLogin?.();
      else onCitizenLogin?.();
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden />
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <Recycle size={36} strokeWidth={2.25} />
          </div>
          <h1>Canberra SmartWaste</h1>
          <p>TCCS Pilot · Prototype Smart Waste Management System</p>
        </div>

        <div className="login-card">
          <h2>Prototype Sign In</h2>
          <p className="login-card-sub">
            Select a prototype role account to sign in and access the system.
          </p>

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="demo-role-selector">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComp = acc.icon;
              const isSelected = selectedRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  className={`demo-role-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(acc)}
                >
                  <IconComp size={18} />
                  <span>{acc.title}</span>
                </button>
              );
            })}
          </div>

          <form className="login-form" onSubmit={handleSignIn}>
            <label className="login-field">
              <span>Prototype Account Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="login-field">
              <span>Prototype Account Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-btn login-btn--primary">
              <LogIn size={20} />
              Sign in as {DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.title}
            </button>
          </form>

          <div className="login-divider">
            <span>or 1-click quick demo sign in</span>
          </div>

          <div className="login-quick-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('admin')}
            >
              <Shield size={16} /> Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('staff')}
            >
              <Truck size={16} /> Staff
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('citizen')}
            >
              <User size={16} /> Citizen
            </button>
          </div>

          <div className="login-divider">
            <span>or anonymous public reporting</span>
          </div>

          <button
            type="button"
            className="login-btn login-btn--public"
            onClick={onPublicReport}
          >
            <Recycle size={20} />
            Report a Full Bin (Public)
            <span className="login-btn-hint">No account required</span>
          </button>
        </div>

        <p className="login-footer">
          Demonstration data & simulated smart-bin sensor monitoring for Iteration 1 prototype.
        </p>
      </div>
    </div>
  );
}
