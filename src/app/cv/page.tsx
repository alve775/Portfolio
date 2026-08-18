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
          <p className="page-action">
            <a
              className="primary-link"
              href="/cv.pdf"
              download
            >
              Download PDF ↓
            </a>
          </p>
        ) : null}
      </PageHeader>

      <div className="cv-grid" data-cv-grid>
        <Field label="Profile">
          <p>{site.positioning}</p>
        </Field>
        <Field label="Education">
          <p>Computer Science and Engineering</p>
          <p className="meta field-meta">
            {site.affiliation} · {site.location}
          </p>
        </Field>
      </div>
    </>
  );
}
