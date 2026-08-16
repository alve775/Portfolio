import { PageHeader } from '@/components/PageHeader';
import { ProfileLinks } from '@/components/ProfileLinks';
import { RecordCard } from '@/components/RecordCard';
import { getPapers } from '@/lib/content';
import { site } from '@/lib/site';

/**
 * Home. Per the brief: name, positioning sentence, bio, one row of links, then
 * three linked proof points — the two papers and the thesis. Nothing else.
 */
export default function HomePage() {
  const proofPoints = getPapers().slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={`${site.affiliationShort} · ${site.location}`}
        title={site.name}
        lede={site.positioning}
      />

      <div className="grid gap-x-14 gap-y-8 border-t border-rule pt-8 lg:grid-cols-[1.55fr_1fr]">
        <p className="measure text-[0.9375rem] leading-[1.7] text-muted">{site.bio}</p>
        <ProfileLinks />
      </div>

      <section className="mt-16">
        <div className="section-head">
          <h2 className="mono-label">Selected work</h2>
          {proofPoints.length > 0 ? (
            <span className="mono-label">
              {proofPoints.length} {proofPoints.length === 1 ? 'record' : 'records'}
            </span>
          ) : null}
        </div>

        {proofPoints.length === 0 ? (
          <p className="empty mt-5">No verified research entries are published yet.</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {proofPoints.map((paper, index) => (
              <RecordCard key={paper.slug} paper={paper} index={index + 1} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
