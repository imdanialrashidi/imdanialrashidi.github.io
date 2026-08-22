# Plan 017: Bring product dependencies under the integrity ledger (or document harness-only scope)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- .pi/package-integrity.json scripts/verify-package-integrity.mjs package.json .pi/settings.json docs/ARCHITECTURE.md docs/exec-plans/active/premium-personal-brand.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none (best after 014 so quality lane covers the new check)
- **Category**: security (supply-chain)
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

The repo's documented supply-chain control says product dependencies are also pinned and verified. The active exec-plan §6 risk table states: `Pin exact versions, verify via verify-package-integrity.mjs --online` naming `Astro, sharp, Geist`. But the actual ledger — `.pi/package-integrity.json` — covers **only the harness** (8 entries: `pi-coding-agent@0.84.2`, `pi-sub-agent@0.1.5`, `pi-mcp-adapter@2.26.1`, `@juicesharp/rpiv-todo@2.6.2`, `pi-lsp-adapter@0.1.3`, `pi-doc-search@0.3.2`, `pi-web-search@0.2.1`, `@playwright/mcp@0.0.79`), all `npm:` Pi/Playwright packages. The site's real build deps — `astro@7.2.4`, `@astrojs/check@0.9.10`, `@astrojs/sitemap@3.7.3`, `sharp@0.35.3`, `typescript@5.9.2` — are `devDependencies` in `package.json` with only lockfile hashes (`npm ci`) and Dependabot as protection. Stated intent and mechanism diverge; a compromised `astro` or `sharp` tarball during build would not be caught by the integrity gate that the docs claim exists.

Fixing is either extending the ledger to the 5 product deps (defense-in-depth that matches the stated intent) or amending the docs so the stated control matches reality (harness-only, product deps via lockfile + Dependabot). This plan implements the **extend** path as default because the effort is small and the registry check is one command. If the owner prefers harness-only, the STOP condition tells you to take the docs-only alternative and not touch the script.

## Current state

- `package.json:12–19` — product build deps (all `devDependencies`, zero runtime `dependencies` — the static `dist/` ships no npm package):

```json
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^7.2.4",
    "sharp": "^0.35.3",
    "typescript": "^5.9.2"
  },
```

`engines: { "node": ">=22.19.0" }`, CI pins `22.23.2`. `npm audit --registry=https://registry.npmjs.org` at `dbda97e` = **0 vulnerabilities**.

- `.pi/package-integrity.json` — `version: 1`, `reviewedAt: "2026-08-20"`, 8 Pi/Playwright entries as listed above, each with `source: "npm:<name>@<exact>"`, `integrity: "sha512-..."`, `license`, `repository: "https://github.com/..."`.

- `scripts/verify-package-integrity.mjs` — reads `.pi/package-integrity.json` + `.pi/settings.json` packages + `.mcp.json` playwright spec, asserts:
  1. every manifest entry is `npm:` with `sha512-` + license + github repo,
  2. every configured package has a manifest entry (error if missing),
  3. every manifest entry is configured (error `stale integrity record is not configured`),
  4. with `--online`, each manifest entry's `dist.integrity` is re-checked against the registry via `npm view <spec> dist.integrity license --json`.

Because product deps are not in `.pi/settings.json`'s `packages`, simply appending them to the manifest would trip condition (3) (`stale record`). The script must be taught to accept product entries.

- `.pi/settings.json:4–10` — `packages: [ "npm:pi-sub-agent@0.1.5", {source:"npm:pi-mcp-adapter…"}, …]` — only harness packages.

- Docs stating the control: `docs/exec-plans/active/premium-personal-brand.md` §6 and `docs/ARCHITECTURE.md` operational baseline (fonts committed). The `Geist` family is vendored to `public/fonts` (`docs/ARCHITECTURE.md: Logging/monitoring` / fonts line) so it is not an npm package and is intentionally not in the ledger.

Repo conventions: exact SHAs for Actions, `npm ci` from `package-lock.json`, `bash scripts/verify.sh` composes doctor + `npm run ci`, and `quality.yml` already runs `node scripts/verify-package-integrity.mjs --online` (requires network). `scripts/ci-install.sh` is plain `npm ci`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Integrity offline | `node scripts/verify-package-integrity.mjs` | `Validated N exact package integrity record(s).` |
| Integrity online | `node scripts/verify-package-integrity.mjs --online` | `PASS npm:<spec>` per entry (requires network) |
| Registry view | `npm view <spec> dist.integrity license --json --registry=https://registry.npmjs.org` | JSON with `dist.integrity` + license |
| Typecheck/build | `npm run check && npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope** (only files you should modify if taking the **extend** path):
- `.pi/package-integrity.json` — add 5 product entries + bump `reviewedAt`
- `scripts/verify-package-integrity.mjs` — allow product entries (relax the stale-record check or add `package.json` devDeps to the "configured" set)
- Optionally `docs/ARCHITECTURE.md` one-line note that product deps are now ledger-covered (if extend), or that coverage is harness-only with lockfile as product protection (if docs-only)

**Out of scope** (do NOT touch):
- `package.json` version ranges (keep `^` ranges — the ledger pins the resolved integrity, not the range) and `package-lock.json` (updated only via `npm ci`/view, not hand-edited).
- `.pi/settings.json` — do not add product deps there (harness list).
- Vendored fonts (`public/fonts`), Astro config, site source.
- Adding Dependabot for product deps — already present (`.github/dependabot.yml` monthly `npm + github-actions`), keep as-is.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

Choose **Path A (extend)** or **Path B (docs-only)** at the start and follow only that path. Default is **Path A** unless `docs/ARCHITECTURE.md` already documents harness-only as a deliberate ADR.

### Path A — Extend the ledger to product deps (default)

#### Step A1: Collect registry-verified integrity for the 5 product specs

For each of `astro@7.2.4`, `@astrojs/check@0.9.10`, `@astrojs/sitemap@3.7.3`, `sharp@0.35.3`, `typescript@5.9.2`, run the registry check that the script itself uses — this guarantees the hash is what npm will resolve:

```bash
for spec in "astro@7.2.4" "@astrojs/check@0.9.10" "@astrojs/sitemap@3.7.3" "sharp@0.35.3" "typescript@5.9.2"; do
  echo "--- $spec ---"
  npm view "$spec" dist.integrity license --json --registry=https://registry.npmjs.org
done
```

Record the `dist.integrity` (`sha512-…`) and `license` per spec. The `@` scopes must be quoted. If any spec fails (network or spec not found at that exact version), STOP — report the npm output.

Do not hand-craft hashes — use only the registry output. The Geist fonts are not npm packages and are out of scope.

#### Step A2: Append to `.pi/package-integrity.json` and bump `reviewedAt`

Edit `.pi/package-integrity.json`:

- Append 5 objects to `packages` (keep existing 8 first; order doesn't matter but keep product block together for review):

```json
    {
      "source": "npm:astro@7.2.4",
      "integrity": "sha512-…from registry…",
      "license": "MIT",
      "repository": "https://github.com/withastro/astro"
    },
```

Use the actual repository URLs: `astro` → `https://github.com/withastro/astro`, `@astrojs/check` and `@astrojs/sitemap` → `https://github.com/withastro/astro` (same monorepo), `sharp` → `https://github.com/lovell/sharp`, `typescript` → `https://github.com/microsoft/TypeScript`. Licenses per registry (`MIT` for astro/sharp/ts? Actually `typescript` is `Apache-2.0` — use whatever `npm view` returns, don't guess).

- Update `reviewedAt` to today's ISO date (`YYYY-MM-DD`).

Keep `version: 1`. Do not add `Geist`.

**Verify**:
```bash
node -e "const j=require('./.pi/package-integrity.json'); console.log('entries:', j.packages.length); console.log('dup?', new Set(j.packages.map(p=>p.source)).size !== j.packages.length)"
# entries should be 13, no dups, reviewedAt is today
```

#### Step A3: Teach the verifier to accept product entries

In `scripts/verify-package-integrity.mjs`, relax the `stale integrity record is not configured` assertion so product entries are allowed. Minimal change:

- Read `package.json` devDeps alongside settings:

```js
const pkg = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"));
const productSources = Object.entries(pkg.devDependencies ?? {})
  .map(([name, range]) => {
    // resolve the *installed* version, not the range, via package-lock or npm view?
    // Simpler: match manifest entries by prefix "npm:${name}@" — any exact pinned for that name counts as product coverage.
    return name;
  });
```

- In the stale-check loop, skip entries whose `source` matches `npm:${productName}@` for a name in `pkg.devDependencies`. Pseudocode:

```js
const allowedStalePrefixes = Object.keys(pkg.devDependencies ?? {}).map(n => `npm:${n}@`);
for (const source of entries.keys()) {
  if (configured.includes(source)) continue;
  if (allowedStalePrefixes.some(p => source.startsWith(p))) continue;
  throw new Error(`stale integrity record is not configured: ${source}`);
}
```

Alternatively, add `productSources` to the `configured` set conceptually — but keep the harness strictness intact so a typo'd harness entry still fails.

Also ensure the `--online` loop still runs for product entries (it already does — it iterates `entries`).

**Verify**:
```bash
node scripts/verify-package-integrity.mjs
# expect: Validated 13 exact package integrity record(s).

node scripts/verify-package-integrity.mjs --online
# expect: PASS npm:astro@7.2.4, PASS npm:@astrojs/check@0.9.10, ... plus the 8 harness lines (13 PASS total)
```

If `--online` fails on `sharp` due to platform-specific `dist.integrity` (sharp publishes platform packages), report — the pin may need `sharp@0.35.3` plus optional deps handling. Otherwise, the canonical `sharp` base package has a single integrity.

#### Step A4: Optional doc alignment

In `docs/ARCHITECTURE.md` operational baseline or `docs/exec-plans/active/premium-personal-brand.md` §6 risk table, update the control note from `Pin exact versions, verify via verify-package-integrity.mjs --online (Astro, sharp, Geist)` to clarify: `Pin exact versions for harness (ledger) + product (ledger, 5 entries, registry-verified) + fonts vendored; verify via verify-package-integrity.mjs --online; lockfile via npm ci provides install-time integrity; Dependabot monthly for both ecosystems`. Keep it one line.

**Verify**:
```bash
bash scripts/verify.sh
# quality lane runs verify-package-integrity --online (network required); if offline in this env, at least the offline validated count passes
```

### Path B — Docs-only (only if owner explicitly rejects Path A)

Do not touch the ledger or the script. Instead, amend the docs so stated intent matches reality:

- In `docs/ARCHITECTURE.md` and the active exec-plan §6: replace `verify via verify-package-integrity.mjs --online (Astro, sharp, Geist)` with `verify via verify-package-integrity.mjs --online (harness/Pi packages — product build deps protected via package-lock.json integrity + Dependabot monthly; fonts vendored, not an npm dep)`.
- Bump `reviewedAt` is not needed.

**Verify**: `grep -n "package-integrity" docs/ARCHITECTURE.md` shows the harness-only note.

## Test plan

- `node scripts/verify-package-integrity.mjs` → `Validated 13 …` (Path A) or `Validated 8 …` (Path B)
- `node scripts/verify-package-integrity.mjs --online` → one `PASS` line per manifest entry (requires network; if this environment has no network, mark online criterion `UNPROVEN` and rely on offline + manual `npm view` evidence from Step A1 output — never fabricate PASS lines).
- `npm run check && npm run build` + `bash scripts/verify.sh` → exit 0.

## Done criteria

ALL must hold for Path A:

- [ ] `.pi/package-integrity.json` has **13** entries (8 harness + 5 product) and `reviewedAt` is today
- [ ] Each of `astro@7.2.4`, `@astrojs/check@0.9.10`, `@astrojs/sitemap@3.7.3`, `sharp@0.35.3`, `typescript@5.9.2` appears as `npm:<name>@<exact>` with `sha512-` matching `npm view --registry=https://registry.npmjs.org`
- [ ] `node scripts/verify-package-integrity.mjs` exits 0 with `Validated 13 …`
- [ ] `node scripts/verify-package-integrity.mjs --online` prints 13 `PASS` lines (or is reported honestly as UNPROVEN offline)
- [ ] `npm run check` and `bash scripts/verify.sh` exit 0
- [ ] No files outside the in-scope list modified (`git status` shows only the listed files plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

For Path B, replace the first three with:
- [ ] `.pi/package-integrity.json` unchanged at 8 entries; docs now explicitly say `product deps: lockfile + Dependabot, not ledger`

## STOP conditions

Stop and report back (do not improvise) if:

- Any product spec's `npm view` returns `license` that doesn't match the expected set (`MIT`/`Apache-2.0`) — report the value.
- `scripts/verify-package-integrity.mjs` already changed since the excerpt to handle product deps differently — compare before editing.
- `sharp` integrity is platform-conditional causing `--online` to fail on this host vs. registry canonical — report and switch to documenting sharp as lockfile-only.
- The owner explicitly says harness-only is the intended posture — take Path B instead of Path A.

## Maintenance notes

- Every bump of a product dep (e.g. `astro 7.2.4 → 7.3.x`) must be followed by `node scripts/verify-package-integrity.mjs --online` and an updated `reviewedAt + integrity` — the same discipline as harness pins. A reviewer should block a `package.json` deps bump without a ledger bump.
- If the team later adopts Renovate/Dependabot auto-merge, add `verify-package-integrity --online` as a required check before auto-merge.
- Reviewer scrutiny: verify each added `repository` URL actually hosts the package's source (check the npm `repository` field) and that `dist.integrity` was not hand-copied with a typo.
