# Week 6 demonstration script (10 minutes + 5 minutes questions)

Open this on the projector:

**https://keinithaxinamalai-art.github.io/Smart-waste-management-system/**

If that page is still a 404, Pages is not enabled yet (Settings → Pages → deploy from branch `gh-pages` / root). On the laptop instead:

```bash
npm install
npm run demo
```

Then open http://localhost:5173/

Use a new / incognito window so old `localStorage` does not mess up the demo. If needed, login as Administrator and click **Reset Demo Data**.

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@smartwaste.demo` | `DemoAdmin123!` |
| Collection Staff | `staff@smartwaste.demo` | `DemoStaff123!` |
| Citizen | `citizen@smartwaste.demo` | `DemoCitizen123!` |

Each person talks for about two minutes.

## 1. Unauthenticated access (Ayush, ~2 min)

- Show the login screen with no session.
- Try a wrong password and show the error.
- Point out the three prototype roles. Do **not** skip the login — the app starts logged out.

## 2. Citizen report submission and tracking (Samir, ~2 min)

- Sign in as Citizen (or use **Report a Full Bin (Public)**).
- Submit empty fields to show validation.
- Submit a valid Canberra City overflow report. Read out the `WST-2026-XXXX` reference.
- Open **Track My Reports** and show status **Submitted**.

## 3. Administrator review and smart-bin logic (Bijay, ~2 min)

- Sign out, sign in as Administrator.
- Open **Public Reports**. Move the new ticket to **Under Review**, then **Scheduled**.
- Show the dashboard: critical bins (fill ≥ 90%), collection needed (fill ≥ 80%), map and alerts all using `getBinStatus()`.
- Point at `WDN-104` (~92%, Critical) on the map and in the critical-bin list.

## 4. Collection assignment and staff pickup (Krishna / Samir, ~2 min)

- Open **Route Planning**. Show the sequence is only Collection Required and Critical bins.
- Click **Approve & Assign Driver**.
- Sign out, sign in as Collection Staff.
- **Mark Collected** on `WDN-104`. Fill resets to 5% (Normal). Linked reports for that `binId` resolve; unrelated suburb reports stay open.

## 5. Synchronisation, maintenance, reset (Charanpal, ~2 min)

- Sign back in as Administrator. Confirm `WDN-104` is 5% on dashboard, map and alerts.
- Open **Maintenance**. Show sensor faults and **Acknowledge Ticket**.
- Click **Reset Demo Data** so the next group (or questions) starts from the seed dataset.

## Questions (5 minutes)

Stay on the live site (or the laptop demo). Likely questions:

- Why no real IoT hardware? Iteration 1 is the software prototype only, with simulated Canberra bins.
- Why `localStorage`? So we can demo in class without standing up a backend.
- Why is priority rule based? So the scoring is transparent, not a black box A.I. approach. Fill, urgency and overdue time are the three parts.
- What is left? Live telemetry, a real database, and proper geospatial routing in later work.
