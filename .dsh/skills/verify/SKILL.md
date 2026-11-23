---
name: verify
description: "Run project-owned checks and decide whether the requested outcome is verified, failed or incomplete."
whenToUse: "A change is ready for validation, the user asks whether it works, or delivery evidence needs checking."
---

# Verify

## Establish what would count

1. List the agreed criteria and any required project checks. Specify the observable result and the real entry point for each. Distinguish required evidence from optional diagnostics before looking at results.
2. Discover commands from trusted project instructions, manifests, task runners and CI. Inspect changed hooks or scripts before executing them. If no project command exists, label any safe direct observation as an ad hoc check and describe its scope.
3. Identify the revision under test, including staged, unstaged and relevant new files. For an unpublished worktree, describe the diff and file scope. Rerun affected checks after further edits or integration changes.

## Select checks by consequence

- Local change: exercise the changed behavior through its normal caller. For a regression, show the case distinguishes the old and corrected behavior in an isolated baseline when practical.
- Shared interface: include an existing consumer and supported older data or client where relevant. For a migration, check restart, compatibility and recovery using disposable data.
- Security boundary: exercise a permitted case and a denied case using synthetic identities. Check resulting data or side effects as well as the return status. Cite project-required scan results when applicable, including findings and their disposition.
- User interface: run the relevant user journey and inspect the affected visual, keyboard or error state when it is an acceptance criterion.
- Performance claim: use the same workload, environment and units for baseline and candidate. Record repetitions, variation and a relevant trade-off, such as peak memory. If measurement is unavailable, label the performance claim unproven.
- Distributed build: run the project's packaging or installation smoke check on the actual candidate where possible. Identify the artifact digest and the builder or provenance verification required by the project.

## Execute and decide

Record command or observation, working directory, revision, exit code where applicable and a short redacted excerpt. Verify the intended tests were collected and executed. Zero matches, filtered, skipped or cancelled cases are unexecuted. A suite can pass while a required case remains unexecuted. Preserve the original failure on a retry. Investigate inconsistent results before using them as release evidence.

Keep verification read-only with respect to the implementation. Return fixes to `build` and run affected checks again.

| Check status | Evidence |
| --- | --- |
| passed | Executed and observed the expected outcome |
| failed | Executed and observed a failure |
| blocked | A named prerequisite or permission prevented execution |
| unproven | Only inspection or inference supports the claim |
| unexecuted | Available or planned case did not run |

Use **fail** if an agreed criterion or required check failed. Otherwise use **incomplete** if any required evidence is blocked, unproven, unexecuted or uncovered. Use **pass** only when all required evidence is current and successful. Report optional failures separately and reconsider their relevance if they reveal a defect. An accepted business risk does not change a check result.

## Handoff

For a small change, one sentence can identify the evidence and outcome. For a larger change, use the project's existing PR or delivery record.

| Criterion or required check | Revision and command/cwd | Exit or observation | Status and evidence |
| --- | --- | --- | --- |
| <observable outcome> | <tested candidate and check> | <result> | <status and redacted excerpt or trusted run link> |

Finish with the verification verdict, failed or missing evidence, and the smallest action that would resolve it. State review status separately. Deployment requires its own authorization.
