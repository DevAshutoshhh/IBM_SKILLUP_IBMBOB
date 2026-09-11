# Project Submission — SaathiSetu

## Project name and tagline

**SaathiSetu** — Scholarship & Education Scheme Readiness Navigator

> *Turn eligibility confusion into a clear action plan.*

*Saathi* (companion) + *Setu* (bridge): a companion that bridges the gap between a student and
the support they are already entitled to.

---

## Problem statement

Every year, Indian students who qualify for scholarships and education-support schemes fail to
receive them. The barrier is almost never merit — it is process.

- **Scattered information.** Central, State and institutional schemes each sit on a separate
  portal in a separate format. There is no single place a student can ask "what applies to me?"
- **Impenetrable eligibility language.** "Post-matric", "means-cum-merit", "notified minority",
  "domicile" — official phrasing that a first-generation learner has nobody at home to decode.
- **Invisible document requirements.** Students discover a missing domicile or income
  certificate at the moment of submission, when it is far too late to obtain one.
- **Expired certificates.** An income certificate that lapsed last month quietly turns a
  complete application into a rejected one. This is one of the most common causes of failure and
  one of the most preventable.
- **Missed deadlines.** Nothing warns a student that a scheme closes soon and they are not ready.
- **Hostile mobile experience.** Most affected students are on a mid-range phone with an
  intermittent connection — precisely the case these portals handle worst.
- **A privacy toll for merely looking.** Students are asked for identity numbers just to find
  out whether an application is worth starting.

The result is a system where the students with the least support at home face the most process
burden — exactly backwards.

---

## Proposed solution

SaathiSetu is a **privacy-first, offline-capable, bilingual web application** that turns that
mess into four steps: **describe your situation → see explained matches → get document-ready →
print your plan.**

A student answers a short profile wizard — course, State, income band, marks band, and the kind
of help they need. A deterministic rule-based engine scores every scheme in the dataset and,
crucially, **explains itself**: confirmed reasons, conditions still to verify, definite
conflicts, and one suggested next step. The student picks an application and gets a personalised
document checklist with a readiness score and a prioritised list of what to collect first.
Finally they print a one-page action plan to carry to a cyber cafe, a school office or a parent.

Three design commitments shape everything:

1. **Explain, never just score.** A percentage with no reasoning is not guidance; it is an
   oracle. Every factor is broken down into a sentence in the student's language.
2. **Not knowing is not disqualifying.** "Prefer not to say" and unanswered questions produce a
   *needs verification* flag worth half the weight — never a rejection. A student is never
   filtered out of an opportunity for declining to state their caste, gender or disability.
3. **Ask for as little as possible.** Income and marks as bands, never figures. No name, no
   Aadhaar, no phone number, no uploads, no account. Everything stays in the browser.

It is explicitly a **guidance tool**, not an eligibility authority and not a submission portal —
and it says so on every screen that shows a number.

---

## Target users

**Primary**

- **First-generation learners** in Classes 9–12, ITI/diploma and undergraduate programmes, who
  have no one at home who has navigated this process before.
- **Students from low-income households** for whom a ₹15,000 fee waiver decides whether the
  next year happens at all.
- **Students from underserved communities** — rural, SC/ST/OBC, minority, and students with
  disabilities — who face additional, and additionally confusing, documentation requirements.

**Secondary**

- **Parents and older siblings** helping with an application they do not fully understand.
- **School and college counsellors** who advise hundreds of students with no tooling.
- **NGO and community volunteers** running scholarship camps, often offline, in low-connectivity
  areas.

---

## Key features

| Feature | Why it matters |
| --- | --- |
| **Explained matching** | Six weighted factors (education 25, income 20, location 15, category 15, support 15, academics 10). Each returns a plain-language sentence, not just a number. |
| **"Prefer not to say" that costs nothing** | Undisclosed answers become verification items worth half weight — the opportunity is never removed. |
| **Document Readiness Centre** | 15 document types, each with a plain-language explanation of *why* it is asked for, four statuses including "Needs renewal", and a 0–100 score. |
| **Renewal warnings** | The app treats an expiring certificate as a first-class problem, because in practice it is one. |
| **Prioritised next actions** | Missing documents before expiring ones, so the student always knows the single next thing to do. |
| **Printable action plan** | Scores, reasons, conditions to verify, document priorities, ordered steps, deadline warning, official link, disclaimer. Designed with a real print stylesheet. |
| **Side-by-side comparison** | Up to three schemes: a table on desktop, accessible stacked cards on mobile — never a table you have to scroll sideways to read. |
| **English / Hindi** | Navigation, forms, validation, match explanations, checklist statuses, warnings and empty states — with graceful fallback for untranslated strings. |
| **Offline-first PWA** | Installable; the entire workflow keeps working with no connection after the first load. |
| **Privacy panel** | An itemised inventory of exactly what is stored, plus confirmed one-click deletion. |
| **Dashboard** | Profile completion, best match, selected application, readiness, outstanding documents, next action. |

---

## Innovation

**1. Explainability as the product, not a feature.**
Most discovery tools return a ranked list. SaathiSetu returns a *reasoned* one, split into three
buckets a student can act on differently: what is confirmed, what they must verify, and what
clearly blocks them. The score is presented as a **preparation aid** and labelled as such
everywhere it appears.

**2. Uncertainty is modelled as a first-class state.**
Most eligibility filters are binary and therefore hostile: leave a field blank and you vanish
from the results. SaathiSetu has three outcomes — confirmed, needs verification, conflict — and
awards half weight for the middle one. This is what makes "Prefer not to say" genuinely safe,
and it is verified by a test asserting that an undisclosed answer always scores *above* a stated
conflict.

**3. Document readiness as the real bottleneck.**
Discovery is the visible problem; documentation is the one that actually stops applications.
Modelling "Needs renewal" separately from "Not available" — and weighting it at 0.5 — reflects
how these applications truly fail.

**4. Privacy achieved by data design, not by policy.**
The app cannot leak what it never collects. Bands instead of figures, no identity fields, no
file input anywhere in the codebase, no network requests at runtime. The privacy promise is a
property of the architecture, not a paragraph in a policy.

**5. Genuinely offline, genuinely low-cost.**
A hand-written ~100-line service worker, three runtime dependencies, and a fully static build.
It can be hosted free, forever, and works on the connection the target user actually has.

---

## Social impact

**Immediate:** more completed applications. A student who learns in September that they need a
domicile certificate has three months to get one. A student who learns at submission has none.

**The equity argument:** the students who most need financial support are the ones with the
least process support at home. SaathiSetu redistributes a piece of what a well-connected family
provides — someone who knows what to ask for and when.

**Dignity:** a student can explore what they might qualify for without disclosing their caste,
their disability or their family's income to anybody. That is not a technical nicety; it is the
difference between a tool people use and one they avoid.

**Reach multiplier:** a counsellor or NGO volunteer can run scholarship camps entirely offline
on one phone, producing a printed plan per student.

**Measurable outcomes** a pilot would track: applications completed vs. started; documents
obtained before the deadline rather than after; time from "I don't know" to "here is my plan".

---

## Responsible-design approach

We were deliberate about the ways a tool like this could do harm:

| Risk | How SaathiSetu handles it |
| --- | --- |
| **Being mistaken for an official portal** | Prototype disclaimers on the landing page, results page, every detail view and the printed plan. Never claims applications are open. |
| **A score read as a verdict** | Labelled a "preparation match" everywhere, with an explicit note that it is not an official eligibility decision. |
| **Silently excluding people** | Unknown and undisclosed answers never disqualify. Conflicting opportunities are still shown, flagged, because rules change and the portal is the authority. |
| **Coercing disclosure** | Only two of thirteen questions are required. Every sensitive question offers "Prefer not to say" with an on-screen explanation that choosing it costs nothing. |
| **Data exposure** | No account, no backend, no analytics, no third-party runtime requests, no uploads. One namespaced key, deletable in two clicks. |
| **Fabricated authority** | The dataset is labelled demonstration data in the code, in the UI and in every document. Each entry links to a real official portal. |
| **Excluding disabled users** | Semantic HTML, keyboard operability, visible focus, associated labels, announced errors, reduced-motion support, and status never conveyed by colour alone. |
| **Excluding low-end devices** | 310 KB of JavaScript, works at 360px, works offline, installable. |
| **Over-claiming in the write-up** | The README lists twelve genuine limitations, including that the Hindi translations have not been expert-reviewed and that accessibility has not been audited with real assistive technology. |

---

## Scalability

**Technical.** The app is fully static, so it scales to any number of users at effectively zero
marginal cost — a CDN serving 310 KB. All computation happens on the student's device. There is
no backend to fall over, no database to shard and no per-user cost.

**Data.** Opportunities are typed data objects, not code. Adding a scheme means adding an object
to `src/data/opportunities.ts` — the matching engine, filters, comparison, document checklists
and action plans all pick it up with no code change. Scaling from 14 to 1,400 schemes is a
content and curation problem, and the type system enforces that every field is present.

**Language.** Locales are flat key-value files with English fallback, so a new language can be
added incrementally and shipped while still partial, without a broken interface.

**Organisational.** The realistic scaling path is a curated public dataset with a documented
review cycle and a visible `lastVerified` date per entry — an editorial process, not more
infrastructure. Institutions can fork the repository and ship a version scoped to their own
State or campus.

---

## Technology stack

| Layer | Choice |
| --- | --- |
| UI | React 18, TypeScript 5 (strict) |
| Build | Vite 5 |
| Styling | Hand-written CSS with custom properties; dedicated print stylesheet |
| Icons | lucide-react |
| Testing | Vitest + React Testing Library — 77 tests, 5 files |
| Persistence | `localStorage` (single namespaced key) |
| Offline | Hand-written service worker + web app manifest |
| Deployment | Static; GitHub Pages / Netlify / Vercel configs included |

Runtime dependencies: **three** (`react`, `react-dom`, `lucide-react`).
No backend, no authentication, no database, no paid service, no external AI API, no API key, no
Tailwind.

---

## Short description (under 100 words)

SaathiSetu helps Indian students — especially first-generation learners — find the scholarships
worth applying for and actually get ready to apply. A short, private profile drives a
deterministic matching engine that explains every result: confirmed reasons, conditions to
verify, and definite conflicts. Each opportunity comes with a document checklist, renewal
warnings and a readiness score, ending in a printable action plan. Unanswered and "prefer not to
say" questions never disqualify anyone. No account, no uploads, no server — everything stays in
the browser, and it works offline. A guidance prototype using clearly labelled demonstration
data.

*(92 words)*

---

## Full description (under 500 words)

Every year, students who qualify for scholarships miss them — not through lack of merit, but
through process. Information is scattered across dozens of portals, eligibility is written in
official language, nobody says which certificate to obtain first, and an income certificate that
expired last month is enough to make an application incomplete. The students facing the most
process burden are the ones with the least help at home.

SaathiSetu turns that into four steps: describe your situation, see explained matches, get
document-ready, print your plan.

A five-step wizard collects only what is needed, in bands rather than figures: course level,
State, income range, marks range, and the kind of help required. Only two answers are mandatory.
Every sensitive question offers "Prefer not to say", and the interface explains that choosing it
costs nothing.

A deterministic rule-based engine scores each opportunity across six weighted factors —
education level (25), income (20), location (15), category eligibility (15), required support
(15) and academic performance (10). Its output is not a bare number. Every result is split into
confirmed matching reasons, conditions the student must verify, definite conflicts, and one
suggested next step, all rendered as plain sentences in English or Hindi. Unknown and undisclosed
answers produce a "needs verification" flag worth half weight — never a rejection — so nobody is
quietly filtered out for protecting their privacy. The percentage is labelled a preparation aid,
never an eligibility decision.

Results can be searched, sorted by match, name or document readiness, filtered, bookmarked, and
compared three at a time — a real table on desktop, accessible stacked cards on mobile.

The Document Readiness Centre is where the real bottleneck is addressed. For the chosen scheme
it builds a personalised checklist across fifteen document types, each with a plain-language
explanation of why it is asked for. Documents are marked Ready, Needs renewal, Not available or
Not applicable, producing a 0–100 readiness score, renewal warnings and a prioritised list of
what to collect first. Nothing is ever uploaded — the app has no file input at all.

The result is a printable one-page action plan: both scores, the confirmed reasons, the
conditions to verify before applying, document priorities in order, ordered next steps, a
deadline warning, the official link and a safety disclaimer.

Privacy is architectural rather than promised. No account, no backend, no database, no
analytics, no third-party runtime requests. Everything lives in one `localStorage` key that the
privacy panel itemises and deletes on request. As an installable PWA, the whole workflow keeps
working offline after the first load — on the connection the target user actually has.

It is built with React, TypeScript, Vite and hand-written CSS, with three runtime dependencies
and 77 automated tests. All fourteen scheme entries are clearly labelled demonstration data
linking to real official portals: SaathiSetu guides preparation; the official portal remains the
only authority.

*(469 words)*

---

## Future scope

**Near term (0–3 months)**

- Replace demonstration data with a curated, dated, source-linked dataset and a published review
  cycle, with a visible `lastVerified` date per scheme.
- Deadline reminders via local notifications — still with no server.
- Encrypted profile export and import so students can move devices without a backend.
- Marathi, Bengali and Tamil, using the existing partial-locale fallback.

**Medium term (3–12 months)**

- A community-maintained scheme dataset with a public review trail and contributor guidelines.
- Institution mode: a counsellor or NGO worker preparing plans for a cohort on a single device.
- State-specific guided walkthroughs for the certificates that block the most applications.
- A genuine accessibility audit conducted with assistive-technology users, and expert review of
  every Hindi string.

**Longer term (12 months+)**

- Optional integration with official APIs, where they exist, so eligibility can be confirmed
  rather than estimated — without weakening the privacy model.
- Low-bandwidth and SMS-based delivery for students without a smartphone.
- Impact measurement with partner institutions: applications *completed*, not merely started.
