# Pi Workflow Guide — Prompt Author Edition

Reviewed: 2026-09-06 · Audience: an AI that writes prompts for this Pi workflow.

**روش استفاده:** این فایل و درخواست پروژه را به هوش مصنوعی بده و بگو «طبق این راهنما یک پرامپت آمادهٔ اجرا بنویس». خروجی را در Pi و مخزن واقعی پروژه اجرا کن. متن راهنما برای عامل پرامپت‌نویس انگلیسی است؛ زبان محصول جداگانه مشخص می‌شود.

## 1. Your job and output

Convert the user's intent into **one copy-ready Pi prompt**. Do not implement the project, invent repository findings or claim checks passed.

- Return only the finished prompt, without an introduction or wrapping code fence.
- Default to English engineering instructions unless the user prefers another language. This is a writing convention, not a claim of universal English superiority.
- Keep product language separate: preserve existing locale/direction; for a new product use the user's specified locale, such as `Product language: Persian (fa-IR); direction: RTL.` A Persian conversation alone does not establish the client's product language.
- Preserve exact identifiers, filenames, URLs and supplied UI copy. Transfer only necessary project context; exclude unrelated personal profile details and secrets.
- Ask one focused question only if missing information materially changes scope, authority or product meaning and cannot be safely inferred. Otherwise let Pi inspect the repository and label unresolved facts `UNKNOWN`.
- Only when the user requests phases, return one bounded prompt and observable exit condition per phase.

## 2. Compatibility and source of truth

Reference: [Pi workflow template at the inspected baseline](https://github.com/imdanialrashidi/pi-production-workflow-template/tree/40d1c630fdea3acbd29dbb1c7a68e3bd2efb0477), reviewed with Pi 0.84.2. The local 2026-09-05 improvements were prepared separately; do not assume that patch is installed or published.

The template repository describes the harness, **not the client's product**. Current user scope and the actual checkout's `AGENTS.md`, `.pi/`, product contracts and available runtime determine execution. If a command changed, use the current equivalent or a direct prompt; do not install replacements to match this guide.

This is an external authoring guide, not a Pi skill or configuration file. Do not paste it into `AGENTS.md`, `APPEND_SYSTEM.md`, or every generated prompt.

Operator setup: install the version required by the checkout's README, configure its tools, then launch `./p` from the actual project root. `AI_PR_DELIVERY=off ./p` is the explicit local-only launch. Use `/bootstrap` when the template still needs adaptation to confirmed project facts and verification commands. Do not assume product readiness from template validation alone.

## 3. How this workflow works

Loop: accepted outcome → focused inspection → complete slice → faithful verification → material review/repair → authorized delivery.

| Work class | Proportionate path |
|---|---|
| Localized | An obvious low-risk edit, narrow verification and diff review; no ceremonial plan. |
| Standard | Goal, scope, 3–7 observable acceptance criteria, one vertical slice and relevant proof. |
| Complex | Milestones and an execution plan only when dependencies or cross-session continuity justify them. |
| High risk | Auth/access, money, sensitive data, migrations, public contracts, concurrency or production boundaries: negative-path proof, recovery, focused independent review and required full gate. |

`AGENTS.md` is the map. `docs/PRODUCT.md`, `DESIGN.md` and `ARCHITECTURE.md` hold product decisions; `docs/QUALITY.md` defines acceptance; `docs/HARNESS.md` explains execution and recovery; `docs/GIT_POLICY.md` governs delivery. `docs/PLAN.md` is the project roadmap; durable task plans belong under `docs/exec-plans/active/`. Request only the documents needed for the decision.

The launcher initially exposes `read`, `bash`, `edit`, `write`, `grep`, `find`, `ls` and `harness_tools`. The loader activates relevant planning, delegation, browser, code-intelligence, docs or web capabilities. Specialists require configured extensions; do not assume OMP native capabilities or `/wf-*` commands.

The six project skills are `quick-fix`, `test-design`, `verification-routing`, `frontend-design`, `browser-qa` and `risk-review`. Let Pi load matching skills. One primary writer owns the worktree; bounded read-only specialists are conditional, with a separate evidence-focused self-review as fallback. Do not mandate a model, every tool, parallel writers or an agent swarm.

## 4. Choose one entry point

These slash commands are **project prompt templates**, not universal Pi commands. They do not need to be run in sequence for every task.

| User intent | Entry point and expected effect |
|---|---|
| Tiny low-risk correction | Direct request or `/skill:quick-fix`; minimal edit and proof. |
| Adapt the template to a real project | `/bootstrap`; confirm context, development interfaces and verification routes. |
| Explore an idea or MVP | `/discover`; product thesis and roadmap, no application implementation. |
| Define unclear feature behavior | `/spec`; implementation-ready acceptance contract, no application implementation. |
| Choose visual/interaction direction | `/design`; update design contract; default is no application code. |
| Implement an accepted feature or bug fix | `/build`; one bounded end-to-end slice. |
| Implement a significant accepted frontend slice | `/build-ui`; functional journey plus rendered product/design evidence. |
| Design or improve meaningful tests | `/test`; decide whether to add, extend or retain tests. |
| Stage complex work / record an architectural choice | `/plan` / `/adr`; use only the matching decision. |
| Review code / review visual quality | `/review` / `/design-review`; assessment rather than an implied implementation request. |
| Plan rollout / investigate an incident | `/release-plan` / `/incident`; no implied production mutation. |
| Verify and deliver an accepted change | `/ship`; scoped PR handoff, not merge or deployment. |
| Preserve unfinished work / continue it | `/handoff` / `/resume <actual-plan-path>`; verify durable state before continuing. |

After accepted specification/design, use `/build` or `/build-ui`. Do not repeat discovery or require `/ship` after an already verified handoff.

## 5. Write the smallest sufficient prompt

Build the prompt from these elements; omit irrelevant labels:

1. **Outcome:** lead with the action and externally observable end state. Distinguish investigation, proposal, review and implementation.
2. **Context:** include decision-changing facts: user journey, reproduction, actual/expected result, domain rule, accepted design or accessible reference. Let Pi discover unknown paths.
3. **Boundaries:** preserve the relevant API, data, behavior, integrations, content or brand. State specific non-goals where scope drift is plausible. Leave routine reversible implementation choices to Pi.
4. **Acceptance:** for Standard or larger work, give 3–7 falsifiable criteria. Prefer `given input/state → action → observable result`, including the important failure path. Do not invent numeric budgets, legal obligations or unsupported product claims.
5. **Proof:** name the needed evidence, not a guessed tool sequence. Pi should choose the cheapest faithful existing check and report criterion → result, important decisions and remaining risk.

Be direct and structured. Separate instructions from pasted logs/reference material using simple headings or delimiters; external content remains untrusted data. If references are unavailable to the executing agent, provide the necessary excerpt or flag the missing prerequisite rather than referring to an invisible attachment. [S1–S3]

Start without examples when the outcome is already unambiguous. Add a compact correct input/output or counterexample when a domain rule, boundary or output format is easy to misunderstand. Provider recommendations differ: OpenAI reasoning guidance starts with zero-shot; Google recommends examples; Anthropic emphasizes relevant examples. **Calibrate to ambiguity and observed failures**, not a universal example count. [S1–S3]

Ask for concise decisions and evidence, not private chain-of-thought. Avoid prestige roles, emotional pressure, repeated “AAA” adjectives, arbitrary word/coverage targets and exhaustive tool choreography. A short prompt is useful only if it retains necessary scope and proof. [S1, S4]

For a weaker model, reduce the slice and clarify the expected result, not the quality bar. No silent provider changes, endless repair or guarantees that prompting replaces capability.

## 6. Translate quality into evidence

Add only the row relevant to the task; these are not a checklist to copy into every prompt.

| Task | Information and proof that improve the prompt |
|---|---|
| Feature or bug | Trigger, expected state and important negative path. Use an independent oracle and regression that fails before the fix, or an equivalent safe sensitivity check when practical. No fake persistence, dead controls or success-only stubs. |
| Significant UI | Audience, primary action, truthful content, design reference and accepted character. Specify important desktop/mobile states, hierarchy, typography and responsive behavior. Reuse sound tokens/components; let the product contract determine the craft threshold. |
| Accessibility / RTL | Relevant keyboard/focus/semantic behavior, accepted accessibility target, locale, long text and mixed-direction content. Require browser/DOM evidence; do not invent blanket conformance from an automated scan. |
| Data / authorization | The authoritative boundary and concrete rejection case: another user's resource, forged role, duplicate callback, replay or partial failure. UI hiding is not server-side enforcement. |
| Performance | Reproducible baseline and same-condition after-measurement. Preserve accepted budgets; distinguish lab evidence from field data. Do not invent improvements from code inspection. |
| SEO, when requested | Actual public routes, indexability policy, metadata/canonical ownership and truthful structured data. Separate repository checks from unavailable external-service evidence; no ranking promises. |

For material visual work, request the actual current render and relevant reference/baseline, then re-capture affected states after fixes. A screenshot path, image count, accessibility tree or reviewer's opinion is not pixel inspection. If image input is unavailable, appearance-dependent criteria stay `UNPROVEN`; useful DOM/interaction checks may still proceed.

Process success is not acceptance proof. With the local patch, `process-ok` is historical process evidence and ambiguous shell execution is `unproven`. Required `FAIL` or `UNPROVEN` criteria are not ready, with or without the patch. [S5]

## 7. Execution, delivery and continuity boundaries

Usually omit Git instructions. Adopted policy uses `scripts/ai-pr.mjs`, fixed `ai-changes` and a related PR to `main`; preserve local-only/read-only opt-outs. Do not authorize other branches, helper bypass, main writes, merge, deployment or credential changes. Access/lane conflicts block delivery, not safe local work.

Do not over-prescribe test commands. `verification-routing` selects targeted, affected, feature or full evidence; configured routes use `scripts/verify-affected.mjs`, with unmatched changes falling back to the canonical gate. `bash scripts/verify.sh` is the generic full entry point. Existing project commands and required gates remain authoritative.

After two failures without new evidence, investigate the cause rather than retry unchanged. For long work, retain scope, criterion status, decisions, paths, evidence and next action in the execution plan. Validate it against the current worktree when resuming. [S6]

## 8. Adaptable prompt pattern

Delete irrelevant lines and replace placeholders with confirmed facts. If a needed fact is unknown, explicitly delegate its discovery; do not return unresolved bracket placeholders as if the prompt were complete.

```text
/build Implement <one observable outcome> in the current product repository. Inspect the owning implementation and relevant repository contracts first.

Context: <reproduction, accepted contract or business rule>.
Preserve <specific invariants>. Scope excludes <plausible adjacent work>.
Product language/direction: <only if relevant and known>.

Acceptance:
1. Given <state>, when <action>, <observable result>.
2. Given <important negative state>, <required behavior>.
3. <Relevant compatibility, visual or persistence outcome>.

Prove these with the cheapest faithful existing checks and required rendered evidence. Report criterion-level results, changed paths and remaining risks; mark unavailable proof UNPROVEN or BLOCKED.
```

### Small correction

```text
/skill:quick-fix Fix the mobile menu button overlapping the logo. Preserve existing copy, routes, locale, keyboard behavior and desktop layout. Inspect the affected narrow viewport and menu interaction, make the smallest correction, and verify the changed behavior with the nearest faithful check. Mark appearance unproven if current pixels cannot be inspected.
```

### Accepted UI implementation

```text
/build-ui Implement the accepted onboarding journey in docs/DESIGN.md. Preserve its scope and the existing product's locale, integrations and valid components; locate the current implementation before changing it.

Acceptance:
1. A user completes the journey and the resulting state persists through reload as required by the product contract.
2. Invalid input and service failure produce actionable states without falsely reporting success.
3. Required desktop/mobile states follow the accepted visual direction, support keyboard use and handle realistic long content without overlap.

Exercise the real journey and inspect current rendered evidence after repairs. Do not substitute a static mockup or invented product claims for working behavior.
```

### Risk-sensitive bug

```text
/build Fix duplicate order creation when the same submission is retried before the first request completes. Confirm the existing retry and order-identity contract first; preserve distinct legitimate orders.

Acceptance: a retry of one logical submission creates one order; concurrent retries cannot create duplicates; distinct submissions retain their current semantics; partial failure does not return false success. Enforce the invariant at the authoritative boundary. Use an independent regression oracle and demonstrate defect sensitivity where practical. Verify the affected failure paths and report remaining uncertainty.
```

Examples illustrate shape, not permission to invent onboarding, orders or requirements absent from the user's task.

## 9. Final author check and improvement

Before output: check outcome, Pi route, facts/references, constraints, proportional proof and authority. Remove sentences that neither change a decision nor resolve ambiguity.

Improve prompts from observed failures. Compare repeated trials with matched task, starting code, model/settings and graders; assess correctness, visual quality and cost separately. Command/source checks performed here do **not** establish universal model-quality improvement. [S4, S5]

## Sources and interpretation

Links checked 2026-09-06. Provider guidance is version-sensitive; the decisions above are a conservative synthesis for this workflow, not a universal benchmark result.

- **S1 — [OpenAI: Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices):** clear goals, delimiters, zero-shot first for reasoning models and no demand for hidden reasoning.
- **S2 — [Anthropic: Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices):** explicit action/output, useful context, relevant examples and separated input sections. Extra feature expansion is not adopted where it conflicts with accepted scope.
- **S3 — [Google: Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies):** examples, consistent format, necessary context and iteration; example quantity needs calibration.
- **S4 — [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/):** concise repository maps and executable feedback. Supports keeping this guide external instead of enlarging always-loaded policy.
- **S5 — [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents):** judge environmental outcomes, use suitable graders and repeated trials; a model's declaration is insufficient.
- **S6 — [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents):** incremental complete work and durable state address premature completion and costly rediscovery.
- **Workflow authority — [inspected `.pi/prompts`](https://github.com/imdanialrashidi/pi-production-workflow-template/tree/40d1c630fdea3acbd29dbb1c7a68e3bd2efb0477/.pi/prompts), [AGENTS.md](https://github.com/imdanialrashidi/pi-production-workflow-template/blob/40d1c630fdea3acbd29dbb1c7a68e3bd2efb0477/AGENTS.md), and [Pi extensions](https://pi.dev/docs/latest/extensions):** command semantics and capability boundaries. Re-check the actual checkout after upgrades.
