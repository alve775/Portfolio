import Link from 'next/link';

import { Field } from '@/components/Field';
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
    <div className="record">
      <div className="unlabelled">
        <h1>Notes</h1>
      </div>
      <Field label="NOTES">
        {notes.length === 0 ? (
          <p>No notes are published yet.</p>
        ) : (
          <ul className="space-y-6">
            {notes.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <Link
                  className="link text-[1.3125rem] leading-[1.4]"
                  href={`/notes/${slug}/`}
                >
                  {frontmatter.title}
                </Link>
                <p className="meta mt-2">
                  <time dateTime={frontmatter.date}>{frontmatter.date}</time>
                </p>
                <p className="mt-2">{frontmatter.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </Field>
    </div>
  );
}
