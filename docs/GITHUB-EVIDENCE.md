# GitHub Version Control Evidence — Iteration 1

Repository: [keinithaxinamalai-art/Smart-waste-management-system](https://github.com/keinithaxinamalai-art/Smart-waste-management-system)

This note supports Assessment 1 Section 4 (GitHub Repository) and presentation slide 6 (GitHub Branching & Modular Deliverables).

## Branching strategy

```text
main (stable Iteration 1 release)
└── develop (integration)
    ├── bijay-admin-dashboard
    ├── ayush-auth-testing
    ├── samir-citizen-interface
    ├── krishna-database-collection
    └── charanpal-maintenance-analytics
```

Work is integrated through pull requests. Feature branches stay on the remote so the teaching team can inspect module-level commit history.

## Merged pull requests

| PR | Title | Head branch | Evidence |
|---|---|---|---|
| [#1](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/1) | Ayush auth testing | `ayush-auth-testing` | Session flow, prototype login, AppContext |
| [#2](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/2) | Bijay admin dashboard | `bijay-admin-dashboard` | Admin dashboard, critical bins, collection execution |
| [#3](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/3) | Samir citizen interface | `samir-citizen-interface` | Citizen intake, validation, ACT suburbs |
| [#4](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/4) | Krishna database collection | `krishna-database-collection` | Types, `dataStore.ts`, priority algorithms, Vitest |
| [#5](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/5) | Develop | `develop` | Integration of module branches into the release line |

Charanpal Kaur’s diagnostics and technician-dispatch commits were merged on `charanpal-maintenance-analytics` and integrated to `main` (see commits `3e6a320`, `5b8bc63`, `2c3d511`). Subsequent maintenance lifecycle work is tracked in later PRs.

## Team contributions

Commit authors on `main` use each member’s Git identity (name + student/personal email) as listed in the README roster. Typical contribution split:

| Member | Feature branch | Representative commits |
|---|---|---|
| Bijay Pokhrel | `bijay-admin-dashboard` | Admin dashboard, role protection, demo reset, release freezes |
| Ayush Ale | `ayush-auth-testing` | Unauthenticated start, demo credentials, AppContext, login validation |
| Samir Bhandari | `samir-citizen-interface` | Report form, `WST-2026-XXXX` IDs, status model, collection sequence UI |
| Krishna Trivedi | `krishna-database-collection` | Domain types, localStorage store, `getBinStatus`, priority scoring, unit tests |
| Charanpal Kaur | `charanpal-maintenance-analytics` | Sensor diagnostics, technician tickets, waste composition charts |

## Quality controls (CI)

GitHub Actions workflow [Quality Controls](../.github/workflows/ci.yml) runs on every push and pull request:

1. `npm ci`
2. `npm run lint` (ESLint)
3. `npm test` (Vitest)
4. `npm run build` (TypeScript + Vite production bundle)

A second workflow publishes the Vite build to GitHub Pages from `main` so the prototype can be demonstrated without a local install.

## Professional GitHub practices added for Iteration 1

- Pull request template mapped to the five presentation modules
- Issue templates for user stories and bugs (with Jira key field)
- `CONTRIBUTING.md` describing the branch workflow
- Repeatable demo data reset for classroom marking
