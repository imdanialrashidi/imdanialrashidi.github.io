---
seoTitle: "Gym Log: offline Android workout log"
title: "Gym Log"
summary: "An offline Android training log that records weight, reps and RIR, suggests the next load, and needs no account or connection."
metaDescription: "Gym Log is an offline, account-free Android workout journal: log sets with RIR, get double-progression suggestions, records and charts, and export JSON."
kicker: "Android · Offline training log"
kind: "product"
role: "Product, Android, design"
year: 2026
status: "live"
statusLabel: "Released, v0.2.1"
stack: ["Flutter", "Dart", "Android"]
links:
  live: "https://gym-log.danialrashidi.ir"
  github: "https://github.com/imdanialrashidi/gym-log"
cover: "gym-log"
coverAlt: "Gym Log landing page in Persian on a dark background: a headline about training without a notebook, next to a phone mockup of an active workout with bench-press set rows, download buttons, and Android, size and version specs."
featured: false
order: 4
---

Gym Log is my training log for Android. I wrote it so that between sets I do not need a notebook: I open one screen, enter weight, reps and RIR (reps in reserve), and the app keeps the history. It is Persian-first and right to left, with a choice between Persian and Latin digits, and it works without a connection.

I released version 0.2.1. The app is MIT-licensed, the source is on GitHub, and the APK installs directly from the release page. There is no account and no server.

## What it is

Gym Log is a local-first workout journal. It records each set with weight, reps and RIR, keeps warm-up sets separate, and builds the rest of the app from that history: personal records, an estimated one-rep max, per-exercise progress charts, and a double-progression suggestion for the next set. The app has four tabs: workout, programs, history and progress. The rest timer, plate and warm-up calculator, and Jalali calendar sit inside that flow so you do not leave the session to use a separate tool.

The landing page is at gym-log.danialrashidi.ir. The app requires Android 7.0 or later, and the download is an APK from the GitHub release.

## The problem

A gym session is a bad time to fight software. Between sets you have a minute, chalk on your hands and no patience for a login screen, a sync spinner or a network error. Generic note apps store text, not sets, so they cannot say whether last week's bench was heavier or whether the next set should add a rep or add weight. Cloud workout apps solve that by asking you to sign up and sync, which does not fit a basement gym where there is no signal.

What I wanted was narrow: log the set, keep my own history on my phone, and get one clear answer about what to do next.

## How it works

I log each exercise as a set with weight, reps and RIR. Warm-up sets stay separate so they do not pollute the working-set history. From the logged sets the app derives personal records and an Epley estimate for one-rep max, and draws progress per exercise. The double-progression rule reads the history and tells me either to complete the target reps or to increase the load. Weekly summaries count sets per muscle group, and body-weight check-ins have their own trend chart.

The four-tab shell is intentional: workout, programs, history, progress. Everything else is secondary to finishing a session from the workout tab. The workout tab shows the current exercise, the set count, volume and the active session timer; you add sets and finish the workout there.

## Decisions that shaped it

Local data, no backend. The app stores sessions in an app-private JSON document on the phone. Release builds do not request the INTERNET permission. That removes sync, accounts, analytics and most of the privacy surface from the design. The trade-off is real: moving to a new phone is manual, you export a JSON file and import it on the other device, and there is no cloud copy if the phone is lost. I took that trade because a training log is personal data that does not need to live on a server, and a server would have added cost and failure modes for a solo app.

Validated import before writing. The app validates the backup before it writes anything, and it supports both merge and replace. Progress photo files stay private and the app strips EXIF location before saving. The cost is code spent on parsing and validation instead of features. The benefit is that a corrupt import cannot silently destroy the only copy of the history.

A pure Dart domain package. The app is Flutter, with the domain logic in packages/lift_core, a pure Dart package kept that way by a guard. That boundary lets me test the domain rules without a device or a widget tree. It also adds a package to maintain and a step to the build. For a log where a wrong suggested load is worse than no suggestion, the testable core is worth the extra structure.

## Status and limits

Gym Log is at v0.2.1. The app is free, MIT-licensed, and installs as an APK from the GitHub release. The repository describes its status as M9 hardening and release engineering.

What is unfinished or unproven: the repository still lists real signing and the upgrade drill as owner steps, device performance budgets as unproven until I record a reference-device run, and the Drift database as a later milestone. Sessions currently live in the app-private JSON document, not in a database. The JSON backup is the only way to move data between phones.

Deliberately out of scope: accounts, analytics and a backend. The release build asks for no network permission, and that is the shape of the app, not a gap. The trade is that there is no cloud backup and no sync between devices.

I claim no user counts, retention numbers or training outcomes. The outcome I can verify is the one the app is for: between sets I log the set, and the app tells me what to do next.
