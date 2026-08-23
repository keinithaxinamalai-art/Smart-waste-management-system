# Screen inventory — Smart Waste Management

Maps each React view to a Figma frame. Match the running app via `?export=` URLs (see [`../figma-export/FIGMA-NEW-PROJECT.md`](../figma-export/FIGMA-NEW-PROJECT.md)).

| # | Frame name | React source | Frame size | `?export=` URL param |
|---|------------|--------------|------------|----------------------|
| 01 | Login | `LoginView.tsx` | 1440×900 (or 390×844 mobile) | `login` |
| 02 | Manager Dashboard | `DashboardView` (default) | 1440×900 | `dashboard` |
| 03 | Bin Map | `MapView` in `DashboardView.tsx` | 1440×900 | `map` |
| 04 | Route Planning | `RoutesView.tsx` | 1440×900 | `routes` |
| 05 | Driver — Collection | `DriverView.tsx` | 390×844 | `driver` |
| 06 | Maintenance | `MaintenanceView.tsx` | 1440×900 | `maintenance` |
| 07 | Reports & KPIs | `ReportsView.tsx` | 1440×900 | `reports` |
| 08 | Public Report (form) | `PublicReportView.tsx` | 390×844 | `public` |
| 08b | Public Report (success) | `PublicReportView.tsx` success state | 390×844 | `public-success` |
| 09 | Public Reports (Admin) | `PublicReportsAdminView.tsx` | 1440×900 | `public-reports` |

**Shell (manager frames 02–04, 06–07, 09):** Fixed sidebar 260px + main column (header 64px + scrollable content).

**Branding copy**

- Product: **Smart Waste Management** / **Canberra Smart Waste**
- Sidebar title: **Smart Waste**
- Subtitle: **Canberra · TCCS Pilot**
- Footer: **Pilot Program** badge + **Territory & Municipal Services**

---

## Per-screen layout notes

### 01 Login

- Centered card max ~420px on mobile; at 1280px+ two-column grid (brand left, sign-in card right).
- Background: soft teal radial gradients on `gray/50`.
- Logo tile 56px, gradient `green/600` → `green/800`.
- Three actions: Manager (primary green), Driver (secondary), Public report (dashed teal border).

### 02 Manager Dashboard

- **Page header:** “Operations Dashboard” + live pill (green dot).
- **Stats row:** 6 stat cards (grid); include alert variant for new public reports.
- **Public alert banner** (conditional): red gradient strip → links to Public Reports.
- **Row 1:** Map panel (~1.4fr) + Alerts list (~1fr).
- **Row 2:** Bin table + chart card (Recharts bar/line).
- **Quick actions card:** “Plan Route” primary button.

### 03 Bin Map

- Full-width map card with bin markers legend; filter chips if present in UI.
- Same shell as dashboard; sidebar **Bin Map** active.

### 04 Route Planning

- Two cards: collection order list (stops) + route summary (distance, time, eco score).
- Primary green accents on completed stops.

### 05 Driver

- **No sidebar.** Centered mobile card: route ID, current stop, progress, **Mark Collected**.
- Footer link: “Report a bin (public)”.
- Background `gray/50`.

### 06 Maintenance

- Work orders table/cards; status badges (critical / warning / normal).
- Filters or tabs at top if shown in app.

### 07 Reports & KPIs

- KPI stat row + charts (donut/bar) + export-style actions.
- Date range or period label in header.

### 08 Public Report (mobile)

- Standalone column; top bar with back + “Report an issue”.
- Form: issue type chips, location, suburb, optional bin ID, description, geolocation button.
- Sticky **Submit** primary at bottom.

### 08b Public Report — Success

- Check icon, reference ID (e.g. `WST-2026-1001`), thank-you copy, **Done** button.

### 09 Public Reports (Admin)

- Table: ID, issue, location, status, submitted, actions.
- Filters: All / New / Assigned / Resolved.
- Row actions: Assign, Resolve; sidebar badge count for new items.

---

## Figma page structure (recommended)

```
📄 Cover          — Project title + token swatches
📄 Foundations    — Color & text styles, spacing grid
📄 Components     — Sidebar, header, cards, buttons, badges
📄 Desktop        — Frames 01–04, 06–07, 09 @ 1440×900
📄 Mobile         — Frames 05, 08, 08b @ 390×844
📄 Archive        — Old wireframes (optional)
```
