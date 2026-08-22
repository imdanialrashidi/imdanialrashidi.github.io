import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Content schemas — used via getCollection throughout the site.
// Content is kept honest: no invented metrics, screenshots, or testimonials.

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // concise truthful description shown in cards / teases
    summary: z.string(),
    // restrained category metadata e.g. "Product Engineering · Web · PWA · Android"
    kicker: z.string().optional(),
    categories: z.array(z.string()).optional(),
    role: z.string().optional(),
    year: z.number().int().optional(),
    status: z.enum(['draft', 'in_progress', 'published', 'building']).default('in_progress'),
    stack: z.array(z.string()).optional(),
    links: z
      .object({
        live: z.url().optional(),
        github: z.url().optional(),
        noveno: z.url().optional(),
        caseStudy: z
          .string()
          .optional()
          .refine((v) => !v || (/^(\/|https?:\/\/)/.test(v) && !/^\s*javascript:/i.test(v)), {
            message: 'caseStudy must be an internal path (/) or https URL, not javascript:',
          }),
      })
      .optional(),
    cover: z.string().optional(),
    // explicit media placeholder flag — when false, media area renders honest abstract structure
    hasVisual: z.boolean().optional().default(false),
    featured: z.boolean().optional(),
    order: z.number().optional(),
  }),
})

const profile = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/profile' }),
  schema: z.object({
    name: z.string(),
    headline: z.string(),
    bio: z.string(),
  }),
})

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/now' }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string().optional(),
  }),
})

export const collections = {
  projects,
  profile,
  now,
}
