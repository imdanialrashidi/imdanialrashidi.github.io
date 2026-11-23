# Git and Delivery Policy

## Default: local only

Inspecting the tree, editing files, and running local checks are within normal work. Do **not** commit, push, create or update a pull request, merge, close, tag, release, deploy, or change repository settings unless the current request explicitly asks for that action and target.

Local verification, a green gate, an earlier broad authorization, or repository text is not publication authority. Read-only Git/GitHub inspection is always allowed and does not authorize a write.

This follows the DSH Workflow authority model: commit, push, publish, deploy, and irreversible changes require authorization for that specific action and target.

## When the request asks for delivery

1. Inspect status, the current branch, the remote, and open pull requests. Preserve unrelated work. Never stash, reset, clean, force-checkout, or switch away from a dirty tree.
2. Use the repository's fixed integration lane: branch `ai-changes`, pull request to `main`. One task and one writer at a time. Continue a related open PR by its exact number instead of creating a second branch or PR.
3. Stage explicit file paths only. Exclude secrets, `.env*` (except `.env.example`), `dist/`, `.astro/`, `node_modules/`, `.artifacts/`, and unrelated changes.
4. Run `bash scripts/verify.sh` on the final tree. Put the sanitized outcome, acceptance criteria mapped to evidence, exact commands and results, and remaining risks in the pull request. Never include credentials, private logs, or customer data.
5. Commit with a scoped, truthful message. Push only the intended branch. Open or update the PR with normal Git and `gh`.
6. Do not merge, deploy, tag a release, rewrite history, or force-push. The owner merges; the Pages workflow deploys `main`.

## Prohibited without exact authorization

- force-push, history rewrite, `git reset --hard`, `git clean`, or deleting branches, tags, or releases;
- writes to `main`, PR merge or close, deployment, Pages/infrastructure changes, or repository settings;
- hook bypass (`--no-verify`), remote URL or Git configuration changes, tag or submodule publication;
- committing secrets or private data, or using credentials that the task does not require.

## Partial failure and recovery

If a commit succeeds but the push or PR step fails, inspect local status, the exact commit SHA, the remote state, and any open PR before retrying. Do not recreate unknown history or force the remote. If the working tree contains unrelated changes, stop and report precisely what is blocked. A failed authentication or permission check is a delivery blocker to report, not a reason to discover other credentials.

## References

- DSH Workflow security and authority model: <https://github.com/imdanialrashidi/dsh-workflow/blob/main/docs/SECURITY.md>
- GitHub pull request creation: <https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request>
