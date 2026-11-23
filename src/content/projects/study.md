---
seoTitle: "Study Center: interactive courses"
title: "Study Center"
summary: "A growing catalogue of independent, interactive Persian course websites, each one a separate site you can open and start."
metaDescription: "Study Center collects the interactive Persian course websites I build: Physics 2, Python, digital logic and data structures, each an independent site."
kicker: "Education · Interactive course sites · Web"
kind: "product"
role: "Product, design, engineering"
year: 2026
status: "live"
statusLabel: "Live, growing"
stack: ["Astro", "Tailwind CSS", "GitHub Pages"]
links:
  live: "https://study.danialrashidi.ir"
cover: "study"
coverAlt: "Study Center homepage in Persian on a cream background: a headline about websites that make hard lessons simple, Telegram and course buttons, and the heading of the course index below."
featured: true
order: 3
---

Study Center is a catalogue of interactive course websites I build. Each course is its own site on its own subdomain: a student opens the link and starts. The hub at study.danialrashidi.ir exists to make those separate sites findable.

I have published four courses: Physics 2, Advanced Programming with Python, Digital Logic, and Data Structures and Algorithms. All four are in Persian and run in the browser.

## What it is

Some lessons do not land after one pass through a set of notes. They need a worked example, something the student can change, and a place to practise while the idea is still fresh. Study Center is my answer: a family of course websites where the explanation is step by step and the practice happens on the same page.

The hub is an index and an entry point. Each row is a separate website. Physics 2 covers electricity, magnetism and circuits with simulations. Advanced Programming covers object orientation, design patterns and concurrency in Python. Digital Logic covers gates, Boolean algebra, and combinational and sequential circuits. Data Structures and Algorithms goes from the definition of an algorithm to complexity analysis with solved examples. The course sites carry the lessons. The hub only helps you choose one.

## The problem

One learning platform would force every subject into the same shell. A physics course wants a simulation; a programming course wants runnable examples; a data structures course wants worked traces. The interface that fits one subject gets in the way of another, and a shared template tends to win over the subject.

A student also should not need an account to read a lesson. The entry cost matters more than the feature list. What a student needs is a clear way to find the right course and a site that opens straight into the material.

## How it works

Study Center lists courses in a featured block and a full index. The index supports search and category filters for physics, programming, logic and data structures. Search normalizes Persian characters, including Arabic yeh and kaf written on a phone keyboard, and collapses extra spaces, so a query matches regardless of how the letters were typed. A course row shows the subject, title, a short description, tags such as practice in browser or university, and two actions: open the course site or open the course detail page.

Each detail page is a small landing page on the hub with what the course covers, its tags and the link out. The course site is where the teaching happens: step-by-step explanations, examples you can manipulate, and exercises you solve in the browser.

If a lesson is hard or a subject is missing, the suggestion route is Telegram. The page says those messages decide what the next course is. The trade-off is obvious: this is manual, it does not scale, and it is not a public issue tracker. In exchange it stays private, a person writes back, and the backlog reflects what students actually struggle with instead of a form field nobody reads.

## Decisions that shaped it

Independent sites instead of one platform. This is the decision the rest of the project follows. Each course gets its own site, its own build and its own interaction model. The cost is that there is no shared navigation, no single progress view and no template that saves work on the next course. The benefit is that Physics 2 can be a simulation-first site and the algorithms course can be exercise-first, without either bending to the other. The hub stays small because it only has to describe and link.

A static hub with client-side search. The catalogue is small enough to ship in the HTML, so search and filtering run in the browser with a short script; there is no search service, no database and no API call. The cost is that I rebuild and redeploy the hub for every new course. The benefit is fast pages on mobile, no backend to maintain, and a site that still works when everything else is slow.

The suggestion route is a person, not a form. I chose Telegram over a suggestion form because a message can include the subject and the exact place where a student is stuck, and I can reply with a question. A form would have collected tidier data, but it also would have let suggestions sit unanswered. The manual route is the honest one for a catalogue this size.

## Status and limits

Study Center is live and growing. The catalogue has four published courses, and all four appear in the featured block, and the site says that plainly instead of implying a larger catalogue. The hub is a static Astro site on GitHub Pages; the course sites are independent Astro sites on their own subdomains, also on GitHub Pages.

Unfinished: the next courses are not announced, and there is no public roadmap with dates. What students ask for sets priorities, which means the queue moves at the speed of a person reading messages. I do not publish student counts, completion rates or outcome claims, because I do not have that data to publish.

Deliberately out of scope: a learning-management system. The hub does not host lessons, grade work centrally or promise completion; each course owns its own teaching. If a course needs something the hub could provide, I will add it then. For now the directory is the shape of the product, and each course stands on its own.
