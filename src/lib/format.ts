const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Renders an ISO date (`2026-08-12`) as `12 Aug 2026`.
 *
 * Deliberately not `Intl.DateTimeFormat`: the output must be identical at
 * build time and in every locale a visitor browser can report. Unparsed input
 * is returned unchanged so the page still renders if the format ever drifts.
 */
export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;

  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  return monthName ? `${Number(day)} ${monthName} ${year}` : iso;
}
