# Canberra SmartWaste

ICT308 – Project 2 (BIT Capstone), Iteration 1 prototype

**Group:** Bijay Pokhrel, Samir Bhandari, Krishna Trivedi, Ayush Ale, Charanpal Kaur

Canberra SmartWaste is a software prototype to make it easier to see and manage municipal waste collection in Canberra. Efficiencies can be lost with fixed collection days due to the fact that bins in busy areas might fill at different times, and refuse collection vehicles could be taking out bins that don't need to be emptied. Iteration 1 is the software side only (React 19, TypeScript, Vite). We are not deploying real IoT hardware. Bin data is simulated and saved in the browser with `localStorage`.

There are three roles: Citizen, Collection Staff and Administrator.

---

## Week 6 presentation — how to run it

The URL we want on the projector is:

**https://keinithaxinamalai-art.github.io/Smart-waste-management-system/**

That site is the built Vite app on the `gh-pages` branch. GitHub Pages is **not turned on yet**, so the link will 404 until someone with repo Settings access does this:

1. Open the repository on GitHub
2. **Settings → Pages**
3. Build and deployment → Source: **Deploy from a branch**
4. Branch: **`gh-pages`**, folder: **`/ (root)`**
5. Save

After that the URL above should load. Speaking notes: [docs/DEMO.md](docs/DEMO.md).

If Pages is still not working in class, run it on the laptop (no extra tools besides Node):

```bash
npm install
npm run demo
```

Then open http://localhost:5173/

### Demo logins

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@smartwaste.demo` | `DemoAdmin123!` |
| Collection Staff | `staff@smartwaste.demo` | `DemoStaff123!` |
| Citizen | `citizen@smartwaste.demo` | `DemoCitizen123!` |

Use a fresh / incognito window if leftover demo data is on the screen. Administrator can click **Reset Demo Data**.

---

## Assessment documents

- Group report: [docs/ITERATION-1-REPORT.md](docs/ITERATION-1-REPORT.md) (Word: [docs/ITERATION-1-REPORT.docx](docs/ITERATION-1-REPORT.docx), Moodle copy: [Project.docx](Project.docx), original PDF: [docs/Canberra-SmartWaste-Iteration1-Report.pdf](docs/Canberra-SmartWaste-Iteration1-Report.pdf))
- Demo script: [docs/DEMO.md](docs/DEMO.md)
- GitHub evidence: [docs/GITHUB-EVIDENCE.md](docs/GITHUB-EVIDENCE.md)
- Branch workflow: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## What is working in Iteration 1

- Login starts with no session. Fake test accounts for the three roles.
- Citizen report form (Canberra suburbs, validation, `WST-2026-XXXX` reference). Status goes Submitted → Under Review → Scheduled → Resolved.
- Smart bin fill status from `getBinStatus()`: 0–49% Normal, 50–79% Moderate, 80–89% Collection Required, 90–100% Critical.
- Collection priority is a rule based score (fill + urgency + overdue time). Not a black box A.I. approach.
- Collection sequence only includes Collection Required and Critical bins. **Mark Collected** resets fill to 5%. Only reports linked to that `binId` get resolved.
- Admin dashboard, map, alerts and search all use the same live state.
- Maintenance view with simulated sensor faults. **Acknowledge Ticket** then **Mark Resolved**.
- Vitest tests, ESLint, and GitHub Actions (`ci.yml`) for lint / test / build.

---

## How to run it locally (development)

Needs Node.js 18+ and npm.

```bash
npm install
npm run demo          # http://localhost:5173/
npm test
npm run lint
npm run build
```

`npm run dev` is the same server as `npm run demo`.

---

## Team branches

```text
main (stable)
└── develop
    ├── bijay-admin-dashboard
    ├── samir-citizen-interface
    ├── krishna-database-collection
    ├── ayush-auth-testing
    └── charanpal-maintenance-analytics
```

| Member | Branch | What they worked on |
|---|---|---|
| Bijay Pokhrel | `bijay-admin-dashboard` | Admin dashboard, project coordination |
| Samir Bhandari | `samir-citizen-interface` | Citizen reporting and validation |
| Krishna Trivedi | `krishna-database-collection` | Data models, `localStorage`, bin/priority algorithms |
| Ayush Ale | `ayush-auth-testing` | Login, AppContext, tests |
| Charanpal Kaur | `charanpal-maintenance-analytics` | Sensor diagnostics and maintenance tickets |

Merged PRs: [#1](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/1) Ayush, [#2](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/2) Bijay, [#3](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/3) Samir, [#4](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/4) Krishna, [#5](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/5) develop → main. More detail in [docs/GITHUB-EVIDENCE.md](docs/GITHUB-EVIDENCE.md).

Day to day chat was in Google Chat. GitHub is where the actual code history is.

---

## Short demo path (if you are marking it)

1. Open the app logged out. Login screen should show.
2. Citizen: submit a Canberra City overflow report, copy the `WST-2026-XXXX` id, see **Submitted**.
3. Admin: Public Reports → Under Review then Scheduled. Check dashboard / map. `WDN-104` is around 92% (Critical).
4. Staff: **Mark Collected** on `WDN-104`. Fill goes to 5% (Normal) on map, table and alerts.
5. Maintenance: **Acknowledge Ticket** on an Open ticket.
6. Admin: **Reset Demo Data**.
