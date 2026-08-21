# Plan 003: Repo hygiene — README, gitignore, leftover file, stale docs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, `?? package.json`, …).
> Compare the "Current state" excerpts below directly against the working
> tree; on any mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (ideally lands before the owner's first product commit,
  so it ships in that commit)
- **Category**: docs / dx / tech-debt
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

Three hygiene problems compound into real cost:

1. `README.md` is empty (1 byte) while `CONTRIBUTING.md` instructs
   contributors to "Install the reviewed Pi pin from `README.md`" — a broken
   reference on the repo's front door.
2. A leftover audit script `tmp_audit.mjs` sits at the repo root with a
   machine-specific hardcoded Playwright path; `.astro/` (generated TS
   output) is untracked but not gitignored, so every `git status` is noisy.
3. The decision docs have drifted from code: `docs/ARCHITECTURE.md` and
   `docs/DESIGN.md` still say the portrait asset is "not yet rendered", but
   `src/pages/index.astro` and `src/pages/about.astro` now render it via
   `astro:assets <Image>`. Stale decision docs are worse than missing ones —
   future contributors can't trust them.

## Current state

- `README.md` — 1 byte, effectively empty. Verified: `wc -c README.md` → `1`.
- `CONTRIBUTING.md` line ~9: "Install the reviewed Pi pin from `README.md`."
- `tmp_audit.mjs` at repo root — an ad-hoc Playwright screenshot sweep;
  contains `executablePath: '/home/danial/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'`
  (machine-specific) and duplicates coverage the browser-QA skill provides.
  It is untracked (`?? tmp_audit.mjs` in `git status`).
- `.gitignore` has a section "# Build, test, browser, and framework output"
  listing `dist/`, `.next/`, `.vite/` etc. — but NOT `.astro/`. `git status`
  shows `?? .astro/`.
- Stale doc lines (verbatim):
  - `docs/ARCHITECTURE.md:35`: `| Assets | \`Assets/Danial_photo.webp\` preserved (855×855, 86K) not yet rendered; future optimization via \`astro:assets\` only when page uses it | Satisfies brief "optimize only when introduced" | When portrait added to About/Home |`
  - `docs/DESIGN.md:70`: `... portrait (Assets/Danial_photo.webp 855×855) preserved, not yet rendered; ...`
  - `docs/DESIGN.md:151`: `- Portrait rendering optimization (preserved, not yet rendered)`
- Code reality: `src/pages/index.astro:4` imports
  `portraitSrc from "../../Assets/Danial_photo.webp"` and renders
  `<Image src={portraitSrc} widths={[320,480,640]} …>`; same pattern in
  `src/pages/about.astro`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run check` | exit 0, 0 errors |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope**:
- `README.md` (rewrite)
- `.gitignore` (one line)
- `tmp_audit.mjs` (delete from disk; it is untracked)
- `docs/ARCHITECTURE.md` line 35 row (update)
- `docs/DESIGN.md` lines 70 and 151 bullets (update)

**Out of scope** (do NOT touch):
- Any file under `src/`, `public/`, `scripts/`, `.pi/`, `.github/`.
- `docs/PRODUCT.md` / `docs/PLAN.md` templates (owner's call whether to fill).
- The DESIGN.md focus-trap claim (line 129) — owned by plans/004.
- Git staging/committing — owner-controlled.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Remove the leftover audit script

```bash
rm tmp_audit.mjs
```

**Verify**: `test ! -f tmp_audit.mjs && echo gone` → `gone`

### Step 2: Ignore generated Astro output

In `.gitignore`, inside the "# Build, test, browser, and framework output"
section (alongside `dist/`), add one line:

```
.astro/
```

**Verify**: `grep -n "^\.astro/$" .gitignore` → one match; `git status --short | grep .astro` → no output.

### Step 3: Write a real README

Replace `README.md` with the content below. It documents only what was
verified during recon — do not embellish.

```markdown
# imdanialrashidi.github.io

Personal credibility site for Danial Rashidi — Software & Product Builder.
Static [Astro](https://astro.build) site deployed to GitHub Pages at
<https://imdanialrashidi.github.io>.

## Requirements

- Node.js ≥ 22.19.0 (CI pins 22.23.2)

## Quick start

    npm ci          # or: bash scripts/ci-install.sh
    npm run dev     # dev server
    npm run build   # static build → dist/
    npm run preview # serve dist/ on :4321

## Verification

    npm run check           # astro check (types + content schema)
    npm run build           # must succeed
    bash scripts/verify.sh  # full gate: harness doctor + tests + check + build

This repository also carries an agent-harness layer (`.pi/`, `scripts/`,
`tests/`, `evals/`) with its own operating rules — see `AGENTS.md`,
`CONTRIBUTING.md`, and `SECURITY.md` before touching workflow files.

## Site structure

- `src/pages/` — routes: `/`, `/work`, `/work/fast-english`, `/work/noveno`,
  `/about`, `/now`, `/contact`, 404
- `src/components/` — header/footer/theme toggle, project cards,
  case-study blocks (`case-study/`)
- `src/data/site.ts` — single source for site title, description, social
  links, navigation
- `src/content/projects/*.md` — typed project collection (schema in
  `src/content.config.ts`)
- `src/styles/tokens.css` — semantic design tokens (light/dark);
  `global.css` — reset + utilities
- `public/fonts/` — self-hosted Geist / Geist Mono variable woff2

## Deployment

GitHub Pages. See `docs/exec-plans/active/premium-personal-brand.md` for the
active rollout plan and `docs/ARCHITECTURE.md` for deployment decisions.
```

**Verify**: `wc -c README.md` → >1000 bytes; `grep -c "npm run" README.md` → ≥3.

### Step 4: Sync the three stale doc statements

Update each line to reflect shipped reality (keep table/bullet formatting):

- `docs/ARCHITECTURE.md:35` — replace the Assets row's middle cell text
  "preserved (855×855, 86K) not yet rendered; future optimization via
  `astro:assets` only when page uses it" with:
  "rendered on Home and About via `astro:assets <Image>` (responsive
  `widths=[320,480,640]`, eager above fold)". Leave the other two cells'
  intent intact, updating "Revisit when" to "Done — revisit if portrait
  treatment changes".
- `docs/DESIGN.md:70` — change "preserved, not yet rendered" to "rendered on
  Home/About via `astro:assets`".
- `docs/DESIGN.md:151` — move/annotate: "- ~~Portrait rendering
  optimization~~ — delivered: rendered via `astro:assets <Image>` on Home +
  About". Keep it as a struck-through deferred item so history stays clear.

**Verify**:
```bash
grep -n "not yet rendered" docs/ARCHITECTURE.md docs/DESIGN.md
```
→ no matches for the *portrait* claims (line 129's focus-trap wording may
still match "trapped"; that is plan 004's target — leave it).

### Step 5: Confirm nothing broke

```bash
npm run check && bash scripts/verify.sh
```

**Verify**: both exit 0.

## Test plan

Docs-only change; regression proof is Step 5's full gate plus `git status`
showing exactly the five in-scope paths touched (README.md, .gitignore,
tmp_audit.mjs deletion, ARCHITECTURE.md, DESIGN.md).

## Done criteria

ALL must hold:

- [ ] `tmp_audit.mjs` absent
- [ ] `.astro/` ignored; `git status --short` no longer lists it
- [ ] `README.md` contains requirements, quick start, verification,
      structure, deployment sections (greppable via headings)
- [ ] No portrait "not yet rendered" statements remain in ARCHITECTURE.md /
      DESIGN.md
- [ ] `bash scripts/verify.sh` exits 0
- [ ] No out-of-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `tmp_audit.mjs` has been modified since this plan (it should be byte-for-byte
  the recon'd screenshot script); if its content changed to something the
  owner clearly wants kept, report instead of deleting.
- CONTRIBUTING.md no longer references `README.md` (the reference this plan
  satisfies disappeared).
- `npm run check` fails — unrelated breakage; report, do not fix here.

## Maintenance notes

- After the owner's first product commit, add a CI badge for `quality` (and
  later `deploy`) to the README if wanted — deferred to keep this diff
  docs-only.
- `docs/PRODUCT.md` and `docs/PLAN.md` remain unfilled templates by owner
  choice; revisit when product direction needs recording.
- Reviewer scrutiny: README claims must stay true — any new top-level script
  or route should update it in the same PR.
