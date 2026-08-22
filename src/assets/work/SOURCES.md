# Portfolio Preview Provenance

These hero screenshots are local copies of publicly commissioned work previews originally generated for Noveno's portfolio. Provenance preserved per `noveno/assets/images/work/SOURCES.md`.

| File | Source Page | License / Note |
|------|-------------|----------------|
| `elsa-hamrah-hero.webp` | https://elsahamrah.com/ | Public site screenshot via `https://image.thum.io/` wait+noanimate, cropped 1440×1080 → 1440×900, WebP — public fair-use preview; replace with owner-approved capture if brand policy requires. |
| `isbatab-hero.webp` | https://isbatab.ir/ | Same capture pipeline as above. |
| `mobile-khorsandi-hero.webp` | https://mobilekhorsandi.ir/ | Same pipeline. |
| `php-ielts-house-hero.webp` | https://phpieltshouse.ir/ | Same pipeline. |

Process: `https://image.thum.io/` wait+noanimate → 1440×1080 → crop to 1440×900 → WebP (no upscaling). Refresh via Noveno's `scripts/refresh-portfolio-previews.sh` when source sites change.

These are owned local copies — not hotlinked raw GitHub / noveno.ir remotes. Astro's image pipeline generates responsive derivatives (e.g., 400/720/1080w) at build; the 720w `-800` variants are not duplicated here.
