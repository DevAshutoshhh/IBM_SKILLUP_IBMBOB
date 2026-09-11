# IBM Bob Technology Usage — Submission Template

**Project:** SaathiSetu — Scholarship & Education Scheme Readiness Navigator

---

## ⚠️ Read before you fill this in

**This template is blank on purpose.**

The SaathiSetu codebase was written **before** any IBM Bob session. No part of this document
claims that Bob built it, and you must not add such a claim.

**Only fill in the blanks after you have actually imported the project into IBM Bob and used it
to make changes.** Every `______` below should be replaced with something you genuinely did, and
every unused row should be deleted rather than invented.

If a judge asks you to demonstrate a change listed here, you should be able to show the Bob
session and the resulting diff. Write nothing you cannot show.

**Your workflow:**

1. Import this repository into IBM Bob.
2. Use Bob to make real improvements — see the suggested prompts in
   [`BOB_HANDOFF.md`](BOB_HANDOFF.md) §8.
3. After each session, log it in the activity table in `BOB_HANDOFF.md` §9.
4. **Then** come back and complete this template from that log.

---

## 1. Project baseline (state of the project before Bob)

These figures describe the codebase as handed over, and are accurate as written.

| Measure | Value at handoff |
| --- | --- |
| Application | React 18 + TypeScript + Vite, no backend |
| Screens | 7 (landing, profile wizard, matches, compare, documents, action plan, dashboard) |
| Demonstration opportunities | 14 |
| Document types | 15 |
| Languages | English, Hindi |
| Runtime dependencies | 3 (`react`, `react-dom`, `lucide-react`) |
| Automated tests | 77 passing across 5 files |
| Production build | Passing |
| Built by IBM Bob | **No** — Bob was not used to create the original codebase |

---

## 2. How IBM Bob was used

**Date the project was imported into Bob:** ______________________

**Number of Bob sessions:** ______________________

**Approximate total time spent working in Bob:** ______________________

### What you asked Bob to do

*(List only real requests. Delete unused rows.)*

1. ______________________________________________________________________
2. ______________________________________________________________________
3. ______________________________________________________________________
4. ______________________________________________________________________
5. ______________________________________________________________________

---

## 3. Changes made with IBM Bob

*(One row per change you actually accepted. Delete unused rows.)*

| # | Change | Files affected | Accepted as-is, or edited? | Tests still passing? |
| --- | --- | --- | --- | --- |
| 1 | ______________________ | ______________________ | ______________________ | ______ |
| 2 | ______________________ | ______________________ | ______________________ | ______ |
| 3 | ______________________ | ______________________ | ______________________ | ______ |
| 4 | ______________________ | ______________________ | ______________________ | ______ |
| 5 | ______________________ | ______________________ | ______________________ | ______ |

---

## 4. Results after using Bob

| Measure | Before Bob | After Bob |
| --- | --- | --- |
| Automated tests passing | 77 | ______ |
| Demonstration opportunities | 14 | ______ |
| Languages supported | 2 | ______ |
| Features added | — | ______ |
| Bugs found or fixed | — | ______ |
| Production build passing | Yes | ______ |

**Commands run to verify the work after each Bob change:**

```bash
npm run test
npm run build
```

**Both passing after your final Bob change?** ______________________

---

## 5. Where Bob helped most

*(Two or three sentences, specific. Name the file or feature.)*

______________________________________________________________________________
______________________________________________________________________________
______________________________________________________________________________

---

## 6. Where Bob helped least

*(Be honest. A submission that names a limitation is more credible than one that does not.)*

______________________________________________________________________________
______________________________________________________________________________

---

## 7. Anything Bob suggested that you rejected

*(What did it propose, and why did you decide against it?)*

______________________________________________________________________________
______________________________________________________________________________

---

## 8. What you learned

*(Two or three sentences on working with an AI development assistant on a real codebase — what
you would do differently next time.)*

______________________________________________________________________________
______________________________________________________________________________
______________________________________________________________________________

---

## 9. Declaration

- [ ] Every statement in this document describes work I actually carried out in IBM Bob.
- [ ] I have **not** claimed that IBM Bob created the original SaathiSetu codebase.
- [ ] Each change listed above corresponds to a real Bob session I can demonstrate.
- [ ] `npm run test` and `npm run build` both pass on the submitted code.
- [ ] The activity log in `BOB_HANDOFF.md` §9 matches this document.

**Name:** ______________________  **Date:** ______________________

**Repository URL:** ______________________

**Live demo URL:** ______________________

---

*Word count of this template (excluding your answers): approximately 640 words.*
