import { ProfileLinks } from '@/components/ProfileLinks';
import { PaperList } from '@/components/PaperList';
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
      <section className="home-hero" data-home-hero aria-labelledby="home-title">
        <div className="hero-identity">
          <p className="eyebrow">{site.affiliationShort} · {site.location}</p>
          <h1 id="home-title" className="hero-name">{site.name}</h1>
        </div>
        <div className="hero-copy">
          <p className="hero-thesis">{site.positioning}</p>
          <ProfileLinks />
        </div>
      </section>

      {proofPoints.length > 0 ? (
        <PaperList label="Selected research" papers={proofPoints} />
      ) : (
        <section className="work-section" data-research-index>
          <div className="section-heading"><h2>Selected research</h2></div>
          <p className="empty-state">No verified research entries are published yet.</p>
        </section>
      )}

      <section className="profile-section" aria-labelledby="profile-title">
        <div className="section-heading section-heading-plain">
          <h2 id="profile-title">Profile</h2>
        </div>
        <p className="profile-copy">{site.bio}</p>
      </section>
    </>
  );
}
