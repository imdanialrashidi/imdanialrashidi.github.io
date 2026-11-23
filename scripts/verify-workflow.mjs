#!/usr/bin/env node
// Verify the project-scoped DSH workflow skills against the pinned lock.
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const LOCK_PATH = path.join(ROOT, '.dsh', 'workflow.json')
const SKILLS_DIR = path.join(ROOT, '.dsh', 'skills')
const REQUIRED_SKILLS = [
  'quick-fix',
  'spec',
  'build',
  'verify',
  'review',
  'test-design',
  'production',
]
const SOURCE = 'https://github.com/imdanialrashidi/dsh-workflow'
const errors = []

const fail = (message) => errors.push(message)

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    fail(`cannot read ${path.relative(ROOT, file)}: ${error.message}`)
    return undefined
  }
}

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')

const lock = readJson(LOCK_PATH)
const expected = [...REQUIRED_SKILLS].sort()

if (lock) {
  if (lock.schemaVersion !== 1) fail('workflow lock schemaVersion must be 1')
  if (lock.workflow !== 'dsh-workflow') fail("workflow lock must name the 'dsh-workflow' workflow")
  if (typeof lock.version !== 'string' || !/^\d+\.\d+(?:\.\d+)?$/.test(lock.version)) {
    fail('workflow lock must record a semantic upstream version')
  }
  if (lock.source !== SOURCE) fail(`workflow lock source must be ${SOURCE}`)
  if (!/^[0-9a-f]{40}$/.test(String(lock.commit)))
    fail('workflow lock must pin a full 40-hex commit')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(lock.retrievedAt))) {
    fail('workflow lock must record an ISO retrievedAt date')
  }
  if (lock.scope !== 'project') {
    fail("workflow lock scope must be 'project' because the repository vendors its skills")
  }
  const locked = Object.keys(lock.skills ?? {}).sort()
  if (locked.join('\n') !== expected.join('\n')) {
    fail(`workflow lock must list exactly: ${expected.join(', ')}`)
  }
}

let entries = []
try {
  entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
} catch (error) {
  fail(`cannot read .dsh/skills: ${error.message}`)
}

// DSH discovers both <name>/SKILL.md and flat *.md files directly under the
// skills root. Anything here that is not one of the seven pinned directories
// can shadow or add a skill without a hash check, so reject every other entry.
for (const entry of entries) {
  if (!REQUIRED_SKILLS.includes(entry.name)) {
    fail(
      `unexpected entry under .dsh/skills: '${entry.name}' (only the seven pinned skill directories are allowed)`,
    )
  } else if (!entry.isDirectory()) {
    fail(`.dsh/skills/${entry.name} must be a real directory, not a file or symlink`)
  }
}

for (const name of REQUIRED_SKILLS) {
  if (!entries.some((entry) => entry.name === name && entry.isDirectory())) {
    fail(`missing skill directory: .dsh/skills/${name}/SKILL.md`)
    continue
  }

  const directory = path.join(SKILLS_DIR, name)
  if (!lstatSync(directory).isDirectory()) {
    fail(`.dsh/skills/${name} must be a real directory`)
    continue
  }

  const files = readdirSync(directory).sort()
  if (files.join(',') !== 'SKILL.md') {
    fail(`.dsh/skills/${name} must contain only SKILL.md; found: ${files.join(', ')}`)
    continue
  }

  const file = path.join(directory, 'SKILL.md')
  if (!lstatSync(file).isFile()) {
    fail(`.dsh/skills/${name}/SKILL.md must be a regular file, not a symlink`)
    continue
  }
  const source = readFileSync(file, 'utf8')
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1]
  if (!frontmatter) {
    fail(`${name}/SKILL.md is missing a closed YAML frontmatter block`)
    continue
  }

  const declaredName = frontmatter.match(/^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1]
  if (declaredName !== name) {
    fail(`${name}/SKILL.md declares name '${declaredName ?? '<missing>'}'`)
  }
  const description = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim()
  if (!description) fail(`${name}/SKILL.md is missing a description`)

  const expectedHash = lock?.skills?.[name]
  if (typeof expectedHash !== 'string' || !/^[0-9a-f]{64}$/.test(expectedHash)) {
    fail(`workflow lock is missing a sha256 for '${name}'`)
  } else {
    const actualHash = sha256(file)
    if (actualHash !== expectedHash) {
      fail(`${name}/SKILL.md differs from the locked dsh-workflow copy`)
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL  ${error}`)
  console.error(`verify-workflow: ${errors.length} problem(s) found`)
  process.exit(1)
}

console.log(
  `verify-workflow: ${REQUIRED_SKILLS.length} skills match dsh-workflow ${lock.version} @ ${lock.commit.slice(0, 7)}`,
)
