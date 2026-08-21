# Plan 009: Remove dead reveal-animation scaffolding from ProjectFeature

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

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (dead code)
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

`src/components/ProjectFeature.astro` carries scaffolding for a scroll-reveal
animation that was never built:

- The root `<article>` gets a `data-reveal` attribute…
- …a CSS block styles `[data-reveal] { opacity: 1; }` "default visible if JS
  disabled"…
- …but no JavaScript anywhere references `data-reveal` (verified: repo-wide
  grep finds only these two sites; there is no IntersectionObserver in the
  codebase).

So the attribute and block are pure noise — they suggest an animation exists,
mislead readers, and would silently do nothing even if someone "fixed" the
CSS. An adjacent empty rule (`.pf:hover .pm { /* … */ }`) is likewise dead.
The design contract (`docs/DESIGN.md` motion section) specifies restrained
state transitions only — a scroll-reveal was never accepted, so removal (not
implementation) is the correct direction.

## Current state

All excerpts from `src/components/ProjectFeature.astro` at the audited
working tree:

Line 22 — the attribute:

```astro
<article class:list={["pf", reversed && "pf--reversed", variant === "accent" && "pf--accent"]} data-reveal>
```

Lines ~293–301 — end of the `<style>` block (verbatim, including comments):

```css
  /* reveal motion — CSS only, respects reduced-motion via token */
  [data-reveal] {
    opacity: 1; /* default visible if JS disabled */
  }

  /* subtle hover media zoom for polish */
  .pf:hover .pm { /* via custom element selector - affect inner ProjectMedia */
    /* no direct; but we can add subtle transform via container */
  }
</style>
```

Repo-wide reference check (already performed): `grep -rn "data-reveal" src/`
→ only lines 22 and 295 of this file. No script queries it; Astro scopes the
component CSS; `[data-reveal] { opacity: 1 }` is a no-op (default opacity is
already 1).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope**:
- `src/components/ProjectFeature.astro` — remove the three dead pieces

**Out of scope** (do NOT touch):
- Any other component or page.
- Implementing an actual scroll-reveal (not part of the accepted design
  contract; if the owner wants one later, that's a new plan with its own
  reduced-motion contract).
- `ProjectMedia.astro`'s `data-media` attribute — different attribute;
  leave it alone.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Remove the `data-reveal` attribute

Edit line 22 to:

```astro
<article class:list={["pf", reversed && "pf--reversed", variant === "accent" && "pf--accent"]}>
```

### Step 2: Remove the dead CSS blocks

Delete everything from the comment `/* reveal motion — CSS only… */` through
the closing brace of the `.pf:hover .pm { … }` rule, leaving the `<style>`
block to end directly with the preceding media query's closing brace and
`</style>`. Resulting tail of the style block:

```css
  @media (max-width: 480px) {
    .pf { padding: 12px; border-radius: var(--radius-lg); }
    .pf__kicker { font-size: 10px; max-width: 22ch; }
  }
</style>
```

### Step 3: Verify nothing references what was removed and output is unchanged

```bash
grep -rn "data-reveal" src/ dist/ 2>/dev/null   # after rebuild: no matches
grep -n "\.pf:hover \.pm" src/components/ProjectFeature.astro   # no matches
npm run check && npm run build
```

Then confirm the rendered article markup is identical apart from the removed
attribute:

```bash
grep -o '<article class="pf[^>]*' dist/index.html | head -2
```

Expected: `<article class="pf">` / `<article class="pf pf--reversed">`-style
output with no `data-reveal`.

### Step 4: Full gate

```bash
bash scripts/verify.sh
```

**Verify**: exit 0.

## Test plan

Removal of a provably inert attribute + two no-op rules. Proof = greps
(Step 3), successful build, full gate. Visual behavior cannot change: the
attribute carried no styles beyond `opacity: 1` (the default) and the hover
rule had an empty body.

## Done criteria

ALL must hold:

- [ ] `grep -rn "data-reveal" src/` → no matches
- [ ] Empty `.pf:hover .pm` rule gone; style block ends cleanly after the
      480px media query
- [ ] `npm run check` exits 0; `bash scripts/verify.sh` exits 0
- [ ] Built HTML contains no `data-reveal`
- [ ] No other file modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A grep reveals `data-reveal` referenced by any script, extension, or test
  that appeared since the audit (then it's not dead — report, don't delete).
- The file's tail doesn't match the excerpt (someone edited the style block).
- You feel tempted to "also clean up" anything else in the file — out of
  scope; report instead.

## Maintenance notes

- If a scroll-reveal is ever wanted, design it properly first: single
  IntersectionObserver, `prefers-reduced-motion` guard, and content visible
  without JS — then re-introduce a purposeful attribute. Don't resurrect
  this half-scaffolding.
- Reviewer scrutiny: diff should be exactly two hunks in one file.
