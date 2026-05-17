import { useCallback, useEffect, useState } from 'react';
import { PLAYER_COLORS } from '../constants';
import { clearGameState, loadGameState, saveGameState } from '../storage';
import { GameSettings, GameState } from '../types';
import {
  checkGameOver,
  createId,
  initialGameState,
  normalizeSettings,
} from '../utils/game';

export function useGame() {
  const [state, setState] = useState<GameState>(initialGameState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadGameState().then((saved) => {
      setState(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveGameState(state);
    }
  }, [state, loaded]);

  const updateSettings = useCallback((settings: GameSettings) => {
    setState((prev) => ({ ...prev, settings: normalizeSettings(settings) }));
  }, []);

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    setState((prev) => {
      const color =
        PLAYER_COLORS[prev.players.length % PLAYER_COLORS.length];
      const player = { id: createId(), name: trimmed, color };
      return {
        ...prev,
        players: [...prev.players, player],
        currentRound: { ...prev.currentRound, [player.id]: 0 },
      };
    });
    return true;
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setState((prev) => {
      const { [playerId]: _, ...currentRound } = prev.currentRound;
      const completedRounds = prev.completedRounds.map((round) => {
        const { [playerId]: __, ...rest } = round;
        return rest;
      });
      return {
        ...prev,
        players: prev.players.filter((p) => p.id !== playerId),
        currentRound,
        completedRounds,
      };
    });
  }, []);

  const startGame = useCallback(() => {
    setState((prev) => {
      if (prev.players.length < 2) return prev;
      const currentRound: Record<string, number> = {};
      prev.players.forEach((p) => {
        currentRound[p.id] = 0;
      });
      return {
        ...prev,
        isPlaying: true,
        completedRounds: [],
        currentRound,
      };
    });
  }, []);

  const adjustRoundScore = useCallback((playerId: string, delta: number) => {
    setState((prev) => {
      if (checkGameOver(prev).isOver) return prev;
      return {
        ...prev,
        currentRound: {
          ...prev.currentRound,
          [playerId]: (prev.currentRound[playerId] ?? 0) + delta,
        },
      };
    });
  }, []);

  const setRoundScore = useCallback((playerId: string, value: number) => {
    setState((prev) => {
      if (checkGameOver(prev).isOver) return prev;
      return {
        ...prev,
        currentRound: {
          ...prev.currentRound,
          [playerId]: value,
        },
      };
    });
  }, []);

  const finishRound = useCallback(() => {
    setState((prev) => {
      if (checkGameOver(prev).isOver) return prev;
      const snapshot = { ...prev.currentRound };
      const currentRound: Record<string, number> = {};
      prev.players.forEach((p) => {
        currentRound[p.id] = 0;
      });
      return {
        ...prev,
        completedRounds: [...prev.completedRounds, snapshot],
        currentRound,
      };
    });
  }, []);

  const undoLastRound = useCallback(() => {
    setState((prev) => {
      if (prev.completedRounds.length === 0) return prev;
      const completed = [...prev.completedRounds];
      const lastRound = completed.pop()!;
      return {
        ...prev,
        completedRounds: completed,
        currentRound: lastRound,
      };
    });
  }, []);

  const resetGame = useCallback(async () => {
    const fresh = initialGameState();
    setState(fresh);
    await clearGameState();
  }, []);

  const backToSetup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      completedRounds: [],
      currentRound: {},
    }));
  }, []);

  return {
    state,
    loaded,
    updateSettings,
    addPlayer,
    removePlayer,
    startGame,
    adjustRoundScore,
    setRoundScore,
    finishRound,
    undoLastRound,
    resetGame,
    backToSetup,
  };
}
