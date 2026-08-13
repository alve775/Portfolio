import type { Metadata } from 'next';

import { Field } from '@/components/Field';
import { PaperList } from '@/components/PaperList';
import { getPapers } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Research',
  description: `Research by ${site.name}.`,
};

export default function ResearchPage() {
  const papers = getPapers();
  const finished = papers.filter(({ frontmatter }) => frontmatter.status !== 'in-progress');
  const inProgress = papers.filter(({ frontmatter }) => frontmatter.status === 'in-progress');

  return (
    <div className="record">
      <div className="unlabelled">
        <h1>Research</h1>
      </div>
      {papers.length === 0 ? (
        <Field label="STATUS">
          <p>No verified research entries are published yet.</p>
        </Field>
      ) : (
        <>
          <PaperList label="FINISHED WORK" papers={finished} />
          <PaperList label="IN PROGRESS" papers={inProgress} />
        </>
      )}
    </div>
  );
}
