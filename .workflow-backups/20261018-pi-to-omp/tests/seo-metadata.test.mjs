import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { CASE_STUDY_TRAIL, breadcrumbLd, itemListLd } from '../src/lib/seo.ts'

const repoRoot = path.resolve(import.meta.dirname, '..')
const pagesDir = path.join(repoRoot, 'src/pages')

// Google truncates titles near 60 characters and meta descriptions near 160;
// past those limits the tail of the page identity is never shown in results.
const TITLE_MAX = 60
const TITLE_MIN = 25
const DESCRIPTION_MIN = 120
const DESCRIPTION_MAX = 160

function astroFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return astroFiles(full)
    return entry.name.endsWith('.astro') ? [full] : []
  })
}

// `<Layout ...>` props are literal strings or `const`s in the same frontmatter.
function pageHead(file) {
  const source = fs.readFileSync(file, 'utf8')
  const frontmatter = source.split('---')[1] ?? ''
  const tag = source.match(/<Layout\b([^>]*)>/)?.[1] ?? ''
  const attribute = (name) => {
    const literal = tag.match(new RegExp(`${name}="([^"]*)"`))
    if (literal) return literal[1]
    const reference = tag.match(new RegExp(`${name}=\\{([A-Za-z_][\\w.]*)\\}`))?.[1]
    if (!reference) return undefined
    const declared = frontmatter.match(new RegExp(`const\\s+${reference.split('.')[0]}\\s*=\\s*'([^']*)'`))
    return declared?.[1]
  }
  return {
    source,
    title: attribute('title'),
    description: attribute('description'),
    noIndex: /\bnoIndex\b/.test(tag),
  }
}

const pages = astroFiles(pagesDir).map((file) => ({
  route: '/' + path.relative(pagesDir, file).replace(/\\/g, '/').replace(/index\.astro$/, '').replace(/\.astro$/, ''),
  ...pageHead(file),
}))

test('every page declares a unique title inside the search display budget', () => {
  const seen = new Map()
  for (const page of pages) {
    assert.ok(page.title, `${page.route} must pass a title to Layout`)
    assert.ok(
      page.title.length <= TITLE_MAX,
      `${page.route} title is ${page.title.length} chars (max ${TITLE_MAX}): ${page.title}`,
    )
    assert.ok(
      page.title.length >= TITLE_MIN,
      `${page.route} title is ${page.title.length} chars — too thin to describe the page`,
    )
    assert.ok(!seen.has(page.title), `${page.route} duplicates the title of ${seen.get(page.title)}`)
    seen.set(page.title, page.route)
  }
})

test('indexable pages declare a unique description inside the search display budget', () => {
  const seen = new Map()
  for (const page of pages.filter((page) => !page.noIndex)) {
    assert.ok(page.description, `${page.route} must pass a description to Layout`)
    assert.ok(
      page.description.length <= DESCRIPTION_MAX,
      `${page.route} description is ${page.description.length} chars (max ${DESCRIPTION_MAX})`,
    )
    assert.ok(
      page.description.length >= DESCRIPTION_MIN,
      `${page.route} description is ${page.description.length} chars — too thin to summarize the page`,
    )
    assert.ok(
      !seen.has(page.description),
      `${page.route} duplicates the description of ${seen.get(page.description)}`,
    )
    seen.set(page.description, page.route)
  }
})

test('JSON-LD is emitted once by Layout, not per page', () => {
  const files = [...astroFiles(path.join(repoRoot, 'src'))].filter(
    (file) => !file.endsWith(path.join('layouts', 'Layout.astro')),
  )
  const emitters = files.filter((file) => /application\/ld\+json/.test(fs.readFileSync(file, 'utf8')))
  assert.deepEqual(emitters, [], 'pages must pass structured data through the Layout schema prop')
})

test('breadcrumbLd emits schema.org positions and absolute URLs for the shared trail', () => {
  const node = breadcrumbLd([...CASE_STUDY_TRAIL, { name: 'Noveno', href: '/work/noveno' }])
  assert.equal(node['@type'], 'BreadcrumbList')
  assert.deepEqual(node.itemListElement, [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://imdanialrashidi.github.io/' },
    { '@type': 'ListItem', position: 2, name: 'Work', item: 'https://imdanialrashidi.github.io/work' },
    { '@type': 'ListItem', position: 3, name: 'Noveno', item: 'https://imdanialrashidi.github.io/work/noveno' },
  ])
})

test('itemListLd keeps 1-based positions and resolves every entry URL', () => {
  const node = itemListLd([
    { name: 'Fast English', description: 'app', href: '/work/fast-english' },
    // An external caseStudy link must survive URL resolution unchanged in origin.
    { name: 'Noveno', description: 'system', href: 'https://noveno.ir' },
  ])
  assert.deepEqual(node.itemListElement.map((item) => item.position), [1, 2])
  assert.deepEqual(node.itemListElement.map((item) => item.url), [
    'https://imdanialrashidi.github.io/work/fast-english',
    'https://noveno.ir/',
  ])
})