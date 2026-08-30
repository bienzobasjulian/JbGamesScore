import { Match, PlaySession, Player } from '../types';
import { formatExactDate } from './dateFormat';
import { createId } from './game';
import { getMatchWinners, formatMatchDate } from './match';

export type SessionWinEntry = {
  player: Player;
  wins: number;
  rank: number;
};

export function formatDefaultSessionName(timestamp: number = Date.now()): string {
  return `Sesión del ${formatExactDate(timestamp, timestamp)}`;
}

export function createPlaySession(name: string): PlaySession {
  const now = Date.now();
  const trimmed = name.trim();
  return {
    id: createId(),
    name: trimmed || formatDefaultSessionName(now),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function getSessionMatches(
  sessionId: string,
  matches: Match[],
): Match[] {
  return matches
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getActiveSessions(sessions: PlaySession[]): PlaySession[] {
  return [...sessions]
    .filter((s) => s.status === 'active')
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getRecentSessions(
  sessions: PlaySession[],
  limit: number,
): PlaySession[] {
  return [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function getAllSessionsSorted(sessions: PlaySession[]): PlaySession[] {
  return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function collectSessionPlayers(matches: Match[]): Player[] {
  const byId = new Map<string, Player>();
  for (const match of matches) {
    for (const player of match.players) {
      if (!byId.has(player.id)) {
        byId.set(player.id, player);
      }
    }
  }
  return [...byId.values()];
}

export function getSessionWinRanking(
  sessionMatches: Match[],
): SessionWinEntry[] {
  const finished = sessionMatches.filter((m) => m.status === 'finished');
  const winsByPlayerId = new Map<string, number>();
  const playersById = new Map<string, Player>();

  for (const match of finished) {
    for (const player of match.players) {
      playersById.set(player.id, player);
    }
    const winners = getMatchWinners(match);
    for (const winner of winners) {
      winsByPlayerId.set(
        winner.id,
        (winsByPlayerId.get(winner.id) ?? 0) + 1,
      );
    }
  }

  const entries: SessionWinEntry[] = [...playersById.values()].map(
    (player) => ({
      player,
      wins: winsByPlayerId.get(player.id) ?? 0,
      rank: 0,
    }),
  );

  entries.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.player.name.localeCompare(b.player.name, 'es');
  });

  let rank = 0;
  let prevWins: number | null = null;
  return entries.map((entry, index) => {
    if (prevWins === null || entry.wins !== prevWins) {
      rank = index + 1;
      prevWins = entry.wins;
    }
    return { ...entry, rank };
  });
}

export function formatSessionSubtitle(
  session: PlaySession,
  sessionMatches: Match[],
): string {
  const parts = [
    formatMatchDate(session.updatedAt),
    sessionMatches.length === 1
      ? '1 partida'
      : `${sessionMatches.length} partidas`,
  ];
  if (session.status === 'closed') {
    parts.push('Cerrada');
  }
  const ranking = getSessionWinRanking(sessionMatches);
  const leader = ranking.find((e) => e.wins > 0);
  if (leader) {
    const winLabel =
      leader.wins === 1 ? '1 victoria' : `${leader.wins} victorias`;
    parts.push(`${leader.player.name} lidera (${winLabel})`);
  }
  return parts.join(' · ');
}

export function formatSessionMatchCount(count: number): string {
  return count === 1 ? '1 partida' : `${count} partidas`;
}
