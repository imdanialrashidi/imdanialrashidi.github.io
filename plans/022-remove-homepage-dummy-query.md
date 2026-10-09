# Plan 022: Remove the homepage dummy query and assert the real data path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 236600b..HEAD -- src/pages/index.astro tests/projects.test.mjs`
> If either in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (deletes dead code; test stays green by asserting what the page actually uses)
- **Depends on**: none (disjoint files from 020/021; land any time)
- **Category**: tech-debt / tests
- **Planned at**: commit `236600b`, 2026-10-07

## Why this matters

The homepage carries a dead variable whose only purpose is to satisfy a test's
string-grep — the exact kind of wart that teaches future editors the wrong
lesson ("this query must be load-bearing") and that makes the test assert
something untrue about the page's data path. The real homepage path is
`getFeaturedProjects()` + `getClientProjects()` (both filter
`getDisplayProjects()` internally, so draft exclusion is preserved). Removing
the dummy and pointing the test at the helpers the page actually calls keeps
the honesty guarantee (curated homepage, drafts excluded) without the lie.
This resolves the long-standing backlog item "index.astro dummy `_allForCheck`".

## Current state

- `src/pages/index.astro:1-16` (exact at `236600b`):
  ```astro
  ---
  import { Image } from 'astro:assets'
  import portraitSrc from '../../Assets/Danial_photo.webp'
  import ProjectFeature from '../components/ProjectFeature.astro'
  import { social } from '../data/site.ts'
  import Layout from '../layouts/Layout.astro'
  import { cardPropsFor, getClientProjects, getDisplayProjects, getFeaturedProjects } from '../lib/projects.ts'

  // Use shared lib for data access (test requires getDisplayProjects)
  const _allForCheck = await getDisplayProjects()
  const featured = await getFeaturedProjects()
  const clientProjects = await getClientProjects()
  // Homepage stays curated: 2 featured + 1 strongest client proof (Elsa Hamrah) → 3 total, not 6.
  const homeFeatured = featured
  const homeClientTeaser = clientProjects.slice(0, 1) // Elsa Hamrah
  const projects = homeFeatured
  void _allForCheck // satisfy type-check while keeping curated homepage
  ```
  Note the self-contradiction: the comment says "test requires
  getDisplayProjects" while the curated logic beside it never uses `_allForCheck`.
- `tests/projects.test.mjs`, test `'pages use shared lib and draft filtering'`
  (exact assertions at `236600b`):
  ```js
  assert.ok(/getDisplayProjects/.test(indexAstro), 'index.astro must use getDisplayProjects')
  assert.ok(/getDisplayProjects/.test(workIndexAstro), 'work/index.astro must use getDisplayProjects')
  ```
  The first assertion is the only reason the dummy exists. (`work/index.astro`
  genuinely uses `getDisplayProjects` — leave its assertion alone.)
- Convention: `src/lib/projects.ts` is the single source for project data
  (plan 012); tests are `node:test` filesystem-grep style because
  `astro:content` and `.webp` imports can't load under plain Node — do NOT try
  to `import` the lib in the test (that is the separate, deferred "inlined
  helper drift" backlog item, explicitly out of scope here).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Grep check | `grep -n "getDisplayProjects\|_allForCheck" src/pages/index.astro` | only the import line, pre-edit |
| Product tests | `node --test tests/projects.test.mjs` | all pass |
| Full suite | `node --test tests/*.test.mjs` | 121 pass, 0 fail |
| Typecheck | `npm run check` | exit 0, 0 errors |
| Format (this plan's files) | `npx biome check src/pages/index.astro tests/projects.test.mjs` | exit 0 (read-only; do NOT `--write` other files) |

## Scope

**In scope** (the only files you may modify):
- `src/pages/index.astro` (frontmatter only: import line + dummy lines)
- `tests/projects.test.mjs` (the one `indexAstro` assertion + its message)

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/work/index.astro` — genuinely uses `getDisplayProjects`; its assertion stays.
- `src/lib/projects.ts` — untouched; the helpers' behavior is the invariant.
- The "inlined helper drift" refactor (importing lib helpers into Node tests) —
  larger seam problem (`astro:content`/`.webp` imports), deferred backlog item.
- `src/lib/projects.ts:65-67` `isClientWork` hardcode and the dead
  `profile`/`now` collections — separate backlog items, not this plan.

## Git workflow

This repository enforces owner-controlled Git (`docs/GIT_POLICY.md`,
`AGENTS.md`). Executors never branch/commit/push — leave a verified
working-tree diff for the owner.

## Steps

### Step 1: Confirm the dummy is truly dead

Run `grep -n "getDisplayProjects\|_allForCheck" src/pages/index.astro`.
Expect exactly three hits: the import (line 7), the comment (line 9), and the
two dummy lines (`_allForCheck = ...` line 10, `void _allForCheck` line 16).

**Verify**: no other line in the file references either symbol. If
`getDisplayProjects` or `_allForCheck` is used anywhere else in the file
(e.g. markup below), STOP — the dummy is load-bearing and this plan's premise
is wrong.

### Step 2: Remove the dummy from `src/pages/index.astro`

Replace (exact strings from "Current state"):
- import line: `import { cardPropsFor, getClientProjects, getDisplayProjects, getFeaturedProjects } from '../lib/projects.ts'`
  → `import { cardPropsFor, getClientProjects, getFeaturedProjects } from '../lib/projects.ts'`
- delete the comment line `// Use shared lib for data access (test requires getDisplayProjects)`
  and the line `const _allForCheck = await getDisplayProjects()`
- delete the line `void _allForCheck // satisfy type-check while keeping curated homepage`
- add one honest comment above `const featured = ...`:
  `// Curated homepage: featured + strongest client proof. Both helpers filter getDisplayProjects() internally, so drafts stay excluded.`

**Verify**: `grep -n "_allForCheck" src/pages/index.astro` returns nothing; `grep -n "getDisplayProjects" src/pages/index.astro` returns exactly the one explanatory comment line above (zero imports, zero calls). (Amendment 2026-10-07: the original criterion wrongly demanded zero mentions while this same step prescribes a comment naming the helper — intent is no code reference.)

### Step 3: Point the test at the real data path

In `tests/projects.test.mjs`, replace:
```js
assert.ok(/getDisplayProjects/.test(indexAstro), 'index.astro must use getDisplayProjects')
```
with:
```js
assert.ok(
  /getFeaturedProjects/.test(indexAstro) && /getClientProjects/.test(indexAstro),
  'index.astro must derive its lists via getFeaturedProjects/getClientProjects (which filter getDisplayProjects internally)',
)
Leave the `workIndexAstro` `getDisplayProjects` assertion and every other
assertion in that test untouched.

**Verify**: `node --test tests/projects.test.mjs` → all pass.

### Step 4: Full proof

1. `node --test tests/*.test.mjs` → 121 pass, 0 fail (count may grow if
   other plans landed first — 0 fail is the requirement).
2. `npm run check` → exit 0, 0 errors.
3. `npx biome check src/pages/index.astro tests/projects.test.mjs` → exit 0.
   (If biome flags formatting in these two files, run
   `npx biome check --write` on ONLY these two files, then re-run steps 3–4.)

**Verify**: all three exit 0 and `git status --short` shows modifications only
in the two in-scope files.

## Test plan

- Updated assertion in `tests/projects.test.mjs` covers: homepage imports
  from `lib/projects` (existing assertions, untouched), homepage uses the
  featured/client helpers (new assertion), work index still uses
  `getDisplayProjects` directly (existing assertion, untouched).
- Draft exclusion is still covered by the existing `isDraft`/draft-filtering
  tests in the same file — no new test needed (`No new test` is the correct
  outcome for a dead-code deletion; the edited assertion IS the proof).
- Verification: `node --test tests/*.test.mjs` → 0 fail.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "_allForCheck" src/pages/index.astro` returns no matches
- [ ] `grep -n "getDisplayProjects" src/pages/index.astro` matches only the explanatory comment (zero imports/calls)
- [ ] `node --test tests/*.test.mjs` exits 0, 0 fail
- [ ] `npm run check` exits 0 with 0 errors
- [ ] `npx biome check src/pages/index.astro tests/projects.test.mjs` exits 0
- [ ] `git status --short` shows modifications only in the two in-scope files
- [ ] `plans/README.md` status row for 022 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in "Current state" don't match the live files (drift).
- Step 1 finds any other use of `getDisplayProjects`/`_allForCheck` in `index.astro`.
- Any verification fails twice after a reasonable fix attempt.
- The change appears to require touching an out-of-scope file (e.g. the test
  needs lib restructuring to stay meaningful — that is the deferred drift
  item, not this plan).

## Maintenance notes

- If the homepage ever stops being curated (e.g. lists all projects), the new
  assertion will fail correctly — switch it back to a `getDisplayProjects`
  assertion at that point, deliberately.
- The deferred "inlined helper drift" item (importing real lib helpers into
  Node tests) would subsume this test's grep style; if that plan lands later,
  this assertion should be re-expressed as a behavioral check, not deleted.
- Reviewer focus: confirm no markup below the frontmatter referenced the
  removed symbols (Step 1 grep is the proof).
