import { RoundBreakdown, ScoringMode } from '../types';

export function sumBreakdownItems(items: number[]): number {
  return items.reduce((sum, value) => sum + value, 0);
}

export function formatScoreNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded).replace('.', ',');
}

export function formatBreakdownItem(value: number): string {
  if (value > 0) return `+${formatScoreNumber(value)}`;
  return formatScoreNumber(value);
}

/** Expresión tipo `10+12+4-9` a partir de los sumandos guardados. */
export function formatBreakdownExpression(items: number[]): string {
  return items
    .map((value, index) => {
      const abs = formatScoreNumber(Math.abs(value));
      if (index === 0) return value < 0 ? `-${abs}` : abs;
      return value < 0 ? `-${abs}` : `+${abs}`;
    })
    .join('');
}

export function getPlayerScoringMode(
  modes: Record<string, ScoringMode>,
  playerId: string,
  breakdownItems: number[] | undefined,
): ScoringMode {
  if (modes[playerId]) return modes[playerId];
  if (breakdownItems && breakdownItems.length > 0) return 'breakdown';
  return 'direct';
}

export function getPlayerBreakdownItems(
  breakdown: RoundBreakdown,
  playerId: string,
): number[] {
  return breakdown[playerId] ?? [];
}
