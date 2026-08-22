# Plan 015: Harden the OG generator — anchor paths, fail loud, wire or verify at build

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- scripts/generate-og.mjs package.json public/og-default.png src/layouts/Layout.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: ops / bug (silent drift)
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

`public/og-default.png` is the image every unfurled link shows (used as `og:image`/`twitter:image` on all pages via `src/layouts/Layout.astro:24`). Its generator has two silent-failure modes:

- **CWD-dependent output.** `scripts/generate-og.mjs:17,19` uses `path.resolve("public")`, which resolves against the *invocation directory*. Running `node scripts/generate-og.mjs` from `scripts/` silently writes `scripts/public/og-default.png` with exit 0 and "wrote public/og-default.png" — success output, wrong tree. The real `public/og-default.png` (31K, committed) then quietly goes stale.
- **Unwired from build.** `package.json:8` `"build": "astro build"` never runs the generator; the header comment makes regeneration a manual memory task ("Re-run whenever branding changes; commit output"). Branding changed (or the commit `dbda97e` shipped new site copy), but there is no gate ensuring the image matches.
- **Host-font rendering.** The SVG font stack (`'Geist','DejaVu Sans',Arial` / `'DejaVu Sans Mono'`) falls back to whatever the host has — on a font-less CI host, glyphs silently differ with no error.

The result: a stale or misplaced social preview ships unnoticed on the most-shared asset. Fixing means paths are anchored, wrong-CWD fails loud, and `npm run build` either regenerates or verifies the image without requiring human memory.

## Current state

- `scripts/generate-og.mjs` as of `dbda97e` (full file — 25 lines):

```js
#!/usr/bin/env node
// Generates public/og-default.png (1200x630) — brand-consistent social
// preview for the whole site. Re-run whenever branding changes; commit output.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="100%" height="100%" fill="#fcfcfc"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="#0f4cff"/>
  <text x="80" y="240" font-family="'Geist','DejaVu Sans',Arial,sans-serif"
        font-size="88" font-weight="700" letter-spacing="-2" fill="#0f1419">Danial Rashidi</text>
  <text x="80" y="330" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="34" fill="#5f6368">Software &amp; Product Builder</text>
  <text x="80" y="410" font-family="'DejaVu Sans',Arial,sans-serif"
        font-size="30" fill="#8a8f98">Web · AI · Automation · Product Engineering</text>
  <text x="80" y="540" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="26" fill="#0f4cff">imdanialrashidi.github.io</text>
</svg>`;

await mkdir(path.resolve("public"), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.resolve("public/og-default.png"));
console.log("wrote public/og-default.png");
```

Two call sites of `path.resolve("public")` — the drift.

- `package.json:8` — `"build": "astro build"` (no og step).
- `public/og-default.png` — exists (31K) and is committed; `src/layouts/Layout.astro:24` references it via `new URL("/og-default.png", site.url)`.
- The generator uses `sharp` (already a devDependency) and SVG text — no z dependency.

Repo conventions: scripts are ESM (`"type": "module"`), use `import.meta.dirname` or `import.meta.url` to anchor paths (see `scripts/verify.sh` which derives `ROOT_DIR` from its own location). Prefer `import.meta.dirname` (Node 20.11+ baseline; this repo requires ≥22.19.0). `public/` is always a child of the repo root.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Generate | `node scripts/generate-og.mjs` | exit 0, writes `public/og-default.png` at repo root |
| Typecheck | `npm run check` | exit 0 |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |
| Negative CWD check | `bash -c 'cd scripts && node ../scripts/generate-og.mjs 2>&1; echo exit:$?'` | must NOT create `scripts/public/` (after fix) |

## Scope

**In scope** (only files you should modify):
- `scripts/generate-og.mjs` — anchor paths + fail-loud if repo root not found
- `package.json` — wire the generate step into the build (either regenerate or add a verify step; see Steps)
- Optionally `scripts/verify-og.mjs` — **create only if** you choose the "verify at build" alternative that needs a separate script; otherwise don't add a new file

**Out of scope** (do NOT touch):
- `public/og-default.png` content / SVG design — keep the same visual; the generator should produce byte-for-byte identical output at first (except for deterministic png compression) when run from the correct CWD, so review is trivial.
- `src/layouts/Layout.astro`, image pipeline, fonts vendoring — no change.
- Adding a font-install or bundling fonts into the generator — deferred; host-font variance is low-severity for an SVG-text image and fixing it would add weight.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Anchor paths to the script location and fail loud on wrong tree

In `scripts/generate-og.mjs`, replace the two `path.resolve("public")` calls with a repo-root-anchored path:

```js
import path from "node:path";
import { fileURLToPath } from "node:url"; // only if you use import.meta.url; prefer import.meta.dirname below

// Preferred (Node ≥20.11, repo requires ≥22):
const repoRoot = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(repoRoot, "public");
const outPath = path.join(publicDir, "og-default.png");

// Guard: fail loud if this isn't the repo root (no package.json or no public/ parent)
import { existsSync } from "node:fs";
if (!existsSync(path.join(repoRoot, "package.json")) || !existsSync(repoRoot)) {
  console.error(`Refusing to write OG image: repo root not found at ${repoRoot}`);
  process.exit(1);
}

await mkdir(publicDir, { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
console.log(`wrote ${path.relative(repoRoot, outPath)}`);
```

Also update the URL import to derive `repoRoot` before any `mkdir` — do not keep any `path.resolve("public")`.

Delete any previously-misplaced artifact if it exists from earlier manual runs (check `ls -la scripts/public/` — if it exists from a prior accidental run, remove it as part of this step and verify it wasn't tracked).

**Verify**:
```bash
# from repo root — correct CWD
node scripts/generate-og.mjs
ls -lh public/og-default.png          # still exists, ~31K, mtime updated
grep -n "import.meta.dirname\|publicDir\|outPath" scripts/generate-og.mjs  # anchored
grep -n 'path.resolve("public")' scripts/generate-og.mjs                    # no matches

# from wrong CWD — must not create scripts/public
rm -rf scripts/public 2>/dev/null; bash -c 'cd scripts && node ../scripts/generate-og.mjs 2>&1; echo "exit:$?"'
ls -d scripts/public 2>&1 | grep -q "No such" && echo "no misplaced dir — OK"
ls -lh public/og-default.png          # still at repo root, not in scripts/
```

Generator must exit 0 from either CWD and always write to `public/og-default.png` at the repo root.

### Step 2: Wire generation into the build (choose one — regenerate is simpler)

Pick **one** of these two equally-acceptable approaches; both satisfy the "no human memory" requirement. Document your choice in a one-line comment in `package.json` or the generator header.

**Option A — regenerate at build (simplest, recommended):**

In `package.json`, change:

```json
"build": "node scripts/generate-og.mjs && astro build"
```

This makes `npm run build` always produce a fresh image before Astro's static step. Because the SVG is deterministic, the output is byte-deterministic aside from png compression seed; the diff noise is minimal and proves the image matches branding.

**Option B — verify at build, regenerate manually:**

Keep `"build": "astro build"` and instead add a pre-build verify step that *fails loud* if the artifact is stale. Requires a tiny `scripts/verify-og.mjs` that regenerates to a temp buffer or temp file and compares bytes (or compares a hash of the SVG) against `public/og-default.png` — mismatch → exit 1 with "OG image stale — run node scripts/generate-og.mjs".

Option B avoids the extra ~200ms of sharp work on every build but adds a file. Either is acceptable — do not implement both.

**Verify** (for Option A):

```bash
npm run build          # must exit 0; should log "wrote public/og-default.png" before Astro output
grep -c "og-default" dist/sitemap-0.xml  # still no break
ls -lh public/og-default.png dist/_astro  # build still emits statics
```

**Verify** (for Option B):

```bash
node scripts/verify-og.mjs          # exit 0 when in sync
# negative check: touch the SVG title text temporarily, run verify, assert exit 1, revert
```

### Step 3: Alignment check — built pages still reference the correct URL

The Layout head sets `og:image` via `new URL("/og-default.png", site.url)`. Ensure the file is still copied to `dist/` by Astro (public/ → dist/) regardless of the build wiring:

```bash
ls -lh dist/og-default.png 2>&1 || ls -lh public/og-default.png
grep -c 'og:image.*og-default' dist/index.html   # ≥1
grep -c 'og:image.*og-default' dist/about/index.html  # ≥1
```

If `dist/og-default.png` is missing, check that `public/og-default.png` is not ignored and Astro's `publicDir` still copies it (it does by default).

## Test plan

No unit tests for an image generator. Regression net:

- The two CWD checks above (correct and wrong invocation directory both land in `public/`)
- `npm run check` + `npm run build` still exit 0
- No new misplaced `scripts/public/` artifact is created or tracked (`git status` clean except in-scope files + the intentionally-updated `public/og-default.png` mtime if you regenerated)

## Done criteria

ALL must hold:

- [ ] `scripts/generate-og.mjs` contains **zero** `path.resolve("public")` — all output is via `import.meta.dirname`-anchored `publicDir`/`outPath`, with a guard that fails loud if the repo root is not found
- [ ] `node scripts/generate-og.mjs` from **repo root** and from **scripts/** both write to `public/og-default.png` at the repo root, and `scripts/public/` does not exist after either
- [ ] `package.json` build either regenerates (`node scripts/generate-og.mjs && astro build`) **or** verifies (separate verify script invoked during `npm run build` / `npm run ci` / `bash scripts/verify.sh` — pick one, wire it, and document it)
- [ ] `public/og-default.png` still exists and `dist/og-default.png` is present after `npm run build` (or at least `public/og-default.png` copied correctly — whichever your build wiring does)
- [ ] `npm run check` and `npm run build` exit 0
- [ ] No files outside the in-scope list modified (`git status --short` shows only `scripts/`, `package.json` (+ optional verify script), `public/og-default.png`, and `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The generator file no longer matches the excerpt (sharp removed, SVG replaced with canvas code, output path moved to `dist/` or `.astro/`).
- `import.meta.dirname` is unavailable in the execution environment (Node <20.11) — report the Node version (`node -v`) and fall back to `fileURLToPath(import.meta.url)` anchoring.
- `public/og-default.png` is supposed to be versioned differently (e.g. moves under `public/images/` — respect the product layout instead of forcing this path).
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- When branding copy changes (`site.title`, site description, color tokens used in the SVG's `fill` rect/text), the generator must be re-run. With Option A (regenerate at build) this happens automatically; with Option B the stale check fails loudly until the committer runs `node scripts/generate-og.mjs` and commits the new `public/og-default.png`.
- Host-font rendering variance is intentionally not addressed here — the SVG intentionally uses web-safe fallbacks. If glyph variance becomes a review flag, vendor a headless font for the generator in a later pass rather than bundling here.
- Reviewer scrutiny: verify the image still renders correctly after the path change by opening `public/og-default.png` at 100% and confirming the four text lines match `docs/DESIGN.md` brand copy; check that the `dist/` copy is byte-identical (or near-identical) to `public/` after build.
