# BOB_USAGE.md — How IBM Bob was used on SaathiSetu

**Project:** SaathiSetu — Scholarship & Education Scheme Readiness Navigator
**Repository:** https://github.com/DevAshutoshhh/IBM_SKILLUP_IBMBOB

---

## Honest statement of provenance

**The SaathiSetu codebase was written before any IBM Bob session.** IBM Bob did not generate the
initial application. This document records only what Bob was actually used for *after* the
project was imported into it.

Sections below that contain `______` are **deliberately blank**. Fill each one in from work you
genuinely carried out and can demonstrate — a judge may ask you to open the Bob session and show
the resulting diff. Delete any row you did not use rather than inventing an entry.

---

## Related documents

| Document | What it is for |
| --- | --- |
| [`BOB_HANDOFF.md`](BOB_HANDOFF.md) | Full architecture walkthrough + suggested Bob prompts (§8) and the master activity log (§9) |
| [`IBM_BOB_TECHNOLOGY_TEMPLATE.md`](IBM_BOB_TECHNOLOGY_TEMPLATE.md) | The official submission template to complete from your activity log |
| [`PROJECT_SUBMISSION.md`](PROJECT_SUBMISSION.md) | Overall hackathon submission write-up |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) | Walkthrough script for the live demo |
| [`PITCH_OUTLINE.md`](PITCH_OUTLINE.md) | Pitch structure |

---

## 1. Baseline before Bob (accurate as written)

| Measure | Value at handoff |
| --- | --- |
| Stack | React 18 + TypeScript + Vite, no backend |
| Screens | 7 |
| Demonstration opportunities | 14 |
| Document types | 15 |
| Tests | 77 passing across 5 files |
| Runtime dependencies | 3 (`react`, `react-dom`, `lucide-react`) |
| Backend / database / API keys | None — runs entirely in the browser |

Reproduce these with:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

---

## 2. How the project was imported into Bob

- **Date imported:** ______________________
- **Import method:** ______________________  *(e.g. cloned this GitHub repo into Bob / uploaded ZIP)*
- **Bob workspace or project name:** ______________________

---

## 3. Session log

Record one row per Bob session. Keep this in sync with `BOB_HANDOFF.md` §9.

| # | Date | What you asked Bob to do | What Bob produced | Files changed | Accepted? | `npm run test` | `npm run build` | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |

---

## 4. Summary of Bob's contribution

- **Number of Bob sessions:** ______________________
- **Features added or improved using Bob:** ______________________
- **Bugs Bob found or fixed:** ______________________
- **Tests before Bob:** 77 passing · **Tests after Bob:** ______________________
- **Suggestions from Bob that were rejected, and why:** ______________________
- **Where Bob was most useful:** ______________________
- **Where Bob was least useful:** ______________________

---

## 5. Verification

Anything claimed above should be demonstrable by:

1. Opening the corresponding IBM Bob session, and
2. Showing the resulting diff in this repository's commit history.

Write nothing here that you cannot show.
