import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSavedPlayer,
  loadAppData,
  saveAppData,
} from '../storage';
import {
  AppData,
  AppScreen,
  GameSettings,
  Match,
  MatchTemplate,
  Player,
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

  const goCreateMatch = useCallback(() => {
    setScreen({ type: 'createMatch' });
    setMenuOpen(false);
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
