# Plan 011: Harden the mobile-nav dialog so focus cannot escape behind `aria-modal`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- src/components/Header.astro src/layouts/Layout.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (accessibility correctness)
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

The mobile navigation is a `role="dialog" aria-modal="true"` overlay that claims
background content is inert. Plan 004 added a Tab trap, but it still leaks:

- The trap queries focusables **only inside `#mobile-nav`** (`nav.querySelectorAll`). Two focusable controls remain **outside** the dialog while it is open — `#theme-toggle` (inside `.site-header__actions`) and `#menu-toggle` itself — so a mouse click on ThemeToggle moves focus outside, and a subsequent Tab walks straight into the page behind `aria-modal`. This is a WCAG 2.4.3 focus-order failure on the primary navigation.
- The backdrop click handler only closes when `e.target === nav`, so ThemeToggle clicks deliberately keep the menu open (overlay starts below the header row).
- The guard `nav.getAttribute("aria-hidden") === "true"` in `trapFocus` is dead code — `aria-hidden` is never set on `#mobile-nav` (visibility is `hidden`, not `aria-hidden`).
- Four close paths (`close()` via Escape/document keydown, `btn` click toggle, link click, backdrop click, resize-to-desktop) are not unified: the link-click branch duplicates close logic inline and does not call the single `close()` that restores focus.

The user-visible cost is that keyboard and mixed mouse/keyboard users can reach hidden content while told it doesn't exist, and screen readers with incomplete `aria-modal` support can virtual-cursor into it. Fixing it means background content is actually inert while the dialog is open, and Tab is reliably cycled.

## Current state

- `src/components/Header.astro` — header + mobile dialog markup and script. Key parts as of `dbda97e`:

Dialog element and header actions (structure — ThemeToggle + menu button are siblings *outside* `#mobile-nav`):

```html
    <div class="site-header__actions">
      <ThemeToggle />
      <button id="menu-toggle" class="site-header__menu" type="button"
        aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">…</button>
    </div>
  </div>

  <!-- Mobile navigation — separate layer -->
  <div id="mobile-nav" class="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu" hidden>
```

Header height is already tokenized (plan 004 DONE) — `src/styles/tokens.css: --header-height: 64px` and `Header.astro` uses `min-height: var(--header-height)` / `inset: var(--header-height) 0 0 0`. Do not re-add a token.

Script block today (verbatim excerpts — confirm before editing):

```ts
  if (btn && nav) {
    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      nav.hidden = true;
      document.body.style.removeProperty("overflow");
      btn.focus();
    };
    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      nav.hidden = false;
      document.body.style.overflow = "hidden";
      const firstLink = nav.querySelector("a") as HTMLElement | null;
      firstLink?.focus();
    };

    const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || nav.getAttribute("aria-hidden") === "true") return;
      if (btn.getAttribute("aria-expanded") !== "true") return;
      const focusables = Array.from(nav.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !nav.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) close();
      else open();
    });

    // close on link click
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (btn.getAttribute("aria-expanded") === "true") {
          btn.setAttribute("aria-expanded", "false");
          nav.hidden = true;
          document.body.style.removeProperty("overflow");
        }
      });
    });

    // modal keyboard behavior: Escape closes, Tab stays inside the dialog
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (btn.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") close();
      else trapFocus(e);
    });

    // close on backdrop click (outside inner)
    nav.addEventListener("click", (e) => {
      if (e.target === nav) close();
    });

    // reset on resize to desktop
    const mq = window.matchMedia("(min-width: 781px)");
    mq.addEventListener("change", (e) => {
      if (e.matches && btn.getAttribute("aria-expanded") === "true") {
        btn.setAttribute("aria-expanded", "false");
        nav.hidden = true;
        document.body.style.removeProperty("overflow");
      }
    });
  }
```

Observations to keep:
- `Layout.astro` shell is `<Header /><main id="main"><slot /></main><Footer />`. Background content to make inert is `main#main` and the footer element.
- Repo conventions: vanilla TS in Astro `<script>` blocks, `as HTMLElement | null` guards, no framework. Match exactly.

- `docs/DESIGN.md` quality budgets already claim: "mobile menu traps Tab within the dialog, Escape closes and restores focus to the menu button" (plan 004 wording). No doc change needed here unless behavior diverges.

Design vocabulary (from `docs/DESIGN.md`): one electric blue accent, monochrome canvas, no new visual tokens for this fix.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0, 0 errors / 0 warnings / 0 hints |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Suggested executor toolkit

- If a browser tool (Playwright MCP) is available: open any page at 375px, open menu, press Tab repeatedly, assert focus cycles only among `#mobile-nav a[href]`; click `#theme-toggle` while menu open and assert menu stays open but focus cannot leave dialog via Tab; press Escape and assert `nav.hidden === true` and `document.activeElement === #menu-toggle`. If no browser tool, run static checks and mark browser proof UNPROVEN honestly — never fabricate a screenshot.

## Scope

**In scope** (only files you should modify):
- `src/components/Header.astro` — script block only (plus any minimal markup change needed to wire `inert` targets, e.g. adding an id to the footer if you choose that route — prefer querying existing `main` + `footer` selectors without new ids)

**Out of scope** (do NOT touch):
- `src/styles/tokens.css` — already tokenized; no visual change.
- `src/layouts/Layout.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro` — background inert is toggled from Header's script by querying the existing DOM; do not restructure layout or move the dialog into `<dialog>`.
- `docs/DESIGN.md` — wording already matches the intended behavior.
- Any `inert` polyfill or dependency — native `inert` is baseline in Chromium/Firefox/Safari; do not add a library.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes for the owner.

## Steps

### Step 1: Remove the dead `aria-hidden` guard

In `trapFocus`, delete the dead predicate `nav.getAttribute("aria-hidden") === "true"` — the dialog's visibility is `nav.hidden`, not `aria-hidden`. Simplify the guard to only the real condition:

```ts
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (btn.getAttribute("aria-expanded") !== "true") return;
```

Keep the rest of `trapFocus` unchanged in this step (focusables scoped to `nav` is still correct once background is inert).

**Verify**:
```bash
grep -n 'aria-hidden' src/components/Header.astro   # no matches
grep -n 'trapFocus' src/components/Header.astro      # ≥2 (definition + call)
npm run check
```
Check exits 0.

### Step 2: Make background actually inert while the dialog is open

Add inert toggling to the `open`/`close` paths so AT and keyboard cannot reach page content behind `aria-modal`. Query existing layout elements — do not add new ids unless the selector cannot resolve, but `main` and `footer` already exist in the built DOM.

In `open()` after `nav.hidden = false` and `body.style.overflow = "hidden"`, add:

```ts
      document.getElementById("main")?.setAttribute("inert", "");
      document.querySelector("footer")?.setAttribute("inert", "");
```

In `close()` after `nav.hidden = true` and `removeProperty("overflow")`, add:

```ts
      document.getElementById("main")?.removeAttribute("inert");
      document.querySelector("footer")?.removeAttribute("inert");
```

Then unify the two duplicate close sites so they reuse `close()` (and thus the inert cleanup and `btn.focus()`):

- The `nav.querySelectorAll("a").forEach` link-click handler should call `close()` instead of duplicating three lines. Note: `close()` does `btn.focus()` — on navigation this focus is transient before the page unloads, which is harmless; matching Escape and backdrop behavior is more important than avoiding that transient focus.
- The `mq.addEventListener("change", …)` resize-to-desktop branch should call `close()` instead of duplicating the three lines (it intentionally does not need to refocus visibly since the menu just vanished on breakpoint change, but calling `close()` keeps cleanup single-sourced; if you prefer to avoid the focus flash on resize, extract a `closeWithoutFocus()` helper — either is acceptable, document your choice).

Do not add an `inert` polyfill. Verify the inert toggling covers every close path: `close()` via Escape, `btn` toggle, link click, backdrop click, and resize.

**Verify**:
```bash
grep -n 'setAttribute("inert"' src/components/Header.astro   # ≥1 (open)
grep -n 'removeAttribute("inert"' src/components/Header.astro # ≥2 (close + duplicate-site if refactored to call close)
grep -n 'nav.hidden = true' src/components/Header.astro       # only inside close() (and nowhere else duplicated)
npm run check && npm run build
```
Both exit 0. Manually spot-check `dist/` for one built HTML: the page still has `role="dialog" aria-modal="true"` on `#mobile-nav` and no stray `inert` at rest (inert is added only at runtime).

### Step 3: Behavior proof (browser if available, else static + honest report)

If a browser tool is available, build + preview and at 375px:
1. Open menu → `activeElement` is first `#mobile-nav a`.
2. Press Tab five times → focus cycles only among `#mobile-nav` links (never lands on `#theme-toggle`, `#menu-toggle`, or `main` links).
3. With menu open, click `#theme-toggle` → menu remains open (existing backdrop semantics), but subsequent Tab from the toggle (if focus moved there) is still trapped when focus re-enters the dialog — and `main`/`footer` have `inert` so virtual cursor cannot reach them.
4. Press Escape → `nav.hidden === true`, `btn.getAttribute("aria-expanded")==="false"`, `document.activeElement === btn`, and `main`/`footer` no longer have `inert`.

If no browser tool, explicitly report the behavioral criteria as UNPROVEN and rely on the static checks above.

## Test plan

No product harness covers client JS today (intentionally — adding a runner is plan 018). Regression net for this plan is `npm run check` + `npm run build` + manual/brower proof above. No new test file in this plan.

Follow-up test coverage for the inert+Tab contract belongs in plan 018's harness; do not add a one-off test here.

## Done criteria

ALL must hold:

- [ ] `trapFocus` no longer references `aria-hidden` (`grep -n aria-hidden Header.astro` → no matches)
- [ ] Opening the dialog sets `inert` on `main#main` and `footer`; closing (via any path: Escape, toggle, link click, backdrop, resize) removes it
- [ ] No duplicate `nav.hidden = true` / `aria-expanded = "false"` blocks outside `close()` (every close path calls the single `close()` helper)
- [ ] `npm run check` exits 0 (0 errors / 0 warnings / 0 hints)
- [ ] `npm run build` exits 0
- [ ] No files outside `src/components/Header.astro` modified (`git status --short` shows only that file, or also `plans/README.md` status row)
- [ ] `plans/README.md` status row updated (mark browser proof UNPROVEN honestly if no tool was available)

## STOP conditions

Stop and report back (do not improvise) if:

- The Header script block has been restructured since the excerpts (e.g. `btn`/`nav` ids renamed, `close`/`open` removed, dialog moved to `<dialog>`).
- You discover `inert` is already managed elsewhere (e.g. a layout script toggles it) — report the conflict.
- Making `main`/`footer` inert breaks a page that relies on background interaction while the dialog is open (there is no such interaction by design — report the counter-evidence).
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If new focusable controls are added to the header (e.g. a search button), they are automatically inert while the mobile dialog is open — no trap change needed. If focusables are added *inside* the mobile dialog, `trapFocus` picks them up dynamically via `nav.querySelectorAll`.
- The `inert` attribute is natively supported in all evergreen browsers. Do not add a polyfill; if a future target requires one, add it in Layout.astro's head FOUC script area, not in Header.
- Reviewer scrutiny: ensure every close path (especially link click and resize) correctly removes `inert` and restores `overflow`. A missed path locks the page.
