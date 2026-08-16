import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { getNotes } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Notes',
  description: `Research and engineering notes by ${site.name}.`,
  pathname: '/notes/',
});

export default function NotesPage() {
  const notes = getNotes();

  return (
    <>
      <PageHeader title="Notes" />

      {notes.length === 0 ? (
        <p className="empty">No notes are published yet.</p>
      ) : (
        <ul className="border-t border-ink">
          {notes.map(({ slug, frontmatter }) => (
            <li className="border-b border-rule" key={slug}>
              <Link
                className="card-link group grid gap-x-8 gap-y-1 py-5 no-underline sm:grid-cols-[7rem_minmax(0,1fr)]"
                href={`/notes/${slug}/`}
              >
                <time className="meta sm:pt-1.5" dateTime={frontmatter.date}>
                  {frontmatter.date}
                </time>
                <span>
                  <span className="card-title title-md block">{frontmatter.title}</span>
                  <span className="measure mt-1.5 block text-[0.9375rem] text-muted">
                    {frontmatter.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
