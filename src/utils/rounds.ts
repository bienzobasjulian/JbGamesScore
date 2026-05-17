import { Match, Player, RoundBreakdown, RoundScores } from '../types';

export function emptyRoundScores(players: Player[]): RoundScores {
  const round: RoundScores = {};
  players.forEach((p) => {
    round[p.id] = 0;
  });
  return round;
}

export function emptyRoundBreakdown(): RoundBreakdown {
  return {};
}

export function createInitialRounds(
  players: Player[],
  count: number,
): { rounds: RoundScores[]; roundBreakdowns: RoundBreakdown[] } {
  const rounds: RoundScores[] = [];
  const roundBreakdowns: RoundBreakdown[] = [];
  for (let i = 0; i < count; i++) {
    rounds.push(emptyRoundScores(players));
    roundBreakdowns.push(emptyRoundBreakdown());
  }
  return { rounds, roundBreakdowns };
}

export function padRoundsToMax(match: Match): Match {
  if (match.settings.maxRounds == null) return match;
  const target = match.settings.maxRounds;
  if (match.rounds.length >= target) return match;
  const rounds = [...match.rounds];
  const roundBreakdowns = [...match.roundBreakdowns];
  while (rounds.length < target) {
    rounds.push(emptyRoundScores(match.players));
    roundBreakdowns.push(emptyRoundBreakdown());
  }
  return { ...match, rounds, roundBreakdowns };
}

export function isRoundSelectable(
  activeIndex: number,
  roundIndex: number,
  maxRounds: number | null,
  roundCount: number,
): boolean {
  if (roundIndex < 0 || roundIndex >= roundCount) return false;
  if (maxRounds != null) {
    return roundIndex <= activeIndex + 1;
  }
  return true;
}

export function normalizeMatchRounds(match: Match): Match {
  if (match.rounds && match.rounds.length > 0) {
    let m: Match = {
      ...match,
      rounds: match.rounds,
      roundBreakdowns: match.roundBreakdowns ?? [],
      activeRoundIndex: match.activeRoundIndex ?? 0,
    };
    let breakdowns = m.roundBreakdowns;
    while (breakdowns.length < m.rounds.length) {
      breakdowns.push(emptyRoundBreakdown());
    }
    breakdowns = breakdowns.slice(0, m.rounds.length);
    const maxIndex = Math.max(0, m.rounds.length - 1);
    const activeRoundIndex = Math.min(m.activeRoundIndex, maxIndex);
    m = {
      ...m,
      roundBreakdowns: breakdowns,
      activeRoundIndex,
    };
    return padRoundsToMax(m);
  }

  const completed = match.completedRounds ?? [];
  const current = match.currentRound ?? {};
  const completedBreakdowns = match.completedRoundBreakdowns ?? [];
  const currentBreakdown = match.currentRoundBreakdown ?? {};

  let rounds: RoundScores[];
  let roundBreakdowns: RoundBreakdown[];
  let activeRoundIndex: number;

  if (completed.length === 0) {
    rounds = [{ ...emptyRoundScores(match.players), ...current }];
    roundBreakdowns = [{ ...currentBreakdown }];
    activeRoundIndex = 0;
  } else {
    rounds = [
      ...completed.map((r) => ({ ...r })),
      { ...emptyRoundScores(match.players), ...current },
    ];
    roundBreakdowns = [
      ...completedBreakdowns.map((b) => ({ ...b })),
      { ...currentBreakdown },
    ];
    activeRoundIndex = completed.length;
  }

  return padRoundsToMax({
    ...match,
    rounds,
    roundBreakdowns,
    activeRoundIndex,
  });
}

export function getActiveRound(match: Match): RoundScores {
  const m = normalizeMatchRounds(match);
  return m.rounds[m.activeRoundIndex] ?? emptyRoundScores(m.players);
}

export function getActiveRoundBreakdown(match: Match): RoundBreakdown {
  const m = normalizeMatchRounds(match);
  return m.roundBreakdowns[m.activeRoundIndex] ?? emptyRoundBreakdown();
}

export function getAllRoundsForHistory(match: Match): RoundScores[] {
  return normalizeMatchRounds(match).rounds;
}

export function canAddRound(match: Match): boolean {
  const m = normalizeMatchRounds(match);
  return m.settings.maxRounds == null;
}

export function hasLaterRounds(match: Match): boolean {
  const m = normalizeMatchRounds(match);
  return m.activeRoundIndex < m.rounds.length - 1;
}

export function truncateLaterRounds(match: Match): Match {
  const m = normalizeMatchRounds(match);
  const end = m.activeRoundIndex + 1;
  return {
    ...m,
    rounds: m.rounds.slice(0, end),
    roundBreakdowns: m.roundBreakdowns.slice(0, end),
  };
}
