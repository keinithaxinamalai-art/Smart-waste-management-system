/**
 * mqtt.mjs — Lightweight MQTT broker using Aedes
 *
 * Starts an MQTT broker on port 1883 (TCP) so the simulator and server
 * can communicate locally without any external broker.
 */

import { Aedes } from 'aedes';
import net from 'net';

export function createMqttBroker() {
  const MQTT_PORT = 1883;

  return Aedes.createBroker().then((broker) => new Promise((resolve) => {
    const server = net.createServer(broker.handle);
    server.listen(MQTT_PORT, '0.0.0.0', () => {
      console.log(`[mqtt] Aedes MQTT broker listening on port ${MQTT_PORT}`);
      resolve({ broker, server });
    });
    server.on('error', (err) => {
      // If port already in use (e.g. another broker running), continue without broker
      console.warn(`[mqtt] Could not start broker on port ${MQTT_PORT}: ${err.message}`);
      console.warn('[mqtt] Assuming an external broker is available at localhost:1883');
      resolve({ broker: null, server: null });
    });
  }));
}
