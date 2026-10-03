import { site } from '../data/site.ts'

export type BreadcrumbItem = {
  name: string
  href: string
}

// One shared trail for every case study: Home → Work → project.
export const CASE_STUDY_TRAIL: readonly BreadcrumbItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Work', href: '/work' },
]

// schema.org BreadcrumbList node (positions are 1-based per the vocabulary).
export function breadcrumbLd(items: readonly BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.href, site.url).toString(),
    })),
  }
}

// schema.org ItemList of the projects a page actually links to.
export function itemListLd(
  entries: readonly { name: string; description: string; href: string }[],
) {
  return {
    '@type': 'ItemList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      description: entry.description,
      url: new URL(entry.href, site.url).toString(),
    })),
  }
}
