#!/usr/bin/env bash
# Canonical verification gate for this repository.
# Runs repository/workflow checks first, then the project's real test, type and build lanes.
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail=0

pass() { printf 'PASS  %s\n' "$1"; }
note() { printf 'NOTE  %s\n' "$1"; }
bad() {
  printf 'FAIL  %s\n' "$1" >&2
  fail=$((fail + 1))
}

# 1. No unresolved merge-conflict markers in tracked or untracked text files.
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if markers="$(git grep --untracked -nE '^(<<<<<<< |\|\|\|\|\|\|\| |=======$|>>>>>>> )' -- . 2>/dev/null)"; then
    scan_status=0
  else
    scan_status=$?
  fi
  if [[ "$scan_status" -eq 0 ]]; then
    printf '%s\n' "$markers" >&2
    bad "unresolved merge-conflict markers found"
  elif [[ "$scan_status" -eq 1 ]]; then
    pass "no unresolved merge-conflict markers"
  else
    bad "conflict-marker scan failed (git grep exit $scan_status)"
  fi

  if git diff HEAD --check >/dev/null 2>&1; then
    pass "no whitespace errors in the working diff"
  else
    git diff HEAD --check >&2 || true
    bad "git diff --check reported whitespace errors in the working diff"
  fi

  # A clean CI checkout has no working diff. Check the committed range instead
  # when the CI environment exposes it (quality.yml fetches full history).
  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    base="origin/${GITHUB_BASE_REF}"
    if ! git rev-parse --verify --quiet "$base" >/dev/null; then
      git fetch --quiet --no-tags origin \
        "+refs/heads/${GITHUB_BASE_REF}:refs/remotes/origin/${GITHUB_BASE_REF}" >/dev/null 2>&1 || true
    fi
    if git rev-parse --verify --quiet "$base" >/dev/null; then
      if git diff --check "$base"...HEAD >/dev/null 2>&1; then
        pass "no whitespace errors in $base...HEAD"
      else
        git diff --check "$base"...HEAD >&2 || true
        bad "whitespace errors in the committed PR range $base...HEAD"
      fi
    else
      bad "cannot resolve $base for the committed-range whitespace check"
    fi
  elif [[ "${GITHUB_EVENT_NAME:-}" == "push" ]]; then
    push_base="${PUSH_BEFORE:-}"
    if [[ ! "$push_base" =~ ^[0-9a-f]{40}$ ]] || [[ "$push_base" =~ ^0+$ ]] ||
      ! git rev-parse --verify --quiet "$push_base" >/dev/null; then
      push_base=""
    fi
    if [[ -z "$push_base" ]] && git rev-parse --verify --quiet HEAD^ >/dev/null; then
      push_base="HEAD^"
    fi
    if [[ -n "$push_base" ]]; then
      if git diff --check "$push_base" HEAD >/dev/null 2>&1; then
        pass "no whitespace errors in the pushed range $push_base..HEAD"
      else
        git diff --check "$push_base" HEAD >&2 || true
        bad "whitespace errors in the pushed range $push_base..HEAD"
      fi
    else
      note "shallow single-commit checkout; committed-range whitespace check not executed"
    fi
  fi
else
  note "not a Git worktree; skipping conflict-marker and whitespace checks"
fi

# 2. Node-based workflow and script checks.
if command -v node >/dev/null 2>&1; then
  if node scripts/verify-workflow.mjs; then
    pass "vendored DSH workflow matches .dsh/workflow.json"
  else
    bad "vendored DSH workflow does not match .dsh/workflow.json"
  fi

  for script in scripts/*.mjs; do
    [[ -f "$script" ]] || continue
    if node --check "$script"; then
      pass "syntax: $script"
    else
      bad "syntax error: $script"
    fi
  done
else
  bad "Node.js is required but is not installed"
fi

# 3. Registry-managed domain skills must keep valid frontmatter.
for skill in .agents/skills/*/SKILL.md; do
  [[ -f "$skill" ]] || continue
  frontmatter="$(sed -n '1,/^---$/p' "$skill" | sed '1d;$d')"
  if grep -Eq '^name: .+' <<<"$frontmatter" &&
    grep -Eq '^description: .+' <<<"$frontmatter"; then
    pass "skill frontmatter: $skill"
  else
    bad "skill frontmatter is incomplete: $skill"
  fi
done

# 4. Project lanes. These are also the commands documented in docs/QUALITY.md.
if command -v npm >/dev/null 2>&1; then
  if npm run format:check; then
    pass "format check"
  else
    bad "format check failed"
  fi

  if npm test; then
    pass "tests"
  else
    bad "tests failed"
  fi

  if npm run ci; then
    pass "type/content check and build"
  else
    bad "type/content check or build failed"
  fi

  if node scripts/check-built-site.mjs; then
    pass "built artifact: canonical, sitemap, structured data, budgets"
  else
    bad "built artifact check failed"
  fi
else
  bad "npm is required but is not installed"
fi

printf '\n'
if [[ "$fail" -ne 0 ]]; then
  printf 'verify: %d required check(s) failed\n' "$fail" >&2
  exit 1
fi

printf 'verify: all required checks passed\n'
