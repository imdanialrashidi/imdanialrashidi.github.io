import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const projectDir = path.join(repoRoot, 'src/content/projects')
const travelDir = path.join(repoRoot, 'src/content/travels')
const workAssets = path.join(repoRoot, 'src/assets/work')
const travelAssets = path.join(repoRoot, 'src/assets/travels')

/** Parses the small YAML subset used by this content (scalars + one nested level). */
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  assert.ok(match, 'file must start with a frontmatter block')
  const data = {}
  let current = null
  for (const raw of match[1].split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    const indent = raw.match(/^\s*/)[0].length
    const line = raw.trim()
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (indent > 0 && current) {
      data[current][key] = parseValue(value)
      continue
    }
    if (value === '') {
      data[key] = {}
      current = key
      continue
    }
    current = null
    data[key] = parseValue(value)
  }
  return { data, body: match[2] }
}

function parseValue(raw) {
  let value = raw.trim()
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
  }
  value = value.replace(/^["']|["']$/g, '')
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^\d+$/.test(value)) return Number(value)
  return value
}

function readProjects() {
  return fs
    .readdirSync(projectDir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const parsed = parseFrontmatter(fs.readFileSync(path.join(projectDir, file), 'utf8'))
      return { id: file.replace(/\.md$/, ''), ...parsed }
    })
}

const projects = readProjects()

test('eight projects exist, four products and four client sites', () => {
  assert.equal(projects.length, 8)
  assert.equal(projects.filter((p) => p.data.kind === 'product').length, 4)
  assert.equal(projects.filter((p) => p.data.kind === 'client').length, 4)
  const orders = projects.map((p) => p.data.order)
  assert.equal(new Set(orders).size, orders.length, 'order values must be unique')
})

test('project frontmatter satisfies the public content contract', () => {
  const statuses = new Set(['building', 'live', 'shipped', 'in_development'])
  const titles = new Set()
  const seoTitles = new Set()
  for (const project of projects) {
    const { data, body } = project
    for (const key of [
      'title',
      'seoTitle',
      'summary',
      'metaDescription',
      'kicker',
      'kind',
      'role',
      'status',
      'statusLabel',
    ]) {
      assert.equal(typeof data[key], 'string', `${project.id}: ${key} must be a string`)
      assert.ok(data[key].length > 0, `${project.id}: ${key} must not be empty`)
    }
    assert.ok(['product', 'client'].includes(data.kind), `${project.id}: kind`)
    assert.ok(statuses.has(data.status), `${project.id}: status`)
    assert.equal(typeof data.year, 'number')
    assert.ok(data.year >= 2024 && data.year <= 2030, `${project.id}: year in range`)
    assert.equal(typeof data.featured, 'boolean')
    assert.equal(typeof data.order, 'number')

    assert.ok(data.seoTitle.length <= 42, `${project.id}: seoTitle <= 42 chars`)
    assert.ok(
      data.metaDescription.length >= 110 && data.metaDescription.length <= 165,
      `${project.id}: metaDescription length is ${data.metaDescription.length}`,
    )
    assert.ok(
      data.summary.length >= 80 && data.summary.length <= 170,
      `${project.id}: summary length is ${data.summary.length}`,
    )
    assert.ok(Array.isArray(data.stack), `${project.id}: stack must be an array`)
    assert.ok(data.stack.length >= 2 && data.stack.length <= 6, `${project.id}: stack size`)

    const words = body.trim().split(/\s+/).length
    const minimum = data.kind === 'product' ? 650 : 300
    assert.ok(words >= minimum, `${project.id}: body is ${words} words, minimum ${minimum}`)
    assert.ok(words <= 1200, `${project.id}: body must stay readable (${words} words)`)

    assert.ok(!/javascript:/i.test(body), `${project.id}: body must not contain javascript:`)
    assert.ok(!data.title.includes('\u2014'), `${project.id}: no em dash in title`)
    assert.ok(!body.includes('\u2014'), `${project.id}: no em dash in body`)
    assert.ok(!/lorem ipsum/i.test(body), `${project.id}: no placeholder copy`)

    if (data.links) {
      for (const [key, value] of Object.entries(data.links)) {
        assert.match(value, /^https:\/\//, `${project.id}: links.${key} must be https`)
      }
    }

    if (data.cover) {
      assert.equal(
        typeof data.coverAlt,
        'string',
        `${project.id}: coverAlt is required when a cover exists`,
      )
      assert.ok(
        fs.existsSync(path.join(workAssets, `${data.cover}.webp`)),
        `${project.id}: cover asset`,
      )
    }

    titles.add(data.title)
    seoTitles.add(data.seoTitle)
  }
  assert.equal(titles.size, projects.length, 'titles must be unique')
  assert.equal(seoTitles.size, projects.length, 'seoTitles must be unique')
})

test('featured projects each have a real screenshot for the homepage', () => {
  const featured = projects.filter((project) => project.data.featured)
  assert.ok(featured.length >= 2 && featured.length <= 4, 'two to four featured projects')
  for (const project of featured) {
    assert.ok(project.data.cover, `${project.id}: featured projects need a cover`)
  }
})

test('every work screenshot is used by exactly one project', () => {
  const files = fs
    .readdirSync(workAssets)
    .filter((file) => file.endsWith('.webp'))
    .map((file) => file.replace(/\.webp$/, ''))
    .sort()
  const covers = projects
    .map((project) => project.data.cover)
    .filter(Boolean)
    .sort()
  assert.deepEqual(covers, files, 'assets and project covers must match 1:1')
})

test('three travel notes with real photographs', () => {
  const travels = fs
    .readdirSync(travelDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parseFrontmatter(fs.readFileSync(path.join(travelDir, file), 'utf8')).data)
  assert.equal(travels.length, 3)
  const orders = travels.map((travel) => travel.order)
  assert.equal(new Set(orders).size, orders.length)
  const images = travels.map((travel) => travel.image).sort()
  const files = fs
    .readdirSync(travelAssets)
    .filter((file) => file.endsWith('.webp'))
    .map((file) => file.replace(/\.webp$/, ''))
    .sort()
  assert.deepEqual(images, files)
  for (const travel of travels) {
    assert.match(travel.dateLabel, /^\d{4} \(\d{4}\)$/, 'dateLabel keeps both calendars')
    assert.equal(typeof travel.imageAlt, 'string')
    assert.ok(travel.imageAlt.length > 20, 'descriptive alt text')
    assert.match(travel.imagePosition, /^\d+% \d+%$/)
  }
})

test('shared work helpers keep the expected public surface', () => {
  const lib = fs.readFileSync(path.join(repoRoot, 'src/lib/work.ts'), 'utf8')
  for (const exported of [
    'coverFor',
    'hrefFor',
    'sortProjects',
    'featuredProjects',
    'otherProjects',
    'byKind',
    'nextProject',
    'coverMap',
  ]) {
    assert.ok(lib.includes(exported), `lib/work.ts must export ${exported}`)
  }
  assert.match(lib, /return `\/work\/\$\{entry\.id\}\/`/, 'case-study URLs keep the trailing slash')

  const travelsLib = fs.readFileSync(path.join(repoRoot, 'src/lib/travels.ts'), 'utf8')
  assert.ok(travelsLib.includes('travelImage'))
  assert.ok(travelsLib.includes('sortTravels'))
})

test('routes use the shared components instead of bespoke project pages', () => {
  const pages = fs.readdirSync(path.join(repoRoot, 'src/pages/work'))
  assert.deepEqual(pages.sort(), ['[slug].astro', 'index.astro'])

  const home = fs.readFileSync(path.join(repoRoot, 'src/pages/index.astro'), 'utf8')
  assert.ok(home.includes('ProjectFeature'))
  assert.ok(home.includes('SectionHead'))
  assert.ok(home.includes('TravelCard'))

  const index = fs.readFileSync(path.join(repoRoot, 'src/pages/work/index.astro'), 'utf8')
  assert.ok(index.includes('ProjectRow'))
  assert.ok(index.includes('byKind'))

  const detail = fs.readFileSync(path.join(repoRoot, 'src/pages/work/[slug].astro'), 'utf8')
  assert.ok(detail.includes('render(entry)'))
  assert.ok(detail.includes('Shot'))
  assert.ok(detail.includes('ProjectPlate'))
  assert.ok(detail.includes('nextProject'))
})

test('the static-first performance contract still holds', () => {
  const config = fs.readFileSync(path.join(repoRoot, 'astro.config.mjs'), 'utf8')
  assert.ok(config.includes('trailingSlash: "always"'))
  assert.ok(config.includes('inlineStylesheets: "auto"'))
  assert.ok(config.includes('sitemap('))
  assert.ok(config.includes('site: "https://imdanialrashidi.github.io"'))

  const sourceFiles = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(astro|ts|mjs)$/.test(entry.name)) sourceFiles.push(full)
    }
  }
  walk(path.join(repoRoot, 'src'))
  for (const file of sourceFiles) {
    const source = fs.readFileSync(file, 'utf8')
    assert.ok(!source.includes('astro:transitions'), `${file}: no client router`)
    assert.ok(!source.includes('client:load'), `${file}: no framework islands`)
  }
})

test('asset provenance covers every image and font', () => {
  const sources = fs.readFileSync(path.join(repoRoot, 'src/assets/SOURCES.md'), 'utf8')
  for (const file of fs.readdirSync(workAssets).filter((f) => f.endsWith('.webp'))) {
    assert.ok(sources.includes(file), `SOURCES.md must document ${file}`)
  }
  for (const file of fs.readdirSync(travelAssets).filter((f) => f.endsWith('.webp'))) {
    assert.ok(sources.includes(file), `SOURCES.md must document ${file}`)
  }
  for (const font of [
    'geist-latin',
    'geist-mono-latin',
    'instrument-serif-regular',
    'instrument-serif-italic',
  ]) {
    assert.ok(sources.includes(font), `SOURCES.md must document ${font}`)
    assert.ok(
      fs.existsSync(path.join(repoRoot, 'public/fonts', `${font}.woff2`)),
      `${font} is vendored`,
    )
  }
  assert.ok(fs.existsSync(path.join(repoRoot, 'public/fonts/LICENSE-Geist.txt')))
  assert.ok(fs.existsSync(path.join(repoRoot, 'public/fonts/LICENSE-InstrumentSerif.txt')))
})
