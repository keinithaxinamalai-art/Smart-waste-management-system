/**
 * db.mjs — SQLite setup using Node's built-in node:sqlite (no native compile).
 */

import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
export const DB_PATH = path.join(DATA_DIR, 'smartwaste.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function dollar(obj = {}) {
  const params = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    params[`$${key}`] = value ?? null;
  }
  return params;
}

function named(sql) {
  const stmt = db.prepare(sql);
  return {
    run(objOrValue, ...rest) {
      if (objOrValue !== null && typeof objOrValue === 'object' && !Array.isArray(objOrValue)) {
        return stmt.run(dollar(objOrValue));
      }
      return stmt.run(objOrValue, ...rest);
    },
    get(objOrValue, ...rest) {
      if (objOrValue !== null && typeof objOrValue === 'object' && !Array.isArray(objOrValue)) {
        return stmt.get(dollar(objOrValue));
      }
      return stmt.get(objOrValue, ...rest);
    },
    all(objOrValue, ...rest) {
      if (objOrValue !== undefined && objOrValue !== null && typeof objOrValue === 'object' && !Array.isArray(objOrValue)) {
        return stmt.all(dollar(objOrValue));
      }
      if (objOrValue === undefined) return stmt.all();
      return stmt.all(objOrValue, ...rest);
    },
  };
}

function withTx(fn) {
  db.exec('BEGIN');
  try {
    fn();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function countOf(table) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
  return Number(row?.c ?? 0);
}

export function getBinStatusServer(fillLevel) {
  const fl = Math.max(0, Math.min(100, Math.round(Number(fillLevel) || 0)));
  if (fl >= 90) return 'Critical';
  if (fl >= 80) return 'Collection Required';
  if (fl >= 50) return 'Moderate';
  return 'Normal';
}

export function calcPriorityServer(fillLevel, hoursSinceCollected = 0) {
  const safeFill = Math.max(0, Math.min(100, Number(fillLevel) || 0));
  const safeHours = Math.max(0, Number(hoursSinceCollected) || 0);
  const fillContrib = safeFill * 0.5;
  const overdueContrib = Math.min(20, safeHours * 0.8);
  const score = Math.round(Math.min(100, fillContrib + overdueContrib));
  let priority = 'Low';
  if (score >= 80) priority = 'Critical';
  else if (score >= 60) priority = 'High';
  else if (score >= 40) priority = 'Medium';
  return { score, priority };
}

export function hoursSinceCollected(lastCollected, now = Date.now()) {
  const timestamp = Date.parse(lastCollected || '');
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, (now - timestamp) / 3600000);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS bins (
    id                TEXT PRIMARY KEY,
    location          TEXT NOT NULL,
    suburb            TEXT NOT NULL,
    fill_level        INTEGER NOT NULL DEFAULT 0,
    waste_type        TEXT NOT NULL DEFAULT 'General',
    status            TEXT NOT NULL DEFAULT 'Normal',
    sensor_status     TEXT NOT NULL DEFAULT 'Online',
    last_collected    TEXT,
    collection_priority TEXT NOT NULL DEFAULT 'Low',
    priority_score    INTEGER NOT NULL DEFAULT 0,
    lat               REAL,
    lng               REAL,
    updated_at        TEXT
  );

  CREATE TABLE IF NOT EXISTS public_reports (
    id              TEXT PRIMARY KEY,
    issue           TEXT NOT NULL,
    issue_label     TEXT,
    location        TEXT NOT NULL,
    suburb          TEXT NOT NULL,
    description     TEXT,
    urgency         TEXT NOT NULL DEFAULT 'Low',
    waste_type      TEXT,
    bin_id          TEXT,
    reporter_name   TEXT,
    reporter_email  TEXT,
    photo_attached  INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'Submitted',
    created_at      TEXT NOT NULL,
    lat             REAL,
    lng             REAL
  );

  CREATE TABLE IF NOT EXISTS collections (
    id              TEXT PRIMARY KEY,
    bin_id          TEXT NOT NULL,
    suburb          TEXT NOT NULL,
    location        TEXT NOT NULL,
    scheduled_date  TEXT,
    status          TEXT NOT NULL DEFAULT 'Pending',
    priority        TEXT NOT NULL DEFAULT 'Low',
    assigned_to     TEXT,
    completed_at    TEXT
  );

  CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id          TEXT PRIMARY KEY,
    bin_id      TEXT NOT NULL,
    location    TEXT NOT NULL,
    suburb      TEXT NOT NULL,
    fault_type  TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Open',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    notes       TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL,
    suburb      TEXT,
    created_at  TEXT NOT NULL
  );
`);

const INITIAL_BINS = [
  { id: 'WDN-104', location: 'Weston Creek — Park St', suburb: 'Woden', fill_level: 92, waste_type: 'General', sensor_status: 'Online', last_collected: '2026-08-21T14:30:00Z', lat: -35.352, lng: 149.083 },
  { id: 'BEL-022', location: 'Belconnen — Cohen St Bus Interchange', suburb: 'Belconnen', fill_level: 84, waste_type: 'Recyclable', sensor_status: 'Online', last_collected: '2026-08-22T06:00:00Z', lat: -35.238, lng: 149.064 },
  { id: 'CIV-016', location: 'Canberra City — London Cct near Civic Sq', suburb: 'Canberra City', fill_level: 80, waste_type: 'General', sensor_status: 'Online', last_collected: '2026-08-22T08:15:00Z', lat: -35.281, lng: 149.13 },
  { id: 'TUG-009', location: 'Tuggeranong — Anketell St Mall', suburb: 'Tuggeranong', fill_level: 42, waste_type: 'Organic', sensor_status: 'Warning', last_collected: '2026-08-22T11:00:00Z', lat: -35.415, lng: 149.068 },
  { id: 'GUN-015', location: 'Gungahlin — Hibberson St Light Rail', suburb: 'Gungahlin', fill_level: 95, waste_type: 'General', sensor_status: 'Fault', last_collected: '2026-08-20T18:00:00Z', lat: -35.185, lng: 149.133 },
  { id: 'MAN-031', location: 'Manuka — Furneaux St Shops', suburb: 'Manuka', fill_level: 56, waste_type: 'Recyclable', sensor_status: 'Online', last_collected: '2026-08-22T09:30:00Z', lat: -35.321, lng: 149.134 },
  { id: 'WOD-007', location: 'Woden — Bowes St Plaza', suburb: 'Woden', fill_level: 71, waste_type: 'General', sensor_status: 'Online', last_collected: '2026-08-22T07:45:00Z', lat: -35.345, lng: 149.086 },
  { id: 'DIC-008', location: 'Dickson — Woolley St Dining Strip', suburb: 'Dickson', fill_level: 88, waste_type: 'Organic', sensor_status: 'Online', last_collected: '2026-08-21T20:00:00Z', lat: -35.25, lng: 149.137 },
  { id: 'KNG-019', location: 'Kingston — Foreshore Promenade', suburb: 'Kingston', fill_level: 34, waste_type: 'General', sensor_status: 'Offline', last_collected: '2026-08-22T10:00:00Z', lat: -35.315, lng: 149.146 },
];

const INITIAL_REPORTS = [
  { id: 'WST-2026-1001', issue: 'overflow', issue_label: 'Overflowing Bin', location: 'London Cct near Civic Square', suburb: 'Canberra City', description: 'Public litter bin overflowing onto pedestrian footpath.', urgency: 'High', waste_type: 'General', bin_id: 'CIV-016', reporter_name: 'Alex Mercer', reporter_email: 'alex.m@canberra.example.au', photo_attached: 1, status: 'Submitted', lat: -35.281, lng: 149.13 },
  { id: 'WST-2026-1002', issue: 'damaged', issue_label: 'Damaged Bin', location: 'Cohen St Interchange Stop A', suburb: 'Belconnen', description: 'Side latch broken and lid missing.', urgency: 'Medium', waste_type: 'Recyclable', bin_id: 'BEL-022', reporter_name: 'Samantha Lee', reporter_email: 'sam.lee@belconnen.example.au', photo_attached: 0, status: 'Under Review', lat: -35.238, lng: 149.064 },
  { id: 'WST-2026-1003', issue: 'hazardous', issue_label: 'Hazardous Waste', location: 'Hibberson St Light Rail Station', suburb: 'Gungahlin', description: 'Chemical containers left next to general waste bin.', urgency: 'Critical', waste_type: 'Hazardous', bin_id: 'GUN-015', reporter_name: 'David K.', photo_attached: 1, status: 'Scheduled', lat: -35.185, lng: 149.133 },
];

const INITIAL_COLLECTIONS = [
  { id: 'COL-801', bin_id: 'WDN-104', suburb: 'Woden', location: 'Weston Creek — Park St', scheduled_date: '2026-08-22T20:00:00Z', status: 'Pending', priority: 'Critical', assigned_to: 'Route Driver 1 (ACT-TRK-04)' },
  { id: 'COL-802', bin_id: 'GUN-015', suburb: 'Gungahlin', location: 'Gungahlin — Hibberson St Light Rail', scheduled_date: '2026-08-22T20:30:00Z', status: 'Pending', priority: 'Critical', assigned_to: 'Route Driver 1 (ACT-TRK-04)' },
  { id: 'COL-803', bin_id: 'DIC-008', suburb: 'Dickson', location: 'Dickson — Woolley St Dining Strip', scheduled_date: '2026-08-22T21:00:00Z', status: 'Scheduled', priority: 'High', assigned_to: 'Route Driver 2 (ACT-TRK-02)' },
];

const INITIAL_TICKETS = [
  { id: 'MT-101', bin_id: 'GUN-015', location: 'Gungahlin — Hibberson St Light Rail', suburb: 'Gungahlin', fault_type: 'sensor_error', status: 'Open', notes: 'Ultrasonic fill sensor dropped three consecutive heartbeats.' },
  { id: 'MT-102', bin_id: 'TUG-009', location: 'Tuggeranong — Anketell St Mall', suburb: 'Tuggeranong', fault_type: 'low_battery', status: 'Open', notes: 'Battery telemetry reported 14% remaining voltage.' },
  { id: 'MT-103', bin_id: 'WOD-007', location: 'Woden — Bowes St Plaza', suburb: 'Woden', fault_type: 'lid_jam', status: 'In Progress', notes: 'Lid actuator jammed after peak lunch traffic. Technician assigned.' },
  { id: 'MT-104', bin_id: 'KNG-019', location: 'Kingston — Foreshore Promenade', suburb: 'Kingston', fault_type: 'offline', status: 'Open', notes: 'No RF ping received for more than 2 hours.' },
];

const INITIAL_USERS = [
  { id: 'user-admin-01', name: 'Operations Manager', email: 'admin@smartwaste.demo', password: 'DemoAdmin123!', role: 'admin', suburb: 'Civic' },
  { id: 'user-staff-01', name: 'Collection Officer', email: 'staff@smartwaste.demo', password: 'DemoStaff123!', role: 'staff', suburb: 'Belconnen' },
  { id: 'user-citizen-01', name: 'Canberra Resident', email: 'citizen@smartwaste.demo', password: 'DemoCitizen123!', role: 'citizen', suburb: 'Civic' },
];

function insertSeedBins() {
  const insertBin = named(`
    INSERT INTO bins (id, location, suburb, fill_level, waste_type, status, sensor_status, last_collected, collection_priority, priority_score, lat, lng, updated_at)
    VALUES ($id, $location, $suburb, $fill_level, $waste_type, $status, $sensor_status, $last_collected, $collection_priority, $priority_score, $lat, $lng, $updated_at)
  `);
  for (const b of INITIAL_BINS) {
    const { score, priority } = calcPriorityServer(b.fill_level, 48);
    insertBin.run({
      ...b,
      status: getBinStatusServer(b.fill_level),
      collection_priority: priority,
      priority_score: score,
      updated_at: new Date().toISOString(),
    });
  }
}

function insertSeedReports() {
  const insertReport = named(`
    INSERT INTO public_reports (id, issue, issue_label, location, suburb, description, urgency, waste_type, bin_id, reporter_name, reporter_email, photo_attached, status, created_at, lat, lng)
    VALUES ($id, $issue, $issue_label, $location, $suburb, $description, $urgency, $waste_type, $bin_id, $reporter_name, $reporter_email, $photo_attached, $status, $created_at, $lat, $lng)
  `);
  for (const r of INITIAL_REPORTS) {
    insertReport.run({
      ...r,
      reporter_email: r.reporter_email || null,
      bin_id: r.bin_id || null,
      waste_type: r.waste_type || null,
      issue_label: r.issue_label || null,
      lat: r.lat || null,
      lng: r.lng || null,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    });
  }
}

function insertSeedCollections() {
  const insertCol = named(`
    INSERT INTO collections (id, bin_id, suburb, location, scheduled_date, status, priority, assigned_to)
    VALUES ($id, $bin_id, $suburb, $location, $scheduled_date, $status, $priority, $assigned_to)
  `);
  for (const c of INITIAL_COLLECTIONS) insertCol.run(c);
}

function insertSeedTickets() {
  const insertTicket = named(`
    INSERT INTO maintenance_tickets (id, bin_id, location, suburb, fault_type, status, created_at, updated_at, notes)
    VALUES ($id, $bin_id, $location, $suburb, $fault_type, $status, $created_at, $updated_at, $notes)
  `);
  const now = new Date().toISOString();
  for (const t of INITIAL_TICKETS) {
    insertTicket.run({ ...t, created_at: now, updated_at: now, notes: t.notes || null });
  }
}

function insertSeedUsers() {
  const insertUser = named(`
    INSERT INTO users (id, name, email, password, role, suburb, created_at)
    VALUES ($id, $name, $email, $password, $role, $suburb, $created_at)
  `);
  const now = new Date().toISOString();
  for (const user of INITIAL_USERS) insertUser.run({ ...user, created_at: now });
}

if (countOf('bins') === 0) {
  withTx(insertSeedBins);
  console.log('[db] Seeded bins table with demo data');
}
if (countOf('public_reports') === 0) {
  withTx(insertSeedReports);
  console.log('[db] Seeded public_reports table with demo data');
}
if (countOf('collections') === 0) {
  withTx(insertSeedCollections);
  console.log('[db] Seeded collections table with demo data');
}
if (countOf('maintenance_tickets') === 0) {
  withTx(insertSeedTickets);
  console.log('[db] Seeded maintenance_tickets table with demo data');
}
if (countOf('users') === 0) {
  withTx(insertSeedUsers);
  console.log('[db] Seeded users table with demo accounts');
}

export function resetDemoData() {
  withTx(() => {
    db.exec('DELETE FROM public_reports');
    db.exec('DELETE FROM collections');
    db.exec('DELETE FROM maintenance_tickets');
    db.exec('DELETE FROM bins');
    db.exec('DELETE FROM users');
    insertSeedBins();
    insertSeedReports();
    insertSeedCollections();
    insertSeedTickets();
    insertSeedUsers();
  });
}

export const stmts = {
  getAllBins: named('SELECT * FROM bins ORDER BY priority_score DESC'),
  getBinById: named('SELECT * FROM bins WHERE id = ?'),
  updateBinTelemetry: named(`
    UPDATE bins SET fill_level=$fill_level, status=$status, sensor_status=$sensor_status,
    collection_priority=$collection_priority, priority_score=$priority_score, updated_at=$updated_at
    WHERE id=$id
  `),
  collectBin: named(`
    UPDATE bins SET fill_level=5, status='Normal', collection_priority='Low', priority_score=3,
    last_collected=$now, updated_at=$now WHERE id=$id
  `),
  getAllCollections: named('SELECT * FROM collections ORDER BY scheduled_date ASC'),
  getCollectionsByBin: named('SELECT * FROM collections WHERE bin_id = ?'),
  markCollectionsComplete: named(`
    UPDATE collections SET status='Completed', completed_at=$now WHERE bin_id=$bin_id AND status != 'Completed'
  `),
  resolveReportsForBin: named(`
    UPDATE public_reports SET status='Resolved' WHERE bin_id=$bin_id AND status != 'Resolved'
  `),
  assignRoutePending: named(`
    UPDATE collections SET status='Scheduled', assigned_to=$driver WHERE status='Pending'
  `),
  getAllUsers: named('SELECT * FROM users ORDER BY role, name'),
  getUserByEmail: named('SELECT * FROM users WHERE lower(email) = lower(?)'),
  insertUser: named(`
    INSERT INTO users (id, name, email, password, role, suburb, created_at)
    VALUES ($id, $name, $email, $password, $role, $suburb, $created_at)
  `),
  deleteUserByEmail: named('DELETE FROM users WHERE lower(email) = lower(?)'),
  getAllReports: named('SELECT * FROM public_reports ORDER BY created_at DESC'),
  getAllTickets: named('SELECT * FROM maintenance_tickets ORDER BY created_at DESC'),
};

console.log(`[db] SQLite database ready at ${DB_PATH}`);
