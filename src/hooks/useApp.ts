import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSavedPlayer,
  loadAppData,
  saveAppData,
} from '../storage';
import {
  AppData,
  AppScreen,
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenPlayerScoring,
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
  AventurerosTrenSubmode,
  GameSettings,
  Match,
  MatchTemplate,
  PelusasSession,
  PlaySession,
  Player,
  SkullKingRoundEntry,
  SkullKingSession,
  PiliPiliRoundConfig,
  PiliPiliRoundEntry,
  PiliPiliSession,
  Flip7Modifier,
  Flip7Session,
  RoundBreakdown,
  RoundScores,
  SavedPlayer,
  ScoringMode,
} from '../types';
import {
  PlayerSelectionConfig,
  PlayerSelectionDraftKey,
} from '../types/playerSelection';
import {
  checkGameOver,
  createId,
  normalizeSettings,
} from '../utils/game';
import {
  createMatch,
  createWinnerOnlyMatch,
  getInProgressMatches,
  getRecentFinishedMatches,
  getRecentPlayers,
  matchToGameState,
  pickPlayerColor,
} from '../utils/match';
import {
  createPlayerGroup,
  removePlayerFromGroups,
  removePlayersFromGroups,
} from '../utils/groups';
import {
  createPlaySession,
  getActiveSessions,
  getRecentSessions,
} from '../utils/session';
import { isAnonymousPlayer } from '../utils/playerSelection';
import {
  RECENT_FINISHED_MATCHES_LIMIT,
  RECENT_PLAYERS_HOME_LIMIT,
  RECENT_SESSIONS_HOME_LIMIT,
} from '../constants';
import { sumBreakdownItems } from '../utils/scoring';
import {
  emptyRoundBreakdown,
  emptyRoundScores,
  normalizeMatchRounds,
} from '../utils/rounds';
import {
  createFinishedPelusasMatch,
  createInProgressPelusasMatch,
  createPelusasCountsByPlayer,
  emptyPelusasCounts,
  getPelusasCardValues,
  pelusasCardKey,
} from '../utils/pelusas';
import {
  createFinishedSkullKingMatch,
  createInProgressSkullKingMatch,
  createSkullKingSession,
  emptySkullKingRoundEntry,
} from '../utils/skullKing';
import {
  appendPiliPiliRound,
  applyPiliPiliFirstLastTrickExclusivity,
  clampPiliPiliRoundEntry,
  createFinishedPiliPiliMatch,
  createInProgressPiliPiliMatch,
  createPiliPiliSession,
  emptyPiliPiliRoundConfig,
  emptyPiliPiliRoundEntry,
  getPiliPiliMaxBid,
  hasPiliPiliRoundErrors,
  sanitizePiliPiliRoundBids,
  PILI_PILI_MAX_PLAYERS,
  PILI_PILI_MIN_PLAYERS,
} from '../utils/piliPili';
import {
  appendFlip7Round,
  clearFlip7PlayerRound,
  createFinishedFlip7Match,
  createFlip7Session,
  createInProgressFlip7Match,
  FLIP7_MIN_PLAYERS,
  normalizeFlip7Session,
  toggleFlip7PlayerModifier,
  toggleFlip7PlayerNumber,
} from '../utils/flip7';
import {
  createAventurerosTrenDestinationEntry,
  createAventurerosTrenRouteEntry,
  createAventurerosTrenSession,
  createDefaultPlayerScoring,
  createFinishedAventurerosTrenMatch,
  createInProgressAventurerosTrenMatch,
  AVENTUREROS_TREN_MAX_PLAYERS,
  AVENTUREROS_TREN_MIN_PLAYERS,
} from '../utils/aventurerosTren';
import {
  createRegicideMatch,
  createRegicideSession,
  RegicideSession,
} from '../utils/regicide';

function patchActiveRound(
  match: Match,
  patch: (
    round: RoundScores,
    breakdown: RoundBreakdown,
  ) => { round: RoundScores; breakdown: RoundBreakdown },
): Match {
  const m = normalizeMatchRounds(match);
  const idx = m.activeRoundIndex;
  const rounds = [...m.rounds];
  const roundBreakdowns = [...m.roundBreakdowns];
  const result = patch(
    { ...rounds[idx] },
    { ...(roundBreakdowns[idx] ?? emptyRoundBreakdown()) },
  );
  rounds[idx] = result.round;
  roundBreakdowns[idx] = result.breakdown;
  return { ...m, rounds, roundBreakdowns };
}

function touchPlayer(
  players: SavedPlayer[],
  playerId: string,
): SavedPlayer[] {
  const now = Date.now();
  return players.map((p) =>
    p.id === playerId ? { ...p, lastUsedAt: now } : p,
  );
}

function upsertSavedPlayer(
  players: SavedPlayer[],
  player: Player,
): SavedPlayer[] {
  const existing = players.find((p) => p.id === player.id);
  if (existing) {
    return touchPlayer(
      players.map((p) =>
        p.id === player.id
          ? { ...p, name: player.name, color: player.color }
          : p,
      ),
      player.id,
    );
  }
  return [
    ...players,
    { ...player, lastUsedAt: Date.now() },
  ];
}

function upsertRosterPlayers(
  players: SavedPlayer[],
  roster: Player[],
): SavedPlayer[] {
  return roster.reduce(
    (acc, player) =>
      isAnonymousPlayer(player) ? acc : upsertSavedPlayer(acc, player),
    players,
  );
}

function updateMatchInData(
  data: AppData,
  matchId: string,
  updater: (match: Match) => Match,
): AppData {
  return {
    ...data,
    matches: data.matches.map((m) =>
      m.id === matchId ? updater({ ...m, updatedAt: Date.now() }) : m,
    ),
  };
}

function touchSession(data: AppData, sessionId: string): AppData {
  const now = Date.now();
  return {
    ...data,
    sessions: data.sessions.map((s) =>
      s.id === sessionId ? { ...s, updatedAt: now } : s,
    ),
  };
}

function appendMatch(data: AppData, match: Match): AppData {
  let next: AppData = {
    ...data,
    matches: [...data.matches, match],
  };
  if (match.sessionId) {
    next = touchSession(next, match.sessionId);
  }
  return next;
}

export function useApp() {
  const [data, setData] = useState<AppData>({
    players: [],
    groups: [],
    matches: [],
    templates: [],
    sessions: [],
  });
  const [screen, setScreen] = useState<AppScreen>({ type: 'home' });
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pelusasSession, setPelusasSession] = useState<PelusasSession | null>(
    null,
  );
  const [skullKingSession, setSkullKingSession] =
    useState<SkullKingSession | null>(null);
  const [piliPiliSession, setPiliPiliSession] =
    useState<PiliPiliSession | null>(null);
  const [flip7Session, setFlip7Session] = useState<Flip7Session | null>(null);
  const [aventurerosTrenSession, setAventurerosTrenSession] =
    useState<AventurerosTrenSession | null>(null);
  const [regicideSession, setRegicideSession] =
    useState<RegicideSession | null>(null);
  const dedicatedMatchSessionIdRef = useRef<string | null>(null);
  const dedicatedMatchIdRef = useRef<string | null>(null);
  const regicideMatchIdRef = useRef<string | null>(null);
  const playerSelectionRef = useRef<PlayerSelectionConfig | null>(null);
  const returningDraftRef = useRef<{
    key: PlayerSelectionDraftKey;
    data: unknown;
  } | null>(null);

  useEffect(() => {
    loadAppData().then((saved) => {
      setData(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveAppData(data);
    }
  }, [data, loaded]);

  const navigateAfterDedicatedExit = useCallback((playSessionId: string | null) => {
    if (playSessionId) {
      setScreen({ type: 'sessionDetail', sessionId: playSessionId });
    } else {
      setScreen({ type: 'home' });
    }
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const matchId = dedicatedMatchIdRef.current;
    if (!matchId || !pelusasSession) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) =>
        match.gameMode === 'pelusas'
          ? {
              ...match,
              pelusasSession,
              pelusasRevolution: pelusasSession.revolutionMode,
              players: pelusasSession.players,
              status: 'in_progress',
              updatedAt: Date.now(),
            }
          : match,
      ),
    );
  }, [pelusasSession]);

  useEffect(() => {
    const matchId = dedicatedMatchIdRef.current;
    if (!matchId || !skullKingSession) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) =>
        match.gameMode === 'skull_king'
          ? {
              ...match,
              skullKingSession,
              players: skullKingSession.players,
              activeRoundIndex: skullKingSession.activeRoundIndex,
              status: 'in_progress',
              updatedAt: Date.now(),
            }
          : match,
      ),
    );
  }, [skullKingSession]);

  useEffect(() => {
    const matchId = dedicatedMatchIdRef.current;
    if (!matchId || !piliPiliSession) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) =>
        match.gameMode === 'pili_pili'
          ? {
              ...match,
              piliPiliSession,
              players: piliPiliSession.players,
              activeRoundIndex: piliPiliSession.activeRoundIndex,
              status: 'in_progress',
              updatedAt: Date.now(),
            }
          : match,
      ),
    );
  }, [piliPiliSession]);

  useEffect(() => {
    const matchId = dedicatedMatchIdRef.current;
    if (!matchId || !flip7Session) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) =>
        match.gameMode === 'flip7'
          ? {
              ...match,
              flip7Session,
              players: flip7Session.players,
              activeRoundIndex: flip7Session.activeRoundIndex,
              status: 'in_progress',
              updatedAt: Date.now(),
            }
          : match,
      ),
    );
  }, [flip7Session]);

  useEffect(() => {
    const matchId = dedicatedMatchIdRef.current;
    if (!matchId || !aventurerosTrenSession) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) =>
        match.gameMode === 'aventureros_tren'
          ? {
              ...match,
              aventurerosTrenSession,
              aventurerosTrenSubmode: aventurerosTrenSession.submode,
              players: aventurerosTrenSession.players,
              status: 'in_progress',
              updatedAt: Date.now(),
            }
          : match,
      ),
    );
  }, [aventurerosTrenSession]);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const goHome = useCallback(() => {
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const goCreateMatch = useCallback((templateId?: string) => {
    dedicatedMatchSessionIdRef.current = null;
    setScreen({ type: 'createMatch', templateId });
    setMenuOpen(false);
  }, []);

  const playTemplate = useCallback((templateId: string) => {
    setScreen({ type: 'createMatch', templateId });
    setMenuOpen(false);
  }, []);

  const goPelusasSetup = useCallback((keepSession = false) => {
    if (!keepSession) {
      setPelusasSession(null);
    }
    setScreen({ type: 'pelusasSetup' });
    setMenuOpen(false);
  }, []);

  const exitPelusas = useCallback(() => {
    setPelusasSession(null);
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const startPelusasSession = useCallback(
    (players: Player[], sessionId?: string | null) => {
      if (players.length < 1) return;
      if (sessionId !== undefined) {
        dedicatedMatchSessionIdRef.current = sessionId;
      }
      const playSessionId = dedicatedMatchSessionIdRef.current;
      const session: PelusasSession = {
        players,
        revolutionMode: false,
        countsByPlayer: createPelusasCountsByPlayer(players, false),
      };
      const match = createInProgressPelusasMatch(session, playSessionId);
      dedicatedMatchIdRef.current = match.id;
      setData((prev) => ({
        ...prev,
        players: upsertRosterPlayers(prev.players, players),
        matches: [...prev.matches, match],
      }));
      setPelusasSession(session);
      setScreen({ type: 'pelusasCount' });
    },
    [],
  );

  const updatePelusasPlayers = useCallback((players: Player[]) => {
    if (players.length < 1) return;
    setData((prev) => ({
      ...prev,
      players: upsertRosterPlayers(prev.players, players),
    }));
    setPelusasSession((prev) => {
      if (!prev) {
        return {
          players,
          revolutionMode: false,
          countsByPlayer: createPelusasCountsByPlayer(players, false),
        };
      }
      const revolutionMode = prev.revolutionMode;
      const countsByPlayer = createPelusasCountsByPlayer(
        players,
        revolutionMode,
      );
      for (const player of players) {
        const previous = prev.countsByPlayer[player.id];
        if (!previous) continue;
        const merged = { ...countsByPlayer[player.id] };
        for (const [key, qty] of Object.entries(previous)) {
          merged[key] = qty;
        }
        countsByPlayer[player.id] = merged;
      }
      return { players, revolutionMode, countsByPlayer };
    });
    setScreen({ type: 'pelusasCount' });
  }, []);

  const setPelusasRevolutionMode = useCallback((enabled: boolean) => {
    setPelusasSession((prev) => {
      if (!prev) return null;
      const countsByPlayer: PelusasSession['countsByPlayer'] = {};
      for (const player of prev.players) {
        const existing = prev.countsByPlayer[player.id] ?? {};
        const next: Record<string, number> = { ...existing };
        for (const value of getPelusasCardValues(enabled)) {
          const key = pelusasCardKey(value);
          if (next[key] == null) {
            next[key] = 0;
          }
        }
        countsByPlayer[player.id] = next;
      }
      return { ...prev, revolutionMode: enabled, countsByPlayer };
    });
  }, []);

  const setPelusasCardCount = useCallback(
    (playerId: string, cardValue: number, count: number) => {
      setPelusasSession((prev) => {
        if (!prev) return null;
        const key = pelusasCardKey(cardValue);
        return {
          ...prev,
          countsByPlayer: {
            ...prev.countsByPlayer,
            [playerId]: {
              ...(prev.countsByPlayer[playerId] ??
                emptyPelusasCounts(prev.revolutionMode)),
              [key]: Math.max(0, Math.floor(count)),
            },
          },
        };
      });
    },
    [],
  );

  const resetPelusasCounts = useCallback(() => {
    setPelusasSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        countsByPlayer: createPelusasCountsByPlayer(
          prev.players,
          prev.revolutionMode,
        ),
      };
    });
  }, []);

  const finishPelusasSession = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPelusasSession((prev) => {
      if (!prev) return null;
      const finished = createFinishedPelusasMatch(prev);
      const id = matchId ?? finished.id;
      setData((data) => {
        const base = {
          ...data,
          players: upsertRosterPlayers(data.players, prev.players),
        };
        if (matchId) {
          return updateMatchInData(base, matchId, (match) => ({
            ...finished,
            id: matchId,
            sessionId: match.sessionId ?? playSessionId ?? null,
            createdAt: match.createdAt,
            pelusasSession: undefined,
          }));
        }
        return appendMatch(base, {
          ...finished,
          sessionId: playSessionId ?? null,
        });
      });
      setScreen({ type: 'game', matchId: id });
      return null;
    });
  }, []);

  const savePelusasAndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPelusasSession(null);
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const deletePelusasAndExit = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPelusasSession(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const startSkullKingSession = useCallback(
    (players: Player[], sessionId?: string | null) => {
      if (players.length < 1 || players.length > 6) {
        return;
      }
      if (sessionId !== undefined) {
        dedicatedMatchSessionIdRef.current = sessionId;
      }
      const playSessionId = dedicatedMatchSessionIdRef.current;
      const session = createSkullKingSession(players);
      const match = createInProgressSkullKingMatch(session, playSessionId);
      dedicatedMatchIdRef.current = match.id;
      setData((prev) => ({
        ...prev,
        players: upsertRosterPlayers(prev.players, players),
        matches: [...prev.matches, match],
      }));
      setSkullKingSession(session);
      setScreen({ type: 'skullKingCount' });
    },
    [],
  );

  const saveSkullKingAndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setSkullKingSession(null);
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const deleteSkullKingAndExit = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setSkullKingSession(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const exitSkullKing = useCallback(() => {
    setSkullKingSession(null);
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const goSkullKingRound = useCallback((roundIndex: number) => {
    setSkullKingSession((prev) => {
      if (!prev) return null;
      if (roundIndex < 0 || roundIndex >= prev.rounds.length) return prev;
      return { ...prev, activeRoundIndex: roundIndex };
    });
  }, []);

  const updateSkullKingRoundEntry = useCallback(
    (
      roundIndex: number,
      playerId: string,
      patch: Partial<SkullKingRoundEntry>,
    ) => {
      setSkullKingSession((prev) => {
        if (!prev) return null;
        if (roundIndex < 0 || roundIndex >= prev.rounds.length) return prev;
        const rounds = [...prev.rounds];
        const round = { ...rounds[roundIndex] };
        const entry = {
          ...(round[playerId] ?? emptySkullKingRoundEntry()),
          ...patch,
          entered: true,
        };
        const roundNumber = roundIndex + 1;
        entry.bid = Math.min(
          Math.max(0, Math.floor(entry.bid)),
          roundNumber,
        );
        entry.tricksWon = Math.min(
          Math.max(0, Math.floor(entry.tricksWon)),
          roundNumber,
        );
        entry.goldBonusPoints = Math.max(
          0,
          Math.floor(entry.goldBonusPoints),
        );
        entry.pirateCount = Math.max(0, Math.floor(entry.pirateCount));
        round[playerId] = entry;
        rounds[roundIndex] = round;
        return { ...prev, rounds };
      });
    },
    [],
  );

  const finishSkullKingSession = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setSkullKingSession((prev) => {
      if (!prev) return null;
      const finished = createFinishedSkullKingMatch(prev);
      const id = matchId ?? finished.id;
      setData((data) => {
        const base = {
          ...data,
          players: upsertRosterPlayers(data.players, prev.players),
        };
        if (matchId) {
          return updateMatchInData(base, matchId, (match) => ({
            ...finished,
            id: matchId,
            sessionId: match.sessionId ?? playSessionId ?? null,
            createdAt: match.createdAt,
            skullKingSession: undefined,
          }));
        }
        return appendMatch(base, {
          ...finished,
          sessionId: playSessionId ?? null,
        });
      });
      setScreen({ type: 'game', matchId: id });
      return null;
    });
  }, []);

  const startPiliPiliSession = useCallback(
    (players: Player[], sessionId?: string | null) => {
      if (
        players.length < PILI_PILI_MIN_PLAYERS ||
        players.length > PILI_PILI_MAX_PLAYERS
      ) {
        return;
      }
      if (sessionId !== undefined) {
        dedicatedMatchSessionIdRef.current = sessionId;
      }
      const playSessionId = dedicatedMatchSessionIdRef.current;
      const session = createPiliPiliSession(players);
      const match = createInProgressPiliPiliMatch(session, playSessionId);
      dedicatedMatchIdRef.current = match.id;
      setData((prev) => ({
        ...prev,
        players: upsertRosterPlayers(prev.players, players),
        matches: [...prev.matches, match],
      }));
      setPiliPiliSession(session);
      setScreen({ type: 'piliPiliCount' });
    },
    [],
  );

  const savePiliPiliAndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPiliPiliSession(null);
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const deletePiliPiliAndExit = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPiliPiliSession(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const exitPiliPili = useCallback(() => {
    setPiliPiliSession(null);
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const goPiliPiliRound = useCallback((roundIndex: number) => {
    setPiliPiliSession((prev) => {
      if (!prev) return null;
      if (roundIndex < 0 || roundIndex >= prev.rounds.length) return prev;
      return { ...prev, activeRoundIndex: roundIndex };
    });
  }, []);

  const updatePiliPiliRoundEntry = useCallback(
    (
      roundIndex: number,
      playerId: string,
      patch: Partial<PiliPiliRoundEntry>,
    ) => {
      setPiliPiliSession((prev) => {
        if (!prev) return null;
        if (roundIndex < 0 || roundIndex >= prev.rounds.length) return prev;
        const rounds = [...prev.rounds];
        let round = { ...rounds[roundIndex] };
        round = applyPiliPiliFirstLastTrickExclusivity(
          round,
          prev.players,
          playerId,
          patch,
        );
        const config =
          prev.roundConfigs[roundIndex] ??
          emptyPiliPiliRoundConfig();
        const maxBid = getPiliPiliMaxBid(config);
        const previous = round[playerId] ?? emptyPiliPiliRoundEntry();
        const entry = clampPiliPiliRoundEntry(
          {
            ...previous,
            ...patch,
            entered: true,
          },
          maxBid,
        );
        round[playerId] = entry;
        rounds[roundIndex] = sanitizePiliPiliRoundBids(
          round,
          prev.players,
          config,
        );
        return { ...prev, rounds };
      });
    },
    [],
  );

  const updatePiliPiliRoundConfig = useCallback(
    (roundIndex: number, patch: Partial<PiliPiliRoundConfig>) => {
      setPiliPiliSession((prev) => {
        if (!prev) return null;
        if (roundIndex < 0 || roundIndex >= prev.roundConfigs.length) {
          return prev;
        }
        const roundConfigs = [...prev.roundConfigs];
        const next = {
          ...roundConfigs[roundIndex],
          ...patch,
        };
        if (patch.cardsDealt !== undefined) {
          next.cardsDealt = Math.max(0, Math.floor(next.cardsDealt));
        }
        roundConfigs[roundIndex] = next;

        if (patch.cardsDealt !== undefined) {
          const rounds = [...prev.rounds];
          rounds[roundIndex] = sanitizePiliPiliRoundBids(
            rounds[roundIndex] ?? {},
            prev.players,
            next,
          );
          return { ...prev, roundConfigs, rounds };
        }

        return { ...prev, roundConfigs };
      });
    },
    [],
  );

  const addPiliPiliRound = useCallback(() => {
    setPiliPiliSession((prev) => {
      if (!prev) return null;
      const activeRound = prev.rounds[prev.activeRoundIndex] ?? {};
      const activeConfig =
        prev.roundConfigs[prev.activeRoundIndex] ??
        emptyPiliPiliRoundConfig();
      if (
        hasPiliPiliRoundErrors(
          activeRound,
          prev.players,
          activeConfig,
          prev.activeRoundIndex,
        )
      ) {
        return prev;
      }
      return appendPiliPiliRound(prev);
    });
  }, []);

  const finishPiliPiliSession = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setPiliPiliSession((prev) => {
      if (!prev) return null;
      const finished = createFinishedPiliPiliMatch(prev);
      const id = matchId ?? finished.id;
      setData((data) => {
        const base = {
          ...data,
          players: upsertRosterPlayers(data.players, prev.players),
        };
        if (matchId) {
          return updateMatchInData(base, matchId, (match) => ({
            ...finished,
            id: matchId,
            sessionId: match.sessionId ?? playSessionId ?? null,
            createdAt: match.createdAt,
            piliPiliSession: undefined,
          }));
        }
        return appendMatch(base, {
          ...finished,
          sessionId: playSessionId ?? null,
        });
      });
      setScreen({ type: 'game', matchId: id });
      return null;
    });
  }, []);

  const startFlip7Session = useCallback(
    (players: Player[], sessionId?: string | null) => {
      if (players.length < FLIP7_MIN_PLAYERS) {
        return;
      }
      if (sessionId !== undefined) {
        dedicatedMatchSessionIdRef.current = sessionId;
      }
      const playSessionId = dedicatedMatchSessionIdRef.current;
      const session = createFlip7Session(players);
      const match = createInProgressFlip7Match(session, playSessionId);
      dedicatedMatchIdRef.current = match.id;
      setData((prev) => ({
        ...prev,
        players: upsertRosterPlayers(prev.players, players),
        matches: [...prev.matches, match],
      }));
      setFlip7Session(session);
      setScreen({ type: 'flip7Count' });
    },
    [],
  );

  const saveFlip7AndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setFlip7Session(null);
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const deleteFlip7AndExit = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setFlip7Session(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const exitFlip7 = useCallback(() => {
    setFlip7Session(null);
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const goFlip7Round = useCallback((roundIndex: number) => {
    setFlip7Session((prev) => {
      if (!prev) return null;
      const normalized = normalizeFlip7Session(prev);
      if (roundIndex < 0 || roundIndex >= normalized.rounds.length) return normalized;
      return { ...normalized, activeRoundIndex: roundIndex };
    });
  }, []);

  const toggleFlip7RoundNumber = useCallback(
    (roundIndex: number, playerId: string, number: number) => {
      setFlip7Session((prev) => {
        if (!prev) return null;
        const normalized = normalizeFlip7Session(prev);
        if (roundIndex < 0 || roundIndex >= normalized.rounds.length) {
          return normalized;
        }
        const rounds = [...normalized.rounds];
        rounds[roundIndex] = toggleFlip7PlayerNumber(
          rounds[roundIndex] ?? {},
          playerId,
          number,
        );
        return { ...normalized, rounds };
      });
    },
    [],
  );

  const toggleFlip7RoundModifier = useCallback(
    (roundIndex: number, playerId: string, modifier: Flip7Modifier) => {
      setFlip7Session((prev) => {
        if (!prev) return null;
        const normalized = normalizeFlip7Session(prev);
        if (roundIndex < 0 || roundIndex >= normalized.rounds.length) {
          return normalized;
        }
        const rounds = [...normalized.rounds];
        rounds[roundIndex] = toggleFlip7PlayerModifier(
          rounds[roundIndex] ?? {},
          playerId,
          modifier,
        );
        return { ...normalized, rounds };
      });
    },
    [],
  );

  const clearFlip7RoundPlayer = useCallback(
    (roundIndex: number, playerId: string) => {
      setFlip7Session((prev) => {
        if (!prev) return null;
        const normalized = normalizeFlip7Session(prev);
        if (roundIndex < 0 || roundIndex >= normalized.rounds.length) {
          return normalized;
        }
        const rounds = [...normalized.rounds];
        rounds[roundIndex] = clearFlip7PlayerRound(
          rounds[roundIndex] ?? {},
          playerId,
        );
        return { ...normalized, rounds };
      });
    },
    [],
  );

  const addFlip7Round = useCallback(() => {
    setFlip7Session((prev) => {
      if (!prev) return null;
      return appendFlip7Round(prev);
    });
  }, []);

  const finishFlip7Session = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setFlip7Session((prev) => {
      if (!prev) return null;
      const finished = createFinishedFlip7Match(prev);
      const id = matchId ?? finished.id;
      setData((data) => {
        const base = {
          ...data,
          players: upsertRosterPlayers(data.players, prev.players),
        };
        if (matchId) {
          return updateMatchInData(base, matchId, (match) => ({
            ...finished,
            id: matchId,
            sessionId: match.sessionId ?? playSessionId ?? null,
            createdAt: match.createdAt,
            flip7Session: undefined,
          }));
        }
        return appendMatch(base, {
          ...finished,
          sessionId: playSessionId ?? null,
        });
      });
      setScreen({ type: 'game', matchId: id });
      return null;
    });
  }, []);

  const startAventurerosTrenSession = useCallback(
    (
      players: Player[],
      submode: AventurerosTrenSubmode = 'base',
      sessionId?: string | null,
    ) => {
      if (
        players.length < AVENTUREROS_TREN_MIN_PLAYERS ||
        players.length > AVENTUREROS_TREN_MAX_PLAYERS
      ) {
        return;
      }
      if (sessionId !== undefined) {
        dedicatedMatchSessionIdRef.current = sessionId;
      }
      const playSessionId = dedicatedMatchSessionIdRef.current;
      const session = createAventurerosTrenSession(players, submode);
      const match = createInProgressAventurerosTrenMatch(session, playSessionId);
      dedicatedMatchIdRef.current = match.id;
      setData((prev) => ({
        ...prev,
        players: upsertRosterPlayers(prev.players, players),
        matches: [...prev.matches, match],
      }));
      setAventurerosTrenSession(session);
      setScreen({ type: 'aventurerosTrenCount' });
    },
    [],
  );

  const saveAventurerosTrenAndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setAventurerosTrenSession(null);
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const deleteAventurerosTrenAndExit = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setAventurerosTrenSession(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    navigateAfterDedicatedExit(playSessionId);
  }, [navigateAfterDedicatedExit]);

  const exitAventurerosTren = useCallback(() => {
    setAventurerosTrenSession(null);
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const setAventurerosTrenPhase = useCallback((phase: AventurerosTrenPhase) => {
    setAventurerosTrenSession((prev) =>
      prev ? { ...prev, activePhase: phase } : null,
    );
  }, []);

  const addAventurerosTrenRoute = useCallback((playerId: string) => {
    setAventurerosTrenSession((prev) => {
      if (!prev) return null;
      const construccion = { ...prev.construccion };
      construccion[playerId] = [
        ...(construccion[playerId] ?? []),
        createAventurerosTrenRouteEntry(prev.submode),
      ];
      return { ...prev, construccion };
    });
  }, []);

  const updateAventurerosTrenRoute = useCallback(
    (
      playerId: string,
      routeId: string,
      patch: Partial<AventurerosTrenRouteEntry>,
    ) => {
      setAventurerosTrenSession((prev) => {
        if (!prev) return null;
        const construccion = { ...prev.construccion };
        construccion[playerId] = (construccion[playerId] ?? []).map((r) =>
          r.id === routeId ? { ...r, ...patch } : r,
        );
        return { ...prev, construccion };
      });
    },
    [],
  );

  const removeAventurerosTrenRoute = useCallback(
    (playerId: string, routeId: string) => {
      setAventurerosTrenSession((prev) => {
        if (!prev) return null;
        const construccion = { ...prev.construccion };
        construccion[playerId] = (construccion[playerId] ?? []).filter(
          (r) => r.id !== routeId,
        );
        return { ...prev, construccion };
      });
    },
    [],
  );

  const addAventurerosTrenDestination = useCallback((playerId: string) => {
    setAventurerosTrenSession((prev) => {
      if (!prev) return null;
      const destinos = { ...prev.destinos };
      destinos[playerId] = [
        ...(destinos[playerId] ?? []),
        createAventurerosTrenDestinationEntry(),
      ];
      return { ...prev, destinos };
    });
  }, []);

  const updateAventurerosTrenDestination = useCallback(
    (
      playerId: string,
      destId: string,
      patch: Partial<AventurerosTrenDestinationEntry>,
    ) => {
      setAventurerosTrenSession((prev) => {
        if (!prev) return null;
        const destinos = { ...prev.destinos };
        destinos[playerId] = (destinos[playerId] ?? []).map((d) =>
          d.id === destId ? { ...d, ...patch } : d,
        );
        return { ...prev, destinos };
      });
    },
    [],
  );

  const removeAventurerosTrenDestination = useCallback(
    (playerId: string, destId: string) => {
      setAventurerosTrenSession((prev) => {
        if (!prev) return null;
        const destinos = { ...prev.destinos };
        destinos[playerId] = (destinos[playerId] ?? []).filter(
          (d) => d.id !== destId,
        );
        return { ...prev, destinos };
      });
    },
    [],
  );

  const updateAventurerosTrenPlayerScoring = useCallback(
    (playerId: string, patch: Partial<AventurerosTrenPlayerScoring>) => {
      setAventurerosTrenSession((prev) => {
        if (!prev) return null;
        const scoring = { ...prev.scoring };
        const current =
          scoring[playerId] ?? createDefaultPlayerScoring(prev.submode);
        const next = { ...current, ...patch };

        if (patch.hasLongestRouteBonus === true) {
          for (const id of prev.players.map((p) => p.id)) {
            if (id === playerId) continue;
            scoring[id] = {
              ...(scoring[id] ?? createDefaultPlayerScoring(prev.submode)),
              hasLongestRouteBonus: false,
            };
          }
        }

        scoring[playerId] = next;
        return { ...prev, scoring };
      });
    },
    [],
  );

  const finishAventurerosTrenSession = useCallback(() => {
    const matchId = dedicatedMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    dedicatedMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setAventurerosTrenSession((prev) => {
      if (!prev) return null;
      const finished = createFinishedAventurerosTrenMatch(prev);
      const id = matchId ?? finished.id;
      setData((data) => {
        const base = {
          ...data,
          players: upsertRosterPlayers(data.players, prev.players),
        };
        if (matchId) {
          return updateMatchInData(base, matchId, (match) => ({
            ...finished,
            id: matchId,
            sessionId: match.sessionId ?? playSessionId ?? null,
            createdAt: match.createdAt,
            aventurerosTrenSession: undefined,
          }));
        }
        return appendMatch(base, {
          ...finished,
          sessionId: playSessionId ?? null,
        });
      });
      setScreen({ type: 'game', matchId: id });
      return null;
    });
  }, []);

  const startRegicideSession = useCallback((sessionId?: string | null) => {
    if (sessionId !== undefined) {
      dedicatedMatchSessionIdRef.current = sessionId;
    }
    const playSessionId = dedicatedMatchSessionIdRef.current;
    const session = createRegicideSession();
    const match = createRegicideMatch(session, playSessionId);
    regicideMatchIdRef.current = match.id;
    setRegicideSession(session);
    setData((prev) => appendMatch(prev, match));
    setScreen({ type: 'regicideCount' });
    setMenuOpen(false);
  }, []);

  const saveRegicideAndExit = useCallback(() => {
    const playSessionId = dedicatedMatchSessionIdRef.current;
    regicideMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setRegicideSession(null);
    if (playSessionId) {
      setScreen({ type: 'sessionDetail', sessionId: playSessionId });
    } else {
      setScreen({ type: 'home' });
    }
    setMenuOpen(false);
  }, []);

  const deleteRegicideAndExit = useCallback(() => {
    const matchId = regicideMatchIdRef.current;
    const playSessionId = dedicatedMatchSessionIdRef.current;
    regicideMatchIdRef.current = null;
    dedicatedMatchSessionIdRef.current = null;
    setRegicideSession(null);
    if (matchId) {
      setData((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        let next: AppData = {
          ...prev,
          matches: prev.matches.filter((m) => m.id !== matchId),
        };
        if (match?.sessionId) {
          next = touchSession(next, match.sessionId);
        }
        return next;
      });
    }
    if (playSessionId) {
      setScreen({ type: 'sessionDetail', sessionId: playSessionId });
    } else {
      setScreen({ type: 'home' });
    }
    setMenuOpen(false);
  }, []);

  const updateRegicideSession = useCallback((session: RegicideSession) => {
    setRegicideSession(session);
    const matchId = regicideMatchIdRef.current;
    if (!matchId) return;
    setData((prev) =>
      updateMatchInData(prev, matchId, (match) => ({
        ...match,
        regicideSession: session,
        status: session.victory ? 'finished' : 'in_progress',
        updatedAt: Date.now(),
      })),
    );
  }, []);

  const goMatchesList = useCallback(() => {
    setScreen({ type: 'matchesList' });
    setMenuOpen(false);
  }, []);

  const goPlayersList = useCallback(() => {
    setScreen({ type: 'playersList' });
    setMenuOpen(false);
  }, []);

  const goTemplatesList = useCallback(() => {
    setScreen({ type: 'templatesList' });
    setMenuOpen(false);
  }, []);

  const goSessionsList = useCallback(() => {
    setScreen({ type: 'sessionsList' });
    setMenuOpen(false);
  }, []);

  const openSelectPlayers = useCallback((config: PlayerSelectionConfig) => {
    playerSelectionRef.current = config;
    setScreen({ type: 'selectPlayers' });
  }, []);

  const getPlayerSelectionConfig = useCallback(
    () => playerSelectionRef.current,
    [],
  );

  const cancelSelectPlayers = useCallback(() => {
    const config = playerSelectionRef.current;
    if (!config) return;
    returningDraftRef.current = {
      key: config.draftKey,
      data: config.parentDraft,
    };
    playerSelectionRef.current = null;
    setScreen(config.returnScreen);
  }, []);

  const confirmSelectPlayers = useCallback((players: Player[]) => {
    const config = playerSelectionRef.current;
    if (!config) return;
    returningDraftRef.current = {
      key: config.draftKey,
      data: { ...(config.parentDraft as object), players },
    };
    playerSelectionRef.current = null;
    setScreen(config.returnScreen);
  }, []);

  const consumeReturningDraft = useCallback(
    <T,>(key: PlayerSelectionDraftKey): T | null => {
      if (returningDraftRef.current?.key !== key) return null;
      const data = returningDraftRef.current.data as T;
      returningDraftRef.current = null;
      return data;
    },
    [],
  );

  const createSavedPlayerForSelection = useCallback((name: string): Player | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let result: Player | null = null;
    setData((prev) => {
      const duplicate = prev.players.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) return prev;
      const saved = createSavedPlayer(trimmed, prev.players);
      result = { id: saved.id, name: saved.name, color: saved.color };
      return { ...prev, players: [...prev.players, saved] };
    });
    return result;
  }, []);

  const goCreateSession = useCallback((returnTo: 'home' | 'sessionsList' = 'home') => {
    setScreen({ type: 'createSession', returnTo });
    setMenuOpen(false);
  }, []);

  const goSessionDetail = useCallback((sessionId: string) => {
    setScreen({ type: 'sessionDetail', sessionId });
    setMenuOpen(false);
  }, []);

  const goCreateSessionMatch = useCallback((sessionId: string) => {
    dedicatedMatchSessionIdRef.current = sessionId;
    setScreen({ type: 'createSessionMatch', sessionId });
  }, []);

  const goCreateWinnerMatch = useCallback((sessionId: string) => {
    setScreen({ type: 'createWinnerMatch', sessionId });
  }, []);

  const getSession = useCallback(
    (sessionId: string) => data.sessions.find((s) => s.id === sessionId),
    [data.sessions],
  );

  const createSession = useCallback((name: string) => {
    const session = createPlaySession(name);
    setData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }));
    return session.id;
  }, []);

  const closeSession = useCallback((sessionId: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'closed' as const, updatedAt: Date.now() }
          : s,
      ),
    }));
  }, []);

  const reopenSession = useCallback((sessionId: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'active' as const, updatedAt: Date.now() }
          : s,
      ),
    }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
      matches: prev.matches.map((m) =>
        m.sessionId === sessionId ? { ...m, sessionId: null } : m,
      ),
    }));
    setScreen((current) => {
      if (
        (current.type === 'sessionDetail' ||
          current.type === 'createSessionMatch' ||
          current.type === 'createWinnerMatch') &&
        current.sessionId === sessionId
      ) {
        return { type: 'sessionsList' };
      }
      return current;
    });
  }, []);

  const goEditTemplate = useCallback((templateId?: string) => {
    setScreen({ type: 'editTemplate', templateId });
    setMenuOpen(false);
  }, []);

  const openMatch = useCallback(
    (matchId: string) => {
      const match = data.matches.find((m) => m.id === matchId);
      if (!match) return;

      if (match.gameMode === 'regicide' && match.regicideSession) {
        regicideMatchIdRef.current = matchId;
        dedicatedMatchSessionIdRef.current = match.sessionId ?? null;
        setRegicideSession(match.regicideSession);
        setScreen({ type: 'regicideCount' });
        setMenuOpen(false);
        return;
      }

      if (match.status === 'in_progress') {
        dedicatedMatchIdRef.current = matchId;
        dedicatedMatchSessionIdRef.current = match.sessionId ?? null;

        if (match.gameMode === 'pelusas' && match.pelusasSession) {
          setPelusasSession(match.pelusasSession);
          setScreen({ type: 'pelusasCount' });
          setMenuOpen(false);
          return;
        }
        if (match.gameMode === 'skull_king' && match.skullKingSession) {
          setSkullKingSession(match.skullKingSession);
          setScreen({ type: 'skullKingCount' });
          setMenuOpen(false);
          return;
        }
        if (match.gameMode === 'pili_pili' && match.piliPiliSession) {
          setPiliPiliSession(match.piliPiliSession);
          setScreen({ type: 'piliPiliCount' });
          setMenuOpen(false);
          return;
        }
        if (match.gameMode === 'flip7' && match.flip7Session) {
          setFlip7Session(normalizeFlip7Session(match.flip7Session));
          setScreen({ type: 'flip7Count' });
          setMenuOpen(false);
          return;
        }
        if (
          match.gameMode === 'aventureros_tren' &&
          match.aventurerosTrenSession
        ) {
          setAventurerosTrenSession(match.aventurerosTrenSession);
          setScreen({ type: 'aventurerosTrenCount' });
          setMenuOpen(false);
          return;
        }
      }

      setScreen({ type: 'game', matchId });
      setMenuOpen(false);
    },
    [data.matches],
  );

  const removeSavedPlayer = useCallback((playerId: string) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
      groups: removePlayerFromGroups(prev.groups, playerId),
      templates: prev.templates.map((t) => ({
        ...t,
        playerIds: t.playerIds.filter((id) => id !== playerId),
      })),
    }));
  }, []);

  const removeSavedPlayers = useCallback((playerIds: string[]) => {
    const ids = new Set(playerIds);
    if (ids.size === 0) return;
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => !ids.has(p.id)),
      groups: removePlayersFromGroups(prev.groups, playerIds),
      templates: prev.templates.map((t) => ({
        ...t,
        playerIds: t.playerIds.filter((id) => !ids.has(id)),
      })),
    }));
  }, []);

  const createPlayerGroupByName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let result: string | null = null;
    setData((prev) => {
      const duplicate = prev.groups.some(
        (group) => group.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) return prev;
      const group = createPlayerGroup(trimmed);
      result = group.id;
      return {
        ...prev,
        groups: [...prev.groups, group],
      };
    });
    return result;
  }, []);

  const updatePlayerGroup = useCallback(
    (
      groupId: string,
      patch: { name?: string; playerIds?: string[] },
    ) => {
      setData((prev) => ({
        ...prev,
        groups: prev.groups.map((group) => {
          if (group.id !== groupId) return group;
          const nextName =
            patch.name !== undefined ? patch.name.trim() : group.name;
          if (!nextName) return group;
          const nextPlayerIds =
            patch.playerIds !== undefined
              ? [...new Set(patch.playerIds)]
              : group.playerIds;
          return {
            ...group,
            name: nextName,
            playerIds: nextPlayerIds,
            updatedAt: Date.now(),
          };
        }),
      }));
    },
    [],
  );

  const deletePlayerGroup = useCallback((groupId: string) => {
    setData((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== groupId),
    }));
  }, []);

  const deletePlayerGroups = useCallback((groupIds: string[]) => {
    const ids = new Set(groupIds);
    if (ids.size === 0) return;
    setData((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => !ids.has(group.id)),
    }));
  }, []);

  const updateSavedPlayer = useCallback(
    (playerId: string, patch: { name: string; color: string }): boolean => {
      const trimmed = patch.name.trim();
      if (!trimmed) return false;

      let saved = false;
      setData((prev) => {
        const duplicate = prev.players.some(
          (player) =>
            player.id !== playerId &&
            player.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (duplicate) return prev;

        saved = true;
        return {
          ...prev,
          players: prev.players.map((player) =>
            player.id === playerId
              ? { ...player, name: trimmed, color: patch.color }
              : player,
          ),
          matches: prev.matches.map((match) => ({
            ...match,
            players: match.players.map((player) =>
              player.id === playerId
                ? { ...player, name: trimmed, color: patch.color }
                : player,
            ),
          })),
        };
      });
      return saved;
    },
    [],
  );

  const getTemplate = useCallback(
    (templateId: string) =>
      data.templates.find((t) => t.id === templateId),
    [data.templates],
  );

  const saveTemplate = useCallback(
    (draft: {
      id?: string;
      name: string;
      settings: GameSettings;
      playerIds: string[];
    }) => {
      const trimmed = draft.name.trim();
      if (!trimmed) return null;
      const now = Date.now();
      const settings = normalizeSettings(draft.settings);
      const playerIds = [...new Set(draft.playerIds)];

      if (draft.id) {
        let found = false;
        setData((prev) => ({
          ...prev,
          templates: prev.templates.map((t) => {
            if (t.id !== draft.id) return t;
            found = true;
            return {
              ...t,
              name: trimmed,
              settings,
              playerIds,
              updatedAt: now,
            };
          }),
        }));
        return found ? draft.id : null;
      }

      const id = createId();
      const template: MatchTemplate = {
        id,
        name: trimmed,
        settings,
        playerIds,
        createdAt: now,
        updatedAt: now,
      };
      setData((prev) => ({
        ...prev,
        templates: [...prev.templates, template],
      }));
      return id;
    },
    [],
  );

  const deleteTemplate = useCallback((templateId: string) => {
    setData((prev) => ({
      ...prev,
      templates: prev.templates.filter((t) => t.id !== templateId),
    }));
    setScreen((current) => {
      if (
        current.type === 'editTemplate' &&
        current.templateId === templateId
      ) {
        return { type: 'templatesList' };
      }
      return current;
    });
  }, []);

  const createAndStartMatch = useCallback(
    (
      players: Player[],
      settings: GameSettings,
      name?: string | null,
      sessionId?: string | null,
    ) => {
      if (players.length < 1) return null;
      const match = createMatch(players, settings, name, sessionId);
      setData((prev) =>
        appendMatch(
          {
            ...prev,
            players: upsertRosterPlayers(prev.players, players),
          },
          match,
        ),
      );
      setScreen({ type: 'game', matchId: match.id });
      return match.id;
    },
    [],
  );

  const createAndSaveWinnerMatch = useCallback(
    (
      players: Player[],
      winnerIds: string[],
      name?: string | null,
      sessionId?: string | null,
    ) => {
      if (players.length < 1 || winnerIds.length < 1) return null;
      const match = createWinnerOnlyMatch(
        players,
        winnerIds,
        name,
        sessionId,
      );
      setData((prev) =>
        appendMatch(
          {
            ...prev,
            players: upsertRosterPlayers(prev.players, players),
          },
          match,
        ),
      );
      return match.id;
    },
    [],
  );

  const deleteMatch = useCallback((matchId: string) => {
    const isActiveRegicide = regicideMatchIdRef.current === matchId;
    const isActiveDedicated = dedicatedMatchIdRef.current === matchId;
    if (isActiveRegicide) {
      regicideMatchIdRef.current = null;
      dedicatedMatchSessionIdRef.current = null;
      setRegicideSession(null);
    }
    if (isActiveDedicated) {
      dedicatedMatchIdRef.current = null;
      dedicatedMatchSessionIdRef.current = null;
      setPelusasSession(null);
      setSkullKingSession(null);
      setPiliPiliSession(null);
      setAventurerosTrenSession(null);
    }
    setData((prev) => {
      const match = prev.matches.find((m) => m.id === matchId);
      let next: AppData = {
        ...prev,
        matches: prev.matches.filter((m) => m.id !== matchId),
      };
      if (match?.sessionId) {
        next = touchSession(next, match.sessionId);
      }
      return next;
    });
    setScreen((current) => {
      if (current.type === 'game' && current.matchId === matchId) {
        return { type: 'home' };
      }
      if (current.type === 'regicideCount' && isActiveRegicide) {
        return { type: 'home' };
      }
      if (
        (current.type === 'pelusasCount' ||
          current.type === 'skullKingCount' ||
          current.type === 'piliPiliCount' ||
          current.type === 'flip7Count' ||
          current.type === 'aventurerosTrenCount') &&
        isActiveDedicated
      ) {
        return { type: 'home' };
      }
      return current;
    });
  }, []);

  const deleteMatches = useCallback((matchIds: string[]) => {
    const ids = new Set(matchIds);
    if (ids.size === 0) return;
    setData((prev) => {
      const removed = prev.matches.filter((m) => ids.has(m.id));
      let next: AppData = {
        ...prev,
        matches: prev.matches.filter((m) => !ids.has(m.id)),
      };
      for (const match of removed) {
        if (match.sessionId) {
          next = touchSession(next, match.sessionId);
        }
      }
      return next;
    });
    setScreen((current) => {
      if (current.type === 'game' && ids.has(current.matchId)) {
        return { type: 'home' };
      }
      return current;
    });
  }, []);

  const getMatch = useCallback(
    (matchId: string) => data.matches.find((m) => m.id === matchId),
    [data.matches],
  );

  const updateMatch = useCallback(
    (matchId: string, updater: (match: Match) => Match) => {
      setData((prev) => updateMatchInData(prev, matchId, updater));
    },
    [],
  );

  const goEditMatch = useCallback((matchId: string) => {
    setScreen({ type: 'editMatch', matchId });
  }, []);

  const updateMatchConfiguration = useCallback(
    (
      matchId: string,
      players: Player[],
      settings: GameSettings,
      name: string | null,
    ) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);
        const normalizedSettings = normalizeSettings(settings);

        const rounds = m.rounds.map((round) => {
          const next: RoundScores = {};
          for (const player of players) {
            next[player.id] = round[player.id] ?? 0;
          }
          return next;
        });

        const roundBreakdowns = m.roundBreakdowns.map((breakdown) => {
          const next: RoundBreakdown = {};
          for (const player of players) {
            if (breakdown[player.id]) {
              next[player.id] = breakdown[player.id];
            }
          }
          return next;
        });

        const roundScoringMode: Record<string, ScoringMode> = {};
        for (const player of players) {
          if (m.roundScoringMode[player.id]) {
            roundScoringMode[player.id] = m.roundScoringMode[player.id];
          }
        }

        return {
          ...m,
          name,
          settings: normalizedSettings,
          players,
          rounds,
          roundBreakdowns,
          roundScoringMode,
          activeRoundIndex: Math.min(
            m.activeRoundIndex,
            Math.max(0, rounds.length - 1),
          ),
        };
      });
      setScreen({ type: 'game', matchId });
    },
    [updateMatch],
  );

  const goToRound = useCallback(
    (matchId: string, roundIndex: number) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        let m = normalizeMatchRounds(match);
        if (roundIndex < 0 || roundIndex >= m.rounds.length) return m;

        if (roundIndex > m.activeRoundIndex) {
          const pointsEnd = checkGameOver(matchToGameState(m), {
            pointsThroughRoundIndex: roundIndex - 1,
          });
          if (pointsEnd.isOver && pointsEnd.reason === 'points') {
            return { ...m, activeRoundIndex: roundIndex };
          }

          if (
            m.settings.maxRounds != null &&
            roundIndex >= m.settings.maxRounds
          ) {
            return { ...m, activeRoundIndex: roundIndex };
          }
        }

        return { ...m, activeRoundIndex: roundIndex };
      });
    },
    [updateMatch],
  );

  const addNextRound = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        let m = normalizeMatchRounds(match);
        const closingIndex = m.activeRoundIndex;

        const finalize = (): Match => ({
          ...normalizeMatchRounds(m),
          status: 'finished',
          editingAfterFinish: false,
        });

        if (checkGameOver(matchToGameState(m)).isOver) {
          return finalize();
        }

        const pointsEnd = checkGameOver(matchToGameState(m), {
          pointsThroughRoundIndex: closingIndex,
        });
        if (pointsEnd.isOver && pointsEnd.reason === 'points') {
          return finalize();
        }

        if (m.settings.maxRounds != null) {
          const nextIndex = m.activeRoundIndex + 1;
          if (nextIndex >= m.settings.maxRounds) {
            m = { ...m, activeRoundIndex: nextIndex };
            return finalize();
          }
        }

        if (m.activeRoundIndex < m.rounds.length - 1) {
          m = { ...m, activeRoundIndex: m.activeRoundIndex + 1 };
        } else {
          m = {
            ...m,
            rounds: [...m.rounds, emptyRoundScores(m.players)],
            roundBreakdowns: [
              ...m.roundBreakdowns,
              emptyRoundBreakdown(),
            ],
            activeRoundIndex: m.rounds.length,
          };
        }

        if (checkGameOver(matchToGameState(m)).isOver) {
          return finalize();
        }

        return m;
      });
    },
    [updateMatch],
  );

  const adjustRoundScore = useCallback(
    (matchId: string, playerId: string, delta: number) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);
        return {
          ...patchActiveRound(m, (round, breakdown) => {
            const nextBreakdown = { ...breakdown };
            delete nextBreakdown[playerId];
            return {
              round: {
                ...round,
                [playerId]: (round[playerId] ?? 0) + delta,
              },
              breakdown: nextBreakdown,
            };
          }),
          roundScoringMode: {
            ...m.roundScoringMode,
            [playerId]: 'direct',
          },
        };
      });
    },
    [updateMatch],
  );

  const setRoundScore = useCallback(
    (matchId: string, playerId: string, value: number) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);
        return {
          ...patchActiveRound(m, (round, breakdown) => {
            const nextBreakdown = { ...breakdown };
            delete nextBreakdown[playerId];
            return {
              round: { ...round, [playerId]: value },
              breakdown: nextBreakdown,
            };
          }),
          roundScoringMode: {
            ...m.roundScoringMode,
            [playerId]: 'direct',
          },
        };
      });
    },
    [updateMatch],
  );

  const setRoundScoringMode = useCallback(
    (matchId: string, playerId: string, mode: ScoringMode) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);

        if (mode === 'breakdown') {
          return {
            ...patchActiveRound(m, (round, breakdown) => {
              const existing = breakdown[playerId] ?? [];
              const score = round[playerId] ?? 0;
              const items =
                existing.length > 0 ? existing : score !== 0 ? [score] : [];
              const total = sumBreakdownItems(items);
              return {
                round: { ...round, [playerId]: total },
                breakdown: { ...breakdown, [playerId]: items },
              };
            }),
            roundScoringMode: {
              ...m.roundScoringMode,
              [playerId]: 'breakdown',
            },
          };
        }

        return {
          ...patchActiveRound(m, (round, breakdown) => {
            const nextBreakdown = { ...breakdown };
            delete nextBreakdown[playerId];
            return { round, breakdown: nextBreakdown };
          }),
          roundScoringMode: {
            ...m.roundScoringMode,
            [playerId]: 'direct',
          },
        };
      });
    },
    [updateMatch],
  );

  const addBreakdownItem = useCallback(
    (matchId: string, playerId: string, value: number) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);
        return {
          ...patchActiveRound(m, (round, breakdown) => {
            const items = [...(breakdown[playerId] ?? []), value];
            const total = sumBreakdownItems(items);
            return {
              round: { ...round, [playerId]: total },
              breakdown: { ...breakdown, [playerId]: items },
            };
          }),
          roundScoringMode: {
            ...m.roundScoringMode,
            [playerId]: 'breakdown',
          },
        };
      });
    },
    [updateMatch],
  );

  const removeBreakdownItem = useCallback(
    (matchId: string, playerId: string, index: number) => {
      updateMatch(matchId, (match) => {
        if (match.status === 'finished') return match;
        const m = normalizeMatchRounds(match);
        return {
          ...patchActiveRound(m, (round, breakdown) => {
            const items = [...(breakdown[playerId] ?? [])];
            items.splice(index, 1);
            const total = sumBreakdownItems(items);
            return {
              round: { ...round, [playerId]: total },
              breakdown: { ...breakdown, [playerId]: items },
            };
          }),
          roundScoringMode: {
            ...m.roundScoringMode,
            [playerId]: 'breakdown',
          },
        };
      });
    },
    [updateMatch],
  );

  const markMatchFinished = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => ({
        ...match,
        status: 'finished',
        editingAfterFinish: false,
      }));
    },
    [updateMatch],
  );

  const finishMatch = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => ({
        ...normalizeMatchRounds(match),
        status: 'finished',
        editingAfterFinish: false,
      }));
    },
    [updateMatch],
  );

  const resumeMatch = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => ({
        ...match,
        status: 'in_progress',
        editingAfterFinish: true,
      }));
    },
    [updateMatch],
  );

  const repeatMatch = useCallback(
    (matchId: string) => {
      const source = data.matches.find((m) => m.id === matchId);
      if (!source) return;

      if (source.gameMode === 'pelusas') {
        const session: PelusasSession = {
          players: source.players,
          revolutionMode: Boolean(source.pelusasRevolution),
          countsByPlayer: createPelusasCountsByPlayer(
            source.players,
            Boolean(source.pelusasRevolution),
          ),
        };
        const match = createInProgressPelusasMatch(session, source.sessionId);
        dedicatedMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setPelusasSession(session);
        setData((prev) =>
          appendMatch(
            {
              ...prev,
              players: upsertRosterPlayers(prev.players, source.players),
            },
            match,
          ),
        );
        setScreen({ type: 'pelusasCount' });
        return;
      }

      if (source.gameMode === 'skull_king') {
        const session = createSkullKingSession(source.players);
        const match = createInProgressSkullKingMatch(session, source.sessionId);
        dedicatedMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setSkullKingSession(session);
        setData((prev) =>
          appendMatch(
            {
              ...prev,
              players: upsertRosterPlayers(prev.players, source.players),
            },
            match,
          ),
        );
        setScreen({ type: 'skullKingCount' });
        return;
      }

      if (source.gameMode === 'pili_pili') {
        const session = createPiliPiliSession(source.players);
        const match = createInProgressPiliPiliMatch(session, source.sessionId);
        dedicatedMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setPiliPiliSession(session);
        setData((prev) =>
          appendMatch(
            {
              ...prev,
              players: upsertRosterPlayers(prev.players, source.players),
            },
            match,
          ),
        );
        setScreen({ type: 'piliPiliCount' });
        return;
      }

      if (source.gameMode === 'flip7') {
        const session = createFlip7Session(source.players);
        const match = createInProgressFlip7Match(session, source.sessionId);
        dedicatedMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setFlip7Session(session);
        setData((prev) =>
          appendMatch(
            {
              ...prev,
              players: upsertRosterPlayers(prev.players, source.players),
            },
            match,
          ),
        );
        setScreen({ type: 'flip7Count' });
        return;
      }

      if (source.gameMode === 'aventureros_tren') {
        const session = createAventurerosTrenSession(
          source.players,
          source.aventurerosTrenSubmode ?? 'base',
        );
        const match = createInProgressAventurerosTrenMatch(
          session,
          source.sessionId,
        );
        dedicatedMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setAventurerosTrenSession(session);
        setData((prev) =>
          appendMatch(
            {
              ...prev,
              players: upsertRosterPlayers(prev.players, source.players),
            },
            match,
          ),
        );
        setScreen({ type: 'aventurerosTrenCount' });
        return;
      }

      if (source.gameMode === 'regicide') {
        const session = createRegicideSession();
        const match = createRegicideMatch(
          session,
          source.sessionId,
          source.name,
        );
        regicideMatchIdRef.current = match.id;
        dedicatedMatchSessionIdRef.current = source.sessionId ?? null;
        setRegicideSession(session);
        setData((prev) => appendMatch(prev, match));
        setScreen({ type: 'regicideCount' });
        return;
      }

      const newMatch = createMatch(source.players, source.settings, source.name);
      setData((prev) => ({
        ...prev,
        matches: [...prev.matches, newMatch],
      }));
      setScreen({ type: 'game', matchId: newMatch.id });
    },
    [data.matches],
  );

  const createPlayerForMatch = useCallback(
    (name: string, existingInMatch: Player[]) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const player: Player = {
        id: createId(),
        name: trimmed,
        color: pickPlayerColor(existingInMatch),
      };
      setData((prev) => ({
        ...prev,
        players: upsertSavedPlayer(prev.players, player),
      }));
      return player;
    },
    [],
  );

  const addPlayerFromSaved = useCallback((saved: SavedPlayer): Player => {
    setData((prev) => ({
      ...prev,
      players: touchPlayer(prev.players, saved.id),
    }));
    return {
      id: saved.id,
      name: saved.name,
      color: saved.color,
    };
  }, []);

  const inProgressMatches = getInProgressMatches(data.matches);
  const recentFinishedMatches = getRecentFinishedMatches(
    data.matches,
    RECENT_FINISHED_MATCHES_LIMIT,
    true,
  );
  const recentPlayers = getRecentPlayers(
    data.players,
    RECENT_PLAYERS_HOME_LIMIT,
  );
  const activeSessions = getActiveSessions(data.sessions);
  const recentSessions = getRecentSessions(
    data.sessions,
    RECENT_SESSIONS_HOME_LIMIT,
  );

  return {
    data,
    loaded,
    screen,
    menuOpen,
    inProgressMatches,
    recentFinishedMatches,
    recentPlayers,
    activeSessions,
    recentSessions,
    openMenu,
    closeMenu,
    goHome,
    goCreateMatch,
    playTemplate,
    pelusasSession,
    goPelusasSetup,
    exitPelusas,
    startPelusasSession,
    updatePelusasPlayers,
    setPelusasRevolutionMode,
    setPelusasCardCount,
    resetPelusasCounts,
    finishPelusasSession,
    savePelusasAndExit,
    deletePelusasAndExit,
    skullKingSession,
    startSkullKingSession,
    exitSkullKing,
    saveSkullKingAndExit,
    deleteSkullKingAndExit,
    goSkullKingRound,
    updateSkullKingRoundEntry,
    finishSkullKingSession,
    piliPiliSession,
    startPiliPiliSession,
    exitPiliPili,
    savePiliPiliAndExit,
    deletePiliPiliAndExit,
    goPiliPiliRound,
    updatePiliPiliRoundEntry,
    updatePiliPiliRoundConfig,
    addPiliPiliRound,
    finishPiliPiliSession,
    flip7Session,
    startFlip7Session,
    exitFlip7,
    saveFlip7AndExit,
    deleteFlip7AndExit,
    goFlip7Round,
    toggleFlip7RoundNumber,
    toggleFlip7RoundModifier,
    clearFlip7RoundPlayer,
    addFlip7Round,
    finishFlip7Session,
    aventurerosTrenSession,
    startAventurerosTrenSession,
    exitAventurerosTren,
    saveAventurerosTrenAndExit,
    deleteAventurerosTrenAndExit,
    setAventurerosTrenPhase,
    addAventurerosTrenRoute,
    updateAventurerosTrenRoute,
    removeAventurerosTrenRoute,
    addAventurerosTrenDestination,
    updateAventurerosTrenDestination,
    removeAventurerosTrenDestination,
    updateAventurerosTrenPlayerScoring,
    finishAventurerosTrenSession,
    regicideSession,
    startRegicideSession,
    saveRegicideAndExit,
    deleteRegicideAndExit,
    updateRegicideSession,
    goMatchesList,
    goPlayersList,
    goTemplatesList,
    goSessionsList,
    goCreateSession,
    goSessionDetail,
    goCreateSessionMatch,
    goCreateWinnerMatch,
    getSession,
    createSession,
    closeSession,
    reopenSession,
    deleteSession,
    goEditTemplate,
    getTemplate,
    saveTemplate,
    deleteTemplate,
    openMatch,
    goEditMatch,
    updateMatchConfiguration,
    createSavedPlayerForSelection,
    openSelectPlayers,
    getPlayerSelectionConfig,
    cancelSelectPlayers,
    confirmSelectPlayers,
    consumeReturningDraft,
    removeSavedPlayer,
    removeSavedPlayers,
    createPlayerGroupByName,
    updatePlayerGroup,
    deletePlayerGroup,
    deletePlayerGroups,
    updateSavedPlayer,
    createAndStartMatch,
    createAndSaveWinnerMatch,
    deleteMatch,
    deleteMatches,
    getMatch,
    goToRound,
    addNextRound,
    adjustRoundScore,
    setRoundScore,
    setRoundScoringMode,
    addBreakdownItem,
    removeBreakdownItem,
    markMatchFinished,
    finishMatch,
    resumeMatch,
    repeatMatch,
    createPlayerForMatch,
    addPlayerFromSaved,
  };
}
