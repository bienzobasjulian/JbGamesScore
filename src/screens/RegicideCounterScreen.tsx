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
import { useKeepAwake } from 'expo-keep-awake';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { GameOverflowMenu } from '../components/GameOverflowMenu';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { TourAnchor, useAutoTour, useOnboarding } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  applyRegicideAttackToBoss,
  canAddRegicideCard,
  canCombineRegicideCards,
  clearRegicideActiveBoss,
  confirmRegicideAttack,
  confirmRegicideJoker,
  createRegicideSession,
  formatRegicideAttackPreview,
  formatRegicideBossLabel,
  formatRegicideCardLabel,
  getActiveRegicideBoss,
  getPickableRegicideCards,
  getRegicideTierBosses,
  getRemainingRegicideBosses,
  previewRegicideAttack,
  REGICIDE_HOW_TO_PLAY,
  REGICIDE_HOW_TO_PLAY_SECTIONS,
  REGICIDE_SUIT_EMOJI,
  REGICIDE_SUITS,
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
  onDefeatAndExit: () => void;
  onDeleteAndExit: () => void;
};

type ScreenMode = 'select_boss' | 'combat' | 'pick_cards';

type StatAnimation = {
  hp: { from: number; to: number; delta: number };
  atk?: { from: number; to: number; delta: number };
};

type SuitEffectToast = {
  curar?: number;
  robar?: number;
  /** Exacto → Taberna; exceso de daño → descarte. */
  defeat?: 'tavern' | 'discard';
};

const STAT_ANIM_DURATION_MS = 750;
const STAT_ANIM_SETTLE_MS = 400;
const BOSS_FADE_DURATION_MS = 900;

type DefeatTransitionPhase = 'none' | 'stats' | 'fade';

const getSuitColors = (theme: AppTheme): Record<RegicideSuit, string> => ({
  hearts: '#E85D4C',
  diamonds: '#E85D4C',
  clubs: theme.text,
  spades: theme.text,
});
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
  onDefeatAndExit,
  onDeleteAndExit,
}: Props) {
  useKeepAwake();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const suitColors = useMemo(() => getSuitColors(theme), [theme]);
  const { startTour, skipTour, activeTourId } = useOnboarding();

  const [mode, setMode] = useState<ScreenMode>(
    session.activeBossId ? 'combat' : 'select_boss',
  );
  const [selectedSuit, setSelectedSuit] = useState<RegicideSuit | null>(null);
  const [draftCards, setDraftCards] = useState<RegicideCard[]>([]);
  const [pendingJoker, setPendingJoker] = useState(false);
  const [statAnimation, setStatAnimation] = useState<StatAnimation | null>(null);
  const [suitEffectToast, setSuitEffectToast] =
    useState<SuitEffectToast | null>(null);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [restartModalVisible, setRestartModalVisible] = useState(false);
  const [surrenderModalVisible, setSurrenderModalVisible] = useState(false);
  const [howToVisible, setHowToVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState<RegicideSession | null>(
    null,
  );
  const [defeatTransitionPhase, setDefeatTransitionPhase] =
    useState<DefeatTransitionPhase>('none');
  const bossOpacity = useRef(new Animated.Value(1)).current;
  const statsPhaseStartedAtRef = useRef<number | null>(null);
  const pendingStatAnimationRef = useRef<StatAnimation | null>(null);
  const deferredSessionRef = useRef<RegicideSession | null>(null);

  const isCombatLocked =
    defeatTransitionPhase !== 'none' || suitEffectToast != null;
  const isSelectBoss = !session.victory && mode === 'select_boss';
  const isCombat = !session.victory && mode === 'combat';

  useAutoTour('regicideSelect', {
    enabled: isSelectBoss && !howToVisible,
  });
  useAutoTour('regicideCombat', {
    enabled: isCombat && !howToVisible,
  });

  useEffect(() => {
    if (!activeTourId) return;
    if (mode !== 'select_boss' && activeTourId === 'regicideSelect') {
      skipTour();
    }
    if (mode !== 'combat' && activeTourId === 'regicideCombat') {
      skipTour();
    }
  }, [activeTourId, mode, skipTour]);

  const handleRequestExit = () => setExitModalVisible(true);
  const handleOpenHowTo = () => {
    skipTour();
    setHowToVisible(true);
  };
  const handleReplayTutorial = () => {
    if (mode === 'select_boss') {
      startTour('regicideSelect', { force: true });
      return;
    }
    startTour('regicideCombat', { force: true });
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (howToVisible) {
          setHowToVisible(false);
          return true;
        }
        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }
        if (restartModalVisible) {
          setRestartModalVisible(false);
          return true;
        }
        if (surrenderModalVisible) {
          setSurrenderModalVisible(false);
          return true;
        }
        if (suitEffectToast) {
          handleDismissSuitEffectToast();
          return true;
        }
        handleRequestExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [exitModalVisible, howToVisible, restartModalVisible, surrenderModalVisible, suitEffectToast]);

  useEffect(() => {
    ScreenOrientation.lockAsync(
      howToVisible
        ? ScreenOrientation.OrientationLock.PORTRAIT_UP
        : ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => undefined);
  }, [howToVisible]);

  useEffect(() => {
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

  const resetCombatUi = () => {
    setDraftCards([]);
    setSelectedSuit(null);
    setPendingJoker(false);
    setStatAnimation(null);
    setSuitEffectToast(null);
    setPendingSession(null);
    setDefeatTransitionPhase('none');
    pendingStatAnimationRef.current = null;
    deferredSessionRef.current = null;
    statsPhaseStartedAtRef.current = null;
    bossOpacity.setValue(1);
    setMode('select_boss');
  };

  const handleRestartMatch = () => {
    onUpdateSession(createRegicideSession());
    resetCombatUi();
    setRestartModalVisible(false);
  };

  useEffect(() => {
    if (
      !statAnimation ||
      defeatTransitionPhase !== 'none' ||
      pendingSession
    ) {
      return;
    }
    const timer = setTimeout(
      () => setStatAnimation(null),
      STAT_ANIM_DURATION_MS + STAT_ANIM_SETTLE_MS,
    );
    return () => clearTimeout(timer);
  }, [defeatTransitionPhase, pendingSession, statAnimation]);

  useEffect(() => {
    if (defeatTransitionPhase !== 'stats' || !pendingSession) return;
    // Esperar a que el jugador confirme Curar/Robar en mesa.
    if (suitEffectToast) return;

    const minDelay = statAnimation
      ? STAT_ANIM_DURATION_MS + STAT_ANIM_SETTLE_MS
      : 0;
    const elapsed = statsPhaseStartedAtRef.current
      ? Date.now() - statsPhaseStartedAtRef.current
      : 0;
    const delay = Math.max(0, minDelay - elapsed);

    const timer = setTimeout(() => {
      setDefeatTransitionPhase('fade');
      Animated.timing(bossOpacity, {
        toValue: 0,
        duration: BOSS_FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        onUpdateSession(pendingSession);
        setPendingSession(null);
        bossOpacity.setValue(1);
        setStatAnimation(null);
        statsPhaseStartedAtRef.current = null;
        setDefeatTransitionPhase('none');
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [
    bossOpacity,
    defeatTransitionPhase,
    onUpdateSession,
    pendingSession,
    statAnimation,
    suitEffectToast,
  ]);

  const combatStatBoss = useMemo(() => {
    if (!activeBoss) return null;
    if (!pendingSession || !statAnimation) return activeBoss;
    return {
      ...activeBoss,
      currentHp: statAnimation.hp.to,
      currentAttack: statAnimation.atk?.to ?? activeBoss.currentAttack,
    };
  }, [activeBoss, pendingSession, statAnimation]);

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
    if (isCombatLocked) return;
    if (pendingJoker) {
      onUpdateSession(confirmRegicideJoker(session));
      resetDraft();
      return;
    }
    if (!canCombineRegicideCards(draftCards) || !activeBoss) return;

    const attackPreview = previewRegicideAttack(activeBoss, draftCards);
    const hpFrom = activeBoss.currentHp;
    const atkFrom = activeBoss.currentAttack;
    const projectedBoss = applyRegicideAttackToBoss(activeBoss, draftCards);
    if (!projectedBoss) return;

    const nextSession = confirmRegicideAttack(session, draftCards);

    const nextStatAnimation: StatAnimation | null =
      attackPreview.damage > 0 || attackPreview.attackReduction > 0
        ? {
            hp: {
              from: hpFrom,
              to: projectedBoss.currentHp,
              delta: Math.min(attackPreview.damage, hpFrom),
            },
            ...(attackPreview.attackReduction > 0
              ? {
                  atk: {
                    from: atkFrom,
                    to: projectedBoss.currentAttack,
                    delta: Math.min(attackPreview.attackReduction, atkFrom),
                  },
                }
              : {}),
          }
        : null;

    const toast: SuitEffectToast = {
      ...(attackPreview.heartsActive
        ? { curar: attackPreview.totalValue }
        : {}),
      ...(attackPreview.diamondsActive
        ? { robar: attackPreview.totalValue }
        : {}),
    };

    if (projectedBoss.defeated) {
      const exactKill = attackPreview.damage === hpFrom;
      toast.defeat = exactKill ? 'tavern' : 'discard';
    }

    const hasToast =
      toast.curar != null || toast.robar != null || toast.defeat != null;
    const deferStatsForSuit =
      toast.curar != null || toast.robar != null;

    if (projectedBoss.defeated) {
      setPendingSession(nextSession);
      setDefeatTransitionPhase('stats');
      if (deferStatsForSuit) {
        pendingStatAnimationRef.current = nextStatAnimation;
      } else {
        if (nextStatAnimation) setStatAnimation(nextStatAnimation);
        statsPhaseStartedAtRef.current = Date.now();
      }
      if (hasToast) setSuitEffectToast(toast);
      resetDraft();
      return;
    }

    if (deferStatsForSuit) {
      pendingStatAnimationRef.current = nextStatAnimation;
      deferredSessionRef.current = nextSession;
      setSuitEffectToast(toast);
      resetDraft();
      return;
    }

    if (nextStatAnimation) setStatAnimation(nextStatAnimation);
    if (hasToast) setSuitEffectToast(toast);
    onUpdateSession(nextSession);
    resetDraft();
  };

  const handleDismissSuitEffectToast = () => {
    setSuitEffectToast(null);

    const deferredAnim = pendingStatAnimationRef.current;
    pendingStatAnimationRef.current = null;
    if (deferredAnim) {
      setStatAnimation(deferredAnim);
    }
    if (
      defeatTransitionPhase === 'stats' &&
      statsPhaseStartedAtRef.current == null
    ) {
      statsPhaseStartedAtRef.current = Date.now();
    }

    const deferredSession = deferredSessionRef.current;
    if (deferredSession) {
      deferredSessionRef.current = null;
      onUpdateSession(deferredSession);
    }
  };

  const handleUndo = () => {
    if (isCombatLocked) return;
    onUpdateSession(undoRegicideAction(session));
    resetDraft();
  };

  const handleChangeBoss = () => {
    if (isCombatLocked) return;
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

  const defeatedCount = session.defeatedRoyals.length;

  const overflowMenu = (
    <GameOverflowMenu
      visible={actionsMenuVisible}
      onClose={() => setActionsMenuVisible(false)}
      items={[
        {
          title: 'Ver tutorial',
          hint: 'Repasa los botones de esta pantalla',
          onPress: handleReplayTutorial,
        },
        {
          title: 'Cómo jugar',
          hint: 'Resumen de las reglas de Regicide',
          onPress: handleOpenHowTo,
        },
        {
          title: 'Reiniciar partida',
          hint: 'Vuelve a empezar desde la primera jota',
          onPress: () => setRestartModalVisible(true),
        },
        ...(session.victory
          ? []
          : [
              {
                title: 'Rendirse',
                hint: 'Cierra la partida como derrota',
                onPress: () => setSurrenderModalVisible(true),
              },
            ]),
      ]}
    />
  );

  const confirmModals = (
    <>
      <ConfirmModal
        visible={restartModalVisible}
        title="Reiniciar partida"
        message="Se borrará el progreso actual y empezaréis de nuevo desde las jotas. Esta acción no se puede deshacer."
        confirmLabel="Reiniciar"
        danger
        onConfirm={handleRestartMatch}
        onCancel={() => setRestartModalVisible(false)}
      />
      <ConfirmModal
        visible={surrenderModalVisible}
        title="¿Rendirse?"
        message={`Se marcará la partida como derrota y se guardará el progreso (${defeatedCount}/12 enemigos).`}
        confirmLabel="Rendirse"
        danger
        onConfirm={() => {
          setSurrenderModalVisible(false);
          onDefeatAndExit();
        }}
        onCancel={() => setSurrenderModalVisible(false)}
      />
    </>
  );

  const menuButton = (
    <Pressable
      onPress={() => setActionsMenuVisible(true)}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
      accessibilityLabel="Más acciones"
    >
      <Text style={styles.menuDots}>⋮</Text>
    </Pressable>
  );

  if (howToVisible) {
    return (
      <View style={styles.container}>
        <HowToPlayScreen
          title="Cómo jugar"
          body={REGICIDE_HOW_TO_PLAY}
          sections={REGICIDE_HOW_TO_PLAY_SECTIONS}
          onBack={() => setHowToVisible(false)}
        />
      </View>
    );
  }

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
        {overflowMenu}
        {confirmModals}
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
            {menuButton}
          </View>

          <TourAnchor id="regicide.bosses" style={styles.bossSelectRow}>
            {tierBosses.map((boss) => (
              <BossSelectCard
                key={boss.id}
                boss={boss}
                onPress={() => handleSelectBoss(boss.id)}
              />
            ))}
          </TourAnchor>
        </View>
        {exitModal}
        {overflowMenu}
        {confirmModals}
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
        {confirmModals}
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
          <TourAnchor id="regicide.top" style={styles.topTourWrap}>
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
                disabled={!session.undoSnapshot || isCombatLocked}
                style={[
                  styles.iconBtn,
                  (!session.undoSnapshot || isCombatLocked) &&
                    styles.iconBtnDisabled,
                ]}
              >
                <Text style={styles.iconBtnText}>↩</Text>
              </Pressable>
              <Pressable
                onPress={handleChangeBoss}
                disabled={isCombatLocked}
                style={[
                  styles.iconBtn,
                  isCombatLocked && styles.iconBtnDisabled,
                ]}
              >
                <Text style={styles.iconBtnText}>⇄</Text>
              </Pressable>
            </View>
          </TourAnchor>
          {menuButton}
        </View>

        <TourAnchor id="regicide.stats" style={styles.combatRow}>
        <AnimatedStatPanel
          title="Vida"
          value={combatStatBoss?.currentHp ?? activeBoss.currentHp}
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

        <Animated.View style={[styles.centerPanelOuter, { opacity: bossOpacity }]}>
          <BossCenterPanel boss={activeBoss} />
        </Animated.View>

        <AnimatedStatPanel
          title="Ataque"
          value={combatStatBoss?.currentAttack ?? activeBoss.currentAttack}
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
        </TourAnchor>

        <TourAnchor
          id="regicide.suits"
          style={[styles.suitRow, isCombatLocked && styles.suitRowDisabled]}
        >
        {REGICIDE_SUITS.map((suit) => (
          <Pressable
            key={suit}
            onPress={() => handleSelectSuit(suit)}
            disabled={isCombatLocked}
            style={({ pressed }) => [
              styles.suitCardBtn,
              { borderColor: suitColors[suit] },
              isCombatLocked && styles.iconBtnDisabled,
              pressed && !isCombatLocked && styles.suitCardBtnPressed,
            ]}
          >
            <Text style={[styles.suitCardEmoji, { color: suitColors[suit] }]}>
              {REGICIDE_SUIT_EMOJI[suit]}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={handleSelectJoker}
          disabled={activeBoss.immunityRemoved || isCombatLocked}
          style={({ pressed }) => [
            styles.suitCardBtn,
            styles.jokerCardBtn,
            (activeBoss.immunityRemoved || isCombatLocked) &&
              styles.iconBtnDisabled,
            pressed && !isCombatLocked && styles.suitCardBtnPressed,
          ]}
        >
          <Text style={styles.suitCardEmoji}>🃏</Text>
        </Pressable>
        </TourAnchor>
        {suitEffectToast ? (
          <SuitEffectToastOverlay
            toast={suitEffectToast}
            onDismiss={handleDismissSuitEffectToast}
          />
        ) : null}
      </View>
      {exitModal}
      {overflowMenu}
      {confirmModals}
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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const suitColors = getSuitColors(theme);

  return (
    <View style={[styles.miniBossCard, active && styles.miniBossCardActive]}>
      <Text style={[styles.miniBossRank, { color: suitColors[suit] }]}>
        {rank}
      </Text>
      <Text style={[styles.miniBossSuit, { color: suitColors[suit] }]}>
        {REGICIDE_SUIT_EMOJI[suit]}
      </Text>
    </View>
  );
}

function SuitEffectToastOverlay({
  toast,
  onDismiss,
}: {
  toast: SuitEffectToast;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, toast, translateY]);

  const suitBlocks: { title: string; subtitle: string; color: string }[] = [];
  if (toast.curar != null) {
    suitBlocks.push({
      title: `Curar ${toast.curar}`,
      subtitle:
        'Baraja el descarte y pon las cartas en la parte baja de la Taberna.',
      color: '#E85D4C',
    });
  }
  if (toast.robar != null) {
    suitBlocks.push({
      title: `Robar ${toast.robar}`,
      subtitle:
        'Cada jugador roba de la Taberna en orden (empezando por quien tenía el turno) hasta completar su mano.',
      color: '#E85D4C',
    });
  }

  const defeatSubtitle =
    toast.defeat === 'tavern'
      ? 'Colócalo encima de la Taberna'
      : toast.defeat === 'discard'
        ? 'Colócalo en el descarte'
        : null;

  return (
    <Pressable
      style={styles.suitEffectOverlay}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Cerrar aviso de efecto"
    >
      <Animated.View
        style={[
          styles.suitEffectToast,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        {suitBlocks.map((block) => (
          <View key={block.title} style={styles.suitEffectBlock}>
            <Text style={[styles.suitEffectText, { color: block.color }]}>
              {block.title}
            </Text>
            <Text style={styles.suitEffectSubtitle}>{block.subtitle}</Text>
          </View>
        ))}
        {defeatSubtitle ? (
          <View style={styles.suitEffectBlock}>
            <Text style={[styles.suitEffectText, { color: theme.success }]}>
              Enemigo derrotado
            </Text>
            <Text style={styles.suitEffectSubtitle}>{defeatSubtitle}</Text>
          </View>
        ) : null}
        <Text style={styles.suitEffectHint}>Toca para continuar</Text>
      </Animated.View>
    </Pressable>
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
  const styles = useThemedStyles(createStyles);
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const [showDelta, setShowDelta] = useState(false);
  const activeAnimationKeyRef = useRef<string | null>(null);

  const animationKey = animation
    ? `${animation.from}:${animation.to}:${animation.delta}`
    : null;

  useEffect(() => {
    if (!animation) {
      activeAnimationKeyRef.current = null;
      anim.setValue(value);
      setDisplay(value);
      setShowDelta(false);
      return;
    }

    if (activeAnimationKeyRef.current === animationKey) {
      return;
    }

    activeAnimationKeyRef.current = animationKey;

    anim.stopAnimation();
    anim.setValue(animation.from);
    setDisplay(animation.from);
    setShowDelta(true);

    const listener = anim.addListener(({ value: v }) => {
      setDisplay(Math.max(0, Math.round(v)));
    });

    const timing = Animated.timing(anim, {
      toValue: animation.to,
      duration: STAT_ANIM_DURATION_MS,
      useNativeDriver: false,
    });

    timing.start(({ finished }) => {
      if (finished) {
        setDisplay(animation.to);
        setTimeout(() => setShowDelta(false), 350);
      }
    });

    return () => {
      timing.stop();
      anim.removeListener(listener);
    };
  }, [anim, animationKey, value]);

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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const suitColors = getSuitColors(theme);

  return (
    <View style={styles.centerPanelOuter}>
      <View style={styles.bossPortraitCard}>
        <Text
          style={[styles.bossRank, { color: suitColors[boss.suit] }]}
        >
          {boss.rank}
        </Text>
        <Text
          style={[styles.bossSuitLarge, { color: suitColors[boss.suit] }]}
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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const suitColors = getSuitColors(theme);

  return (
    <View style={[styles.cardBtn, selected && styles.cardBtnSelected]}>
      <Text style={[styles.cardBtnRank, { color: suitColors[card.suit] }]}>
        {card.rank}
      </Text>
      <Text style={[styles.cardBtnSuit, { color: suitColors[card.suit] }]}>
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
  const styles = useThemedStyles(createStyles);
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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const suitColors = getSuitColors(theme);
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
          { color: suitColors[boss.suit] },
          disabled && styles.bossCardLabelDefeated,
        ]}
      >
        {formatRegicideBossLabel(boss)}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suitEffectOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 72,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  suitEffectToast: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    maxWidth: 520,
  },
  suitEffectBlock: {
    alignItems: 'center',
    gap: 4,
  },
  suitEffectText: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
  },
  suitEffectSubtitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 2,
  },
  suitEffectHint: {
    marginTop: 4,
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
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
  topTourWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 0,
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  menuDots: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  remainingBossesScroll: {
    flex: 1,
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
  suitRowDisabled: {
    opacity: 0.55,
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
