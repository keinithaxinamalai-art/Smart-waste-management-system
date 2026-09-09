# Contributing

ICT308 Project 2. We use feature branches so each person's module stays easy to find.

```text
main          # stable demo build
└── develop   # integration
    ├── bijay-admin-dashboard
    ├── ayush-auth-testing
    ├── samir-citizen-interface
    ├── krishna-database-collection
    └── charanpal-maintenance-analytics
```

| Area | Branch | Owner |
|---|---|---|
| Admin dashboard | `bijay-admin-dashboard` | Bijay Pokhrel |
| Login and tests | `ayush-auth-testing` | Ayush Ale |
| Citizen reporting | `samir-citizen-interface` | Samir Bhandari |
| Data / algorithms | `krishna-database-collection` | Krishna Trivedi |
| Maintenance | `charanpal-maintenance-analytics` | Charanpal Kaur |

## Workflow

1. Branch from `develop` (use the module name, or add a short suffix if needed).
2. Write a normal commit message that says what changed.
3. Open a pull request into `develop`. Put the Jira key in the PR if there is one.
4. Wait for GitHub Actions: `npm run lint`, `npm test`, `npm run build`.
5. Merge to `develop`, then `develop` → `main` when we freeze a demo build.

## Local checks

```bash
npm install
npm run lint
npm test
npm run build
npm run demo
```

Demo accounts are in the README. Don't commit passwords or secrets.

Administrator **Reset Demo Data** puts the bins, reports, collections and maintenance tickets back to the seed set so the class demo can be repeated.
