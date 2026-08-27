#!/usr/bin/env bash
set -Eeuo pipefail

# migrate-pi-to-omp.sh
# Professional Pi → OMP workflow migrator
#
# Source workflow:
#   https://github.com/imdanialrashidi/pi-production-workflow-template
#
# Destination workflow:
#   https://github.com/imdanialrashidi/omp-production-workflow-template
#
# What it does:
#   - preserves application code and project-specific product/architecture/design docs
#   - preserves project-specific CI/deployment workflows
#   - replaces only the shared workflow/harness layer
#   - removes obsolete Pi runtime files
#   - adapts known Pi references in existing project-owned verification/CI
#   - keeps a rollback backup under .git/omp-migration-backups/
#   - supports repairing an interrupted/failed previous migration
#   - runs deterministic local workflow verification
#
# What it never does:
#   - commit
#   - push
#   - merge
#   - deploy
#   - rotate credentials
#   - install OMP
#   - mutate external state
#
# Normal usage:
#   ./migrate-pi-to-omp.sh
#
# Repair an interrupted migration:
#   ./migrate-pi-to-omp.sh --repair
#
# Preview only:
#   ./migrate-pi-to-omp.sh --dry-run
#
# After success:
#   omp
#   /wf-bootstrap

VERSION="2.3.0"

DEFAULT_TEMPLATE_URL="https://github.com/imdanialrashidi/omp-production-workflow-template.git"
DEFAULT_TEMPLATE_REF="main"

PROJECT="."
TEMPLATE_URL="${OMP_TEMPLATE_URL:-$DEFAULT_TEMPLATE_URL}"
TEMPLATE_REF="${OMP_TEMPLATE_REF:-$DEFAULT_TEMPLATE_REF}"

DRY_RUN=0
VERIFY=1
REPAIR=0
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
  --repair             Repair/resume a previous incomplete migration
  --no-verify          Skip deterministic post-migration verification
  --force-dirty        Allow unrelated dirty files (not recommended)
  --allow-non-pi       Install/refresh OMP even if no .pi/.omp exists
  -h, --help           Show help

Environment:
  OMP_TEMPLATE_URL
  OMP_TEMPLATE_REF

Examples:
  $(basename "$0")
  $(basename "$0") --dry-run
  $(basename "$0") --repair
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
    --repair)
      REPAIR=1
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
command -v node >/dev/null 2>&1 || die "Node.js is required."

PROJECT="$(cd "$PROJECT" 2>/dev/null && pwd)" || die "Project path does not exist: $PROJECT"
ROOT="$(git -C "$PROJECT" rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || die "Target is not inside a Git repository: $PROJECT"
cd "$ROOT"

HEAD_SHA="$(git rev-parse HEAD)"
BRANCH="$(git branch --show-current 2>/dev/null || true)"
STATUS="$(git status --porcelain=v1 --untracked-files=normal)"

BACKUP_BASE="$ROOT/.git/omp-migration-backups"
LATEST_BACKUP=""
if [[ -d "$BACKUP_BASE" ]]; then
  LATEST_BACKUP="$(find "$BACKUP_BASE" -mindepth 1 -maxdepth 1 -type d -print 2>/dev/null | sort | tail -n 1 || true)"
fi

if [[ "$REPAIR" -eq 1 ]]; then
  [[ -d .omp ]] || die "--repair requires an existing partial OMP migration (.omp/ not found)."
  [[ -n "$LATEST_BACKUP" && -f "$LATEST_BACKUP/MIGRATION.txt" ]] \
    || die "--repair could not find a previous migration backup under .git/omp-migration-backups/."

  BACKUP_REPO="$(
    sed -n 's/^Repository:[[:space:]]*//p' "$LATEST_BACKUP/MIGRATION.txt" | head -n 1
  )"
  ORIGINAL_SHA="$(
    sed -n 's/^Original commit:[[:space:]]*//p' "$LATEST_BACKUP/MIGRATION.txt" | head -n 1
  )"

  if [[ -n "$BACKUP_REPO" && "$BACKUP_REPO" != "$ROOT" ]]; then
    die "The latest migration backup belongs to a different repository: $BACKUP_REPO"
  fi

  # HEAD may legitimately move between a failed migration and a repair
  # (for example after a local commit, branch update, or tooling operation).
  # Repair is still safe because we create a fresh snapshot of the CURRENT
  # partial state before touching workflow-owned files and never rewrite
  # product/application state.
  if [[ -n "$ORIGINAL_SHA" && "$ORIGINAL_SHA" != "$HEAD_SHA" ]]; then
    warn "Repository HEAD changed since the original migration."
    warn "Original: $ORIGINAL_SHA"
    warn "Current:  $HEAD_SHA"
    warn "Continuing in repair mode with a fresh pre-repair backup."
  fi

  warn "Repair mode: existing migration changes will be completed in place."
  warn "Original rollback backup remains: $LATEST_BACKUP"
elif [[ -n "$STATUS" && "$FORCE_DIRTY" -ne 1 ]]; then
  cat >&2 <<'EOF'
✗ Working tree is not clean.

Commit or stash your work first.

If this dirtiness is from a previous failed run of this migration script, use:
  ./migrate-pi-to-omp.sh --repair

Use --force-dirty only when you intentionally accept the risk of mixing unrelated
local edits with the migration.
EOF
  exit 1
fi

if [[ ! -d .pi && ! -d .omp && "$ALLOW_NON_PI" -ne 1 ]]; then
  cat >&2 <<'EOF'
✗ No Pi or OMP project workflow was detected.

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

[[ -d "$TEMPLATE_ROOT/.omp" ]] || die "Template does not contain .omp/."
[[ -f "$TEMPLATE_ROOT/AGENTS.md" ]] || die "Template does not contain AGENTS.md."
[[ -f "$TEMPLATE_ROOT/scripts/omp-doctor.sh" ]] || die "Template does not contain scripts/omp-doctor.sh."
[[ -f "$TEMPLATE_ROOT/scripts/lib/eval-isolation.mjs" ]] || die "Template is missing scripts/lib/eval-isolation.mjs."
[[ -f "$TEMPLATE_ROOT/scripts/lib/omp-rpc.mjs" ]] || die "Template is missing scripts/lib/omp-rpc.mjs."

# Workflow-owned paths: replace from the reviewed OMP template.
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
  "docs/VALIDATION.md"
  "docs/exec-plans/README.md"

  ".github/omp-runtime"

  "scripts/ai-pr.mjs"
  "scripts/lib/eval-isolation.mjs"
  "scripts/lib/omp-rpc.mjs"
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

# Pi-only runtime files removed after backup.
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

# Explicitly project-owned state: never replaced by this migration.
PRESERVE_PATHS=(
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

  "scripts/verify.sh"
  "scripts/ci-install.sh"
  "scripts/project-verify.sh"
)

print_plan() {
  log
  log "Pi → OMP migration plan"
  log "────────────────────────────────────────────────────────"
  log "Repository:       $ROOT"
  log "Mode:             $([[ "$REPAIR" -eq 1 ]] && echo repair || echo migration)"
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

  log
  log "Remove old Pi-only files when present:"
  for p in "${REMOVE_PATHS[@]}"; do
    [[ -e "$p" || -L "$p" ]] && printf '  • %s\n' "$p"
  done

  log
  log "Preserve project/application state:"
  for p in "${PRESERVE_PATHS[@]}"; do
    [[ -e "$p" || -L "$p" ]] && printf '  • %s\n' "$p"
  done
  log
}

print_plan

if [[ "$DRY_RUN" -eq 1 ]]; then
  ok "Dry run complete. No files were changed."
  exit 0
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

# Always snapshot the CURRENT state before this run.
# In repair mode this is a pre-repair snapshot, while the original backup is
# retained separately. This makes repair reversible even when HEAD moved.
if [[ "$REPAIR" -eq 1 ]]; then
  BACKUP_ROOT="$BACKUP_BASE/${STAMP}-repair"
else
  BACKUP_ROOT="$BACKUP_BASE/$STAMP"
fi
mkdir -p "$BACKUP_ROOT"

backup_path() {
  local path="$1"
  [[ -e "$path" || -L "$path" ]] || return 0
  mkdir -p "$BACKUP_ROOT/$(dirname "$path")"
  cp -a "$path" "$BACKUP_ROOT/$path"
}

if [[ "$REPAIR" -eq 1 ]]; then
  info "Creating fresh pre-repair backup..."
else
  info "Creating rollback backup..."
fi

for p in "${REPLACE_PATHS[@]}"; do backup_path "$p"; done
for p in "${REMOVE_PATHS[@]}"; do backup_path "$p"; done
backup_path ".gitignore"
backup_path "scripts/verify.sh"
backup_path ".github/workflows"

cat > "$BACKUP_ROOT/MIGRATION.txt" <<EOF
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
Previous backup:        ${LATEST_BACKUP:-none}

This directory contains the pre-migration state for workflow-owned/patched paths.
No commit, push, merge, deployment, package installation, or external mutation
was performed by the migration script.
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

# Project-specific verification/install entrypoints are preserved.
# Only install generic versions if absent.
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

# Never replace the project's .gitignore. Add only a marked OMP runtime block.
touch .gitignore
BEGIN_MARKER="# >>> omp-production-workflow runtime >>>"

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

# Adapt known Pi-only references in project-owned operational files.
# This intentionally performs only narrow, reviewed substitutions.
patch_operational_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  node - "$file" <<'NODE'
const fs = require("node:fs");

const file = process.argv[2];
let text = fs.readFileSync(file, "utf8");
const before = text;

text = text
  .replaceAll("scripts/pi-doctor.sh", "scripts/omp-doctor.sh")
  .replaceAll("scripts/pi-sandbox.sh", "scripts/omp-sandbox.sh")
  .replaceAll(".pi/verification.json", ".omp/verification.json")
  .replaceAll("Dockerfile.pi", "Dockerfile.omp")
  .replaceAll("Run /bootstrap", "Run /wf-bootstrap")
  .replaceAll("run /bootstrap", "run /wf-bootstrap")
  .replaceAll("Pi harness validation", "OMP harness validation")
  .replaceAll("Pi harness", "OMP harness");

// Pi's package-integrity check was replaced by the OMP doctor/native-contract
// validation. Remove only the exact old GitHub Actions step.
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

info "Adapting known Pi-specific project references..."
patch_operational_file "scripts/verify.sh"

if [[ -d .github/workflows ]]; then
  while IFS= read -r -d '' workflow; do
    patch_operational_file "$workflow"
  done < <(
    find .github/workflows -maxdepth 1 -type f \
      \( -name '*.yml' -o -name '*.yaml' \) -print0
  )
fi

# The upstream workflow template contains a couple of tests that intentionally
# assert properties of the untouched TEMPLATE documents. Those assertions are
# valid in the template repository itself, but become false positives after
# migration because this script deliberately preserves the target project's
# already-specialized PRODUCT/QUALITY documents.
#
# Normalize only those template-self-tests so they test synthetic template
# inputs / workflow-owned contracts instead of requiring project docs to be
# reset to generic template text.
normalize_migrated_tests() {
  node <<'NODE'
const fs = require("node:fs");

function replaceExact(file, before, after) {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes(after)) return; // already normalized / idempotent
  if (!text.includes(before)) {
    throw new Error(`Expected migration test block not found in ${file}; template changed and needs review.`);
  }
  fs.writeFileSync(file, text.replace(before, after));
  process.stdout.write(`normalized ${file}\n`);
}

replaceExact(
  "tests/context-readiness.test.mjs",
`test("the untouched template is explicitly not ready for product work", () => {
  const report = analyzeProjectContext();
  assert.equal(report.ready, false);
  assert.equal(report.documents.length, contextDocuments.length);
  assert(report.documents.every((document) => document.signals.length > 0));
  assert(report.blockedDocuments.includes("docs/PRODUCT.md"));
});`,
`test("an untouched template-shaped context is explicitly not ready for product work", () => {
  const templateDocuments = Object.fromEntries(
    contextDocuments.map(({ path }) => [
      path,
      "# Template contract\\\\n\\\\n- Primary users:\\\\n\\\\nKeep this document short after /wf-bootstrap.\\\\n",
    ]),
  );
  const report = analyzeProjectContext(templateDocuments);
  assert.equal(report.ready, false);
  assert.equal(report.documents.length, contextDocuments.length);
  assert(report.documents.every((document) => document.signals.length > 0));
  assert(report.blockedDocuments.includes("docs/PRODUCT.md"));
});`
);

replaceExact(
  "tests/test-design-contract.test.mjs",
`test("the OMP test command can intentionally retain existing evidence", async () => {
  const [prompt, agents, harness, quality] = await Promise.all([
    read(".omp/commands/wf-test.md"),
    read("AGENTS.md"),
    read("docs/HARNESS.md"),
    read("docs/QUALITY.md"),
  ]);

  assert.match(prompt, /Apply the Test Value Gate/);
  assert.match(prompt, /\`No new test\` is valid/);
  assert.match(agents, /When tests are added or materially changed, use \`test-design\`/);
  assert.match(harness, /pass its Test Value Gate/);
  assert.match(quality, /Coverage, assertion count, and test count are diagnostic signals/);
});`,
`test("the OMP test workflow can intentionally retain existing evidence", async () => {
  const [prompt, agents, harness, skill] = await Promise.all([
    read(".omp/commands/wf-test.md"),
    read("AGENTS.md"),
    read("docs/HARNESS.md"),
    read(".omp/skills/test-design/SKILL.md"),
  ]);

  assert.match(prompt, /Apply the Test Value Gate/);
  assert.match(prompt, /\`No new test\` is valid/);
  assert.match(agents, /When tests are added or materially changed, use \`test-design\`/);
  assert.match(harness, /pass its Test Value Gate/);
  assert.match(skill, /No new test is a valid outcome/);
  assert.match(skill, /Do not create tests to hit a count, percentage, uncovered line/);
});`
);
NODE
}

info "Normalizing template-only tests for a migrated real project..."
normalize_migrated_tests

# Check only operational surfaces.
# IMPORTANT: .omp/migration-map.json intentionally contains historical Pi paths,
# so .omp is deliberately excluded from this stale-runtime scan.
STALE_FILE="$TMP/stale-pi.txt"
: > "$STALE_FILE"

for target in \
  AGENTS.md \
  scripts \
  .github/workflows \
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
  warn "Operational Pi-runtime references remain and need review:"
  sed 's/^/  /' "$STALE_FILE" >&2
fi

VERIFY_FAILED=0

if [[ "$VERIFY" -eq 1 ]]; then
  info "Running deterministic OMP workflow verification..."

  # --ci runs workflow contract validation + project-context informational check
  # + skill contracts + Node tests + eval dry-run. It does not call a model.
  if ! bash scripts/omp-doctor.sh --ci; then
    VERIFY_FAILED=1
  fi

  # Native smoke is useful only when OMP is already installed. Do not install it.
  if command -v omp >/dev/null 2>&1; then
    info "OMP detected; running native runtime smoke..."
    if ! node scripts/omp-native-smoke.mjs; then
      warn "Native OMP smoke failed."
      VERIFY_FAILED=1
    fi
  else
    warn "OMP is not installed; native runtime smoke was NOT EXECUTED."
    warn "After installing the reviewed OMP version, run: bash scripts/omp-doctor.sh --native"
  fi
fi

log
log "Migration summary"
log "────────────────────────────────────────────────────────"
ok "OMP workflow synchronized from $TEMPLATE_SHA"
ok "Project-specific application code/docs/CI were preserved."
ok "Old Pi runtime files were removed where present."
ok "Rollback backup: $BACKUP_ROOT"

log
log "Git changes:"
git status --short || true

log
log "Next:"
log "  1. Review: git diff"
log "  2. Start:  omp"
log "  3. Run:    /wf-bootstrap"
log
log "Nothing was committed, pushed, merged, deployed, installed, or published."

if [[ "$VERIFY_FAILED" -ne 0 ]]; then
  log
  warn "Migration is applied, but deterministic verification is not fully green."
  warn "Do not commit yet. Review the failure above or rerun this script with --repair after fixing the prerequisite."
  exit 2
fi

ok "Migration completed successfully."
