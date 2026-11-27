---
seoTitle: "Fast English: reading and listening app"
title: "Fast English"
summary: "A Persian-first English reading and listening product: CEFR-leveled articles with matching audio, flashcards, and a released Android app."
metaDescription: "Fast English is a live Persian-first English learning product: CEFR-leveled articles read and heard together, flashcards, a placement test and an Android app."
kicker: "Client work · Laravel · React · Android"
kind: "client"
role: "Product engineering, backend, Android"
year: 2025
status: "live"
statusLabel: "Live product · v1.0.0"
stack: ["PHP 8.4", "Laravel 13", "Inertia 3", "React 19", "TypeScript", "PostgreSQL"]
links:
  live: "https://fastenglishpodcast.ir"
  github: "https://github.com/imdanialrashidi/fast-english"
cover: "fast-english"
coverAlt: "Fast English landing page in Persian: a dark navy hero about reading and listening for fifteen minutes a day, a library card listing TED Talk articles with CEFR levels, and sign-up and support buttons."
featured: true
order: 2
---

Fast English is an English learning product for Persian speakers. A learner picks a short article at a CEFR level from A1 to C2, reads it, and listens to the same text as audio. It is live at fastenglishpodcast.ir with paid subscriptions, public library samples, a staff panel, and an Android app released as version 1.0.0.

The project started in 2025 and was built as a single product rather than a collection of experiments. This page covers what exists now, the decisions that shaped it, and the limits I would want a reader to know before trusting any part of it.

## What it is

The learning loop is narrow on purpose. Content is organized into categories and topics, and every topic has a lesson per level. A lesson pairs an article with its audio, so reading and listening practise the same material instead of drifting apart. The library includes adapted TED Talks with the original video linked, plus everyday reading topics.

Around that loop sit the features that keep a learner returning: a placement test that suggests a starting level without claiming to certify it, article vocabulary that turns into flashcards, a words notebook with one review schedule, reading progress, and a daily goal. The public landing page, trust pages, download page and install guide are part of the same application.

## How it works

One Laravel application serves everything: learner pages, the public marketing surface, protected media, and a staff panel. The learner and public UI run on Inertia 3 with React 19, TypeScript and Tailwind 4; the staff side is a Filament 5 panel. PostgreSQL is the only database. That shape came from a simple rule: one origin, one database, one place where access rules live.

Money and access are server-owned. A learner chooses a 30, 90 or 365 day plan, pays by card-to-card transfer, and uploads a receipt. Staff review the receipt and approve it. Approval runs as one transaction with a fixed lock order, writes an immutable subscription event, and computes the new expiry on the server. Nothing about entitlement is trusted from the client, and the database row is the only source of truth for whether a lesson can be played.

Media is deliberately not public. Lesson audio and receipts are stored on a private disk. Audio is streamed through a controller route with byte-range support so seeking works without ever exposing a permanent file URL. Receipt images are re-encoded and stripped of metadata before storage.

The Android app is a trustless wrapper around the same product: a browser-based install path plus a signed APK, with the release metadata kept in the repository so the download page, version, size and checksum cannot drift apart.

## Decisions that shaped it

Manual payment instead of a gateway. Card-to-card transfer with staff approval is slower than a payment gateway, but it is the payment path that actually works for this audience. The trade-off is manual review and activation latency, and I accepted that to keep the flow reliable. The approval path is the most carefully tested code in the product because it is where money and access meet.

One application instead of a separate API and SPA. A split API would have been fashionable and harder to keep honest. With Inertia, auth, CSRF, media routes and access checks stay in one place. The cost is that pages are server-driven rather than client-rendered, which is the right cost for an app where almost every page needs a database row and an entitlement check.

PostgreSQL only. The subscription and payment rules involve concurrent updates, unique events and idempotent replays. SQLite would have hidden those problems locally and surfaced them in production, so the product requires PostgreSQL everywhere.

No DRM claim. Buffered audio cannot be revoked. I state that plainly instead of implying protection the product does not have.

## How AI was used

Coding models helped with implementation, migration work and research. The product rules, the payment and entitlement design, the data model, and every review decision are mine. Automated tests gate the risky paths, including the approval transaction and the browser lanes, and I do not present generated code as verified because a model produced it.

## Status and limits

Fast English is live. The web product, the public library, paid plans, the staff panel and the Android 1.0.0 build all exist, and the source is public on GitHub. I keep publishing content in small batches rather than announcing a large library at once.

What it is not: there is no certificate or fluency promise, no dark theme in version one, no app-store listing, and no promise that every learner level has equal depth yet. Activation is manual, so a new subscriber waits for a human to review the receipt. And because the marketing pages run through the same session-based Laravel stack, they are not cached at a CDN, which is a deliberate trade for correctness at this stage.
