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

      <section className="notes-section" data-note-index aria-label="Published notes">
        {notes.length === 0 ? (
          <p className="empty-state">No notes are published yet.</p>
        ) : (
          <ul className="note-index">
            {notes.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <Link className="note-link" href={`/notes/${slug}/`}>
                  <time className="meta" dateTime={frontmatter.date}>
                    {frontmatter.date}
                  </time>
                  <span className="note-copy">
                    <span className="note-title">{frontmatter.title}</span>
                    <span className="note-summary">{frontmatter.summary}</span>
                  </span>
                  <span className="note-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
