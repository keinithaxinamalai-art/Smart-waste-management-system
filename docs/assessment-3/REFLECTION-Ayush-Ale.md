# Individual Project Performance and Reflection

**Student:** Ayush Ale  
**Student email:** ayushale029@gmail.com  
**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**GitHub:** keinithaxinamalai-art  
**Feature branch:** `ayush-auth-testing`  
**Pull request:** #1 (authentication, session and shared context)

This reflection is my own account of what I did on Canberra SmartWaste across Assessment 1 (Iteration 1), Assessment 2 (final report and Week 11 demo) and Assessment 3 (poster showcase). I have written it in the first person because the brief asks for individual performance, not another copy of the group report.

---

## 1. My role in the group

I was responsible for session and testing. The app had to start logged out. The three demo accounts had to work, and typed Sign in had to reject a wrong password. `AppContext` had to hold the role plus live bins, reports, collections and tickets. Unit tests around those shared rules had to stay green.

My branch was `ayush-auth-testing`. Pull request #1 brought that work onto the integration line. I also own the GitHub repository, so later I had to care about Pages, the README, and whether a classmate could clone the project without asking me for a zip.

The others owned the other modules: Bijay the dashboard, Samir the form, Krishna the store and maths, Charanpal maintenance. My demonstration slot is the first two minutes and questions about the password check or why there is no server database.

---

## 2. Attendance, punctuality and professionalism

I attended the weekly ICT308 classes and the group catch-ups around Assessment 1 (Week 6) and the Assessment 2 and 3 documents. If I was going to be late I messaged chat first. The night before a supervisor meeting I wrote a few bullets so I was not sitting there with nothing to say.

Professionalism for me was not overselling the product. We do not have IoT bins or a cloud database. I would rather say “the database is localStorage in dataStore.ts” and be correct. A 1-click role button is fine for class speed. The Sign in form still has to check the password, and that is written in the user guide.

When people said localhost was not working, they had usually opened it on a different computer from the one running Vite. I helped put that in the README. In reviews I commented on pull requests. I did not silently rewrite Bijay’s dashboard and then claim it.

---

## 3. Preparation and contribution to discussions

Before the Iteration 1 demonstration I prepared the first two minutes: no session, wrong password, then sign in as administrator. I rehearsed it in an incognito window so leftover sessionStorage did not skip login.

I argued we can keep the 1-click buttons for speed, but Sign in must still validate. I also pushed for one AppContext after a real bug: we emptied a bin on the driver view and the map still showed 92%. Krishna already had the store. My part was wiring views through `useApp()`. The note I brought was “if two files import a mock array, the demo will lie.”

For Assessment 2 I said the report has to describe the GitHub stack, not the old ICT307 Express and PostgreSQL picture. Pretending we shipped JWT would have been worse than saying we chose browser storage so class does not depend on a hosted API.

For Assessment 3 we agreed the same short answers: database is localStorage, empty bins are skipped, the QR is not a live city system.

---

## 4. Progress against agreed tasks

The tasks I agreed to, in order, were:

- unauthenticated start and session keys in `sessionStorage`
- demo accounts and the login layout
- isolate AppContext so Fast Refresh does not break the session
- help keep the Vitest suite honest around login-related state and shared rules
- the “start logged out” line in the README and section A of the demonstration script

I finished the core of that list before the Week 6 freeze. PR #1 is the evidence. Later I helped with demo hosting notes, the password error, and the Assessment 2 and 3 documents so the writing did not drift from the code. Before Week 11 I ran the first two minutes on the presentation laptop in incognito so we were not surprised by an old session.

I did not take other people’s files. If Samir had a TypeScript error I looked at `PublicReport` with him on chat. If a test failed after Krishna changed a helper, I sent the `npm test` output.

After login was done I spent time on integration: logout clearing the role, Reset Demo Data not leaving a stale session, and GitHub Actions still running lint, test and build. I did not write every unit test. Krishna wrote the first algorithm tests. I also used Jira late, which I talk about below.

---

## 5. Teamwork and communication

Five people on one React app is messy. We used feature branches and merged through `develop` so a login experiment did not wipe the citizen form. When two of us touched `App.tsx` we did not push straight to `main`. That was slower, but it stopped the demonstration build dying the night before class.

Google Chat is where we actually talked. It is not marking evidence. I started putting the Jira key in pull-request text when I remembered. If I started the semester again I would open the Jira ticket before the branch, every time.

I tried not to dominate meetings. Samir knows the form better than I do. Charanpal should talk about sensor tickets. Krishna should explain the 80% cut-off. My job in the showcase is login, session, and why we do not have a server database. When a visitor asks a data question I hand it to Krishna instead of guessing.

We disagreed about the 1-click buttons. I wanted them labelled as a class shortcut. Someone else thought they looked unprofessional. We kept them because a 15-minute demonstration cannot afford a typing mistake on a long password, and we documented that Sign in still validates.

As repository owner I tried to answer clone and Pages requests the same day, because a delay blocks the whole Moodle upload. I also had to remind people that GitHub is the evidence, not a zip on chat.

---

## 6. What I learned

I learned that a prototype still needs one source of truth. Two mock arrays and a live store will fail in front of an audience. Assessors will ask where the database is and how the driver skips empty bins, and I need a short answer, not a long speech. A report that describes Leaflet and JWT when the repo has neither is worse than a design-revision chapter.

I am more comfortable with React Context and a login path that fails closed (no role means the login screen). I now treat `sessionStorage` as the person and `localStorage` as the demo world. I also learned to read GitHub Actions logs when a pull request is red, instead of only running the app on my laptop and calling it done.

I am still weaker on Jira than on code. I am also still learning how to explain a technical limit without sounding like I am apologising for the whole project. “This is browser storage on purpose” is a better sentence than “we did not have time for Postgres.”

Assessment 2 taught me that the user guide, the UAT list and a README that actually installs are part of the product. Assessment 3 is standing next to the poster and not pretending we built IoT. Those are skills I will need after this unit, not only marks.

---

## 7. Evidence of contribution

If a supervisor wants proof, I would point to:

- Git author Ayush Ale on `ayush-auth-testing` and later login-validation commits
- pull request #1 merged into the integration line
- the login view, session keys and `AppContext` wiring
- README and DEMO notes on the unauthenticated start and the localhost warning
- the first two minutes of the Week 6 and Week 11 scripts (wrong password, then a real sign-in)
- this reflection, which I can talk through without reading it

I can demonstrate wrong-password, error, then correct administrator login in under two minutes. That is the contribution I want marked, together with the decision to keep the written architecture honest.

---

## 8. Closing

Assessment 1 showed a working prototype. Assessment 2 is the same system written up properly (tests, deployment, security limits). Assessment 3 is me standing next to the poster and not pretending we built Internet of Things hardware. Across all three I stayed with session, shared state and testing support.

I am proud that a marker can fail a password and see an error. I am not proud of how late I treated Jira as real evidence. If I did ICT308 again I would start the board in week 1 and keep the chat for decisions that already have a ticket number.

That is the individual performance I want the supervisor to assess: present, on time enough to be useful, prepared with a short demo, honest about the stack, and able to explain my own files.

---

*Word count is intended to sit near the 1500-word Assessment 3 limit. Attach the CIHE cover sheet on Moodle. Add any real supervision date you remember if this draft is missing one.*
