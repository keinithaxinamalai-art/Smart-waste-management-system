import type { UserRole } from '../types';

const STORAGE_KEY = 'swm_resident_accounts';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export interface PortalAccount {
  role: Exclude<UserRole, null>;
  name: string;
  email: string;
  password: string;
  suburb?: string;
}

export const PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    role: 'admin',
    name: 'Operations Manager',
    email: 'admin@smartwaste.demo',
    password: 'DemoAdmin123!',
    suburb: 'Civic',
  },
  {
    role: 'staff',
    name: 'Collection Officer',
    email: 'staff@smartwaste.demo',
    password: 'DemoStaff123!',
    suburb: 'Belconnen',
  },
  {
    role: 'citizen',
    name: 'Canberra Resident',
    email: 'citizen@smartwaste.demo',
    password: 'DemoCitizen123!',
    suburb: 'Civic',
  },
];

export interface ResidentAccount {
  name: string;
  email: string;
  password: string;
  suburb: string;
}

export interface AuthSuccess {
  role: Exclude<UserRole, null>;
  name: string;
  email: string;
  suburb?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: AuthSuccess;
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function loadResidentAccounts(): ResidentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResidentAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveResidentAccounts(accounts: ResidentAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function findPortalAccount(email: string): PortalAccount | undefined {
  const key = normaliseEmail(email);
  return PORTAL_ACCOUNTS.find((a) => normaliseEmail(a.email) === key);
}

export function findResidentAccount(email: string): ResidentAccount | undefined {
  const key = normaliseEmail(email);
  return loadResidentAccounts().find((a) => normaliseEmail(a.email) === key);
}

export function authenticate(email: string, password: string): AuthResult {
  if (!email.trim() || !password) {
    return { ok: false, error: 'Enter your email and password.' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  const portal = findPortalAccount(email);
  if (portal) {
    if (portal.password !== password) {
      return { ok: false, error: 'Check your email and password, then try again.' };
    }
    return {
      ok: true,
      user: {
        role: portal.role,
        name: portal.name,
        email: portal.email,
        suburb: portal.suburb,
      },
    };
  }

  const resident = findResidentAccount(email);
  if (!resident || resident.password !== password) {
    return { ok: false, error: 'Check your email and password, then try again.' };
  }

  return {
    ok: true,
    user: {
      role: 'citizen',
      name: resident.name,
      email: resident.email,
      suburb: resident.suburb,
    },
  };
}

export function registerResident(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  suburb: string;
}): AuthResult {
  const name = input.name.trim();
  const email = normaliseEmail(input.email);
  const suburb = input.suburb.trim();

  if (!name) return { ok: false, error: 'Enter your full name.' };
  if (!email) return { ok: false, error: 'Enter your email address.' };
  if (!isValidEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (!suburb) return { ok: false, error: 'Select your suburb.' };
  if (!input.password) return { ok: false, error: 'Create a password.' };
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: 'Passwords do not match.' };
  }
  if (findPortalAccount(email) || findResidentAccount(email)) {
    return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
  }

  const account: ResidentAccount = {
    name,
    email,
    password: input.password,
    suburb,
  };
  const accounts = loadResidentAccounts();
  accounts.push(account);
  saveResidentAccounts(accounts);

  return {
    ok: true,
    user: { role: 'citizen', name, email, suburb },
  };
}
