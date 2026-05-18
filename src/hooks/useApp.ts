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
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
  GameSettings,
  Match,
  MatchTemplate,
  PelusasSession,
  Player,
  SkullKingRoundEntry,
  SkullKingSession,
  RoundBreakdown,
  RoundScores,
  SavedPlayer,
  ScoringMode,
} from '../types';
import {
  checkGameOver,
  createId,
  normalizeSettings,
} from '../utils/game';
import {
  createMatch,
  getInProgressMatches,
  getRecentFinishedMatches,
  getRecentPlayers,
  matchToGameState,
  pickPlayerColor,
} from '../utils/match';
import {
  RECENT_FINISHED_MATCHES_LIMIT,
  RECENT_PLAYERS_HOME_LIMIT,
} from '../constants';
import { sumBreakdownItems } from '../utils/scoring';
import {
  emptyRoundBreakdown,
  emptyRoundScores,
  normalizeMatchRounds,
  truncateLaterRounds,
} from '../utils/rounds';
import {
  createFinishedPelusasMatch,
  createPelusasCountsByPlayer,
  emptyPelusasCounts,
  getPelusasCardValues,
  pelusasCardKey,
} from '../utils/pelusas';
import {
  createFinishedSkullKingMatch,
  createSkullKingSession,
  emptySkullKingRoundEntry,
} from '../utils/skullKing';
import {
  createAventurerosTrenDestinationEntry,
  createAventurerosTrenRouteEntry,
  createAventurerosTrenSession,
  createFinishedAventurerosTrenMatch,
  AVENTUREROS_TREN_MAX_PLAYERS,
  AVENTUREROS_TREN_MIN_PLAYERS,
} from '../utils/aventurerosTren';

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

export function useApp() {
  const [data, setData] = useState<AppData>({
    players: [],
    matches: [],
    templates: [],
  });
  const [screen, setScreen] = useState<AppScreen>({ type: 'home' });
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pelusasSession, setPelusasSession] = useState<PelusasSession | null>(
    null,
  );
  const [skullKingSession, setSkullKingSession] =
    useState<SkullKingSession | null>(null);
  const [aventurerosTrenSession, setAventurerosTrenSession] =
    useState<AventurerosTrenSession | null>(null);
  const previousScreenRef = useRef<AppScreen>({ type: 'home' });

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

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const goHome = useCallback(() => {
    setScreen({ type: 'home' });
    setMenuOpen(false);
  }, []);

  const goCreateMatch = useCallback((templateId?: string) => {
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

  const startPelusasSession = useCallback((players: Player[]) => {
    if (players.length < 2) return;
    setData((prev) => ({
      ...prev,
      players: players.reduce(
        (acc, p) => upsertSavedPlayer(acc, p),
        prev.players,
      ),
    }));
    setPelusasSession({
      players,
      revolutionMode: false,
      countsByPlayer: createPelusasCountsByPlayer(players, false),
    });
    setScreen({ type: 'pelusasCount' });
  }, []);

  const updatePelusasPlayers = useCallback((players: Player[]) => {
    if (players.length < 2) return;
    setData((prev) => ({
      ...prev,
      players: players.reduce(
        (acc, p) => upsertSavedPlayer(acc, p),
        prev.players,
      ),
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
    setPelusasSession((prev) => {
      if (!prev) return null;
      const match = createFinishedPelusasMatch(prev);
      setData((data) => ({
        ...data,
        players: prev.players.reduce(
          (acc, p) => upsertSavedPlayer(acc, p),
          data.players,
        ),
        matches: [...data.matches, match],
      }));
      setScreen({ type: 'game', matchId: match.id });
      return null;
    });
  }, []);

  const startSkullKingSession = useCallback((players: Player[]) => {
    if (
      players.length < 2 ||
      players.length > 6
    ) {
      return;
    }
    setData((prev) => ({
      ...prev,
      players: players.reduce(
        (acc, p) => upsertSavedPlayer(acc, p),
        prev.players,
      ),
    }));
    setSkullKingSession(createSkullKingSession(players));
    setScreen({ type: 'skullKingCount' });
  }, []);

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
    setSkullKingSession((prev) => {
      if (!prev) return null;
      const match = createFinishedSkullKingMatch(prev);
      setData((data) => ({
        ...data,
        players: prev.players.reduce(
          (acc, p) => upsertSavedPlayer(acc, p),
          data.players,
        ),
        matches: [...data.matches, match],
      }));
      setScreen({ type: 'game', matchId: match.id });
      return null;
    });
  }, []);

  const startAventurerosTrenSession = useCallback((players: Player[]) => {
    if (
      players.length < AVENTUREROS_TREN_MIN_PLAYERS ||
      players.length > AVENTUREROS_TREN_MAX_PLAYERS
    ) {
      return;
    }
    setData((prev) => ({
      ...prev,
      players: players.reduce(
        (acc, p) => upsertSavedPlayer(acc, p),
        prev.players,
      ),
    }));
    setAventurerosTrenSession(createAventurerosTrenSession(players));
    setScreen({ type: 'aventurerosTrenCount' });
  }, []);

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
        createAventurerosTrenRouteEntry(),
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

  const finishAventurerosTrenSession = useCallback(() => {
    setAventurerosTrenSession((prev) => {
      if (!prev) return null;
      const match = createFinishedAventurerosTrenMatch(prev);
      setData((data) => ({
        ...data,
        players: prev.players.reduce(
          (acc, p) => upsertSavedPlayer(acc, p),
          data.players,
        ),
        matches: [...data.matches, match],
      }));
      setScreen({ type: 'game', matchId: match.id });
      return null;
    });
  }, []);

  const goMatchesList = useCallback(() => {
    setScreen({ type: 'matchesList' });
    setMenuOpen(false);
  }, []);

  const goPlayersList = useCallback(() => {
    setScreen({ type: 'playersList' });
    setMenuOpen(false);
  }, []);

  const goCreatePlayer = useCallback(() => {
    setScreen((current) => {
      previousScreenRef.current = current;
      return { type: 'createPlayer' };
    });
    setMenuOpen(false);
  }, []);

  const goTemplatesList = useCallback(() => {
    setScreen({ type: 'templatesList' });
    setMenuOpen(false);
  }, []);

  const goEditTemplate = useCallback((templateId?: string) => {
    setScreen({ type: 'editTemplate', templateId });
    setMenuOpen(false);
  }, []);

  const backFromCreatePlayer = useCallback(() => {
    setScreen(previousScreenRef.current);
  }, []);

  const openMatch = useCallback((matchId: string) => {
    setScreen({ type: 'game', matchId });
    setMenuOpen(false);
  }, []);

  const addSavedPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setData((prev) => {
      const duplicate = prev.players.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) return prev;
      const player = createSavedPlayer(trimmed, prev.players);
      return { ...prev, players: [...prev.players, player] };
    });
    return true;
  }, []);

  const removeSavedPlayer = useCallback((playerId: string) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
      templates: prev.templates.map((t) => ({
        ...t,
        playerIds: t.playerIds.filter((id) => id !== playerId),
      })),
    }));
  }, []);

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
    (players: Player[], settings: GameSettings, name?: string | null) => {
      if (players.length < 2) return null;
      const match = createMatch(players, settings, name);
      setData((prev) => ({
        ...prev,
        players: players.reduce(
          (acc, p) => upsertSavedPlayer(acc, p),
          prev.players,
        ),
        matches: [...prev.matches, match],
      }));
      setScreen({ type: 'game', matchId: match.id });
      return match.id;
    },
    [],
  );

  const deleteMatch = useCallback((matchId: string) => {
    setData((prev) => ({
      ...prev,
      matches: prev.matches.filter((m) => m.id !== matchId),
    }));
    setScreen((current) => {
      if (current.type === 'game' && current.matchId === matchId) {
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

  const goToRound = useCallback(
    (matchId: string, roundIndex: number) => {
      updateMatch(matchId, (match) => {
        const m = normalizeMatchRounds(match);
        if (roundIndex < 0 || roundIndex >= m.rounds.length) return m;
        const maxRounds = m.settings.maxRounds;
        if (
          maxRounds != null &&
          roundIndex > m.activeRoundIndex + 1
        ) {
          return m;
        }
        return { ...m, activeRoundIndex: roundIndex };
      });
    },
    [updateMatch],
  );

  const addNextRound = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        const m = normalizeMatchRounds(match);
        if (m.settings.maxRounds != null) {
          if (m.activeRoundIndex < m.rounds.length - 1) {
            return { ...m, activeRoundIndex: m.activeRoundIndex + 1 };
          }
          return m;
        }
        if (m.activeRoundIndex < m.rounds.length - 1) {
          return { ...m, activeRoundIndex: m.activeRoundIndex + 1 };
        }
        return {
          ...m,
          rounds: [...m.rounds, emptyRoundScores(m.players)],
          roundBreakdowns: [...m.roundBreakdowns, emptyRoundBreakdown()],
          activeRoundIndex: m.rounds.length,
        };
      });
    },
    [updateMatch],
  );

  const adjustRoundScore = useCallback(
    (matchId: string, playerId: string, delta: number, truncateLater = false) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        let m = normalizeMatchRounds(match);
        if (truncateLater) m = truncateLaterRounds(m);
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
    (matchId: string, playerId: string, value: number, truncateLater = false) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        let m = normalizeMatchRounds(match);
        if (truncateLater) m = truncateLaterRounds(m);
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
    (matchId: string, playerId: string, mode: ScoringMode, truncateLater = false) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        let m = normalizeMatchRounds(match);
        if (truncateLater) m = truncateLaterRounds(m);

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
    (matchId: string, playerId: string, value: number, truncateLater = false) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        let m = normalizeMatchRounds(match);
        if (truncateLater) m = truncateLaterRounds(m);
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
    (matchId: string, playerId: string, index: number, truncateLater = false) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        let m = normalizeMatchRounds(match);
        if (truncateLater) m = truncateLaterRounds(m);
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
      }));
    },
    [updateMatch],
  );

  const finishMatch = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => ({
        ...normalizeMatchRounds(match),
        status: 'finished',
      }));
    },
    [updateMatch],
  );

  const resumeMatch = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => ({
        ...match,
        status: 'in_progress',
      }));
    },
    [updateMatch],
  );

  const repeatMatch = useCallback(
    (matchId: string) => {
      const source = data.matches.find((m) => m.id === matchId);
      if (!source) return;

      if (source.gameMode === 'pelusas') {
        setData((prev) => ({
          ...prev,
          players: source.players.reduce(
            (acc, p) => upsertSavedPlayer(acc, p),
            prev.players,
          ),
        }));
        setPelusasSession({
          players: source.players,
          revolutionMode: Boolean(source.pelusasRevolution),
          countsByPlayer: createPelusasCountsByPlayer(
            source.players,
            Boolean(source.pelusasRevolution),
          ),
        });
        setScreen({ type: 'pelusasCount' });
        return;
      }

      if (source.gameMode === 'skull_king') {
        setData((prev) => ({
          ...prev,
          players: source.players.reduce(
            (acc, p) => upsertSavedPlayer(acc, p),
            prev.players,
          ),
        }));
        setSkullKingSession(createSkullKingSession(source.players));
        setScreen({ type: 'skullKingCount' });
        return;
      }

      if (source.gameMode === 'aventureros_tren') {
        setData((prev) => ({
          ...prev,
          players: source.players.reduce(
            (acc, p) => upsertSavedPlayer(acc, p),
            prev.players,
          ),
        }));
        setAventurerosTrenSession(createAventurerosTrenSession(source.players));
        setScreen({ type: 'aventurerosTrenCount' });
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
  );
  const recentPlayers = getRecentPlayers(
    data.players,
    RECENT_PLAYERS_HOME_LIMIT,
  );

  return {
    data,
    loaded,
    screen,
    menuOpen,
    inProgressMatches,
    recentFinishedMatches,
    recentPlayers,
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
    skullKingSession,
    startSkullKingSession,
    exitSkullKing,
    goSkullKingRound,
    updateSkullKingRoundEntry,
    finishSkullKingSession,
    aventurerosTrenSession,
    startAventurerosTrenSession,
    exitAventurerosTren,
    setAventurerosTrenPhase,
    addAventurerosTrenRoute,
    updateAventurerosTrenRoute,
    removeAventurerosTrenRoute,
    addAventurerosTrenDestination,
    updateAventurerosTrenDestination,
    removeAventurerosTrenDestination,
    finishAventurerosTrenSession,
    goMatchesList,
    goPlayersList,
    goTemplatesList,
    goEditTemplate,
    goCreatePlayer,
    backFromCreatePlayer,
    getTemplate,
    saveTemplate,
    deleteTemplate,
    openMatch,
    addSavedPlayer,
    removeSavedPlayer,
    createAndStartMatch,
    deleteMatch,
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
