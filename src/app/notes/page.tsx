import Link from 'next/link';

import { RedesignHeader } from '@/components/RedesignHeader';
import { formatIsoDate } from '@/lib/format';
import { getNotes } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { copy } from '@/lib/site';

export const metadata = routeMetadata({
  title: copy.notes,
  description: copy.notesDescription,
  pathname: '/notes/',
});

export default function NotesPage() {
  const notes = getNotes();

  return (
    <>
      <RedesignHeader label={copy.notes} title={copy.notes} />

      <section className="notes-section" data-note-index aria-label={copy.publishedNotes}>
        {notes.length === 0 ? (
          <p className="empty-state">{copy.emptyNotes}</p>
        ) : (
          <ul className="note-index">
            {notes.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <Link className="note-link" href={`/notes/${slug}/`}>
                  <time className="meta" dateTime={frontmatter.date}>
                    {formatIsoDate(frontmatter.date)}
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
