import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Content schemas. Everything shown on the site comes from these collections,
// validated at build time. The site stays honest: no invented metrics, no
// fabricated screenshots, no testimonials. Each project body is real prose that
// explains the work; the layout components only frame it.

const projectStatus = z.enum(['building', 'live', 'shipped', 'in_development'])

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // Search-shape title without the brand suffix, <= 42 characters.
    seoTitle: z.string().optional(),
    // One sentence for cards. Aim for 90 to 150 characters.
    summary: z.string(),
    // Search-result description. 120 to 160 characters.
    metaDescription: z.string().min(110).max(165),
    // Short category line, e.g. "Customer systems · Web · Product".
    kicker: z.string(),
    kind: z.enum(['product', 'client']),
    role: z.string(),
    year: z.number().int(),
    // Honest display status; mirrored in the UI and structured data.
    status: projectStatus,
    statusLabel: z.string(),
    stack: z.array(z.string()).min(1),
    links: z
      .object({
        live: z.url().optional(),
        github: z.url().optional(),
        related: z.url().optional(),
      })
      .default({}),
    // Key into the cover map in src/lib/work.ts (typed + validated there).
    // Optional: projects without a real screenshot render a typographic plate
    // instead of an invented interface.
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
})

const travels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/travels' }),
  schema: z.object({
    destination: z.string(),
    // The Iranian calendar year is kept alongside its Gregorian equivalent.
    dateLabel: z.string(),
    summary: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    imagePosition: z.string().default('50% 50%'),
    order: z.number().default(99),
  }),
})

export const collections = { projects, travels }
