import { Match } from '../types';
import { createId, normalizeSettings } from './game';

export const REGICIDE_SUITS = [
  'hearts',
  'diamonds',
  'clubs',
  'spades',
] as const;

export type RegicideSuit = (typeof REGICIDE_SUITS)[number];

export type RegicideRank = 'J' | 'Q' | 'K';

export type RegicideCardRank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export type RegicideBossId = `${RegicideRank}_${RegicideSuit}`;

export type RegicideCard = {
  suit: RegicideSuit;
  rank: RegicideCardRank;
};

export type RegicideAttackAction = {
  type: 'attack';
  cards: RegicideCard[];
  damageDealt: number;
  attackReduction: number;
};

export type RegicideJokerAction = {
  type: 'joker';
};

export type RegicideAction = RegicideAttackAction | RegicideJokerAction;

export type RegicideBossState = {
  id: RegicideBossId;
  rank: RegicideRank;
  suit: RegicideSuit;
  maxHp: number;
  maxAttack: number;
  currentHp: number;
  currentAttack: number;
  defeated: boolean;
  immunityRemoved: boolean;
  playedCards: RegicideCard[];
  actions: RegicideAction[];
};

export type RegicideTier = RegicideRank;

export type RegicideSession = {
  currentTier: RegicideTier;
  bosses: Record<RegicideBossId, RegicideBossState>;
  activeBossId: RegicideBossId | null;
  defeatedRoyals: RegicideBossId[];
  undoSnapshot: RegicideSession | null;
  victory: boolean;
};

export type RegicideAttackPreview = {
  totalValue: number;
  damage: number;
  attackReduction: number;
  heartsActive: boolean;
  diamondsActive: boolean;
  clubsActive: boolean;
  spadesActive: boolean;
};

const BOSS_STATS: Record<RegicideRank, { hp: number; attack: number }> = {
  J: { hp: 20, attack: 10 },
  Q: { hp: 30, attack: 15 },
  K: { hp: 40, attack: 20 },
};

export const REGICIDE_SUIT_EMOJI: Record<RegicideSuit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const REGICIDE_SUIT_LABEL: Record<RegicideSuit, string> = {
  hearts: 'Corazones',
  diamonds: 'Diamantes',
  clubs: 'Tréboles',
  spades: 'Picas',
};

export const REGICIDE_TIER_LABEL: Record<RegicideTier, string> = {
  J: 'Jotas',
  Q: 'Reinas',
  K: 'Reyes',
};

const NUMERIC_RANKS: RegicideCardRank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

export function regicideCardKey(card: RegicideCard): string {
  return `${card.suit}_${card.rank}`;
}

export function getRegicideCardValue(rank: RegicideCardRank): number {
  if (rank === 'A') return 1;
  if (rank === 'J') return 10;
  if (rank === 'Q') return 15;
  if (rank === 'K') return 20;
  return Number.parseInt(rank, 10);
}

export function formatRegicideBossLabel(boss: RegicideBossState): string {
  return `${boss.rank}${REGICIDE_SUIT_EMOJI[boss.suit]}`;
}

export function formatRegicideCardLabel(card: RegicideCard): string {
  return `${card.rank}${REGICIDE_SUIT_EMOJI[card.suit]}`;
}

function cloneSession(session: RegicideSession): RegicideSession {
  return JSON.parse(JSON.stringify(session)) as RegicideSession;
}

function createBossState(
  rank: RegicideRank,
  suit: RegicideSuit,
): RegicideBossState {
  const stats = BOSS_STATS[rank];
  const id = `${rank}_${suit}` as RegicideBossId;
  return {
    id,
    rank,
    suit,
    maxHp: stats.hp,
    maxAttack: stats.attack,
    currentHp: stats.hp,
    currentAttack: stats.attack,
    defeated: false,
    immunityRemoved: false,
    playedCards: [],
    actions: [],
  };
}

function getTierBossIds(tier: RegicideTier): RegicideBossId[] {
  return REGICIDE_SUITS.map((suit) => `${tier}_${suit}` as RegicideBossId);
}

function createTierSession(
  defeatedRoyals: RegicideBossId[],
  tier: RegicideTier,
): RegicideSession {
  const bosses = {} as Record<RegicideBossId, RegicideBossState>;
  for (const suit of REGICIDE_SUITS) {
    const id = `${tier}_${suit}` as RegicideBossId;
    bosses[id] = createBossState(tier, suit);
  }
  return {
    currentTier: tier,
    bosses,
    activeBossId: null,
    defeatedRoyals,
    undoSnapshot: null,
    victory: false,
  };
}

export function createRegicideSession(): RegicideSession {
  return createTierSession([], 'J');
}

export function formatRegicideMatchProgress(session: RegicideSession): string {
  if (session.victory) return 'Finalizada';
  const defeated = session.defeatedRoyals.length;
  return `${defeated}/12 derrotados`;
}

export function createRegicideMatch(
  session: RegicideSession,
  sessionId?: string | null,
  name?: string | null,
): Match {
  const now = Date.now();
  const trimmedName = name?.trim();
  return {
    id: createId(),
    name: trimmedName ? trimmedName : null,
    sessionId: sessionId ?? null,
    gameMode: 'regicide',
    settings: normalizeSettings({ maxRounds: null, maxPointsToWin: null }),
    players: [],
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: session.victory ? 'finished' : 'in_progress',
    regicideSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

function sumCardValues(cards: RegicideCard[]): number {
  return cards.reduce((sum, card) => sum + getRegicideCardValue(card.rank), 0);
}

function isImmuneToSuit(boss: RegicideBossState, suit: RegicideSuit): boolean {
  return !boss.immunityRemoved && boss.suit === suit;
}

function hasJokerBeforeIndex(boss: RegicideBossState, index: number): boolean {
  return boss.actions
    .slice(0, index)
    .some((action) => action.type === 'joker');
}

function spadesReductionApplies(
  boss: RegicideBossState,
  actionIndex: number,
): boolean {
  if (boss.suit !== 'spades') return true;
  const jokerIndex = boss.actions.findIndex((action) => action.type === 'joker');
  return jokerIndex >= 0;
}

function clubsDoubleApplies(
  boss: RegicideBossState,
  actionIndex: number,
): boolean {
  const action = boss.actions[actionIndex];
  if (!action || action.type !== 'attack') return false;
  return clubsDoubleForAction(boss, action.cards, actionIndex);
}

export function recalculateBossAttack(boss: RegicideBossState): number {
  let attack = boss.maxAttack;
  boss.actions.forEach((action, index) => {
    if (action.type !== 'attack') return;
    const hasSpades = action.cards.some((card) => card.suit === 'spades');
    if (!hasSpades || !spadesReductionApplies(boss, index)) return;
    attack -= sumCardValues(action.cards);
  });
  return Math.max(0, attack);
}

function clubsDoubleForAction(
  boss: RegicideBossState,
  cards: RegicideCard[],
  actionIndex: number,
): boolean {
  if (!cards.some((card) => card.suit === 'clubs')) return false;
  if (boss.suit !== 'clubs') {
    return !isImmuneToSuit(boss, 'clubs');
  }
  return clubsDoubleApplies(boss, actionIndex);
}

function calculateDamageForAction(
  boss: RegicideBossState,
  cards: RegicideCard[],
  actionIndex: number,
): number {
  const totalValue = sumCardValues(cards);
  if (clubsDoubleForAction(boss, cards, actionIndex)) {
    return totalValue * 2;
  }
  return totalValue;
}

function calculateAttackReductionForAction(
  boss: RegicideBossState,
  cards: RegicideCard[],
  actionIndex: number,
): number {
  const hasSpades = cards.some((card) => card.suit === 'spades');
  if (!hasSpades) return 0;
  if (!spadesReductionApplies(boss, actionIndex)) return 0;
  return sumCardValues(cards);
}

export function previewRegicideAttack(
  boss: RegicideBossState,
  cards: RegicideCard[],
): RegicideAttackPreview {
  const totalValue = sumCardValues(cards);
  const nextActionIndex = boss.actions.length;
  const damage = calculateDamageForAction(boss, cards, nextActionIndex);
  const attackReduction = calculateAttackReductionForAction(
    boss,
    cards,
    nextActionIndex,
  );

  const clubsActive = clubsDoubleForAction(boss, cards, nextActionIndex);
  const spadesActive =
    cards.some((card) => card.suit === 'spades') &&
    spadesReductionApplies(boss, nextActionIndex);

  return {
    totalValue,
    damage,
    attackReduction,
    heartsActive: cards.some((card) => card.suit === 'hearts'),
    diamondsActive: cards.some((card) => card.suit === 'diamonds'),
    clubsActive,
    spadesActive,
  };
}

export function formatRegicideAttackPreview(
  preview: RegicideAttackPreview,
): string {
  const parts: string[] = [];

  if (preview.heartsActive) {
    parts.push(`Cura ${preview.totalValue}`);
  }
  if (preview.diamondsActive) {
    parts.push(`Robar ${preview.totalValue}`);
  }

  let damagePart = `Daño ${preview.damage}`;
  if (preview.clubsActive) {
    damagePart += ' (×2 tréboles)';
  }
  parts.push(damagePart);

  if (preview.spadesActive) {
    parts.push(`Ataque −${preview.attackReduction}`);
  }

  return parts.join(' · ');
}

function sameRankComboTotalValid(
  rank: RegicideCardRank,
  count: number,
): boolean {
  return getRegicideCardValue(rank) * count <= 10;
}

function partitionRegicideDraft(cards: RegicideCard[]): {
  aces: RegicideCard[];
  nonAces: RegicideCard[];
} {
  const aces: RegicideCard[] = [];
  const nonAces: RegicideCard[] = [];
  for (const card of cards) {
    if (card.rank === 'A') {
      aces.push(card);
    } else {
      nonAces.push(card);
    }
  }
  return { aces, nonAces };
}

function isSameRankCombo(nonAces: RegicideCard[]): boolean {
  if (nonAces.length <= 1) return true;
  const rank = nonAces[0].rank;
  if (nonAces.length > 4) return false;
  if (!nonAces.every((card) => card.rank === rank)) return false;
  return sameRankComboTotalValid(rank, nonAces.length);
}

/** Jugada completa: no se pueden añadir más cartas. */
function isRegicideDraftComplete(cards: RegicideCard[]): boolean {
  if (cards.length === 0) return false;
  const startedWithAce = cards[0].rank === 'A';
  const { aces, nonAces } = partitionRegicideDraft(cards);

  if (startedWithAce) {
    return aces.length === 2;
  }

  return aces.length === 1 && nonAces.length === 1;
}

export function canCombineRegicideCards(cards: RegicideCard[]): boolean {
  if (cards.length <= 1) return true;

  const startedWithAce = cards[0].rank === 'A';
  const { aces, nonAces } = partitionRegicideDraft(cards);

  if (startedWithAce) {
    // As inicial: solo otro as (A+A) o as suelto.
    if (nonAces.length > 0) return false;
    if (aces.length > 2) return false;
    return aces.length === 2;
  }

  // Carta normal inicial: combo o carta + un as (cualquier palo).
  if (aces.length > 1) return false;
  if (aces.length === 1 && nonAces.length >= 2) return false;
  if (aces.length === 1 && nonAces.length === 1) return true;

  if (aces.length === 0) {
    return isSameRankCombo(nonAces);
  }

  return false;
}

export function canAddRegicideCard(
  current: RegicideCard[],
  next: RegicideCard,
): boolean {
  if (current.length === 0) return true;
  return canCombineRegicideCards([...current, next]);
}

function isCardPlayedAgainstBoss(
  boss: RegicideBossState,
  card: RegicideCard,
): boolean {
  const key = regicideCardKey(card);
  return boss.playedCards.some(
    (played) => regicideCardKey(played) === key,
  );
}

export function getAvailableRegicideCards(
  session: RegicideSession,
  suit: RegicideSuit,
  boss: RegicideBossState,
): RegicideCard[] {
  const cards: RegicideCard[] = NUMERIC_RANKS.map((rank) => ({
    suit,
    rank,
  }));

  for (const royalId of session.defeatedRoyals) {
    const [rank, royalSuit] = royalId.split('_') as [
      RegicideCardRank,
      RegicideSuit,
    ];
    if (royalSuit === suit && ['J', 'Q', 'K'].includes(rank)) {
      cards.push({ suit, rank: rank as RegicideCardRank });
    }
  }

  return cards.filter((card) => !isCardPlayedAgainstBoss(boss, card));
}

export function getPickableRegicideCards(
  session: RegicideSession,
  boss: RegicideBossState,
  selectedSuit: RegicideSuit | null,
  draftCards: RegicideCard[],
): RegicideCard[] {
  if (draftCards.length === 0) {
    if (!selectedSuit) return [];
    return getAvailableRegicideCards(session, selectedSuit, boss);
  }

  const pool: RegicideCard[] = [];
  for (const suit of REGICIDE_SUITS) {
    pool.push(...getAvailableRegicideCards(session, suit, boss));
  }

  const unique = new Map<string, RegicideCard>();
  for (const card of pool) {
    unique.set(regicideCardKey(card), card);
  }

  if (isRegicideDraftComplete(draftCards)) {
    return [];
  }

  const startedWithAce = draftCards[0].rank === 'A';
  const { aces, nonAces } = partitionRegicideDraft(draftCards);
  if (startedWithAce && aces.length >= 2) {
    return [];
  }
  if (!startedWithAce && aces.length === 0 && nonAces.length >= 4) {
    return [];
  }

  return [...unique.values()].filter((card) => {
    const isSelected = draftCards.some(
      (selected) =>
        selected.suit === card.suit && selected.rank === card.rank,
    );
    if (isSelected) return false;
    return canAddRegicideCard(draftCards, card);
  });
}

function allTierDefeated(session: RegicideSession): boolean {
  return getTierBossIds(session.currentTier).every(
    (id) => session.bosses[id].defeated,
  );
}

function advanceTier(session: RegicideSession): RegicideSession {
  if (session.currentTier === 'J') {
    return {
      ...createTierSession(session.defeatedRoyals, 'Q'),
      undoSnapshot: session.undoSnapshot,
    };
  }
  if (session.currentTier === 'Q') {
    return {
      ...createTierSession(session.defeatedRoyals, 'K'),
      undoSnapshot: session.undoSnapshot,
    };
  }
  return {
    ...session,
    victory: true,
    activeBossId: null,
  };
}

export function selectRegicideBoss(
  session: RegicideSession,
  bossId: RegicideBossId,
): RegicideSession {
  const boss = session.bosses[bossId];
  if (!boss || boss.defeated) return session;
  return {
    ...session,
    activeBossId: bossId,
  };
}

export function confirmRegicideAttack(
  session: RegicideSession,
  cards: RegicideCard[],
): RegicideSession {
  if (!session.activeBossId || cards.length === 0) return session;
  if (!canCombineRegicideCards(cards)) return session;

  const snapshot = cloneSession(session);
  const next = cloneSession(session);
  const boss = next.bosses[session.activeBossId];
  if (!boss || boss.defeated) return session;

  for (const card of cards) {
    if (isCardPlayedAgainstBoss(boss, card)) return session;
  }

  const actionIndex = boss.actions.length;
  const damageDealt = calculateDamageForAction(boss, cards, actionIndex);
  const attackReduction = calculateAttackReductionForAction(
    boss,
    cards,
    actionIndex,
  );

  const updatedBoss: RegicideBossState = {
    ...boss,
    playedCards: [...boss.playedCards, ...cards],
    actions: [
      ...boss.actions,
      {
        type: 'attack',
        cards,
        damageDealt,
        attackReduction,
      },
    ],
    currentHp: Math.max(0, boss.currentHp - damageDealt),
  };

  updatedBoss.currentAttack = recalculateBossAttack(updatedBoss);

  if (updatedBoss.currentHp <= 0) {
    updatedBoss.defeated = true;
    updatedBoss.currentHp = 0;
  }

  next.bosses[session.activeBossId] = updatedBoss;
  next.undoSnapshot = snapshot;

  if (updatedBoss.defeated) {
    if (!next.defeatedRoyals.includes(updatedBoss.id)) {
      next.defeatedRoyals = [...next.defeatedRoyals, updatedBoss.id];
    }
    next.activeBossId = null;

    if (allTierDefeated(next)) {
      return advanceTier(next);
    }
  }

  return next;
}

export function confirmRegicideJoker(
  session: RegicideSession,
): RegicideSession {
  if (!session.activeBossId) return session;

  const snapshot = cloneSession(session);
  const next = cloneSession(session);
  const boss = next.bosses[session.activeBossId];
  if (!boss || boss.defeated || boss.immunityRemoved) return session;

  const updatedBoss: RegicideBossState = {
    ...boss,
    immunityRemoved: true,
    actions: [...boss.actions, { type: 'joker' }],
  };
  updatedBoss.currentAttack = recalculateBossAttack(updatedBoss);
  next.bosses[session.activeBossId] = updatedBoss;
  next.undoSnapshot = snapshot;
  return next;
}

export function undoRegicideAction(session: RegicideSession): RegicideSession {
  if (!session.undoSnapshot) return session;
  return {
    ...cloneSession(session.undoSnapshot),
    undoSnapshot: null,
  };
}

export function clearRegicideActiveBoss(
  session: RegicideSession,
): RegicideSession {
  return {
    ...session,
    activeBossId: null,
  };
}

export function getActiveRegicideBoss(
  session: RegicideSession,
): RegicideBossState | null {
  if (!session.activeBossId) return null;
  return session.bosses[session.activeBossId] ?? null;
}

export function getRegicideTierBosses(
  session: RegicideSession,
): RegicideBossState[] {
  return getTierBossIds(session.currentTier).map((id) => session.bosses[id]);
}

const REGICIDE_TIER_ORDER: RegicideTier[] = ['J', 'Q', 'K'];

export type RegicideBossDisplay = {
  id: RegicideBossId;
  rank: RegicideRank;
  suit: RegicideSuit;
};

export function getRemainingRegicideBosses(
  session: RegicideSession,
): RegicideBossDisplay[] {
  const currentTierIndex = REGICIDE_TIER_ORDER.indexOf(session.currentTier);
  const remaining: RegicideBossDisplay[] = [];

  for (
    let tierIndex = currentTierIndex;
    tierIndex < REGICIDE_TIER_ORDER.length;
    tierIndex += 1
  ) {
    const tier = REGICIDE_TIER_ORDER[tierIndex];
    for (const suit of REGICIDE_SUITS) {
      const id = `${tier}_${suit}` as RegicideBossId;
      if (session.defeatedRoyals.includes(id)) continue;
      if (tier === session.currentTier) {
        const boss = session.bosses[id];
        if (!boss || boss.defeated) continue;
      }
      remaining.push({ id, rank: tier, suit });
    }
  }

  return remaining;
}
