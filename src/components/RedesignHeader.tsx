import type { ReactNode } from 'react';
export function RedesignHeader({
  label,
  title,
  lead,
  children,
  decoration,
}: {
  label: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  decoration?: ReactNode;
}) {
  return (
    <header className="redesign-page-header">
      <div className="redesign-page-header-copy">
        <p className="label">{label}</p>
        <h1>{title}</h1>
        {lead && <p className="redesign-page-lead">{lead}</p>}
        {children}
      </div>
      {decoration}
    </header>
  );
}
