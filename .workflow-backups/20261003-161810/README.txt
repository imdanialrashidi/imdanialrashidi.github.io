Pi workflow backup 20261003-161810 — pre-update state for the Pi 1.0 workflow upgrade.
Files are the committed HEAD versions of the workflow surfaces only (product source untouched).
Restore with: cp -a .workflow-backups/20261003-161810/. . (review first) or git revert the upgrade commit.
Two files (.github/workflows/quality.yml, docs/VISUAL_REVIEW.md) lost only a trailing blank line,
because the PR diff whitespace gate rejects new files that end with one. Content is otherwise identical.
