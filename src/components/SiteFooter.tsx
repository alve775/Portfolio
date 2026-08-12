import { ProfileLinks } from '@/components/ProfileLinks';
import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="shell flex flex-col gap-3 py-8">
        <p className="meta">
          {site.name} · {site.affiliationShort}, {site.location}
        </p>
        <ProfileLinks />
      </div>
    </footer>
  );
}
