# Canberra SmartWaste: Smart Waste Management System for Canberra

> **ICT308 – Project 2 (BIT Capstone Project)**  
> **Iteration 1 Prototype** · Transport Canberra & City Services (TCCS) Smart Waste Pilot

---

## 1. Project Overview & Problem Statement

Urban waste management in Canberra faces growing challenges due to fixed collection schedules that do not adapt to fluctuating fill levels across peak public spaces (such as town centres, light rail stops, and parklands). Bins frequently overflow during events, leading to litter, public health concerns, and inefficient fuel usage when collecting empty bins.

**Canberra SmartWaste** solves this by providing an integrated, smart IoT-telemetry waste management prototype tailored to the Australian Capital Territory (ACT). The system dynamically monitors bin fill levels, automatically classifies urgency, computes deterministic collection priorities, enables citizen waste reporting, and provides TCCS operations managers and collection crews with optimized pickup workflows.

*Note: All IoT sensor data and ACT Government integrations represented in this system are simulated for Iteration 1 prototype demonstration purposes.*

---

## 2. Implemented Iteration 1 Features

- **Multi-Role Authentication & Demo Login**:
  - **Citizen**: Submit waste issue reports, view reference IDs, and track report status in real time.
  - **Collection Staff (Driver)**: View prioritized collection queue, inspect stop locations, and execute bin pickups (resetting fill levels and resolving associated reports).
  - **Administrator (TCCS Manager)**: System-wide dashboard, live ACT map, critical bin spotlight, collection dispatches, and report status management.
- **Citizen Waste Reporting**: Form supporting location autocomplete, 8 ACT suburbs, 6 issue categories, urgency selection, optional photo attachment, input validation, and unique reference ID generation (`PR-XXXX`).
- **Smart Bin Telemetry Monitoring**: Real-time fill percentages, sensor health indicators (`Online`, `Warning`, `Fault`, `Offline`), and suburb breakdown.
- **Deterministic Collection Priority Algorithm**: Formula-based priority scoring (`Critical`, `High`, `Medium`, `Low`).
- **Interactive Collection Management**: Drivers and Admins can mark bins as collected, immediately updating bin fill levels to 5% (Normal), resolving associated reports, and updating live dashboard metrics.
- **Data Persistence**: Lightweight client-side reactive store backed by `localStorage`.
- **Automated Unit Testing**: Comprehensive test suite verifying business logic algorithms using `vitest`.

---

## 3. Technology Stack & System Architecture

- **Frontend Core**: React 19, TypeScript 5.8, Vite 8
- **Styling**: Modular Vanilla CSS with CSS Custom Properties
- **Icons & Data Visualization**: Lucide React, Recharts
- **Testing Infrastructure**: Vitest (Automated Unit Testing), ESLint 10
- **Persistence Layer**: Structured `localStorage` service (`src/services/dataStore.ts`)

```
src/
├── assets/         # Static visual assets
├── components/     # Header, Sidebar, BinTable, StatCard, MapPanel, Charts
├── constants/      # Global constants (e.g. ISSUE_LABELS)
├── context/        # React context (AppProvider, AppContextObject)
├── hooks/          # Custom hooks (useApp)
├── lib/            # Routing helpers & fallback stores
├── services/       # Centralized persistence layer (dataStore.ts)
├── types/          # Domain TypeScript interfaces (index.ts)
├── utils/          # Pure business logic algorithms & unit tests (binUtils.ts, binUtils.test.ts)
└── views/          # Page components (DashboardView, LoginView, PublicReportView, DriverView, etc.)
```

---

## 4. Reusable Smart Waste Algorithms

### A. Smart Bin Fill-Level Status Classification
Implemented in `src/utils/binUtils.ts` via `getBinStatus(fillLevel: number)`:

| Fill Level Range | Status Classification | Action Required |
|---|---|---|
| **0% – 49%** | `Normal` | Standard monitoring |
| **50% – 79%** | `Moderate` | Monitor fill velocity |
| **80% – 89%** | `Collection Required` | Schedule for upcoming route |
| **90% – 100%** | `Critical` | Immediate dispatch required |

*Out-of-range or invalid sensor readings (<0, >100, NaN) are safely normalized to `Normal`.*

### B. Transparent Deterministic Collection Priority Formula
Implemented in `src/utils/binUtils.ts` via `calculateCollectionPriority()`:

$$\text{Priority Score} = \text{Fill Contribution} + \text{Urgency Contribution} + \text{Overdue Contribution}$$

- **Fill Contribution**: $\text{FillLevel} \times 0.5$ (max 50 points)
- **Urgency Contribution**:
  - `Critical`: 30 points
  - `High`: 20 points
  - `Medium`: 10 points
  - `Low`: 0 points
- **Overdue Contribution**: $\min(\text{HoursOverdue} \times 0.8, 20\text{ points})$

#### Classification Thresholds:
- **Score $\ge 80$**: `Critical`
- **Score $60 - 79$**: `High`
- **Score $40 - 59$**: `Medium`
- **Score $< 40$**: `Low`

---

## 5. Demo Accounts

For demonstration and grading evaluation, use the pre-configured accounts:

| Role | Prototype Email | Demo Password | Scope & Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@smartwaste.demo` | `DemoAdmin123!` | Manager Dashboard, Critical Bins Spotlight, Report Administration |
| **Collection Staff** | `staff@smartwaste.demo` | `DemoStaff123!` | Priority Collection Queue, Pickup Execution ("Mark Collected") |
| **Citizen** | `citizen@smartwaste.demo` | `DemoCitizen123!` | Public Waste Reporting, Ref ID Generation, Report History |

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
| **Bijay Pokhrel** | `bijay123pokhrel` | `Bijay Pokhrel` <`Cihe240246@student.cihe.edu.au`> | `bijay-admin-dashboard` | Administrator Dashboard, Critical Bin Spotlight, Overview Statistics & Dispatches |
| **Samir Bhandari** | `Samir0888` | `Samir Bhandari` <`sabhandarisamir2021@gmail.com`> | `samir-citizen-interface` | Citizen Reporting Interface, Form Validation, ACT Suburbs & Report Tracking History |
| **Krishna Trivedi** | `KrishnaTriv` | `Krishna Trivedi` <`krishnatrivedi0507@gmail.com`> | `krishna-database-collection` | Typed Data Models, Local Persistence Service (`dataStore.ts`), Bin Status & Priority Algorithms |
| **Ayush Ale** | `keinithaxinamalai-art` | `Ayush Ale` <`keinithaxinamalai@gmail.com`> | `ayush-auth-testing` | Role-based Auth, Demo Sign-In, AppContext State Integration & Automated Unit Tests |
| **Charanpal Kaur** | `charanpal06-coder` | `Charanpal Kaur` <`charanpalkaur1512@gmail.com`> | `charanpal-maintenance-analytics` | Smart Bin Diagnostics, Telemetry Alerts, Sensor Health Monitoring |

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

## 8. Recommended 10-Minute Demonstration Flow

1. **Bijay Pokhrel (2 min)**:
   - Sign in as **Administrator** (`admin@canberra.act.gov.au`).
   - Demonstrate the high-level dashboard metrics (Total Bins, Critical Bins, Network Fill %).
   - Highlight the **Critical Bins Spotlight** panel and live ACT telemetry map.
2. **Samir Bhandari (2 min)**:
   - Switch to **Citizen** flow ("Report a Full Bin").
   - Demonstrate form validation by attempting an empty submit.
   - Fill out a waste report in *Canberra City* (select category, urgency, GPS location, photo toggle).
   - Submit the report, receive the generated reference ID (`PR-XXXX`), and view the report in **Track Reports History**.
3. **Krishna Trivedi (2 min)**:
   - Explain the **Smart Bin Status Algorithm** (0-49% Normal, 50-79% Moderate, 80-89% Collection Required, 90-100% Critical).
   - Explain the **Collection Priority Formula** combining fill contribution, urgency, and overdue hours.
   - Show how bin telemetry data persists across browser sessions in `localStorage`.
4. **Ayush Ale (2 min)**:
   - Demonstrate 1-click role switching between Administrator, Collection Staff, and Citizen.
   - Log in as **Collection Staff** (`staff@canberra.act.gov.au`).
   - Click **Mark Collected** on the top priority bin (`WDN-104`). Show how fill level drops to 5%, linked public reports mark as `Resolved`, and dashboard stats update automatically.
5. **Group Conclusion & Iteration 2 Roadmap (2 min)**:
   - Summarize Git branch integration (`develop` $\rightarrow$ `main`).
   - Run `npm test` live to showcase passing unit test suite.
   - Highlight planned Iteration 2 features (Real IoT sensor WebSockets, route optimization algorithms, backend API integration).

---

## 9. Iteration 2 / Future Roadmap

- Real-world IoT sensor integration (MQTT / WebSocket telemetry streams).
- GIS route optimization using Canberra road network mapping.
- Mobile push notifications for TCCS route drivers.
- Advanced predictive fill analytics powered by historical seasonal data.
