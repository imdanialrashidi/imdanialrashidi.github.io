---
description: Assess final readiness and prepare an owner-controlled repository handoff without deploying
argument-hint: "[release scope or execution plan]"
---

Assess the current change and prepare a verified handoff. Scope:

${ARGUMENTS:-current working-tree change}

Do not add features, mutate Git/GitHub, merge, release, deploy, publish packages, change production, or rewrite unrelated code. “Ship” is not branch, commit, pull, push, or PR authorization.

1. Read `AGENTS.md`, `docs/QUALITY.md`, `docs/GIT_POLICY.md`, and the accepted goal/active execution plan when one exists. For a visually significant release also read `docs/DESIGN.md` and load `frontend-design`.
2. Inspect the full working-tree diff and reconstruct the required acceptance criteria.
3. Reject readiness if accepted functionality is stubbed, display-only, backed by fake persistence, or lacks required proof.
4. Confirm no secret, private specification, generated artifact, debug bypass, unrelated change, or accidental workflow-policy modification is included.
5. For meaningful user-facing changes, require real-browser evidence for the critical journey when the application can run safely. For material visual work, require named desktop/mobile/demanding-state evidence, all hard gates, and the accepted craft threshold; if the active model cannot inspect appearance, mark that criterion `UNPROVEN`.
6. Require an independent evidence-focused pass for non-trivial user-facing, cross-module, production-bug, or material-regression work and a security pass for High-risk work. Use read-only subagents only when available and justified. No unresolved BLOCKER/MAJOR finding may remain.
7. Load `verification-routing` and run the canonical full gate once when the task class or final readiness requires it.
8. Map every required criterion to `PASS`, `FAIL`, `UNPROVEN`, or `BLOCKED` with exact evidence. `UNPROVEN` is not ready.
9. If an active execution plan exists, update its final evidence/status. Mark/move it complete only when all required criteria are proven.
10. Leave the verified working-tree diff intact. Report optional owner-run Git commands, but execute none unless the current user explicitly authorized that exact action under `docs/GIT_POLICY.md`.

Return:

- verdict: `READY`, `READY WITH KNOWN LIMITATIONS`, or `NOT READY`;
- acceptance criterion → evidence/status;
- exact checks/tools and outcomes;
- independent review status;
- changed files and owner-controlled Git status;
- known limitations and remaining risks;
- rollback/recovery note where relevant;
- optional next commands for the repository owner.
