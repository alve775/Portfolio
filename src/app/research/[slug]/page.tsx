import { Fragment } from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge, Takeaway } from '@/components/RecordCard';
import { getPaper, getPapers } from '@/lib/content';
import { cardHeadLine } from '@/lib/paper';
import { safeOptionalBody } from '@/lib/publishability';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

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
    <article>
      {/* Takeaway-first: the owner's own claim is the first thing read, and the
          abstract — the venue's words, not his — is demoted below it. */}
      <PageHeader size="compact" title={frontmatter.title}>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge status={frontmatter.status} />
          <span className="meta">{cardHeadLine(frontmatter)}</span>
        </div>
        <p className="measure mt-4 text-[0.9375rem] text-muted">
          {frontmatter.authors.map((author, index) => (
            <Fragment key={`${author}-${index}`}>
              {index > 0 ? ', ' : null}
              <span className={author === site.name ? 'self' : undefined}>{author}</span>
            </Fragment>
          ))}
        </p>
        <Takeaway size="lg" className="mt-8">
          {frontmatter.takeaway}
        </Takeaway>
      </PageHeader>

      <div className="record border-t border-rule pt-10">
      <Field label="ABSTRACT" note="as submitted">
        <p className="measure">{frontmatter.abstract}</p>
      </Field>
      {frontmatter.pdfUrl || frontmatter.codeUrl ? (
        <Field label="LINKS">
          <p className="flex gap-5">
            {frontmatter.pdfUrl ? (
              <a className="link" href={frontmatter.pdfUrl} rel="noopener">
                Paper
              </a>
            ) : null}
            {frontmatter.codeUrl ? (
              <a className="link" href={frontmatter.codeUrl} rel="noopener">
                Code
              </a>
            ) : null}
          </p>
        </Field>
      ) : null}
      {frontmatter.bibtex ? (
        <Field label="BIBTEX">
          <pre className="card overflow-x-auto p-4 font-mono text-[0.8125rem] leading-[1.6]">
            <code>{frontmatter.bibtex}</code>
          </pre>
        </Field>
      ) : null}
      {body ? (
        <Field label="NOTES">
          <div className="measure">
            <MDXRemote source={body} />
          </div>
        </Field>
      ) : null}
      </div>
    </article>
  );
}
