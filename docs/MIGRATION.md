# Workflow migration record

This file records how the repository's agent workflow moved between harness generations. It is history and decision context; [WORKFLOW.md](WORKFLOW.md) is the current source of truth for the workflow pin and update procedure.

## DSH Workflow v0.2 (2026-11-23)

**Source:** [imdanialrashidi/dsh-workflow](https://github.com/imdanialrashidi/dsh-workflow) v0.2 at `cb887ce9da9708fd84e22fd31250d937abb8b824`.

### What changed

- Replaced the six-skill DSH Workflow v0.1 vendoring with the upstream v0.2 seven-skill set: `quick-fix`, `spec`, `build`, `verify`, `review`, `test-design`, and `production`. `verify` was rewritten to decide between verified, failed, and incomplete.
- Added `.dsh/workflow.json`, which pins the upstream version, commit, retrieval date, and sha256 of every skill file. `scripts/verify-workflow.mjs` enforces the pin, the exact seven-skill set, the one-file-per-skill layout, and frontmatter name/description; `scripts/verify.sh` runs it.
- Rewrote `AGENTS.md` as a short project map and moved workflow detail into [WORKFLOW.md](WORKFLOW.md). Removed the duplicated instructions that had diverged across `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `QUALITY.md`, and `GIT_POLICY.md`.
- Resolved the unresolved merge conflicts that had left conflict markers in `AGENTS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `scripts/verify.sh`, `docs/ARCHITECTURE.md`, `docs/PLAN.md`, `docs/QUALITY.md`, `docs/GIT_POLICY.md`, and `docs/exec-plans/README.md`.
- Replaced the automatic, standing PR-delivery policy with explicit authorization per action and target ([GIT_POLICY.md](GIT_POLICY.md)). Both duplicate delivery helpers (`scripts/ai-pr.mjs` and `scripts/pr.mjs`) and their tests were removed. This aligns the project with the DSH Workflow authority model.
- Rebuilt `scripts/verify.sh` around the project's real lanes: conflict/whitespace checks, workflow and skill checks, `npm run format:check`, `npm test`, and `npm run ci`. `quality.yml` now runs that one canonical gate.
- Added the `npm test` script and documented the full command set in [QUALITY.md](QUALITY.md).

### Removed

- The retired Pi/OMP runtime: `.pi/` (extensions, prompts, skills, settings, MCP and integrity records), the `p` launcher, `Dockerfile.pi`, `.dockerignore`, `PI_WORKFLOW_GUIDE.md`, and the Pi migration script.
- Pi/OMP workflow scripts: `pi-doctor.sh`, `pi-provider.mjs`, `pi-sandbox.sh`, `verify-package-integrity.mjs`, `verify-affected.mjs`, `validate-project-context.mjs`, `run-workflow-evals.mjs`, and `scripts/lib/`.
- The eval suite (`evals/`), its tests, and the related docs (`EVALUATION.md`, `VALIDATION.md`, `PROJECT_CONTEXT.md`, `TOOLING_SETUP.md`, `RESEARCH.md`, `RESEARCH_PI_BASELINE.md`).
- The untracked-content backup directories under `.workflow-backups/` (335 tracked files), the historical `plans/` set, and Python bytecode.
- Twelve test files that exercised removed runtime machinery. `tests/projects.test.mjs` and `tests/seo-metadata.test.mjs` remain and cover the product.
- The lockfile's mirror-hosted `resolved` URLs were normalized to `registry.npmjs.org` (386 entries) so the documented `npm ci` path works under npm 12's default remote-tarball policy. No package version or integrity hash changed; a clean install from the public registry succeeded under both npm 12.2.3 and the CI runtime (Node 22.23.2 / npm 10.9.8).
- Removed the stale `frontend-design` entry from `skills-lock.json`; the installed registry-managed domain skills are `accessibility`, `astro`, and `seo`.

### Retained

- Product contracts: `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `PLAN.md`, and the active execution plan.
- The static Astro site, its content schemas, product tests, deployment workflow, and design tokens.
- Registry-managed domain skills in `.agents/skills/` and `skills-lock.json`.
- Historical Pi/OMP notes in `CHANGELOG.md` as changelog history.

### Rollback

Git history is the recovery point. The state immediately before this migration is commit `3124ca2`; restore any removed file from that commit or revert this migration commit. No remote history was rewritten, no package version changed, and no deployment occurred as part of this work.

### Verification

`bash scripts/verify.sh` after the migration: workflow lock, syntax, skill frontmatter, format check, 15 product tests, `astro check`, and the static build. The exact outcomes are recorded in the migration handoff.
