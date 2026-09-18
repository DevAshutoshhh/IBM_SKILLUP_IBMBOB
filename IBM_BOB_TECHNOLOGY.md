# Technology Used – IBM Bob

SaathiSetu is a privacy-first scholarship readiness navigator built for Indian students. The
application — its problem framing, privacy principles, React and TypeScript architecture, matching
engine, document checklist, and demonstration dataset — was created before IBM Bob was introduced to
the project. IBM Bob was used during a structured improvement session to understand the codebase,
audit it, fix real bugs, implement a meaningful new feature, and verify the result. This document
records only that work.

---

## Understanding the imported codebase

The session began with a thorough read of every file that would be affected before writing a single
line. Bob read the domain types in `src/types/index.ts`, the six-factor scoring engine in
`src/utils/matching.ts`, the document readiness logic in `src/utils/readiness.ts`, the localStorage
persistence layer in `src/utils/storage.ts`, the React context in `src/hooks/useAppState.tsx`, the
full English and Hindi string dictionaries, and all five existing test files. This was not
exploratory browsing — each file was read to answer a specific question: how does data flow from a
student's profile answer to a displayed match score, and where would a new feature need to hook in?

Understanding that `CoachProgress` needed to sit alongside `checklists` in `AppState`, and that
`reconcile()` in storage would need a new sanitisation function for the coach store, came directly
from reading those files before touching them.

---

## Auditing the architecture

Bob performed a strict hackathon-judge audit covering functionality, mobile responsiveness,
accessibility, privacy, English/Hindi translation completeness, demonstration-data disclaimers,
tests, build configuration, and documentation.

Three reproducible problems were found and fixed:

**Bug 1 — Missing why-text for document actions.** The coach utility was emitting
`whyKey: 'document.why.income_certificate'` style keys, but no such keys exist in the i18n files.
The `translate()` function would return the raw key string to the user. The fix was a
`DOCUMENT_WHY_PREFIX = 'doc:'` sentinel: when `resolveWhy()` in `CoachPage` sees this prefix, it
calls `getDocument(id).why` from the existing bilingual document catalogue instead of looking up a
flat key — the right data was always there, it just needed the correct resolution path.

**Bug 2 — Incorrect `aria-hidden` value.** The action label span had `aria-hidden={done}` where
`done` is a React boolean. When `done` was `false`, this serialised to `aria-hidden="false"` in the
DOM, which is redundant and handled inconsistently by assistive technology. Since the checkbox
already carries a full `aria-label` (the complete action text), the visible span was changed to a
static `aria-hidden="true"` so screen readers read only from the semantic input, not both.

**Bug 3 — Why-toggle button had no accessible name.** The disclosure button contained only "Why",
decorative chevron icons, and an `HelpCircle` icon — all aria-hidden. Screen readers announced it
as an unlabelled button. A `coach.why.toggleLabel` key ("Why is this action needed?") was added to
both English and Hindi, and the button receives this as its `aria-label`.

---

## Implementing the Guided Application Coach

The Guided Application Coach converts a student's live match result and document checklist into an
ordered, interactive action plan with three sections.

**Logic layer (`src/utils/coach.ts`)** is purely functional with no React or i18n dependencies.
`buildVerifyActions` converts the matching engine's `needsVerification` factors directly into
actions — one per unresolved eligibility condition. `buildDocumentActions` iterates the
opportunity's document list, skips `ready` and `not_applicable` items, and emits `collect_document`
or `renew_document` actions with deterministic priority encoding: required documents before optional,
missing before expiring. `buildApplyActions` always emits two fixed actions — open the official page,
then apply. All action IDs are stable strings (e.g. `collect_document:income_certificate`) so
completion state survives re-renders and page reloads.

**State layer** extended `AppState` with `coachProgress: CoachStore` (a map of opportunityId →
action ID → boolean), added a `reconcileCoachStore` sanitiser to storage, and exposed
`setCoachActionDone` and `resetCoachProgress` callbacks in the context.

**Rendering layer (`src/pages/CoachPage.tsx`)** uses native `<input type="checkbox">` elements
styled with `accent-color` and carrying full `aria-label` text. An `aria-live="polite"` region
announces the updated completion percentage to screen readers on every toggle without interrupting
reading flow. The "Why?" disclosure uses `aria-expanded` and the new accessible label. The page
handles its own empty state, shows a conflict warning when the matching engine finds a hard conflict,
and displays a completion banner with a direct link to the official portal when all actions are done.

**Styles (`src/styles/pages.css`)** follow the existing design-token system. All touch targets
are at minimum 44 px. A responsive breakpoint at 480 px stacks the meta row, all-done banner, and
page actions vertically for small screens.

---

## Improving accessibility and localisation

Beyond the three bug fixes, the "Why?" button pattern was redesigned so the visible text ("Why"),
the `aria-label`, and the `aria-expanded` state are all independently correct. The live region
updates are `aria-atomic="true"` so screen readers read the full progress sentence rather than a
partial change. Thirty-one new keys were added to both the English and Hindi dictionaries, covering
every surface the feature exposes.

---

## Creating and updating tests

A new test file, `src/tests/coach.test.ts`, contains 24 tests across six suites covering every
exported function: document action generation (8 cases including the ordering rules, sentinel IDs,
and the not_applicable skip), verify action generation (4 cases), apply action generation (2 cases),
plan assembly (3 cases), completion counting (2 cases), and percentage calculation (5 cases including
a loop over all 14 dataset opportunities). One existing test in `src/tests/storage.test.ts` was
updated to include the new `privacy.item.coach` inventory entry.

---

## Running commands and verifying the production build

All commands were executed inside the project directory:

```
npm ci                 180 packages installed
npm run test           First run: 1 failure (storage assertion after adding coach item)
                       After fix: 101/101 tests passed across 6 files
npm run typecheck      First run: 3 TS2322 errors (Partial<Record> width mismatch)
                       After fix: zero errors
npm run build          Clean — TypeScript, Vite, 326 kB JS / 43 kB CSS
```

---

## Updating documentation

`README.md` was updated to add the Guided Application Coach to the main features list, a new step 6
in the "How it works" section describing `src/utils/coach.ts` and `src/pages/CoachPage.tsx`, and an
expanded testing-coverage paragraph. `BOB_USAGE.md` was rewritten with a complete record of every
file read, both bugs fixed, the feature implemented, and the commands executed. This file,
`IBM_BOB_TECHNOLOGY.md`, replaces the previous version with a truthful account of the session.
