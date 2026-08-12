import type { ReactNode } from 'react';

/**
 * One row of the record grid: a monospace field label in the left margin and
 * its content in the reading column. The label is a real `h2`, so the document
 * outline and the visual margin notes are the same thing.
 */
export function Field({
  label,
  note,
  children,
}: {
  label: string;
  /** Second line under the label, e.g. "as submitted". */
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="field">
      <h2 className="field-label">
        {label}
        {note ? <span className="field-label-note">{note}</span> : null}
      </h2>
      <div>{children}</div>
    </section>
  );
}
