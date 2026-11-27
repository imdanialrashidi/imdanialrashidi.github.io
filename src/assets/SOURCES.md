# Asset provenance

Everything visual on the site is real and traceable. No invented interface
mockups, no stock photography, no AI-generated screenshots.

## Project screenshots (`src/assets/work/`)

All nine previews are local copies of publicly commissioned or shipped work.
The originals live in the sibling repository `danialrashidi.ir`
(`public/images/projects/`), which is the owner's own project.

| File | Origin | Notes |
| --- | --- | --- |
| `elsa-hamrah.webp` | https://elsahamrah.com/ | Public storefront capture, 1440x900. |
| `isbatab.webp` | https://isbatab.ir/ | Public corporate site capture, 1440x900. |
| `kidotalks.webp` | https://kidotalks.ir/ | Public homepage capture, 1440x900, captured 2026-11-27. |
| `mobile-khorsandi.webp` | https://mobilekhorsandi.ir/ | Public storefront capture, 1920x936. |
| `php-ielts-house.webp` | https://phpieltshouse.ir/ | Public site capture, 1440x900. |
| `noveno.webp` | https://noveno.ir/ | Live product site, 1840x932. |
| `fast-english.webp` | https://fastenglishpodcast.ir/ | Live product site, 1440x900, captured 2026-11-24. The public support phone numbers were hidden before capture; nothing else was altered. |
| `study.webp` | https://study.danialrashidi.ir/ | Live product site, converted from PNG to WebP. |
| `gym-log.webp` | https://gym-log.danialrashidi.ir/ | Live landing page capture, 1920x1080. |

Every project now has a real capture. The typographic plate in the codebase remains
the honest fallback for a future project without a public screen.

## Photographs

| File | Origin |
| --- | --- |
| `src/assets/portrait/danial-hero.webp` | Owner-provided studio portrait (`danialrashidi.ir`, `public/images/Danial_photo.jpg`), used as the home hero and default social card. |
| `src/assets/portrait/danial-night.webp` | Owner-provided photograph (`danialrashidi.ir`, `public/images/Danial_hero.jpg`), used in the home about band. |
| `src/assets/portrait/danial-portrait.webp` | Owner-provided studio portrait (`danialrashidi.ir`, `public/images/Danial_photo.jpg`), used on the about page, social cards and structured data. |
| `src/assets/travels/dalakhani.webp` | Owner-provided trip photograph (Dalakhani Valley, 2024). |
| `src/assets/travels/dareh-marg.webp` | Owner-provided trip photograph (Dareh Marg, 2025). |
| `src/assets/travels/yakh-morad.webp` | Owner-provided trip photograph (Yakh Morad cave survey, 2025). |

Responsive derivatives and social cards are generated at build time by Astro
(`astro:assets`) and `scripts/generate-og.mjs`.

## Fonts (`public/fonts/`)

| File | Source | License |
| --- | --- | --- |
| `geist-latin.woff2` | Geist by Vercel, Latin subset via `@fontsource-variable/geist` 5.2.5 | SIL Open Font License 1.1, see `LICENSE-Geist.txt` |
| `geist-mono-latin.woff2` | Geist Mono, Latin subset via `@fontsource-variable/geist-mono` 5.2.5 | SIL Open Font License 1.1, see `LICENSE-Geist.txt` |
| `instrument-serif-regular.woff2` | Instrument Serif, Latin subset via Google Fonts | SIL Open Font License 1.1, see `LICENSE-InstrumentSerif.txt` |
| `instrument-serif-italic.woff2` | Instrument Serif italic, Latin subset via Google Fonts | SIL Open Font License 1.1, see `LICENSE-InstrumentSerif.txt` |

## Generated assets (committed; regenerate with `npm run og` / `npm run icons`)

- `public/og/**` social cards, rendered from the site typefaces and the
  screenshots above.
- `public/apple-touch-icon.png`, `public/icons/*`, `public/favicon.svg` brand
  icons drawn from the site's initials.
