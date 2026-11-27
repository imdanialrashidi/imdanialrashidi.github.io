---
seoTitle: "Kidotalks: English for children"
title: "Kidotalks"
summary: "Persian-first English learning platform for children: short animated lessons, visual practice, flashcards, stories and a parent zone, as a web app and Android app."
metaDescription: "Kidotalks is a Persian-first English learning platform for children: short video lessons, visual practice, flashcards, stories and a parent zone. Built in 2026."
kicker: "Client work · Education · Web and app"
kind: "client"
role: "Product engineering, platform and learner app"
year: 2026
status: "in_development"
statusLabel: "Release candidate · owner review"
stack: ["Next.js 16", "Payload CMS", "PostgreSQL", "React Native", "Expo", "TypeScript"]
links:
  live: "https://kidotalks.ir"
  related: "https://app.kidotalks.ir"
cover: "kidotalks"
coverAlt: "Kidotalks homepage in Persian: a cream and lilac hero with an illustrated cat video lesson, the headline about one video and one new word, and sign-up and pricing buttons."
featured: false
order: 9
---

Kidotalks is a Persian-first English learning product for children, live at kidotalks.ir. A parent holds one account and one child profile. The child watches a short animated video, hears a word with clear audio, and answers one visual single-choice question. The same unit vocabulary then returns in flashcards, stories and practice sets, so a lesson is a loop rather than a single clip.

The work is client work. The brand, catalogue and commercial direction come from the client; my scope is the platform, the learner experience and the release mechanics. The project started in 2026. This page covers what exists, the decisions behind it, and the limits that still apply.

## What it is

The public site explains the product, the price, installation on iPhone and Android, the parent zone, the legal pages and a support path. The learner app runs as a web app, an installable iPhone web app and an Android build from the same React Native codebase.

The learning loop is deliberately narrow. One video carries one idea. After the video the child answers one picture question. A flashcard deck turns the same words into a listening and speaking prompt, with the word, IPA and Persian meaning revealed after a short pause. Storybooks put the unit vocabulary into a short narrative, and practice sets bring the words back as tap-a-picture and ordering exercises. Progress is written to one learning-event ledger, and the parent zone turns it into effort stars, badges, a soft daily goal and review suggestions.

There is no advertising, no purchase button and no ranking in the child path. Buying and settings sit behind the parent login. The product also avoids punitive streaks and comparisons between children; the goal is a short session that ends naturally.

## How it works

The platform is a Next.js 16 application with Payload CMS and PostgreSQL. It owns the catalogue, the family accounts, the subscription boundary and the admin surface. The learner is an Expo and React Native app that runs on Android and as React Native Web for the installable iPhone path. Shared TypeScript and zod contracts sit between them, so a lesson, story or practice set is validated once rather than in each client.

Parent access uses a phone number and an SMS one-time code, with an optional email and password inside the parent zone. One subscription covers one child profile. Payment is card to card: the parent transfers the amount and uploads a receipt, a super-admin reviews it, and activation is confirmed by SMS. Entitlement is never read from the client. The platform checks the subscription, signs media access and returns the child experience only while the account is active.

Video files live on a separate hosting provider. The platform stores provider identifiers and HLS and MP4 URLs, so the delivery provider can change without a data migration. A signed library paywall and a playback token protect paid media. The same boundary covers video lessons, flashcards, storybooks and practice.

Content operations are part of the product, not an afterthought. The admin panel has one video editor with a draft and publish state, a signed child preview and a single exercise. Bulk imports validate a versioned manifest, dry-run first, write drafts and never overwrite published content. An agent interface can read the taxonomy and save drafts through the same rules. Publishing stays a human action, and licence clearance is separate from the technical publish gate.

## Decisions that shaped it

One child per subscription. A family account that can add unlimited profiles changes pricing, support and the meaning of progress. The client chose a single child profile for this release, so the learner, the parent report and the subscription all describe the same person.

Short sessions over a streak. The product has a soft daily goal, effort stars and a mascot, but no lost rewards, no leaderboard and no pressure timer. A child can stop at any point and keep the progress. This is a deliberate limit on engagement mechanics.

Card to card with human approval. The payment path is slower than a gateway, but it works without a merchant account. The trade-off is an approval queue and activation latency, and the flow is built around that reality rather than pretending it is instant.

No app store dependency. Android has a direct build and iPhone installs as a web app. That keeps the release in the client's hands, at the cost of an install guide and no store listing.

## How AI was used

Coding models helped with implementation, migrations, content tooling and research. The product rules, the data model, the access boundary and the review decisions are mine. Automated checks gate the import and release paths, and generated content is a draft until a person publishes it. I do not treat a model's output as verified because a model produced it.

## Status and limits

Kidotalks is a release candidate, not a finished commercial launch. The public site and the learner app are deployed for owner review, and the core loops work, but the release gate is not closed. The catalogue still needs a complete licence record for every third-party video, the legal copy needs its final pass, off-server backups and monitoring need to be in place, and the Android and iPhone experience needs a physical device pass.

The install path is a web app on iPhone and a direct Android build, with no App Store or Google Play listing. Offline use is partial: a lesson that has played can remain in the browser, but iOS may clear that storage and background sync is not guaranteed. Progress syncing depends on a connection.

I have no independent retention or learning-outcome data to report, and I do not present the activity counter on the marketing page as evidence of learning. There is no certification or formal level claim. The status label on this page says release candidate because that is what it is.
