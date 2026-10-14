type ReadingGeometry = {
  offsets: number[];
  focus: number;
  start: number;
  end: number;
};

export function getReadingFocus({
  viewportHeight,
  atEnd,
  lastNode,
}: {
  viewportHeight: number;
  atEnd: boolean;
  lastNode: number;
}) {
  const focus = viewportHeight * 0.42;
  // The last card may not have enough document space below it to reach the focus line.
  return atEnd
    ? Math.max(focus, Math.min(viewportHeight - 1, lastNode + 1))
    : focus;
}

export function getReadingProgress({
  offsets,
  focus,
  start,
  end,
}: ReadingGeometry) {
  const range = end - start;
  if (offsets.length === 0 || range <= 0) {
    return { progress: 0, activeIndex: -1 };
  }

  const progress = Math.min(1, Math.max(0, (focus - start) / range));
  const activeIndex =
    focus > end ? -1 : offsets.findLastIndex((offset) => offset <= focus);

  return { progress, activeIndex };
}
