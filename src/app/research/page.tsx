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
  const finished = papers.filter(({ frontmatter }) => frontmatter.status !== 'in-progress');
  const inProgress = papers.filter(({ frontmatter }) => frontmatter.status === 'in-progress');

  return (
    <>
      <PageHeader
        title="Research"
        lede="Publications first, then work that is still in progress."
      />
      {papers.length === 0 ? (
        <p className="empty">No verified research entries are published yet.</p>
      ) : (
        <>
          <PaperList label="Published and accepted" papers={finished} />
          <PaperList
            label="In progress"
            papers={inProgress}
            startIndex={finished.length + 1}
          />
        </>
      )}
    </>
  );
}
