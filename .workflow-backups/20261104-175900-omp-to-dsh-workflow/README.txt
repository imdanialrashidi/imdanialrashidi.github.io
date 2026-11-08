Pre-migration backup: omp workflow -> DSH Workflow (dsh-workflow v0.1).

Source of the replacement workflow:
https://github.com/imdanialrashidi/dsh-workflow
commit 93c9281a768e8ebf795b9e19108ab8934089ac76 (2026-10-25)

Restore a file (from repository root), for example:
  cp -a .workflow-backups/<this-dir>/.omp ./.omp
  cp -a .workflow-backups/<this-dir>/AGENTS.md ./AGENTS.md
  cp -a .workflow-backups/<this-dir>/scripts/omp-pr.mjs ./scripts/omp-pr.mjs
  cp -a .workflow-backups/<this-dir>/docs/HARNESS.md ./docs/HARNESS.md
  ...and the matching paths under docs/, .github/, scripts/.

All replaced files also remain available in git history from the commit
preceding this migration. This directory is a convenience copy, not a
second source of truth.
