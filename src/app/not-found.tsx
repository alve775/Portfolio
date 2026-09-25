import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { site } from '@/lib/site';

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Error 404"
        title="This route is off the map"
        lede={`The page you tried to reach does not exist. It may have been renamed, or it was never published. Everything public is reachable from the ${site.name} homepage.`}
      />
      <p className="page-action">
        <Link className="primary-link" href="/">
          Back to the homepage
        </Link>
      </p>
    </>
  );
}
