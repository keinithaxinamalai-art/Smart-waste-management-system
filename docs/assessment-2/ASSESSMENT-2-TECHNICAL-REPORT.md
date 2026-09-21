# ICT308 Assessment 2 — Final Project Delivery

**Canberra SmartWaste: A Smart Waste Management System for Canberra**

**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**Group:** Bijay Pokhrel, Samir Bhandari, Krishna Trivedi, Ayush Ale, Charanpal Kaur  
**GitHub:** https://github.com/keinithaxinamalai-art/Smart-waste-management-system  
**Jira:** (paste the group Jira project link here before Moodle submit)

This report is the Assessment 2 final delivery. It covers the completed prototype after Iteration 1 (Assessment 1) and the work needed for the Week 11 demonstration. The User Guide is a separate appendix (`USER-GUIDE.md`). Assessment 3 poster and individual reflections sit under `docs/assessment-3/`.

---

## 1. Introduction

### 1.1 Project overview

Canberra SmartWaste is a software prototype for municipal waste collection in the Australian Capital Territory. Fixed collection days waste truck time because some public bins fill early and overflow, while other bins are almost empty and still get serviced. Studies of smart waste systems show that sensor-style fill data, a central dashboard and operational decision support can make collection more responsive (Sosunova & Porras, 2022). An et al. (2022) also show, in an Australian municipal case, that smart-bin fullness data can sit on a dashboard for decision makers.

The group did not deploy Internet of Things hardware. All bin readings are simulated Canberra locations (Belconnen, Gungahlin, Woden, Dickson, Kingston, Canberra City and nearby suburbs). The product is an operational monitoring tool plus a citizen reporting tool (Kuang & Lin, 2021; Wang et al., 2021).

### 1.2 Objectives

The completed system was meant to:

- give three role based experiences (Citizen, Collection Staff, Administrator)
- classify simulated fill levels with a reusable function
- score pickup urgency with a transparent rule, not a black box A.I. model
- let staff only drive to bins that actually need emptying
- let residents submit and track waste issues with `WST-2026-XXXX` references
- keep one shared application state so the map, dashboard and driver queue stay in sync
- persist demonstration data in the browser so a classroom demo can be repeated
- keep automated tests and GitHub Actions around the important business rules

### 1.3 Summary of the completed system

The finished prototype is a React 19 / TypeScript 6 / Vite 8 single-page application. Shared state is held in React Context. Persistence is `localStorage` through `src/services/dataStore.ts`. There is no PostgreSQL server and no Express API in this delivery. Login uses fictional demo accounts. Administrators can reset seed data. Collection staff follow a priority sequence of bins at or above 80% fill. Citizens submit reports that administrators can move through Submitted, Under Review, Scheduled and Resolved. Maintenance staff can acknowledge simulated sensor faults. Vitest covers the classification, scoring, validation and report-resolution rules.

---

## 2. System Implementation

### 2.1 Technologies used

| Layer | What we used | Why |
|---|---|---|
| UI | React 19, modular CSS, Lucide icons, Recharts | Role screens, tables, forms, charts |
| Language / build | TypeScript 6, Vite 8 | Types for roles, statuses and bins; fast local demo |
| State | `AppContext` + `useApp()` | One live copy of bins, reports, collections, tickets |
| Persistence | `dataStore.ts` / browser `localStorage` | Demo without standing up a backend |
| Session | `sessionStorage` | Remember the logged-in role until logout |
| Tests / quality | Vitest, ESLint, GitHub Actions | Lint, unit tests and production build on every push |

### 2.2 Architecture (brief)

The architecture is a client-only three-layer idea, not a hosted three-tier stack.

1. **Views** — Login, citizen portal, admin dashboard, map, route planning, driver queue, public-report admin, maintenance, KPI charts.
2. **Application state** — `AppContext` exposes login, logout, submit report, change report status, assign route, mark collected, acknowledge tickets, and reset demo data.
3. **Persistence** — `dataStore.ts` reads and writes four `localStorage` keys: `swm_bins_v2`, `swm_reports_v2`, `swm_collections_v2`, `swm_tickets_v1`.

If a later iteration adds a real API, the views can stay. Only the store functions need to call HTTP instead of `localStorage`. That was a deliberate scope choice so Week 6 and Week 11 demonstrations do not depend on a cloud database.

### 2.3 Implemented functionality

**Authentication and roles.** The app starts logged out. Sign in checks the email and password against three fictional accounts (`admin@smartwaste.demo`, `staff@smartwaste.demo`, `citizen@smartwaste.demo`). A wrong password on the Sign in form shows an error. One-click demo buttons exist for a fast class run. Citizens only see reporting. Staff only see the collection run. Administrators get the full shell (dashboard, map, routes, reports, maintenance, KPIs) plus Reset Demo Data.

**Smart bin monitoring.** Seeded bins cover several Canberra suburbs. `getBinStatus()` maps fill to Normal (0–49%), Moderate (50–79%), Collection Required (80–89%) and Critical (90–100%). Invalid values are clamped. The same helper is used on the map, dashboard, alerts and driver queue so a 92% bin is Critical everywhere.

**Priority scoring.** `calculateCollectionPriority()` adds fill contribution (fill × 0.5, max 50), urgency from a linked report (up to 30) and overdue hours (up to 20). The score falls into Low / Medium / High / Critical. This is a rule based approach, similar in spirit to work that uses fill data to support collection decisions (Roy et al., 2022; Ghahramani et al., 2022), but it is not vehicle-routing optimisation.

**Route management for the driver.** Empty and moderate bins are not put on the pickup sequence. Only Collection Required and Critical bins are listed, sorted by priority score. The administrator approves the sequence for Route ACT-R104. The driver sees Priority Stop #1 and upcoming stops. **Mark Collected** resets fill to 5%, updates last collected time, recalculates priority, completes matching collection records, and resolves only reports whose `binId` matches that bin. Unrelated reports in the same suburb stay open. After that, the emptied bin drops off the urgent run.

**Citizen reporting.** The form takes issue type, location, suburb, urgency, waste type, optional bin ID and optional contact details. Validation blocks empty required fields and whitespace-only descriptions. A unique `WST-2026-XXXX` reference is created. Administrators change status. Citizens can search history by reference.

**Administrator dashboard.** Live counts for active reports, critical bins, bins needing collection, average fill, total bins and resolved reports. Critical-bin cards can dispatch collection. Search and the notification bell read the same state.

**Maintenance.** Simulated sensor error, low battery, lid jam and offline tickets. Acknowledge moves a ticket from Open to In Progress, then it can be marked Resolved.

### 2.4 Major software components

`src/utils/binUtils.ts` holds the reusable algorithms. `src/services/dataStore.ts` holds seed data and save/load. `src/context/AppContext.tsx` is the runtime coordinator. Views under `src/views/` are the role screens. Tests live next to the algorithms in `binUtils.test.ts`.

The views are split by job, not by one giant page. `LoginView` is the only screen when there is no session. `PublicReportView` is the citizen form and history. `CollectionStaffView` is the driver queue. The administrator shell (`App.tsx` plus the dashboard, map, route, public-report admin, maintenance and KPI screens) is only mounted after an admin role is set. Shared widgets such as the header search and the notification bell read the same Context arrays, so they cannot show a different fill level from the table.

The data store is deliberately small. Seed bins are Canberra-named (`WDN-104`, `GUN-015`, `BEL-022` and the rest). Seed reports already have `WST-2026-` numbers so a marker who does not submit a new ticket can still search history. Seed tickets cover the four fault types. When an administrator clicks Reset Demo Data the four `localStorage` keys are rewritten from that seed. That is the closest thing the project has to a database restore.

### 2.5 What “completed” means for this semester

Completed does not mean “ready for TCCS production”. It means the Week 11 assessor can walk the citizen-to-collection story on one laptop, the unit tests stay green, and the written report matches the repository. Those three things were the real close-out criteria after Assessment 1. Features that look impressive in smart-waste papers (live sensors, multi-truck optimisation, resident mobile push) were left out on purpose so the demonstration would not depend on hardware or a cloud account.

---

## 3. Design Revisions

The ICT307 design (and an early Word draft in the repository) described a three-tier product: React 18 + Tailwind on the front, Node/Express + JWT in the middle, and PostgreSQL at the back, with Leaflet maps and React Hook Form. The implemented system is different, and that needs to be said clearly so the assessor is not shown an architecture that is not in GitHub.

### 3.1 Significant design changes

| ICT307 / early design | What was actually built | Reason |
|---|---|---|
| Express REST API + JWT | No backend. Demo login in the browser | A hosted API was out of Iteration 1 scope and would have blocked classroom demos |
| PostgreSQL | `localStorage` via `dataStore.ts` | Repeatable demo with no server to install |
| Leaflet / live GPS routing | Schematic map + priority sequence | No real telemetry; claiming shortest-path routing would be false |
| Tailwind + React Hook Form | Modular CSS + our own `validateWasteReport()` | Kept the stack small and under our control |
| Three fill colours only | Four status tiers (Normal / Moderate / Collection Required / Critical) | Matches the operational rule used on every screen |
| Resolve all reports in a suburb when a bin is emptied | Resolve only `report.binId === collectedBinId` | Stops wrong tickets closing |

### 3.2 Impact on the final solution

The change made the product honest. Staff and the supervisor can run `npm run demo` and see the whole workflow. The cost is that data is per browser, not shared across the team on a cloud database. Role security is a UI gate, not server-side JWT. Those limits are written in the User Guide and in Section 6.

The other impact is teaching-team marking. A marker who reads the old ICT307-style Word draft and then opens GitHub would think the group failed to deliver an API. The group therefore replaced that draft language and used this section to say the change was planned, not hidden. Assessment 1 already showed the client-only stack. Assessment 2 does not pretend a backend appeared between Week 6 and Week 11.

A third impact is on Assessment 3. The poster QR code points at GitHub, not at a cloud console. A showcase visitor who scans the code sees the same Vite project the report describes. That is better than a poster that advertises PostgreSQL and then fails when someone looks for a `server/` folder.

### 3.3 Lessons learned

Keeping two “sources of truth” (static mock arrays and live state) broke the demo: collecting a bin on the driver screen left the map stale. Moving everything through Context fixed that. Another lesson was not to copy literature features (IoT, AI routing) into the report unless the code does them. Hess et al. (2024) and Addas et al. (2024) are useful for future work, not for claiming the current prototype.

A practical lesson was about demonstration hosting. Opening `localhost` on a second laptop does nothing, because the Vite process is on the first laptop. The group wasted time thinking the app was “broken” when the URL was just on the wrong machine. The User Guide now says that in plain language. Vite was also pinned to port 5173 with `strictPort: true` so a second process cannot silently move the demo to 5174.

The last lesson is about documents as part of the product. Assessment 1, 2 and 3 are easier to mark when the same four status names, the same 80% rule and the same three demo accounts appear in the Iteration 1 report, this report, the user guide, the poster and the reflections. When a number drifted (for example an old `PR-1001` ticket id), we treated it as a defect the same way we treat a stale map pin.

---

## 4. Testing and Evaluation

### 4.1 Unit testing

Vitest runs with `npm test`. The suite checks:

- fill boundaries for all four statuses
- invalid sensor values (`null`, `NaN`, −10, 105)
- report and collection status normalisation
- priority score examples (Low / Medium / High / Critical)
- `WST-2026-XXXX` format and uniqueness
- `validateWasteReport()` for empty fields, whitespace and bad email
- collection only resolves the report linked to that `binId`
- maintenance ticket status moves Open → In Progress → Resolved without changing other tickets

At the last run the suite reported 22 passing tests. GitHub Actions runs the same command on each push and pull request, plus ESLint and `npm run build`.

### 4.2 Integration testing (manual)

The group walked the end-to-end path that Assessment 1 already used and that Assessment 2 still uses:

1. Start logged out.
2. Citizen submits a Canberra City report and notes the reference.
3. Admin moves it to Under Review then Scheduled.
4. Citizen history shows the new status.
5. Admin assigns the ≥80% sequence.
6. Staff mark `WDN-104` collected; fill becomes 5%.
7. Dashboard, map and alerts show the same 5%.
8. Maintenance acknowledge is used.
9. Reset Demo Data restores the seed.

This is integration in the sense that login, store, algorithms and several views are exercised together. It is not a separate backend test harness, because there is no backend.

### 4.3 User Acceptance Testing

A short UAT script is in `docs/assessment-2/UAT-CHECKLIST.md`. The acceptance idea is: a marker can follow the User Guide with the three demo accounts and complete a citizen-to-collection story without the app crashing or showing stale numbers.

### 4.4 Performance

No load test was run. The dataset is a small seeded grid (nine bins). Vite production build completes in under a second on a normal laptop. That is enough for a classroom demo and not enough to claim a production SLA.

### 4.5 Defects and corrective actions

| Defect | How it showed up | Fix |
|---|---|---|
| Map / dashboard used old mock arrays | Collecting a bin did not change the map | All views read `useApp()` |
| Suburb-wide report close | Emptying one Belconnen bin closed Civic tickets | Strict `binId` match + unit tests |
| Moderate bins on the truck list | 71% bins appeared as required stops | Filter is status Critical or Collection Required only |
| Login form vs 1-click buttons | 1-click ignores the typed password | Documented: Sign in validates; 1-click is for class speed |
| Vite jumped to port 5174 | Second `npm run demo` made localhost look “dead” | `strictPort: true` on 5173 |
| GitHub Pages 404 | `gh-pages` branch exists but Pages not enabled in Settings | README + User Guide tell the owner to turn Pages on; laptop demo is the fallback |

### 4.6 How a marker can reproduce the tests

Evidence is in the repository, not only in this chapter.

1. On a machine with Node.js 18+, run `npm install` then `npm test`. The console should print 22 passing tests from `src/utils/binUtils.test.ts`.
2. Open the latest GitHub Actions run on `main` or on this pull request. The Quality Controls workflow runs lint, the same Vitest command, and `npm run build`.
3. Walk `docs/assessment-2/UAT-CHECKLIST.md` in an incognito window. Twelve rows cover login, citizen, admin, driver, maintenance and reset.
4. Keep one screenshot set (login error, a new `WST-2026-XXXX`, `WDN-104` at 92%, then 5% after collect) in the Moodle ZIP next to the User Guide.

The group treats a failed unit test as a release blocker. A failed UAT row is a rehearsal defect: fix the product or fix the script before Week 11, do not argue with the assessor during the 15 minutes.

---

## 5. Deployment

### 5.1 Deployment environment

Two environments are supported.

**Local demonstration (recommended for class).** Node.js 18+ and npm. Commands: `npm install` then `npm run demo`. The UI is http://localhost:5173/ on **that same computer**. Localhost on a different laptop will not show this app.

**GitHub Pages.** Workflow `.github/workflows/pages.yml` builds the Vite app with base path `/Smart-waste-management-system/` and publishes the `gh-pages` branch. After Settings → Pages → deploy from `gh-pages` / root, the public URL is:

https://keinithaxinamalai-art.github.io/Smart-waste-management-system/

CI (`.github/workflows/ci.yml`) runs lint, test and build on `main`, `develop` and pull requests.

### 5.2 Installation process

See the User Guide. Short version: clone the repository, `npm install`, `npm run demo`. No Docker, no database migrate, no `.env` secrets for the demo accounts.

### 5.3 System configuration

There is almost no configuration. Demo users are hard-coded. Schema keys are versioned (`_v2`) so older local data can be replaced by Reset Demo Data. `BASE_PATH` is only set in the Pages build.

### 5.4 Limitations

- Data is not shared between browsers or teammates.
- Clearing site data wipes the demo until reset or reload of seed.
- Pages will 404 until the repository owner enables it.
- This is not a production TCCS system and should not be described as one.

---

## 6. Security and Ethical Considerations

### 6.1 Security measures implemented

- The app starts unauthenticated. Staff and admin screens are not shown without a role.
- The Sign in form checks email and password against the three demo accounts.
- Password fields use `type="password"`.
- There are no real API keys in the repository. An old Figma `.env.example` was removed.
- GitHub Actions does not inject production secrets.

### 6.2 Limitations (must be said in the demo)

This is a prototype. Anyone who knows the demo passwords can use every role. Role checks are in the React tree, not on a server. `localStorage` can be edited in DevTools. That would be unacceptable for real resident data. A later version needs a real identity provider, HTTPS API and a server-side role check (Shklar & Rosen, 2022, on web application structure, is the general idea; we have not implemented that stack).

### 6.3 Privacy

Citizen reports can include an optional name and email. Those values stay in that browser only. Seed names (`Alex Mercer`, and so on) are fictional. We do not upload resident information to a cloud database. The User Guide tells markers not to type real personal details during the demonstration.

### 6.4 Ethical issues

- **Honest scope.** The UI labels telemetry as simulated. We do not claim live IoT or AI routing.
- **Public participation.** A visible report form is included because waste outcomes also depend on residents (Kuang & Lin, 2021), but a prototype form is not the same as a council service.
- **Municipal branding.** TCCS / Canberra naming is for a student pilot, not an official government product.
- **Assessment integrity.** The group has to be able to explain the code in the live demonstration. Copy-pasted architecture that is not in GitHub was removed from the earlier draft report.
- **Accessibility of the demo.** The classroom path uses a normal browser and three published demo passwords so a marker is not locked out by a missing cloud key. That choice is convenient, but it is also why Section 6.2 has to say the product is not safe for real residents.
- **Showcase visitors (Assessment 3).** The poster tells a visitor in one sentence that there is no live sensor network. If someone scans the QR and tries to report a real overflowing bin, the User Guide and the poster both say not to enter personal details and not to treat the form as a council channel.

These points matter for ICT308 because the unit marks professional practice as well as screens. A polished UI that hides the prototype limits would be a weaker ethical position than a simpler UI with a clear warning.

### 6.5 Future security improvements

Server-side login, hashed passwords, HTTPS hosting, a shared database with access control, and no demo passwords in the README for a real deployment.

---

## 7. Project Management

### 7.1 GitHub

Repository: https://github.com/keinithaxinamalai-art/Smart-waste-management-system

Branching followed Assessment 1 and continued for the final delivery:

```text
main
└── develop
    ├── bijay-admin-dashboard
    ├── ayush-auth-testing
    ├── samir-citizen-interface
    ├── krishna-database-collection
    └── charanpal-maintenance-analytics
```

Merged module pull requests on this repository include #1 Ayush (auth / context), #2 Bijay (admin dashboard), #3 Samir (citizen interface), #4 Krishna (data store and algorithms), #5 develop integration, and later PRs for demo hosting and this Assessment 2/3 document pack. Commit authors use each member’s Git name and email. Day to day talk was Google Chat. GitHub is the evidence of who changed what. More tables are in `docs/GITHUB-EVIDENCE.md`.

### 7.2 Jira

Jira is the planning record. Epics match the GitHub modules: authentication, citizen reporting, data and algorithms, administrator monitoring, collection management, maintenance, testing, and assessment write-up. The board uses To Do, In Progress and Done. Each story should have an assignee, acceptance criteria and a link to the pull request. Sprint summaries and the burndown should be exported into the Moodle ZIP for the teaching team. If the Jira URL is missing from the cover sheet the marker cannot give full project-management marks, so it must be filled in before submit.

### 7.3 How Assessment 1, 2 and 3 fit together

| Assessment | Week | What we submit | What it uses |
|---|---|---|---|
| 1 | 6 | Iteration 1 report, 15-min demo | Working prototype, GitHub branches, Jira start |
| 2 | 11 | This 4000-word report, User Guide, 15-min final demo | Completed system, tests, deployment, security/ethics |
| 3 | 12 | A3 poster + individual 1500-word reflections + client form | Showcase talk; each person explains their module |

The product did not change identity between the three assessments. The same five roles, the same localStorage store, and the same bin rules appear in the Iteration 1 report, this document and the poster. What changed is the amount of testing evidence and the amount of writing around the product.

A marker who only has 20 minutes should open these six items first:

1. `README.md` — how to run it and who did what.
2. This report — design, testing, deployment and ethics.
3. `docs/assessment-2/USER-GUIDE.md` — how a non-technical user uses each screen.
4. `docs/assessment-2/UAT-CHECKLIST.md` — the twelve acceptance rows.
5. `docs/assessment-3/POSTER.html` — the public one-page summary.
6. `src/services/dataStore.ts` and `src/utils/binUtils.ts` — the two files that prove the architecture and the priority rules.

If those six items agree, the rest of the repository is supporting evidence rather than a second story.

---

### 7.4 Live demonstration plan (Assessment 2)

The Week 11 session is 15 minutes (10 minutes showing the system, 5 minutes questions). The group will not flick through menus at random. The story is the same one Assessment 1 used, because that is still the completed product.

Ayush starts on a logged-out browser and shows a failed password. Samir submits a citizen report and reads the reference. Bijay moves the ticket and shows that the dashboard and the map agree on `WDN-104`. Krishna explains why a 42% bin is not on Route ACT-R104 and then marks a full bin collected. Charanpal shows the 5% value on the other screens, acknowledges a maintenance ticket, and resets the seed.

Questions we expect, and the short answers we will give:

- **Where is the database?** In the browser. `dataStore.ts` writes `localStorage`. There is no hosted SQL database in this delivery.
- **How does the driver manage routes if one bin is full and one is empty?** Empty and moderate bins never enter the sequence. Only ≥80% bins are ordered by priority score. After Mark Collected the full bin becomes 5% and drops off.
- **Is this AI routing?** No. The score is fill, urgency and overdue time. Shortest-path routing is future work (Hess et al., 2024).
- **Why not the ICT307 API?** Building Express and Postgres would have delayed the demo and claimed a backend we could not operate in class. That change is Section 3.
- **Is it secure enough for real residents?** No. Demo passwords and client-side roles are for marking, not for production (Section 6).

A printed UAT sheet with twelve ticks sits in `UAT-CHECKLIST.md`. We will take one screenshot set during rehearsal and put it in the Moodle appendix next to the User Guide.

### 7.5 What still belongs to Jira / GitHub before upload

Before Moodle close we still need to paste the live Jira URL on the cover sheet, export one sprint screenshot (To Do / In Progress / Done), and make sure `main` contains this document pack. GitHub Actions already records lint, test and build. That is the project-management evidence the rubric asks for, together with the five feature branches from Assessment 1.

---

## 8. Conclusion

Canberra SmartWaste is a completed Iteration 1-to-final classroom prototype. It does role based access, citizen reporting, four-tier fill classification, rule based priority, a driver sequence that skips empty bins, collection that resets fill to 5%, and maintenance acknowledgement. It does not do live IoT, a shared database, or shortest-path routing. Those belong in later work (Addas et al., 2024; Hess et al., 2024). The demonstration should show the end-to-end story, not a tour of disconnected screens.

---

## References

Addas, A., Khan, M. N., & Naseer, F. (2024). Waste management 2.0 leveraging internet of things for an efficient and eco-friendly smart city solution. *PLOS ONE, 19*(7), e0307608. https://doi.org/10.1371/journal.pone.0307608

An, Y., Qiu, J., & Dong, Z. Y. (2022). Smart waste management system for decision makers by using smart bins: A case study for an Australian municipality. *Australian Journal of Civil Engineering, 20*(2), 454–459. https://doi.org/10.1080/14488353.2021.2024329

Ghahramani, M., Zhou, M., Molter, A., & Pilla, F. (2022). IoT-based route recommendation for an intelligent waste management system. *IEEE Internet of Things Journal, 9*(14), 11883–11892. https://arxiv.org/abs/2201.00180

Hess, C., Dragomir, A. G., Doerner, K. F., & Vigo, D. (2024). Waste collection routing: A survey on problems and methods. *Central European Journal of Operations Research, 32*, 399–434. https://doi.org/10.1007/s10100-023-00892-y

Kuang, Y., & Lin, B. (2021). Public participation and city sustainability: Evidence from urban garbage classification in China. *Sustainable Cities and Society, 67*, 102741. https://doi.org/10.1016/j.scs.2021.102741

Roy, A., Manna, A., Kim, J., & Moon, I. (2022). IoT-based smart bin allocation and vehicle routing in solid waste management: A case study in South Korea. *Computers & Industrial Engineering, 171*, 108457. https://doi.org/10.1016/j.cie.2022.108457

Sosunova, I., & Porras, J. (2022). IoT-enabled smart waste management systems for smart cities: A systematic review. *IEEE Access, 10*, 73326–73363.

Wang, C., Qin, J., Qu, C., Ran, X., Liu, C., & Chen, B. (2021). A smart municipal waste management system based on deep-learning and Internet of Things. *Waste Management, 135*, 20–29. https://pubmed.ncbi.nlm.nih.gov/34461487/
