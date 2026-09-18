# IBM Bob Usage Record — SaathiSetu

This file records work genuinely performed by IBM Bob during the current session.
Bob did not create the original SaathiSetu application.

---

## IBM Bob Modes Used

| Mode | Purpose |
|------|---------|
| **Agent** | All implementation, file editing, test writing, and verification |

---

## What Bob Analysed

Before writing any code, Bob read and understood the following existing files:

- `src/types/index.ts` — all domain types, `AppState`, `PageId`
- `src/utils/matching.ts` — six-factor scoring engine, `MatchResult` shape
- `src/utils/readiness.ts` — `checklistDocuments`, `buildInitialChecklist`, `summariseReadiness`
- `src/utils/storage.ts` — `INITIAL_STATE`, `EMPTY_PROFILE`, `reconcile`, `describeStoredData`
- `src/hooks/useAppState.tsx` — context shape, all existing action callbacks
- `src/data/documents.ts` — all 15 `DocumentDefinition` entries with bilingual labels and `why`
- `src/data/opportunities.ts` — dataset size (14 entries), `isDemoData` constraint
- `src/data/bands.ts` — income and marks band ranges
- `src/i18n/en.ts` — full English string dictionary (all existing keys)
- `src/i18n/hi.ts` — full Hindi translation dictionary
- `src/i18n/index.ts` — `translate`, `pick`, `explainFactor`, `createTranslator`
- `src/components/Header.tsx` — `NAV_ITEMS` pattern, navigation wiring
- `src/App.tsx` — page routing pattern
- `src/styles/base.css` — design tokens
- `src/styles/components.css` — button, notice, progress classes
- `src/styles/pages.css` — existing page layout patterns
- `src/tests/fixtures.ts` — `profile()` and `opportunity()` builders
- `src/tests/storage.test.ts` — existing exact-array assertion that required a fix
- All five existing test files to understand coverage scope

---

## Bugs Bob Fixed

### 1. `describeStoredData` inventory mismatch (storage.test.ts)

Adding the new `privacy.item.coach` entry to `describeStoredData` caused an existing test
(`counts only answers the student actually gave`) to fail because it used `toEqual` with a hardcoded
four-item array. Bob updated the assertion to include the new fifth item.

**File changed:** `src/tests/storage.test.ts` (line 95–101)

### 2. TypeScript `Partial<Record<…>>` assignment error (CoachPage.tsx)

The `CoachSection` component declared `progress: Record<string, boolean>`, but `CoachProgress` is
typed as `Partial<Record<string, boolean>>`. This produced three TS2322 errors. Bob widened the prop
type to `Partial<Record<string, boolean>>` to match the actual runtime type.

**File changed:** `src/pages/CoachPage.tsx` (SectionProps interface)

---

## Feature Bob Implemented: Guided Application Coach

### Overview

The Guided Application Coach converts a student's match result and document checklist into an
ordered, interactive action plan with three sections:

1. **Confirm eligibility conditions** — one action per `needs_verification` factor from the matching
   engine (e.g. "Confirm social category condition on the official portal").
2. **Collect and renew documents** — one action per missing or expiring document from the
   opportunity's document list. Missing documents appear before expiring ones; required documents
   appear before optional ones.
3. **Apply** — two fixed actions always present: open the official page to verify rules and dates,
   then submit the application.

Each action has:
- A native `<input type="checkbox">` (keyboard-focusable, `accent-color` styled, screen-reader
  labelled with both the "mark done" and "mark not done" text depending on state).
- A collapsible "Why?" button that reveals the reason behind the action without cluttering the view.
- A visual "Done" badge when checked, plus a strikethrough label.
- An `aria-live="polite"` region that announces the new completion percentage to screen readers
  whenever a checkbox is toggled.

Progress is stored per opportunity in `coachProgress: CoachStore` in `localStorage` — the same key
as the rest of app state.

### Privacy

The coach feature collects no documents and requests no uploads. It only stores boolean flags
(action ID → done) for each opportunity the student has worked on.

### Files Created

| File | Purpose |
|------|---------|
| `src/utils/coach.ts` | Pure logic: `buildDocumentActions`, `buildVerifyActions`, `buildApplyActions`, `buildCoachPlan`, `countCompleted`, `coachCompletionPct` |
| `src/pages/CoachPage.tsx` | React page: `ActionRow`, `CoachSection`, `CoachPage` components |
| `src/tests/coach.test.ts` | 24 automated tests for coach logic |

### Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `'coach'` to `PageId`; added `CoachActionKind`, `CoachAction`, `CoachProgress`, `CoachStore` types; added `coachProgress: CoachStore` to `AppState` |
| `src/utils/storage.ts` | Added `reconcileCoachStore`; added `coachProgress: {}` to `INITIAL_STATE`; updated `reconcile`; updated `describeStoredData` with `privacy.item.coach` |
| `src/hooks/useAppState.tsx` | Added `setCoachActionDone` and `resetCoachProgress` action callbacks; exposed them in context value and dependency array |
| `src/components/Header.tsx` | Added `GraduationCap` icon import; added `coach` nav item |
| `src/App.tsx` | Imported `CoachPage`; added `{page === 'coach' ? <CoachPage … /> : null}` |
| `src/i18n/en.ts` | Added `nav.coach` key; added 29 `coach.*` keys; added `privacy.item.coach` key |
| `src/i18n/hi.ts` | Added `nav.coach` key; added 29 `coach.*` keys; added `privacy.item.coach` key |
| `src/styles/pages.css` | Appended ~225 lines of coach-specific CSS (`.coach-progress`, `.coach-section`, `.coach-action`, `.coach-action__why`, responsive breakpoints) |
| `src/tests/storage.test.ts` | Updated one assertion to include the new `privacy.item.coach` inventory entry |
| `README.md` | Added feature to main features list; added step 6 to "How it works"; updated testing coverage paragraph |
| `BOB_USAGE.md` | Created this file |

---

## Tests Bob Created or Updated

### Created: `src/tests/coach.test.ts` — 24 tests

| Suite | Tests |
|-------|-------|
| `buildDocumentActions` | collects missing docs; renames to renew for expiring docs; omits ready docs; omits not_applicable docs; orders missing before renewal; puts optional after required; defaults missing checklist entry to not_available; uses stable IDs |
| `buildVerifyActions` | one action per needs_verification factor; stable IDs with `verify_condition:` prefix; no actions when all confirmed; conflict factors excluded |
| `buildApplyActions` | always returns exactly two actions; stable IDs |
| `buildCoachPlan` | allActions equals sum of sections; always has two apply actions; non-empty for every opportunity in dataset |
| `countCompleted` | returns 0 with empty progress; counts only marked-done actions |
| `coachCompletionPct` | 100 on empty list; 0 when nothing done; 50 at half; 100 when all done; stays 0–100 for every opportunity in dataset |

### Updated: `src/tests/storage.test.ts`

- `counts only answers the student actually gave` — added `{ key: 'privacy.item.coach', count: 0 }` to the expected inventory array (line 100).

---

## Commands Bob Executed

```bash
# From SaathiSetu/
npm run test          # First run: 101 passed / 1 failed (storage assertion)
npm run typecheck     # First run: 3 TS2322 errors in CoachPage.tsx
npm run test          # After fixes: 101/101 passed
npm run typecheck     # After fixes: clean
npm run build         # Clean production build
```

---

## Final Test and Build Results

### Tests

```
✓ src/tests/storage.test.ts    (10 tests)
✓ src/tests/readiness.test.ts  (14 tests)
✓ src/tests/coach.test.ts      (24 tests)   ← new
✓ src/tests/matching.test.ts   (22 tests)
✓ src/tests/i18n.test.ts       (16 tests)
✓ src/tests/app.test.tsx       (15 tests)

Test Files  6 passed (6)
      Tests  101 passed (101)
```

### Production Build

```
dist/index.html               1.95 kB │ gzip:  0.86 kB
dist/assets/index-*.css      43.33 kB │ gzip:  8.14 kB
dist/assets/index-*.js      326.01 kB │ gzip: 97.18 kB
✓ built in 2.57s
```

TypeScript: zero errors. No new warnings.

---

## Where Screenshots Should Be Inserted

The following captures would demonstrate the feature and should be taken from a running instance
(`npm run dev` or the deployed GitHub Pages URL):

1. **Coach page — empty state** (`#/coach` with no opportunity selected)  
   Suggested filename: `docs/screenshots/coach-empty.png`

2. **Coach page — active plan with all three sections visible**  
   Select an opportunity (e.g. "Family Income Support Grant"), navigate to Application Coach.  
   Suggested filename: `docs/screenshots/coach-plan-full.png`

3. **Coach page — a "Why?" panel expanded** (click the help icon on any action)  
   Suggested filename: `docs/screenshots/coach-why-open.png`

4. **Coach page — partial progress** (some actions ticked, progress bar at ~40%)  
   Suggested filename: `docs/screenshots/coach-partial-progress.png`

5. **Coach page — all done banner** (all actions ticked, green completion notice visible)  
   Suggested filename: `docs/screenshots/coach-all-done.png`

6. **Coach page — Hindi interface** (toggle language to हिंदी before taking the screenshot)  
   Suggested filename: `docs/screenshots/coach-hindi.png`

7. **Coach page — mobile view** (DevTools → responsive, 390 px wide, showing stacked layout)  
   Suggested filename: `docs/screenshots/coach-mobile.png`

Insert the images into `README.md` under a new `## Screenshots — Application Coach` section.
