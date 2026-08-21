# Plan 006: Single-source all contact/social data through `src/data/site.ts`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, …). Compare the "Current
> state" excerpts below directly against the working tree; on any mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (maintainability)
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The email address appears as a hardcoded literal in **8 files**, and social
URLs/handles in several more, even though `src/data/site.ts` exists precisely
to be the typed single source ("Keeps data separate from presentation" —
ARCHITECTURE.md chosen patterns). Changing an email or fixing a handle today
means hunting literals across the repo — and the owner's own active plan
(`docs/exec-plans/active/premium-personal-brand.md` §3 Q3) flags that the X
handle spelling (`imdaniarshidi` vs `imdanialrashidi`) is a known risk.
Single-sourcing turns that class of error into a one-line edit.

## Current state

The canonical source — `src/data/site.ts` (verbatim, complete):

```ts
export const site = {
  title: "Danial Rashidi — Software & Product Builder",
  shortTitle: "Danial Rashidi",
  description: "…",
  url: "https://imdanialrashidi.github.io",
  author: "Danial Rashidi",
  locale: "en_US",
  language: "en",
} as const;

export const social = {
  github: "https://github.com/imdanialrashidi",
  x: "https://x.com/imdaniarshidi",
  xHandle: "@imdaniarshidi",
  instagram: "https://instagram.com/imdanialrashidi",
  instagramHandle: "@imdanialrashidi",
  telegram: "https://t.me/imdanialrashidi",
  telegramHandle: "@imdanialrashidi",
  email: "imdanialrashidi@gmail.com",
  noveno: "https://noveno.ir",
} as const;
```

Hardcoded duplicates to eliminate (all verified at HEAD working tree):

| File | Line(s) | What's hardcoded |
|---|---|---|
| `src/layouts/Layout.astro` | 69–75 | JSON-LD `sameAs` array (github/x/instagram/telegram/noveno URLs) + `email: "mailto:…"` |
| `src/components/Header.astro` | 88 | mobile-nav mailto href + display text |
| `src/components/Footer.astro` | 23 | mailto href + display text (Footer already imports `social`) |
| `src/pages/index.astro` | 81 | hero GitHub button href |
| `src/pages/index.astro` | 96 | hero meta noveno link |
| `src/pages/index.astro` | 286–287 | CTA mailto href + display text |
| `src/pages/index.astro` | 293 | CTA secondary GitHub link |
| `src/pages/about.astro` | 104 | prose link to noveno |
| `src/pages/about.astro` | 146–149 | aside GitHub / X / mailto / noveno links |
| `src/pages/contact.astro` | 28–30 | primary email card href + display text (contact already imports `social`) |
| `src/pages/contact.astro` | 37, 42–43, 47, 64, 68 | display texts `github.com/…`, `x.com/…`, `@imdaniarshidi`, `noveno.ir ↗`, `instagram.com/…`, `t.me/…` |
| `src/pages/404.astro` | 24 | mailto href + display text |
| `src/pages/now.astro` | 43 | prose link to noveno |

Current import lines (extend these, don't restructure):
- `Layout.astro:5` → `import { site } from "../data/site.ts";`
- `Header.astro:2` → `import { navigation } from "../data/site.ts";`
- `Footer.astro:2` and `contact.astro:3` → already `import { social } …`
- `index.astro`, `about.astro`, `404.astro`, `now.astro` → no site.ts import yet

Repo conventions: TypeScript strict; named imports from `../data/site.ts`
(or `../../data/site.ts` from pages one level deeper); JSX-style expressions
in Astro templates use `{expr}`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope** (only these files):
- `src/data/site.ts` — NO changes needed unless a value is missing (it isn't)
- `src/layouts/Layout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/pages/index.astro`
- `src/pages/about.astro`
- `src/pages/contact.astro`
- `src/pages/404.astro`
- `src/pages/now.astro`

**Out of scope** (do NOT touch):
- `src/pages/work/*.astro` case-study bodies — editorial prose where links
  are content, not chrome; churn outweighs benefit.
- `src/components/case-study/*` — including the ArchitectureDiagram SVG
  caption text mentioning github.com (descriptive prose inside artwork).
- Any change to rendered output beyond the identical strings now coming from
  imports — this is a pure refactor: **zero visual diff**.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Extend imports where missing

- `Layout.astro:5`: `import { site, social } from "../data/site.ts";`
- `Header.astro:2`: `import { navigation, social } from "../data/site.ts";`
- Add to frontmatter of `index.astro`, `about.astro`, `404.astro`,
  `now.astro`: `import { social } from "../../data/site.ts";` (pages live in
  `src/pages/`, so two levels up).
- `Footer.astro` and `contact.astro`: nothing to add.

**Verify**: `npm run check` → exit 0 (unused-import would be flagged by
editor tooling later; every import gets used in Steps 2–4).

### Step 2: Replace href literals with imported values

Pattern per occurrence (keep all classes/targets/rels exactly as-is):

- Mailto hrefs → `` href={`mailto:${social.email}`} ``
- Display email text → `{social.email}`
- GitHub/X/Instagram/Telegram/noveno hrefs → `{social.github}`, `{social.x}`,
  `{social.instagram}`, `{social.telegram}`, `{social.noveno}`
- JSON-LD in `Layout.astro` — replace the literal array elements:

```astro
      sameAs: [
        social.github,
        social.x,
        social.instagram,
        social.telegram,
        social.noveno,
      ],
      email: `mailto:${social.email}`,
```

Apply at every row of the Current-state table (Step list mirrors it exactly;
about.astro:104 and now.astro:43 are inline prose `<a>` tags — swap only the
href expression).

**Verify**:
```bash
grep -rn "imdanialrashidi@gmail.com\|https://noveno\.ir\|https://github.com/imdanialrashidi\|https://x.com/\|https://instagram.com/\|https://t.me/" src/ --include="*.astro" | grep -v "src/data/site.ts" | grep -v "src/pages/work/" | grep -v "case-study/"
```
→ expected: **no matches** (all remaining literals live in site.ts, work
pages, or case-study components).

### Step 3: Replace display-text literals with derived expressions

Where text shows a URL/handle, derive it so the source stays singular:

- `x.com/imdaniarshidi` → `{social.x.replace("https://", "")}`
- `@imdaniarshidi` → `{social.xHandle}`
- `github.com/imdanialrashidi` → `{social.github.replace("https://", "")}`
- `instagram.com/imdanialrashidi` → `{social.instagram.replace("https://", "")}`
- `t.me/imdanialrashidi` → `{social.telegram.replace("https://", "")}`
- `noveno.ir ↗` → `{social.noveno.replace("https://", "")} ↗` (keep the ↗
  glyph outside the expression exactly where it is today)

**Verify**: `npm run build` → exit 0.

### Step 4: Prove zero visual/HTML diff

```bash
npm run build && grep -o 'mailto:[^"]*' dist/index.html dist/contact/index.html dist/404.html | sort -u
grep -o 'x.com/imdaniarshidi' dist/contact/index.html | head -1
node -e "const h=require('fs').readFileSync('dist/index.html','utf8'); const m=h.match(/application\/ld\+json[^>]*>([^<]+)</); const j=JSON.parse(m[1]); console.log(j.sameAs.length, j.email)"
```

Expected: mailto addresses present and correct; `x.com/imdaniarshidi` still
rendered in the contact card; JSON-LD prints `5 mailto:imdanialrashidi@gmail.com`.

### Step 5: Full gate

```bash
bash scripts/verify.sh
```

**Verify**: exit 0.

## Test plan

Pure refactor — proof is identity of built HTML (Step 4) plus full gate.
No new tests; the grep in Step 2 acts as the standing regression check and
can be promoted into a test later (see Maintenance notes).

## Done criteria

ALL must hold:

- [ ] Step 2's grep returns zero matches outside allowed exclusions
- [ ] Built HTML byte-equivalent for all contact strings (Step 4 checks pass)
- [ ] JSON-LD still contains 5 sameAs entries + mailto email
- [ ] `bash scripts/verify.sh` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Any excerpt/table row doesn't match the working tree (drift — e.g. someone
  already partially migrated).
- A required value is missing from `site.ts` (there are none today; adding
  new values is a scope change — report first).
- Built HTML differs anywhere beyond whitespace in the touched expressions.

## Maintenance notes

- Future contact changes become a one-line edit in `src/data/site.ts`.
- If desired later, promote Step 2's grep into a permanent test under
  `tests/` (node:test style like `tests/verify-affected.test.mjs`) — out of
  scope here to keep this a pure refactor.
- Reviewer scrutiny: confirm `rel="me noopener noreferrer"` attributes were
  preserved verbatim on every touched anchor.
