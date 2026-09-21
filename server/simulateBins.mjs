/**
 * simulateBins.mjs — MQTT Bin Telemetry Simulator
 *
 * Simulates realistic fill-level changes for existing demo bins and publishes
 * them via MQTT to the smartwaste/bins/{binId}/telemetry topic.
 *
 * The server subscribes to this topic and updates the SQLite database.
 * The React frontend polls the REST API and reflects changes automatically.
 *
 * Usage: npm run simulate
 * Stop:  Ctrl+C
 */

import mqtt from 'mqtt';

const MQTT_URL = 'mqtt://localhost:1883';
const TOPIC_BASE = 'smartwaste/bins';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const simulatedBins = [];
let initialized = false;

// Track recently collected bins to avoid immediate refill
const recentlyCollected = new Map();

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function realisticFillChange(currentFill) {
  // Bins fill gradually; higher fill = faster fill rate (compaction)
  const base = currentFill > 70 ? 3 : currentFill > 40 ? 2 : 1;
  const delta = (Math.random() - 0.15) * base; // Slight upward bias
  return Math.round(clamp(currentFill + delta, 0, 100));
}

function publishTelemetry(client, bin) {
  const topic = `${TOPIC_BASE}/${bin.id}/telemetry`;
  const payload = JSON.stringify({
    binId: bin.id,
    fillLevel: bin.fillLevel,
    sensorStatus: bin.sensorStatus,
    timestamp: new Date().toISOString(),
  });
  client.publish(topic, payload, { qos: 0, retain: false }, (err) => {
    if (err) {
      console.error(`[sim] Failed to publish for ${bin.id}:`, err.message);
    } else {
      console.log(`[sim] ${bin.id} (${bin.suburb}): fill=${bin.fillLevel}% sensor=${bin.sensorStatus} → published`);
    }
  });
}

async function main() {
  console.log('[sim] Connecting to MQTT broker at', MQTT_URL);

  const client = mqtt.connect(MQTT_URL, {
    clientId: `smartwaste-sim-${Date.now()}`,
    reconnectPeriod: 3000,
  });

  client.on('connect', () => {
    if (initialized) return;
    initialized = true;
    initializeFromBackend(client).catch((err) => {
      console.error('[sim] Could not load current bins from backend:', err.message);
      client.end(true);
      process.exit(1);
    });
  });

  // Listen for collection confirmations to reset fill level in simulator state.
  client.on('message', (topic, payload) => {
    if (topic.includes('/collected')) {
      try {
        const data = JSON.parse(payload.toString());
        const bin = simulatedBins.find((b) => b.id === data.binId);
        if (bin) {
          console.log(`[sim] Bin ${bin.id} was collected — resetting simulator fill to 5%`);
          bin.fillLevel = 5;
          bin.sensorStatus = 'Online';
          recentlyCollected.set(bin.id, 3);
        }
      } catch { /* ignore malformed event */ }
    }
  });

  client.on('error', (err) => {
    console.error('[sim] MQTT error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('[sim] Cannot connect to broker. Make sure the server is running first:');
      console.error('[sim]   npm run server');
      process.exit(1);
    }
  });

  process.on('SIGINT', () => {
    console.log('\n[sim] Stopping simulator...');
    client.end(true, () => {
      console.log('[sim] Disconnected. Goodbye!');
      process.exit(0);
    });
  });
}

async function initializeFromBackend(client) {
  const response = await fetch(`${API_URL}/api/bins`);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const bins = await response.json();
  simulatedBins.push(...bins.map((bin) => ({
    id: bin.id,
    fillLevel: bin.fillLevel,
    sensorStatus: bin.sensorStatus,
    suburb: bin.suburb,
  })));
  console.log('[sim] Connected to broker. Starting bin simulation...');
  console.log('[sim] Publishing telemetry for bins:', simulatedBins.map((b) => b.id).join(', '));
  console.log('[sim] Press Ctrl+C to stop.\n');

    // Publish initial state for all bins immediately
    for (const bin of simulatedBins) {
      publishTelemetry(client, bin);
    }

    // Update one random bin every 5 seconds (staggered realistic updates)
    setInterval(() => {
      const bin = simulatedBins[Math.floor(Math.random() * simulatedBins.length)];

      // Skip recently collected bins for 3 cycles to avoid immediate re-fill
      const graceCycles = recentlyCollected.get(bin.id) || 0;
      if (graceCycles > 0) {
        recentlyCollected.set(bin.id, graceCycles - 1);
        return;
      }

      const newFill = realisticFillChange(bin.fillLevel);
      bin.fillLevel = newFill;

      // Simulate occasional sensor status fluctuation
      if (Math.random() < 0.05 && bin.sensorStatus === 'Online') {
        bin.sensorStatus = 'Warning';
      } else if (bin.sensorStatus === 'Warning' && Math.random() < 0.3) {
        bin.sensorStatus = 'Online';
      }

      publishTelemetry(client, bin);
    }, 5000);

    // Subscribe to collection events to reset fill levels in simulator state
    // This keeps simulator in sync when a bin is marked collected via the API
    client.subscribe('smartwaste/bins/+/collected', (err) => {
      if (!err) console.log('[sim] Subscribed to collection events');
    });
}

main();
