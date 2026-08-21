# Research Basis and Optimization Record

Reviewed: **2026-08-20**. This record connects current primary evidence to concrete workflow controls. It does not claim that a prompt-level change improves every model or repository; deterministic tests protect invariants, and repeated matched-model evals remain the promotion standard.

## Result in one page

The optimized workflow keeps a small model-neutral core and loads specialization only when the task needs it:

1. **No provider/model/thinking pin.** Pi uses the operator's active selection. Rules route by capability and provide fallbacks when image input, subagents, extended thinking, or a large context window is absent.
2. **Less always-loaded policy.** `AGENTS.md` is the repository map; detailed procedure stays in on-demand docs, prompts, and skills.
3. **Compact tool surface.** The launcher exposes 19 distinct tools instead of 22. Rare/redundant LSP and raw-cache schemas are omitted from the default surface without uninstalling their packages.
4. **Conditional orchestration.** One primary writer handles normal work. Scout/reviewer/security roles are used only for a named ambiguity or risk; a separate self-review is the universal fallback.
5. **Official defaults unless evidence says otherwise.** Unmeasured compaction, retry, timeout, and thinking overrides were removed. This avoids freezing assumptions that differ across models and providers.
6. **Implementation autonomy, owner-controlled Git.** The agent can inspect, edit, research, install local dependencies, test, and run browser QA. Branches, commits, fetch/pull, refs/history/config, pushes, and GitHub writes remain denied until the owner explicitly authorizes the exact action.
7. **Cheap smoke, rigorous promotion.** Eval defaults to one trial for routine regression feedback; promotion still requires repeated, isolated baseline/candidate trials with identical settings and qualitative review.

## Primary evidence and resulting decisions

| Primary source | Evidence used | Decision here | Limitation |
|---|---|---|---|
| Pi, [settings](https://pi.dev/docs/latest/settings) | Provider/model/thinking, compaction, retry, and timeout settings are optional; Pi supplies documented defaults. | Remove repository model/thinking pins and unmeasured default overrides. Keep only reproducibility/security-relevant package pins and telemetry/version/cache choices. | A real project may later justify a measured override; it should be evaluated before becoming global policy. |
| Pi, [usage and context files](https://pi.dev/docs/latest/usage) and [compaction](https://pi.dev/docs/latest/compaction) | Project context is loaded into every task and compaction already has built-in behavior. | Keep `AGENTS.md` plus the system append concise; retrieve detailed instructions on demand; do not restate built-in compaction defaults. | Exact attention effects vary by model and task. |
| Pi, [skills](https://pi.dev/docs/latest/skills) | Pi initially exposes skill name/description and loads the full skill only when selected. | Retain focused skills because they do not all consume every turn; tighten their triggers instead of merging distinct test, verification, browser, design, and risk contracts. | Poor descriptions can still cause incorrect selection, so trigger tests/review remain necessary. |
| Agent Skills, [specification](https://agentskills.io/specification) and [best practices](https://agentskills.io/skill-creation/best-practices) | Progressive disclosure and concise metadata are part of the interoperable skill model. | Use model-neutral, task-specific descriptions and keep procedural depth in skill bodies/references. | Support and selection behavior differ between hosts. |
| Pi, [custom models](https://pi.dev/docs/latest/models) | Pi supports multiple providers/models and project selection can be overridden at launch. | Treat models as replaceable capabilities; never embed a vendor-specific route in workflow policy. | Model-specific quirks can still require a local, measured adapter. |
| Pi, [releases](https://github.com/earendil-works/pi/releases) | `0.84.2` is the latest release reviewed on 2026-08-20 and includes fixes around custom tools plus configurable default tools. | Update the reviewed Pi pin and integrity record together; re-run compatibility tests on every upgrade. | “Latest” is time-sensitive and must be rechecked during the next update. |
| Google, [function calling](https://ai.google.dev/gemini-api/docs/function-calling) | Google recommends keeping the active tool set small—roughly 10–20 relevant functions—and using clear schemas. | Keep the default at 19 unique tools; omit `lsp_hover`, `lsp_document_symbols`, and `doc_search_get_cached_doc_raw` from the launcher surface. | The useful count depends on task/tool similarity; this is a design bound, not proof of quality. |
| OpenAI, [function calling](https://developers.openai.com/api/docs/guides/function-calling) | Clear purpose, constrained parameters, and minimized model-side argument work improve tool use. | Prefer a few direct tools, argv-array checks, explicit scope, and a single lazy MCP proxy over many overlapping schemas. | Guidance does not replace repository-specific tool-use evals. |
| Google, [prompt design](https://ai.google.dev/gemini-api/docs/prompting-strategies) | Direct instructions, clear structure, and relevant context are more reliable than diffuse prose. | Put only critical invariants in the always-on core; make acceptance and evidence explicit; remove duplicate narrative. | Prompt behavior remains stochastic and model-dependent. |
| OpenAI Codex, [customization](https://developers.openai.com/codex/customization/overview) | Repository guidance should stay scoped and concise, with deeper instructions near the relevant work. | Use `AGENTS.md` as a map and docs/skills as progressive disclosure. | This source describes Codex, so it is supporting cross-agent evidence rather than a Pi contract. |
| Anthropic, [context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) and Stanford/UC Berkeley, [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/) | More context is not automatically better; long inputs can reduce retrieval of relevant evidence. | Enforce byte/line budgets and remove repeated policy. | Neither source is a controlled ablation of this exact Pi repository. |
| Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Start with the simplest composable workflow and add agentic complexity only where it pays. | One writer by default; conditional specialists; at most two evidence-driven evaluator/repair rounds. | Long-horizon or unusually risky work may benefit from more orchestration. |
| OpenAI, [subagents](https://developers.openai.com/codex/subagents) | Subagents add independent context and parallelism but also model/tool/token work. | Preserve the capability but do not invoke it automatically for localized work; use self-review when unavailable or unjustified. | This is cross-agent guidance; Pi package behavior must be tested separately. |
| OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/) | Agent-legible repository maps, mechanical invariants, and executable feedback matter alongside model capability. | Convert recurring rules into guard/tests/doctor checks instead of adding prompt prose. | Experience report, not an isolated causal study of each control. |
| UIUC, [Agentless](https://arxiv.org/abs/2407.01489) | A simple localization → repair → validation pipeline can be competitive and cost-effective. | Make that the default coding path; plans and reviewers must earn their cost. | SWE-bench results do not cover every greenfield/UI/high-risk task. |
| Princeton, [SWE-agent](https://arxiv.org/abs/2405.15793) | Purpose-built navigation/edit/execution interfaces materially affect repository performance. | Keep semantic lookup, exact search/edit, and executable verification, while removing only overlapping schemas. | Results reflect the paper's benchmark/model snapshot. |
| Microsoft Research, [CodePlan](https://arxiv.org/abs/2309.12499) | Cross-file work benefits from dependency-aware planning that adapts as evidence changes. | Use affected-file routing and durable plans only for genuinely cross-module/multi-session work. | Static/manual dependency maps can miss runtime wiring. |
| Meta, [TestGen-LLM](https://arxiv.org/abs/2402.09171) and UMass, [CoverUp](https://arxiv.org/abs/2403.16218) | Generated tests need execution, usefulness, and iterative error/coverage signals; passing alone is insufficient. | Keep separate `test-design` and verification-routing skills; require green plus pre-fix red/mutation/equivalent sensitivity when practical. | Coverage is not equivalent to defect detection or maintainability. |
| OpenAI, [evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) | Use representative task distributions, automated scoring, logs, and predeclared thresholds rather than vibe checks. | Preserve raw traces/artifacts, deterministic graders, matched baseline comparison, and explicit qualitative review. | A useful task distribution must be maintained with real failures. |
| Pi, [RPC mode](https://pi.dev/docs/latest/rpc) | RPC emits structured tool events and session statistics. | Measure tool/error/duplicate/verification/repair/retry/compaction behavior from events, and deterministically reject Git mutation attempts. | Event schemas are version-sensitive. |
| Pi, [security](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md) | Project trust is not sandboxing; real containment is an OS/container/VM concern. | Give trusted implementation broad workspace access, keep secret/destructive/external guards, and use strict container scope for untrusted work. | Regex guards are defense in depth, not a security boundary. |

## Keep / simplify / remove audit

| Surface | Decision | Reason |
|---|---|---|
| `AGENTS.md` + system append | **Simplify** | Always loaded; duplicated routing had ongoing token/attention cost. Critical invariants remain mechanical and concise. |
| Model/provider/thinking defaults | **Remove** | They made the template vendor-specific and could silently override the operator's better/current choice. |
| Compaction/retry/timeout overrides | **Remove** | They duplicated official defaults without repository evidence of a failure mode. |
| `docs/PI_WORKFLOW.md` | **Remove** | Duplicated README/HARNESS and created drift; unique Git authority moved to `docs/GIT_POLICY.md`. |
| 16 slash-command prompts | **Keep on demand** | They cover distinct deliverables and are not all loaded per turn; merging would make selection less precise. |
| 5 specialist skills | **Keep on demand** | Each has a distinct trigger/evidence contract; Pi progressive disclosure avoids constant context cost. |
| Subagent package | **Keep, conditional** | Independent context helps ambiguity/risk, but default invocation adds cost and can dilute ownership. |
| Todo package | **Keep, conditional** | One compact tool helps genuinely multi-step state; localized tasks explicitly avoid it. |
| LSP/docs/web | **Keep compact core** | Semantic/local/current evidence directly improves correctness. Three overlapping/rare schemas were removed from the default surface. |
| Playwright MCP | **Keep lazy** | Browser evidence is necessary for UI behavior; one proxy prevents every Playwright schema from being active at startup. |
| Vision-routing security section | **Remove** | The delegated vision tooling had already been removed, so the section was stale and misleading. |
| Git delivery automation | **Remove from default** | It conflicts with owner authority and creates external/history side effects. A guard plus deterministic eval enforces the boundary. |
| Three default eval trials | **Reduce to one smoke trial** | Cuts routine model calls by 66.7%; repeated trials remain explicitly required for promotion-quality comparisons. |

## Dependency review

Exact versions and registry integrity values are recorded in `.pi/package-integrity.json`.

| Package | Reviewed pin | Decision |
|---|---:|---|
| `@earendil-works/pi-coding-agent` | `0.84.2` | Upgrade from `0.84.1`; current reviewed Pi release. |
| `pi-sub-agent` | `0.1.5` | Keep; already current in the audit. |
| `pi-mcp-adapter` | `2.26.1` | Upgrade from `2.20.1`; reviewed fixes include approval correctness, hang/catalog fixes, and lower startup catalog work. |
| `@juicesharp/rpiv-todo` | `2.6.2` | Upgrade from `2.1.0`; keep conditional use. |
| `pi-lsp-adapter` | `0.1.3` | Keep. |
| `@dreki-gg/pi-doc-search` | `0.3.2` | Keep. |
| `@bytetrue/pi-web-search` | `0.2.1` | Upgrade from `0.1.3`; retain one explicit search provider and safe public fetch behavior. |
| `@playwright/mcp` | `0.0.79` | Keep exact lazy pin and restricted browser tool set. |

## Mechanical changes measured in this audit

| Signal | Before | Optimized | Change |
|---|---:|---:|---:|
| Always-loaded `AGENTS.md` + append | 11,747 bytes / 179 lines | 8,170 bytes / 95 lines | −3,577 bytes (−30.5%), −84 lines |
| Launcher tool schemas | 22 | 19 | −3 (−13.6%); within the reviewed 10–20 active-tool guidance |
| Default eval trials per case | 3 | 1 | −66.7% routine model calls; promotion trials remain opt-in |
| Project model/thinking pins | 2 | 0 | Operator/model neutral |
| Duplicate workflow documents | 2 | 1 canonical playbook | `PI_WORKFLOW.md` removed; `HARNESS.md` retained |

These are structural efficiency gains, not an empirical claim that output quality improved for every model. A paid/provider-backed before/after model evaluation was not executed during this audit; deterministic tests, dry-run validation, package integrity checks, and the measured context/tool reductions are the available evidence. Run repeated matched baseline/candidate trials before claiming model-output superiority.

## Optimized universal loop

1. Classify the task; avoid ceremony for a localized change.
2. For non-trivial work, state 3–7 observable acceptance criteria and expected proof.
3. Search/localize using repository evidence; stop when the decision is supported.
4. Expose the gap with reproduction, test, or explicit `UNPROVEN` status.
5. Implement one coherent slice with one primary writer.
6. Run the cheapest faithful targeted proof first, then affected routes.
7. Use a specialist/evaluator only for a named ambiguity or material risk; otherwise self-review independently.
8. Run the final/full gate once when scope/risk requires it.
9. Inspect the diff and report criterion → evidence/status.
10. Leave all Git/GitHub mutation to the owner unless the current user explicitly delegates one exact action.

## Promotion protocol

For an actual workflow comparison:

- use the same case set, suite fingerprint, model, thinking level, timeout, credentials, and starting files;
- run repeated isolated trials (three is a practical minimum, more when variance is high);
- require 100% deterministic pass rate and zero workflow-safety violations;
- reject new Git/GitHub mutation attempts or protected workflow-file edits;
- reject per-case median regression above the declared thresholds for duration, tool calls, tokens, duplicate calls, repair rounds, or repeated full gates;
- keep qualitative product/design/architecture rubrics `UNSCORED` until a blinded evidence review;
- never weaken thresholds after seeing the candidate result.

Passing deterministic gates yields `QUALITATIVE_REVIEW_REQUIRED`, not automatic promotion.

## Project-specific work that remains

`/bootstrap` should replace template examples with evidence from the real repository:

- canonical commands and actual dependency/workspace boundaries;
- recent production bugs, rejected patches, and realistic fixtures;
- current runtime, flake, cost, and task-variance distributions;
- product-specific security, accessibility, performance, data, and recovery gates;
- affected-file routes with conservative full fallback for unmatched paths.

Optimization must not rely on silent omission. If route/capability evidence is uncertain, widen the check or mark the criterion `UNPROVEN`.
