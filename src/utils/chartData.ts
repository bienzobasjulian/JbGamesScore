import { Player, RoundScores } from '../types';

export type PlayerProgressSeries = {
  player: Player;
  /** Total acumulado tras cada ronda (índice = ronda − 1). */
  cumulativeByRound: number[];
};

export function getMatchProgressSeries(
  players: Player[],
  rounds: RoundScores[],
): PlayerProgressSeries[] {
  if (rounds.length === 0) return [];

  return players.map((player) => {
    let total = 0;
    const cumulativeByRound = rounds.map((round) => {
      total += round[player.id] ?? 0;
      return total;
    });
    return { player, cumulativeByRound };
  });
}
