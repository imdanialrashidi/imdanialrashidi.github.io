# Agent Workflow

This repository uses [DSH Workflow](https://github.com/imdanialrashidi/dsh-workflow) v0.2 for agent execution and [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) for the runtime. This document owns the workflow pin, the skill map, and the update procedure. Repository commands and evidence rules live in [QUALITY.md](QUALITY.md); publication boundaries live in [GIT_POLICY.md](GIT_POLICY.md).

## Pin

| Fact | Value |
| --- | --- |
| Upstream | <https://github.com/imdanialrashidi/dsh-workflow> |
| Version | 0.2 |
| Commit | `cb887ce9da9708fd84e22fd31250d937abb8b824` |
| Retrieved | 2026-11-23 |
| Scope | Project-scoped copies in `.dsh/skills/` |
| Lock | `.dsh/workflow.json` (upstream commit plus sha256 per file) |
| Verifier | `node scripts/verify-workflow.mjs` (also run by `bash scripts/verify.sh`) |
| Qualified DSH runtime | 0.2.2-rc.5 (upstream also passed 0.2.1-rc.2) |

The skills are vendored rather than installed globally so that every clone and every session gets the same reviewed procedures. DSH discovers project skills in preference to a global install of the same name, so a global copy cannot silently change this repository's behavior.

The lock is the provenance record. A skill that differs from its locked hash fails verification even if its frontmatter is valid. The verifier is offline by design: it proves that the working tree matches the reviewed lock, not that the lock matches upstream. Review the pinned upstream commit and the update diff before changing a hash; the hash is not a substitute for that review.

## Skills

| Skill | Phase | Main output |
| --- | --- | --- |
| `quick-fix` | Small, low-risk correction | Change, focused check, diff review |
| `spec` | Unresolved requirements or acceptance | Outcome, criteria, scope, verification strategy |
| `build` | Ready to implement | Coherent implementation with tests/docs |
| `test-design` | Coverage or failure modes need design | Tests with meaningful failure detection |
| `verify` | Evidence must be produced | Executed checks with explicit statuses |
| `review` | A diff needs defect review | Evidence-backed findings, bounded repair |
| `production` | Hardening or release readiness | Readiness verdict, risks, recovery procedure |

Use only the skill that matches the current phase; users may invoke one with `/name`. The workflow is direct by default: planning is scaled to uncertainty and risk, not required for every change. Subagents are optional and reserved for genuinely independent work such as a fresh-context review.

Upstream version 0.2 added `production` and rewrote `verify` to decide between verified, failed, and incomplete. The previous project vendoring pinned v0.1 and six skills; this repository now pins the seven-skill v0.2 set.

## Project rules on top of the workflow

- **Commands are project-owned.** Use the commands in [QUALITY.md](QUALITY.md) and `package.json`; never infer a runner from another project.
- **Evidence statuses are explicit.** Report `PASS`, `FAIL`, `BLOCKED`, `UNPROVEN`, or `NOT EXECUTED` for every required check. An unseen screenshot or a reviewer opinion is not proof.
- **High-risk changes** — content schema or migration, CI/deploy workflows, dependency upgrades, secrets/privacy, public routes or contracts — need negative-path evidence, the canonical gate, and an independent review when a fresh-context reviewer is available.
- **Publication is separate.** Local verification does not authorize a commit, push, pull request, merge, release, or deployment. See [GIT_POLICY.md](GIT_POLICY.md).
- **Static-only contract.** There is no server runtime, database, auth, cookies, analytics, or backend form. Do not add infrastructure the product has explicitly rejected (see [ARCHITECTURE.md](ARCHITECTURE.md)).

## Updating the workflow

1. Clone or fetch upstream and check out the reviewed commit. Read its changelog, README, and the diff for `skills/`.
2. Copy the seven `skills/<name>/SKILL.md` files over `.dsh/skills/<name>/SKILL.md`. Keep one directory per skill with one `SKILL.md`; the installer and upstream checks assume that layout.
3. Update `.dsh/workflow.json`: `version`, `commit`, `retrievedAt`, and every sha256. Recompute them with `sha256sum .dsh/skills/*/SKILL.md`.
4. Run `node scripts/verify-workflow.mjs` and `bash scripts/verify.sh`.
5. Record the upstream commit and any behavior change in `CHANGELOG.md`. Do not hand-edit a vendored skill: a project-specific rule belongs in `AGENTS.md` or the owning document, and a real procedure change belongs upstream.

Verification fails if the skill set is not exactly the seven listed above, if a flat file or symlink appears directly under `.dsh/skills` (DSH also discovers flat `*.md` skills there, so an unpinned file could shadow a locked one), if a skill directory contains extra files or a symlinked `SKILL.md`, if frontmatter `name` does not match its directory, or if a file hash differs from the lock.

## Removed workflow layers

The repository previously carried a Pi/OMP runtime (`.pi/`, launcher, provider and sandbox helpers, extensions, prompt packs, eval harness, backups) and DSH Workflow v0.1. Those layers are retired. Their content remains recoverable from Git history at commit `3124ca2`; they are not part of the current runtime or verification path. [MIGRATION.md](MIGRATION.md) records the migration and its scope.
