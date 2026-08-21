# Changelog

All notable workflow changes are documented here. This project follows the spirit of Keep a Changelog; versioning begins when the first release is tagged.

## Unreleased

### Added

- Behavioral coverage for autonomous/strict guard modes and launcher trust overrides.
- Product design contract, distinctive frontend-design skill, visual hard gates, and scored craft rubric.
- Idea-to-production prompts: discover, design, spec, ADR, build UI, design review, release plan, and incident response.
- Evidence-gated product roadmap template.
- Safety-guard behavior tests and a contained Docker launcher.
- Security reporting and dependency-review policy.
- `test-design` and `/test` workflows with red/pre-fix defect-sensitivity guidance.
- Deterministic affected-file verification routing with a conservative full-gate fallback.
- Workflow eval schema v2 with executable assertions, trace metrics, baseline comparison, and a real code/test repair fixture.
- Primary-source research and audit record in `docs/RESEARCH.md`.
- Owner-controlled Git/GitHub policy with guard, launcher, prompt, and deterministic-eval enforcement.
- Materialized-file filtering and a Git-independent pre-fix fixture for disposable workflow evaluations.

### Changed

- Made `./p` trust the checked-out project and grant full-workspace implementation access by default, while independently denying all Git/GitHub mutation until the owner authorizes an exact action; the optional Docker launcher selects strict repository scope.
- Strengthened the safety guard around secrets, destructive host actions, Git metadata/commands, publication/deployment/production mutation, and browser file exfiltration while preserving read-only Git inspection.
- Replaced archived `pi-context7` with maintained `pi-doc-search`.
- Removed delegated image-analysis extensions, model configuration, tools, and workflow guidance; browser QA now relies on browser-native evidence and saved screenshots as artifacts.
- Removed the template's forced model/provider/thinking selection and unmeasured compaction/retry/timeout overrides so the operator's active Pi model and official defaults apply.
- Pinned Pi installation guidance and GitHub Actions by immutable revision.
- Raised browser QA, accessibility, responsive, and Core Web Vitals requirements for visual work.
- Made the canonical full verification gate validate the template before product source is bootstrapped.
- Reduced duplicate always-loaded policy by 30.5%, removed the duplicate `docs/PI_WORKFLOW.md`, and tightened the combined context-size ratchet.
- Reduced the launcher from 22 to 19 active tool schemas and made subagents conditional with a universal self-review fallback.
- Reduced routine eval default trials from three to one while retaining explicit repeated trials and stronger efficiency thresholds for promotion comparisons.
- Updated reviewed pins to Pi `0.84.2`, `pi-mcp-adapter@2.26.1`, `@juicesharp/rpiv-todo@2.6.2`, and `@bytetrue/pi-web-search@0.2.1` with exact registry integrity records.
