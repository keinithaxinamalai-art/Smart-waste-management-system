# Individual Project Performance and Reflection

**Student:** Samir Bhandari  
**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**Feature branch:** `samir-citizen-interface`  
**Pull request:** #3 (citizen reporting and validation)

This reflection is my Assessment 3 individual submission. The group already wrote the Iteration 1 report and the Assessment 2 technical report. Those documents describe the whole system. This one is about my work on the citizen path and how I behaved in the team.

---

## 1. My role in the group

I owned citizen reporting. That means the intake form, the ACT suburb list, validation, the `WST-2026-XXXX` reference, report history search, and the status list Submitted / Under Review / Scheduled / Resolved. My branch was `samir-citizen-interface`. Pull request #3 is the merge the teaching team can open if they want my files.

If the form accepts an empty street, or the success screen shows a fake `PR-1001`, the demonstration feels fake. I treated the reference number as part of the product.

I also argued against suburb-wide close. A citizen can report dumping on London Circuit while a Woden bin is emptied. Krishna put the strict `binId` rule in the store and in the tests. I check that rule in UAT-03 to UAT-06.

---

## 2. Attendance, punctuality and professionalism

I came to the ICT308 classes and the 15-minute rehearsals. If I missed a short chat I answered the same day. Attendance also means not making four people wait for a form I said was finished.

The form is a prototype, not a real TCCS channel. I asked the user guide to say “do not type real names or emails during marking.” I cleaned leftover status labels like “new” and “assigned”. When I was stuck on TypeScript I said so in chat instead of going quiet.

---

## 3. Preparation and contribution to discussions

I prepared a live test for every rehearsal: submit nothing, show the red errors, then submit a Canberra City overflow, read the reference out loud, then ask Bijay to change the status so I can log back in as citizen and show Scheduled. That is the public-participation loop we cited at a student level (Kuang & Lin, 2021). Preparation meant I already knew which suburb I would pick so I did not scroll around wasting minutes.

I argued against auto-closing every report in a suburb. I used a concrete example: if I report dumping on London Circuit, emptying a Woden bin should not mark me resolved. That example was more useful than a long talk about relational integrity. Krishna understood it immediately because he owns the store.

I also contributed when we discussed optional contact fields. I wanted name and email optional, not required, because forcing personal data in a classroom prototype is a privacy problem. Assessment 2 has a privacy section. My form is where that section becomes real. I prepared that point before the meeting so it did not sound like I was only trying to make the form shorter.

For Assessment 2 I read the user-guide citizen chapter and the UAT rows that carry my name. I wanted the written steps to match the buttons. If the guide said “Track My Reports” and the screen said something else, that is my defect as much as a code bug.

For Assessment 3 I prepared a 90-second poster speech: who uses the form, what the reference looks like, what the four statuses mean, and what the form is not. I do not need the whole technical report in my hand. I need those four sentences.

---

## 4. Progress against agreed tasks

The tasks I agreed to were:

- form fields for issue, location, suburb, urgency, waste type, optional bin ID, description and optional contact
- validation that blocks empty required fields and whitespace-only descriptions
- unique `WST-2026-XXXX` references
- report history search
- status model cleanup so the screen matches the report
- the citizen two minutes in the demonstration script

I finished the form for Week 6. Small later fixes included replacing an old `PR-1001` placeholder with `WST-2026-1001` so seed data and new tickets used the same family of IDs. That kind of fix is easy to forget and easy for a marker to notice.

Progress was mostly on time. The week I waited on Krishna’s types was slower. The form would not type-check until `PublicReport` existed. I learned to agree the interface first. After that, my pull request could move.

I did not build the administrator status dropdown. Bijay’s public-report admin screen changes Submitted to Under Review. My job was to make sure the citizen history showed the new value. We tested that together. That is progress against a shared milestone, not only against “my file”.

I completed the Assessment 2 user-guide citizen steps and I will attach screenshots from my own laptop before Moodle submit, because the brief asks for screenshots and a screenshot from someone else’s machine might show a different ticket number.

I was weaker on Jira. I created or updated citizen-reporting issues when I was reminded, not as a weekly habit. I can see now that the rubric for Assessment 2 includes Jira evidence. That is a team gap I share.

---

## 5. Teamwork and communication

I had to wait on Krishna’s types before the form would compile. That taught me to talk about the data shape in chat before I designed a pretty layout. I messaged when I was stuck instead of sitting silent.

I worked with Ayush on the idea that a citizen can enter without a long password when we use the public report entry, and with a password when we use the citizen demo account. I did not want two different validation stories. We kept one form schema.

I worked with Bijay on the status change. He needed my reference to find the ticket. I needed his dropdown. In rehearsal I literally read the number out loud. That is teamwork you can see in the demonstration, not only in Git.

There was a small conflict about how many issue types to list. I wanted a short list so the demonstration stays fast. Someone wanted many categories to look more like a real council form. We kept a short list and said in the report that it is a prototype taxonomy. I am fine with that. A long list would not have made the product more honest.

I tried to give feedback without taking files. If Charanpal’s ticket wording said “dispatch” and the report said “acknowledge”, I asked for the word to match. I did not open her view and rewrite it.

Communication with the supervisor was usually through the group, with Bijay or Ayush talking first. I still answered when I was asked about the form. In Week 12 I will not hide behind the group. Visitors will ask me about the reference number and I will answer.

---

## 6. What I learned

I learned that client-side validation is easy to get wrong. An empty string and a string of spaces look different in code and the same to a user. `validateWasteReport()` has to treat both as failure. I will remember that on any future form, not only this unit.

I learned that a tracking number is what makes the demonstration feel like a real ticket. Without `WST-2026-XXXX` the citizen story is just a thank-you alert. With it, the administrator and the citizen can meet on the same record.

I learned I must be able to explain my own code in the showcase without reading the poster. If I need to look at the A3 to remember the statuses, I do not know my module.

I also learned about scope honesty. Literature talks about public participation at city scale. Our form is five fields and a browser store. Citing Kuang and Lin is fine if we say the level we implemented. Citing them as if we evaluated Canberra residents would be dishonest.

On teamwork I learned to agree types early and to speak up when a collection rule would break my reports. Silence would have left a serious defect in the store.

On process I learned that Google Chat is not a project-management tool. Next time I will put the citizen stories in Jira first and paste the key in the pull request.

---

## 7. Evidence of contribution

- pull request #3 and branch `samir-citizen-interface`
- `PublicReportView.tsx` and the shared `validateWasteReport()` helper
- issue labels, suburb list and the `WST-2026-XXXX` format
- UAT rows UAT-03 to UAT-06 and the citizen chapter of the user guide
- the Week 6 and Week 11 demonstration minutes on submit, read-aloud reference, and history after status change

A supervisor can ask me to submit a bad form, then a good form, then find that reference after Bijay changes the status. If I can do that without help, my individual contribution is visible.

---

## 8. Closing

My individual mark should reflect the citizen path, not the whole repository. I will stand at the poster and walk a visitor through one report ID. I will also say the form is not a government service.

I attended the classes and rehearsals, I prepared a repeatable live test, I finished the agreed form for Iteration 1, and I came back to fix IDs and validation when the rest of the system matured. I was late to treat Jira as evidence. I was on time with the code that the demonstration actually uses.

Assessment 1, 2 and 3 all need the same citizen sentence: a resident can submit a Canberra issue, get a reference, and see the status move. That sentence is mine to defend.

---

*Word count is intended to sit near the 1500-word limit. Attach the CIHE cover sheet. Add a merge-conflict or meeting example from your own notes if you have one.*
