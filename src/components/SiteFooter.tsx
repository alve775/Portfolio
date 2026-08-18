import { ProfileLinks } from '@/components/ProfileLinks';
import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer-inner">
        <div>
          <p className="footer-name">{site.name}</p>
          <p className="meta footer-meta">
            {site.affiliationShort} · {site.location}
          </p>
        </div>
        <ProfileLinks variant="inline" />
      </div>
    </footer>
  );
}
