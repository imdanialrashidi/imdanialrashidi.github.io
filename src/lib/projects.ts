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

// --- Real preview imagery (local, provenance in src/assets/work/SOURCES.md) ---
// Only the large 1440×900 WebP is stored; Astro generates responsive widths.
import elsaImg from '../assets/work/elsa-hamrah-hero.webp'
import isbatabImg from '../assets/work/isbatab-hero.webp'
import mobileImg from '../assets/work/mobile-khorsandi-hero.webp'
import phpImg from '../assets/work/php-ielts-house-hero.webp'

type PreviewMeta = { src: ImageMetadata; alt: string }

const previewMap: Record<string, PreviewMeta> = {
  'elsa-hamrah': {
    src: elsaImg,
    alt: 'Elsa Hamrah homepage — online store for phones, tablets, smartwatches and digital accessories',
  },
  isbatab: {
    src: isbatabImg,
    alt: 'Isbatab homepage — corporate website for safety, HSE and technical inspection services',
  },
  'mobile-khorsandi': {
    src: mobileImg,
    alt: 'Mobile Khorsandi homepage — online store for mobile phones, accessories and parts',
  },
  'php-ielts-house': {
    src: phpImg,
    alt: 'PHP IELTS House homepage — English and IELTS education services website in Karaj',
  },
}

export function imageFor(entry: ProjectEntry): PreviewMeta | undefined {
  return previewMap[entry.id]
}

export function isClientWork(entry: ProjectEntry): boolean {
  return ['elsa-hamrah', 'isbatab', 'mobile-khorsandi', 'php-ielts-house'].includes(entry.id)
}

export function cardPropsFor(entry: ProjectEntry, index: number) {
  const preview = imageFor(entry)
  return {
    index: String(index + 1).padStart(2, '0'),
    title: entry.data.title,
    kicker: kickerFor(entry),
    summary: entry.data.summary,
    href: hrefFor(entry),
    statusLabel: statusLabelFor(entry.data.status),
    year: entry.data.year,
    ctaLabel: isClientWork(entry) ? 'View project' : ctaLabelFor(entry),
    variant: variantFor(entry),
    reversed: index % 2 === 1,
    image: preview?.src,
    imageAlt: preview?.alt,
  }
}

export async function getDisplayProjects(): Promise<ProjectEntry[]> {
  const { getCollection } = await import('astro:content')
  const all = await getCollection('projects')
  return all.filter((p) => !isDraft(p)).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
}

export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  const all = await getDisplayProjects()
  return all.filter((p) => p.data.featured)
}

export async function getClientProjects(): Promise<ProjectEntry[]> {
  const all = await getDisplayProjects()
  return all.filter((p) => isClientWork(p))
}
