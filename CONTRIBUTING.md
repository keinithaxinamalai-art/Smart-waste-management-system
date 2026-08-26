# Contributing to Canberra SmartWaste

ICT308 – Project 2 (BIT Capstone). This repository uses a **feature-branch workflow** that maps one-to-one with the Iteration 1 modules in the progress presentation.

## Branch structure

```text
main          # stable Iteration 1 demonstration build (protected release line)
└── develop   # integration branch
    ├── bijay-admin-dashboard
    ├── ayush-auth-testing
    ├── samir-citizen-interface
    ├── krishna-database-collection
    └── charanpal-maintenance-analytics
```

| Module / domain | Feature branch | Owner |
|---|---|---|
| Admin Management | `bijay-admin-dashboard` | Bijay Pokhrel |
| Session & Testing | `ayush-auth-testing` | Ayush Ale |
| Citizen Reporting | `samir-citizen-interface` | Samir Bhandari |
| Data Persistence | `krishna-database-collection` | Krishna Trivedi |
| Operations & Maintenance | `charanpal-maintenance-analytics` | Charanpal Kaur |

## Workflow

1. Branch from `develop` using the module branch name above (or a short task suffix, e.g. `ayush-auth-testing-login-error`).
2. Commit with conventional messages (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).
3. Open a pull request into `develop` using the PR template. Link the Jira story.
4. CI must pass: `npm run lint`, `npm test`, `npm run build`.
5. After review, merge to `develop`. Release integrations are merged `develop` → `main`.

## Local checks

```bash
npm install
npm run lint
npm test
npm run build
npm run dev
```

Use the fictional prototype accounts in the README. Do not commit secrets.

## Demo data

Administrator **Reset Demo Data** restores seeded bins, reports, collections, and maintenance tickets so classroom demonstrations are repeatable.
