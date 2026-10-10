# Canberra SmartWaste

ICT308 – Project 2 (BIT Capstone) · **Assessment 2 Final Delivery**

**Group:** Bijay Pokhrel, Samir Bhandari, Krishna Trivedi, Ayush Ale, Charanpal Kaur

Canberra SmartWaste is a smart waste operations system for Transport Canberra and City Services (TCCS). Residents can create an account, report waste issues and track status. Collection staff complete pickups, and administrators monitor bins, routes, alerts and maintenance.

**Live site (GitHub Pages):**  
https://keinithaxinamalai-art.github.io/Smart-waste-management-system/

**Repository:**  
https://github.com/keinithaxinamalai-art/Smart-waste-management-system

**Jira:**  
https://student-team-frnx73gf.atlassian.net/jira/software/projects/SMAR

The Pages site is the React frontend. Express + SQLite + MQTT run locally (`npm run demo` plus the backend if you use the full stack).

---

## Portal logins

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@smartwaste.demo` | `DemoAdmin123!` |
| Collection Staff | `staff@smartwaste.demo` | `DemoStaff123!` |
| Citizen | `citizen@smartwaste.demo` | `DemoCitizen123!` |

Create a new resident account from **Create a resident account** (name, email, password, confirm password, suburb). That account stays in this browser so you can sign in after refresh.

Staff accounts above still work. Guests can also click **Report a waste issue** with no account.

---

## How to run locally

Needs Node.js 18+ and npm.

```bash
npm install
npm run demo
```

Open http://localhost:5173/

```bash
npm test
npm run lint
npm run build
```

---

## What the system does

- Role-based login: Citizen, Collection Staff, Administrator
- Citizen reports with Canberra suburbs, validation, `WST-2026-XXXX` IDs (Submitted → Under Review → Scheduled → Resolved)
- Bin status: Normal / Moderate / Collection Required / Critical
- Rule-based collection priority (not AI)
- Route planning with map path; **Mark Collected** resets fill to 5%
- Admin dashboard, Canberra map, alerts, search
- Maintenance tickets
- Automated tests and GitHub Actions (lint / test / build / Pages deploy)

---

## Assessment documents

| Assessment | Files |
|---|---|
| **1 — Iteration 1 (Week 6)** | [docs/ITERATION-1-REPORT.md](docs/ITERATION-1-REPORT.md) · [docs/DEMO.md](docs/DEMO.md) |
| **2 — Final delivery (Week 11)** | [Technical report](docs/assessment-2/ASSESSMENT-2-TECHNICAL-REPORT.md) · [User guide](docs/assessment-2/USER-GUIDE.md) · [UAT](docs/assessment-2/UAT-CHECKLIST.md) · [Demo script](docs/assessment-2/WEEK-11-DEMO.md) |
| **3 — Poster + reflection** | [docs/assessment-3/README.md](docs/assessment-3/README.md) |

---

## Team branches

```text
main (stable / GitHub Pages)
└── develop
    ├── bijay-admin-dashboard
    ├── samir-citizen-interface
    ├── krishna-database-collection
    ├── ayush-auth-testing
    └── charanpal-maintenance-analytics
```

| Member | Branch | Work |
|---|---|---|
| Bijay Pokhrel | `bijay-admin-dashboard` | Admin dashboard, coordination |
| Samir Bhandari | `samir-citizen-interface` | Citizen reporting and validation |
| Krishna Trivedi | `krishna-database-collection` | Data models, bin/priority logic |
| Ayush Ale | `ayush-auth-testing` | Login, AppContext, tests |
| Charanpal Kaur | `charanpal-maintenance-analytics` | Maintenance and diagnostics |

Day-to-day chat was in Google Chat. GitHub is the code history.

---

## Marker click path

1. Open the live demo logged out.
2. Citizen: submit an overflow report, copy `WST-2026-XXXX`.
3. Admin: Public Reports → Under Review → Scheduled. Check dashboard / map.
4. Staff: **Mark Collected** on a critical bin. Fill goes to ~5%.
5. Maintenance: acknowledge a ticket.
6. Admin: **Reset Demo Data**.
