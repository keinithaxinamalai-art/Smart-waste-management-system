# Individual Project Performance and Reflection

**Student:** Krishna Trivedi  
**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**Feature branch:** `krishna-database-collection`  
**Pull request:** #4 (types, data store, algorithms and first tests)

This is my Assessment 3 reflection. The group reports already explain Canberra SmartWaste. I am writing about the data layer, the collection rules, and how I worked with the other four people from Iteration 1 through the final demonstration and the poster.

---

## 1. My role in the group

I owned the data layer and the algorithms. In file names that is `src/types`, `src/services/dataStore.ts`, `getBinStatus()`, `calculateCollectionPriority()`, report-id generation, `executeBinCollection()`, and the first Vitest file. People always ask “where is the database?” My answer is the same in Week 6, Week 11 and Week 12: there is no PostgreSQL. The store is browser `localStorage`, on purpose, for a classroom prototype. My branch was `krishna-database-collection`. Pull request #4 is the merge.

There is no big colourful screen with my name on it, but the dashboard, map, driver queue and citizen history all call my functions. If I change a threshold, every screen changes.

After login the assessor usually asks why a 42% bin is not on Route ACT-R104, and what Mark Collected does. Fill goes to 5%. Priority is recalculated. Only reports whose `binId` matches are resolved. The first idea — close everything in the suburb — was wrong.

---

## 2. Attendance, punctuality and professionalism

I attended the project classes and the test walkthroughs. I brought a laptop that could run `npm test`, not only the browser. If I was going to be late I said so in chat. I do not have a perfect attendance speech. I have a habit of showing up with the one thing I was asked to show: the score formula, a failing test, or a seed-data change.

Professionalism for me was writing tests that fail if someone “helps” by resolving every report in a suburb. That is the kind of defect a demonstration audience will not notice and a marker who reads the brief will. It was also professionalism to refuse to call the score “AI”. Fill times 0.5 plus urgency plus overdue time is a rule. Calling it machine learning would have been a lie on the poster.

Another professional choice was to keep saying no to a last-week Express server. Assessment 2 asks us to compare the ICT307 design with what we built. Adding a fake API in week 10 would have looked like we were chasing the old diagram instead of finishing a demo we could run. I said we should write the design-revision section and keep localStorage.

I tried to answer other people’s questions without making them feel stupid. “Why is 79% Moderate?” is a fair question. The answer is “because we said 80% is the truck cut-off.” That one percent is the whole skip-empty-bin story. Getting impatient about it would have been unprofessional.

---

## 3. Preparation and contribution to discussions

I prepared a short whiteboard of the score before we locked it: fill contribution up to 50, urgency up to 30, overdue cap 20. I also prepared the four fill bands so Bijay and the driver screen would not invent a fifth colour. I wrote the bands down in chat as well as on paper: 0–49 Normal, 50–79 Moderate, 80–89 Collection Required, 90–100 Critical.

When ICT307 still said “Postgres”, I said we should write the Assessment 2 design-revision section instead of secretly adding Express in the last week. I had read the brief. It asks for reasons and impact, not for a hidden rewrite.

I contributed the collection-resolution example with Samir. He said London Circuit should not close when Woden is emptied. I turned that into `report.binId === collectedBinId` and a unit test with two reports. That is the kind of discussion I want the supervisor to count: I did not only code what I felt like. I coded an agreed rule.

I also prepared the Week 11 minutes that belong to me (about minutes 6 to 8): point at a moderate bin, say it will not be on the sequence, assign the ≥80% run, mark `WDN-104` collected, show 5%. I practised the order so I would not click Reset in the middle of the story.

For Assessment 3 I prepared the same answers the poster already prints. If a visitor asks “is this GPS?” I will say no. If they ask “where does the data live?” I will say four keys in localStorage and I can name them. Preparation is being able to name `swm_bins_v2` without looking at the file.

---

## 4. Progress against agreed tasks

The tasks I agreed to were:

- domain types for bins, reports, collections and tickets
- seed data for ACT suburbs
- `getBinStatus()` and `calculateCollectionPriority()`
- unique report IDs
- `executeBinCollection()` with a 5% reset and a strict bin-id resolve
- the first Vitest suite
- help on assign-route persistence

Week 6 had the core store. Later I only touched it when report IDs, collection filters or ticket persistence needed a fix. One later change was moving maintenance tickets into the same localStorage world as bins, because sessionStorage tickets vanished on logout. That was a team defect. I changed the store. Charanpal changed the view.

Progress was consistent on the algorithms and bumpier on documentation. I can write a function faster than I can write a paragraph. Assessment 2 forced me to explain the ICT307 change in English. That was good for me. I also had to list testing evidence, not only say “we have tests.” Twenty-two passing tests and a command (`npm test`) is evidence. A screenshot of a green terminal should go in the Moodle ZIP.

I did not build the driver user interface. I built the list the interface sorts. Samir and Bijay consume it. If the list is wrong, that is my bug even if the button is on their screen.

I was late putting algorithm tasks into Jira with acceptance criteria. The code had the criteria. The board did not always. That is a real gap against the project-management rubric.

---

## 5. Teamwork and communication

Everyone imported my types, so a breaking change hurt four other people. I learned to add a field as optional first, then make it required after the others pulled. I announced type changes in Google Chat with the file name, not only “I pushed.”

I answered questions about the 79% / 80% line more than once. I would rather repeat myself than have Bijay hard-code a different cut-off on the dashboard.

I worked with Ayush on Context. I owned save and load. He owned the live copy in React. We had a bug when views still imported mock arrays. The fix needed both of us. I did not treat that as “front-end people being careless.” The first seed files invited the mistake.

I worked with Samir on validation versus store rules. His function stops a bad form. My function stops a bad resolve. Those are different layers and we said that out loud so we did not duplicate checks in a messy way.

I tried not to talk over people in rehearsals. My minutes are the rules. If I start explaining React routing I steal Ayush’s part. If I start explaining charts I steal Charanpal’s part.

Communication with the supervisor was factual. I would rather say “we do not have a hosted database” in the first sentence than spend five minutes describing a future AWS design we will never mark.

---

## 6. What I learned

I learned that a “database” in a prototype can be a well-named module. `dataStore.ts` is not PostgreSQL, but it is still a persistence design: versioned keys, a seed, a reset, and functions that do not belong in a React component. I will take that idea into later projects. The first version does not need a cloud invoice.

I learned that unit tests are the only way I can prove relational integrity in a 15-minute demonstration. I cannot show two reports and a suburb-close bug unless I already wrote the case. Twenty-two tests is a small suite. It is enough for the rules we claim.

I learned not to call a weighted sum “AI”. I also learned not to promise shortest-path routing because Hess et al. (2024) wrote a survey. Future work is allowed. Fake present work is not.

I learned to like boring constants. The 80% line, the 5% empty fill, the 50 / 30 / 20 score split — those numbers are the product. If they live in one file, the poster, the report and the user guide can quote them. If they are copied into four components, they will drift.

On teamwork I learned that invisible modules still need a speaking slot. If I stay quiet, the group looks like four screens and no brain. Assessment 3 is partly me talking.

On process I learned Jira should have held the acceptance tests I already wrote in Vitest. I reversed the order: code first, ticket later. Next project I will flip that.

---

## 7. Evidence of contribution

- pull request #4 and branch `krishna-database-collection`
- `binUtils.ts` and `binUtils.test.ts` (22 tests in the final pack)
- `dataStore.ts` and the domain types
- collection execution and the strict report-resolve rule
- Week 11 demonstration minutes on priority, skipped empty bins, and Mark Collected
- the Assessment 2 sections on architecture, testing and the “where is the database?” answer

A supervisor can ask me to run `npm test` and then explain one failing case I would expect if someone closed reports by suburb. That is my individual evidence.

---

## 8. Closing

If the supervisor looks at one folder for my contribution, it should be `src/utils` and `src/services`. That is what I want the reflection mark to rest on, together with the honest database sentence.

I attended, I prepared the score and the four bands, I finished the store for Iteration 1, and I kept the tests green when the other modules grew. I was weaker on Jira than on Vitest. I will export the backlog items that match my epic before we upload.

Assessment 1, 2 and 3 all depend on the same rules. I will not change those rules on the poster. I will explain them.

---

*Word count is intended to sit near the 1500-word limit. Attach the CIHE cover sheet. Add the date you last ran `npm test` in front of the group if you remember it.*
