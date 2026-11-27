#!/usr/bin/env node
/**
 * Generates the 1200x630 social cards under public/og/.
 *
 * Why a separate script: the cards need the site typefaces and real screenshots,
 * and GitHub Pages can only serve static files. Rendering happens with the
 * locally installed Chrome (headless), so the build itself stays dependency-free
 * and deterministic. Output is committed; run `npm run og` after changing
 * project copy, screenshots, or the card design.
 *
 * Env: CHROME_PATH=/path/to/chrome overrides binary detection.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const outDir = path.join(publicDir, 'og')
const assets = path.join(root, 'src', 'assets')
const fontsDir = path.join(publicDir, 'fonts')

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/opt/google/chrome/chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const chrome = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate))
if (!chrome) {
  console.error('No Chrome binary found. Set CHROME_PATH and retry.')
  process.exit(1)
}

const b64 = (buffer) => buffer.toString('base64')
const font = (file) => `data:font/woff2;base64,${b64(fs.readFileSync(path.join(fontsDir, file)))}`
const image = (file) => `data:image/webp;base64,${b64(fs.readFileSync(path.join(assets, file)))}`

const FONT_FACES = `
@font-face { font-family: 'Instrument Serif'; src: url(${font('instrument-serif-regular.woff2')}) format('woff2'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Instrument Serif'; src: url(${font('instrument-serif-italic.woff2')}) format('woff2'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'Geist'; src: url(${font('geist-latin.woff2')}) format('woff2'); font-weight: 100 900; font-style: normal; }
@font-face { font-family: 'Geist Mono'; src: url(${font('geist-mono-latin.woff2')}) format('woff2'); font-weight: 100 900; font-style: normal; }
`

const htmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const COMMON_CSS = `
${FONT_FACES}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body {
  background: #f6f2ea; color: #191612; font-family: 'Geist', system-ui, sans-serif;
  display: flex; gap: 56px; padding: 60px 64px; overflow: hidden;
}
.left { width: 560px; display: flex; flex-direction: column; justify-content: space-between; flex: none; }
.accent { width: 92px; height: 6px; background: #b8320c; margin-bottom: 26px; }
.kicker { font-family: 'Geist Mono', monospace; font-size: 17px; letter-spacing: 0.09em; text-transform: uppercase; color: #b8320c; }
h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 76px; line-height: 0.98; letter-spacing: -0.025em; margin-top: 18px; }
h1 em { font-style: italic; }
.summary { font-size: 23px; line-height: 1.42; color: #4e483f; margin-top: 24px; max-width: 540px; }
.status { display: inline-flex; align-items: center; gap: 10px; margin-top: 26px; font-family: 'Geist Mono', monospace; font-size: 16px; letter-spacing: 0.05em; text-transform: uppercase; color: #4e483f; }
.status::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #b8320c; }
.foot { display: flex; justify-content: space-between; font-family: 'Geist Mono', monospace; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; color: #6b655a; border-top: 1px solid #ded5c4; padding-top: 16px; }
.right { flex: 1; display: flex; align-items: center; justify-content: center; min-width: 0; }
.frame { width: 100%; border: 1px solid #ded5c4; border-radius: 10px; overflow: hidden; background: #fffdf8; box-shadow: 0 2px 4px rgba(25,22,18,.05), 0 30px 60px -34px rgba(25,22,18,.45); }
.frame img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
.shot { aspect-ratio: 16 / 10; }
.portrait { aspect-ratio: 4 / 5; width: 78%; }
.gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
.gallery .frame { box-shadow: 0 2px 4px rgba(25,22,18,.05), 0 18px 40px -26px rgba(25,22,18,.4); }
.gallery .frame img { aspect-ratio: 16 / 11; }
.plate { width: 100%; aspect-ratio: 4 / 4.2; background: #191612; color: #f6f2ea; border-radius: 10px; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
.plate .plate-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 58px; line-height: 1; letter-spacing: -0.02em; }
.plate .plate-foot { display: flex; justify-content: space-between; font-family: 'Geist Mono', monospace; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; color: #b9b1a2; border-top: 1px solid rgba(246,242,234,.18); padding-top: 14px; }
.contact-card { width: 100%; border: 1px solid #ded5c4; border-radius: 10px; background: #fffdf8; padding: 42px 38px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 2px 4px rgba(25,22,18,.05), 0 30px 60px -34px rgba(25,22,18,.35); }
.contact-card .label { font-family: 'Geist Mono', monospace; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b655a; }
.contact-card .email { font-family: 'Instrument Serif', Georgia, serif; font-size: 47px; line-height: 1.08; letter-spacing: -0.015em; color: #191612; overflow-wrap: anywhere; }
.contact-card .note { font-size: 19px; color: #4e483f; line-height: 1.4; }
`

/** @type {{file: string, kicker: string, title: string, summary: string, status?: string, visual: string}[]} */
const cards = []

cards.push({
  file: 'default.jpg',
  kicker: 'Danial Rashidi · Software & Product Builder',
  title: 'From a vague idea to a <em>system that works.</em>',
  summary:
    'Web products, client websites, automations, and an Android app. Built in Iran, working remotely.',
  visual: `<div class="frame portrait"><img src="${image('portrait/danial-hero.webp')}" alt=""></div>`,
})

cards.push({
  file: 'work.jpg',
  kicker: 'Portfolio index · Nine projects',
  title: 'Work',
  summary: 'Three products I own and six client builds, with real screenshots and honest status.',
  visual: `<div class="gallery">
    <div class="frame"><img src="${image('work/noveno.webp')}" alt=""></div>
    <div class="frame"><img src="${image('work/study.webp')}" alt=""></div>
    <div class="frame"><img src="${image('work/kidotalks.webp')}" alt=""></div>
    <div class="frame"><img src="${image('work/elsa-hamrah.webp')}" alt=""></div>
  </div>`,
})

cards.push({
  file: 'travels.jpg',
  kicker: 'Travel notes · Iran',
  title: 'Mountains, canyons, caves',
  summary:
    'Short notes from trips around Iran: Dalakhani Valley, Dareh Marg, and a cave survey for national registration.',
  visual: `<div class="frame shot"><img src="${image('travels/dalakhani.webp')}" alt=""></div>`,
})

cards.push({
  file: 'about.jpg',
  kicker: 'About · Software & Product Builder',
  title: 'Danial Rashidi',
  summary:
    'The path from client websites to products I own, how I work, and life outside the editor.',
  visual: `<div class="frame portrait"><img src="${image('portrait/danial-portrait.webp')}" alt=""></div>`,
})

cards.push({
  file: 'now.jpg',
  kicker: 'Now · Updated November 2026',
  title: 'What I am doing now',
  summary:
    'Building Noveno, growing Study Center, developing Fast English, and maintaining Gym Log.',
  visual: `<div class="frame shot"><img src="${image('work/noveno.webp')}" alt=""></div>`,
})

cards.push({
  file: 'contact.jpg',
  kicker: 'Contact · No form, no tracker',
  title: "Let's build something <em>useful.</em>",
  summary: 'Email is the fastest route to a real answer. I reply within a day or two.',
  visual: `<div class="contact-card">
    <span class="label">Email</span>
    <span class="email">imdanialrashidi@gmail.com</span>
    <span class="note">Open to remote software work, product collaborations, and business websites.</span>
  </div>`,
})

const projects = [
  {
    slug: 'noveno',
    title: 'Noveno',
    kicker: 'Own product · Founder venture',
    summary:
      'My own business: a customer-acquisition service for Iranian service businesses, built one working piece at a time.',
    status: 'Live, in development',
    cover: 'work/noveno.webp',
    kicker2: 'Founder venture · Acquisition systems',
  },
  {
    slug: 'fast-english',
    title: 'Fast English',
    kicker: 'Client work · English learning',
    summary:
      'A Persian-first English reading and listening product: CEFR-leveled articles with matching audio, flashcards and an Android app.',
    status: 'Live product',
    cover: 'work/fast-english.webp',
  },
  {
    slug: 'kidotalks',
    title: 'Kidotalks',
    kicker: 'Client work · Education',
    summary:
      'A Persian-first English learning platform for children: short video lessons, visual practice, flashcards, stories and a parent zone.',
    status: 'Release candidate',
    cover: 'work/kidotalks.webp',
  },
  {
    slug: 'study',
    title: 'Study Center',
    kicker: 'Own product · Education',
    summary:
      'A growing catalogue of independent, interactive Persian course websites, each one a separate site.',
    status: 'Live, growing',
    cover: 'work/study.webp',
  },
  {
    slug: 'gym-log',
    title: 'Gym Log',
    kicker: 'Own product · Android',
    summary:
      'An offline Android training log that records weight, reps and RIR, suggests the next load, and needs no account.',
    status: 'Released, v0.2.1',
    cover: 'work/gym-log.webp',
  },
  {
    slug: 'elsa-hamrah',
    title: 'Elsa Hamrah',
    kicker: 'Client work · E-commerce',
    summary:
      'Persian online store for phones, tablets, smartwatches and accessories, with clear categories and brand filters.',
    status: 'Shipped 2024',
    cover: 'work/elsa-hamrah.webp',
  },
  {
    slug: 'isbatab',
    title: 'Isbatab',
    kicker: 'Client work · Corporate',
    summary:
      'Corporate website for a Tehran HSE, safety and technical inspection company, built around evidence.',
    status: 'Shipped 2024',
    cover: 'work/isbatab.webp',
  },
  {
    slug: 'mobile-khorsandi',
    title: 'Mobile Khorsandi',
    kicker: 'Client work · Retail',
    summary:
      'Online store for phones, accessories, parts and gadgets, with categories, search, cart and buying guides.',
    status: 'Shipped 2024',
    cover: 'work/mobile-khorsandi.webp',
  },
  {
    slug: 'php-ielts-house',
    title: 'PHP IELTS House',
    kicker: 'Client work · Education',
    summary:
      'Website for an English and IELTS institute in Karaj: courses, levels, published results and placement booking.',
    status: 'Shipped 2024',
    cover: 'work/php-ielts-house.webp',
  },
]

for (const project of projects) {
  const visual = project.cover
    ? `<div class="frame shot"><img src="${image(project.cover)}" alt=""></div>`
    : `<div class="plate"><span class="plate-title">${htmlEscape(project.title)}</span><span class="plate-foot"><span>2025</span><span>${htmlEscape(project.status)}</span></span></div>`
  cards.push({
    file: `work/${project.slug}.jpg`,
    kicker: project.kicker,
    title: project.title,
    summary: project.summary,
    status: project.status,
    visual,
  })
}

const htmlFor = (card) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>${COMMON_CSS}</style></head>
<body>
  <div class="left">
    <div>
      <div class="accent"></div>
      <p class="kicker">${htmlEscape(card.kicker)}</p>
      <h1>${card.title}</h1>
      <p class="summary">${htmlEscape(card.summary)}</p>
      ${card.status ? `<p class="status">${htmlEscape(card.status)}</p>` : ''}
    </div>
    <div class="foot"><span>Danial Rashidi</span><span>imdanialrashidi.github.io</span></div>
  </div>
  <div class="right">${card.visual}</div>
</body></html>`

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'))
fs.mkdirSync(path.join(outDir, 'work'), { recursive: true })

let failures = 0
for (const card of cards) {
  const htmlPath = path.join(tmp, `${card.file.replaceAll('/', '_')}.html`)
  const pngPath = htmlPath.replace(/\.html$/, '.png')
  fs.writeFileSync(htmlPath, htmlFor(card))

  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--screenshot=${pngPath}`,
      '--virtual-time-budget=2500',
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore', timeout: 60000 },
  )

  if (result.status !== 0 || !fs.existsSync(pngPath)) {
    console.error(`FAILED ${card.file}`)
    failures += 1
    continue
  }

  const out = path.join(outDir, card.file)
  await sharp(pngPath).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(out)
  console.log(`wrote og/${card.file} (${Math.round(fs.statSync(out).size / 1024)}K)`)
}

fs.rmSync(tmp, { recursive: true, force: true })
if (failures > 0) {
  console.error(`${failures} card(s) failed`)
  process.exit(1)
}
console.log(`\n${cards.length} social cards written to public/og/`)
