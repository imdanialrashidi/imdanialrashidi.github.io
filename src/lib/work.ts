import type { CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import elsa from '../assets/work/elsa-hamrah.webp'
import fastEnglish from '../assets/work/fast-english.webp'
import gymLog from '../assets/work/gym-log.webp'
import isbatab from '../assets/work/isbatab.webp'
import kidotalks from '../assets/work/kidotalks.webp'
import mobile from '../assets/work/mobile-khorsandi.webp'
import noveno from '../assets/work/noveno.webp'
import phpIelts from '../assets/work/php-ielts-house.webp'
import study from '../assets/work/study.webp'

export type ProjectEntry = CollectionEntry<'projects'>
export type ProjectData = ProjectEntry['data']

/**
 * Real screenshots only. Projects without an entry here render a typographic
 * plate instead of an invented interface. Provenance: src/assets/SOURCES.md.
 */
export const coverMap: Record<string, ImageMetadata> = {
  'elsa-hamrah': elsa,
  'fast-english': fastEnglish,
  'gym-log': gymLog,
  isbatab,
  kidotalks,
  'mobile-khorsandi': mobile,
  noveno,
  'php-ielts-house': phpIelts,
  study,
}

export function coverFor(entry: ProjectEntry): ImageMetadata | undefined {
  return entry.data.cover ? coverMap[entry.data.cover] : undefined
}

export function hrefFor(entry: ProjectEntry): string {
  return `/work/${entry.id}/`
}

export function sortProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order)
}

export function featuredProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return sortProjects(entries).filter((entry) => entry.data.featured)
}

export function otherProjects(entries: ProjectEntry[], featured: ProjectEntry[]): ProjectEntry[] {
  const featuredIds = new Set(featured.map((entry) => entry.id))
  return sortProjects(entries).filter((entry) => !featuredIds.has(entry.id))
}

export function byKind(entries: ProjectEntry[], kind: ProjectData['kind']): ProjectEntry[] {
  return sortProjects(entries).filter((entry) => entry.data.kind === kind)
}

export function nextProject(entries: ProjectEntry[], currentId: string): ProjectEntry {
  const ordered = sortProjects(entries)
  const index = ordered.findIndex((entry) => entry.id === currentId)
  const next = ordered[(index + 1) % ordered.length]
  // ordered is non-empty because it contains currentId.
  return next as ProjectEntry
}
