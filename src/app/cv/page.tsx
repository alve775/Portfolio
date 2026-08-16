import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { hasCvPdf } from '@/lib/cv';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Curriculum vitae',
  description: `Curriculum vitae for ${site.name}.`,
  pathname: '/cv/',
});

export default function CvPage() {
  return (
    <>
      <PageHeader title="Curriculum vitae">
        {hasCvPdf() ? (
          <p className="mt-7">
            <a
              className="badge inline-flex min-h-11 items-center px-4 text-[0.75rem] no-underline"
              href="/cv.pdf"
              download
            >
              Download PDF ↓
            </a>
          </p>
        ) : null}
      </PageHeader>

      <div className="record border-t border-rule pt-10">
        <Field label="PROFILE">
          <p className="measure">{site.positioning}</p>
        </Field>
        <Field label="EDUCATION">
          <p>Computer Science and Engineering</p>
          <p className="meta mt-2">
            {site.affiliation} · {site.location}
          </p>
        </Field>
      </div>
    </>
  );
}
