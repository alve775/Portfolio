export function Metric({
  metric,
  metricNote,
}: {
  metric?: string;
  metricNote?: string;
}) {
  if (!metric || !metricNote) return null;
  return (
    <div className="metric-block">
      <span className="metric-value">{metric}</span>
      <span className="metric-note">{metricNote}</span>
    </div>
  );
}
