# Project context readiness

The repository ships durable contract templates so Pi can begin safely without
inventing product facts. Before a real product implementation, run:

```bash
node scripts/validate-project-context.mjs --static
```

The template is expected to report `NOT READY`. Run `/bootstrap`, replace the
empty prompts in `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, and
`docs/QUALITY.md` with confirmed decisions or explicit `UNKNOWN` values, then
turn the check into a gate:

```bash
node scripts/validate-project-context.mjs --require-ready
```

An explicit unknown is honest context and is accepted; an empty field, empty
table row, missing file, or generic template instruction is not. The validator
does not judge whether a decision is good, and it does not replace product,
design, architecture, or quality review. Keep the gate informational until the
project has actually been bootstrapped.
