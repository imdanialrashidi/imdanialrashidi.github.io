import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8')

const layout = read('src/layouts/Layout.astro')
const config = read('astro.config.mjs')
const siteData = read('src/data/site.ts')
const robots = read('public/robots.txt')

const pageFiles = [
  'src/pages/index.astro',
  'src/pages/work/index.astro',
  'src/pages/work/[slug].astro',
  'src/pages/travels.astro',
  'src/pages/about.astro',
  'src/pages/now.astro',
  'src/pages/contact.astro',
]

test('the shared layout ships the full technical SEO baseline', () => {
  for (const marker of [
    '<link rel="canonical"',
    '<meta name="description"',
    '<meta name="robots"',
    'property="og:image"',
    'name="twitter:card"',
    'application/ld+json',
    'rel="me"',
    'google-site-verification',
    'name="viewport" content="width=device-width, initial-scale=1"',
    'rel="preload"',
  ]) {
    assert.ok(layout.includes(marker), `Layout must include ${marker}`)
  }
  assert.ok(!layout.includes('ClientRouter'), 'no client-side router in the layout')
  assert.ok(layout.includes('noindex'), 'layout supports noindex pages')
  assert.ok(
    layout.includes('canonical') && layout.includes('normalizedPath'),
    'canonical normalises the trailing slash',
  )
  assert.ok(
    layout.includes('trailingSlash: "always"') || config.includes('trailingSlash: "always"'),
  )
})

test('page titles stay inside the search display budget', () => {
  for (const file of pageFiles) {
    const source = read(file)
    const literals = [...source.matchAll(/\btitle="([^"]+)"/g)].map((match) => match[1])
    const expressions = [...source.matchAll(/\btitle=\{/g)]
    assert.ok(literals.length + expressions.length >= 1, `${file} must pass a title to Layout`)
    for (const title of literals) {
      const full = `${title} · Danial Rashidi`
      assert.ok(full.length <= 68, `${file}: title too long (${full.length}): ${full}`)
    }
  }
  // Dynamic case studies build their title from frontmatter; the content test
  // caps seoTitle at 42 characters so the brand suffix stays under 60.
  assert.ok(read('src/pages/work/[slug].astro').includes('title={seoTitle}'))
})

test('every page passes a description and a canonical path to the layout', () => {
  for (const file of pageFiles) {
    const source = read(file)
    assert.ok(/description=/.test(source), `${file} must pass a description`)
    assert.ok(/path=/.test(source), `${file} must pass an explicit canonical path`)
    assert.ok(!/description=""/.test(source), `${file}: description must not be empty`)
  }
})

test('the configuration keeps trailing-slash and sitemap invariants', () => {
  assert.ok(config.includes('site: "https://imdanialrashidi.github.io"'))
  assert.ok(config.includes('trailingSlash: "always"'))
  assert.ok(config.includes('inlineStylesheets: "auto"'))
  assert.ok(config.includes('filter:'))
  assert.ok(config.includes('endsWith("/404/")'))
  assert.ok(config.includes('sitemap({'))
})

test('robots.txt points at the sitemap index and allows crawling', () => {
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.match(robots, /Sitemap: https:\/\/imdanialrashidi\.github\.io\/sitemap-index\.xml/)
})

test('navigation and products use trailing-slash internal URLs', () => {
  const hrefs = [...siteData.matchAll(/href: ['"]([^'"]+)['"]/g)].map((match) => match[1])
  const internal = hrefs.filter((href) => href.startsWith('/'))
  assert.ok(internal.length >= 9, 'navigation and product links are declared in site data')
  for (const href of internal) {
    assert.ok(href.endsWith('/'), `internal link must end with a slash: ${href}`)
  }
  for (const href of hrefs.filter((value) => value.startsWith('https://'))) {
    assert.match(href, /^https:\/\//)
  }
})

test('social cards exist for every indexable page', () => {
  const projectIds = fs
    .readdirSync(path.join(repoRoot, 'src/content/projects'))
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
  const cards = [
    'default',
    'work',
    'travels',
    'about',
    'now',
    'contact',
    ...projectIds.map((id) => `work/${id}`),
  ]
  for (const card of cards) {
    const file = path.join(repoRoot, 'public/og', `${card}.jpg`)
    assert.ok(fs.existsSync(file), `missing social card public/og/${card}.jpg`)
    const size = fs.statSync(file).size
    assert.ok(size > 10_000 && size < 300_000, `social card ${card} has an unexpected size`)
  }
})

test('no em dashes in site copy (antislop R-02, enforced mechanically)', () => {
  const roots = ['src/pages', 'src/components', 'src/content', 'src/data', 'src/lib', 'src/layouts']
  const offenders = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(repoRoot, dir), { withFileTypes: true })) {
      const relative = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(relative)
      } else if (/\.(astro|ts|md)$/.test(entry.name)) {
        const source = read(relative)
        if (source.includes('\u2014')) offenders.push(relative)
      }
    }
  }
  for (const root of roots) walk(root)
  assert.deepEqual(offenders, [], `files contain an em dash: ${offenders.join(', ')}`)
})

test('the verification gate validates the built artifact, not only sources', () => {
  const verify = read('scripts/verify.sh')
  assert.ok(verify.includes('check-built-site.mjs'), 'verify.sh runs the built-site checks')
  assert.ok(fs.existsSync(path.join(repoRoot, 'scripts/check-built-site.mjs')))
})
