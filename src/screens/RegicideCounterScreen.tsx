import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Button } from '../components/Button';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { theme } from '../constants';
import {
  canAddRegicideCard,
  canCombineRegicideCards,
  clearRegicideActiveBoss,
  confirmRegicideAttack,
  confirmRegicideJoker,
  formatRegicideAttackPreview,
  formatRegicideBossLabel,
  formatRegicideCardLabel,
  getActiveRegicideBoss,
  getPickableRegicideCards,
  getRegicideTierBosses,
  getRemainingRegicideBosses,
  previewRegicideAttack,
  REGICIDE_SUIT_EMOJI,
  REGICIDE_SUITS,
  REGICIDE_TIER_LABEL,
  RegicideBossId,
  RegicideBossState,
  RegicideCard,
  RegicideCardRank,
  RegicideSession,
  RegicideSuit,
  selectRegicideBoss,
  undoRegicideAction,
} from '../utils/regicide';

type Props = {
  session: RegicideSession;
  onUpdateSession: (session: RegicideSession) => void;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
};

type ScreenMode = 'select_boss' | 'combat' | 'pick_cards';

type StatAnimation = {
  hp: { from: number; to: number; delta: number };
  atk?: { from: number; to: number; delta: number };
};

const STAT_ANIM_DURATION_MS = 750;

const SUIT_COLORS: Record<RegicideSuit, string> = {
  hearts: '#E85D4C',
  diamonds: '#E85D4C',
  clubs: theme.text,
  spades: theme.text,
};

const STANDARD_CARD_ROWS: RegicideCardRank[][] = [
  ['A', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10'],
];

const ROYAL_RANKS: RegicideCardRank[] = ['J', 'Q', 'K'];

const RANK_SORT_ORDER: RegicideCardRank[] = [
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
  'J',
  'Q',
  'K',
];

function sortRegicideCards(cards: RegicideCard[]): RegicideCard[] {
  return [...cards].sort((a, b) => {
    const rankDiff =
      RANK_SORT_ORDER.indexOf(a.rank) - RANK_SORT_ORDER.indexOf(b.rank);
    if (rankDiff !== 0) return rankDiff;
    return REGICIDE_SUITS.indexOf(a.suit) - REGICIDE_SUITS.indexOf(b.suit);
  });
}

function buildCardPickerRows(
  cards: RegicideCard[],
  draftCards: RegicideCard[],
): RegicideCard[][] {
  if (draftCards.length === 0) {
    const rows: RegicideCard[][] = [];
    for (const ranks of STANDARD_CARD_ROWS) {
      const row = ranks
        .map((rank) => cards.find((card) => card.rank === rank))
        .filter((card): card is RegicideCard => card != null);
      if (row.length > 0) rows.push(row);
    }
    const royals = ROYAL_RANKS.map((rank) =>
      cards.find((card) => card.rank === rank),
    ).filter((card): card is RegicideCard => card != null);
    if (royals.length > 0) rows.push(royals);
    return rows;
  }

  const sorted = sortRegicideCards(cards);
  const rows: RegicideCard[][] = [];
  for (let i = 0; i < sorted.length; i += 5) {
    rows.push(sorted.slice(i, i + 5));
  }
  return rows;
}

export function RegicideCounterScreen({
  session,
  onUpdateSession,
  onSaveAndExit,
  onDeleteAndExit,
}: Props) {
  const [mode, setMode] = useState<ScreenMode>(
    session.activeBossId ? 'combat' : 'select_boss',
  );
  const [selectedSuit, setSelectedSuit] = useState<RegicideSuit | null>(null);
  const [draftCards, setDraftCards] = useState<RegicideCard[]>([]);
  const [pendingJoker, setPendingJoker] = useState(false);
  const [statAnimation, setStatAnimation] = useState<StatAnimation | null>(null);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const handleRequestExit = () => setExitModalVisible(true);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }
        handleRequestExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [exitModalVisible]);

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => undefined);
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (session.victory) return;
    if (!session.activeBossId) {
      setMode('select_boss');
    }
  }, [session.activeBossId, session.victory]);

  const activeBoss = getActiveRegicideBoss(session);
  const tierBosses = getRegicideTierBosses(session);
  const remainingBosses = useMemo(
    () => getRemainingRegicideBosses(session),
    [session],
  );

  const preview = useMemo(() => {
    if (!activeBoss || draftCards.length === 0) return null;
    return previewRegicideAttack(activeBoss, draftCards);
  }, [activeBoss, draftCards]);

  const pickableCards = useMemo(() => {
    if (!activeBoss || pendingJoker) return [];
    return getPickableRegicideCards(
      session,
      activeBoss,
      selectedSuit,
      draftCards,
    );
  }, [activeBoss, draftCards, pendingJoker, selectedSuit, session]);

  const resetDraft = () => {
    setDraftCards([]);
    setSelectedSuit(null);
    setPendingJoker(false);
    setMode('combat');
  };

  useEffect(() => {
    if (!statAnimation) return;
    const timer = setTimeout(() => setStatAnimation(null), STAT_ANIM_DURATION_MS + 400);
    return () => clearTimeout(timer);
  }, [statAnimation]);

  const handleSelectBoss = (bossId: RegicideBossId) => {
    onUpdateSession(selectRegicideBoss(session, bossId));
    resetDraft();
    setMode('combat');
  };

  const handleSelectSuit = (suit: RegicideSuit) => {
    setPendingJoker(false);
    setSelectedSuit(suit);
    setDraftCards([]);
    setMode('pick_cards');
  };

  const handleSelectJoker = () => {
    setDraftCards([]);
    setSelectedSuit(null);
    setPendingJoker(true);
    setMode('pick_cards');
  };

  const handleSelectCard = (card: RegicideCard) => {
    if (draftCards.length === 0) {
      setDraftCards([card]);
      return;
    }
    if (draftCards.some((c) => c.suit === card.suit && c.rank === card.rank)) {
      return;
    }
    if (!canAddRegicideCard(draftCards, card)) return;
    setDraftCards((prev) => [...prev, card]);
  };

  const handleConfirmAttack = () => {
    if (pendingJoker) {
      onUpdateSession(confirmRegicideJoker(session));
      resetDraft();
      return;
    }
    if (!canCombineRegicideCards(draftCards) || !activeBoss) return;

    const attackPreview = previewRegicideAttack(activeBoss, draftCards);
    const bossId = session.activeBossId;
    const hpFrom = activeBoss.currentHp;
    const atkFrom = activeBoss.currentAttack;
    const nextSession = confirmRegicideAttack(session, draftCards);
    const nextBoss =
      bossId && nextSession.activeBossId === bossId
        ? nextSession.bosses[bossId]
        : null;

    if (
      nextBoss &&
      (attackPreview.damage > 0 || attackPreview.attackReduction > 0)
    ) {
      setStatAnimation({
        hp: {
          from: hpFrom,
          to: nextBoss.currentHp,
          delta: attackPreview.damage,
        },
        ...(attackPreview.attackReduction > 0
          ? {
              atk: {
                from: atkFrom,
                to: nextBoss.currentAttack,
                delta: attackPreview.attackReduction,
              },
            }
          : {}),
      });
    }

    onUpdateSession(nextSession);
    resetDraft();
  };

  const handleUndo = () => {
    onUpdateSession(undoRegicideAction(session));
    resetDraft();
  };

  const handleChangeBoss = () => {
    onUpdateSession(clearRegicideActiveBoss(session));
    resetDraft();
    setMode('select_boss');
  };

  const exitModal = (
    <ExitMatchModal
      visible={exitModalVisible}
      matchTitle="Regicide"
      onClose={() => setExitModalVisible(false)}
      onSaveAndExit={() => {
        setExitModalVisible(false);
        onSaveAndExit();
      }}
      onDeleteAndExit={() => {
        setExitModalVisible(false);
        onDeleteAndExit();
      }}
    />
  );

  if (session.victory) {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.victoryWrap}>
            <Text style={styles.victoryTitle}>¡Victoria!</Text>
            <Text style={styles.victoryText}>
              Habéis derrotado a los doce enemigos.
            </Text>
            <Button label="Salir" onPress={handleRequestExit} />
          </View>
        </View>
        {exitModal}
      </>
    );
  }

  if (mode === 'select_boss') {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable onPress={handleRequestExit} style={styles.topBtn}>
              <Text style={styles.topBtnText}>← Salir</Text>
            </Pressable>
          <Text style={styles.screenTitle}>Selecciona el enemigo actual</Text>
          <Text style={styles.tierHint}>
            {REGICIDE_TIER_LABEL[session.currentTier]}
          </Text>
        </View>

        <View style={styles.bossSelectRow}>
          {tierBosses.map((boss) => (
            <BossSelectCard
              key={boss.id}
              boss={boss}
              onPress={() => handleSelectBoss(boss.id)}
            />
          ))}
        </View>
        </View>
        {exitModal}
      </>
    );
  }

  if (!activeBoss) {
    return null;
  }

  if (mode === 'pick_cards') {
    return (
      <>
        <View style={styles.container}>
        <View style={styles.pickCardsTopBar}>
          <Text style={styles.screenTitle}>
            {pendingJoker ? 'Jugar bufón' : 'Selecciona carta para atacar'}
          </Text>
          <Text style={styles.bossStatsText}>
            Boss actual:{' '}
            <Text style={styles.bossStatsValue}>
              {formatRegicideBossLabel(activeBoss)}
            </Text>
            {' · '}Vida{' '}
            <Text style={styles.bossStatsValue}>{activeBoss.currentHp}</Text>
            {' · '}Ataque{' '}
            <Text style={styles.bossStatsValue}>
              {activeBoss.currentAttack}
            </Text>
          </Text>
        </View>

        {pendingJoker ? (
          <View style={styles.pickCardsBody}>
            <View style={styles.jokerPanel}>
              <Text style={styles.jokerEmoji}>🃏</Text>
              <Text style={styles.jokerText}>
                Anula la inmunidad de {formatRegicideBossLabel(activeBoss)} hasta
                derrotarlo.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.pickCardsBody}>
            <CardPickerRows
              cards={pickableCards}
              draftCards={draftCards}
              onSelectCard={handleSelectCard}
            />

            {preview ? (
              <View style={styles.previewPanel}>
                <Text style={styles.previewText}>
                  {formatRegicideAttackPreview(preview)}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.footerWithDraft}>
          <Button
            label="Cancelar ataque"
            variant="secondary"
            onPress={resetDraft}
            style={styles.footerCornerBtn}
          />

          {!pendingJoker && draftCards.length > 0 ? (
            <View style={styles.draftCenter}>
              <Text style={styles.draftLabel}>
                {draftCards.length === 1 ? 'Jugada' : 'Jugadas'}
              </Text>
              <View style={styles.draftCardsRow}>
                {draftCards.map((card, index) => (
                  <View key={`${card.suit}_${card.rank}`} style={styles.draftCardItem}>
                    {index > 0 ? (
                      <Text style={styles.draftPlus}>+</Text>
                    ) : null}
                    <CardFace card={card} selected />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.draftCenter} />
          )}

          <Button
            label="Confirmar ataque"
            onPress={handleConfirmAttack}
            disabled={
              !pendingJoker &&
              (draftCards.length === 0 || !canCombineRegicideCards(draftCards))
            }
            style={styles.footerCornerBtn}
          />
        </View>
        </View>
        {exitModal}
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={handleRequestExit} style={styles.topBtn}>
            <Text style={styles.topBtnText}>← Salir</Text>
          </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.remainingBossesScroll}
          contentContainerStyle={styles.remainingBossesRow}
        >
          {remainingBosses.map((boss) => (
            <MiniBossCard
              key={boss.id}
              rank={boss.rank}
              suit={boss.suit}
              active={boss.id === session.activeBossId}
            />
          ))}
        </ScrollView>
        <View style={styles.topActions}>
          <Pressable
            onPress={handleUndo}
            disabled={!session.undoSnapshot}
            style={[
              styles.iconBtn,
              !session.undoSnapshot && styles.iconBtnDisabled,
            ]}
          >
            <Text style={styles.iconBtnText}>↩</Text>
          </Pressable>
          <Pressable onPress={handleChangeBoss} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⇄</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.combatRow}>
        <AnimatedStatPanel
          title="Vida"
          value={activeBoss.currentHp}
          animation={
            statAnimation
              ? {
                  from: statAnimation.hp.from,
                  to: statAnimation.hp.to,
                  delta: statAnimation.hp.delta,
                }
              : null
          }
          accent={theme.danger}
        />

        <BossCenterPanel boss={activeBoss} />

        <AnimatedStatPanel
          title="Ataque"
          value={activeBoss.currentAttack}
          animation={
            statAnimation?.atk
              ? {
                  from: statAnimation.atk.from,
                  to: statAnimation.atk.to,
                  delta: statAnimation.atk.delta,
                }
              : null
          }
          accent={theme.warning}
        />
      </View>

      <View style={styles.suitRow}>
        {REGICIDE_SUITS.map((suit) => (
          <Pressable
            key={suit}
            onPress={() => handleSelectSuit(suit)}
            style={({ pressed }) => [
              styles.suitCardBtn,
              { borderColor: SUIT_COLORS[suit] },
              pressed && styles.suitCardBtnPressed,
            ]}
          >
            <Text style={[styles.suitCardEmoji, { color: SUIT_COLORS[suit] }]}>
              {REGICIDE_SUIT_EMOJI[suit]}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={handleSelectJoker}
          disabled={activeBoss.immunityRemoved}
          style={({ pressed }) => [
            styles.suitCardBtn,
            styles.jokerCardBtn,
            activeBoss.immunityRemoved && styles.iconBtnDisabled,
            pressed && styles.suitCardBtnPressed,
          ]}
        >
          <Text style={styles.suitCardEmoji}>🃏</Text>
        </Pressable>
      </View>
      </View>
      {exitModal}
    </>
  );
}

function MiniBossCard({
  rank,
  suit,
  active = false,
}: {
  rank: RegicideBossState['rank'];
  suit: RegicideSuit;
  active?: boolean;
}) {
  return (
    <View style={[styles.miniBossCard, active && styles.miniBossCardActive]}>
      <Text style={[styles.miniBossRank, { color: SUIT_COLORS[suit] }]}>
        {rank}
      </Text>
      <Text style={[styles.miniBossSuit, { color: SUIT_COLORS[suit] }]}>
        {REGICIDE_SUIT_EMOJI[suit]}
      </Text>
    </View>
  );
}

function AnimatedStatPanel({
  title,
  value,
  animation,
  accent,
}: {
  title: string;
  value: number;
  animation: { from: number; to: number; delta: number } | null;
  accent: string;
}) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const [showDelta, setShowDelta] = useState(false);

  useEffect(() => {
    if (!animation) {
      anim.setValue(value);
      setDisplay(value);
      setShowDelta(false);
      return;
    }

    anim.setValue(animation.from);
    setDisplay(animation.from);
    setShowDelta(true);

    const listener = anim.addListener(({ value: v }) => {
      setDisplay(Math.max(0, Math.round(v)));
    });

    Animated.timing(anim, {
      toValue: animation.to,
      duration: STAT_ANIM_DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setDisplay(animation.to);
        setTimeout(() => setShowDelta(false), 350);
      }
    });

    return () => {
      anim.removeListener(listener);
    };
  }, [anim, animation, value]);

  return (
    <View style={styles.statPanel}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{display}</Text>
      {showDelta && animation && animation.delta > 0 ? (
        <Text style={[styles.statDelta, { color: accent }]}>
          −{animation.delta}
        </Text>
      ) : null}
    </View>
  );
}

function BossCenterPanel({ boss }: { boss: RegicideBossState }) {
  return (
    <View style={styles.centerPanelOuter}>
      <View style={styles.bossPortraitCard}>
        <Text
          style={[styles.bossRank, { color: SUIT_COLORS[boss.suit] }]}
        >
          {boss.rank}
        </Text>
        <Text
          style={[styles.bossSuitLarge, { color: SUIT_COLORS[boss.suit] }]}
        >
          {REGICIDE_SUIT_EMOJI[boss.suit]}
        </Text>
      </View>
      {boss.immunityRemoved ? (
        <View style={styles.immunityRow}>
          <Text style={styles.jokerInlineEmoji}>🃏</Text>
          <Text style={styles.immunityRemovedText}>Inmunidad anulada</Text>
        </View>
      ) : null}
    </View>
  );
}

function CardFace({
  card,
  selected = false,
}: {
  card: RegicideCard;
  selected?: boolean;
}) {
  return (
    <View style={[styles.cardBtn, selected && styles.cardBtnSelected]}>
      <Text style={[styles.cardBtnRank, { color: SUIT_COLORS[card.suit] }]}>
        {card.rank}
      </Text>
      <Text style={[styles.cardBtnSuit, { color: SUIT_COLORS[card.suit] }]}>
        {REGICIDE_SUIT_EMOJI[card.suit]}
      </Text>
    </View>
  );
}

function CardPickerRows({
  cards,
  draftCards,
  onSelectCard,
}: {
  cards: RegicideCard[];
  draftCards: RegicideCard[];
  onSelectCard: (card: RegicideCard) => void;
}) {
  const rows = buildCardPickerRows(cards, draftCards);

  if (rows.length === 0) {
    return null;
  }

  return (
    <ScrollView
      style={styles.cardScroll}
      contentContainerStyle={styles.cardRowsContainer}
      showsVerticalScrollIndicator={false}
    >
      {rows.map((rowCards, rowIndex) => (
        <View key={rowIndex} style={styles.cardRow}>
          {rowCards.map((card) => (
            <Pressable
              key={`${card.suit}_${card.rank}`}
              onPress={() => onSelectCard(card)}
              style={({ pressed }) => [
                pressed && styles.cardBtnPressed,
              ]}
            >
              <CardFace card={card} />
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function BossSelectCard({
  boss,
  onPress,
}: {
  boss: RegicideBossState;
  onPress: () => void;
}) {
  const disabled = boss.defeated;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bossCard,
        disabled && styles.bossCardDefeated,
        pressed && !disabled && styles.bossCardPressed,
      ]}
    >
      <Text
        style={[
          styles.bossCardLabel,
          { color: SUIT_COLORS[boss.suit] },
          disabled && styles.bossCardLabelDefeated,
        ]}
      >
        {formatRegicideBossLabel(boss)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  topBtn: {
    padding: 8,
    flexShrink: 0,
  },
  topBtnText: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  screenTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  tierHint: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  remainingBossesScroll: {
    flex: 1,
    marginHorizontal: 8,
  },
  remainingBossesRow: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  miniBossCard: {
    width: 28,
    height: 40,
    backgroundColor: theme.surface,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  miniBossCardActive: {
    borderColor: theme.accent,
    borderWidth: 2,
    backgroundColor: theme.surfaceLight,
  },
  miniBossRank: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
  miniBossSuit: {
    fontSize: 10,
    lineHeight: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.35,
  },
  iconBtnText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bossSelectRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bossCard: {
    flex: 1,
    maxWidth: 160,
    aspectRatio: 0.72,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  bossCardPressed: {
    borderColor: theme.accent,
  },
  bossCardDefeated: {
    opacity: 0.35,
  },
  bossCardLabel: {
    fontSize: 56,
    fontWeight: '800',
  },
  bossCardLabelDefeated: {
    color: theme.textMuted,
  },
  combatRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statTitle: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
  },
  statDelta: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  centerPanelOuter: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossPortraitCard: {
    width: 96,
    height: 136,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bossRank: {
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
  },
  bossSuitLarge: {
    fontSize: 36,
    lineHeight: 40,
  },
  immunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  jokerInlineEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  immunityRemovedText: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  suitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  suitCardBtn: {
    flex: 1,
    maxWidth: 72,
    height: 80,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suitCardBtnPressed: {
    backgroundColor: theme.surfaceLight,
    transform: [{ scale: 0.96 }],
  },
  jokerCardBtn: {
    borderColor: theme.success,
  },
  suitCardEmoji: {
    fontSize: 34,
    lineHeight: 38,
  },
  pickCardsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 16,
  },
  pickCardsBody: {
    flex: 1,
  },
  bossStatsText: {
    color: theme.textMuted,
    fontSize: 12,
    textAlign: 'right',
    flexShrink: 1,
  },
  bossStatsValue: {
    color: theme.text,
    fontWeight: '700',
  },
  draftCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  draftLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  draftCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  draftCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  draftPlus: {
    color: theme.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  cardScroll: {
    flex: 1,
    marginBottom: 8,
  },
  cardRowsContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  cardBtn: {
    width: 56,
    height: 72,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBtnSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.surfaceLight,
  },
  cardBtnPressed: {
    transform: [{ scale: 0.96 }],
  },
  cardBtnRank: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardBtnSuit: {
    fontSize: 16,
    marginTop: 2,
  },
  previewPanel: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.accent,
    marginBottom: 8,
  },
  previewText: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  jokerPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  jokerEmoji: {
    fontSize: 64,
  },
  jokerText: {
    color: theme.textMuted,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 22,
  },
  footerWithDraft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  footerCornerBtn: {
    minWidth: 148,
  },
  victoryWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  victoryTitle: {
    color: theme.success,
    fontSize: 36,
    fontWeight: '800',
  },
  victoryText: {
    color: theme.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
});
