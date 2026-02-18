import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    status: z.enum(['done', 'in-progress', 'planned']),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    cover: z.string().optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional()
  })
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    readingTime: z.string().optional()
  })
});

export const collections = {
  projects,
  blog
};
