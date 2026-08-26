# ICT308 Iteration 1 Technical Report

**Canberra SmartWaste — Smart Waste Management System for Canberra**  
ICT308 – Project 2 (BIT Capstone) · Semester 2, 2026  
Group prototype · Week 6 submission

**GitHub:** https://github.com/keinithaxinamalai-art/Smart-waste-management-system  
**Jira:** (group Jira project link — attach in the Moodle cover sheet)

---

## 1. Project Overview

Fixed municipal collection schedules waste truck kilometres and still leave busy public bins overflowing. Canberra SmartWaste is an Iteration 1 software prototype for Transport Canberra and City Services (TCCS). It monitors simulated ACT smart-bin telemetry, classifies fill levels, scores collection urgency, accepts citizen reports, and lets staff complete pickups that reset bins and close linked tickets.

Iteration 1 deliberately excludes physical IoT hardware. All sensor readings, routes, and credentials are simulated so the team can demonstrate complete role-based workflows in a classroom without a backend or cloud database.

Completed work covers five modules that map to GitHub feature branches: administrator operations (Bijay), authentication and tests (Ayush), citizen reporting (Samir), persistence and algorithms (Krishna), and maintenance diagnostics (Charanpal). The working prototype, this report, the 15-slide demonstration deck, the GitHub repository, and the Jira board are the Iteration 1 deliverables.

## 2. System Implementation

### 2.1 Architecture

The prototype is a single-page React 19 + TypeScript 6 + Vite 8 application. There is no Node/Express API and no PostgreSQL database in this iteration. A React Context (`AppContext`) is the runtime source of truth for role, bins, reports, collections, and technician tickets. `src/services/dataStore.ts` serialises that state to `localStorage` so a demonstration can be paused and resumed in the same browser. An administrator **Reset Demo Data** control restores the seeded ACT dataset.

This architecture matches the presentation: a modern frontend stack, unified state, and local persistence suitable for repeatable marking. Later iterations can replace the store with live microcontroller telemetry and a cloud database without rewriting the views.

### 2.2 Implemented modules

**Session and role protection.** Unauthenticated users see the prototype login (or an anonymous public report form). Valid demo accounts are `admin@smartwaste.demo`, `staff@smartwaste.demo`, and `citizen@smartwaste.demo`. Citizens stay in the reporting portal; collection staff see the priority pickup queue; administrators receive the full operations shell (dashboard, map, routes, public-report admin, driver view, maintenance, KPIs). Route protection and central `ROLE_LABELS` prevent staff from opening manager screens.

**Bin monitoring and classification.** Seeded bins cover eight Canberra suburbs (Canberra City, Belconnen, Gungahlin, Woden, Tuggeranong, Dickson, Kingston, Manuka). `getBinStatus()` clamps invalid sensor values and maps fill to four operational tiers: 0–49% Normal, 50–79% Moderate, 80–89% Collection Required, 90–100% Critical. The dashboard critical-bin spotlight, map legend, alerts, and staff queue all use the same helper, so a 92% reading on `WDN-104` is Critical everywhere.

**Priority scoring.** `calculateCollectionPriority()` is a deterministic weighted model: fill contribution (fill × 0.5), urgency contribution (Critical 30 / High 20 / Medium 10 / Low 0), and overdue contribution (capped at 20). Scores map to Low / Medium / High / Critical. Routes view orders stops by score among bins at or above 80% fill.

**Citizen reporting.** The intake form captures issue category, street location, ACT suburb, urgency, optional smart-bin ID, and optional photo flag. Client validation rejects empty or whitespace-only required fields. Successful submissions receive a unique `WST-2026-XXXX` reference. Status values are normalised to Submitted, Under Review, Scheduled, and Resolved. Administrators advance tickets; citizens see the updated status in report history.

**Collection execution.** Marking a bin collected resets fill to 5%, writes `lastCollected`, recalculates priority, completes matching collection records, and resolves **only** public reports whose `binId` equals the serviced bin. Unrelated tickets in the same suburb stay open. This is the relational integrity rule exercised in Vitest.

**Maintenance diagnostics.** The maintenance view monitors simulated sensor errors, low-battery warnings, lid mechanism jams, and offline modules. Technician work orders persist in `localStorage` and follow Open → In Progress → Resolved. Demo reset restores the seeded tickets.

### 2.3 User interface

Role-specific views are built as modular React components with vanilla CSS custom properties (no Tailwind in this codebase). Lucide icons provide a consistent visual language. The header search overlay and notification bell are wired to the same reactive bin and report state used by the dashboard.

Screenshot the following screens for the Moodle Word submission (run `npm run dev`, then capture each role):

- **Login** — three prototype roles, password field, invalid-credential error, public report shortcut.
- **Citizen portal** — structured intake (suburb list, issue categories, urgency, optional bin ID) and Track Reports history with reference search.
- **Administrator dashboard** — live stats, critical-bin spotlight with dispatch, telemetry map, alerts, CSV export.
- **Route planning** — suggested sequence for fill ≥ 80%, one-click driver assignment.
- **Staff collection** — priority stop, Mark Collected, upcoming stops.
- **Public report admin** — filter chips for Submitted / Under Review / Scheduled / Resolved.
- **Maintenance** — sensor stats plus work-order lifecycle controls.
- **Reports & KPIs** — composition and volume charts derived from current bin context.

### 2.4 Software components

| Layer | Implementation |
|---|---|
| UI | React 19, TypeScript 6, Vite 8, modular CSS |
| State | `AppContext` + `useApp()` |
| Persistence | `dataStore.ts` / `localStorage` |
| Algorithms | `binUtils.ts` (`getBinStatus`, priority, validation, ID generation) |
| Tests | Vitest |
| Quality | ESLint 10, GitHub Actions CI (lint, test, build) |

## 3. Technical Challenges

**Single source of truth.** Early screens used static mock arrays, so collecting a bin on the driver view did not update the map or dashboard. The team moved all reads through Context and derived alerts, charts, and queues from that state. Lesson: demo-ready prototypes still need one store if markers, tables, and KPIs must agree.

**Invalid telemetry.** Sensor stubs can emit `null`, `NaN`, or values outside 0–100. Clamping inside `getBinStatus` and the priority function stopped negative percentages and overflow errors from crashing status badges.

**Report resolution scope.** A first collection implementation closed every overflow ticket in a suburb. Tests were added so only records with the matching `binId` resolve. That rule is now part of the demonstration script (collect `WDN-104`, confirm `WST-2026-1001` in Civic is unchanged unless it points at that bin).

**Repeatable demos.** `localStorage` made the app feel persistent but left leftover tickets between marking runs. The administrator reset control, plus ticket persistence in the same store, makes the Week 6 walkthrough deterministic.

**Honest documentation.** An earlier Word draft described Express, JWT, PostgreSQL, and Leaflet. The implemented stack is a client-side Vite prototype. This report and the GitHub README were rewritten to match the running code so assessors are not shown an architecture that is not in the repository.

**Collaboration on one repository.** Five authors committing to shared files (`App.tsx`, `dataStore.ts`, CSS) produced merge conflicts. The team adopted module ownership (slide 6), short-lived feature branches, and pull requests with a shared template so review happened before `develop` moved. Conventional commit prefixes (`feat`, `fix`, `test`, `docs`) make the history readable for the GitHub marking criterion.

## 4. GitHub Repository

Repository: https://github.com/keinithaxinamalai-art/Smart-waste-management-system

The team used Git feature branches that match presentation slide 6. Each member committed under their own Git author name and email. Integration used pull requests into `develop` and then `main`.

| Member | Branch | Merged PR |
|---|---|---|
| Ayush Ale | `ayush-auth-testing` | [#1](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/1) |
| Bijay Pokhrel | `bijay-admin-dashboard` | [#2](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/2) |
| Samir Bhandari | `samir-citizen-interface` | [#3](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/3) |
| Krishna Trivedi | `krishna-database-collection` | [#4](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/4) |
| Integration | `develop` | [#5](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/5) |
| Charanpal Kaur | `charanpal-maintenance-analytics` | Diagnostics commits on that branch, merged to `main` |

Commit messages follow `feat` / `fix` / `test` / `docs` conventions. GitHub Actions now runs ESLint, Vitest, and the production build on every push and pull request. Issue and pull-request templates map work to the five modules and a Jira key. `CONTRIBUTING.md` records the branching rules for the teaching team. Further GitHub evidence (PR table, contribution notes) is in `docs/GITHUB-EVIDENCE.md`.

## 5. Jira Project Management

Jira is the planning system of record for Iteration 1. Epics follow the same five domains as GitHub branches so a story, a branch, and a pull request stay aligned (presentation slides 6 and 9).

| Epic | Example stories | Branch |
|---|---|---|
| Admin Management | Critical-bin spotlight; role labels; demo reset | `bijay-admin-dashboard` |
| Session & Testing | Unauthenticated start; demo login validation; Vitest suite | `ayush-auth-testing` |
| Citizen Reporting | ACT suburbs; whitespace validation; `WST-2026-XXXX` | `samir-citizen-interface` |
| Data Persistence | Domain types; `localStorage` store; priority formula | `krishna-database-collection` |
| Operations & Maintenance | Sensor faults; lid-jam tickets; Open/In Progress/Resolved | `charanpal-maintenance-analytics` |

The Iteration 1 sprint board uses To Do, In Progress, and Done. Each story has an assignee, acceptance criteria, and a link (or key) recorded on the matching GitHub pull request. Export the sprint summary or burndown chart from Jira for the Moodle ZIP so the 5-mark project-management criterion has visual evidence.

GitHub issue templates include a Jira key field so defects found during rehearsal can be copied back to the backlog. Remaining Iteration 2 work already sitting in Jira includes live IoT telemetry, a hosted database, and geospatial route optimisation.

## 6. Project Demonstration

The 10-minute live demonstration (plus 5-minute questions) follows README stages A–I and should be split equally among team members:

1. **Unauthenticated start** — login is required; admin URLs are blocked.
2. **Citizen intake** — empty submit is rejected; a Canberra City report receives `WST-2026-XXXX`.
3. **Administrator review** — status moves to Under Review then Scheduled.
4. **Citizen sync** — history shows Scheduled.
5. **Telemetry** — map and table show all four fill-level tiers.
6. **Consistency** — `WDN-104` at 92% is Critical on map and dashboard.
7. **Collection** — staff mark `WDN-104` collected; fill becomes 5% Normal.
8. **Cross-screen update** — dashboard, alerts, and map agree.
9. **Maintenance** — start work on an Open sensor ticket; resolve the lid-jam work order.
10. **Reset** — administrator restores seed data.

Remaining work (Iteration 2): replace simulated sensors with microcontroller feeds, persist to a cloud database, and add true geospatial routing. Iteration 1 is a demonstration-ready software prototype for three roles, not a deployed IoT network.

## Acknowledgement of AI use

Generative AI (Cursor) was used to support debugging, documentation drafting, GitHub workflow files, and grammar. Team members remain responsible for the design, code, and the ability to explain the prototype during the Week 6 demonstration, in line with the CIHE Academic Integrity Policy.

## References

Bass, L., Clements, P., & Kazman, R. (2021). *Software architecture in practice* (4th ed.). Addison-Wesley.

Mozilla Developer Network. (2023). *Client-side form validation*. https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation

Sommerville, I. (2016). *Software engineering* (10th ed.). Pearson.
