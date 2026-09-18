# SaathiSetu – Scholarship and Education Scheme Readiness Navigator

> Private, explainable scholarship preparation for Indian students.

SaathiSetu helps students turn scattered scholarship rules into a practical journey: create a
minimal profile, review explained opportunity matches, compare options, check document readiness,
and print an action plan. It is a browser-only guidance prototype—not an eligibility authority or
application portal.

**GitHub Pages deployment:** https://devashutoshhh.github.io/IBM_SKILLUP_IBMBOB/

The URL above is the intended deployment. It should not be treated as verified until the repository
owner enables GitHub Pages with **Source: GitHub Actions** and the deployment workflow succeeds.

## Main features

- Five-step profile form using broad bands and optional sensitive answers.
- Deterministic opportunity matching with confirmed, unverified, and conflicting factors explained.
- Search, filtering, bookmarks, details, and side-by-side comparison for up to three opportunities.
- Per-opportunity document checklist and a weighted document-readiness percentage.
- **Guided Application Coach** — converts missing documents and unverified eligibility conditions into an ordered, interactive action plan. Each action explains why it is required, lets the student mark it done, and recalculates progress immediately. Progress is saved to `localStorage` and the feature works fully offline.
- Printable action plan with next steps and links to official sources.
- English and Hindi interfaces.
- Browser `localStorage` persistence, an itemised privacy panel, and complete local-data deletion.
- Responsive layouts, keyboard-accessible controls, hash routing, and installable PWA assets.

## Privacy and demonstration data

SaathiSetu has no backend, account, database, analytics, API key, or document upload. Profile choices,
bookmarks, comparisons, and checklists stay in one namespaced `localStorage` entry on the current
device and can be deleted from the privacy panel.

Every opportunity bundled in the app is clearly marked as demonstration data. Names, conditions,
amounts, and dates are illustrative and may not reflect current schemes. Users must confirm all
details on the linked official portal before applying. Match and readiness percentages are
preparation aids, not official decisions.

## Technology stack

| Area | Technology |
| --- | --- |
| Interface | React 18, TypeScript, hand-written CSS |
| Build | Vite 5 |
| Tests | Vitest, React Testing Library, jsdom |
| Persistence | Browser `localStorage` |
| Offline support | Web app manifest and service worker |
| Deployment | GitHub Actions and GitHub Pages |

There is no backend or paid service. The only runtime packages are React, React DOM, and
`lucide-react`.

## Installation and development

Node.js 20 or newer is required.

```bash
git clone https://github.com/DevAshutoshhh/IBM_SKILLUP_IBMBOB.git
cd IBM_SKILLUP_IBMBOB
npm ci
npm run dev
```

## Verification commands

```bash
npm run typecheck
npm run test
npm run build
```

The final local verification on 11 September 2026 passed all 77 tests in five test files,
TypeScript checking, and the production build. GitHub Actions repeats these checks before it uploads
and deploys `dist/`.

## How the application works

1. The profile wizard records only the information needed for matching.
2. `src/utils/matching.ts` evaluates six weighted factors and retains uncertain results for manual
   verification instead of silently rejecting them.
3. Students can inspect explanations, save opportunities, and compare up to three choices.
4. `src/utils/readiness.ts` calculates document readiness from required checklist items. A document
   needing renewal receives partial credit; non-applicable items are excluded.
5. The action-plan screen collects the preparation status, official link, and next actions into a
   printable view.
6. `src/utils/coach.ts` converts the match result and document checklist into a three-section action
   plan: eligibility-condition verifications, document tasks (missing before expiring, required before
   optional), and fixed apply steps. `src/pages/CoachPage.tsx` renders each action as a checkbox with
   a collapsible "why" explanation. Completion state is stored per opportunity in `coachProgress`
   within the same `localStorage` key as all other app state.

Application state is owned by `src/hooks/useAppState.tsx` and persisted through
`src/utils/storage.ts`. English and Hindi strings are resolved by `src/i18n/`. The custom hash router
uses URLs such as `#/matches`, so refreshing a routed screen does not require server-side rewrites on
GitHub Pages.

## Testing coverage

The checked-in suite covers matching boundaries and determinism, readiness scoring, storage and
deletion, translation fallback, form validation, language switching, filtering, bookmarking,
match explanations, checklist updates, privacy controls, dialog keyboard dismissal, and the
Guided Application Coach (document actions, verify actions, apply actions, plan assembly, completion
counting, and percentage calculation across the full dataset).

The project includes visible focus styles, semantic controls, a skip link, dialog focus management,
reduced-motion rules, and responsive/print styles. These implementation measures are not a claim of
a completed assistive-technology or formal WCAG audit.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` runs on pushes to `main` and manual dispatch. It:

1. checks out the repository and configures Pages;
2. installs the exact lockfile dependency graph with `npm ci`;
3. type-checks, tests, and builds with the repository-aware base
   `/IBM_SKILLUP_IBMBOB/`;
4. uploads only `dist/` as the Pages artifact; and
5. deploys through the protected `github-pages` environment.

`dist/` remains ignored and is not committed. To reproduce the Pages build locally:

```bash
SAATHISETU_BASE=/IBM_SKILLUP_IBMBOB/ npm run build
```

Repository setup still required: **Settings → Pages → Build and deployment → Source → GitHub
Actions**.

## IBM Bob usage

The application existed before it was imported into IBM Bob. After import, genuine Bob-assisted
sessions were used to establish project context, analyse and review the implementation, support
development and debugging improvements, run verification, and strengthen the documentation. That
improvement workflow helped bring the existing project to its current reviewed and buildable state.
Bob did not create the original application, and no unsupported feature-level attribution is made.

See [BOB_USAGE.md](BOB_USAGE.md) for the development record and
[IBM_BOB_TECHNOLOGY.md](IBM_BOB_TECHNOLOGY.md) for the submission response.

## Screenshots

No screenshot images are currently committed, so this README does not present a fabricated gallery.
The evidence checklist in [docs/screenshots/README.md](docs/screenshots/README.md) lists the genuine,
privacy-reviewed captures that can be added from the completed Bob sessions and running application.

## Current limitations

- The opportunity dataset is illustrative and bundled with the application; it is not a live feed.
- Matching is rule-based and cannot interpret arbitrary scheme documents.
- Data stays on one browser and does not sync between devices.
- Deadlines are not monitored and no reminders are sent.
- Hindi content has not been documented as reviewed by a domain-language specialist.
- Offline use begins only after a successful first load; external official portals still need a
  network connection.
- No formal accessibility audit or end-to-end real-browser suite is included.

## Future scope

- Replace demonstration entries with a curated, dated, source-reviewed dataset.
- Add locally scheduled deadline reminders without introducing a backend.
- Support encrypted profile export/import and more Indian languages.
- Add browser-level offline, visual-regression, and accessibility testing.
- Explore official data integrations where stable, authorised APIs exist.

## Licence

Released under the [MIT License](LICENSE).
