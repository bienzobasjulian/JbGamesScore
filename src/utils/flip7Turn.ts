import {
  Flip7Modifier,
  Flip7RoundEntry,
  Flip7RoundState,
  Flip7Session,
  Player,
} from '../types';
import {
  canFlip7TakeModifier,
  canFlip7TakeNumber,
  emptyFlip7RoundEntry,
  FLIP7_MAX_NUMBERS,
  hasFlip7Bonus,
} from './flip7';

export function cloneFlip7Session(session: Flip7Session): Flip7Session {
  return {
    players: session.players.map((player) => ({ ...player })),
    activeRoundIndex: session.activeRoundIndex,
    rounds: session.rounds.map((round) => {
      const copy: Record<string, Flip7RoundEntry> = {};
      for (const [playerId, entry] of Object.entries(round)) {
        copy[playerId] = {
          ...entry,
          numbers: [...entry.numbers],
          modifiers: [...entry.modifiers],
        };
      }
      return copy;
    }),
    roundStates: session.roundStates.map((state) => ({
      turnOrderIndex: state.turnOrderIndex,
      pendingDraws: { ...state.pendingDraws },
      flipThreeSourcePlayerId: state.flipThreeSourcePlayerId,
    })),
    undoStack: [],
  };
}

export function canFlip7Undo(session: Flip7Session): boolean {
  const stack = normalizeFlip7Session(session).undoStack ?? [];
  return stack.length > 0;
}

export function applyFlip7WithUndo(
  prev: Flip7Session,
  apply: (session: Flip7Session) => Flip7Session | null | undefined,
): Flip7Session {
  const normalized = normalizeFlip7Session(prev);
  const result = apply(normalized);
  if (!result || result === normalized) return normalized;
  const undoStack = [...(normalized.undoStack ?? []), cloneFlip7Session(normalized)];
  return {
    ...result,
    undoStack,
  };
}

export function undoFlip7Action(session: Flip7Session): Flip7Session {
  const normalized = normalizeFlip7Session(session);
  const stack = normalized.undoStack ?? [];
  if (stack.length === 0) return normalized;
  const previous = stack[stack.length - 1];
  return {
    ...cloneFlip7Session(previous),
    undoStack: stack.slice(0, -1),
  };
}

export function getFlip7DealerIndex(roundIndex: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return roundIndex % playerCount;
}

/** Orden de turno: el primero en jugar es el siguiente al repartidor. */
export function getFlip7PlayersInTurnOrder(
  players: Player[],
  roundIndex: number,
): Player[] {
  if (players.length === 0) return [];
  const dealerIndex = getFlip7DealerIndex(roundIndex, players.length);
  const firstIndex = (dealerIndex + 1) % players.length;
  return [...players.slice(firstIndex), ...players.slice(0, firstIndex)];
}

export function getFlip7Dealer(
  players: Player[],
  roundIndex: number,
): Player | null {
  if (players.length === 0) return null;
  return players[getFlip7DealerIndex(roundIndex, players.length)] ?? null;
}

export function emptyFlip7RoundState(): Flip7RoundState {
  return {
    turnOrderIndex: 0,
    pendingDraws: {},
    flipThreeSourcePlayerId: null,
  };
}

export function normalizeFlip7Session(session: Flip7Session): Flip7Session {
  const needsRoundStates =
    !session.roundStates ||
    session.roundStates.length !== session.rounds.length;

  const undoStack =
    session.undoStack ??
    (session.undoSnapshot
      ? [cloneFlip7Session(session.undoSnapshot)]
      : []);

  if (!needsRoundStates && session.undoStack === undoStack) {
    return session;
  }

  const { undoSnapshot: _legacyUndo, ...rest } = session;
  return {
    ...rest,
    ...(needsRoundStates
      ? { roundStates: session.rounds.map(() => emptyFlip7RoundState()) }
      : {}),
    undoStack,
  };
}

export function getFlip7RoundState(
  session: Flip7Session,
  roundIndex: number,
): Flip7RoundState {
  return session.roundStates[roundIndex] ?? emptyFlip7RoundState();
}

export function getFlip7TurnPlayer(
  session: Flip7Session,
  roundIndex: number,
): Player | null {
  const order = getFlip7PlayersInTurnOrder(session.players, roundIndex);
  const state = getFlip7RoundState(session, roundIndex);
  return order[state.turnOrderIndex] ?? order[0] ?? null;
}

export function isFlip7PlayerActive(entry: Flip7RoundEntry): boolean {
  return entry.status === 'active';
}

function findNextActiveTurnIndex(
  turnOrder: Player[],
  fromIndex: number,
  roundByPlayer: Record<string, Flip7RoundEntry>,
): number {
  const n = turnOrder.length;
  if (n === 0) return 0;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIndex + step) % n;
    const player = turnOrder[idx];
    const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();
    if (isFlip7PlayerActive(entry)) return idx;
  }
  return fromIndex;
}

function findTurnIndexAfterPlayer(
  turnOrder: Player[],
  afterPlayerId: string,
  roundByPlayer: Record<string, Flip7RoundEntry>,
): number {
  const afterIndex = turnOrder.findIndex((p) => p.id === afterPlayerId);
  if (afterIndex < 0) return 0;
  return findNextActiveTurnIndex(turnOrder, afterIndex, roundByPlayer);
}

export function advanceFlip7TurnAfterCard(
  state: Flip7RoundState,
  turnOrder: Player[],
  roundByPlayer: Record<string, Flip7RoundEntry>,
  actingPlayerId: string,
): Flip7RoundState {
  const actingIndex = turnOrder.findIndex((p) => p.id === actingPlayerId);
  const pendingBefore = state.pendingDraws[actingPlayerId] ?? 0;

  if (pendingBefore > 0) {
    const pendingAfter = pendingBefore - 1;
    const pendingDraws = { ...state.pendingDraws };
    if (pendingAfter <= 0) {
      delete pendingDraws[actingPlayerId];
    } else {
      pendingDraws[actingPlayerId] = pendingAfter;
    }

    if (pendingAfter > 0) {
      return {
        ...state,
        turnOrderIndex: actingIndex >= 0 ? actingIndex : state.turnOrderIndex,
        pendingDraws,
      };
    }

    if (state.flipThreeSourcePlayerId) {
      const sourceId = state.flipThreeSourcePlayerId;
      return {
        turnOrderIndex: findTurnIndexAfterPlayer(
          turnOrder,
          sourceId,
          roundByPlayer,
        ),
        pendingDraws,
        flipThreeSourcePlayerId: null,
      };
    }
  }

  const currentIndex = actingIndex >= 0 ? actingIndex : state.turnOrderIndex;
  return {
    ...state,
    turnOrderIndex: findNextActiveTurnIndex(
      turnOrder,
      currentIndex,
      roundByPlayer,
    ),
    flipThreeSourcePlayerId: null,
  };
}

export function setFlip7TurnOrderIndex(
  session: Flip7Session,
  roundIndex: number,
  turnOrderIndex: number,
): Flip7Session {
  const roundStates = [...session.roundStates];
  const state = { ...getFlip7RoundState(session, roundIndex), turnOrderIndex };
  roundStates[roundIndex] = state;
  return { ...session, roundStates };
}

export function getFlip7ActiveTargetCandidates(
  turnOrder: Player[],
  roundByPlayer: Record<string, Flip7RoundEntry>,
  sourcePlayerId: string,
  filter?: (entry: Flip7RoundEntry) => boolean,
): Player[] {
  return turnOrder.filter((player) => {
    const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();
    if (!isFlip7PlayerActive(entry)) return false;
    if (filter && !filter(entry)) return false;
    return player.id !== sourcePlayerId;
  });
}

export function resolveFlip7TargetPlayerId(
  candidates: Player[],
  fallbackPlayerId: string,
): string {
  return candidates[0]?.id ?? fallbackPlayerId;
}

export type Flip7RegisterNumberResult = {
  session: Flip7Session;
  flip7Achieved: boolean;
  secondChanceUsed: boolean;
  eliminated: boolean;
  skipTurnAdvance: boolean;
};

export function registerFlip7Number(
  session: Flip7Session,
  roundIndex: number,
  playerId: string,
  number: number,
): Flip7RegisterNumberResult | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const rounds = [...normalized.rounds];
  const roundByPlayer = { ...(rounds[roundIndex] ?? {}) };
  let entry = { ...(roundByPlayer[playerId] ?? emptyFlip7RoundEntry()) };

  if (!isFlip7PlayerActive(entry)) return null;

  let secondChanceUsed = false;
  let eliminated = false;
  let skipTurnAdvance = false;

  if (entry.numbers.includes(number)) {
    if (entry.hasSecondChance) {
      entry = { ...entry, hasSecondChance: false };
      secondChanceUsed = true;
    } else {
      entry = { ...entry, status: 'eliminated' };
      eliminated = true;
    }
  } else {
    if (!canFlip7TakeNumber(roundByPlayer, playerId, number)) return null;

    const numbers = [...entry.numbers, number].sort((a, b) => a - b);
    entry = { ...entry, numbers };
    if (numbers.length >= FLIP7_MAX_NUMBERS) {
      entry = { ...entry, status: 'stood' };
      skipTurnAdvance = true;
    }
  }

  roundByPlayer[playerId] = entry;
  rounds[roundIndex] = roundByPlayer;

  const roundStates = [...normalized.roundStates];
  let state = getFlip7RoundState(normalized, roundIndex);
  if (!skipTurnAdvance) {
    state = advanceFlip7TurnAfterCard(state, turnOrder, roundByPlayer, playerId);
  }
  roundStates[roundIndex] = state;

  const flip7Achieved = hasFlip7Bonus(entry);

  return {
    session: { ...normalized, rounds, roundStates },
    flip7Achieved,
    secondChanceUsed,
    eliminated,
    skipTurnAdvance,
  };
}

export type Flip7RegisterModifierResult = {
  session: Flip7Session;
  flip7Achieved: boolean;
};

export function registerFlip7Modifier(
  session: Flip7Session,
  roundIndex: number,
  playerId: string,
  modifier: Flip7Modifier,
): Flip7RegisterModifierResult | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const rounds = [...normalized.rounds];
  const roundByPlayer = { ...(rounds[roundIndex] ?? {}) };
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();

  if (!isFlip7PlayerActive(entry)) return null;
  if (entry.modifiers.includes(modifier)) return null;

  if (!canFlip7TakeModifier(roundByPlayer, playerId, modifier)) return null;

  roundByPlayer[playerId] = {
    ...entry,
    modifiers: [...entry.modifiers, modifier],
  };
  rounds[roundIndex] = roundByPlayer;

  const roundStates = [...normalized.roundStates];
  roundStates[roundIndex] = advanceFlip7TurnAfterCard(
    getFlip7RoundState(normalized, roundIndex),
    turnOrder,
    roundByPlayer,
    playerId,
  );

  return {
    session: { ...normalized, rounds, roundStates },
    flip7Achieved: false,
  };
}

export function applyFlip7Freeze(
  session: Flip7Session,
  roundIndex: number,
  sourcePlayerId: string,
  targetPlayerId: string,
): Flip7Session | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const rounds = [...normalized.rounds];
  const roundByPlayer = { ...(rounds[roundIndex] ?? {}) };
  const targetEntry = roundByPlayer[targetPlayerId] ?? emptyFlip7RoundEntry();

  if (!isFlip7PlayerActive(targetEntry)) return null;

  roundByPlayer[targetPlayerId] = { ...targetEntry, status: 'frozen' };
  rounds[roundIndex] = roundByPlayer;

  const roundStates = [...normalized.roundStates];
  roundStates[roundIndex] = advanceFlip7TurnAfterCard(
    getFlip7RoundState(normalized, roundIndex),
    turnOrder,
    roundByPlayer,
    sourcePlayerId,
  );

  return { ...normalized, rounds, roundStates };
}

export function applyFlip7FlipThree(
  session: Flip7Session,
  roundIndex: number,
  sourcePlayerId: string,
  targetPlayerId: string,
): Flip7Session | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const targetEntry =
    (normalized.rounds[roundIndex] ?? {})[targetPlayerId] ??
    emptyFlip7RoundEntry();
  if (!isFlip7PlayerActive(targetEntry)) return null;

  const targetIndex = turnOrder.findIndex((p) => p.id === targetPlayerId);
  const state = getFlip7RoundState(normalized, roundIndex);
  const pendingDraws = {
    ...state.pendingDraws,
    [targetPlayerId]: (state.pendingDraws[targetPlayerId] ?? 0) + 3,
  };

  const roundStates = [...normalized.roundStates];
  roundStates[roundIndex] = {
    turnOrderIndex: targetIndex >= 0 ? targetIndex : state.turnOrderIndex,
    pendingDraws,
    flipThreeSourcePlayerId: sourcePlayerId,
  };

  return { ...normalized, roundStates };
}

export function drawFlip7SecondChance(
  session: Flip7Session,
  roundIndex: number,
  playerId: string,
  targetPlayerId?: string,
): Flip7Session | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const rounds = [...normalized.rounds];
  const roundByPlayer = { ...(rounds[roundIndex] ?? {}) };
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();

  if (!isFlip7PlayerActive(entry)) return null;

  if (!entry.hasSecondChance) {
    roundByPlayer[playerId] = { ...entry, hasSecondChance: true };
  } else {
    const candidates = getFlip7ActiveTargetCandidates(
      turnOrder,
      roundByPlayer,
      playerId,
      (targetEntry) => !targetEntry.hasSecondChance,
    );
    const resolvedTargetId = resolveFlip7TargetPlayerId(
      targetPlayerId
        ? candidates.filter((p) => p.id === targetPlayerId)
        : candidates,
      playerId,
    );
    const targetEntry =
      roundByPlayer[resolvedTargetId] ?? emptyFlip7RoundEntry();
    if (!isFlip7PlayerActive(targetEntry) || targetEntry.hasSecondChance) {
      return null;
    }
    roundByPlayer[resolvedTargetId] = {
      ...targetEntry,
      hasSecondChance: true,
    };
  }

  rounds[roundIndex] = roundByPlayer;

  const roundStates = [...normalized.roundStates];
  roundStates[roundIndex] = advanceFlip7TurnAfterCard(
    getFlip7RoundState(normalized, roundIndex),
    turnOrder,
    roundByPlayer,
    playerId,
  );

  return { ...normalized, rounds, roundStates };
}

export function setFlip7PlayerStatusWithTurn(
  session: Flip7Session,
  roundIndex: number,
  playerId: string,
  status: Flip7RoundEntry['status'],
): Flip7Session | null {
  const normalized = normalizeFlip7Session(session);
  if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return null;

  const turnOrder = getFlip7PlayersInTurnOrder(normalized.players, roundIndex);
  const rounds = [...normalized.rounds];
  const roundByPlayer = { ...(rounds[roundIndex] ?? {}) };
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();

  roundByPlayer[playerId] = {
    ...entry,
    status,
    ...(status === 'active' ? { closedScore: undefined } : {}),
  };
  rounds[roundIndex] = roundByPlayer;

  const roundStates = [...normalized.roundStates];
  if (status !== 'active') {
    roundStates[roundIndex] = advanceFlip7TurnAfterCard(
      getFlip7RoundState(normalized, roundIndex),
      turnOrder,
      roundByPlayer,
      playerId,
    );
  }

  return { ...normalized, rounds, roundStates };
}
