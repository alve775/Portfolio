import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { AuthorList, StatusBadge, Takeaway } from '@/components/RecordCard';
import { getPaper, getPapers } from '@/lib/content';
import { cardHeadLine } from '@/lib/paper';
import { safeOptionalBody } from '@/lib/publishability';
import { routeMetadata } from '@/lib/seo';

type PaperPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const params = getPapers().map(({ slug }) => ({ slug }));
  return params.length > 0 ? params : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
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
      ...(paper.frontmatter.status === 'in-progress'
        ? {}
        : { citation_conference_title: paper.frontmatter.venue }),
    },
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();

  const { frontmatter } = paper;
  const body = safeOptionalBody(paper.body);

  return (
    <article className="research-detail" data-research-detail>
      {/* Takeaway-first: the owner's own claim is the first thing read, and the
          abstract — the venue's words, not his — is demoted below it. */}
      <PageHeader size="compact" title={frontmatter.title}>
        <div className="detail-meta">
          <StatusBadge status={frontmatter.status} />
          <span className="meta">{cardHeadLine(frontmatter)}</span>
        </div>
        <AuthorList authors={frontmatter.authors} />
        <Takeaway size="lg">{frontmatter.takeaway}</Takeaway>
      </PageHeader>

      <div className="detail-fields">
        <Field label="Abstract" note="as submitted">
          <p>{frontmatter.abstract}</p>
        </Field>
        {frontmatter.pdfUrl || frontmatter.codeUrl ? (
          <Field label="Links">
            <p className="detail-links">
              {frontmatter.pdfUrl ? (
                <a className="link" href={frontmatter.pdfUrl} rel="noopener">
                  Paper ↗
                </a>
              ) : null}
              {frontmatter.codeUrl ? (
                <a className="link" href={frontmatter.codeUrl} rel="noopener">
                  Code ↗
                </a>
              ) : null}
            </p>
          </Field>
        ) : null}
        {frontmatter.bibtex ? (
          <Field label="BibTeX">
            <pre className="code-block">
              <code>{frontmatter.bibtex}</code>
            </pre>
          </Field>
        ) : null}
        {body ? (
          <Field label="Notes">
            <div className="prose-content">
              <MDXRemote source={body} />
            </div>
          </Field>
        ) : null}
      </div>
    </article>
  );
}
