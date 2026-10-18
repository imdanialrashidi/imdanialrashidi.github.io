# Validation evidence

Updated: 2026-08-27. Target runtime: OMP 18.0.6.

This document separates source/contract checks, executable local proof, actual
OMP compatibility and model-quality evaluation. None substitutes for another.

| Evidence | Observed status |
|---|---|
| Source inventory | All 77 original files accounted for with pinned blob IDs |
| Workflow parity | 8 project commands and 7 project skills (3 workflow + 4 conditional domain); removed surfaces map to OMP native commands, bundled agents or default flow; all 17 original eval case IDs remain |
| Project context readiness | `node scripts/validate-project-context.mjs --static` reports the untouched template as `NOT READY`; filled contracts can be promoted to a `--require-ready` gate |
| Domain skill routing | 20 positive/negative routing fixtures (3 positive + 2 negative per skill) pass `node scripts/validate-skill-evals.mjs`; this is structural evidence, not a model-quality benchmark |
| Current pinned OMP CI | GitHub Actions [quality run 33064997850](https://github.com/imdanialrashidi/omp-production-workflow-template/actions/runs/33064997850) passed both jobs on commit `2a3abc3`; native OMP 18.0.6 reported 11 effective project settings, 8 commands and 7 project skills with no model request |
| Local regression suite | 89 tests passed; no failures or skips after duplicate-surface removal, native-agent policy updates, readiness and domain-skill contracts |
| Full template gate | `bash scripts/verify.sh` passed, including shell syntax and safe disposable-copy eval dry-run |
| Meaningful regression fixture | Final-green/pre-fix-red sensitivity check passed in an isolated copy |
| Native CLI/schema/discovery/extension load | The initial 1.0 baseline passed in GitHub Actions `quality` run 32990822166. Every published pruning revision must independently pass the same required workflow; local proof is not substituted. |
| Real browser / visual output | NOT EXECUTED; screenshot/DOM claims require actual product evidence |
| Paid provider/model trials | NOT EXECUTED; no model-quality, cost or latency win is claimed |
| Optional Docker image | NOT EXECUTED in the authoring environment; validate on the intended host |

The authoring environment has Node but no OMP/Bun installation. Local tests use
an isolated writable temporary directory via `TMPDIR`; on a normal host the
system temporary directory is used. RPC unit tests simulate the protocol and do
not pretend to be an installed-runtime test.

The real-runtime CI lane installs exactly `@oh-my-pi/pi-coding-agent@18.0.6`
using Bun 1.3.14 with lifecycle scripts disabled. It checks effective project
settings through the real CLI, then native YAML/schema, command expansion, skill
discovery, role tools and extension loading through the installed OMP SDK.
It makes no provider/model calls and has read-only GitHub permissions.

## Publication and native CI evidence

Implementation commits
[`107a34b0aede6a9aef8ebdccc581d221f36c1311`](https://github.com/imdanialrashidi/omp-production-workflow-template/commit/107a34b0aede6a9aef8ebdccc581d221f36c1311)
and
[`c4463db785b2156445b1bff78f27e5f01e3a0fd9`](https://github.com/imdanialrashidi/omp-production-workflow-template/commit/c4463db785b2156445b1bff78f27e5f01e3a0fd9)
were published on `ai-changes` in
[PR #1](https://github.com/imdanialrashidi/omp-production-workflow-template/pull/1).
All 90 remote file paths and executable modes were verified against the scoped
local tree. This initial empty-repository bootstrap used the owner's selected
GitHub integration; the preserved local Git/gh helper was tested separately,
not used as an installed/authenticated delivery runtime here.

For the initial 1.0 baseline, GitHub Actions
[`quality` run 32990822166](https://github.com/imdanialrashidi/omp-production-workflow-template/actions/runs/32990822166)
completed successfully against `c4463db785b2156445b1bff78f27e5f01e3a0fd9`:

- `workflow-doctor` ran the offline contract/regression gate: 87 passed,
  0 failed and 0 skipped, followed by the safe eval dry-run.
- `native-omp` installed `@oh-my-pi/pi-coding-agent@18.0.6` with lifecycle
  scripts disabled. The real CLI reported 23 effective project settings, and
  the SDK discovery smoke verified YAML/schema loading, all 16 expanded
  commands, all 6 discovered skills, the read-only reviewer and extension load.
- Both jobs completed without a provider/model request and with read-only
  GitHub permissions.

That run closed the actual-runtime acceptance criterion for the initial 1.0
baseline only. The lean native-surface revision must pass its own required CI
checks before promotion. Real product browser/visual QA, paid provider/model
trials and the optional Docker build remain explicitly not executed; they are
separate, non-blocking evidence levels and no measured model-quality, cost or
latency improvement is claimed.

## Independent skill exercises

- Browser QA, fresh context, missing-image negative control: correctly refused
  visual sign-off from screenshot paths, separated DOM evidence from pixel
  evidence, and requested current revision-bound images plus keyboard/error proof.
- Risk review found native patch-path, read-selector, nested Git-discovery,
  starting-input comparability and missing-metric gaps. They were repaired with
  focused regression coverage. Independent closure also verified symlink/mode
  fingerprinting and recovered model errors versus fatal protocol failures:
  14 targeted tests passed, with no remaining concrete findings in that scope.
- Test design, fresh context, isolated tiered-pricing fixture: extended three
  tests to four without changing implementation. The new boundary and rounding
  assertions rejected five focused mutants that passed the original tests;
  the control and full four-test suite passed, with four focused repeat runs.
- These exercises are qualitative evidence, not a statistical model benchmark.

## Reproduce

```bash
bash scripts/verify.sh
bash scripts/omp-doctor.sh --native
OMP_PACKAGE_ROOT=/absolute/path/to/node_modules/@oh-my-pi/pi-coding-agent \
  bun scripts/omp-discovery-smoke.ts
node scripts/run-workflow-evals.mjs --dry-run
```

For promotion, follow [EVALUATION.md](EVALUATION.md): an approved explicit model,
matched repeated trials, independent qualitative grading, and zero required
criteria hidden as unproven. Native dependency reduction is a verified structural
change; improved output quality remains a hypothesis until measured.
