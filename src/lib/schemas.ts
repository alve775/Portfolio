import { z } from 'zod';

/**
 * Frontmatter schemas for the three content collections.
 *
 * These are parsed with `.parse()` (never `.safeParse()`) in `content.ts`, so a
 * malformed entry throws and breaks the build. That is intentional: bad content
 * should never reach a deploy.
 *
 * Note on `{{TODO}}` tokens: fields that may legitimately hold a token while the
 * owner fills in the real value are typed as plain non-empty strings, not URLs.
 * Fields typed as URLs (`pdfUrl`, `codeUrl`) are optional — omit the key entirely
 * rather than writing a token into it.
 */

/** YAML parsers coerce unquoted `2026-08-12` into a Date. Normalise back to ISO. */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.iso.date(),
);

export const paperSchema = z.object({
  title: z.string().min(1),
  /** Exact publication order. Never reordered, never sorted. */
  authors: z.array(z.string().min(1)).min(1),
  venue: z.string().min(1),
  year: z.number().int(),
  status: z.enum(['published', 'accepted', 'in-progress', 'thesis']),
  role: z.enum(['lead-author', 'co-author']),
  abstract: z.string().min(1),
  abstractLabel: z.enum(['as submitted', 'summary']).default('as submitted'),
  pdfUrl: z.url().optional(),
  codeUrl: z.url().optional(),
  bibtex: z.string().optional(),
  /** The owner's plain statement of what the work shows. Never generated. */
  takeaway: z.string().min(1),
  draft: z.boolean(),
  order: z.number().int(),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  problem: z.string().min(1),
  approach: z.string().min(1),
  result: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  repoUrl: z.string().min(1),
  liveUrl: z.string().min(1).optional(),
  image: z.object({
    src: z.string().regex(/^\/images\/projects\/[a-z0-9-]+\.(jpg|png|webp)$/),
    alt: z.string().min(1),
    caption: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
  caseStudy: z.object({
    contribution: z.string().min(1),
    decision: z.string().min(1),
    limitation: z.string().min(1),
  }).optional(),
  status: z.enum(['live', 'complete', 'archived', 'wip']),
  draft: z.boolean(),
  order: z.number().int(),
});

export const noteSchema = z.object({
  title: z.string().min(1),
  date: isoDate,
  summary: z.string().min(1),
  draft: z.boolean(),
});

export type Paper = z.infer<typeof paperSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Note = z.infer<typeof noteSchema>;
