import { Fragment } from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Field } from '@/components/Field';
import { getPaper, getPapers } from '@/lib/content';
import { recordLine } from '@/lib/paper';
import { safeOptionalBody } from '@/lib/publishability';
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
    title: paper.frontmatter.title,
    description: paper.frontmatter.takeaway,
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
    <article className="record">
      <div className="unlabelled">
        <h1>{frontmatter.title}</h1>
      </div>
      <Field label="AUTHORS">
        <p>
          {frontmatter.authors.map((author, index) => (
            <Fragment key={`${author}-${index}`}>
              {index > 0 ? ', ' : null}
              <span className={author === site.name ? 'self' : undefined}>{author}</span>
            </Fragment>
          ))}
        </p>
      </Field>
      <Field label="STATUS">
        <p>{recordLine(frontmatter)}</p>
      </Field>
      <Field label="ABSTRACT">
        <p>{frontmatter.abstract}</p>
      </Field>
      <Field label="TAKEAWAY">
        <p className="bg-mark px-4 py-3">{frontmatter.takeaway}</p>
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
          <pre>
            <code>{frontmatter.bibtex}</code>
          </pre>
        </Field>
      ) : null}
      {body ? (
        <Field label="NOTES">
          <MDXRemote source={body} />
        </Field>
      ) : null}
    </article>
  );
}
