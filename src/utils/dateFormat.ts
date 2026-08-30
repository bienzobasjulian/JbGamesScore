const MS_PER_DAY = 86_400_000;

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function calendarDayDiff(fromTimestamp: number, toTimestamp: number): number {
  return Math.round(
    (startOfDay(toTimestamp) - startOfDay(fromTimestamp)) / MS_PER_DAY,
  );
}

export function formatExactDate(
  timestamp: number,
  referenceTimestamp: number = Date.now(),
): string {
  const date = new Date(timestamp);
  const reference = new Date(referenceTimestamp);
  const sameYear = date.getFullYear() === reference.getFullYear();

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

export function formatRelativeDate(
  timestamp: number,
  referenceTimestamp: number = Date.now(),
): string {
  const days = calendarDayDiff(timestamp, referenceTimestamp);

  if (days < 0) return formatExactDate(timestamp, referenceTimestamp);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days <= 6) return `Hace ${days} días`;
  if (days <= 13) return 'Hace 1 semana';
  if (days <= 20) return 'Hace 2 semanas';
  if (days <= 27) return 'Hace 3 semanas';
  if (days <= 30) return 'Hace 4 semanas';
  return formatExactDate(timestamp, referenceTimestamp);
}
