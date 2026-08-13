import type { Metadata } from 'next';

import { Field } from '@/components/Field';
import { hasCvPdf } from '@/lib/cv';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Curriculum vitae',
  description: `Curriculum vitae for ${site.name}.`,
};

export default function CvPage() {
  return (
    <div className="record">
      <div className="unlabelled">
        <h1>Curriculum vitae</h1>
        {hasCvPdf() ? (
          <a
            className="link meta mt-4 inline-flex min-h-11 items-center"
            href="/cv.pdf"
            download
          >
            Download PDF
          </a>
        ) : null}
      </div>
      <Field label="PROFILE">
        <p>{site.positioning}</p>
      </Field>
      <Field label="EDUCATION">
        <p>Computer Science and Engineering</p>
        <p className="meta mt-2">
          {site.affiliation} · {site.location}
        </p>
      </Field>
    </div>
  );
}
