import type { ImageMetadata } from 'astro'
import { ownedBusiness, profileUrls, site } from '../data/site.ts'

export type Breadcrumb = { name: string; href: string }

export const HOME_TRAIL: Breadcrumb = { name: 'Home', href: '/' }
export const WORK_TRAIL: Breadcrumb = { name: 'Work', href: '/work/' }

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${site.url}${path}`
}

export function breadcrumbNode(items: Breadcrumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  }
}

export function itemListNode(entries: { name: string; description: string; href: string }[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      description: entry.description,
      url: absoluteUrl(entry.href),
    })),
  }
}

export function imageNode(url: string, caption?: string) {
  return {
    '@type': 'ImageObject',
    url,
    width: 1200,
    height: 630,
    ...(caption ? { caption } : {}),
  }
}

/** The parts of the graph that appear on every page. */
export function coreGraph(portrait?: ImageMetadata) {
  const personId = `${site.url}/#person`
  const websiteId = `${site.url}/#website`

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    alternateName: 'imdanialrashidi',
    url: site.url,
    email: site.email,
    jobTitle: 'Software and Product Builder',
    description:
      'Software and product builder based in Iran. Builds web products, automations and Android tools, and works with businesses on their websites.',
    sameAs: [...profileUrls],
    knowsAbout: [...site.knowsAbout],
    owns: {
      '@type': 'Organization',
      name: ownedBusiness.name,
      url: ownedBusiness.url,
      description: ownedBusiness.description,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
    },
  }

  if (portrait) {
    person.image = {
      '@type': 'ImageObject',
      url: absoluteUrl(portrait.src),
      width: portrait.width,
      height: portrait.height,
    }
  }

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: site.url,
    name: site.title,
    description: site.description,
    inLanguage: site.language,
    publisher: { '@id': personId },
  }

  return { person, website, personId, websiteId }
}

export type PageSchemaInput = {
  /** WebPage subtype: WebPage, ProfilePage, CollectionPage, ContactPage, AboutPage. */
  pageType?: 'WebPage' | 'ProfilePage' | 'CollectionPage' | 'ContactPage' | 'AboutPage'
  title: string
  description: string
  canonical: string
  imageUrl: string
  breadcrumbs?: Breadcrumb[]
  extra?: Record<string, unknown>[]
  about?: { name: string; url?: string }
  /** Node the page is about, when it is not the Person. */
  mainEntity?: Record<string, unknown>
  /** ISO date of last content change, when known. */
  updated?: string
}

export function pageGraph(input: PageSchemaInput, portrait?: ImageMetadata) {
  const { person, website, personId, websiteId } = coreGraph(portrait)
  const pageId = `${input.canonical}#webpage`
  const pageType = input.pageType ?? 'WebPage'

  const page: Record<string, unknown> = {
    // One page entity, with the narrower schema type as a second type. Two
    // disconnected page nodes would describe the same URL twice.
    '@type': pageType === 'WebPage' ? 'WebPage' : ['WebPage', pageType],
    '@id': pageId,
    url: input.canonical,
    name: input.title,
    description: input.description,
    inLanguage: site.language,
    isPartOf: { '@id': websiteId },
    primaryImageOfPage: imageNode(input.imageUrl, input.description),
    mainEntity:
      input.mainEntity ??
      (input.about
        ? { '@type': 'Person', name: input.about.name, url: input.about.url }
        : { '@id': personId }),
  }

  if (input.updated) page.dateModified = input.updated

  const graph: Record<string, unknown>[] = [website, person, page]

  if (input.breadcrumbs && input.breadcrumbs.length > 1) {
    graph.push(breadcrumbNode(input.breadcrumbs))
  }
  if (input.extra) graph.push(...input.extra)

  return { '@context': 'https://schema.org', '@graph': graph }
}

/** CreativeWork node for one project case study. */
export function projectNode(options: {
  name: string
  description: string
  canonical: string
  imageUrl?: string
  year: number
  stack: string[]
  live?: string
  kind: 'product' | 'client'
  authorId: string
}) {
  const node: Record<string, unknown> = {
    '@type': 'CreativeWork',
    '@id': `${options.canonical}#work`,
    name: options.name,
    description: options.description,
    url: options.canonical,
    inLanguage: site.language,
    creator: { '@id': options.authorId },
    dateCreated: String(options.year),
    genre: options.kind === 'product' ? 'Product' : 'Client website',
    keywords: options.stack.join(', '),
    isPartOf: { '@id': `${site.url}/#website` },
  }
  if (options.imageUrl) {
    node.image = imageNode(options.imageUrl)
  }
  if (options.live) {
    node.sameAs = [options.live]
    node.relatedLink = options.live
  }
  return node
}
