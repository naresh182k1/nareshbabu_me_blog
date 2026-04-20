import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Naresh Babu'),
    readingTime: z.string().optional(),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    heroImage: z.string().optional(),
    category: z.string().optional(),
    client: z.string().optional(),
    industry: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const reports = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reports' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    coverImage: z.string().optional(),
    source: z.string(),
    category: z.string().optional(),
    fileUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const decks = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/decks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    coverImage: z.string().optional(),
    client: z.string().optional(),
    brand: z.enum(['personal', 'infiniai', 'mobilelive']).default('personal'),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Naresh Babu'),
  }),
});

export const collections = { blog, insights, reports, decks };
