/**
 * index.mjs — SmartWaste Express API Server
 *
 * Provides REST endpoints for the React frontend and subscribes to MQTT
 * telemetry to update the SQLite database in real time.
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/bins
 *   GET  /api/bins/:id
 *   PATCH /api/bins/:id
 *   POST  /api/bins/:id/collect
 *   GET  /api/collections
 *   POST /api/routes/assign
 *   GET  /api/reports
 *   POST /api/reports
 *   PATCH /api/reports/:id
 *   GET  /api/tickets
 *   PATCH /api/tickets/:id
 *   GET  /api/users
 *   POST /api/login
 *   POST /api/register
 *   GET  /api/database
 */

import express from 'express';
import cors from 'cors';
import { db, stmts, getBinStatusServer, calcPriorityServer, hoursSinceCollected, resetDemoData, DB_PATH } from './db.mjs';

const PORT = process.env.PORT || 3001;
const MQTT_URL = 'mqtt://localhost:1883';
const TELEMETRY_TOPIC = 'smartwaste/bins/+/telemetry';

const app = express();
let mqttClient;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ────────────────────────────────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  const binCount = db.prepare('SELECT COUNT(*) as c FROM bins').get();
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
  res.json({
    status: 'ok',
    bins: Number(binCount?.c ?? 0),
    users: Number(userCount?.c ?? 0),
    timestamp: new Date().toISOString(),
  });
});

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    suburb: row.suburb,
    createdAt: row.created_at,
  };
}

app.get('/api/users', (_req, res) => {
  res.json(stmts.getAllUsers.all().map(rowToUser));
});

app.post('/api/login', (req, res) => {
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const row = stmts.getUserByEmail.get(email);
  if (!row || row.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    suburb: row.suburb,
  });
});

app.post('/api/register', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const suburb = String(req.body?.suburb || '').trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (stmts.getUserByEmail.get(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = {
    id: `user-citizen-${Date.now().toString(36)}`,
    name,
    email,
    password,
    role: 'citizen',
    suburb: suburb || 'Canberra City',
    created_at: new Date().toISOString(),
  };
  stmts.insertUser.run(user);
  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    suburb: user.suburb,
  });
});

app.get('/api/database', (_req, res) => {
  res.json({
    file: DB_PATH,
    users: stmts.getAllUsers.all().map(rowToUser),
    bins: stmts.getAllBins.all(),
    reports: stmts.getAllReports.all(),
    collections: stmts.getAllCollections.all(),
    tickets: stmts.getAllTickets.all(),
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Bins
// ────────────────────────────────────────────────────────────────────────────

/** Converts a DB row to the shape expected by the React frontend (camelCase) */
function rowToFrontendBin(row) {
  if (!row) return null;
  return {
    id: row.id,
    location: row.location,
    suburb: row.suburb,
    fillLevel: row.fill_level,
    wasteType: row.waste_type,
    status: row.status,
    sensorStatus: row.sensor_status,
    lastCollected: row.last_collected,
    collectionPriority: row.collection_priority,
    priorityScore: row.priority_score,
    lat: row.lat,
    lng: row.lng,
  };
}

app.get('/api/bins', (_req, res) => {
  const rows = stmts.getAllBins.all();
  res.json(rows.map(rowToFrontendBin));
});

app.get('/api/bins/:id', (req, res) => {
  const row = stmts.getBinById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bin not found' });
  res.json(rowToFrontendBin(row));
});

app.patch('/api/bins/:id', (req, res) => {
  const row = stmts.getBinById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bin not found' });

  const { fillLevel, sensorStatus } = req.body;
  const newFill = fillLevel !== undefined ? Number(fillLevel) : row.fill_level;
  const newSensor = sensorStatus || row.sensor_status;
  const newStatus = getBinStatusServer(newFill);
  const { score, priority } = calcPriorityServer(newFill, hoursSinceCollected(row.last_collected));

  stmts.updateBinTelemetry.run({
    id: req.params.id,
    fill_level: newFill,
    status: newStatus,
    sensor_status: newSensor,
    collection_priority: priority,
    priority_score: score,
    updated_at: new Date().toISOString(),
  });

  const updated = stmts.getBinById.get(req.params.id);
  res.json(rowToFrontendBin(updated));
});

// ────────────────────────────────────────────────────────────────────────────
// Collection
// ────────────────────────────────────────────────────────────────────────────

app.post('/api/bins/:id/collect', (req, res) => {
  const row = stmts.getBinById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bin not found' });

  const now = new Date().toISOString();

  // Reset bin (mirrors executeBinCollection in dataStore.ts)
  stmts.collectBin.run({ id: req.params.id, now });

  // Mark associated collection records complete
  stmts.markCollectionsComplete.run({ bin_id: req.params.id, now });

  // Resolve reports explicitly linked to this bin
  stmts.resolveReportsForBin.run({ bin_id: req.params.id });

  const updatedBin = stmts.getBinById.get(req.params.id);
  mqttClient?.publish(
    `smartwaste/bins/${req.params.id}/collected`,
    JSON.stringify({ binId: req.params.id, fillLevel: 5, timestamp: now }),
    { qos: 0, retain: false },
  );
  res.json({ success: true, bin: rowToFrontendBin(updatedBin) });
});

app.post('/api/reset', (_req, res) => {
  resetDemoData();
  res.json({ success: true });
});

app.get('/api/collections', (_req, res) => {
  const rows = stmts.getAllCollections.all();
  res.json(rows.map((r) => ({
    id: r.id,
    binId: r.bin_id,
    suburb: r.suburb,
    location: r.location,
    scheduledDate: r.scheduled_date,
    status: r.status,
    priority: r.priority,
    assignedTo: r.assigned_to,
    completedAt: r.completed_at,
  })));
});

app.post('/api/routes/assign', (req, res) => {
  const driver = req.body?.driver || 'Route Driver 1 (ACT-TRK-04)';
  const result = stmts.assignRoutePending.run({ driver });
  res.json({ success: true, updated: Number(result?.changes ?? 0) });
});

// ────────────────────────────────────────────────────────────────────────────
// Public reports
// ────────────────────────────────────────────────────────────────────────────

const REPORT_STATUSES = ['Submitted', 'Under Review', 'Scheduled', 'Resolved'];
const REPORT_URGENCIES = ['Low', 'Medium', 'High', 'Critical'];
const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved'];

function rowToFrontendReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    issue: row.issue,
    issueLabel: row.issue_label ?? undefined,
    location: row.location,
    suburb: row.suburb,
    description: row.description ?? '',
    urgency: row.urgency,
    wasteType: row.waste_type ?? undefined,
    binId: row.bin_id ?? undefined,
    reporterName: row.reporter_name ?? undefined,
    reporterEmail: row.reporter_email ?? undefined,
    accountEmail: row.account_email ?? undefined,
    photoAttached: Boolean(row.photo_attached),
    status: row.status,
    createdAt: row.created_at,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

function optionalText(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

app.get('/api/reports', (_req, res) => {
  res.json(stmts.getAllReports.all().map(rowToFrontendReport));
});

app.post('/api/reports', (req, res) => {
  const body = req.body ?? {};
  const location = optionalText(body.location);
  const suburb = optionalText(body.suburb);
  const issue = optionalText(body.issue);
  if (!location || !suburb || !issue) {
    return res.status(400).json({ error: 'Issue, location and suburb are required.' });
  }

  let id = optionalText(body.id);
  if (!id || stmts.getReportById.get(id)) {
    id = `WST-2026-${Date.now().toString().slice(-6)}`;
  }
  const now = new Date().toISOString();
  const binId = optionalText(body.binId);
  const urgency = REPORT_URGENCIES.includes(body.urgency) ? body.urgency : 'Medium';

  stmts.insertReport.run({
    id,
    issue,
    issue_label: optionalText(body.issueLabel),
    location,
    suburb,
    description: optionalText(body.description) ?? '',
    urgency,
    waste_type: optionalText(body.wasteType),
    bin_id: binId,
    reporter_name: optionalText(body.reporterName),
    reporter_email: optionalText(body.reporterEmail)?.toLowerCase() ?? null,
    account_email: optionalText(body.accountEmail)?.toLowerCase() ?? null,
    photo_attached: body.photoAttached ? 1 : 0,
    status: 'Submitted',
    created_at: optionalText(body.createdAt) ?? now,
    updated_at: now,
    lat: Number.isFinite(body.lat) ? body.lat : null,
    lng: Number.isFinite(body.lng) ? body.lng : null,
  });

  // Mirrors submitPublicReport in AppContext: a report raises the linked bin's priority.
  if (binId) {
    const bin = stmts.getBinById.get(binId);
    if (bin) {
      const nextScore = Math.min(100, Number(bin.priority_score) + 15);
      stmts.bumpBinPriority.run({
        id: binId,
        priority_score: nextScore,
        collection_priority: nextScore >= 80 ? 'Critical' : 'High',
        updated_at: now,
      });
    }
  }

  res.status(201).json(rowToFrontendReport(stmts.getReportById.get(id)));
});

app.patch('/api/reports/:id', (req, res) => {
  const row = stmts.getReportById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Report not found' });
  const status = req.body?.status;
  if (!REPORT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${REPORT_STATUSES.join(', ')}` });
  }
  stmts.updateReportStatus.run({ id: req.params.id, status, updated_at: new Date().toISOString() });
  res.json(rowToFrontendReport(stmts.getReportById.get(req.params.id)));
});

// ────────────────────────────────────────────────────────────────────────────
// Maintenance tickets
// ────────────────────────────────────────────────────────────────────────────

function rowToFrontendTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    binId: row.bin_id,
    location: row.location,
    suburb: row.suburb,
    faultType: row.fault_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes ?? undefined,
  };
}

app.get('/api/tickets', (_req, res) => {
  res.json(stmts.getAllTickets.all().map(rowToFrontendTicket));
});

app.patch('/api/tickets/:id', (req, res) => {
  const row = stmts.getTicketById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Ticket not found' });
  const status = req.body?.status;
  if (!TICKET_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${TICKET_STATUSES.join(', ')}` });
  }
  stmts.updateTicketStatus.run({ id: req.params.id, status, updated_at: new Date().toISOString() });
  res.json(rowToFrontendTicket(stmts.getTicketById.get(req.params.id)));
});

// ────────────────────────────────────────────────────────────────────────────
// MQTT Telemetry Subscriber
// ────────────────────────────────────────────────────────────────────────────

function startMqttSubscriber(mqtt) {
  const client = mqttClient = mqtt.connect(MQTT_URL, {
    clientId: `smartwaste-server-${Date.now()}`,
    reconnectPeriod: 3000,
  });

  client.on('connect', () => {
    console.log('[mqtt] Server connected to broker');
    client.subscribe(TELEMETRY_TOPIC, (err) => {
      if (err) console.error('[mqtt] Subscribe error:', err.message);
      else console.log(`[mqtt] Subscribed to ${TELEMETRY_TOPIC}`);
    });
  });

  client.on('message', (topic, payload) => {
    try {
      const topicMatch = topic.match(/^smartwaste\/bins\/([^/]+)\/telemetry$/);
      if (!topicMatch) return;
      const data = JSON.parse(payload.toString());

      // Validate required fields
      if (
        typeof data.binId !== 'string' ||
        data.binId.trim() === '' ||
        data.binId !== topicMatch[1] ||
        typeof data.fillLevel !== 'number' ||
        !Number.isFinite(data.fillLevel) ||
        data.fillLevel < 0 ||
        data.fillLevel > 100
      ) {
        console.warn('[mqtt] Rejected malformed telemetry:', data);
        return;
      }

      if (data.timestamp !== undefined && (!Number.isFinite(Date.parse(data.timestamp)))) {
        console.warn('[mqtt] Rejected telemetry with invalid timestamp:', data);
        return;
      }

      const binId = data.binId;
      const row = stmts.getBinById.get(binId);
      if (!row) {
        console.warn(`[mqtt] Unknown binId in telemetry: ${binId}`);
        return;
      }

      const newFill = Math.max(0, Math.min(100, Math.round(data.fillLevel)));
      const newSensor = typeof data.sensorStatus === 'string' ? data.sensorStatus : row.sensor_status;
      const newStatus = getBinStatusServer(newFill);
      const { score, priority } = calcPriorityServer(newFill, hoursSinceCollected(row.last_collected));

      stmts.updateBinTelemetry.run({
        id: binId,
        fill_level: newFill,
        status: newStatus,
        sensor_status: newSensor,
        collection_priority: priority,
        priority_score: score,
        updated_at: new Date().toISOString(),
      });

      console.log(`[mqtt] Updated ${binId}: fill=${newFill}% status=${newStatus}`);
    } catch (err) {
      console.warn('[mqtt] Error processing message:', err.message);
    }
  });

  client.on('error', (err) => {
    console.error('[mqtt] Client error:', err.message);
  });

  client.on('disconnect', () => {
    console.log('[mqtt] Disconnected from broker, will reconnect...');
  });

  return client;
}

// ────────────────────────────────────────────────────────────────────────────
// Startup
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const mqttMod = await import('mqtt');
    const brokerMod = await import('./mqtt.mjs');
    await brokerMod.createMqttBroker();
    await new Promise((r) => setTimeout(r, 500));
    startMqttSubscriber(mqttMod.default);
  } catch (err) {
    console.warn('[server] MQTT optional — API still running:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] SmartWaste API listening on http://localhost:${PORT}`);
    console.log(`[server] Health: http://localhost:${PORT}/api/health`);
    console.log(`[server] Users:  http://localhost:${PORT}/api/users`);
    console.log(`[server] SQLite: ${DB_PATH}`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
