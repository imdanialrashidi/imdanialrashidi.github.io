# Pi Production Workflow Template

A compact, evidence-driven harness for [Pi Coding Agent](https://pi.dev/) focused on high-quality implementation, model-neutral routing, bounded independent evaluation, low-resource verification, distinctive production-grade frontend design, and owner-controlled delivery.

## What this template provides

- a short progressive-disclosure map in `AGENTS.md` instead of a giant always-loaded manual;
- a detailed on-demand harness playbook in `docs/HARNESS.md`;
- a project quality/evaluator contract in `docs/QUALITY.md`;
- a durable product-specific visual contract in `docs/DESIGN.md`;
- acceptance-driven `/build`, `/review`, and `/ship` workflows;
- `/discover` → `/design` → `/build-ui` → `/design-review` workflows for moving from idea to a functional, visually distinctive interface;
- durable execution plans plus `/handoff` and `/resume` for long-running work across fresh contexts;
- Pi-native project settings in `.pi/settings.json`;
- a project launcher (`./p`) with the required tool allowlist;
- bounded read-heavy subagents through the pinned `pi-sub-agent` package;
- on-demand LSP, maintained Context7-backed documentation search, and web search/fetch;
- lazy Playwright MCP browser exploration for localhost and public HTTP(S) pages, with focused page evaluation;
- repository-local Playwright Test (when the real project uses it) for durable regression coverage;
- a visible todo panel for genuinely multi-step work;
- a tested full-workspace guard that blocks secrets, destructive host actions, publication/deployment, browser file exfiltration, and every Git/GitHub mutation unless the owner explicitly enables that exact action;
- specialized skills for frontend design, behavior-sensitive test design, verification routing, risk review, and browser QA;
- a doctor/CI check that validates package pins, security posture, and always-loaded context budgets;
- a 17-case RPC evaluation harness with deterministic safety/scope graders, trace/efficiency metrics, baseline comparison, a one-trial default smoke run, and opt-in repeated trials for promotion decisions.

## Harness philosophy

The workflow follows a simple loop:

```text
intent
→ classify
→ acceptance contract
→ focused discovery
→ one primary writer
→ targeted verification
→ independent evaluator when justified
→ bounded repair
→ final gate
→ acceptance → evidence report
```

For long-running work:

```text
execution plan
→ incremental work
→ /handoff
→ fresh context
→ /resume
```

For a visually significant product slice:

```text
product thesis
→ design contract
→ functional UI slice
→ browser product pass
→ independent studio pass
→ hard gates + craft score
```

The design intentionally avoids agent swarms and giant skill packs. Extra orchestration is added only where it solves a demonstrated failure mode.

See [`docs/HARNESS.md`](docs/HARNESS.md) for the operating playbook and [`docs/GIT_POLICY.md`](docs/GIT_POLICY.md) for the owner-controlled Git boundary.

Contribution and private vulnerability-reporting expectations live in [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md).

## Install

Use Node.js 22.19.0 or newer, matching the reviewed Pi package requirement.

Install Pi:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.84.2
```

Validate the template:

```bash
bash scripts/pi-doctor.sh
```

Start Pi:

```bash
./p
```

`./p` treats this checked-out repository as trusted with Pi's official `--approve` flag, enables the full writable workspace, and uses `PI_GUARD_MODE=autonomous`, so normal implementation does not stall on approval loops. Use `PI_PROJECT_TRUST=ask ./p` to restore Pi's prompt or `PI_PROJECT_TRUST=never ./p` to ignore project resources for a diagnostic run.

In autonomous mode the agent may inspect, edit, install local dependencies, run tests, research, and perform browser QA within the available operating-system permissions. Git delivery remains with the repository owner: no branch creation/switch, stage, commit, fetch, pull, merge, rebase, push, tag, history/ref/config mutation, or GitHub write is permitted unless the owner explicitly requests that exact action in the current conversation.

Complete the one-time tool setup in [`docs/TOOLING_SETUP.md`](docs/TOOLING_SETUP.md).

Authenticate:

```text
/login
```

Select a model:

```text
/model
```

That selects the active model for the session. The template intentionally does not pin a provider, model, or thinking level, so it works with any Pi-supported model and respects the user's selection. For a one-off launch override:

```bash
PI_MAIN_MODEL="provider/model-id" PI_MAIN_THINKING="high" ./p
```

Do not commit API keys or personal model preferences to `.pi/models.env`.

## Daily usage

Start:

```bash
./p
```

For an ordinary task, a natural prompt is enough:

```text
Implement this behavior completely and verify it.
```

Reusable workflows:

```text
/discover <idea or problem>
/design <surface or journey>
/spec <accepted outcome>
/build <accepted task>
/test <behavior, defect, or risk>
/build-ui <accepted UI slice>
/design-review [route, flow, or diff]
/plan <complex goal>
/adr <architecture decision>
/review [scope or acceptance contract]
/release-plan [milestone]
/ship [scope or execution plan]
/incident <symptom or incident>
/handoff <active execution plan or task>
/resume <docs/exec-plans/active/...md>
/bootstrap [project constraints]
```

## Idea-to-product path

| Stage | Command / artifact | Exit evidence |
|---|---|---|
| Discovery | `/discover` → `docs/PRODUCT.md`, `docs/PLAN.md` | Target user/problem, riskiest assumption, measurable MVP outcome |
| Experience direction | `/design` → `docs/DESIGN.md` | Product-specific thesis, signature, tokens, states, responsive/browser proof plan |
| Feature contract | `/spec` or `/plan` | 3–7 observable criteria with proof and explicit non-goals |
| Walking skeleton | `/build` | One real end-to-end path, canonical start/test interfaces, observability |
| Visual MVP slice | `/build-ui` | Functional journey, required states, desktop/mobile evidence, hard gates and craft bar |
| Alpha / beta | `/release-plan` | Controlled cohort, telemetry, support/recovery, field quality and rollback triggers |
| Release candidate | `/review` then `/ship` | Every criterion proven; no unresolved BLOCKER/MAJOR; recovery/rollback ready |
| Production learning | `/incident` plus eval/regression updates | Outcomes and failures become product decisions, tests, or harness eval cases |

Reload project resources:

```text
/reload
```

## Task routing

The harness distinguishes four levels:

- **Localized:** direct inspect → change → targeted check; no ceremony.
- **Standard:** compact acceptance contract, one vertical slice, verification, independent evaluation where useful.
- **Complex:** `/plan` plus a durable execution plan when work must survive context/session boundaries.
- **High risk:** explicit acceptance, risk/security review, negative-path evidence, and full verification before completion.

For Standard or larger work, the acceptance contract contains 3–7 observable criteria and proof required for each. This same contract drives implementation, review, browser QA, and the final report.

## Conditional independent evaluation

The main agent remains the only writer.

It may use a specialist only when the expected evidence is worth the extra model call:

- `scout` when the relevant repository surface or cross-module flow is genuinely unclear;
- `reviewer` after non-trivial user-facing work, cross-module changes, production-bug fixes, or material regression-risk changes;
- `security-auditor` after trust-boundary, money, access, migration, secret, upload, callback, deployment, or data-integrity changes.

Independent evaluation is bounded: by default, no more than two evaluator/repair rounds before the agent must reassess the root cause/contract or report a real blocker.

Configure subagent models with:

```text
/sub-agent-settings
```

Optional role posture (capabilities matter more than vendor/model names):

- Scout: fast model with strong repository/tool use
- Reviewer: model capable of independent code reasoning
- Security auditor: model capable of adversarial trust-boundary analysis
- Parent implementation session: best available coding model for the task's risk and budget

## Production tool stack

The template pins:

```text
pi-sub-agent
pi-mcp-adapter
@juicesharp/rpiv-todo
pi-lsp-adapter
@dreki-gg/pi-doc-search
@bytetrue/pi-web-search
```

The launcher exposes only the required tools. The MCP adapter exposes a compact `mcp` proxy, and Playwright schemas are discovered only when needed.

Useful checks:

```text
/todos
/lsp status
/mcp status
/web --show
```

See [`docs/TOOLING_SETUP.md`](docs/TOOLING_SETUP.md) for LSP, documentation search, web search, and Playwright setup.

## Context and long-running work

`AGENTS.md` is a map, not an encyclopedia. `scripts/pi-doctor.sh` enforces an always-loaded size budget so detailed guidance must live in docs/skills instead of silently consuming task context.

For complex work, use `docs/exec-plans/active/`. The plan stores accepted criteria, verified state, decisions, evidence, risks, and the next action—not raw transcripts.

When old context becomes noisy or the task must cross sessions:

```text
/handoff docs/exec-plans/active/my-task.md
```

Start a fresh session, then:

```text
/resume docs/exec-plans/active/my-task.md
```

The fresh agent validates the plan against the working tree before continuing.

## Failure recovery

The agent must not repeat the same failed approach indefinitely. After the same approach/check fails twice without materially new evidence, it should:

- preserve the exact failure;
- state competing root-cause hypotheses;
- gather the cheapest discriminating evidence;
- use semantic/local evidence before broad external research;
- use one focused independent investigation if needed;
- hand off to a fresh context when stale history is becoming harmful.

Recurring failure classes should become tests, types/schemas, lint/structural checks, clearer APIs/tools, or focused docs—not more generic prompt text.

## Safety model

The normal launcher is intentionally **not sandboxed**. Pi runs directly with the operating-system permissions of the account that starts it, and the agent is expected to finish reversible work without permission popups.

`.pi/extensions/safety-guard.js` intercepts direct tool paths and common shell/MCP patterns for:

- sensitive credential and private-key paths;
- destructive recursive deletion;
- privilege escalation and host service mutation;
- every Git/GitHub mutation by default, while preserving read-only inspection such as `status`, `diff`, `log`, and `gh ... view/list/checks`;
- global package installation and publishing;
- remote shell, deployment, infrastructure, and production database commands;
- secret-bearing or protected paths even when the rest of the workspace is writable;
- browser file upload/drop and MCP scripting.

Autonomous mode deliberately allows harness-policy edits, generated artifacts, full-workspace writes, public HTTP(S) navigation, and focused `browser_evaluate`. Git mutation is a separate deny-by-default boundary and is not unlocked by autonomous mode. This is an accident-reduction layer, not a complete shell/interpreter parser or security boundary.

To diagnose without project trust or to opt into the older locks:

```bash
PI_PROJECT_TRUST=never ./p
PI_GUARD_MODE=strict ./p
```

The Docker boundary is optional and reserved for an untrusted repository, sensitive credentials/data, or genuinely unattended execution—not normal project work:

```bash
bash scripts/pi-sandbox.sh
```

The wrapper enables strict guard mode, does not mount host Pi state, SSH/cloud credentials, or the Docker socket, and passes only recognized provider/search keys. The repository remains a read/write bind mount. See [`SECURITY.md`](SECURITY.md) and Pi's [official security guidance](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md) for the exact trust/isolation distinction.

## Harness evaluation

Validate the starter benchmark without making model calls:

```bash
node scripts/run-workflow-evals.mjs --dry-run
```

The v2 runner grades completion, mutation scope, protected paths, owner-controlled Git, executable post-checks, and trace efficiency; qualitative rubrics remain explicitly unscored. The default single trial is a cheap smoke/regression signal. For a promotion decision, explicitly run repeated isolated trials with identical model/thinking settings for baseline and candidate and pass the first `summary.json` through `--baseline`. Model calls can incur cost and transmit repository content to the selected provider. See [`docs/EVALUATION.md`](docs/EVALUATION.md).

## Verification

The `verification-routing` skill chooses the cheapest reliable lane.

During implementation:

- exact affected test;
- a reviewed affected-file plan;
- changed/dependency-related tests;
- fast verification;
- one affected browser spec where relevant.

Inspect and execute the deterministic route map:

```bash
node scripts/verify-affected.mjs --file src/path/to/change.ts --plan
node scripts/verify-affected.mjs --file src/path/to/change.ts
```

`.pi/verification.json` stores argv-array commands. Matching routes are unioned and deduplicated; any unmatched file invokes the canonical full fallback instead of being silently skipped. `/bootstrap` must replace template routes with real project dependency evidence.

After a bounded slice:

- feature verification once.

Before final delivery or after High-risk changes:

- full verification once.

Generic full entrypoint:

```bash
bash scripts/verify.sh
```

A real project can provide `scripts/project-verify.sh` to replace the generic detector with its canonical gate. Use `/test` plus `test-design` when the task is specifically to add behavioral regression coverage with red/pre-fix or equivalent defect-sensitivity proof.

## Browser and visual QA

Browser work has two layers:

- Playwright MCP for interactive exploration, accessibility snapshots, console/network inspection, and focused actions;
- repository-local Playwright Test for deterministic regression coverage and CI.

Local development policy:

- no `CI=1`;
- one relevant browser project;
- one worker;
- zero retries;
- video/trace/automatic screenshots off;
- reuse servers;
- run a specific spec.

For a material visual change, the product pass proves journey, states, accessibility, responsiveness, console/network health, and budgets. The studio pass uses deterministic rendered evidence and the `frontend-design` rubric. Browser-observable evidence is authoritative; screenshots are retained as artifacts and appearance-only criteria are reported `UNPROVEN` whenever the active model cannot inspect image inputs.

## Repository layout

```text
.
├── AGENTS.md
├── .mcp.json
├── p
├── .pi/
│   ├── APPEND_SYSTEM.md
│   ├── models.env
│   ├── settings.json
│   ├── verification.json
│   ├── extensions/
│   │   └── safety-guard.js
│   ├── prompts/
│   │   ├── discover.md / design.md / spec.md / adr.md
│   │   ├── build.md / build-ui.md / design-review.md
│   │   └── test.md / plan.md / release-plan.md / review.md / ship.md / incident.md / handoff.md / resume.md
│   └── skills/
│       ├── browser-qa/
│       ├── frontend-design/
│       ├── risk-review/
│       ├── test-design/
│       └── verification-routing/
├── docs/
│   ├── PRODUCT.md / DESIGN.md / ARCHITECTURE.md / PLAN.md
│   ├── HARNESS.md
│   ├── GIT_POLICY.md
│   ├── RESEARCH.md
│   ├── QUALITY.md
│   ├── TOOLING_SETUP.md
│   └── exec-plans/
│       └── README.md
├── scripts/
└── .github/workflows/quality.yml
```

## New-project workflow

1. Create a repository from this template.
2. Add/import the real product source.
3. Review the template once when adopting it, then run `./p`; the launcher trusts this checked-out project automatically.
4. Complete `docs/TOOLING_SETUP.md` once for the machine/project.
5. Run `/bootstrap` to make product, architecture, design, quality, verification, and runtime interfaces project-specific.
6. Use `/discover` for an unproven idea; use `/design` before visually significant implementation.
7. Deliver ordinary slices with `/build` and flagship/frontend slices with `/build-ui`.
8. Use `/plan` only for work that genuinely needs durable design/execution state.
9. Use `/design-review` and `/review` for independent visual/product/risk evaluation.
10. Use `/handoff` + `/resume` for long-running work across clean contexts.
11. Use `/release-plan` for staged rollout and `/ship` for final acceptance plus an owner-ready handoff; the owner performs Git delivery unless explicitly delegating a specific Git action.

## Updating Pi and packages

Pi is intentionally pinned. After reviewing a release, update the exact version in the install command, `Dockerfile.pi`, doctor requirement, and integrity manifest together; then reinstall explicitly. Do not use an unreviewed floating self-update as the template's upgrade path.

Project packages are exact pins in `.pi/settings.json`; `pi update --extensions` does not advance versioned npm specs. Change one exact pin only after reviewing its source/release and testing it in a disposable copy/container.

The reviewed npm tarball integrities live in `.pi/package-integrity.json`. Verify them against the registry during an intentional update:

```bash
node scripts/verify-package-integrity.mjs --online
```

## Research basis

[`docs/RESEARCH.md`](docs/RESEARCH.md) maps primary evidence from OpenAI, Anthropic, Princeton, UIUC, Microsoft Research, Meta, UMass, Stanford/Berkeley, Google, and regression-test-selection research to each workflow control and its limitations. The visual workflow additionally maps primary guidance from [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Google Web Vitals](https://web.dev/articles/vitals), [Material Design foundations/tokens](https://m3.material.io/styles), and Anthropic's [frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) into executable gates.

## License

No license has been selected yet. The repository owner must choose and add one before presenting the template as reusable; this legal/product decision is intentionally not guessed by the workflow.
