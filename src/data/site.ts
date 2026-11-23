export const site = {
  name: 'Danial Rashidi',
  // Used in <title> suffixes and structured data.
  title: 'Danial Rashidi · Software & Product Builder',
  shortTitle: 'Danial Rashidi',
  tagline: 'Software & Product Builder',
  description:
    'Danial Rashidi builds software products from a vague idea to a working system: Noveno, Study Center, Fast English and Gym Log, plus client websites.',
  url: 'https://imdanialrashidi.github.io',
  locale: 'en_US',
  language: 'en',
  email: 'imdanialrashidi@gmail.com',
  location: 'Iran',
  availability: 'Open to remote work and product collaborations',
  currentFocus: 'Building Noveno, Study Center, Fast English and Gym Log',
  persianSite: 'https://danialrashidi.ir',
  ogImage: '/og/default.jpg',
  // Kept in one place so the Person node and the footer agree.
  knowsAbout: [
    'Software engineering',
    'Product engineering',
    'Web development',
    'E-commerce websites',
    'Automation',
    'AI-assisted development',
    'Android applications',
  ],
} as const

export type SocialId = 'github' | 'x' | 'instagram' | 'telegram' | 'email' | 'persian'

export type SocialLink = {
  id: SocialId
  label: string
  href: string
  handle: string
  /** Displayed in an LTR run inside the English page. */
  ltr?: boolean
}

export const socials: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/imdanialrashidi',
    handle: 'github.com/imdanialrashidi',
    ltr: true,
  },
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/imdanialrashidi',
    handle: '@imdanialrashidi',
    ltr: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/imdanialrashidi',
    handle: '@imdanialrashidi',
    ltr: true,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: 'https://t.me/imdanialrashidi',
    handle: '@imdanialrashidi',
    ltr: true,
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:imdanialrashidi@gmail.com',
    handle: 'imdanialrashidi@gmail.com',
    ltr: true,
  },
  {
    id: 'persian',
    label: 'Persian site',
    href: 'https://danialrashidi.ir',
    handle: 'danialrashidi.ir',
    ltr: true,
  },
]

/** Profiles that identify the same person, for schema.org sameAs. */
export const profileUrls = [
  'https://github.com/imdanialrashidi',
  'https://x.com/imdanialrashidi',
  'https://instagram.com/imdanialrashidi',
  'https://t.me/imdanialrashidi',
  'https://danialrashidi.ir',
] as const

/** A business the site owner runs; modelled as an owned organisation, not a sameAs profile. */
export const ownedBusiness = {
  name: 'Noveno',
  url: 'https://noveno.ir',
  description: 'A small software and product studio working on customer-acquisition systems.',
} as const

export type NavItem = { label: string; href: string }

export const navigation: NavItem[] = [
  { label: 'Work', href: '/work/' },
  { label: 'Travels', href: '/travels/' },
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
  { label: 'Contact', href: '/contact/' },
]

export const products = [
  { label: 'Noveno', href: '/work/noveno/' },
  { label: 'Study Center', href: '/work/study/' },
  { label: 'Fast English', href: '/work/fast-english/' },
  { label: 'Gym Log', href: '/work/gym-log/' },
] as const

export function isActiveNav(href: string, currentPath: string): boolean {
  const base = href.replace(/\/+$/, '') || '/'
  const current = currentPath.replace(/\/+$/, '') || '/'
  if (base === '/') return current === '/'
  return current === base || current.startsWith(`${base}/`)
}
