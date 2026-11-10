import {
  GameSettings,
  MatchTemplate,
  Player,
  SavedPlayer,
} from '../types';
import { normalizeSettings } from './game';

export function resolveTemplatePlayers(
  template: MatchTemplate,
  savedPlayers: SavedPlayer[],
): Player[] {
  return template.playerIds
    .map((id) => savedPlayers.find((p) => p.id === id))
    .filter((p): p is SavedPlayer => p != null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
    }));
}

export type TemplateFactTone = 'high' | 'low' | 'neutral';

export type TemplateFact = {
  label: string;
  tone: TemplateFactTone;
};

export function getTemplateFacts(
  template: MatchTemplate,
  savedPlayers: SavedPlayer[],
): { facts: TemplateFact[]; playersLabel: string | null } {
  const settings = normalizeSettings(template.settings);
  const facts: TemplateFact[] = [];

  if (settings.maxRounds != null) {
    facts.push({
      label: `${settings.maxRounds} rondas`,
      tone: 'neutral',
    });
  }
  if (settings.maxPointsToWin != null) {
    facts.push({
      label: settings.lowestScoreWins
        ? `Pierde a ${settings.maxPointsToWin}`
        : `Objetivo ${settings.maxPointsToWin}`,
      tone: settings.lowestScoreWins ? 'low' : 'high',
    });
  } else if (settings.lowestScoreWins) {
    facts.push({ label: 'Más bajo', tone: 'low' });
  }
  if (facts.length === 0) {
    facts.push({ label: 'Sin límite', tone: 'neutral' });
  }

  const players = resolveTemplatePlayers(template, savedPlayers);
  let playersLabel: string | null = null;
  if (players.length === 1) {
    playersLabel = players[0].name;
  } else if (players.length > 1 && players.length <= 3) {
    playersLabel = players.map((player) => player.name).join(', ');
  } else if (players.length > 3) {
    playersLabel = `${players.length} jugadores`;
  }

  return { facts, playersLabel };
}

export function formatTemplateSubtitle(
  template: MatchTemplate,
  savedPlayers: SavedPlayer[],
): string {
  const parts: string[] = [];
  const settings = normalizeSettings(template.settings);

  if (settings.maxRounds != null) {
    parts.push(`${settings.maxRounds} rondas máx.`);
  }
  if (settings.maxPointsToWin != null) {
    parts.push(
      settings.lowestScoreWins
        ? `${settings.maxPointsToWin} pts (gana el menor)`
        : `${settings.maxPointsToWin} pts para ganar`,
    );
  }
  if (settings.lowestScoreWins) {
    parts.push('gana el menor puntaje');
  }
  if (parts.length === 0) {
    parts.push('Sin límite de rondas ni puntos');
  }

  const players = resolveTemplatePlayers(template, savedPlayers);
  if (players.length === 0) {
    parts.push('Sin jugadores');
  } else if (players.length <= 3) {
    parts.push(players.map((p) => p.name).join(', '));
  } else {
    parts.push(`${players.length} jugadores`);
  }

  return parts.join(' · ');
}

export function applyTemplateDraft(
  template: MatchTemplate,
  savedPlayers: SavedPlayer[],
): {
  settings: GameSettings;
  players: Player[];
  suggestedMatchName: string;
} {
  return {
    settings: normalizeSettings(template.settings),
    players: resolveTemplatePlayers(template, savedPlayers),
    suggestedMatchName: template.name.trim(),
  };
}
