# Security Policy

## Reporting a vulnerability

Do not open a public issue containing an exploitable vulnerability, secret, private log, or user data. Use the repository's private **Security → Report a vulnerability** flow when available. If private reporting is unavailable, contact the repository owner through a private channel and share only the minimum reproduction needed.

Include the affected version/commit, impact, prerequisites, a minimal reproduction, and any known mitigation. Remove credentials and personal data from evidence.

## Execution boundary

omp runs with the operating-system permissions of the account that starts it. Project config (`.omp/`), prompts, tool approval tiers, and the scoped `scripts/omp-pr.mjs` helper are defense in depth; they are not a sandbox and cannot reliably parse every shell/interpreter behavior or redirect. Real isolation must come from the operating system, container, or VM.

Solo default: never commit, push, merge, release, deploy, or mutate production. Only when the user explicitly asks for team delivery ("open a PR", "commit this", or equivalent), follow `docs/GIT_POLICY.md` exactly — scoped explicit files on the fixed `ai-changes` lane, secret scan, compare-and-swap push guard, no `--no-verify`, no force, no main writes, no auto-merge. Read-only/local-only work never publishes; `OMP_PR_DELIVERY=off` opts out.

For an untrusted repository, unreviewed third-party instructions, or work exposed to meaningful credentials/private data:

1. Prefer an OS/container/VM boundary with only the required workspace and credentials.
2. Use a policy-controlled sandbox when network/credential egress must be restricted.
3. Pass only the provider keys required for the task. Do not mount host SSH keys, cloud credentials, or the Docker socket into an untrusted environment.
4. Review the repository, `.omp/` config/commands/skills, scripts, and workflow before trusting them.
5. Review diffs and outputs before copying or deploying them to a trusted/production environment.

Native browser/eval execution may run broad code and requires approval in normal mode. It is not a network security boundary or redirect containment. Use network policy/container isolation when browsing untrusted applications or when egress matters.

## Third-party packages

npm packages execute with the agent process's permissions. `package.json` pins are exact, but a pin is not a source review. Before updating:

- review the upstream repository, ownership, release diff, install scripts, dependencies, and published integrity;
- test the new pin in a disposable copy/container;
- update the lockfile (`package-lock.json`) and the changelog.

## Supported versions

Security fixes are applied to the current `main` branch. The repository does not currently publish versioned releases; once releases begin, list supported release lines here.
