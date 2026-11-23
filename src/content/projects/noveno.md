---
seoTitle: "Noveno: customer acquisition system"
title: "Noveno"
summary: "My own business: a customer-acquisition service for Iranian service businesses, turning scattered attention into recorded, followed-up requests."
metaDescription: "Noveno is my customer-acquisition business in Iran: the problem, the audit-first process, the static site behind it, and the limits I have not passed."
kicker: "Founder venture · Acquisition systems · Web"
kind: "product"
role: "Founder, product, engineering"
year: 2025
status: "building"
statusLabel: "Live, in development"
stack: ["Astro 7", "TypeScript", "Tailwind CSS", "GitHub Pages", "Web3Forms"]
links:
  live: "https://noveno.ir"
cover: "noveno"
coverAlt: "Noveno homepage in Persian: a headline asking for a site that brings real customers, a green audit request button, and an abstract line drawing of the letter N above the four stages attention, request, registration and follow-up."
featured: true
order: 1
---

Noveno is my own business, separate from client work and separate from this portfolio. It is a customer-acquisition system for service businesses in Iran: I review how attention reaches a business, then build the path that turns scattered visits into requests with a source, a status and a next step.

The public site is noveno.ir, with services, pricing, examples, a blog and an audit form. This page is the founder view: what the business is trying to fix, what I have actually built, and what is still only a plan. I do not repeat the packages or the sales copy here.

## What it is

Noveno organizes acquisition as four stages: attention, request, registration and follow-up. The offer is narrow on purpose. I do not run campaigns; I fix the path after attention, so each request has one canonical place, a known source and a status the owner can see. Engagements start with a review of the current path, then build the pieces that are missing: landing pages, messages, forms, phone routes and a simple register for requests.

Noveno is a separate venture, not another client project. The portfolio links to the live site instead of mirroring its offers, and the live site remains the commercial source of truth.

## The problem

The failure is rarely a lack of visits. It is what happens after a visit. A message sits in a direct-message inbox, a phone call is never written down, follow-up depends on memory, and nobody can say which channel produced which request. The owner sees interest but cannot see the path.

Buying more attention before fixing that path spends more money into the same leak. Noveno starts from the opposite direction: first find where requests disappear, then build the smallest path that records and follows them. That order is the product.

## How it works

The first step is a short review. Five questions and a conversation are enough to describe where requests currently come from and where they disappear. I write down the current path, the gaps and the first changes worth making before anyone commits to a larger build.

If we continue, I build one path rather than every possible feature: a page that states one service and one next step, a form, message or call route, and a place where each request gets a source and a status such as new, contacted, qualified, won or lost. Follow-up becomes a small routine instead of a new job the owner has to invent.

The site itself follows the same rule. It is a static Astro build on GitHub Pages with no client framework; theme, menu and the audit form are plain TypeScript modules. The audit form is the only write path. It posts five fields to Web3Forms, which sends them to my inbox. There is no database and no stored lead. The form has explicit failure states in Persian and offers a direct phone or Telegram route when submission fails, so a lost request is not dressed up as a success.

## Decisions that shaped it

Static first, email as the deliverable. I chose a static site and one narrow form over a database-backed lead system. The trade-off is concrete: there is no durable store, a request exists only once the email provider accepts it, and the browser posts directly to that provider rather than through my own server. I logged that direct-post risk as technical debt instead of hiding it. In exchange the site has no database to operate, no login and no pile of stored personal data. For a one-person business that sells a path review, the simpler failure mode is the better one.

I first drew the system as a flow chart. I rejected that direction in August 2026: boxes, arrows and station diagrams made the work look smaller and more technical than it is, and their hierarchy collapsed on a phone. The site now explains the ordering through typography, editorial numbers and the real audit interface. The trade-off is that a system is harder to explain without a diagram, so clarity has to come from sequence and editing. That costs more time, and it is the right cost.

I enforce honesty with types on the Noveno site. Work entries are project, concept or case-study; the build rejects a metric unless it carries a verified flag and a source, and concept entries cannot carry metrics at all. The trade-off is authoring friction: I cannot publish a good-looking number without evidence. The examples page marks the outcome as still being measured where no result exists yet.

## Status and limits

Noveno is live and in development. The public site is real: services, pricing, process, examples, a blog, the audit form, privacy and terms. The business is early and I run it alone. I sell the work as engagements, not as a finished software product.

What is still only an idea is proof with numbers. I have not published a client case study with a measured before-and-after, because no engagement has produced data I can cite yet. I assemble the acquisition system per client, so there is no single dashboard showing every client funnel. I also publish no conversion figure for the site.

Deliberately out of scope: guaranteed sales, stock-photo proof, a lead database, and a second sales funnel inside this portfolio. The direct browser-to-email form remains technical debt; I would rather say that than claim a boundary I have not built. The next honest milestone is a first client engagement whose path I can measure, not another page about the idea.
