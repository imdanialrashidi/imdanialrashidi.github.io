#!/usr/bin/env bash
set -Eeuo pipefail

# migrate-pi-to-omp.sh
#
# Safe migration helper for projects using:
#   https://github.com/imdanialrashidi/pi-production-workflow-template
#
# to:
#   https://github.com/imdanialrashidi/omp-production-workflow-template
#
# Default behavior:
#   - run from inside the target Git repository
#   - require a clean worktree
#   - back up every workflow-owned path it replaces/removes
#   - preserve application code, project docs, deployment docs and project CI
#   - remove the old .pi runtime
#   - install the .omp workflow layer
#   - migrate known Pi-specific references in existing project verification/CI
#   - run cheap static migration checks
#   - never commit, push, merge, deploy, install OMP, or mutate external state
#
# After migration:
#   omp
#   /wf-bootstrap
#
# Usage:
#   ./migrate-pi-to-omp.sh
#   ./migrate-pi-to-omp.sh --dry-run
#   ./migrate-pi-to-omp.sh --project /path/to/repo
#   ./migrate-pi-to-omp.sh --ref <branch|tag|commit>
#   ./migrate-pi-to-omp.sh --no-verify
#
# Reverting:
#   The script requires a clean tree by default, so the easiest rollback before
#   committing is:
#       git restore .
#       git clean -fd
#   It also stores an explicit backup under .git/omp-migration-backups/.

VERSION="2.0.0"

DEFAULT_TEMPLATE_URL="https://github.com/imdanialrashidi/omp-production-workflow-template.git"
DEFAULT_TEMPLATE_REF="main"

PROJECT="."
TEMPLATE_URL="${OMP_TEMPLATE_URL:-$DEFAULT_TEMPLATE_URL}"
TEMPLATE_REF="${OMP_TEMPLATE_REF:-$DEFAULT_TEMPLATE_REF}"

DRY_RUN=0
VERIFY=1
FORCE_DIRTY=0
ALLOW_NON_PI=0

log()  { printf '%s\n' "$*"; }
info() { printf '→ %s\n' "$*"; }
ok()   { printf '✓ %s\n' "$*"; }
warn() { printf '⚠ %s\n' "$*" >&2; }
die()  { printf '✗ %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<EOF
Pi → OMP workflow migrator v$VERSION

Usage:
  $(basename "$0") [options]

Options:
  --project PATH       Target repository. Default: current repository
  --template URL       OMP workflow template Git URL
  --ref REF            Template branch/tag/commit. Default: main
  --dry-run            Show the migration plan without changing files
  --no-verify          Skip post-migration static verification
  --force-dirty        Allow a dirty Git worktree (not recommended)
  --allow-non-pi       Install/refresh OMP even if .pi is not present
  -h, --help           Show this help

Environment:
  OMP_TEMPLATE_URL
  OMP_TEMPLATE_REF

Examples:
  $(basename "$0")
  $(basename "$0") --dry-run
  $(basename "$0") --project ~/Code/fast-english
  $(basename "$0") --ref e81dddc0f982d7d7ce819dc584de800f9517853f
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      [[ $# -ge 2 ]] || die "--project requires a path."
      PROJECT="$2"
      shift 2
      ;;
    --template)
      [[ $# -ge 2 ]] || die "--template requires a URL."
      TEMPLATE_URL="$2"
      shift 2
      ;;
    --ref)
      [[ $# -ge 2 ]] || die "--ref requires a branch, tag, or commit."
      TEMPLATE_REF="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --no-verify)
      VERIFY=0
      shift
      ;;
    --force-dirty)
      FORCE_DIRTY=1
      shift
      ;;
    --allow-non-pi)
      ALLOW_NON_PI=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

command -v git >/dev/null 2>&1 || die "git is required."
command -v bash >/dev/null 2>&1 || die "bash is required."

PROJECT="$(cd "$PROJECT" 2>/dev/null && pwd)" || die "Project path does not exist: $PROJECT"
ROOT="$(git -C "$PROJECT" rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || die "Target is not inside a Git repository: $PROJECT"
cd "$ROOT"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
HEAD_SHA="$(git rev-parse HEAD)"
STATUS="$(git status --porcelain=v1 --untracked-files=normal)"

if [[ -n "$STATUS" && "$FORCE_DIRTY" -ne 1 ]]; then
  cat >&2 <<'EOF'
✗ Working tree is not clean.

Commit or stash your current work first, then rerun the migration.
If you intentionally want to continue anyway, use --force-dirty.
EOF
  exit 1
fi

if [[ ! -d .pi && ! -d .omp && "$ALLOW_NON_PI" -ne 1 ]]; then
  cat >&2 <<'EOF'
✗ This repository does not appear to contain a Pi/OMP project workflow.

Expected .pi/ or .omp/.
Use --allow-non-pi only if you intentionally want to install the OMP workflow.
EOF
  exit 1
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/pi-to-omp.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

info "Fetching OMP workflow template..."
git clone --quiet "$TEMPLATE_URL" "$TMP/template" \
  || die "Could not clone OMP workflow template."

if ! git -C "$TMP/template" checkout --quiet "$TEMPLATE_REF" 2>/dev/null; then
  git -C "$TMP/template" fetch --quiet origin "$TEMPLATE_REF" \
    || die "Could not resolve template ref: $TEMPLATE_REF"
  git -C "$TMP/template" checkout --quiet FETCH_HEAD \
    || die "Could not checkout template ref: $TEMPLATE_REF"
fi

TEMPLATE_ROOT="$TMP/template"
TEMPLATE_SHA="$(git -C "$TEMPLATE_ROOT" rev-parse HEAD)"

[[ -d "$TEMPLATE_ROOT/.omp" ]] || die "Template ref does not contain .omp/."
[[ -f "$TEMPLATE_ROOT/AGENTS.md" ]] || die "Template ref does not contain AGENTS.md."
[[ -f "$TEMPLATE_ROOT/scripts/omp-doctor.sh" ]] || die "Template ref does not contain scripts/omp-doctor.sh."

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_ROOT="$ROOT/.git/omp-migration-backups/$STAMP"
REPORT="$BACKUP_ROOT/MIGRATION.txt"

# Paths fully owned by the workflow layer and safe to replace.
REPLACE_PATHS=(
  ".omp"
  "AGENTS.md"
  "Dockerfile.omp"
  "evals"
  "docs/HARNESS.md"
  "docs/GIT_POLICY.md"
  "docs/EVALUATION.md"
  "docs/RESEARCH.md"
  "docs/RESEARCH_PI_BASELINE.md"
  "docs/TOOLING_SETUP.md"
  "docs/PROJECT_CONTEXT.md"
  "docs/VISUAL_REVIEW.md"
  "docs/MIGRATION.md"
  "docs/exec-plans/README.md"
  ".github/omp-runtime"
)

# Workflow implementation files that must move to the OMP-native version.
REPLACE_FILES=(
  "scripts/ai-pr.mjs"
  "scripts/lib/workflow-evals.mjs"
  "scripts/run-workflow-evals.mjs"
  "scripts/verify-affected.mjs"
  "scripts/validate-workflow.mjs"
  "scripts/omp-native-smoke.mjs"
  "scripts/omp-discovery-smoke.ts"
  "scripts/omp-doctor.sh"
  "scripts/omp-sandbox.sh"
  "scripts/validate-project-context.mjs"
  "scripts/validate-skill-evals.mjs"
  "tests/ai-pr.test.mjs"
  "tests/context-readiness.test.mjs"
  "tests/eval-isolation.test.mjs"
  "tests/native-contract.test.mjs"
  "tests/omp-rpc.test.mjs"
  "tests/safety-guard.test.mjs"
  "tests/skill-contract.test.mjs"
  "tests/test-design-contract.test.mjs"
  "tests/verify-affected.test.mjs"
  "tests/workflow-evals.test.mjs"
)

# Old Pi-only runtime files removed after backup.
REMOVE_PATHS=(
  ".pi"
  ".mcp.json"
  "p"
  "Dockerfile.pi"
  "scripts/pi-doctor.sh"
  "scripts/pi-sandbox.sh"
  "scripts/verify-package-integrity.mjs"
  "tests/harness-runtime.test.mjs"
  "tests/launcher.test.mjs"
  "tests/quick-fix-skill.test.mjs"
)

# Project-owned files intentionally preserved.
PRESERVED_CONTEXT=(
  "README.md"
  "SECURITY.md"
  "CONTRIBUTING.md"
  ".env.example"
  ".dockerignore"
  "package.json"
  "docs/PRODUCT.md"
  "docs/ARCHITECTURE.md"
  "docs/QUALITY.md"
  "docs/DESIGN.md"
  "docs/PLAN.md"
  "docs/exec-plans/active"
  "docs/exec-plans/completed"
  ".github/workflows"
  "scripts/project-verify.sh"
  "scripts/verify.sh"
  "scripts/ci-install.sh"
)

print_plan() {
  log
  log "Pi → OMP migration plan"
  log "────────────────────────────────────────────────────────"
  log "Repository:       $ROOT"
  log "Branch:           ${BRANCH:-detached}"
  log "Current commit:   $HEAD_SHA"
  log "Template:         $TEMPLATE_URL"
  log "Template ref:     $TEMPLATE_REF"
  log "Template commit:  $TEMPLATE_SHA"
  log
  log "Replace workflow layer:"
  for p in "${REPLACE_PATHS[@]}"; do
    [[ -e "$TEMPLATE_ROOT/$p" ]] && printf '  • %s\n' "$p"
  done
  for p in "${REPLACE_FILES[@]}"; do
    [[ -e "$TEMPLATE_ROOT/$p" ]] && printf '  • %s\n' "$p"
  done
  log
  log "Remove old Pi-only files when present:"
  for p in "${REMOVE_PATHS[@]}"; do
    [[ -e "$p" ]] && printf '  • %s\n' "$p"
  done
  log
  log "Preserve project/application state:"
  for p in "${PRESERVED_CONTEXT[@]}"; do
    [[ -e "$p" ]] && printf '  • %s\n' "$p"
  done
  log
}

print_plan

if [[ "$DRY_RUN" -eq 1 ]]; then
  log
  ok "Dry run complete. No files were changed."
  exit 0
fi

mkdir -p "$BACKUP_ROOT"

backup_path() {
  local path="$1"
  [[ -e "$path" || -L "$path" ]] || return 0
  mkdir -p "$BACKUP_ROOT/$(dirname "$path")"
  cp -a "$path" "$BACKUP_ROOT/$path"
}

# Backup everything this migration may replace/remove/patch.
info "Creating rollback backup..."
for p in "${REPLACE_PATHS[@]}"; do
  backup_path "$p"
done
for p in "${REPLACE_FILES[@]}"; do
  backup_path "$p"
done
for p in "${REMOVE_PATHS[@]}"; do
  backup_path "$p"
done

backup_path ".gitignore"
backup_path "scripts/verify.sh"

if [[ -d .github/workflows ]]; then
  backup_path ".github/workflows"
fi

cat > "$REPORT" <<EOF
Pi → OMP migration
==================

Migration script version: $VERSION
Date (UTC):             $STAMP
Repository:             $ROOT
Branch:                 ${BRANCH:-detached}
Original commit:        $HEAD_SHA
Template URL:           $TEMPLATE_URL
Template requested ref: $TEMPLATE_REF
Template resolved SHA:  $TEMPLATE_SHA

This directory is an explicit pre-migration backup of workflow-owned and patched paths.
No Git commit, push, merge, deployment, package installation, or external mutation was performed.
EOF

replace_from_template() {
  local path="$1"
  [[ -e "$TEMPLATE_ROOT/$path" || -L "$TEMPLATE_ROOT/$path" ]] || {
    warn "Template path not found; skipping: $path"
    return 0
  }

  rm -rf "$path"
  mkdir -p "$(dirname "$path")"
  cp -a "$TEMPLATE_ROOT/$path" "$path"
}

info "Installing OMP workflow layer..."
for p in "${REPLACE_PATHS[@]}"; do
  replace_from_template "$p"
done

for p in "${REPLACE_FILES[@]}"; do
  replace_from_template "$p"
done

# Project-specific verify/install entrypoints are intentionally preserved.
# Only install the generic template versions if the project does not have them.
if [[ ! -f scripts/verify.sh ]]; then
  replace_from_template "scripts/verify.sh"
fi

if [[ ! -f scripts/ci-install.sh ]]; then
  replace_from_template "scripts/ci-install.sh"
fi

info "Removing obsolete Pi runtime files..."
for p in "${REMOVE_PATHS[@]}"; do
  rm -rf "$p"
done

# Append only the OMP runtime ignore rules we actually need.
# Never replace a project's .gitignore.
touch .gitignore
BEGIN_MARKER="# >>> omp-production-workflow runtime >>>"
END_MARKER="# <<< omp-production-workflow runtime <<<"

if ! grep -Fq "$BEGIN_MARKER" .gitignore; then
  cat >> .gitignore <<'EOF'

# >>> omp-production-workflow runtime >>>
.omp/npm/
.omp/git/
.omp/sessions/
.omp/cache/
.omp/auth.json
.omp/models.json
.omp/trust.json
.omp/mcp.json
.omp/mcp-oauth/
.omp/mcp-traces/
.omp/agent.db*
.omp/config.local.yml
.omp/config.local.yaml
.omp/models.yml
.omp/models.yaml
.omp/state/
.omp/agents.local/
.omp/managed-skills/
# <<< omp-production-workflow runtime <<<
EOF
fi

# Adapt known Pi-specific references in project-owned verification/CI without
# replacing project-specific logic. Node is used only as a text transformer;
# YAML structure is otherwise left intact.
patch_text_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  node - "$file" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
let text = fs.readFileSync(file, "utf8");
const before = text;

// Safe path/command migrations only.
text = text
  .replaceAll("scripts/pi-doctor.sh", "scripts/omp-doctor.sh")
  .replaceAll("scripts/pi-sandbox.sh", "scripts/omp-sandbox.sh")
  .replaceAll(".pi/verification.json", ".omp/verification.json")
  .replaceAll("Dockerfile.pi", "Dockerfile.omp")
  .replaceAll("Run /bootstrap", "Run /wf-bootstrap")
  .replaceAll("run /bootstrap", "run /wf-bootstrap")
  .replaceAll("Pi harness validation", "OMP harness validation")
  .replaceAll("Pi harness", "OMP harness");

// The old package-integrity step is Pi-runtime-specific and has an OMP-native
// replacement in the new doctor/native-smoke contract.
text = text.replace(
  /\n([ \t]*)-\s+name:\s+Verify pinned packages against npm\s*\n\1[ \t]+run:\s+node scripts\/verify-package-integrity\.mjs --online\s*\n/g,
  "\n"
);

if (text !== before) {
  fs.writeFileSync(file, text);
  process.stdout.write(`patched ${file}\n`);
}
NODE
}

command -v node >/dev/null 2>&1 || die "Node.js is required to safely adapt project CI references."

info "Adapting known Pi-specific project references..."
patch_text_file "scripts/verify.sh"

if [[ -d .github/workflows ]]; then
  while IFS= read -r -d '' workflow; do
    patch_text_file "$workflow"
  done < <(find .github/workflows -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) -print0)
fi

# Detect stale Pi-runtime references only in operational surfaces. We do not
# rewrite product/history docs automatically because those may be intentional.
STALE_FILE="$TMP/stale-pi.txt"
: > "$STALE_FILE"

for target in \
  AGENTS.md \
  scripts \
  .github/workflows \
  .omp \
  docs/HARNESS.md \
  docs/GIT_POLICY.md \
  docs/TOOLING_SETUP.md
do
  [[ -e "$target" ]] || continue
  grep -RInE \
    'scripts/pi-doctor\.sh|scripts/pi-sandbox\.sh|verify-package-integrity\.mjs|Dockerfile\.pi|\.pi/verification\.json|(^|[[:space:]])\./p([[:space:]]|$)' \
    "$target" 2>/dev/null >> "$STALE_FILE" || true
done

if [[ -s "$STALE_FILE" ]]; then
  warn "Some stale Pi-runtime references remain and should be reviewed:"
  sed 's/^/  /' "$STALE_FILE" >&2
fi

# Cheap, deterministic verification only. No model calls and no deployment.
VERIFY_FAILED=0
if [[ "$VERIFY" -eq 1 ]]; then
  info "Running static OMP workflow checks..."

  if ! bash scripts/omp-doctor.sh --static; then
    warn "OMP static doctor failed."
    VERIFY_FAILED=1
  fi

  if [[ -f scripts/validate-project-context.mjs ]]; then
    if ! node scripts/validate-project-context.mjs --static; then
      warn "Project-context static validation failed."
      VERIFY_FAILED=1
    fi
  fi

  if [[ -f scripts/validate-skill-evals.mjs ]]; then
    if ! node scripts/validate-skill-evals.mjs; then
      warn "Skill-contract validation failed."
      VERIFY_FAILED=1
    fi
  fi

  if [[ -f scripts/run-workflow-evals.mjs ]]; then
    if ! node scripts/run-workflow-evals.mjs --dry-run; then
      warn "Workflow eval dry-run failed."
      VERIFY_FAILED=1
    fi
  fi
fi

log
log "Migration summary"
log "────────────────────────────────────────────────────────"
ok "OMP workflow installed from $TEMPLATE_SHA"
ok "Project-specific docs and application CI were preserved."
ok "Old .pi runtime files were removed where present."
ok "Backup created at: $BACKUP_ROOT"
log
log "Git changes:"
git status --short || true
log
log "Next:"
log "  1. Review: git diff"
log "  2. Start:  omp"
log "  3. Run:    /wf-bootstrap"
log
log "Optional native runtime check:"
log "  bash scripts/omp-doctor.sh --native"
log
log "Nothing was committed, pushed, merged, deployed, or installed."

if [[ "$VERIFY_FAILED" -ne 0 ]]; then
  log
  warn "Migration files were applied, but one or more static checks failed."
  warn "Inspect the output above and the backup before committing."
  exit 2
fi

ok "Migration completed successfully."
