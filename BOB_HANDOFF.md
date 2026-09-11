# SaathiSetu — Handoff for IBM Bob

> **Read this first.** This document exists so you can import SaathiSetu into IBM Bob and start
> improving it immediately. It is a *handoff*, not a record of work already done.
>
> **IBM Bob did not build this application.** The codebase in this repository was written before
> any Bob session. Nothing in this file claims otherwise, and the activity table at the end is
> deliberately **blank** — you fill it in with what *you* actually do in Bob. Please do not
> invent entries.

---

## 1. What the project is

SaathiSetu is a privacy-first React + TypeScript web app that helps Indian students find
scholarships worth applying for, understand *why* each one matched, get their documents in
order, and print an action plan. It runs entirely in the browser: no backend, no database, no
authentication, no API keys.

It is a **guidance prototype** with clearly labelled **demonstration data**. It is not an
official portal and does not decide anyone's eligibility.

---

## 2. Project architecture

```
SaathiSetu/
├── index.html                  Entry point, PWA metadata, no-JS fallback
├── package.json                Scripts and the three runtime dependencies
├── vite.config.ts              Build + Vitest config; configurable base path
├── tsconfig.app.json           Strict TypeScript for src/
├── netlify.toml · vercel.json  Static deployment configs
├── .github/workflows/deploy.yml  Type-check → test → build → GitHub Pages
├── public/
│   ├── manifest.webmanifest    Installable metadata
│   ├── sw.js                   Hand-written offline service worker
│   └── icons/                  Generated PWA icons
├── scripts/generate-icons.mjs  Rasterises the logo (Node zlib only, no deps)
└── src/
    ├── main.tsx · App.tsx      Bootstrap and shell
    ├── components/             11 reusable UI components
    ├── pages/                  7 screens, one file each
    ├── data/                   Demonstration dataset + reference data
    ├── utils/                  matching · readiness · storage
    ├── hooks/                  useAppState · useOnlineStatus · useRoute
    ├── i18n/                   en · hi · lookup and token resolution
    ├── types/                  Every domain type
    ├── styles/                 base · layout · components · pages · print
    └── tests/                  77 tests across 5 files
```

### Data flow, in one paragraph

`AppStateProvider` (`src/hooks/useAppState.tsx`) holds all state and writes it to `localStorage`
through `src/utils/storage.ts` on every change. Pages read state from `useAppState()` and call
its actions. Scoring lives in `src/utils/matching.ts` and `src/utils/readiness.ts` — both are
pure functions with no React and no I/O. The matching engine is **language-free**: it emits
tokens (`@education.undergraduate`, `#state:MH`, `#money:250000`) that `src/i18n/index.ts`
resolves into prose at render time. This is why the engine can be unit-tested without touching
the DOM, and why adding a language requires no changes to the scoring code.

### Design rules the codebase holds to

1. Business logic lives in `utils/`, never duplicated inside a component.
2. Every `localStorage` read or write goes through `utils/storage.ts`.
3. The matching engine is deterministic — same inputs, same outputs, always.
4. Unknown and "prefer not to say" answers never disqualify a student.
5. No unused imports, no unfinished TODOs, no `console` output in production paths.
6. Meaning is never carried by colour alone.

---

## 3. Important files

| File | Why it matters |
| --- | --- |
| **`src/utils/matching.ts`** | **The heart of the app.** Six weighted factors summing to 100. Read the header comment before changing anything here. |
| **`src/utils/readiness.ts`** | Document readiness scoring; `needs_renewal` counts as 0.5, `not_applicable` is excluded. |
| **`src/utils/storage.ts`** | The only code that touches `localStorage`. Also handles corrupt data and blocked storage. |
| **`src/data/opportunities.ts`** | The 14 demonstration schemes. Adding one is pure data — nothing else needs to change. |
| **`src/data/documents.ts`** | 15 document types with bilingual plain-language explanations. |
| **`src/types/index.ts`** | Every domain type. Start here to understand the model. |
| **`src/hooks/useAppState.tsx`** | Single state provider and all state actions. |
| **`src/i18n/en.ts` / `hi.ts`** | Flat key-value locales. `en` is the reference; `hi` may be partial and falls back. |
| **`src/i18n/index.ts`** | Lookup, interpolation, and resolution of the engine's tokens. |
| **`src/components/Dialog.tsx`** | The only overlay pattern: focus-trapped, Escape-closable, focus-restoring. |
| **`src/styles/print.css`** | The action plan is meant to be printed; this is why it prints well. |
| **`public/sw.js`** | ~100 lines: network-first for navigations, cache-first for assets. |

---

## 4. Commands

```bash
npm install            # install dependencies (Node 20+)
npm run dev            # dev server at http://localhost:5173
npm run test           # run all 77 tests once
npm run test:watch     # watch mode
npm run typecheck      # strict type-check, no emit
npm run build          # type-check + production build to dist/
npm run build:gh-pages # production build with base=/SaathiSetu/
npm run preview        # serve dist/ to check the production bundle
npm run icons          # regenerate PWA icons from the logo geometry
```

**Before you consider any Bob change complete:** `npm run test && npm run build` must both pass.

---

## 5. Tests

`npm run test` — **77 tests, 5 files**, all passing at handoff.

| File | Covers |
| --- | --- |
| `src/tests/matching.test.ts` | Strong match, definite conflicts, unknown information, every "prefer not to say" path, score boundaries at 0 and 100, clamping, sort stability, determinism. |
| `src/tests/readiness.test.ts` | Nothing ready, everything ready, renewal weighting, "not applicable" exclusion, priority ordering, profile-seeded checklists. |
| `src/tests/storage.test.ts` | Round-trip persistence, single-key discipline, deletion, corrupt data recovery, forward-compatible loading, blocked storage. |
| `src/tests/i18n.test.ts` | Hindi lookup, English fallback, unknown keys, interpolation, token resolution, and that no raw token ever reaches the screen. |
| `src/tests/app.test.tsx` | End-to-end flows: wizard validation, language switch, search, bookmarking, checklist updates, privacy deletion, Escape-to-close. |
| `src/tests/fixtures.ts` | Profile and opportunity builders. Not a test file — a helper. |

**If you change the weights in `matching.ts`, the boundary tests will fail. That is intended.**
Update the tests deliberately, not reflexively.

---

## 6. Current limitations

Honest list, all of them real. Several are good Bob tasks.

1. **The dataset is fictional.** 14 hand-written illustrative opportunities; no live feed.
2. **`lastVerified` is a static string**, not evidence of a recent check.
3. **Matching is rule-based**, not semantic. It cannot interpret an unusual eligibility clause.
4. **No deadline tracking** — no reminders, no notifications.
5. **No sync.** One browser, one device. Clearing site data loses everything.
6. **Hindi only**, and a few technical strings intentionally fall back to English.
7. **Hindi has not been reviewed by a native-speaking domain expert.**
8. **Accessibility is built to standard and DOM-tested, but not audited** with real assistive
   technology or by users with disabilities.
9. **No visual regression tests** and no end-to-end browser tests (Playwright etc.).
10. **The service worker has no update prompt** — a new deploy is picked up silently on next load.
11. **No error reporting**, by design; a production error is only visible in the console.
12. **`OPPORTUNITIES` is imported directly** by several pages rather than injected, which makes
    swapping in a remote dataset a small refactor.

---

## 7. Recommended improvements for IBM Bob

Ordered by value-for-effort. Pick the ones you can genuinely finish and verify.

### High value

1. **Deadline reminders.** Add an optional local notification when a selected opportunity's
   deadline approaches. Must keep the no-server promise — `Notification` API plus stored
   preferences only.
2. **Encrypted profile export / import.** Let a student move devices without a backend: export
   the `localStorage` state as a passphrase-encrypted file (Web Crypto), and import it back.
3. **A dataset provenance layer.** Give each opportunity a `sources[]` array with URL + retrieval
   date, and surface it in the detail view. This is the foundation for real data.
4. **Service-worker update prompt.** Detect a waiting worker and offer "A new version is
   available — reload".

### Medium value

5. **A fourth locale.** Add Marathi, Bengali or Tamil in `src/i18n/`. The fallback mechanism
   means a partial locale ships safely.
6. **Playwright end-to-end tests** for the full journey, including the offline path — something
   jsdom genuinely cannot cover.
7. **An accessibility audit pass** with `axe-core` wired into the test run, then fix what it
   finds.
8. **Extract the dataset behind a provider** so `OPPORTUNITIES` can come from a bundled JSON file
   or a cached remote fetch without touching the pages.

### Nice to have

9. **A saved-comparison view** so a student can revisit a comparison after closing the tab.
10. **Print the comparison table**, not only the action plan.
11. **Keyboard shortcuts** for the wizard (Enter to advance, Escape to go back).
12. **A "what changed?" diff** when a student edits their profile — which matches moved, and why.

---

## 8. Suggested Bob prompts

Copy these into Bob as starting points. Each is scoped to something Bob can finish and you can
verify with `npm run test && npm run build`.

> **Understanding the codebase**
> "Read `src/utils/matching.ts` and explain the six scoring factors, how a 'prefer not to say'
> answer is treated differently from a conflict, and why the engine emits tokens instead of
> sentences."

> **Adding data**
> "Add three new demonstration opportunities to `src/data/opportunities.ts` covering sports
> scholarships, single-girl-child support, and a North-Eastern States scheme. Follow the existing
> `Opportunity` type exactly, include bilingual name/description/steps, mark them
> `isDemoData: true`, use `deadline: null`, and link to a real official portal. Then run the
> tests."

> **A new feature**
> "Implement optional deadline reminders. Add a per-opportunity 'remind me' toggle that stores a
> preference in the existing app state, requests notification permission only when the student
> enables it, and schedules a local notification. Do not add a backend or any new dependency.
> Add tests for the new state actions."

> **Accessibility**
> "Add `axe-core` and `vitest-axe` as dev dependencies, write a test that renders each of the
> seven pages and asserts there are no accessibility violations, then fix every violation it
> reports."

> **Internationalisation**
> "Add a Marathi locale at `src/i18n/mr.ts` following the structure of `hi.ts`, register it in
> `src/i18n/index.ts` and `LANGUAGES`, and extend the language toggle to three options. Confirm
> the existing fallback test still passes for partially translated locales."

> **Refactoring**
> "Extract the opportunity dataset behind a provider so pages no longer import `OPPORTUNITIES`
> directly. Keep the current bundled data as the default source. Do not change any behaviour;
> all 77 tests must still pass."

> **Quality**
> "Review `src/components/` for duplicated logic, unused props and any place where meaning is
> conveyed by colour alone. Propose a short list of concrete fixes before changing anything."

> **Testing**
> "Add Playwright, write an end-to-end test covering profile → matches → documents → action plan,
> including one assertion that the app still works with the network disabled after a first load."

---

## 9. Activity log — fill this in yourself

> **This table is intentionally empty.** Record only work you actually carried out in IBM Bob.
> Delete any row you did not use. Do not pre-fill it, and do not describe work done before the
> project was imported into Bob.

| # | Date | What you asked Bob to do | What Bob produced | Files changed | Did you accept it? | `npm run test` | `npm run build` | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |
| 6 | | | | | | | | |
| 7 | | | | | | | | |
| 8 | | | | | | | | |

### Summary to complete after your Bob sessions

- **Date the project was imported into Bob:** ______________________
- **Number of Bob sessions:** ______________________
- **Features added or improved using Bob:** ______________________
- **Bugs Bob found or fixed:** ______________________
- **Tests before Bob:** 77 passing · **Tests after Bob:** ______________________
- **Anything Bob suggested that you rejected, and why:** ______________________
- **Where Bob was most useful:** ______________________
- **Where Bob was least useful:** ______________________
