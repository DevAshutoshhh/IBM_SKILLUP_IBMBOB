# SaathiSetu

**Scholarship & Education Scheme Readiness Navigator**

> Turn eligibility confusion into a clear action plan.

SaathiSetu is a privacy-first web application that helps Indian students — particularly
first-generation learners — work out which scholarships and education-support schemes are
worth preparing for, understand *why* each one matched, know exactly which documents to
collect, and walk away with a printable action plan.

It runs entirely in the browser. There is no backend, no account and no database.

---

## Table of contents

- [The problem](#the-problem)
- [The solution](#the-solution)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Matching methodology](#matching-methodology)
- [Document readiness scoring](#document-readiness-scoring)
- [Privacy design](#privacy-design)
- [Accessibility](#accessibility)
- [Demonstration-data disclaimer](#demonstration-data-disclaimer)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Future roadmap](#future-roadmap)
- [Team](#team)
- [Licence](#licence)

---

## The problem

Students who are entitled to financial support routinely miss it, and rarely for lack of merit:

- **Information is scattered.** Central schemes, State schemes and institutional schemes each
  live on their own portal, in their own format.
- **Eligibility is written in official language.** "Post-matric", "means-cum-merit" and
  "notified minority" are not phrases a sixteen-year-old should have to decode alone.
- **Nobody says which document to get first.** Students discover a missing domicile
  certificate at the point of submission, not two months earlier when there was time.
- **Expired certificates silently disqualify people.** An income certificate that lapsed last
  month makes an otherwise complete application incomplete.
- **Deadlines pass quietly.** There is no single place that says "this closes soon and you are
  not ready".
- **Portals are hard to use on a phone with a weak connection**, which is exactly the device
  and connection most affected students have.
- **Preparation demands sensitive data.** Students are asked for identity numbers merely to
  find out whether a scheme is worth applying for.

## The solution

SaathiSetu compresses that whole mess into four steps: **describe your situation → see
explained matches → get document-ready → print your plan.**

Three decisions define the product:

1. **Explain, never just score.** Every percentage is broken down into confirmed reasons,
   conditions to verify, and definite conflicts — in plain English or Hindi.
2. **Not knowing is not disqualifying.** "Prefer not to say" and unanswered questions produce
   a *"needs verification"* flag, never a rejection. A student is never quietly filtered out of
   an opportunity because they declined to state their caste.
3. **Ask for as little as possible.** Income and marks are captured as broad bands. No name,
   no Aadhaar, no phone number, no uploads. Everything stays in `localStorage`.

## Features

| Area | What it does |
| --- | --- |
| **Landing page** | Explains the problem, the four-step journey and the privacy model, with a clear prototype disclaimer. |
| **Profile wizard** | Five friendly steps with visible progress. Only two answers are required; every sensitive question has "Prefer not to say". |
| **Matching engine** | Deterministic, weighted, rule-based scoring across 14 demonstration opportunities, with a full explanation for each factor. |
| **Results** | Search, sort by match / name / document readiness, filter by help type and assistance category, hide conflicts, bookmark, and open a full detail view. |
| **Comparison** | Up to three opportunities side by side — a real table on desktop, stacked accessible cards on mobile. |
| **Document Readiness Centre** | A personalised checklist over 15 document types, each with a plain-language explanation of why it is asked for, and a 0–100 readiness score. |
| **Action plan** | A printable one-page plan: scores, confirmed reasons, conditions to verify, ordered document priorities, next steps, deadline warning, official link and safety disclaimer. |
| **Dashboard** | Profile completion, saved opportunities, best match, selected application, readiness, outstanding documents and a suggested next action. |
| **Bilingual** | Full English / Hindi toggle across navigation, forms, validation, match explanations, checklist statuses, warnings and empty states. |
| **Offline** | Installable PWA with a service worker; the entire workflow keeps working with no connection after the first load. |
| **Privacy panel** | An itemised inventory of what is stored, where it is stored, and a confirmed "delete everything" button. |

## Screenshots

> Replace these placeholders with real captures before submitting.

| Screen | Placeholder |
| --- | --- |
| Landing page | `docs/screenshots/01-landing.png` |
| Profile wizard | `docs/screenshots/02-profile-wizard.png` |
| Explained matches | `docs/screenshots/03-matches.png` |
| Match explanation expanded | `docs/screenshots/04-explanation.png` |
| Comparison view | `docs/screenshots/05-compare.png` |
| Document Readiness Centre | `docs/screenshots/06-documents.png` |
| Printable action plan | `docs/screenshots/07-action-plan.png` |
| Hindi interface | `docs/screenshots/08-hindi.png` |
| Mobile at 360px | `docs/screenshots/09-mobile.png` |

## Technology stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | **React 18 + TypeScript** | Strong typing over a domain full of enumerated categories. |
| Build | **Vite 5** | Fast dev server, small static output, easy base-path control for GitHub Pages. |
| Styling | **Hand-written CSS** with custom properties | No utility-CSS dependency; full control over contrast, focus states and print output. |
| Icons | **lucide-react** | The single UI dependency; tree-shaken SVG icons. |
| Testing | **Vitest + React Testing Library** | Same toolchain as the build; tests exercise behaviour, not implementation. |
| Storage | **`localStorage`** | The only persistence layer. No backend, no database, no auth. |
| Offline | **Hand-written service worker + web manifest** | Fully auditable in about a hundred lines. |

Deliberately **not** used: any backend, authentication, database, paid service, external AI
API, API key, or Tailwind CSS.

Runtime dependencies: `react`, `react-dom`, `lucide-react`. That is all.

## Architecture

```
SaathiSetu/
├── index.html                  App entry, PWA metadata, no-JS fallback
├── public/
│   ├── manifest.webmanifest    Installable metadata
│   ├── sw.js                   Offline service worker
│   ├── .nojekyll               Keeps GitHub Pages from filtering assets
│   └── icons/                  Generated PWA icons (SVG + PNG)
├── scripts/
│   └── generate-icons.mjs      Rasterises the logo into PWA icons (zlib only)
└── src/
    ├── main.tsx                Bootstrap, style imports, SW registration
    ├── App.tsx                 Shell: header, routed page, footer, privacy panel
    ├── components/             Reusable UI
    │   ├── Dialog.tsx          Focus-trapped, Escape-closable modal
    │   ├── ErrorBoundary.tsx   Keeps a render error from destroying saved data
    │   ├── FormFields.tsx      Labelled radio / checkbox / select scaffolding
    │   ├── Header.tsx          Navigation, language toggle, connection status
    │   ├── Indicators.tsx      Progress bar, readiness ring, badges, empty states
    │   ├── MatchExplanation.tsx  Confirmed / verify / conflict breakdown
    │   ├── OpportunityCard.tsx   Result card with inline explanation
    │   ├── OpportunityDetail.tsx Full detail dialog
    │   └── PrivacyPanel.tsx    Data inventory and deletion
    ├── pages/                  One file per screen
    ├── data/                   Demonstration dataset and reference data
    │   ├── opportunities.ts    14 labelled demonstration opportunities
    │   ├── documents.ts        15 document types with plain-language reasons
    │   ├── states.ts           All States and Union Territories, bilingual
    │   └── bands.ts            Income / marks bands as comparable ranges
    ├── utils/
    │   ├── matching.ts         The scoring engine — the heart of the app
    │   ├── readiness.ts        Document readiness scoring
    │   └── storage.ts          The only code that touches localStorage
    ├── hooks/
    │   ├── useAppState.tsx     Single state provider and all actions
    │   ├── useOnlineStatus.ts  Connectivity indicator
    │   └── useRoute.ts         Hash router (survives a refresh on Pages)
    ├── i18n/
    │   ├── en.ts               Reference locale
    │   ├── hi.ts               Hindi locale (may be partial; falls back)
    │   └── index.ts            Lookup, interpolation, token resolution
    ├── types/index.ts          Every domain type in one place
    ├── styles/                 base · layout · components · pages · print
    └── tests/                  77 tests across 5 files
```

Design rules the codebase holds to: business logic lives in `utils/` and is never duplicated in
a component; every storage read or write goes through `utils/storage.ts`; the matching engine is
language-free and emits tokens that `i18n/` resolves; no unused imports; no unfinished TODOs.

## Matching methodology

The engine in [`src/utils/matching.ts`](src/utils/matching.ts) is **deterministic and
explainable**. The same profile and opportunity always produce the same score. Nothing is
random, time-dependent or model-driven.

Six weighted factors sum to 100 points:

| Factor | Weight | Confirmed when | Conflict when |
| --- | --- | --- | --- |
| Education level | 25 | The student's level is in the scheme's list | It is not |
| State / location | 15 | Scheme is All-India, or covers the student's State | It is a State scheme for another State |
| Family income | 20 | The student's whole band sits inside the limit | The band starts at or above the limit |
| Category / special eligibility | 15 | Every stated condition is met | Any stated condition is contradicted |
| Academic performance | 10 | The band's floor is at or above the minimum | The band's ceiling is at or below the minimum |
| Required-support match | 15 | Proportional to how many requested kinds of help are covered | *(never a conflict)* |

**Three rules matter more than the weights:**

1. **Unknown never disqualifies.** A missing answer, "Prefer not to say" or "Not sure" produces
   a `needs_verification` outcome worth **half** the weight — the opportunity stays in the list,
   and the student is told precisely what to check.
2. **Only a stated contradiction is a conflict**, scoring zero for that factor. Conflicting
   opportunities are still shown, clearly flagged, because scheme rules change and the official
   portal is the authority.
3. **Overlapping bands are honest about it.** A student in the ₹2.5–5 lakh band against a
   ₹3 lakh limit is told to check the exact figure on their certificate, not given a false yes
   or a false no.

Each result returns a **match percentage**, **confirmed reasons**, **conditions requiring
verification**, **definite conflicts**, and a **suggested next step** (`blocked`, `verify`,
`prepare` or `ready`).

> The percentage is a **preparation aid**, not an eligibility decision. The interface says so on
> every screen that displays one.

## Document readiness scoring

[`src/utils/readiness.ts`](src/utils/readiness.ts) scores only the **required** documents:

| Status | Contribution |
| --- | --- |
| Ready | 1.0 |
| Needs renewal | 0.5 — you have it, but you cannot use it yet |
| Not available | 0.0 |
| Not applicable | Excluded from the denominator entirely |

`score = round(earned / countable × 100)`, and 100 when there is nothing left to collect.
Next actions are ordered **missing before expiring**. Checklists are seeded from the profile:
a student who said they have no disability is not asked to chase a disability certificate.

## Privacy design

- **No backend, no account, no database.** There is no server to send data to.
- **`localStorage` only**, under one namespaced key (`saathisetu.state.v1`). All reads and
  writes go through `src/utils/storage.ts`.
- **Never collected:** name, Aadhaar number, phone number, email address, exact address, bank
  details, certificate numbers, document files.
- **Coarse data by design.** Income and marks are stored as bands, not figures.
- **No uploads are possible.** The document centre is a checklist; the app has no file input.
- **No third-party requests at runtime.** No analytics, no fonts from a CDN, no telemetry.
- **One-click deletion.** The privacy panel itemises what is stored and deletes all of it
  behind a confirmation step.
- **The app degrades gracefully** when a browser blocks storage: it says so, and keeps working
  for that session.

## Accessibility

- Semantic HTML: real `<header>`, `<nav>`, `<main>`, `<footer>`, headings in order, a `<table>`
  where the data is genuinely tabular.
- Every control is keyboard reachable with a visible focus ring; the dialog traps focus,
  closes on Escape and restores focus to its trigger.
- Every form control has an associated label; help text and error messages are wired up with
  `aria-describedby`; validation errors are announced via `role="alert"`.
- **Meaning is never carried by colour alone** — status badges pair colour with an icon *and* a
  word.
- Colour contrast meets WCAG AA for body text and interface labels.
- `prefers-reduced-motion` disables the progress and ring animations; the numbers they express
  are always rendered as text.
- Skip link to main content; `lang` is updated when the language changes.
- Tested from 360px upwards; no horizontal overflow at any width. Wide content scrolls inside
  its own container.
- ARIA is used only where HTML cannot express the intent.

## Demonstration-data disclaimer

The 14 opportunities in [`src/data/opportunities.ts`](src/data/opportunities.ts) are
**illustrative content written for this prototype**. Their names, limits, conditions and dates
are representative of how Indian scholarship schemes are usually structured, but they are **not
copied from any live scheme notification**.

- Every entry is flagged `isDemoData: true` and is labelled "Demonstration entry" in the UI.
- **No entry claims that applications are currently open.** Most show
  "Verify on official portal" instead of a date.
- Each entry links to a **real official portal** so the current rules can be checked there.
- The app repeats, on the results page, in every detail view and on the printed plan, that the
  official source is authoritative.

## Installation

Requires **Node.js 20 or newer**.

```bash
git clone <your-repository-url>
cd SaathiSetu
npm install
```

## Development

```bash
npm run dev          # start the dev server (http://localhost:5173)
npm run typecheck    # type-check without emitting
npm run icons        # regenerate the PWA icons from the logo geometry
```

The service worker is registered only in production builds, so local development is never
served from a stale cache.

## Testing

```bash
npm run test         # run the suite once
npm run test:watch   # watch mode
```

**77 tests across 5 files**, covering:

- a strong eligibility match, and that it is deterministic;
- definite eligibility conflicts (State, income, marks) and that conflicting opportunities are
  still shown;
- unknown optional information and partial support matches;
- every "Prefer not to say" path, including that an undisclosed answer scores *above* a stated
  conflict;
- score boundaries at 0 and 100, clamping, and sort stability;
- checklists with nothing ready, everything ready, and mixed renewal states;
- "not applicable" exclusion and profile-seeded checklists;
- `localStorage` round-trip, corruption recovery, forward-compatible loading, deletion, and
  behaviour when storage is blocked;
- translation fallback from Hindi to English, unknown keys, interpolation and token resolution;
- end-to-end UI flows: wizard validation, language switching, search, bookmarking, checklist
  updates and the privacy deletion flow.

## Deployment

The build output in `dist/` is fully static.

### GitHub Pages

A workflow is included at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It
type-checks, tests and builds on every push, and deploys `main` to Pages.

```bash
npm run build:gh-pages   # builds with base=/SaathiSetu/
```

1. Push the repository to GitHub.
2. **Settings → Pages → Source: GitHub Actions.**
3. If your repository is **not** named `SaathiSetu`, change the `--base=` value in the
   `build:gh-pages` script in `package.json` to `/<your-repo-name>/`.

The app uses **hash routing** (`#/matches`), so a refresh on any screen works on Pages without
custom 404 handling.

### Netlify

[`netlify.toml`](netlify.toml) is included — build `npm run build`, publish `dist`, with an
SPA redirect and correct cache headers for `sw.js`.

```bash
netlify deploy --prod
```

### Vercel

[`vercel.json`](vercel.json) is included with the same settings.

```bash
vercel --prod
```

### Anything else

```bash
npm run build
npm run preview      # serve dist/ locally to check the production bundle
```

Then upload `dist/` to any static host. A user-visible caveat: `sw.js` should be served with
`Cache-Control: no-cache` so a new deploy reaches people who already installed the app.

## Known limitations

These are real limits of the prototype, stated plainly:

1. **The dataset is fictional.** 14 illustrative opportunities, hand-written. There is no live
   feed from any government portal, and no entry should be relied on for a real application.
2. **`lastVerified` is a static field**, not evidence that anything was checked recently.
3. **Matching is rule-based, not semantic.** It cannot read a scheme notification, interpret an
   unusual eligibility clause, or handle a condition the data model does not have a field for.
4. **The engine only knows what the student tells it**, in bands. It cannot detect that someone
   has misjudged their own income band.
5. **Nothing syncs.** Data lives in one browser on one device. Clearing site data, using a
   different phone or a private window means starting again — the direct cost of having no
   backend.
6. **Deadlines are not tracked.** There are no reminders and no notifications; the app cannot
   tell a student that something closes tomorrow.
7. **Hindi is the only second language**, and a handful of technical strings intentionally fall
   back to English. Other Indian languages are not covered.
8. **Hindi translations were not reviewed by a native-speaking domain expert** and should be
   proofread before any real deployment.
9. **Accessibility has been built to standard and tested by hand and in automated DOM tests**,
   but has not been audited with real assistive technology or by users with disabilities.
10. **Offline support covers the app and its dataset only.** Official portal links obviously
    still need a connection.
11. **No screen-reader-tested print flow.** Printing was verified visually against a print
    stylesheet, not with assistive technology.
12. **No analytics of any kind**, by design — which also means there is no usage data to learn
    from.

## Future roadmap

**Near term**

- Replace demonstration data with a curated, dated, source-linked dataset and a documented
  review cycle.
- Deadline reminders using local notifications, still with no server.
- Export and re-import the profile as an encrypted file, so a student can move devices without
  a backend.
- More Indian languages, starting with Marathi, Bengali and Tamil.

**Medium term**

- A community-maintained scheme dataset with a public review trail.
- Institution mode: a teacher or NGO worker preparing plans for a cohort, on one device.
- Guided document-collection walkthroughs, per State, for the certificates that block the most
  applications.
- A genuine accessibility audit with assistive-technology users.

**Longer term**

- Optional integration with official APIs where they exist, so eligibility can be confirmed
  rather than estimated.
- SMS-based or low-bandwidth delivery for students without a smartphone.
- Impact measurement with partner institutions — applications completed, not just started.

## Team

> Fill this in before submitting.

| Role | Name | Contact |
| --- | --- | --- |
| Team name | _______________________ | |
| Member 1 | _______________________ | _______________________ |
| Member 2 | _______________________ | _______________________ |
| Member 3 | _______________________ | _______________________ |
| Member 4 | _______________________ | _______________________ |
| Institution | _______________________ | |
| Hackathon / event | _______________________ | |
| Live demo URL | _______________________ | |
| Repository URL | _______________________ | |

## Licence

Shared for educational and demonstration use. Add the licence your hackathon requires before
publishing.

---

**SaathiSetu** — *saathi* (companion) + *setu* (bridge). A companion that bridges the gap
between a student and the support they are entitled to.
