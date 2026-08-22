# Canberra SmartWaste: Smart Waste Management System for Canberra

> **ICT308 – Project 2 (BIT Capstone Project)**  
> **Iteration 1 Prototype** · Transport Canberra & City Services (TCCS) Smart Waste Demonstration Build

---

## 1. Project Overview & Problem Statement

Urban waste management in Canberra faces challenges due to fixed collection schedules that do not adapt to fluctuating fill levels across high-traffic public areas (such as town centres, light rail interchanges, and parklands). Bins frequently overflow during peak hours, leading to litter, public health concerns, and inefficient fuel usage.

**Canberra SmartWaste** addresses this challenge through an integrated smart-bin prototype tailored to the Australian Capital Territory (ACT). The system monitors simulated bin fill levels, automatically classifies bin statuses, computes deterministic collection priorities, enables citizen waste reporting, and provides TCCS operations managers and collection staff with suggested pickup sequences.

*Note: All smart-bin telemetry and ACT Government integrations represented in this project are simulated prototype data for Week 6 Iteration 1 demonstration purposes.*

---

## 2. Implemented Iteration 1 Features

- **Role-Based Authentication & Prototype Login**:
  - **Citizen**: Submit waste issue reports, view reference IDs (`WST-2026-XXXX`), and track report status in real time.
  - **Collection Staff**: View suggested priority collection sequence, inspect bin details, and execute bin pickups (resetting fill levels to 5% and resolving linked reports).
  - **Administrator**: Operational dashboard, prototype bin telemetry map, critical bins spotlight, collection dispatches, report administration, and demo data reset.
- **Citizen Waste Reporting**: Form supporting street address input, 8 Canberra suburbs, 6 issue categories, urgency selection, optional photo attachment toggle, validation against empty/whitespace inputs, and unique reference ID generation (`WST-2026-XXXX`).
- **Simulated Smart-Bin Monitoring**: Fill percentages, priority badges, and sensor status (`Online`, `Warning`, `Fault`, `Offline`).
- **Deterministic Collection Priority Algorithm**: Formula-based priority scoring (`Critical`, `High`, `Medium`, `Low`).
- **Interactive Collection Management**: Staff and Admins can mark bins as collected, immediately updating bin fill levels to 5% (Normal), resolving associated reports, updating alerts, and refreshing live dashboard metrics.
- **Demo Data Reset**: Administrator header feature allowing instant restoration of default seeded demo data during presentations.
- **Data Persistence**: Reactive client-side store backed by `localStorage` with safe schema migration helpers.
- **Automated Unit Testing**: Test suite verifying business logic algorithms using `vitest`.

---

## 3. Technology Stack & System Architecture

- **Frontend Core**: React 19, TypeScript 5.8, Vite 8
- **Styling**: Modular Vanilla CSS with CSS Custom Properties
- **Icons & Data Visualization**: Lucide React, Recharts
- **Testing Infrastructure**: Vitest (Automated Unit Testing), ESLint 10
- **Persistence Layer**: Centralized `localStorage` service (`src/services/dataStore.ts`)

```
src/
├── assets/         # Static visual assets
├── components/     # Header, Sidebar, BinTable, StatCard, MapPanel, AlertsList, Charts
├── constants/      # Global constants (ISSUE_LABELS)
├── context/        # React context (AppProvider, AppContextObject)
├── hooks/          # Custom hooks (useApp)
├── lib/            # Routing helpers
├── services/       # Centralized persistence layer (dataStore.ts)
├── types/          # Domain TypeScript interfaces (index.ts)
├── utils/          # Pure business logic algorithms & unit tests (binUtils.ts, binUtils.test.ts)
└── views/          # Page components (DashboardView, LoginView, PublicReportView, DriverView, MaintenanceView, etc.)
```

---

## 4. Reusable Smart Waste Business Algorithms

### A. Smart Bin Fill-Level Status Classification
Implemented in `src/utils/binUtils.ts` via `getBinStatus(fillLevel: unknown)`:

| Fill Level Range | Status Classification | Action Required |
|---|---|---|
| **0% – 49%** | `Normal` | Standard monitoring |
| **50% – 79%** | `Moderate` | Monitor fill velocity |
| **80% – 89%** | `Collection Required` | Schedule for upcoming route |
| **90% – 100%** | `Critical` | Immediate pickup required |

*Invalid or out-of-range sensor readings (<0, >100, NaN, null, undefined) are safely clamped to 0–100%.*

### B. Deterministic Collection Priority Formula
Implemented in `src/utils/binUtils.ts` via `calculateCollectionPriority()`:

$$\text{Priority Score} = \text{Fill Contribution} + \text{Urgency Contribution} + \text{Overdue Contribution}$$

- **Fill Contribution**: $\text{FillLevel} \times 0.5$ (max 50 points)
- **Urgency Contribution**: `Critical` (30 pts), `High` (20 pts), `Medium` (10 pts), `Low` (0 pts)
- **Overdue Contribution**: $\min(\text{HoursOverdue} \times 0.8, 20\text{ points})$

#### Priority Thresholds:
- **Score $\ge 80$**: `Critical`
- **Score $60 - 79$**: `High`
- **Score $40 - 59$**: `Medium`
- **Score $< 40$**: `Low`

---

## 5. Fictional Prototype Credentials

For demonstration and grading evaluation, use the pre-configured prototype accounts:

| Role | Prototype Email | Demo Password | Scope & Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@smartwaste.demo` | `DemoAdmin123!` | Manager Dashboard, Critical Bins Spotlight, Report Administration, Demo Data Reset |
| **Collection Staff** | `staff@smartwaste.demo` | `DemoStaff123!` | Priority Collection Sequence, Pickup Execution ("Mark Collected") |
| **Citizen** | `citizen@smartwaste.demo` | `DemoCitizen123!` | Public Waste Reporting, Ref ID Generation (`WST-2026-XXXX`), Report History |

---

## 6. Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)

### Quick Start Commands
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run automated unit test suite
npm test

# 4. Run linter
npm run lint

# 5. Build production bundle
npm run build
```

---

## 7. Team Responsibilities & Git Branch Workflow

Active development for Iteration 1 was executed across five dedicated feature branches. Each member branch contains commits attributed to their specific Git identity:

| Team Member | GitHub Handle | Git Author Name & Email | Feature Branch | Core Responsibilities |
|---|---|---|---|---|
| **Bijay Pokhrel** | `bijay123pokhrel` | `Bijay Pokhrel` <`Cihe240246@student.cihe.edu.au`> | `bijay-admin-dashboard` | Administrator Dashboard, Critical Bin Spotlight, Role Labels & Route Protection |
| **Samir Bhandari** | `Samir0888` | `Samir Bhandari` <`sabhandarisamir2021@gmail.com`> | `samir-citizen-interface` | Citizen Reporting Interface, Form Validation, ACT Suburbs & Status Normalization |
| **Krishna Trivedi** | `KrishnaTriv` | `Krishna Trivedi` <`krishnatrivedi0507@gmail.com`> | `krishna-database-collection` | Typed Data Models, Local Persistence Service (`dataStore.ts`), Bin Status & Priority Algorithms |
| **Ayush Ale** | `keinithaxinamalai-art` | `Ayush Ale` <`keinithaxinamalai@gmail.com`> | `ayush-auth-testing` | Unauthenticated Session Flow, Prototype Login, AppContext State Integration & Unit Tests |
| **Charanpal Kaur** | `charanpal06-coder` | `Charanpal Kaur` <`charanpalkaur1512@gmail.com`> | `charanpal-maintenance-analytics` | Smart Bin Diagnostics, Sensor Health Monitoring & Technician Dispatches |

### Branch Structure
```text
main (stable release)
└── develop (integration branch)
    ├── bijay-admin-dashboard
    ├── samir-citizen-interface
    ├── krishna-database-collection
    ├── ayush-auth-testing
    └── charanpal-maintenance-analytics
```

---

## 8. Recommended Demonstration Flow (Manual Test Stages A–I)

1. **A – Unauthenticated Start**: Open fresh app. Verify Login screen appears. Verify Admin dashboard is blocked.
2. **B – Citizen Flow**: Login as `citizen@smartwaste.demo`. Attempt empty submission to test validation. Submit valid report in *Canberra City*. Note reference ID (`WST-2026-XXXX`). View in **Track Reports History**.
3. **C – Administrator Review**: Logout, login as `admin@smartwaste.demo`. Open Public Reports administration. Change report status to `Under Review` then `Scheduled`.
4. **D – Citizen Status Synchronization**: Log back in as `citizen@smartwaste.demo`. Verify report status updated to `Scheduled`.
5. **E – Smart Bin Telemetry**: Open Bin Map and telemetry table. Verify bins exist across all 4 states (`Normal`, `Moderate`, `Collection Required`, `Critical`).
6. **F – Map Data Consistency**: Note critical bin `WDN-104` (92% fill). Verify map pin and dashboard display identical values.
7. **G – Collection Pickup Execution**: Log in as `staff@smartwaste.demo`. Open collection queue. Click **Mark Collected** for `WDN-104`. Verify fill resets to 5%, status becomes Normal, and last collected date updates.
8. **H – Cross-Screen Consistency**: Verify `WDN-104` updated to 5% across Map, Bin Table, Alerts, and Dashboard statistics.
9. **I – Demo Reset**: Log in as Admin. Click **Reset Demo Data** in header to restore default presentation state.
