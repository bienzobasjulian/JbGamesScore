export const PLAYER_COLOR_OPTIONS = [
  { name: 'Negro', value: '#000000' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Rojo', value: '#FF0000' },
  { name: 'Naranja', value: '#FFA500' },
  { name: 'Amarillo', value: '#FFFF00' },
  { name: 'Verde lima', value: '#00FF00' },
  { name: 'Verde', value: '#008000' },
  { name: 'Cian', value: '#00FFFF' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Púrpura', value: '#800080' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Rosa', value: '#FF69B4' },
  { name: 'Marrón', value: '#8B4513' },
] as const;

export const PLAYER_COLORS = PLAYER_COLOR_OPTIONS.map((color) => color.value);

export const STORAGE_KEY = '@jbgamesscore/app';
export const LEGACY_STORAGE_KEY = '@jbgamesscore/game';
export const RECENT_PLAYERS_HOME_LIMIT = 4;
export const RECENT_FINISHED_MATCHES_LIMIT = 4;
export const RECENT_SESSIONS_HOME_LIMIT = 3;
