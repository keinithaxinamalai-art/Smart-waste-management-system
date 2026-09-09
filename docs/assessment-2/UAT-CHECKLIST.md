# User Acceptance Testing checklist — Canberra SmartWaste

Use a fresh / incognito window. Tick each row during rehearsal and keep a photo or this printed page for the Assessment 2 evidence folder.

Tester name: __________________  Date: __________  Build: `npm run demo` / Pages

| ID | Role | Step | Expected | Pass? |
|---|---|---|---|---|
| UAT-01 | None | Open app | Login screen, no admin shell | |
| UAT-02 | None | Sign in with wrong password | Error message, still on login | |
| UAT-03 | Citizen | Empty submit | Validation errors, no ticket | |
| UAT-04 | Citizen | Valid Canberra City report | `WST-2026-XXXX`, status Submitted | |
| UAT-05 | Admin | Public Reports status change | Under Review then Scheduled | |
| UAT-06 | Citizen | Track history | Same reference shows Scheduled | |
| UAT-07 | Admin | Dashboard + map | `WDN-104` 92% Critical on both | |
| UAT-08 | Admin | Route Planning | Only ≥80% bins, assign driver | |
| UAT-09 | Staff | Mark Collected `WDN-104` | Fill 5%, Normal, drops off urgent queue | |
| UAT-10 | Admin | Map / alerts after collect | Same 5%, not the old 92% | |
| UAT-11 | Admin | Maintenance acknowledge | Ticket Open → In Progress | |
| UAT-12 | Admin | Reset Demo Data | Seed bins and reports return | |

Notes / defects: ________________________________________________
