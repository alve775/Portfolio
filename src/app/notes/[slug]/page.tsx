import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
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
    <article className="note-detail" data-note-detail>
      <PageHeader
        eyebrow={note.frontmatter.date}
        title={note.frontmatter.title}
        size="compact"
      />
      <div className="detail-fields">
        <Field label="Summary">
          <p>{note.frontmatter.summary}</p>
        </Field>
        <Field label="Note">
          <div className="prose-content">
            <MDXRemote source={note.body} />
          </div>
        </Field>
      </div>
    </article>
  );
}
