import { RoundBreakdown, ScoringMode } from '../types';

export function sumBreakdownItems(items: number[]): number {
  return items.reduce((sum, value) => sum + value, 0);
}

export function formatBreakdownItem(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
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
