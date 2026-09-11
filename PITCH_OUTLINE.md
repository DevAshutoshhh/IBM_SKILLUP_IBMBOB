# SaathiSetu — Pitch Deck Outline

Seven slides. Content is written to be used as-is; speaker notes are what you actually say.
Keep every slide under 40 words of on-screen text — the slide supports you, it does not replace
you.

---

## Slide 1 — The Problem

### Headline
**She qualifies for three scholarships. She'll get none of them.**

### On-screen content
- Information scattered across dozens of separate portals
- Eligibility written in official language nobody translates
- Document requirements discovered at submission, not before
- Expired certificates quietly disqualify complete applications
- Deadlines pass with no warning
- Preparation demands identity numbers before it demands anything else

### Visual
One student, six browser tabs, one blank form. Or a single stark statistic if you have a sourced
one — do **not** invent a number.

### Speaker notes (~35 s)
"This is a Class 12 student, first in her family to get this far. She qualifies for at least
three schemes and she'll receive nothing — not because of her marks, but because the process
assumes someone at home already knows how it works. The students facing the most process are the
ones with the least help. That's the problem we're solving."

---

## Slide 2 — The Solution

### Headline
**SaathiSetu — turn eligibility confusion into a clear action plan**

### On-screen content
*saathi* (companion) + *setu* (bridge)

1. **Describe** your situation — five short, private steps
2. **See** matches that explain themselves
3. **Get** document-ready with a prioritised checklist
4. **Print** a plan you can carry

> Guidance tool. Not an official portal. Not an eligibility decision.

### Visual
The four-step flow, left to right, with a real screenshot under each step.

### Speaker notes (~30 s)
"SaathiSetu is a bridge between a student and the support she's already entitled to. Four steps.
The important word is *explain* — we don't hand back a ranked list, we hand back reasons. And we
say plainly, on every screen, that this is guidance and the official portal is the authority."

---

## Slide 3 — User Journey

### Headline
**From "I don't know" to "here is my plan" in under five minutes**

### On-screen content
| Step | What she does | What she gets |
| --- | --- | --- |
| **Profile** | 5 steps, only 2 required, bands not figures | Nothing sensitive collected |
| **Matches** | 14 schemes ranked | Confirmed reasons · to verify · conflicts |
| **Compare** | Up to 3 side by side | Match, income, documents, readiness, deadline |
| **Documents** | Mark what she has | Readiness score + prioritised next actions |
| **Plan** | One click | Printable page with the official link |

**Every sensitive question offers "Prefer not to say" — and choosing it never removes an
opportunity.**

### Visual
Five screenshots in sequence. Circle the "Prefer not to say" option in red.

### Speaker notes (~35 s)
"Five steps, only two of them required. Income as a band, never a figure. Then explained
matches, a comparison, and the part that actually decides outcomes: the document checklist. She
walks away with a printed page. And the line at the bottom is the one that makes this safe to
use — declining to state your caste or disability costs you nothing here."

---

## Slide 4 — Innovation

### Headline
**Three things nobody else does**

### On-screen content

**1. Uncertainty is a first-class state**
Confirmed · Needs verification · Conflict — not a binary filter. Unknown answers score half
weight, never zero. Nobody is silently dropped for protecting their privacy.

**2. Explainability *is* the product**
Every percentage decomposes into plain-language reasons in English or Hindi. A score with no
reasoning is an oracle, not guidance.

**3. Document readiness, because that's the real bottleneck**
"Needs renewal" modelled separately from "Not available" — because an expired income certificate
is the most preventable cause of failure.

### Visual
A screenshot of an expanded match explanation, with the three groups labelled.

### Speaker notes (~40 s)
"Most eligibility tools are binary: leave a field blank and you disappear from the results.
That's hostile to exactly the students we're building for. We have three outcomes, and the middle
one — needs verification — is what makes 'prefer not to say' genuinely safe. We have a test that
asserts an undisclosed answer always scores above a stated conflict. Second, we explain every
number. Third, we take documents seriously, because discovery is the visible problem and
documentation is the one that actually stops applications."

---

## Slide 5 — Technology

### Headline
**Three runtime dependencies. No backend. Works offline.**

### On-screen content
- **React 18 · TypeScript (strict) · Vite 5 · hand-written CSS**
- **Deterministic rule engine** — 6 weighted factors summing to 100; same input, same output,
  every time
- **`localStorage` only** — one namespaced key; no server, no database, no auth, no analytics
- **Installable PWA** — hand-written service worker; full workflow offline after first load
- **77 automated tests** across matching, readiness, storage, i18n and end-to-end UI flows
- **310 KB JS · works at 360px · static hosting**

> Privacy is architectural: the app cannot leak what it never collects.

### Visual
The architecture diagram: Browser → React app → `localStorage`. No arrow leaves the box. That is
the whole point of the slide.

### Speaker notes (~35 s)
"There's no server in this diagram, and that's deliberate. Bands instead of figures, no identity
fields, no file input anywhere in the codebase, no runtime network requests. The privacy promise
isn't a policy paragraph — it's a property of the architecture. The matching engine is
deterministic and fully unit-tested; nothing here is a black box."

---

## Slide 6 — Impact and Scalability

### Headline
**Three months of warning, at zero marginal cost**

### On-screen content

**Impact**
- Learning in September that you need a domicile certificate gives you three months.
  Learning at submission gives you none.
- Redistributes what a well-connected family provides: someone who knows what to ask for, and
  when.
- Explore eligibility without disclosing caste, disability or income to anyone.
- One counsellor can run an offline scholarship camp from a single phone.

**Scalability**
- Static build → any number of users, effectively zero marginal cost
- Schemes are **typed data**, not code — 14 to 1,400 is curation, not engineering
- Locales are flat files with fallback — ship a language while it is still partial
- Institutions can fork and scope it to their own State or campus

**Measure:** applications *completed*, not started.

### Visual
Split slide: impact left, scalability right. A single strong photograph, or none at all.

### Speaker notes (~35 s)
"The impact claim is narrow and honest: we give students time. Adding schemes doesn't require an
engineer — the type system enforces every field, and the whole app picks up a new entry
automatically. And because it's static and offline-capable, the cost of reaching the next ten
thousand students is a CDN bill of essentially nothing."

---

## Slide 7 — Roadmap and Close

### Headline
**What's real today, and what's next**

### On-screen content

**Working now**
Full workflow · 14 demonstration schemes · 15 document types · English + Hindi · offline PWA ·
printable plan · 77 tests passing

**Honest limitations**
Demonstration data, not a live feed · rule-based, not semantic · no sync between devices · no
deadline reminders · Hindi not yet expert-reviewed · accessibility not yet audited with
assistive-technology users

**Next**
Curated source-linked dataset with review dates → local deadline reminders → encrypted profile
export → Marathi, Bengali, Tamil → institution mode → optional official-API integration

### Closing line
**A student who finds out in September has three months. A student who finds out at submission
has none. SaathiSetu is that three months.**

### Speaker notes (~30 s)
"We're listing our limitations on the slide because a tool that gives students confidence has to
earn it. The data is illustrative today; the architecture for real data is already there. The
roadmap is a curation problem, not a rebuild. And the closing thought is the whole project:
time is the thing these students are missing, and time is what we give them."

---

## Delivery notes

- **Total speaking time: about 4 minutes.** If you have 3, cut Slide 3 to a single sentence and
  compress Slide 6.
- **Lead with the student, not the stack.** Slide 5 is proof, not the pitch.
- **Say "prototype" and "demonstration data" out loud at least once.** Judges trust teams that
  state their limits before being asked.
- **Anticipated questions:**
  - *"How do you keep scheme data current?"* → Curated dataset with a visible `lastVerified` date
    per entry and a published review cycle. Today it is illustrative and labelled as such.
  - *"Why no backend?"* → Because the privacy promise has to be architectural. The trade-off is
    no sync, and we list that as a limitation.
  - *"Isn't the score misleading?"* → It is labelled a preparation aid everywhere it appears, and
    it always ships with its reasoning. We never present it as an eligibility decision.
  - *"Why not use an LLM to read scheme notifications?"* → Because a student needs a deterministic
    answer they can check. Our engine explains every point it awards. Extraction is a plausible
    future step for building the dataset — not for deciding a student's result.
