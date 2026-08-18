import { RecordCard } from '@/components/RecordCard';
import type { Entry } from '@/lib/content';
import type { Paper } from '@/lib/schemas';

/** One titled group of record cards on /research. */
export function PaperList({
  label,
  papers,
}: {
  label: string;
  papers: Entry<Paper>[];
}) {
  if (papers.length === 0) return null;

  return (
    <section className="work-section" data-research-index>
      <div className="section-heading">
        <h2>{label}</h2>
        <span className="meta">
          {papers.length} {papers.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <div className="research-index">
        {papers.map((paper) => (
          <RecordCard key={paper.slug} paper={paper} />
        ))}
      </div>
    </section>
  );
}
