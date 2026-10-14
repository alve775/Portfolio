import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchDetail } from '@/components/ResearchDetail';

import { getPaper, getPapers, getProjects } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';

type PaperPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const params = getPapers().map(({ slug }) => ({ slug }));
  return params.length > 0 ? params : [{ slug: '__empty__' }];
}

export async function generateMetadata({
  params,
}: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();

  return {
    ...routeMetadata({
      title: paper.frontmatter.title,
      description: paper.frontmatter.takeaway,
      pathname: `/research/${paper.slug}/`,
    }),
    other: {
      citation_title: paper.frontmatter.title,
      citation_author: paper.frontmatter.authors,
      citation_publication_date: String(paper.frontmatter.year),
      ...(paper.frontmatter.status === 'thesis'
        ? { citation_dissertation_institution: paper.frontmatter.venue }
        : paper.frontmatter.status === 'in-progress'
          ? {}
          : { citation_conference_title: paper.frontmatter.venue }),
    },
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const paper = getPaper((await params).slug);
  if (!paper) notFound();
  return (
    <ResearchDetail
      paper={paper}
      papers={getPapers()}
      classifier={getProjects().find(
        (p) => p.slug === 'bangla-sentence-classifier',
      )}
    />
  );
}
