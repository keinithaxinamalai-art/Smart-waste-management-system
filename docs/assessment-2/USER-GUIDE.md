# Canberra SmartWaste — User Guide

**ICT308 Assessment 2 appendix**  
Group: Bijay Pokhrel, Samir Bhandari, Krishna Trivedi, Ayush Ale, Charanpal Kaur

This guide is for the teaching team and for the group when we run the Week 11 demonstration. Take screenshots on your own laptop while `npm run demo` is open and paste them into the Word copy before Moodle submit.

**Screenshot list (paste under each heading in Word):**

1. Login screen (logged out)
2. Sign in error after a wrong password
3. Citizen success with a `WST-2026-XXXX` reference
4. Citizen history showing Scheduled
5. Admin dashboard with `WDN-104` Critical
6. Map pin matching that fill
7. Route Planning — only ≥80% bins
8. Staff Mark Collected — fill 5%
9. Maintenance ticket In Progress
10. After Reset Demo Data

---

## 1. System requirements

- Windows, macOS or Linux
- Node.js 18 or newer
- npm 9 or newer
- Chrome, Edge or Firefox
- No database server
- No Docker

Check Node with:

```bash
node -v
npm -v
```

---

## 2. Installation

```bash
git clone https://github.com/keinithaxinamalai-art/Smart-waste-management-system.git
cd Smart-waste-management-system
npm install
npm run demo
```

Leave that terminal open. On **the same computer** open:

**http://localhost:5173/**

`localhost` will not work on a second laptop unless that second laptop also ran `npm run demo`.

### Optional public site

If GitHub Pages is enabled (Settings → Pages → branch `gh-pages` / root):

https://keinithaxinamalai-art.github.io/Smart-waste-management-system/

---

## 3. Demo accounts

| Role | Email | Password | What you can do |
|---|---|---|---|
| Administrator | `admin@smartwaste.demo` | `DemoAdmin123!` | Dashboard, map, routes, reports, maintenance, reset |
| Collection Staff | `staff@smartwaste.demo` | `DemoStaff123!` | Priority queue, Mark Collected |
| Citizen | `citizen@smartwaste.demo` | `DemoCitizen123!` | Submit and track reports |

**Sign in** checks the password. The three 1-click buttons are only for a fast class run.

Do not type real names or real emails into the citizen form during marking.

---

## 4. User instructions

### 4.1 Start (everyone)

1. Open the app. You should see Canberra SmartWaste login, not the admin dashboard.
2. To show validation, type a wrong password and click **Sign in**. An error should appear.
3. Pick a role chip or use 1-click, then sign in.

### 4.2 Citizen

1. Sign in as Citizen (or use **Report a Full Bin (Public)**).
2. Leave location empty and submit — the form should block it.
3. Enter a street, pick Canberra City, pick an issue, submit.
4. Copy the `WST-2026-XXXX` reference.
5. Open **Track My Reports** and search that reference. Status starts as **Submitted**.

### 4.3 Administrator

1. Sign in as Administrator.
2. **Public Reports** — find the new ticket. Change status to Under Review, then Scheduled.
3. **Dashboard** — check critical bins (≥90%) and collection needed (≥80%). `WDN-104` starts at 92% Critical.
4. Confirm the map pin for `WDN-104` shows the same fill as the table.
5. **Route Planning** — only bins at 80% or more appear. Click **Approve & Assign Driver**.
6. Search in the header for `WDN-104` or `WST-2026`.
7. After the staff demo, click **Reset Demo Data** if you need the seed numbers again.

### 4.4 Collection staff (driver)

1. Sign in as Collection Staff.
2. Priority Stop #1 is the highest score ≥80% bin (often `GUN-015` or `WDN-104`).
3. Empty bins (for example 34% or 42%) are **not** the next stop.
4. Click **Mark Collected & Empty Bin**. Fill goes to 5% (Normal). That bin leaves the urgent list.
5. Only a citizen report that named that exact bin ID is marked Resolved.

### 4.5 Maintenance

1. As Administrator open **Maintenance**.
2. Open tickets include sensor error, low battery, lid jam, offline.
3. **Acknowledge Ticket** → In Progress. **Mark Resolved** when you want to close it.

### 4.6 How routes are managed (for questions)

The driver does not get Google Maps turn-by-turn. The system builds a list:

- skip Normal and Moderate bins
- keep Collection Required and Critical
- sort by priority score (fill + urgency + overdue)
- after collection, that bin is treated as empty (5%) so it drops off

---

## 5. Troubleshooting

| Problem | What to try |
|---|---|
| localhost does not open | You must run `npm run demo` on **this** PC, then use http://localhost:5173/ |
| Port already in use | Close the other Node window. The app is fixed to port 5173. |
| Old bins / old reports | Admin → **Reset Demo Data**, or use an incognito window |
| GitHub Pages 404 | Owner must enable Pages on `gh-pages`. Use the laptop demo instead. |
| `npm` not found | Install Node.js LTS from https://nodejs.org |

---

## 6. Uninstall

Delete the cloned folder. Optional: in the browser, Application → Local Storage → clear this site.
