import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Field } from '@/components/Field';
import { getNote, getNotes } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';

type NotePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const params = getNotes().map(({ slug }) => ({ slug }));
  return params.length > 0 ? params : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) notFound();
  return routeMetadata({
    title: note.frontmatter.title,
    description: note.frontmatter.summary,
    pathname: `/notes/${note.slug}/`,
  });
}

export default async function NotePage({ params }: NotePageProps) {
  const note = getNote((await params).slug);
  if (!note) notFound();

  return (
    <article className="record">
      <div className="unlabelled">
        <h1>{note.frontmatter.title}</h1>
        <p className="meta mt-3">
          <time dateTime={note.frontmatter.date}>{note.frontmatter.date}</time>
        </p>
      </div>
      <Field label="SUMMARY">
        <p>{note.frontmatter.summary}</p>
      </Field>
      <Field label="NOTE">
        <MDXRemote source={note.body} />
      </Field>
    </article>
  );
}
