import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { noteSchema, paperSchema, projectSchema } from '@/lib/schemas';
import type { Note, Paper, Project } from '@/lib/schemas';

/**
 * Filesystem content layer. Runs at build time only.
 *
 * The `.mdx` filename IS the slug: it is the only stable, human-readable
 * identifier available, so renaming a file breaks its public URL. See README.
 */

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

/** A parsed entry: validated frontmatter plus the raw MDX body. */
export type Entry<T> = {
  slug: string;
  frontmatter: T;
  body: string;
};

function readCollection<T>(
  collection: string,
  parse: (data: unknown, file: string) => T,
): Entry<T>[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ''),
        frontmatter: parse(data, `${collection}/${file}`),
        body: content.trim(),
      };
    });
}

/** Wraps a zod failure with the offending filename, which zod does not know about. */
function parseWith<T>(schema: { parse: (data: unknown) => T }) {
  return (data: unknown, file: string): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      throw new Error(
        `Invalid frontmatter in src/content/${file}\n${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };
}

export function getPapers(): Entry<Paper>[] {
  return readCollection('papers', parseWith(paperSchema)).sort(
    (a, b) => a.frontmatter.order - b.frontmatter.order,
  );
}

export function getPaper(slug: string): Entry<Paper> | undefined {
  return getPapers().find((paper) => paper.slug === slug);
}

export function getProjects(): Entry<Project>[] {
  return readCollection('projects', parseWith(projectSchema)).sort(
    (a, b) => a.frontmatter.order - b.frontmatter.order,
  );
}

/** Published notes only, newest first. Drafts never reach the build. */
export function getNotes(): Entry<Note>[] {
  return readCollection('notes', parseWith(noteSchema))
    .filter((note) => !note.frontmatter.draft)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

export function getNote(slug: string): Entry<Note> | undefined {
  return getNotes().find((note) => note.slug === slug);
}
