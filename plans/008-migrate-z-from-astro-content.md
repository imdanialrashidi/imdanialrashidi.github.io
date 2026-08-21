# Plan 008: Migrate off the deprecated `z` export from `astro:content`

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
- **Category**: migration / tech-debt
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

`npm run check` currently reports **31 hints, all ts(6385) "'z' is
deprecated"**, every one in `src/content.config.ts` — Astro 7 deprecated
re-exporting zod as `z` from `astro:content`. Hints are not failures today,
but they bury real signal (a future check run can't be judged "clean" while
31 deprecation lines ship on every verification), and the export is on a
removal timeline. Astro ships an official replacement subpath,
`astro/zod`, verified present in the installed version — so this is a
two-line change with a machine-checkable outcome: **0 errors, 0 hints**.

## Current state

- Installed versions (verified): `astro 7.2.4`; `node -e "…p.exports['./zod']"`
  → subpath exists (`true`). No direct `zod` entry in `package.json`
  dependencies — which is exactly why the `astro/zod` subpath is the right
  import (no new dependency).
- `src/content.config.ts` line 1 (verbatim):

```ts
import { defineCollection, z } from "astro:content";
```

- `z` is then used throughout the file (`z.object`, `z.string()`,
  `z.array`, `z.enum`, `z.coerce.date()`, …) in the three collection schemas
  (`projects`, `profile`, `now`). Those usages stay untouched — only the
  import moves.
- Current check output tail:

```
Result (37 files): 
- 0 errors
- 0 warnings
- 31 hints
```

- Content that exercises the schemas at build time:
  `src/content/projects/fast-english.md`, `src/content/projects/noveno.md`
  (both validate against `projects` during `astro build`).

## Commands you will need

| Purpose | Command | Expected after this plan |
|---|---|---|
| Typecheck | `npm run check` | exit 0; **0 errors, 0 warnings, 0 hints** |
| Build | `npm run build` | exit 0 (schemas still validate both project entries) |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope**:
- `src/content.config.ts` (import statement only)

**Out of scope** (do NOT touch):
- Any schema definition, collection name, or frontmatter file.
- `package.json` — do NOT add `zod` as a dependency; `astro/zod` re-exports
  Astro's own pinned zod.
- Other pages/components.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Split the import

Replace line 1 of `src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
```

with:

```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
```

Nothing else in the file changes.

**Verify**:
```bash
grep -n "from \"astro/zod\"" src/content.config.ts          # 1 match
grep -n "defineCollection, z" src/content.config.ts         # no matches
```

### Step 2: Prove the hints are gone and schemas still work

```bash
npm run check
npm run build
```

Expected: `npm run check` prints `0 errors / 0 warnings / 0 hints`;
`npm run build` exits 0 having loaded both content entries (its route list
includes `/work/fast-english` and `/work/noveno`).

### Step 3: Full gate

```bash
bash scripts/verify.sh
```

**Verify**: exit 0.

## Test plan

The build itself is the schema test: the glob loader parses both project
markdown files through the migrated zod schemas during `astro build`. A
regression would surface as a build failure or missing routes. No new tests.

## Done criteria

ALL must hold:

- [ ] `src/content.config.ts` imports `z` from `astro/zod`; no other change
      to the file (`git diff --stat` / working-tree review shows one hunk)
- [ ] `npm run check` reports 0 errors, 0 warnings, **0 hints**
- [ ] `npm run build` succeeds with both case-study routes present
- [ ] `bash scripts/verify.sh` exits 0
- [ ] No new dependencies added
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `astro/zod` cannot be resolved at check time (would mean a different Astro
  version is installed than the verified 7.2.4 — report versions, don't
  improvise with a direct `zod` dependency).
- Check output still shows ts(6385) hints after the change (they'd be coming
  from somewhere else — capture the full output).
- The build fails on content validation (schema behavior changed — it should
  not have; report exact error).

## Maintenance notes

- With hints at zero, future `astro check` regressions become visible
  immediately — keep it that way; treat new hints as review blockers.
- If Astro later removes `astro:content`'s `z` entirely, this repo is already
  clean; nothing further needed.
- Reviewer scrutiny: single-hunk diff only.
