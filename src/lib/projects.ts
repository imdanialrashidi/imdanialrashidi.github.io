import type { CollectionEntry } from 'astro:content'

export type ProjectEntry = CollectionEntry<'projects'>

export function isDraft(entry: ProjectEntry): boolean {
  return entry.data.status === 'draft'
}

export function statusLabelFor(status: ProjectEntry['data']['status']): string | undefined {
  if (status === 'building') return 'Building · In progress'
  if (status === 'in_progress') return 'Case study — in progress'
  return undefined
}

export function hrefFor(entry: ProjectEntry): string {
  const raw = entry.data.links?.caseStudy ?? `/work/${entry.id}`
  if (/^\s*javascript:/i.test(raw)) return `/work/${entry.id}`
  return raw
}

export function kickerFor(entry: ProjectEntry): string {
  return entry.data.kicker ?? (entry.data.categories ? entry.data.categories.join(' · ') : '')
}

export function ctaLabelFor(entry: ProjectEntry): string {
  return entry.data.title === 'Noveno' ? 'Explore Noveno' : 'View case study'
}

export function variantFor(entry: ProjectEntry): 'default' | 'accent' {
  return entry.data.title === 'Noveno' ? 'accent' : 'default'
}

export function cardPropsFor(entry: ProjectEntry, index: number) {
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

export async function getDisplayProjects(): Promise<ProjectEntry[]> {
  const { getCollection } = await import('astro:content')
  const all = await getCollection('projects')
  return all.filter((p) => !isDraft(p)).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
}
