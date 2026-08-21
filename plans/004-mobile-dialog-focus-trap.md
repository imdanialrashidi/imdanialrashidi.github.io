# Plan 004: Make the mobile nav dialog actually modal — focus trap + header-height token

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, …). Compare the "Current
> state" excerpts below directly against the working tree; on any mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (accessibility correctness) / tech-debt
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The mobile navigation is marked as a modal dialog but does not behave like
one:

- `src/components/Header.astro` renders
  `<div id="mobile-nav" role="dialog" aria-modal="true" …>`. `aria-modal="true"`
  asserts to assistive technology that background content is inert.
- The open logic focuses the first link, then leaves keyboard focus free:
  pressing <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> walks straight into the hidden
  page behind the overlay (header links, theme toggle, page content), while
  screen readers were told that content doesn't exist. This is the classic
  "lying aria-modal" defect (WCAG 2.2 focus-order / 2.4.3 concerns).
- Separately, the dialog's top offset hardcodes the header height twice
  (`64px` CSS literal in two places). A token removes the drift risk when
  header height ever changes.

`docs/DESIGN.md:129` already claims "mobile menu focus trapped to first link
then Escape" — this plan makes the code true.

## Current state

- `src/components/Header.astro` line ~100 (mobile dialog markup):

```html
  <div id="mobile-nav" class="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu" hidden>
```

- Header script (lines ~338–395, verbatim key parts):

```ts
    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      nav.hidden = false;
      document.body.style.overflow = "hidden";
      // focus first link for accessibility
      const firstLink = nav.querySelector("a") as HTMLElement | null;
      firstLink?.focus();
    };
```

```ts
    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        close();
      }
    });
```

  `close()` already restores focus to the toggle button (`btn.focus()`).
  There is no Tab handling anywhere.

- Hardcoded header height, same file:
  - line ~118: `min-height: 64px;` (inside `.site-header__inner`)
  - line ~232: `inset: 64px 0 0 0;` (inside `.mobile-nav`)
- `src/styles/tokens.css` — token registry. Layout tokens live under the
  comment `/* Layout */` (ends with `--width-gutter-sm`); z-index tokens
  under `/* Z */` (`--z-header: 50; --z-nav: 40;`). Add the new token in the
  Layout group.
- Repo conventions: vanilla TS in Astro `<script>` blocks, no framework;
  `const` assertions via `as HTMLElement | null`; comments explain *why*.
  Match existing style exactly.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Suggested executor toolkit

- If a Playwright MCP / browser tool is available: verify behavior at 375px —
  open menu, press Tab repeatedly, assert focus cycles only among
  `#mobile-nav a[href]` elements, Escape closes and refocuses the toggle,
  screenshot before/after. If no browser tool exists, rely on the static
  checks and mark browser proof UNPROVEN for reviewer QA — never fabricate.

## Scope

**In scope**:
- `src/components/Header.astro` (script block + the two CSS literals)
- `src/styles/tokens.css` (add one token)
- `docs/DESIGN.md:129` (align wording with implemented behavior)

**Out of scope** (do NOT touch):
- Desktop nav markup/styles, ThemeToggle, Footer, any other component.
- Global.css reduced-motion rules.
- Rewriting the dialog into `<dialog>` element or adding dependencies —
  keep the existing pattern.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Add the header-height token

In `src/styles/tokens.css`, inside `:root` under the `/* Layout */` group
(after `--width-gutter-sm`), add:

```css
  --header-height: 64px;
```

Then in `src/components/Header.astro` replace both literals:
- `.site-header__inner { min-height: 64px; … }` → `min-height: var(--header-height);`
- `.mobile-nav { inset: 64px 0 0 0; … }` → `inset: var(--header-height) 0 0 0;`

**Verify**:
```bash
grep -n "var(--header-height)" src/components/Header.astro        # 2 matches
grep -n "64px" src/components/Header.astro                        # no matches
npm run check
```
Check exits 0 with 0 errors.

### Step 2: Implement the focus trap

In the Header `<script>` block, add a module-scope helper above the event
wiring (keep style consistent):

```ts
    const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || nav.getAttribute("aria-hidden") === "true") return;
      if (btn.getAttribute("aria-expanded") !== "true") return;
      const focusables = Array.from(nav.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !nav.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
```

Wire it next to the existing Escape listener (single listener, both keys —
replace the current Escape-only listener so there is one keydown handler):

```ts
    // modal keyboard behavior: Escape closes, Tab stays inside the dialog
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (btn.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") close();
      else trapFocus(e);
    });
```

Notes for the executor:
- Keep the existing `close()` (it already refocuses the burger button).
- Do not add an inert/polyfill library; the trap + `aria-modal` matches the
  documented contract ("focus trapped to first link then Escape").
- The dialog contains only links today; `FOCUSABLE` still future-proofs it.

**Verify**:
```bash
grep -n "trapFocus" src/components/Header.astro       # ≥2 matches (definition + call)
grep -c "addEventListener(\"keydown\"" src/components/Header.astro   # exactly 1
npm run check && npm run build                         # both exit 0
```

### Step 3: Sync the design-doc claim

`docs/DESIGN.md:129` currently reads:

> - Keyboard/focus/touch: Tab order verified, focus ring on :focus-visible, mobile menu focus trapped to first link then Escape.

Update the third clause to describe the real mechanism:

> - Keyboard/focus/touch: Tab order verified, focus ring on :focus-visible, mobile menu traps Tab within the dialog, Escape closes and restores focus to the menu button.

**Verify**: `grep -n "traps Tab within the dialog" docs/DESIGN.md` → 1 match.

### Step 4: Behavior proof (browser tool if available)

At viewport 375×667 on any built page (`npm run build && npm run preview`):
1. Open menu → activeElement is the first `#mobile-nav a`.
2. Press Tab until wrap: focus cycles among the four nav links only.
3. Press Escape → dialog hidden, focus back on `#menu-toggle`.

If no browser tooling is available, run the static checks from Steps 1–2 and
explicitly report the behavioral criterion as UNPROVEN.

## Test plan

No repo test infrastructure covers client JS today (harness tests only).
This plan deliberately does not introduce a JS test runner — out of scope.
Regression net: `npm run check`, `npm run build`, full gate. Browser proof per
Step 4 where tooling allows.

## Done criteria

ALL must hold:

- [ ] `--header-height` token defined; zero `64px` literals remain in Header.astro
- [ ] Single document-level keydown listener handles Escape + Tab; Tab wraps
      within `#mobile-nav` while open
- [ ] `open()`/`close()` behavior otherwise unchanged (body scroll lock kept)
- [ ] `npm run check` exits 0; `bash scripts/verify.sh` exits 0
- [ ] DESIGN.md claim matches implementation
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated (note UNPROVEN items honestly)

## STOP conditions

Stop and report back if:

- The Header script block has been restructured since this plan (drift vs
  excerpts) — e.g. listeners renamed, `close()` gone.
- You find a second keydown listener elsewhere claiming menu handling.
- Adding the trap requires touching components outside Header.astro.

## Maintenance notes

- If a fifth nav item or a CTA button is added to the mobile dialog, nothing
  changes — the trap queries the DOM dynamically.
- If the header height becomes responsive (`clamp()`), update the
  `--header-height` token once; both consumers follow.
- Reviewer scrutiny: ensure the trap cannot run while the dialog is closed
  (guard on `aria-expanded`) and that Escape still works when focus is on
  `document.body`.
