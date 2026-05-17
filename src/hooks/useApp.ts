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
  Player,
  SavedPlayer,
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
  const [data, setData] = useState<AppData>({ players: [], matches: [] });
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
    }));
  }, []);

  const createAndStartMatch = useCallback(
    (players: Player[], settings: GameSettings, name?: string | null) => {
      if (players.length < 2) return null;
      const match = createMatch(players, settings, name);
      setData((prev) => ({
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

  const deleteMatch = useCallback(
    (matchId: string) => {
      setData((prev) => ({
        ...prev,
        matches: prev.matches.filter((m) => m.id !== matchId),
      }));
      setScreen({ type: 'home' });
    },
    [],
  );

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

  const adjustRoundScore = useCallback(
    (matchId: string, playerId: string, delta: number) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        return {
          ...match,
          currentRound: {
            ...match.currentRound,
            [playerId]: (match.currentRound[playerId] ?? 0) + delta,
          },
        };
      });
    },
    [updateMatch],
  );

  const setRoundScore = useCallback(
    (matchId: string, playerId: string, value: number) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        return {
          ...match,
          currentRound: {
            ...match.currentRound,
            [playerId]: value,
          },
        };
      });
    },
    [updateMatch],
  );

  const finishRound = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => {
        const state = matchToGameState(match);
        if (checkGameOver(state).isOver) return match;
        const snapshot = { ...match.currentRound };
        const currentRound: Record<string, number> = {};
        match.players.forEach((p) => {
          currentRound[p.id] = 0;
        });
        const next: Match = {
          ...match,
          completedRounds: [...match.completedRounds, snapshot],
          currentRound,
        };
        const over = checkGameOver(matchToGameState(next));
        if (over.isOver) {
          return { ...next, status: 'finished' as const };
        }
        return next;
      });
    },
    [updateMatch],
  );

  const undoLastRound = useCallback(
    (matchId: string) => {
      updateMatch(matchId, (match) => {
        if (match.completedRounds.length === 0) return match;
        const completed = [...match.completedRounds];
        const lastRound = completed.pop()!;
        return {
          ...match,
          completedRounds: completed,
          currentRound: lastRound,
          status: 'in_progress',
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
      updateMatch(matchId, (match) => {
        const hasRoundActivity = match.players.some(
          (p) => (match.currentRound[p.id] ?? 0) !== 0,
        );
        let completedRounds = match.completedRounds;
        let currentRound = match.currentRound;
        if (hasRoundActivity) {
          completedRounds = [...match.completedRounds, { ...match.currentRound }];
          currentRound = {};
          match.players.forEach((p) => {
            currentRound[p.id] = 0;
          });
        }
        return {
          ...match,
          status: 'finished',
          completedRounds,
          currentRound,
        };
      });
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
    goCreatePlayer,
    backFromCreatePlayer,
    openMatch,
    addSavedPlayer,
    removeSavedPlayer,
    createAndStartMatch,
    deleteMatch,
    getMatch,
    adjustRoundScore,
    setRoundScore,
    finishRound,
    undoLastRound,
    markMatchFinished,
    finishMatch,
    resumeMatch,
    repeatMatch,
    createPlayerForMatch,
    addPlayerFromSaved,
  };
}
