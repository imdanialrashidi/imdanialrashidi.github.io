# Contributing

Contributions should improve representative task outcomes, reduce risk or cost, or make the workflow easier to operate. More prompt text or orchestration is not automatically an improvement.

## Setup

1. Use Node.js 22.19.0 or newer (CI pins 22.23.2).
2. Install dependencies with `bash scripts/ci-install.sh`.
3. Run DSH (`dsh web`, or `npx @deepseek-ai/dsh web`) and pick a model. The project workflow ships as seven DSH skills under `.dsh/skills/` plus this repository's `AGENTS.md`; no separate install is required. Start a new DSH session after changing workflow files so the skill catalog is reloaded.
4. Review project-local scripts and workflow configuration before trusting the repository.
5. Run `bash scripts/verify.sh` before and after a workflow change.
6. Delivery is explicit, not automatic. See [docs/GIT_POLICY.md](docs/GIT_POLICY.md).

## Change contract

For a non-trivial change, state:

- problem and accepted outcome;
- explicit non-goals;
- observable criteria and proof;
- compatibility, security, data, accessibility, performance, visual, and operational risk where relevant;
- rollback or targeted reversal.

Preserve unrelated work and keep one primary writer. Do not add dependencies without a concrete benefit over current or platform capabilities.

## Workflow maintenance

Workflow maintenance is allowed in the default autonomous mode. Keep it explicitly scoped, update every affected source-of-truth document and `CHANGELOG.md`, and rely on the tested diff and CI evidence.

The seven skills in `.dsh/skills/` are vendored from [dsh-workflow](https://github.com/imdanialrashidi/dsh-workflow) v0.2 at the commit in `.dsh/workflow.json`. To update them:

1. Review the upstream diff and changelog at a specific commit.
2. Copy the seven `skills/<name>/SKILL.md` files into `.dsh/skills/<name>/SKILL.md`.
3. Update `version`, `commit`, `retrievedAt`, and every sha256 in `.dsh/workflow.json` (`sha256sum .dsh/skills/*/SKILL.md`).
4. Run `node scripts/verify-workflow.mjs` and `bash scripts/verify.sh`.
5. Record the upstream commit and the behavior change in `CHANGELOG.md`.

Do not hand-edit a vendored skill. A project rule belongs in `AGENTS.md` or the owning document; a procedure change belongs upstream. Keep `AGENTS.md` short and keep one home for each rule.

## Verification

```bash
bash scripts/verify.sh
```

The canonical gate checks:

- no unresolved merge-conflict markers or whitespace errors;
- the vendored workflow matches `.dsh/workflow.json`;
- scripts parse and registry-managed skill frontmatter is valid;
- `npm run format:check`, `npm test`, and `npm run ci` (`astro check` plus build).

Run the nearest test plus `npm run check` for a localized change. Report each check as `PASS`, `FAIL`, `BLOCKED`, `UNPROVEN`, or `NOT EXECUTED`. Do not replace a blocked check with an invented command.

## Frontend contributions

- Follow the accepted [docs/DESIGN.md](docs/DESIGN.md); update it before introducing a new visual direction.
- Prove the critical journey and required states in a real browser when a browser-capable tool is available. Without a real render, mark visual and interaction claims `UNPROVEN`.
- Include deterministic desktop/mobile/demanding-state evidence for a material visual change.
- Report hard-gate results; aesthetics never cancel a functional, accessibility, or performance failure.
- Record third-party font, media, and icon sources and licenses.

## Pull request evidence

Complete the pull-request template. Link exact commands and outcomes, not “tests pass.” Include screenshots only when they are deterministic, non-sensitive, and materially help review.

Report vulnerabilities privately using [SECURITY.md](SECURITY.md), not a public issue or pull request.
