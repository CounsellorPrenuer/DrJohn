# OSPA™ — Assumptions Log

## Meta-assumption (critical — read first)

This session began with **no specification documents attached** and **no prior
Milestone 1 code present on disk** (the build environment resets between
sessions and does not persist files). Everything below is reconstructed from
the working summary of the project (SSB / 15-OLQ framework, Officer Selection
Potential Assessment, Next.js/TypeScript/Prisma/PostgreSQL stack) rather than
from the original two spec documents. **Before this repo is treated as
authoritative, the actual spec PDFs should be diffed against this code.**

This environment also has **no network access**, so no npm packages could be
installed and no real `tsc`/`next build` could be run against actual
`@prisma/client`, `next-auth`, or Next.js types. Code is written to be
syntactically and structurally correct, but has not been machine-verified.
Run `npm install && npx prisma generate && npx tsc --noEmit && npm run build`
locally before deploying.

## Domain assumptions

1. **Framework**: SSB (Services Selection Board) 15-OLQ (Officer Like
   Qualities) model is used, grouped under the standard four factors:
   Factor I (Planning & Organising: Effective Intelligence, Reasoning
   Ability, Organising Ability, Power of Expression), Factor II (Social
   Adjustment: Cooperation, Sense of Responsibility, Initiative), Factor III
   (Social Effectiveness: Social Adaptability, Liveliness, Group
   Influencing Ability), Factor IV (Dynamic/Achieving: Determination,
   Courage, Stamina, Self-Confidence, Speed of Decision).
2. **Question bank ownership**: assumed proprietary to Dr. Chenetra /
   MENTORIA. Seed data ships with a small set of **original, non-placeholder**
   sample items per OLQ (enough to exercise the engine end-to-end) rather than
   a full licensed bank, since the real bank's copyright status is unknown.
   Flagged with a `isSeedSample: true` field so it's easy to bulk-replace.
3. **Scoring**: each response is scored 1–5 on the OLQs it maps to (many-to-many
   question→OLQ mapping with weights); factor scores are weighted averages;
   overall OSPA score is a weighted composite of the four factors (weights
   configurable in `lib/scoring-config.ts`, not hardcoded).
4. **Retake policy**: assumed one free attempt per assessment module, with
   paid retakes gated behind the paywall flag on `AssessmentAttempt`.
5. **Paywall**: assumed report generation (PDF) and detailed OLQ breakdown
   are gated; a summary-level result is free.

## Technical assumptions

6. **Auth.js strategy**: Credentials (email + password, bcrypt) as the
   primary provider plus Google OAuth as secondary. JWT session strategy
   (not DB sessions) for Vercel edge compatibility.
7. **Autosave**: client debounces every 5s and on blur; PATCH to
   `/api/assessments/[attemptId]/responses` upserts by `questionId`.
8. **Audit log**: append-only `AuditLog` table capturing actor, action,
   entity, diff (JSON), IP, timestamp — written from a single server-side
   helper (`lib/audit.ts`) so all API routes log consistently.
9. **PDF export**: Puppeteer renders a server-side HTML report route
   (`/reports/[attemptId]/print`) to PDF rather than a client library, for
   layout fidelity.
10. **Admin portal**: role-gated (`Role.ADMIN`) via middleware, not a
    separate app.
11. **Narrative generation**: template-based/deterministic (see
    `lib/narrative.ts`), not LLM-backed, to avoid an external API dependency
    and non-determinism in a scored report. Swappable later behind the same
    function signature.
12. **PDF rendering on Vercel**: `puppeteer-core` + `@sparticuz/chromium`
    (not full `puppeteer`) since Vercel's serverless functions can't ship a
    full Chromium binary within size limits. Locally, set
    `PUPPETEER_EXECUTABLE_PATH` to a local Chrome install, or the route falls
    back to `@sparticuz/chromium`'s bundled binary in both environments.

## Explicitly NOT done in this pass

- Full 19-model schema was not independently re-verified against a spec
  (spec unavailable); schema below covers the models needed for auth,
  assessment-taking, scoring, and reporting. Treat as v0.9 of the schema.
- No CI/CD, no test suite, no deployment config yet — sequenced for the
  next milestone once the schema is confirmed correct.
