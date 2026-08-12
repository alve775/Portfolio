import Link from 'next/link';

import { ProfileLinks } from '@/components/ProfileLinks';
import { getPapers } from '@/lib/content';
import { kindLabel, recordLine } from '@/lib/paper';
import { site } from '@/lib/site';

/**
 * Home. Per the brief: name, positioning sentence, bio, one row of links, then
 * three linked proof points. Nothing else — no hero, no sections, no calls to
 * action. The proof points are the two papers and the thesis.
 */
export default function HomePage() {
  const proofPoints = getPapers().slice(0, 3);

  return (
    <div className="record">
      <div className="unlabelled">
        <h1 className="hangs-left text-[2.125rem] leading-[1.15] tracking-[-0.015em]">
          {site.name}
        </h1>
        <p className="mt-5 text-[1.3125rem] leading-[1.5]">{site.positioning}</p>
        <p className="mt-7">{site.bio}</p>
        <ProfileLinks className="mt-6" />
      </div>

      {proofPoints.map((paper) => (
        <section className="field border-t border-rule pt-5" key={paper.slug}>
          <h2 className="field-label">{kindLabel(paper.frontmatter)}</h2>
          <div>
            <Link href={`/research/${paper.slug}/`} className="link text-[1.3125rem] leading-[1.4]">
              {paper.frontmatter.title}
            </Link>
            <p className="meta mt-2">{recordLine(paper.frontmatter)}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
