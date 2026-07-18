# OSPA™ — Static Site (GitHub Pages version)

Pure HTML/CSS/JS, no build step, no backend, no dependencies beyond one CDN
script (jsPDF). Deployable directly to GitHub Pages.

## What this is

This is a **deliberately reduced** version of the full-stack OSPA™ platform,
built specifically to run as static files with no server. It is the right
choice if you want a free, zero-maintenance hosted assessment tool and are
okay with the tradeoffs below. It is a different product from the Next.js
version, not a repackaging of it — read this whole section before deploying.

### What's different from the full-stack version, and why

| | Full-stack version | This static version |
|---|---|---|
| Hosting | Vercel (needs a server) | GitHub Pages (static only) |
| Accounts | Real login (Auth.js) | None — candidate types their name, no password |
| Data storage | PostgreSQL, visible to admins | Browser `localStorage` only, on that one device |
| Record of results | Database row + downloadable PDF | **The downloaded PDF is the only record.** If the candidate doesn't download it, the result is only in that browser until cleared. |
| Multi-device / admin visibility | Yes | No — there is no way to see anyone's results except the candidate on their own device |
| PDF generation | Server-side Puppeteer | Client-side jsPDF (simpler layout, no charts, but works entirely offline once loaded) |
| Audit log, feedback module | Yes | Not included — no backend to store them |

This tradeoff was chosen deliberately: **no account system + PDF-as-record**
was the explicit direction given for this build. If you later want real
accounts, cross-device history, or an admin view of all candidates, you need
a backend again — either the original Next.js repo, or a free BaaS (e.g.
Supabase/Firebase) bolted onto this same frontend.

## Files

```
index.html    all three screens (welcome, assessment, report) in one page
styles.css    dark theme, no framework
engine.js     OLQ data + scoring engine + narrative generator (ported 1:1
              from the full-stack version's lib/scoring.ts and
              lib/narrative.ts — verified to produce identical numbers)
app.js        screen routing, localStorage autosave/resume, PDF export
```

No `package.json`, no `node_modules`, nothing to install. The only external
dependency is loaded via CDN in `index.html`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

## What I actually tested (and how)

I don't have a browser in this environment, so I built a minimal fake DOM in
Node (`document.getElementById`, `classList`, `innerHTML` parsing, event
listeners, `localStorage`) and ran the **real** `engine.js` + `app.js`
against it end-to-end:

- Boot → welcome screen shown, assessment/report hidden ✓
- Submit welcome form → assessment screen shown, 75 buttons rendered (15
  questions × 5 options) ✓
- Click through all 15 questions → progress reaches "15 / 15 answered" ✓
- Submit → scores computed correctly (verified exact numbers), report screen
  shown, narrative generated ✓
- Download PDF → real `jsPDF` calls fire, correct filename pattern, 49 lines
  of content generated ✓
- Partial progress (5 of 15 answered) → autosaves to `localStorage` after
  the 500ms debounce with the correct partial data ✓

I also scripted a check that every `getElementById` call in `app.js` matches
a real `id` in `index.html` (22/22 matched) and that every toggled CSS class
exists in `styles.css`.

**What this does NOT prove:** actual rendering/CSS layout in a real browser,
cross-browser `localStorage` quirks, or that the jsPDF CDN version pinned
here is still live (I can't reach the internet from this environment to
confirm the CDN URL resolves). Open `index.html` directly in a browser
before publishing and click through it once yourself — that's the one check
I couldn't do for you.

## Deploying to GitHub Pages

1. Create a new GitHub repo (or a folder in an existing one) and add these
   four files (`index.html`, `styles.css`, `engine.js`, `app.js`) to the
   repo root — or to a `/docs` folder if you'd rather keep it alongside
   other content.
2. Push to GitHub.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick the branch (usually `main`) and the folder (`/root` or `/docs`,
   matching where you put the files).
6. Save. GitHub will publish at `https://<username>.github.io/<repo>/`
   within a minute or two.
7. To use it under oversimplify.in instead of the github.io URL, add a
   `CNAME` file to the repo root containing your subdomain (e.g.
   `assessment.oversimplify.in`), and point that subdomain's DNS at GitHub
   Pages per [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

No build command, no environment variables, no database to provision.

## Known gaps / next steps

1. **No cross-device or admin visibility.** If MENTORIA needs to see
   candidate results centrally, this version can't do that — you'd need a
   backend (the original Next.js repo, or wiring a free BaaS into this
   frontend).
2. **PDF is the only record.** Make sure the UI's messaging about this is
   clear to candidates (it currently says so on both the welcome and report
   screens) — if they close the tab without downloading, the result is only
   recoverable if they didn't clear `localStorage` on that same browser.
3. **Question bank is the same 15-sample-question set** as the full-stack
   version — see the original repo's `ASSUMPTIONS.md` for the note that this
   OLQ framework and question set are reconstructed, not verified against
   your original spec.
4. **CDN dependency.** If cdnjs.cloudflare.com is ever blocked in a
   candidate's environment, PDF export will fail (the rest of the app still
   works). Consider vendoring `jspdf.umd.min.js` into the repo directly if
   that's a concern.
