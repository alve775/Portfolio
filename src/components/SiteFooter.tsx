import { ProfileLinks } from '@/components/ProfileLinks';
import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-7">
        <p className="meta">
          {site.name} · {site.affiliationShort}, {site.location}
        </p>
        <ProfileLinks variant="inline" />
      </div>
    </footer>
  );
}
