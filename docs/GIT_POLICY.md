# Owner-Controlled Git Policy

The repository owner controls version history and remote delivery. Full filesystem/network access, a configured remote, credentials, and requests such as “finish” or “ship” do not grant Git authority.

## Default behavior

Pi may inspect repository state with read-only commands such as `git status`, `git diff`, `git log`, `git show`, `git rev-parse`, `git ls-files`, `git branch --show-current`, and `git remote -v`.

Without a current user instruction naming the exact action and target, Pi must not:

- create, switch, rename, or delete branches or worktrees;
- stage or commit changes;
- fetch, pull, push, or synchronize refs;
- merge, rebase, cherry-pick, revert, reset, clean, stash, or tag;
- change Git configuration, remotes, the index, or refs;
- create, update, review, merge, or otherwise mutate a pull request;
- mutate repository content through GitHub, MCP, or another hosted API.

At handoff, leave the verified working-tree diff and report optional owner-run commands without executing them.

## Explicit authorization

Authorization must come from the current user request and identify the intended Git/GitHub action and target. Do not infer adjacent actions: permission to commit is not permission to branch, pull, push, or open a PR.

The launcher fails closed with `PI_GIT_MUTATION=deny`. For one explicitly authorized non-destructive action, the owner may start a bounded session with:

```bash
PI_GIT_MUTATION=allow ./p
```

Perform only the exact authorized action, then return to the default launcher. This switch does not disable destructive-operation guards. `PI_GUARD_EXTERNAL_MUTATION=allow` is separate and never implies Git authorization.

## Limits

The extension inspects direct tool calls and common command forms. It is defense in depth, not a complete shell/Git security boundary; indirect scripts, aliases, hosted tools, or disabled/untrusted extensions can evade it. The instruction contract and owner review remain required.
