# OSPA™ — Officer Selection Potential Assessment

A Next.js/TypeScript/Prisma/PostgreSQL platform for defence aspirants, built
for MENTORIA (oversimplify.in). Candidates take an OLQ-based self-assessment,
get an auto-scored Officer Development Report with a PDF export, and submit
feedback; admins get an audit-logged overview.

> **Read `ASSUMPTIONS.md` before anything else.** This repo was built without
> access to the original two specification documents (they were not
> re-attached to the session that produced this code), so the SSB/15-OLQ
> framework, question bank, retake policy, and paywall logic are
> **reconstructed and documented as assumptions, not confirmed against your
> spec.** Diff `ASSUMPTIONS.md` against your actual requirements before
> treating this as final.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js v5 · Zod · React Hook Form · Recharts · Puppeteer (`puppeteer-core` +
`@sparticuz/chromium` for Vercel) · Vitest

## What's in this repo

| Area | Status |
|---|---|
| Auth (Credentials + Google OAuth) | Done |
| Candidate dashboard | Done |
| Assessment engine (autosave, resume) | Done |
| OLQ scoring engine | Done, unit-tested |
| Officer Development Report + charts | Done |
| PDF export | Done |
| Feedback module | Done |
| Audit logging | Done |
| Admin portal | Done (overview + audit log only — no CRUD UI for question bank yet) |
| CI (GitHub Actions) | Done |
| Tests | 12 unit tests covering scoring, narrative, and PDF-HTML rendering |

**Not included:** integration/E2E tests, question-bank CRUD UI, multi-module
selection (only one seeded module, `core-olq-screener`), payment provider
integration (the `isPaid` flag exists on `AssessmentAttempt` but nothing sets
it yet — wire up your payment gateway's webhook to flip it).

## ⚠️ Verification status — read this before deploying

This repo was built in a sandboxed environment **with no network access**, so
`npm install`, `next build`, `tsc`, and `vitest` could never actually be run
here against the real packages. What *was* verified:

- Every `@/...` import resolves to a real file (scripted check).
- Every `prisma.<model>` call in the code matches a model in `schema.prisma`,
  correctly camelCased.
- Every scalar field in `schema.prisma` has a matching column in the hand-
  written SQL migration (scripted diff), and every `@@unique`/`@@index`
  matches the index type in that SQL.
- The scoring engine, narrative generator, and PDF-HTML renderer were run
  directly with Node's built-in TypeScript stripping against realistic
  fixtures — including the exact assertions in `tests/*.test.ts` — and all
  passed.

What was **not** verified: the Next.js pages/components (JSX/React logic),
Auth.js configuration, and Prisma client generation, because none of those
can be exercised without `npm install`. **Before deploying, your developer
must run the steps below and treat the first `npm run build` as the real
gate**, not this document.

## Setup

```bash
git clone <your-repo-url>
cd ospa
cp .env.example .env       # fill in DATABASE_URL, AUTH_SECRET, etc.
npm install
npx prisma migrate deploy  # applies prisma/migrations/20260713000000_init
npm run prisma:seed        # loads the 15 OLQs + sample question set
npm run dev
```

Generate `AUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### Environment variables

See `.env.example`. `DATABASE_URL` should be a pooled connection string if
you're on Neon/Supabase; `DIRECT_URL` is the non-pooled one Prisma migrate
needs. Google OAuth vars are optional — Credentials auth works without them.

### Running tests

```bash
npm test          # vitest — scoring engine, narrative generator, PDF HTML
npm run lint
npx tsc --noEmit
npm run build
```

## Deploying to Vercel

1. Push this repo to GitHub/GitLab.
2. Import into Vercel, set the environment variables from `.env.example`
   (use production values).
3. `vercel.json` is already configured to give the PDF-export route extra
   memory/duration (`puppeteer-core` + `@sparticuz/chromium` is sized for
   serverless — see `ASSUMPTIONS.md` #12).
4. On first deploy, run `npx prisma migrate deploy` against your production
   database (Vercel doesn't do this automatically) and then
   `npm run prisma:seed` once.
5. Point your domain (e.g. a subdomain of oversimplify.in) at the Vercel
   deployment.

## Project structure

```
prisma/
  schema.prisma          12 models: auth, OLQ/Module/Question, attempts,
                          responses, reports, feedback, audit log
  migrations/             hand-authored initial migration (see note above)
  seed.ts                 15 SSB OLQs + 1 module + 15 sample questions
src/
  app/
    api/                  all REST routes (auth, assessments, feedback, PDF)
    login/ register/      auth pages
    dashboard/             candidate home
    assessment/[id]/      assessment-taking UI with autosave
    report/[id]/          Officer Development Report + charts
    admin/                 admin overview
  components/              StartAssessmentButton, ReportCharts, FeedbackWidget
  lib/
    scoring.ts            pure OLQ scoring engine (unit-tested)
    narrative.ts           deterministic report narrative (unit-tested)
    reportHtml.ts           PDF report HTML renderer (unit-tested)
    auth.ts / prisma.ts / audit.ts / useAutosave.ts
  middleware.ts            route protection + admin role gating
tests/                     vitest suite (12 tests, all passing against source)
.github/workflows/ci.yml   lint, typecheck, migrate, seed, test, build
```

## Known gaps to close before go-live

1. **Confirm the OLQ framework and question bank against your actual spec.**
   The seeded question bank is a minimal sample (1 question per OLQ) meant
   to exercise the pipeline, not a real assessment — see
   `ASSUMPTIONS.md` #1–2.
2. **Run the real build.** `npm install && npm run build` has not executed
   anywhere in this repo's history yet.
3. **Wire up payment.** `isPaid` exists but nothing sets it.
4. **Decide on narrative generation.** Currently template-based/deterministic
   (`lib/narrative.ts`) rather than LLM-generated — intentional for
   determinism and cost, but flag if you want it richer.
5. **Load-test the PDF route** — Puppeteer-in-serverless is the most fragile
   part of this stack; confirm cold-start latency is acceptable on your
   Vercel plan.
