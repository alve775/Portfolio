import Link from 'next/link';

import { Field } from '@/components/Field';
import type { Entry } from '@/lib/content';
import { recordLine } from '@/lib/paper';
import type { Paper } from '@/lib/schemas';

export function PaperList({ label, papers }: { label: string; papers: Entry<Paper>[] }) {
  if (papers.length === 0) return null;

  return (
    <Field label={label}>
      <ul className="space-y-6">
        {papers.map((paper) => (
          <li key={paper.slug}>
            <Link
              className="link text-[1.3125rem] leading-[1.4]"
              href={`/research/${paper.slug}/`}
            >
              {paper.frontmatter.title}
            </Link>
            <p className="meta mt-2">{recordLine(paper.frontmatter)}</p>
          </li>
        ))}
      </ul>
    </Field>
  );
}
