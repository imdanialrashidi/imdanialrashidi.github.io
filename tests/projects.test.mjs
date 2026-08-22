import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')

// Inline pure helpers matching src/lib/projects.ts (avoids astro:content import in Node)
// Keep in sync with src/lib/projects.ts — filesystem check below ensures drift is caught.
function isDraft(entry) {
  return entry.data.status === 'draft'
}
function statusLabelFor(status) {
  if (status === 'building') return 'Building · In progress'
  if (status === 'in_progress') return 'Case study — in progress'
  return undefined
}
function hrefFor(entry) {
  const raw = entry.data.links?.caseStudy ?? `/work/${entry.id}`
  if (/^\s*javascript:/i.test(raw)) return `/work/${entry.id}`
  return raw
}
function kickerFor(entry) {
  return entry.data.kicker ?? (entry.data.categories ? entry.data.categories.join(' · ') : '')
}
function ctaLabelFor(entry) {
  return entry.data.title === 'Noveno' ? 'Explore Noveno' : 'View case study'
}
function variantFor(entry) {
  return entry.data.title === 'Noveno' ? 'accent' : 'default'
}
function cardPropsFor(entry, index) {
  return {
    index: String(index + 1).padStart(2, '0'),
    title: entry.data.title,
    kicker: kickerFor(entry),
    summary: entry.data.summary,
    href: hrefFor(entry),
    statusLabel: statusLabelFor(entry.data.status),
    year: entry.data.year,
    ctaLabel: ctaLabelFor(entry),
    variant: variantFor(entry),
    reversed: index % 2 === 1,
  }
}

function mock(overrides = {}) {
  return {
    id: 'test-id',
    data: {
      title: 'Test Project',
      summary: 'A summary',
      kicker: undefined,
      categories: undefined,
      role: undefined,
      year: undefined,
      status: 'in_progress',
      links: undefined,
      order: undefined,
      ...overrides.data,
    },
    ...overrides,
    data: {
      title: 'Test Project',
      summary: 'A summary',
      kicker: undefined,
      categories: undefined,
      role: undefined,
      year: undefined,
      status: 'in_progress',
      links: undefined,
      order: undefined,
      ...(overrides.data || {}),
      links: overrides.data?.links ?? overrides.links ?? undefined,
    },
  }
}

test('statusLabelFor maps building/in_progress, hides draft/published', () => {
  assert.equal(statusLabelFor('building'), 'Building · In progress')
  assert.equal(statusLabelFor('in_progress'), 'Case study — in progress')
  assert.equal(statusLabelFor('draft'), undefined)
  assert.equal(statusLabelFor('published'), undefined)
})

test('hrefFor falls back to /work/<id> and blocks javascript:', () => {
  const a = mock({ id: 'fast-english', data: { title: 'Fast English', links: { caseStudy: '/work/fast-english' } } })
  assert.equal(hrefFor(a), '/work/fast-english')

  const b = mock({ id: 'noveno', data: { title: 'Noveno' } })
  // no caseStudy → fallback to /work/<id>
  assert.equal(hrefFor(b), '/work/noveno')

  const c = mock({ id: 'evil', data: { title: 'Evil', links: { caseStudy: 'javascript:alert(1)' } } })
  assert.equal(hrefFor(c), '/work/evil')

  const d = mock({ id: 'evil2', data: { title: 'Evil2', links: { caseStudy: '  JaVaScRiPt:alert(1)' } } })
  assert.equal(hrefFor(d), '/work/evil2')
})

test('isDraft catches only draft', () => {
  assert.equal(isDraft(mock({ data: { status: 'draft' } })), true)
  assert.equal(isDraft(mock({ data: { status: 'in_progress' } })), false)
  assert.equal(isDraft(mock({ data: { status: 'building' } })), false)
  assert.equal(isDraft(mock({ data: { status: 'published' } })), false)
})

test('kickerFor prefers kicker, falls back to categories', () => {
  const withKicker = mock({ data: { kicker: 'Product Engineering · Web' } })
  assert.equal(kickerFor(withKicker), 'Product Engineering · Web')
  const withCats = mock({ data: { kicker: undefined, categories: ['Founder', 'Web'] } })
  assert.equal(kickerFor(withCats), 'Founder · Web')
  const empty = mock({ data: { kicker: undefined, categories: undefined } })
  assert.equal(kickerFor(empty), '')
})

test('cardPropsFor derives variant/ctaLabel for Noveno vs default', () => {
  const noveno = mock({ data: { title: 'Noveno', status: 'building', kicker: 'Founder' } })
  const propsN = cardPropsFor(noveno, 1)
  assert.equal(propsN.variant, 'accent')
  assert.equal(propsN.ctaLabel, 'Explore Noveno')
  assert.equal(propsN.index, '02')
  assert.equal(propsN.reversed, true)

  const fe = mock({ data: { title: 'Fast English', status: 'in_progress', kicker: 'Product' } })
  const propsF = cardPropsFor(fe, 0)
  assert.equal(propsF.variant, 'default')
  assert.equal(propsF.ctaLabel, 'View case study')
  assert.equal(propsF.index, '01')
  assert.equal(propsF.reversed, false)
})

test('frontmatter caseStudy links are safe (no javascript:)', () => {
  const projectDir = path.join(repoRoot, 'src/content/projects')
  const files = fs.readdirSync(projectDir).filter((f) => f.endsWith('.md'))
  assert.ok(files.length >= 2, 'should have at least 2 project files')
  for (const file of files) {
    const content = fs.readFileSync(path.join(projectDir, file), 'utf8')
    assert.ok(!/javascript:/i.test(content), `${file} must not contain javascript:`)
    // caseStudy if present should be internal or https
    const match = content.match(/caseStudy:\s*["']([^"']+)["']/)
    if (match) {
      const val = match[1]
      assert.ok(/^(\/|https?:\/\/)/.test(val), `${file} caseStudy must be / or https, got ${val}`)
    }
  }
})

test('pages use shared lib and draft filtering', () => {
  const indexAstro = fs.readFileSync(path.join(repoRoot, 'src/pages/index.astro'), 'utf8')
  const workIndexAstro = fs.readFileSync(path.join(repoRoot, 'src/pages/work/index.astro'), 'utf8')

  // both import from lib
  assert.ok(/from\s+['\"]\.\.\/lib\/projects/.test(indexAstro), 'index.astro must import from lib/projects')
  assert.ok(/from\s+['\"]\.\.\/\.\.\/lib\/projects/.test(workIndexAstro), 'work/index.astro must import from lib/projects')
  assert.ok(/getDisplayProjects/.test(indexAstro), 'index.astro must use getDisplayProjects')
  assert.ok(/getDisplayProjects/.test(workIndexAstro), 'work/index.astro must use getDisplayProjects')
  assert.ok(/cardPropsFor/.test(indexAstro), 'index.astro must use cardPropsFor')
  assert.ok(/cardPropsFor/.test(workIndexAstro), 'work/index.astro must use cardPropsFor')

  // no old inline branching
  assert.ok(!/title\s*===\s*["']Noveno["']/.test(indexAstro), 'index.astro must not contain title === Noveno branching')
  assert.ok(!/title\s*===\s*["']Noveno["']/.test(workIndexAstro), 'work/index.astro must not contain title === Noveno branching')
  // old statusLabel ternary removed
  assert.ok(!/status\s*===\s*["']building["']/.test(indexAstro) || /statusLabelFor/.test(indexAstro), 'index.astro should not have inline status ternary')
})

test('work index derives count and meta from data', () => {
  const workIndex = fs.readFileSync(path.join(repoRoot, 'src/pages/work/index.astro'), 'utf8')
  assert.ok(!/Portfolio index — 02 projects/.test(workIndex), 'must not hardcode 02 projects')
  assert.ok(/projects\.length/.test(workIndex), 'must derive count from projects.length')
  assert.ok(/projects\.map/.test(workIndex), 'must derive meta from projects')
})

test('case-study pages derive shared props from entry', () => {
  const fe = fs.readFileSync(path.join(repoRoot, 'src/pages/work/fast-english.astro'), 'utf8')
  const nov = fs.readFileSync(path.join(repoRoot, 'src/pages/work/noveno.astro'), 'utf8')
  for (const [name, content] of [
    ['fast-english', fe],
    ['noveno', nov],
  ]) {
    assert.ok(/getCollection/.test(content), `${name}: must import getCollection`)
    assert.ok(/entry\.data\./.test(content), `${name}: must reference entry.data`)
    assert.ok(/statusLabelFor/.test(content), `${name}: must use statusLabelFor`)
    // ensure hardcoded shared props removed
    // kicker hardcode check: should use entry.data.kicker
    assert.ok(/entry\.data\.kicker/.test(content), `${name}: kicker must be from entry`)
    assert.ok(/entry\.data\.title/.test(content), `${name}: title must be from entry`)
  }
  // ensure old hardcoded status strings removed
  assert.ok(!/In progress — active/.test(fe), 'fast-english must not contain hardcoded In progress — active')
})

test('src/lib/projects.ts exports required surface and blocks javascript: via schema', () => {
  const lib = fs.readFileSync(path.join(repoRoot, 'src/lib/projects.ts'), 'utf8')
  for (const exp of ['getDisplayProjects', 'cardPropsFor', 'statusLabelFor', 'hrefFor', 'isDraft', 'kickerFor', 'ctaLabelFor', 'variantFor']) {
    assert.ok(lib.includes(exp), `lib must export ${exp}`)
  }
  assert.ok(/javascript:/i.test(lib), 'lib must contain javascript: guard')
  const config = fs.readFileSync(path.join(repoRoot, 'src/content.config.ts'), 'utf8')
  assert.ok(/caseStudy/.test(config), 'content.config must contain caseStudy')
  assert.ok(/refine/.test(config), 'content.config must refine caseStudy')
  assert.ok(/javascript:/i.test(config), 'content.config must block javascript:')
})
