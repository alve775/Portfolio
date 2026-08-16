import { RecordCard } from '@/components/RecordCard';
import type { Entry } from '@/lib/content';
import type { Paper } from '@/lib/schemas';

/** One titled group of record cards on /research. */
export function PaperList({
  label,
  papers,
  startIndex = 1,
}: {
  label: string;
  papers: Entry<Paper>[];
  startIndex?: number;
}) {
  if (papers.length === 0) return null;

  return (
    <section className="mt-14 first:mt-0">
      <div className="section-head">
        <h2 className="mono-label">{label}</h2>
        <span className="mono-label">
          {papers.length} {papers.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {papers.map((paper, index) => (
          <RecordCard key={paper.slug} paper={paper} index={startIndex + index} />
        ))}
      </div>
    </section>
  );
}
