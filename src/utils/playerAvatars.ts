export const PLAYER_AVATAR_IDS = [
  'dice1',
  'dice2',
  'dice3',
  'dice4',
  'dice5',
  'dice6',
  'd10',
  'd12',
  'pepper',
  'skull',
  'train',
  'seven',
  'meeple',
  'puzzle',
  'pawn',
  'knight',
  'rook',
  'crown',
  'joker',
  'hearts',
  'diamonds',
  'clubs',
  'spades',
] as const;

export type PlayerAvatarId = (typeof PLAYER_AVATAR_IDS)[number];

export type PlayerAvatarOption = {
  id: PlayerAvatarId;
  label: string;
};

const AVATAR_ID_SET = new Set<string>(PLAYER_AVATAR_IDS);

export function isPlayerAvatarId(value: string): value is PlayerAvatarId {
  return AVATAR_ID_SET.has(value);
}

export function normalizePlayerAvatar(value: unknown): string | null {
  return typeof value === 'string' && isPlayerAvatarId(value) ? value : null;
}

export function getPlayerInitial(name: string): string {
  const initial = name.trim().charAt(0);
  return initial ? initial.toUpperCase() : '';
}

export const PLAYER_AVATAR_OPTIONS: PlayerAvatarOption[] = [
  { id: 'dice1', label: 'Dado 1' },
  { id: 'dice2', label: 'Dado 2' },
  { id: 'dice3', label: 'Dado 3' },
  { id: 'dice4', label: 'Dado 4' },
  { id: 'dice5', label: 'Dado 5' },
  { id: 'dice6', label: 'Dado 6' },
  { id: 'd10', label: 'Dado de 10' },
  { id: 'd12', label: 'Dado de 12' },
  { id: 'pepper', label: 'Pimiento' },
  { id: 'skull', label: 'Calavera' },
  { id: 'train', label: 'Tren' },
  { id: 'seven', label: 'Siete' },
  { id: 'meeple', label: 'Meeple' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'pawn', label: 'Peón' },
  { id: 'knight', label: 'Caballo' },
  { id: 'rook', label: 'Torre' },
  { id: 'crown', label: 'Corona' },
  { id: 'joker', label: 'Joker' },
  { id: 'hearts', label: 'Corazones' },
  { id: 'diamonds', label: 'Diamantes' },
  { id: 'clubs', label: 'Tréboles' },
  { id: 'spades', label: 'Picas' },
];
