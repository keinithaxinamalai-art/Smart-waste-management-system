# Individual Project Performance and Reflection

**Student:** Charanpal Kaur  
**Unit:** ICT308 – Project 2 (BIT) · Semester 2, 2026  
**Feature branch:** `charanpal-maintenance-analytics`  
**Module:** sensor diagnostics, technician tickets, composition charts

This is my Assessment 3 individual reflection. I worked on operations and maintenance for Canberra SmartWaste. The group reports cover the whole product. This document is about my module, my attendance, and what I learned from Iteration 1 through the Week 11 demonstration and the Week 12 poster.

---

## 1. My role in the group

I owned operations and maintenance: the diagnostics view, simulated sensor problems, and technician ticket acknowledgement. The fault types we show are sensor error, low battery, lid jam and offline. Charts that use live bin composition also sit with this work. My branch was `charanpal-maintenance-analytics`. Some of my early commits used a different GitHub login. We noted that in the README so the contribution graph is not confusing. I would rather say that here than hope a marker ignores it.

I did not want a hide button. I wanted a lifecycle: Open, In Progress after Acknowledge Ticket, then Resolved. It is still a prototype, not a real work-order system.

I also owned the last two minutes of the demo: show the other screens still match after collect, acknowledge a ticket, reset the seed, and say this is not live IoT. If I overrun we lose questions. If I undersell the warning, a visitor thinks we deployed sensors in Canberra.

---

## 2. Attendance, punctuality and professionalism

I attended the scheduled ICT308 sessions and the rehearsal where we reset data at the end so the next run is clean. I was on time for the Week 6 practice. When I joined a later document meeting from another machine I said so, because I could not click the same browser store as the demonstration laptop.

Professionalism for me is mostly about claims. I do not present maintenance as a real depot system. I do not say the charts prove a city-wide waste-composition study. They prove that the chart reads the current bins after collection, not a leftover mock pie. That sentence is less exciting and more true.

I also tried to keep wording aligned with the report. If the technical document says “acknowledgement”, the button should not say something that sounds like a different workflow. I changed labels when Samir or Bijay pointed out a mismatch. That is professionalism toward the marker, who will compare documents and screens.

Another professional issue was my Git identity. Using two logins makes it look like an outsider touched the repo. I accepted that we should write it down. Hiding it would have been worse.

---

## 3. Preparation and contribution to discussions

I prepared three tickets to point at on screen: GUN-015 sensor error, TUG-009 battery, WOD-007 lid jam. I practised the click path: open Maintenance, read the fault type, Acknowledge Ticket, show In Progress. I did not want to hunt around the table during the ten minutes.

I asked that Reset Demo Data also restore tickets. Otherwise the second marker, or our own second rehearsal, sees an empty list and thinks my module is broken. That is a small integration detail. It is also the kind of comment that helps the whole demonstration, not only my mark.

I contributed to the “what is not IoT” discussion. Literature such as Addas et al. (2024) is useful for future work. It is not a description of our tickets. I said the poster must keep simulated telemetry in the header. I did not want a QR code next to a sentence that implied live hardware.

I also asked that the composition chart take current bins from Context. A static pie would have been the same stale-data bug the map had. I prepared that request with a reason: “if Krishna’s collect resets fill to 5%, the chart should move.” That is preparation. It is not only decorating a screen.

For Assessment 2 I read the user-guide maintenance chapter and UAT-11 and UAT-12. I wanted my talking time to finish on Reset, because that returns the room to a known state for questions.

---

## 4. Progress against agreed tasks

The tasks I agreed to were:

- a maintenance view with persisted tickets
- four simulated fault types
- Acknowledge Ticket and Mark Resolved
- a waste-composition chart driven from current bins
- README lines when TypeScript version or report-id prefix drifted
- the closing minutes of the demonstration script

I delivered the first diagnostics screen for the Iteration 1 freeze. I tightened the ticket wording later so it matched the report. I also helped when tickets stored in sessionStorage disappeared after logout. We moved them into the same localStorage store as bins. Krishna changed the persistence. I changed the view to use it. That was later than I would have liked. The first version was too local to the session.

Progress on charts came after the dashboard existed, because I needed live bins. That dependency was real. I did not sit idle. I wrote the view shell and the ticket statuses first, then wired the chart.

I completed my Assessment 3 poster checks: future work lists live sensors as future, not as done. I wrote this reflection instead of a generic “I learned teamwork” paragraph.

I was inconsistent on Jira. Maintenance tickets on the board should have matched maintenance tickets in the app. Sometimes they did not. That is a process miss I share with the group.

---

## 5. Teamwork and communication

I depended on Krishna’s `sensorStatus` field and Bijay’s administrator shell. I could not ship a diagnostics page that sat outside the app. I said in chat when I was blocked, and I said when sessionStorage tickets vanished. That message led to a team fix, not a silent workaround in my branch.

I tried to receive review without getting defensive. If someone said the chart looked like a mock, they were usually right. I asked for the exact prop they wanted, then I changed it.

I supported other people in rehearsals by not starting my speech early. The collect action has to finish before I can show 5% on the chart. If I talk over Krishna, the story breaks.

There was a discussion about how technical the maintenance screen should look. I wanted enough detail to be believable (fault type, bin id, status). I did not want a fake technician roster and SLAs. We kept the smaller design. I think that was the right team call.

Communication toward visitors will be short. My showcase sentence is already written in my head: “This screen is simulated faults and a ticket you can acknowledge. It is not a live sensor network.” Then I reset the demo. I will not add a long speech about IoT platforms I have only read about.

I also helped with README accuracy when versions drifted. That is unglamorous teamwork. It stops the teaching team following a command that does not exist.

---

## 6. What I learned

I learned that a module is more believable if it has a lifecycle, not only a hide button. Open → In Progress → Resolved is enough to teach the idea of operational work. Adding fake fields would not have taught more.

I learned to keep future-work slides separate from what I click in the demonstration. Visitors like sensors. Markers like honesty. I can mention future sensors after I have shown the simulated ticket.

I learned that evidence means commits plus a two-minute talk, not a long essay on hardware we do not own. My old second Git login taught me that evidence can also get confused. I will set Git user.name correctly on day one of the next project.

I learned about shared state the hard way. Tickets in sessionStorage felt private and tidy. They were wrong for a demo that logs out. Putting tickets next to bins in `dataStore.ts` made Reset possible. That is the same lesson Ayush and Bijay learned with mock arrays.

On professional communication I learned to warn people about scope without sounding like I am putting the project down. “Simulated” is a precise word. “Not finished” is a sloppy word. We did finish the prototype. We did not finish a city deployment.

On process I learned that my epic in Jira should have listed the four fault types as acceptance criteria. I had them in the UI. I did not always have them on the board.

---

## 7. Evidence of contribution

- branch `charanpal-maintenance-analytics` and the maintenance view
- ticket helpers in `dataStore.ts` (with Krishna) and the Open / In Progress / Resolved path
- composition chart props fed from live bins
- README notes on identity and small version drift
- Week 11 last two minutes: after-collect sync, acknowledge, reset, not-IoT warning
- UAT-11 and UAT-12

A supervisor can ask me to acknowledge a ticket and then reset. If the ticket comes back as Open and the bins come back as the seed, my integration point worked.

---

## 8. Closing

My showcase sentence stays short. I will not use the poster to invent a sensor network. I will use it to invite a question I can answer.

I attended the classes and rehearsals, I prepared specific ticket IDs, I finished a maintenance lifecycle for Iteration 1, and I came back to persist tickets properly and to keep the chart honest. I need to be more careful with Git identity and with Jira. I was careful with claims, and that is the professional standard I want marked.

Assessment 1, 2 and 3 are one assignment for this group. My piece is the operational after-story: after the truck, the other screens still agree, a fault can be acknowledged, and the room can be reset.

---

*Word count is intended to sit near the 1500-word limit. Attach the CIHE cover sheet. Add one real example of helping another member if you remember a date.*
