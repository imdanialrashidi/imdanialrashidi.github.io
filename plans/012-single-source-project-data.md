# Plan 012: Single-source project data — shared card mapping, draft filtering, and first product tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- src/content.config.ts src/content/projects src/pages/index.astro src/pages/work/index.astro src/pages/work/fast-english.astro src/pages/work/noveno.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (best before any case-study content authoring)
- **Category**: tech-debt / tests / bug
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

Project facts have **two sources of truth** today and the drift is already live:

- `src/content/projects/fast-english.md` says `status: "in_progress"` and summary `"A focused language-learning product — exploring practical, accessible tools …"`; `src/pages/work/fast-english.astro` hardcodes `statusLabel="In progress — active"` and a *different* summary about "Persian-first English podcast app … manual card-to-card payment …". The same split exists for Noveno.
- The homepage and work index each contain an **identical 18-line `projects.map` block** that sorts, derives `statusLabel`, picks `ctaLabel` via `p.data.title === "Noveno"` string matching, and selects `variant`. A third project requires touching both pages plus both case-study hardcodes in lockstep — unreviewable.
- `status: "draft"` is in the Zod enum but **never filtered** — marking a project draft still publishes it on both pages (surprising for a site whose brand is "honest" presentation).
- `links.caseStudy` is `z.string()` — the only link field without `z.url()` — and is dropped directly into `href` on both pages, so a future typo with `javascript:` would ship as a clickable link.

There are also **zero product-level tests**. Extracting the shared mapping into a single typed module closes the drift class, makes draft semantics real, hardens the link flow, and creates the first cheap `node:test` seam without adding a framework.

## Current state

Files as of `dbda97e`:

- `src/content.config.ts` — content collections. Relevant schema (lines ~1–35):

```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kicker: z.string().optional(),
    categories: z.array(z.string()).optional(),
    role: z.string().optional(),
    year: z.number().int().optional(),
    status: z.enum(["draft", "in_progress", "published", "building"]).default("in_progress"),
    stack: z.array(z.string()).optional(),
    links: z.object({
        live: z.url().optional(),
        github: z.url().optional(),
        noveno: z.url().optional(),
        caseStudy: z.string().optional(),
      }).optional(),
    cover: z.string().optional(),
    hasVisual: z.boolean().optional().default(false),
    featured: z.boolean().optional(),
    order: z.number().optional(),
  }),
});
```

Two content entries exist:
- `src/content/projects/fast-english.md` — `title:"Fast English"`, `summary:"A focused language-learning product — …"`, `kicker:"Product Engineering · Web · PWA · Android"`, `status:"in_progress"`, `order:1`
- `src/content/projects/noveno.md` — `title:"Noveno"`, `summary:"A separate venture — building thoughtful business …"`, `kicker:"Founder / Product / Business Systems · Web"`, `status:"building"`, `order:2`

- `src/pages/index.astro:1–15` + `125–150` — loads `getCollection("projects")` sorted by `order ?? 99`, then maps identically to work index:

```ts
const projects = (await getCollection("projects"))
  .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
```
```astro
        projects.map((p, i) => (
            <ProjectFeature
              index={String(i + 1).padStart(2, "0")}
              title={p.data.title}
              kicker={p.data.kicker || (p.data.categories ? p.data.categories.join(" · ") : "")}
              summary={p.data.summary}
              href={p.data.links?.caseStudy || `/work/${p.id}`}
              statusLabel={
                p.data.status === "building"
                  ? "Building · In progress"
                  : p.data.status === "in_progress"
                    ? "Case study — in progress"
                    : undefined
              }
              year={p.data.year}
              ctaLabel={p.data.title === "Noveno" ? "Explore Noveno" : "View case study"}
              variant={p.data.title === "Noveno" ? "accent" : "default"}
              reversed={i % 2 === 1}
            />
          ))
```

- `src/pages/work/index.astro:5–52` — **identical** sort + map (including the same `title === "Noveno"` ternaries), plus hardcoded header text `Portfolio index — 02 projects` and a meta line that re-lists the two projects by hand:

```astro
<span class="work-head__eyebrow">Portfolio index — 02 projects</span>
…
<span>Fast English <span class="mono">· Product Engineering · Web · PWA · Android</span></span>
<span>Noveno <span class="mono">· Founder / Product / Business Systems · Web</span></span>
```

- `src/pages/work/fast-english.astro:15–25` — `CaseHero` hardcodes metadata that already exists in `fast-english.md`:

```astro
  <CaseHero
    kicker="Product Engineering · Web · PWA · Android"
    title="Fast English"
    summary="A Persian-first English podcast app for Iranian learners on Android — calm, mobile-first…"
    role="Product Engineering"
    year={2025}
    statusLabel="In progress — active"
    stack={["React 19", "TypeScript", "MUI", "PocketBase 0.39.9", "Capacitor", "Vite", "Caddy", "SQLite"]}
```

(`fast-english.md` has no `stack`; the hero's summary also diverges from the card summary above — intentional divergence but still a single-source opportunity for the shared fields.)

- `src/pages/work/noveno.astro` — same pattern with its own `CaseHero` hardcodes.

- `src/components/ProjectFeature.astro` — props include `index, title, kicker, summary, href, statusLabel, year, ctaLabel, variant, reversed, image`. No logic to extract.

Repo conventions:
- TypeScript strict (`tsconfig.json` extends `astro/tsconfigs/strict` with `noUncheckedIndexedAccess`); `node:test` + `node:assert/strict` is the existing test runner (see `tests/verify-affected.test.mjs` pattern — `import test from "node:test"`). `scripts/pi-doctor.sh` runs `node --test tests/*.test.mjs` during `bash scripts/verify.sh`.
- `src/data/site.ts` is the existing single-source pattern for site title/social/navigation — follow it for projects.
- Verification today: `npm run check` (0 errors/hints), `npm run build`, `bash scripts/verify.sh`. `package.json` scripts: `check: "astro check"`, `build: "astro build"`, `ci: "npm run check && npm run build"`.

Design vocabulary: no new visual tokens. Use existing `ProjectFeature` variants (`default`/`accent`) as-is.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0, 0 errors / 0 warnings / 0 hints |
| Build | `npm run build` | exit 0 |
| Unit tests | `node --test tests/projects.test.mjs` | all tests pass |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Suggested executor toolkit

- No extra skills required. Follow the `site.ts` and `verify-affected.test.mjs` patterns exactly.

## Scope

**In scope** (only files you should modify/create):
- `src/lib/projects.ts` — **create** (new single-source module)
- `src/content.config.ts` — harden `links.caseStudy` validation + optional small refinement
- `src/pages/index.astro` — switch to lib helper
- `src/pages/work/index.astro` — switch to lib helper + derive the `02 projects` count and meta line from data
- `src/pages/work/fast-english.astro` — derive `CaseHero` shared props from the collection entry (keep page-specific long-form prose/stack override where intentionally detailed)
- `src/pages/work/noveno.astro` — same
- `tests/projects.test.mjs` — **create** (covers lib + collection consistency)
- `src/content/projects/*.md` — only if needed to update frontmatter for the fixes (e.g. adding `stack` to fast-english.md to prove the single-source path — prefer keeping md source-of-truth and making the page derive it; don't invent md fields that don't exist unless the page hardcode should move there)

**Out of scope** (do NOT touch):
- `src/components/ProjectFeature.astro`, `src/components/case-study/*`, `src/styles/*`, `src/layouts/*` — no visual change.
- Adding a test framework, `vitest`/`playwright`, or new npm deps — use existing `node:test`.
- `docs/*`, `src/data/site.ts`, OG generation, deploy workflow.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Create `src/lib/projects.ts` — the single source

Create `src/lib/projects.ts` with a small, fully-typed surface. Match the existing code's conventions (named exports, no default export, strict null checks). Target shape:

```ts
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;

export function isDraft(entry: ProjectEntry): boolean {
  return entry.data.status === "draft";
}

export function statusLabelFor(status: ProjectEntry["data"]["status"]): string | undefined {
  if (status === "building") return "Building · In progress";
  if (status === "in_progress") return "Case study — in progress";
  return undefined; // draft / published handled by caller
}

export function hrefFor(entry: ProjectEntry): string {
  const raw = entry.data.links?.caseStudy ?? `/work/${entry.id}`;
  // defense: block javascript: even if schema is bypassed (author-built site, but cheap)
  if (/^\s*javascript:/i.test(raw)) return `/work/${entry.id}`;
  return raw;
}

export function kickerFor(entry: ProjectEntry): string {
  return entry.data.kicker ?? (entry.data.categories ? entry.data.categories.join(" · ") : "");
}

export function ctaLabelFor(entry: ProjectEntry): string {
  return entry.data.title === "Noveno" ? "Explore Noveno" : "View case study";
}

export function variantFor(entry: ProjectEntry): "default" | "accent" {
  return entry.data.title === "Noveno" ? "accent" : "default";
}

export function cardPropsFor(entry: ProjectEntry, index: number) {
  return {
    index: String(index + 1).padStart(2, "0"),
    title: entry.data.title,
    kicker: kickerFor(entry),
    summary: entry.data.summary,
    href: hrefFor(entry),
    statusLabel: statusLabelFor(entry.data.status),
    year: entry.data.year,
    ctaLabel: ctaLabelFor(entry),
    variant: variantFor(entry),
    reversed: index % 2 === 1,
  };
}

export async function getDisplayProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection("projects");
  return all
    .filter((p) => !isDraft(p))
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}
```

Notes:
- The `title === "Noveno"` branching is kept for now — it matches the shipped product (Noveno gets accent + different CTA). If a future project needs the same treatment, replace it with a frontmatter flag (e.g. `featured`) then; don't over-generalize here.
- `hrefFor` fallback to `/work/${entry.id}` guarantees an internal path even if the md has no `caseStudy` link.
- Keep the file small, pure, and dependency-free so `node:test` can import the pure helpers without needing Astro's loader.

**Verify**:
```bash
npm run check   # must still exit 0; new file must typecheck
grep -n "cardPropsFor\|getDisplayProjects" src/lib/projects.ts  # confirms exports exist
```

### Step 2: Harden `links.caseStudy` in `src/content.config.ts`

Change the loose `z.string().optional()` to block `javascript:` and enforce internal-path-or-https. Replace within the `links` object:

```ts
// before:
        caseStudy: z.string().optional(),

// after:
        caseStudy: z
          .string()
          .optional()
          .refine(
            (v) => !v || (/^(\/|https?:\/\/)/.test(v) && !/^\s*javascript:/i.test(v)),
            { message: "caseStudy must be an internal path (/) or https URL, not javascript:" },
          ),
```

Keep sibling fields (`live`, `github`, `noveno`) as `z.url().optional()`.

**Verify**:
```bash
npm run check && npm run build   # both exit 0; try a quick negative test: temporarily set caseStudy: "javascript:alert(1)" in a scratch branch and confirm `npm run check` or `npm run build` now surfaces a validation error, then revert
```

### Step 3: Migrate the two card lists to the shared helper

In both `src/pages/index.astro` and `src/pages/work/index.astro`:

- Replace `import { getCollection } from "astro:content"` with `import { getDisplayProjects, cardPropsFor } from "../lib/projects.ts"` (adjust relative path: `../lib/projects.ts` from `src/pages/index.astro` → `../lib/projects.ts`? Actually `src/pages/index.astro` → `src/lib/projects.ts` is `../lib/projects.ts`; `src/pages/work/index.astro` is `../../lib/projects.ts` — verify import resolves with `npm run check`).
- Replace the sort block with `const projects = await getDisplayProjects();`
- Replace the identical per-page mapping block with:

```astro
        projects.map((p, i) => {
          const props = cardPropsFor(p, i);
          return <ProjectFeature {...props} />;
        })
```

If spreading triggers Astro prop-type strictness, expand explicitly as `<ProjectFeature index={props.index} title={...} … />` instead.

In `src/pages/work/index.astro`, also derive the count/meta that were hardcoded:
- Change `Portfolio index — 02 projects` to `Portfolio index — {String(projects.length).padStart(2, "0")} projects`
- Derive the meta line from the loaded projects instead of hardcoding the two names/kickers — e.g. map `projects` into spans (reuse `kickerFor` or `p.data.kicker`). Keep the visual "|" separator but no longer hardcode titles.

**Verify**:
```bash
grep -n "getDisplayProjects\|cardPropsFor" src/pages/index.astro src/pages/work/index.astro  # each file has the import
grep -n 'title === "Noveno"' src/pages/index.astro src/pages/work/index.astro  # no matches (centralized in lib)
npm run check && npm run build
# spot-check the built HTML still has both cards
grep -c "Fast English" dist/index.html
grep -c "Noveno" dist/index.html
```
Each grep must find the cards; build must exit 0.

### Step 4: Derive case-study `CaseHero` shared props from the collection

For `src/pages/work/fast-english.astro` and `src/pages/work/noveno.astro`:

- Import `getCollection` (or `getEntry`) and fetch the matching entry at the top of the frontmatter:

```ts
import { getCollection } from "astro:content";
const entry = (await getCollection("projects")).find((p) => p.id === "fast-english"); // or "noveno"
if (!entry) throw new Error("Missing project entry: fast-english");
```

- Replace the `CaseHero` props that are already in the collection with values from `entry.data`:
  - `kicker={entry.data.kicker ?? …}`
  - `title={entry.data.title}`
  - `role={entry.data.role}`
  - `year={entry.data.year}`
  - `statusLabel` via the same ternary or via an imported `statusLabelFor(entry.data.status)` if you imported the helper.

Keep page-specific long-form overrides where intentional:
- The hero's `summary` on each case-study page is deliberately longer than the card `summary` — keep the page prose as-is (do not force md summary into the hero). Only the fields that are pure duplication (kicker/title/role/year/status) should be derived.
- `stack` on fast-english (React 19 etc.) and noveno (Astro 7 etc.) is page-specific detail not in frontmatter — keep it hardcoded in the page (or optionally move it into frontmatter `stack` and then derive it — either is fine, but do not invent frontmatter you don't have; if you move it, update the corresponding md file and verify `npm run check`).

**Verify**:
```bash
npm run check && npm run build
# ensure case-study pages still render their heroes
grep -c "Product Engineering" dist/work/fast-english/index.html
grep -c "Building a system" dist/work/noveno/index.html
```

### Step 5: Add `tests/projects.test.mjs` — the first product seam

Create `tests/projects.test.mjs` using the existing `node:test` pattern (`tests/verify-affected.test.mjs` as structural exemplar). Cover the lib helpers *without* needing Astro's content loader (mock entries), plus a small filesystem read for drift:

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { cardPropsFor, hrefFor, isDraft, kickerFor, statusLabelFor } from "../src/lib/projects.ts";

// helper to build a minimal mock entry
function mock(overrides = {}) { /* … */ }

test("statusLabelFor maps building/in_progress, hides draft/published", () => { … });
test("hrefFor falls back to /work/<id> and blocks javascript:", () => { … });
test("isDraft catches only draft", () => { … });
test("cardPropsFor derives variant/ctaLabel for Noveno vs default", () => { … });
test("frontmatter caseStudy links are safe (no javascript:)", () => {
  // read src/content/projects/*.md frontmatter strings directly and assert no javascript: hrefs
});
test("every case-study page derives shared props from its entry (no hardcoded drift)", () => {
  // read src/pages/work/fast-english.astro + noveno.astro and assert they import getCollection/getEntry and reference entry.data.* for kicker/title/role/year
  // and that hardcoded status strings like "In progress — active" no longer appear as literals
});
```

Keep tests deterministic and offline — no network, no build needed to run.

**Verify**:
```bash
node --test tests/projects.test.mjs   # all pass
bash scripts/verify.sh                  # full gate still passes (doctor runs node --test tests/*.test.mjs)
```

### Step 6: Final sweep

- Remove the now-dead comment in `src/content.config.ts:4–5` that says schemas are "not yet used" — `projects` is demonstrably used.
- Run the three gates together.

**Verify**:
```bash
npm run check
npm run build
node --test tests/projects.test.mjs
bash scripts/verify.sh
```
All exit 0. `grep -rn "In progress — active" src/pages/work/fast-english.astro` → no match (derived now).

## Test plan

- New file `tests/projects.test.mjs` with cases listed above (status labels, href safety, draft filtering, variant/cta branching, frontmatter↔hero consistency).
- Existing tests as pattern: `tests/verify-affected.test.mjs`.
- Verification: `node --test tests/projects.test.mjs` → all pass; `bash scripts/verify.sh` still passes via doctor's `node --test tests/*.test.mjs`.

## Done criteria

ALL must hold:

- [ ] `src/lib/projects.ts` exists, exports `getDisplayProjects`, `cardPropsFor`, `statusLabelFor`, `hrefFor`, `isDraft` (and helpers), and `npm run check` passes
- [ ] `src/content.config.ts` `links.caseStudy` is a refined string blocking `javascript:` (not plain `z.string()`)
- [ ] `src/pages/index.astro` and `src/pages/work/index.astro` both import from `src/lib/projects.ts`, use `getDisplayProjects()` (thus draft-filtered), and contain **zero** occurrences of the old inline `statusLabel` ternary or `title === "Noveno"` branching (`grep` returns no matches)
- [ ] `src/pages/work/index.astro` no longer hardcodes `02 projects` or the two meta spans by hand (count/meta derived from `projects`)
- [ ] `src/pages/work/fast-english.astro` and `src/pages/work/noveno.astro` derive `kicker/title/role/year/statusLabel` from their collection entry (hardcoded shared props removed)
- [ ] `tests/projects.test.mjs` exists and `node --test tests/projects.test.mjs` passes
- [ ] `npm run check` and `npm run build` exit 0 (`dist/` still has both projects rendered)
- [ ] `bash scripts/verify.sh` exits 0
- [ ] No files outside the in-scope list modified (`git status --short` shows only the listed files plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `src/content.config.ts` schema or any `src/content/projects/*.md` id does not match the excerpts (e.g. ids are no longer `fast-english`/`noveno`).
- `ProjectFeature` prop types changed and `cardPropsFor`'s shape no longer satisfies them (`npm run check` reveals the mismatch).
- `npm run build` fails because Astro's content layer cannot be imported from `src/lib/` at build time (Astro 7 boundary — report the loader constraint).
- The case-study pages' long-form summary/stack prove structurally required to stay hardcoded and deriving them would invent content — keep prose hardcoded and only derive the shared metadata fields.

## Maintenance notes

- New projects: add one `src/content/projects/<id>.md` entry; the homepage, work index, and their card on any list page appear automatically (order via `order`). No page edit needed. The `order` gap strategy (`?? 99`) keeps unordered items at the end.
- Adding a per-project `featured`/`accent` flag later: replace the `title === "Noveno"` branch in `src/lib/projects.ts` with a frontmatter boolean (e.g. `accent: true`) and update `variantFor`/`ctaLabelFor` — the two pages will follow without changes.
- Draft workflow: set `status: "draft"` — the entry disappears from every list without deleting the file. Use `getCollection("projects")` without the filter only in admin/preview contexts.
- Reviewer scrutiny: verify the `hrefFor` javascript: guard is tested and that the derived work-index meta line still matches the visual design at 375px and 1280px.
