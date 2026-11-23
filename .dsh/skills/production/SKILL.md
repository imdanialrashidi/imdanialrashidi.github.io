---
name: production
description: "Prepare a project for production or assess a release candidate against its user journeys, security boundaries, operating limits and recovery evidence."
whenToUse: "The user asks to harden a project, assess launch readiness, or hand a release to its operators."
---

# Production readiness

Start with the consequence of failure. Which user would notice first, how would the operator know, and what could they do while the system is impaired? Use the answers to choose checks for this release.

## Scope the decision

1. Identify the deliverable, target environment, candidate revision or artifact digest, and differences from the running or previous version. Include configuration, flags, schema and generated assets that can ship independently. Record local changes when reviewing a working tree.
2. Trace the most important user journey through its actual entry point, dependencies and final side effect. Name the service or package owner, affected consumers, sensitive data, and the largest credible impact. For an existing system, consult relevant past incidents, customer commitments, CI and the operator's runbook.
3. Choose the required gates before running checks. Use the project's agreed reliability, security, compatibility and recovery targets. Label proposed targets and identify who can settle a missing decision. Mark a genuinely irrelevant area inapplicable with a brief reason. A missing tool or environment is an evidence gap.
4. Match the work to the request. For an assessment, inspect and run authorized checks without editing the candidate. For hardening, implement the smallest in-scope fixes, add regression evidence and reassess the resulting revision. Use disposable environments and synthetic data for load, recovery and failure exercises. Production access, rollout or data changes require their own authorization.

## Select and exercise the relevant controls

| Area | What to do and what to observe |
| --- | --- |
| Product behavior and compatibility | Exercise a critical journey through the shipped interface, including invalid input, cancellation or partial failure where it matters. Inspect the final record, file, event or user-visible state. For an API, check an existing client and documented error semantics. For a UI, exercise recovery, keyboard navigation, focus, labels and the project's accessibility criteria. For a library or CLI, install the built package in a clean supported environment and run a real consumer, including upgrade behavior. |
| Security and privacy | Trace identity from entry point to the protected resource and each asynchronous side effect. Check least privilege and secure defaults. With synthetic actors, test an allowed operation and a denied or cross-tenant operation. Inspect the resulting state. For sensitive input, review validation, retention, deletion, transport/storage protection and audit access against project policy. Exercise the approved secret-loading path, missing-secret behavior and relevant rotation procedure in isolation. Check a redacted sample from logs, traces and error responses. |
| State and migrations | Identify the invariant that must survive partial writes, concurrent work, duplicate delivery and restart. Exercise the applicable sequence and inspect final values and effect counts. With mixed versions in service, check old and new readers/writers against representative stored data. For destructive migrations, identify the last reversible step and rehearse the restore or forward repair before making a readiness claim. |
| Dependencies and overload | Trace one slow or unavailable dependency. Check end-to-end deadlines, bounded retries at the appropriate layer, backoff with jitter and cancellation. Retry side effects only with a demonstrated deduplication or idempotency contract. For workers, observe backlog age, bounded concurrency, failed-message handling and safe replay. Verify that recovery catches up with new arrivals and preserves the agreed effect count. |
| Runtime and configuration | Validate configuration and generated inputs before activation, including malformed or oversized values. Confirm that a rejected update preserves the last known good configuration where the service relies on it. Exercise cold start, shutdown and draining in a production-like environment. For an orchestrated service, observe when it accepts traffic and what happens to in-flight work during termination. A dependency outage should have an intentional routing and restart policy. Record any configuration difference that can invalidate the result in production. |
| Capacity, performance and cost | Use a representative workload and volume, including a peak or large tenant where relevant. Compare candidate and baseline on the same setup. Record throughput, tail latency or job completion time, saturation and a meaningful resource or cost per completed unit. Check limits on queues, concurrency, external calls and spend where exhaustion has a material consequence. Record variation and the capacity margin against the agreed target. |
| Observability and incident response | Define a user-visible service level indicator (SLI), its objective (SLO), window and data source when the service has a reliability commitment. Check that an affected cohort is visible and that request, job and dependency failures can be correlated. Exercise a safe failure in an isolated environment or inspect a recent applicable drill. Trace the symptom to an actionable alert, owner, runbook and recovery decision. Check missing telemetry and use bounded, non-sensitive attributes. For incidents, name the escalation and customer communication owner. |
| Build and supply chain | Identify the artifact that will be promoted from CI, its source revision, locked inputs and build identity. Smoke-test that exact artifact. Inspect dependency or CI changes and the disposition of project-required security, secret and license checks. Where required, verify the software bill of materials (SBOM) covers the candidate, and verify signed provenance, artifact digest, trusted builder and expected source. Record the trusted run or verification result. |
| Backup and disaster recovery | For state the operator must recover, find the agreed maximum data loss (RPO) and recovery time (RTO). Inspect a recent applicable restore exercise or restore a representative backup into an isolated target. Before the drill, identify the recovery cutoff and an independently known record or business invariant at that point. Read through the normal consumer on the restored target and compare with that expectation. Measure elapsed time until the journey works and compare observed data loss and elapsed time to the targets. A backup-success notification alone leaves recoverability unproven. |
| Rollout and rollback | Identify the operator, initial cohort or distribution channel, observation window, baseline, minimum useful traffic and stop condition. Compare customer outcomes and integrity signals across the candidate and control where possible. With low traffic, use representative synthetic journeys or extend observation. Rehearse the last-known-good path or forward repair, including flags, config, schema and downstream consumers. State who monitors after rollout and how delayed failures will be found. |

For example, a billing worker may commit a charge before receiving a timeout. In an isolated fixture, repeat the same logical request and restart the worker. Inspect the ledger, the downstream effect count and the time until the queue drains. For a stateless formatting library, a clean install plus a consumer compatibility check may cover the entire release.

If the product delegates work to a model or an external automation, include that boundary in the critical journey. Check the approved data destination, tool permissions, timeout and spend limits, and the fallback when the provider is unavailable. Evaluate representative inputs against the agreed outcome before promoting a model or prompt change.

## Deliver a decision the owner can use

For each required gate, record the expected result, exact candidate and environment, command or trusted run, actual observation, and status. Use **passed**, **failed**, **blocked**, **unproven** or **unexecuted**. Reuse current evidence where the change does not invalidate it. A green suite with no matching cases leaves the case unexecuted. Recheck affected evidence after a fix.

| Readiness verdict | Decision rule |
| --- | --- |
| **Changes required** | An agreed requirement failed, or a material defect remains open. Give the impact, smallest correction and recheck. This takes precedence over missing evidence. |
| **Blocked** | No demonstrated failure takes precedence, but a required check, decision or project-mandated review lacks evidence. Name the gap, its owner if known and the action that would resolve it. |
| **Ready** | All applicable required gates passed on the candidate, required reviews are recorded, and residual risks have an explicit disposition from the authorized owner. |

A release candidate may be technically ready while permission to publish is pending. If project policy requires a reviewer to sign off on readiness itself, a missing sign-off keeps the verdict blocked.

Lead the handoff with the verdict, candidate and critical journey. Then give the decisive evidence, unresolved risks and owners, rollout stop signal, recovery method, and outstanding release authorization. Keep optional improvements separate from required work. Report an actual deployment only when its outcome was observed.
