import type { FaultType, TicketStatus } from '../types';

export const FAULT_LABELS: Record<FaultType, string> = {
  sensor_error: 'Ultrasonic sensor error',
  low_battery: 'Low battery alert',
  lid_jam: 'Lid mechanism jam',
  offline: 'Module offline',
};

export const FAULT_DETAILS: Record<FaultType, string> = {
  sensor_error: 'Periodic missed heartbeat telemetry from the ultrasonic fill-level sensor.',
  low_battery: 'Sensor battery degraded below 20% — schedule a battery swap.',
  lid_jam: 'Lid actuator jammed or obstructed — technician dispatch required.',
  offline: 'No RF ping received for more than 2 hours.',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Open',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
};
