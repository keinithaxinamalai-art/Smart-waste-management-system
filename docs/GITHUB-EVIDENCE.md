# GitHub version control evidence — Iteration 1

Repository: [keinithaxinamalai-art/Smart-waste-management-system](https://github.com/keinithaxinamalai-art/Smart-waste-management-system)

Live demonstration: https://keinithaxinamalai-art.github.io/Smart-waste-management-system/

This note is for Assessment 1 Section 4 (GitHub Repository) and section 4 of the group report.

## Branching

```text
main (stable Iteration 1)
└── develop (integration)
    ├── bijay-admin-dashboard
    ├── ayush-auth-testing
    ├── samir-citizen-interface
    ├── krishna-database-collection
    └── charanpal-maintenance-analytics
```

Work goes in through pull requests. Feature branches are left on the remote so the teaching team can look at each module's commit history.

## Merged pull requests

| PR | Title | Head branch | What it covers |
|---|---|---|---|
| [#1](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/1) | Ayush auth testing | `ayush-auth-testing` | Session flow, prototype login, AppContext |
| [#2](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/2) | Bijay admin dashboard | `bijay-admin-dashboard` | Admin dashboard, critical bins, collection execution |
| [#3](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/3) | Samir citizen interface | `samir-citizen-interface` | Citizen intake, validation, ACT suburbs |
| [#4](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/4) | Krishna database collection | `krishna-database-collection` | Types, `dataStore.ts`, priority algorithms, Vitest |
| [#5](https://github.com/keinithaxinamalai-art/Smart-waste-management-system/pull/5) | Develop | `develop` | Integration of module branches into the release line |

Charanpal Kaur's diagnostics and technician-dispatch commits were merged on `charanpal-maintenance-analytics` and integrated to `main` (see commits `3e6a320`, `5b8bc63`, `2c3d511`). Later maintenance lifecycle work is in later PRs.

## Team contributions

Commit authors on `main` use each member's Git name and email as listed in the README.

| Member | Feature branch | Typical work |
|---|---|---|
| Bijay Pokhrel | `bijay-admin-dashboard` | Admin dashboard, role protection, demo reset |
| Ayush Ale | `ayush-auth-testing` | Unauthenticated start, demo credentials, AppContext, login validation |
| Samir Bhandari | `samir-citizen-interface` | Report form, `WST-2026-XXXX` IDs, status model, collection sequence UI |
| Krishna Trivedi | `krishna-database-collection` | Domain types, localStorage store, `getBinStatus`, priority scoring, unit tests |
| Charanpal Kaur | `charanpal-maintenance-analytics` | Sensor diagnostics, technician tickets, waste composition charts |

## Checks that run on GitHub

GitHub Actions workflow [Quality Controls](../.github/workflows/ci.yml) runs on every push and pull request:

1. `npm ci`
2. `npm run lint` (ESLint)
3. `npm test` (Vitest)
4. `npm run build` (TypeScript + Vite production bundle)

There is also a Pages workflow that publishes the Vite build. The live demo still needs Pages switched on once: Settings → Pages → deploy from branch `gh-pages`, folder `/ (root)`.

## Other repo files for marking

- Pull request template mapped to the five modules
- Issue templates for stories and bugs (with a Jira key field)
- `CONTRIBUTING.md` for the branch workflow
- Reset Demo Data so the classroom demo can be repeated
