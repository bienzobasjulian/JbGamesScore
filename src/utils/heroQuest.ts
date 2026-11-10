import type {
  HeroQuestGearSlot,
  HeroQuestGoldEntry,
  HeroQuestHeroId,
  HeroQuestItem,
  HeroQuestItemCategory,
  HeroQuestQuestEntry,
  HeroQuestSession,
  HeroQuestSheet,
  HeroQuestStatus,
  Match,
  Player,
} from '../types';
import { createId } from './game';

export const HERO_QUEST_MIN_PLAYERS = 1;
export const HERO_QUEST_MAX_PLAYERS = 4;

export type HeroQuestPreset = {
  id: Exclude<HeroQuestHeroId, 'custom'>;
  name: string;
  emoji: string;
  health: number;
  attack: number;
  defense: number;
  mind: number;
};

export const HERO_QUEST_PRESETS: HeroQuestPreset[] = [
  {
    id: 'barbarian',
    name: 'Bárbaro',
    emoji: '⚔️',
    health: 8,
    attack: 3,
    defense: 2,
    mind: 2,
  },
  {
    id: 'dwarf',
    name: 'Enano',
    emoji: '🪓',
    health: 7,
    attack: 2,
    defense: 2,
    mind: 3,
  },
  {
    id: 'elf',
    name: 'Elfo',
    emoji: '🏹',
    health: 6,
    attack: 2,
    defense: 2,
    mind: 4,
  },
  {
    id: 'wizard',
    name: 'Mago',
    emoji: '📖',
    health: 4,
    attack: 1,
    defense: 2,
    mind: 6,
  },
];

export const HERO_QUEST_CATEGORIES: {
  id: HeroQuestItemCategory;
  label: string;
}[] = [
  { id: 'gear', label: 'Equipo' },
  { id: 'item', label: 'Objetos' },
  { id: 'spell', label: 'Magia' },
  { id: 'quest', label: 'Misión' },
];

export const HERO_QUEST_GEAR: { id: HeroQuestGearSlot; label: string }[] = [
  { id: 'weapon', label: 'Arma' },
  { id: 'armor', label: 'Armadura' },
  { id: 'shield', label: 'Escudo' },
  { id: 'helmet', label: 'Casco' },
];

const GEAR_SLOTS = new Set<HeroQuestGearSlot>([
  'weapon',
  'armor',
  'shield',
  'helmet',
]);
const CATEGORIES = new Set<HeroQuestItemCategory>([
  'gear',
  'item',
  'spell',
  'quest',
]);
const STATUSES = new Set<HeroQuestStatus>(['alive', 'dead', 'retired']);

export function emptyHeroQuestSheet(): HeroQuestSheet {
  return {
    heroId: null,
    characterName: '',
    emoji: '🛡️',
    health: 0,
    maxHealth: 0,
    mind: 0,
    maxMind: 0,
    baseAttack: 0,
    baseDefense: 0,
    attackMod: 0,
    defenseMod: 0,
    moveMod: 0,
    gold: 0,
    goldLog: [],
    items: [],
    notes: '',
    status: 'alive',
    quests: [],
  };
}

function clampInt(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const HERO_IDS = new Set<HeroQuestHeroId>([
  'barbarian',
  'dwarf',
  'elf',
  'wizard',
  'custom',
]);

function legacyCategory(raw: Record<string, unknown>): HeroQuestItemCategory {
  if (CATEGORIES.has(raw.category as HeroQuestItemCategory)) {
    return raw.category as HeroQuestItemCategory;
  }
  if (raw.kind === 'weapon') return 'gear';
  if (raw.kind === 'spell') return 'spell';
  if (raw.kind === 'key') return 'quest';
  return 'item';
}

function normalizeItems(raw: Partial<HeroQuestSheet> | undefined): HeroQuestItem[] {
  const source = Array.isArray(raw?.items) ? raw.items : [];
  return source
    .filter((item) => item != null && typeof item === 'object')
    .map((item) => {
      const record = item as unknown as Record<string, unknown>;
      const category = legacyCategory(record);
      const gear =
        category === 'gear'
          ? GEAR_SLOTS.has(record.gear as HeroQuestGearSlot)
            ? (record.gear as HeroQuestGearSlot)
            : record.kind === 'weapon'
              ? 'weapon'
              : 'armor'
          : null;
      return {
        id: typeof record.id === 'string' && record.id ? record.id : createId(),
        name: asText(record.name),
        category,
        gear,
        bonus: clampInt(record.bonus),
        equipped: Boolean(record.equipped),
        quantity: Math.max(1, clampInt(record.quantity, 1)),
        description: asText(record.description),
        used: Boolean(record.used),
      };
    });
}

function normalizeGoldLog(raw: unknown): HeroQuestGoldEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry != null && typeof entry === 'object')
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const delta = Number(record.delta);
      return {
        id: typeof record.id === 'string' && record.id ? record.id : createId(),
        delta: Number.isFinite(delta) ? Math.trunc(delta) : 0,
        note: asText(record.note),
        at: clampInt(record.at, Date.now()),
      };
    });
}

function normalizeQuests(raw: unknown): HeroQuestQuestEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry != null && typeof entry === 'object')
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      return {
        id: typeof record.id === 'string' && record.id ? record.id : createId(),
        number: asText(record.number),
        name: asText(record.name),
        date: asText(record.date),
        result: asText(record.result),
        rewards: asText(record.rewards),
      };
    });
}

export function normalizeHeroQuestSheet(
  raw: Partial<HeroQuestSheet> | undefined,
): HeroQuestSheet {
  const health = clampInt(raw?.health);
  const mind = clampInt(raw?.mind);
  const maxHealth = raw?.maxHealth == null ? health : clampInt(raw.maxHealth);
  const maxMind = raw?.maxMind == null ? mind : clampInt(raw.maxMind);
  const legacy = raw as
    | (Partial<HeroQuestSheet> & {
        talents?: string;
        abilities?: string;
        personality?: string;
        history?: string;
      })
    | undefined;
  const notes =
    asText(raw?.notes) ||
    [legacy?.talents, legacy?.abilities, legacy?.personality, legacy?.history]
      .map((part) => asText(part).trim())
      .filter(Boolean)
      .join('\n');
  const heroId =
    raw?.heroId && HERO_IDS.has(raw.heroId)
      ? raw.heroId
      : health > 0 || mind > 0 || notes
        ? 'custom'
        : null;

  return {
    heroId,
    characterName: asText(raw?.characterName).trim(),
    emoji: asText(raw?.emoji).trim() || '🛡️',
    health: Math.min(health, maxHealth),
    maxHealth,
    mind: Math.min(mind, maxMind),
    maxMind,
    baseAttack: clampInt(raw?.baseAttack ?? (raw as { attack?: number })?.attack),
    baseDefense: clampInt(
      raw?.baseDefense ?? (raw as { defense?: number })?.defense,
    ),
    attackMod: Math.trunc(Number(raw?.attackMod) || 0),
    defenseMod: Math.trunc(Number(raw?.defenseMod) || 0),
    moveMod: Math.trunc(Number(raw?.moveMod) || 0),
    gold: clampInt(raw?.gold),
    goldLog: normalizeGoldLog(raw?.goldLog),
    items: normalizeItems(raw),
    notes,
    status: STATUSES.has(raw?.status as HeroQuestStatus)
      ? (raw?.status as HeroQuestStatus)
      : 'alive',
    quests: normalizeQuests(raw?.quests),
  };
}

export function equippedAttackBonus(sheet: HeroQuestSheet): number {
  return sheet.items.reduce(
    (total, item) =>
      item.category === 'gear' && item.gear === 'weapon' && item.equipped
        ? total + item.bonus
        : total,
    0,
  );
}

export function equippedDefenseBonus(sheet: HeroQuestSheet): number {
  return sheet.items.reduce(
    (total, item) =>
      item.category === 'gear' &&
      item.equipped &&
      item.gear !== 'weapon' &&
      item.gear != null
        ? total + item.bonus
        : total,
    0,
  );
}

export function heroQuestAttackTotal(sheet: HeroQuestSheet): number {
  return Math.max(0, sheet.baseAttack + equippedAttackBonus(sheet) + sheet.attackMod);
}

export function heroQuestDefenseTotal(sheet: HeroQuestSheet): number {
  return Math.max(
    0,
    sheet.baseDefense + equippedDefenseBonus(sheet) + sheet.defenseMod,
  );
}

export function createHeroQuestSession(
  players: Player[],
  matchName?: string | null,
  heroByPlayer?: Record<string, string | null | undefined>,
  nameByPlayer?: Record<string, string | null | undefined>,
  startedAt = Date.now(),
): HeroQuestSession {
  const sheets: Record<string, HeroQuestSheet> = {};
  for (const player of players) {
    const preset = HERO_QUEST_PRESETS.find(
      (entry) => entry.id === heroByPlayer?.[player.id],
    );
    sheets[player.id] = preset
      ? applyHeroQuestPreset(preset, nameByPlayer?.[player.id] ?? '')
      : emptyHeroQuestSheet();
  }
  return {
    matchName: matchName?.trim() || null,
    startedAt,
    players,
    sheets,
  };
}

export function normalizeHeroQuestSession(
  raw: HeroQuestSession,
): HeroQuestSession {
  const players = Array.isArray(raw?.players) ? raw.players : [];
  const sheets: Record<string, HeroQuestSheet> = {};
  for (const player of players) {
    sheets[player.id] = normalizeHeroQuestSheet(raw?.sheets?.[player.id]);
  }
  return {
    matchName: asText(raw?.matchName).trim() || null,
    startedAt: clampInt(raw?.startedAt, Date.now()),
    players,
    sheets,
  };
}

export function clampHeroQuestSheet(sheet: HeroQuestSheet): HeroQuestSheet {
  const maxHealth = Math.max(0, Math.floor(sheet.maxHealth));
  const maxMind = Math.max(0, Math.floor(sheet.maxMind));
  return {
    ...sheet,
    maxHealth,
    maxMind,
    health: Math.min(Math.max(0, Math.floor(sheet.health)), maxHealth),
    mind: Math.min(Math.max(0, Math.floor(sheet.mind)), maxMind),
    baseAttack: Math.max(0, Math.floor(sheet.baseAttack)),
    baseDefense: Math.max(0, Math.floor(sheet.baseDefense)),
    attackMod: Math.trunc(sheet.attackMod) || 0,
    defenseMod: Math.trunc(sheet.defenseMod) || 0,
    moveMod: Math.trunc(sheet.moveMod) || 0,
    gold: Math.max(0, Math.floor(sheet.gold)),
    goldLog: sheet.goldLog ?? [],
    items: sheet.items ?? [],
    quests: sheet.quests ?? [],
    status: sheet.status ?? 'alive',
  };
}

export function setHeroQuestHealthMax(
  sheet: HeroQuestSheet,
  nextMax: number,
): HeroQuestSheet {
  const cappedMax = Math.max(0, Math.floor(nextMax));
  const nextHealth =
    sheet.health >= sheet.maxHealth
      ? cappedMax
      : Math.min(sheet.health, cappedMax);
  return clampHeroQuestSheet({
    ...sheet,
    maxHealth: cappedMax,
    health: nextHealth,
  });
}

export function applyHeroQuestPreset(
  preset: HeroQuestPreset,
  personalName: string,
): HeroQuestSheet {
  const name = personalName.trim();
  return clampHeroQuestSheet({
    ...emptyHeroQuestSheet(),
    heroId: preset.id,
    characterName: name,
    emoji: preset.emoji,
    health: preset.health,
    maxHealth: preset.health,
    baseAttack: preset.attack,
    baseDefense: preset.defense,
    mind: preset.mind,
    maxMind: preset.mind,
  });
}

export function restoreHeroQuestSheet(sheet: HeroQuestSheet): HeroQuestSheet {
  return clampHeroQuestSheet({
    ...sheet,
    health: sheet.maxHealth,
    mind: sheet.maxMind,
    attackMod: 0,
    defenseMod: 0,
    moveMod: 0,
    status: 'alive',
  });
}

export function createHeroQuestGoldEntry(
  delta: number,
  note: string,
): HeroQuestGoldEntry {
  return { id: createId(), delta: Math.trunc(delta), note: note.trim(), at: Date.now() };
}

export function applyCustomHeroQuest(input: {
  name: string;
  emoji: string;
  health: number;
  attack: number;
  defense: number;
  move: number;
  mind: number;
}): HeroQuestSheet {
  const health = Math.max(0, Math.floor(input.health));
  const mind = Math.max(0, Math.floor(input.mind));
  return clampHeroQuestSheet({
    ...emptyHeroQuestSheet(),
    heroId: 'custom',
    characterName: input.name.trim() || 'Héroe',
    emoji: input.emoji.trim() || '🛡️',
    health,
    maxHealth: health,
    baseAttack: Math.max(0, Math.floor(input.attack)),
    baseDefense: Math.max(0, Math.floor(input.defense)),
    mind,
    maxMind: mind,
  });
}

export function createHeroQuestItem(input: {
  name: string;
  category: HeroQuestItemCategory;
  gear?: HeroQuestGearSlot | null;
  bonus?: number;
  quantity?: number;
  description?: string;
}): HeroQuestItem {
  return {
    id: createId(),
    name: input.name.trim(),
    category: input.category,
    gear: input.category === 'gear' ? input.gear ?? 'weapon' : null,
    bonus: input.category === 'gear' ? Math.max(0, Math.floor(input.bonus ?? 0)) : 0,
    equipped: false,
    quantity: Math.max(1, Math.floor(input.quantity ?? 1)),
    description: input.description?.trim() ?? '',
    used: false,
  };
}

export function rollHeroQuestMovement(moveMod: number): {
  dice: [number, number];
  total: number;
} {
  const dice: [number, number] = [
    1 + Math.floor(Math.random() * 6),
    1 + Math.floor(Math.random() * 6),
  ];
  return { dice, total: Math.max(0, dice[0] + dice[1] + moveMod) };
}

function matchTitle(session: HeroQuestSession): string {
  return session.matchName?.trim() || 'HeroQuest';
}

export function createInProgressHeroQuestMatch(
  session: HeroQuestSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: matchTitle(session),
    gameMode: 'hero_quest',
    sessionId: sessionId ?? null,
    settings: { maxRounds: null, maxPointsToWin: null },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: 'in_progress',
    heroQuestSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedHeroQuestMatch(session: HeroQuestSession): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: matchTitle(session),
    gameMode: 'hero_quest',
    settings: { maxRounds: null, maxPointsToWin: null },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: 'finished',
    heroQuestSession: session,
    createdAt: now,
    updatedAt: now,
  };
}
