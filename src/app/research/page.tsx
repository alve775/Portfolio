import { PageHeader } from '@/components/PageHeader';
import { PaperList } from '@/components/PaperList';
import { getPapers } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Research',
  description: `Research by ${site.name}.`,
  pathname: '/research/',
});

export default function ResearchPage() {
  const papers = getPapers();
  const finished = papers.filter(({ frontmatter }) =>
    frontmatter.status === 'published' || frontmatter.status === 'accepted',
  ).sort((a, b) => b.frontmatter.year - a.frontmatter.year);
  const theses = papers.filter(({ frontmatter }) => frontmatter.status === 'thesis');
  const inProgress = papers.filter(({ frontmatter }) => frontmatter.status === 'in-progress');

  return (
    <>
      <PageHeader
        title="Research"
        lede="Peer-reviewed NLP publications and undergraduate research in EEG analysis."
      />
      {papers.length === 0 ? (
        <div className="empty-state" data-research-index>
          No verified research entries are published yet.
        </div>
      ) : (
        <>
          <PaperList label="Published and accepted" papers={finished} />
          <PaperList label="Undergraduate thesis" papers={theses} />
          <PaperList
            label="In progress"
            papers={inProgress}
          />
        </>
      )}
    </>
  );
}
