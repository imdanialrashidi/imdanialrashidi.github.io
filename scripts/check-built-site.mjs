#!/usr/bin/env node
/**
 * Post-build verification against the actual artifact in dist/.
 *
 * Source-level tests cannot prove that canonicals, sitemap URLs and served file
 * paths agree. This script reads the built HTML and fails when they drift, and
 * when the static-first performance budget regresses.
 *
 * Run after `npm run build` (scripts/verify.sh does this).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const siteUrl = 'https://imdanialrashidi.github.io'

let failures = 0
const pass = (message) => console.log(`PASS  ${message}`)
const fail = (message) => {
  console.error(`FAIL  ${message}`)
  failures += 1
}
const check = (condition, message) => (condition ? pass(message) : fail(message))

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing. Run npm run build first.')
  process.exit(1)
}

const decode = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#x2F;', '/')

const metaContent = (html, pattern) => {
  const match = html.match(pattern)
  return match ? decode(match[1]) : null
}

/** Maps a site URL to the file GitHub Pages serves for it. */
function fileForUrl(url) {
  const pathname = new URL(url).pathname
  if (pathname === '/') return path.join(dist, 'index.html')
  assertTrailingSlash(pathname)
  return path.join(dist, pathname.replace(/\/$/, ''), 'index.html')
}

function assertTrailingSlash(pathname) {
  if (!pathname.endsWith('/')) fail(`URL does not use the trailing-slash form: ${pathname}`)
}

const htmlFiles = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (path.basename(full) === '_astro') continue
      walk(full)
    } else if (entry.name.endsWith('.html')) {
      htmlFiles.push(full)
    }
  }
}
walk(dist)

// ---------------------------------------------------------------- sitemap
const sitemapPath = path.join(dist, 'sitemap-0.xml')
if (!fs.existsSync(sitemapPath)) {
  fail('dist/sitemap-0.xml is missing')
  process.exit(1)
}
const sitemap = fs.readFileSync(sitemapPath, 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
check(urls.length === 14, `sitemap contains 14 indexable URLs (found ${urls.length})`)
check(
  urls.every((url) => url === `${siteUrl}/` || url.endsWith('/')),
  'every sitemap URL uses the trailing-slash form',
)
check(!urls.some((url) => url.includes('/404')), 'the 404 page is excluded from the sitemap')

// ------------------------------------------------------------ page budget
const titles = new Set()
const descriptions = new Set()
let totalHtml = 0
for (const file of htmlFiles) {
  const relative = path.relative(dist, file)
  const html = fs.readFileSync(file, 'utf8')
  totalHtml += Buffer.byteLength(html)
  if (relative === '404.html') continue

  const url = new URL(relative.replace(/index\.html$/, ''), `${siteUrl}/`).toString()
  const expected = url.endsWith('index.html') ? url : url

  // Resolve the canonical for this file from the HTML itself.
  const canonical = metaContent(html, /<link rel="canonical" href="([^"]+)"/)
  if (!canonical) {
    fail(`${relative}: missing canonical`)
    continue
  }
  if (urls.includes(canonical)) {
    // ok
  } else {
    fail(`${relative}: canonical ${canonical} is not in the sitemap`)
  }
  if (!filesMatch(canonical, relative)) {
    fail(`${relative}: canonical does not map back to this file (${canonical}, ${expected})`)
  }

  const title = decode((html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '')
  const description = metaContent(html, /<meta name="description" content="([^"]*)"/)
  const robots = metaContent(html, /<meta name="robots" content="([^"]*)"/)
  const ogImage = metaContent(html, /<meta property="og:image" content="([^"]*)"/)
  const lang = (html.match(/<html lang="([^"]+)"/) ?? [])[1]

  check(title.length >= 20 && title.length <= 68, `${relative}: title length ${title.length}`)
  check(
    Boolean(description) && description.length >= 90 && description.length <= 170,
    `${relative}: description length ${description?.length ?? 0}`,
  )
  check(
    Boolean(robots) && robots.includes('index') && robots.includes('follow'),
    `${relative}: robots`,
  )
  check(lang === 'en', `${relative}: html lang is en`)
  check((html.match(/<h1\b/g) ?? []).length === 1, `${relative}: exactly one h1`)

  if (!titles.has(title)) titles.add(title)
  else fail(`${relative}: duplicate title "${title}"`)
  if (description) {
    if (!descriptions.has(description)) descriptions.add(description)
    else fail(`${relative}: duplicate description`)
  }

  // Social card must exist in the artifact.
  if (!ogImage) {
    fail(`${relative}: missing og:image`)
  } else {
    const ogFile = path.join(dist, new URL(ogImage).pathname)
    if (!fs.existsSync(ogFile)) fail(`${relative}: og:image file missing (${ogImage})`)
  }

  // Structured data must parse and carry the identity graph.
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  if (ld.length !== 1) fail(`${relative}: expected exactly one JSON-LD block (${ld.length})`)
  if (ld.length === 1) {
    try {
      const data = JSON.parse(ld[0][1])
      const graph = data['@graph'] ?? []
      const types = graph.flatMap((node) => node['@type'])
      if (!graph.length) fail(`${relative}: empty @graph`)
      if (!types.includes('Person')) fail(`${relative}: JSON-LD missing Person`)
      if (!types.includes('WebSite')) fail(`${relative}: JSON-LD missing WebSite`)
      if (!types.includes('WebPage') && !types.some((type) => String(type).includes('Page'))) {
        fail(`${relative}: JSON-LD missing a page entity`)
      }
      const person = graph.find((node) => node['@type'] === 'Person')
      if (person && (!Array.isArray(person.sameAs) || person.sameAs.length < 4)) {
        fail(`${relative}: Person.sameAs is too thin`)
      }
    } catch (error) {
      fail(`${relative}: JSON-LD does not parse (${error.message})`)
    }
  }

  // Images must be real files with intrinsic dimensions and an alt attribute.
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0]
    if (!/\balt(=|\s|>)/.test(tag)) fail(`${relative}: image without alt (${tag.slice(0, 80)})`)
    if (!/\bwidth="?\d+/.test(tag) || !/\bheight="?\d+/.test(tag)) {
      fail(`${relative}: image without width/height (${tag.slice(0, 80)})`)
    }
    const src = (tag.match(/\bsrc="([^"]+)"/) ?? [])[1]
    const srcset = (tag.match(/\bsrcset="([^"]+)"/) ?? [])[1]
    const candidates = new Set(
      [src, ...(srcset?.split(',').map((entry) => entry.trim().split(/\s+/)[0]) ?? [])].filter(
        (value) => value?.startsWith('/'),
      ),
    )
    for (const candidate of candidates) {
      if (!fs.existsSync(path.join(dist, candidate)))
        fail(`${relative}: missing image ${candidate}`)
    }
  }

  // Internal links must resolve to a real file in the artifact.
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const target = match[1]
    const lastSegment = target.split('/').filter(Boolean).pop() ?? ''
    if (lastSegment.includes('.')) {
      // A static file (font, icon, manifest, sitemap, social card).
      if (!fs.existsSync(path.join(dist, target)))
        fail(`${relative}: missing static file ${target}`)
      continue
    }
    if (!fs.existsSync(fileForUrl(new URL(target, siteUrl).toString()))) {
      fail(`${relative}: internal link does not resolve: ${target}`)
    }
  }
}

function filesMatch(canonical, relative) {
  const expected = new URL(relative.replace(/index\.html$/, ''), `${siteUrl}/`).toString()
  const normalise = (value) => (value === siteUrl ? `${siteUrl}/` : value)
  return normalise(canonical) === normalise(expected)
}

check(titles.size > 0 && titles.size === htmlFiles.length - 1, 'every page has a unique title')
check(totalHtml < 700 * 1024, `total HTML stays lean (${Math.round(totalHtml / 1024)}K)`)

// ------------------------------------------------------------------ 404
const notFound = fs.readFileSync(path.join(dist, '404.html'), 'utf8')
check(/<meta name="robots" content="noindex/.test(notFound), '404.html is noindex')

// ------------------------------------------------------------ JS and CSS
const jsFiles = []
const walkAssets = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkAssets(full)
    else if (entry.name.endsWith('.js')) jsFiles.push(full)
  }
}
walkAssets(dist)
check(jsFiles.length === 0, `no external JavaScript chunks are emitted (found ${jsFiles.length})`)

const cssFiles = fs.readdirSync(path.join(dist, '_astro')).filter((file) => file.endsWith('.css'))
check(cssFiles.length > 0, 'global CSS ships as a cacheable hashed file')
check(
  htmlFiles.every((file) => fs.readFileSync(file, 'utf8').includes('rel="stylesheet"')),
  'every page links the external stylesheet',
)

// --------------------------------------------------------- asset budget
const imageFiles = []
const walkImages = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkImages(full)
    else if (/\.(webp|png|jpg|jpeg|avif)$/.test(entry.name)) imageFiles.push(full)
  }
}
walkImages(dist)
const oversized = imageFiles.filter((file) => fs.statSync(file).size > 300 * 1024)
check(
  oversized.length === 0,
  `no single image over 300K (${oversized.map((f) => path.basename(f)).join(', ')})`,
)
function directorySize(dir) {
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) total += directorySize(full)
    else total += fs.statSync(full).size
  }
  return total
}
const totalDist = Number((directorySize(dist) / (1024 * 1024)).toFixed(2))
check(totalDist < 8, `artifact stays under 8MB (${totalDist}MB)`)

// --------------------------------------------------------------- result
console.log('')
if (failures > 0) {
  console.error(`built-site check: ${failures} failure(s)`)
  process.exit(1)
}
console.log(
  `built-site check: ${urls.length} pages verified, ${imageFiles.length} images, ${totalDist}MB total`,
)
