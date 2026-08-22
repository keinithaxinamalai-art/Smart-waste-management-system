import { useState } from 'react';
import { LogIn, Recycle, Shield, Truck, User } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { UserRole } from '../types';
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
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@canberra.act.gov.au');
  const [password, setPassword] = useState('••••••••');

  const DEMO_ACCOUNTS = [
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      email: 'admin@canberra.act.gov.au',
      name: 'TCCS Manager (Bijay P.)',
      desc: 'System oversight, statistics, priority management & reports',
      icon: Shield,
    },
    {
      role: 'staff' as UserRole,
      title: 'Collection Staff',
      email: 'staff@canberra.act.gov.au',
      name: 'Route Driver (Krishna / Samir)',
      desc: 'Priority collection queue, bin pickup & route execution',
      icon: Truck,
    },
    {
      role: 'citizen' as UserRole,
      title: 'Citizen User',
      email: 'citizen@canberra.act.gov.au',
      name: 'Canberra Resident (Ayush A.)',
      desc: 'Report overflowing bins, track report status & history',
      icon: User,
    },
  ];

  const handleRoleSelect = (r: UserRole, defaultEmail: string) => {
    setSelectedRole(r);
    setEmail(defaultEmail);
    setPassword('••••••••');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS.find((a) => a.role === selectedRole);
    login(selectedRole, account?.name, email);
    if (selectedRole === 'admin') onManagerLogin?.();
    else if (selectedRole === 'staff') onDriverLogin?.();
    else onCitizenLogin?.();
  };

  const quickSignIn = (r: UserRole) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === r);
    login(r, account?.name, account?.email);
    if (r === 'admin') onManagerLogin?.();
    else if (r === 'staff') onDriverLogin?.();
    else onCitizenLogin?.();
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
          <p>TCCS Pilot · Territory & Municipal Services (ACT Government)</p>
        </div>

        <div className="login-card">
          <h2>Demonstration Sign In</h2>
          <p className="login-card-sub">
            Select a role or quick demo account to access the smart waste management portal.
          </p>

          <div className="demo-role-selector">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComp = acc.icon;
              const isSelected = selectedRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  className={`demo-role-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(acc.role, acc.email)}
                >
                  <IconComp size={18} />
                  <span>{acc.title}</span>
                </button>
              );
            })}
          </div>

          <form className="login-form" onSubmit={handleSignIn}>
            <label className="login-field">
              <span>Demo Username / Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="login-field">
              <span>Password (Demo Authentication)</span>
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
            <span>or 1-click quick demo switch</span>
          </div>

          <div className="login-quick-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('admin')}
            >
              <Shield size={16} /> Admin Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('staff')}
            >
              <Truck size={16} /> Staff Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickSignIn('citizen')}
            >
              <User size={16} /> Citizen Demo
            </button>
          </div>

          <div className="login-divider">
            <span>or for anonymous reporting</span>
          </div>

          <button
            type="button"
            className="login-btn login-btn--public"
            onClick={onPublicReport}
          >
            <Recycle size={20} />
            Report a Full Bin (Public)
            <span className="login-btn-hint">No sign-in required</span>
          </button>
        </div>

        <p className="login-footer">
          Notice: Prototype sensor telemetry & ACT Government demonstration account system.
        </p>
      </div>
    </div>
  );
}
