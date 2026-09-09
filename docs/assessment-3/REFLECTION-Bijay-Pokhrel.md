# Individual Project Performance and Reflection

**Student:** Bijay Pokhrel  
**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**GitHub:** bijay123pokhrel  
**Feature branch:** `bijay-admin-dashboard`  
**Pull request:** #2 (administrator dashboard and shell)

This is my individual reflection for Assessment 3. It covers the same project as the group Assessment 1 and Assessment 2 reports, but it is about my behaviour and my module, not a second copy of the technical document.

---

## 1. My role in the group

I owned admin management: the operations dashboard, the critical-bin list, role labels, and the idea that collection staff should not wander into manager screens. My branch was `bijay-admin-dashboard`. Pull request #2 is the main feature merge for that work.

In a small group the dashboard person also becomes the glue person. I did a lot of the releases on `main` when we froze Iteration 1, so my name has more commits. Some of those are my cards and filters. Some are merges. Merging is coordination. It is not Samir’s form or Krishna’s score, and I will say that if a staff member only looks at commit count.

The dashboard is useless if the numbers are fake. The six statistics, critical-bin cards, map panel and header search all read `useApp()`. Reset Demo Data sits with this work so a marker does not see yesterday’s leftover tickets.

---

## 2. Attendance, punctuality and professionalism

I attended the ICT308 classes and the Week 6 and Week 11 calls, and I will be at the Week 12 showcase. If I was going to join late I wrote it in chat.

Professionalism meant one product story — login, citizen, admin, driver, maintenance, reset — not five websites. Merges happened on GitHub so the teaching team can see the pull requests. Reset Demo Data restores bins, reports, collections and tickets together. If only bins came back, Charanpal’s list would look empty. In review I asked for changes when a screen still imported a mock array. I did not rewrite those files under my name.

---

## 3. Preparation and contribution to discussions

I prepared dashboard talking points before the Iteration 1 rehearsal: six stats, the red critical-bin cards, dispatch collection, and one sentence — “look at WDN-104 on the map and on the card, same 92%.” I practised saying the bin ID out loud because “that red one” is a weak demonstration.

I asked Krishna to keep `getBinStatus()` as the only classifier so I would not hard-code a second set of colours. That was a meeting contribution, not a coding hero moment. If I had painted 80% as Critical on the card and Collection Required on the map, the assessor would have caught it in one question.

In planning I agreed we should not build Leaflet routing just to match a diagram from ICT307. A schematic map that uses live fill is better than a pretty map with dead numbers. I said that when someone still wanted “real GPS” for the poster. Assessment 2 has a design-revision chapter for exactly this. I would rather defend a simpler map than fail a question about a library we never installed.

For Week 11 I prepared minutes 4 to 6: move Samir’s ticket to Scheduled, show the dashboard and map, then hand to Krishna. For Assessment 3 the poster says three roles and localStorage, not “48 live bins in the ACT cloud.”

---

## 4. Progress against agreed tasks

The tasks I agreed to were:

- a reactive administrator dashboard and a critical-bin spotlight
- collection-staff “mark collected” entry points from the admin side where they made sense
- role labels (`ROLE_LABELS`) and route protection in `App.tsx`
- header search and notification work on the later freeze
- help integrating Charanpal’s maintenance module so it sits in the same shell

I completed the first dashboard before Week 6. Later fixes existed because the first version still had a couple of static bits. CSV export and the live map panel were the obvious ones. I would have preferred to get that right the first time. Assessment 2 is partly about being able to say what we changed after Iteration 1, so I can own that the first dashboard was not fully live.

Progress was not perfectly even. In the middle weeks I spent more time merging and chasing “why is develop red?” than drawing new cards. That still moved the project. A group cannot demo five branches. Someone has to land them. I do not want that work to hide other people’s authorship, so I kept their commit names and I will tell the supervisor to look at authors on the files, not only at who clicked Merge.

I completed my Assessment 2 writing jobs on time once we agreed the report had to match GitHub. I read the design-revision table and checked that every dashboard sentence used the four status names, not the old three-colour story.

I did not finish Jira exports until late. That is a miss. The board should have had a screenshot in the Moodle ZIP earlier. I will export To Do / In Progress / Done myself rather than leaving it to the night before upload.

---

## 5. Teamwork and communication

I reviewed other pull requests when I was the one opening the merge-to-develop path. That created a risk that it looks like I did everyone’s work. The commit messages still show Samir, Krishna, Ayush and Charanpal as authors on their files. I should say that in the showcase so the marker looks at authors, not just who clicked Merge.

Day to day I used Google Chat for “can you pull develop” type messages. Jira was for the Admin Management epic. I was better at chat than at tickets. That is the same weakness Ayush wrote about, and I agree. A professional team would have linked every pull request to a key.

I tried to communicate status without drama. If the dashboard and the map disagreed, I said “we have a stale-state bug” instead of “your part is broken.” That kept Krishna and Ayush in the same conversation: store plus context, not blame.

There was friction once about how many statistics to show. I wanted six live numbers. Someone wanted a busier screen with charts on the first page. We kept the six numbers on the dashboard and put composition charts with Charanpal. That split was a team decision and it made the demonstration easier to follow.

I also coordinated the demonstration order. Five people talking over one laptop needs a queue. I wrote the minute split with the others so Ayush starts, Samir does the form, I do the admin proof, Krishna does the rule, Charanpal closes. If I talk for five minutes I steal their marks. Teamwork here means stopping.

---

## 6. What I learned

I learned that an administrator dashboard is only as good as the data feed. Fancy cards with fake “48 bins” from an old mock file would have failed the demonstration. I learned to check the driver screen after I change a dashboard filter, because a filter that hides Critical bins also hides the story we promised the assessor.

I learned that more commits is not the same as more ownership. I have to explain Bijay’s module in two minutes and then let other people talk. That is harder than it sounds when you are used to driving the laptop.

I learned to treat design revision as a normal software-engineering outcome. ICT307 described Express, JWT, PostgreSQL and Leaflet. We delivered React, Context and localStorage. If I had been embarrassed about that I would have left the old Word draft in the repository and hoped nobody opened it. Assessment 2 rewards the explanation. I will take that lesson into the next workplace project: when the stack changes, write it down early.

I also learned something about group leadership that is not in the coding lectures. Being the person who merges can look like control. I had to ask “whose file is this?” before I touched it. Respect is part of the individual rubric, not only attendance.

On the technical side I am more comfortable with React state flowing into cards, tables and a schematic map. I am still not a routing-algorithm person and I should not pretend to be one in Week 12. If a visitor asks about shortest path I will say that is future work and point at Krishna’s score.

---

## 7. Evidence of contribution

- pull request #2 and branch `bijay-admin-dashboard`
- dashboard, header, role labels and route-protection files
- Reset Demo Data in the administrator shell
- Week 6 and Week 11 demonstration slot on critical bins and map consistency
- help landing other modules onto `develop` without rewriting their authors
- the Assessment 2 report sections that describe the dashboard and the design change away from Leaflet

A supervisor can open the app as administrator, look at `WDN-104` on the card and on the map, then ask me why those two numbers match. That answer is my module.

---

## 8. Closing

I started the semester as “the dashboard person” and ended as someone who also had to care about integration and honesty in the report. That is the professional bit I want the supervisor to see, not just the teal cards.

I attended, I prepared a short talking path, I finished the agreed admin screens, and I tried to merge without erasing other people. I was weaker on Jira screenshots than on GitHub. I will fix that before Moodle close.

Assessment 1, 2 and 3 are one product with three reporting moments. My part stays the same in all three: the administrator view has to tell the truth about the bins.

---

*Word count is intended to sit near the 1500-word limit. Attach the CIHE cover sheet. Add a real supervision meeting date if you have one in your notes.*
