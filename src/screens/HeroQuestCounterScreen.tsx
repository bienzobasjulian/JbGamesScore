import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HeroQuestSheetPanel } from '../components/HeroQuestSheetPanel';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { TourAnchor, useAutoTour, useOnboarding } from '../onboarding';
import { useThemedStyles, type AppTheme } from '../theme';
import type { HeroQuestSession, HeroQuestSheet } from '../types';

type Props = {
  session: HeroQuestSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onUpdateSheet: (playerId: string, patch: Partial<HeroQuestSheet>) => void;
};

export function HeroQuestCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onUpdateSheet,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const { startTour } = useOnboarding();
  useAutoTour('heroQuest');
  const [playerId, setPlayerId] = useState(session.players[0]?.id ?? '');
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const { exitModalVisible, setExitModalVisible, requestExit } =
    useExitMatchModal();

  const player =
    session.players.find((item) => item.id === playerId) ?? session.players[0];
  const sheet = player ? session.sheets[player.id] : undefined;
  const title = session.matchName?.trim() || 'HeroQuest';

  const patch = (next: Partial<HeroQuestSheet>) => {
    if (!player || !sheet) return;
    onUpdateSheet(player.id, next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={requestExit} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TourAnchor id="heroQuest.menu">
          <Pressable
            onPress={() => setActionsMenuVisible(true)}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <Text style={styles.menuIcon}>{'\u22EE'}</Text>
          </Pressable>
        </TourAnchor>
      </View>

      <TourAnchor id="heroQuest.players">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.playerScroll}
        contentContainerStyle={styles.playerRow}
      >
        {session.players.map((item) => {
          const selected = item.id === player?.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setPlayerId(item.id)}
              style={[styles.playerChip, selected && styles.playerChipOn]}
            >
              <Text
                style={[
                  styles.playerChipText,
                  selected && styles.playerChipTextOn,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      </TourAnchor>

      {player && sheet ? (
        sheet.heroId ? (
          <TourAnchor id="heroQuest.sheet" style={styles.sheetAnchor}>
          <HeroQuestSheetPanel
            sheet={sheet}
            startedAt={session.startedAt}
            onPatch={patch}
          />
          </TourAnchor>
        ) : (
          <Text style={styles.playerHint}>
            {player.name} no tiene clase asignada.
          </Text>
        )
      ) : null}

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle={title}
        onClose={() => setExitModalVisible(false)}
        saveTitle="Dejar en curso"
        saveHint={'La campa\u00f1a sigue otro d\u00eda, con las fichas como est\u00e1n ahora.'}
        onSaveAndExit={() => {
          setExitModalVisible(false);
          onSaveAndExit();
        }}
        onFinishAndExit={() => {
          setExitModalVisible(false);
          onFinishMatch();
        }}
        finishTitle="Finalizar partida"
        finishHint={'Cierra la campa\u00f1a. Las fichas quedan guardadas.'}
        onDeleteAndExit={() => {
          setExitModalVisible(false);
          onDeleteAndExit();
        }}
      />
      <MatchActionsMenu
        visible={actionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        onEditMatch={() => {}}
        canEditMatch={false}
        onViewTutorial={() => startTour('heroQuest', { force: true })}
        finishHint="Cierra la campaña. En este juego no hay clasificación."
        onFinishMatch={onFinishMatch}
        onSaveAndExit={onSaveAndExit}
        onDeleteAndExit={onDeleteAndExit}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: { fontSize: 22, color: theme.text, lineHeight: 26 },
    menuIcon: {
      fontSize: 22,
      color: theme.text,
      lineHeight: 26,
      fontWeight: '700',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    playerScroll: { flexGrow: 0, flexShrink: 0, maxHeight: 56 },
    playerRow: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    playerChip: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.surface,
    },
    playerChipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
    playerChipText: { color: theme.text, fontWeight: '600' },
    playerChipTextOn: { color: theme.onAccent },
    sheetAnchor: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
    setupTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    playerHint: { color: theme.textMuted, textAlign: 'center', marginBottom: 8 },
    presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    presetCard: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
    },
    presetEmoji: { fontSize: 22 },
    presetName: { color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
    presetMeta: { color: theme.textMuted, marginTop: 4 },
    customToggle: { paddingVertical: 8 },
    customToggleText: { color: theme.accent, fontWeight: '700' },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      gap: 10,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    heroBadge: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
    },
    heroEmoji: { fontSize: 22 },
    heroName: { flex: 1, color: theme.warning, fontSize: 20, fontWeight: '800' },
    hpValue: {
      minWidth: 28,
      textAlign: 'center',
      color: theme.success,
      fontSize: 32,
      fontWeight: '800',
    },
    hpBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
    },
    hpBtnPlus: { backgroundColor: theme.success, borderColor: theme.success },
    hpPlusText: { color: theme.bg, fontSize: 20, fontWeight: '800' },
    hpOf: { color: theme.textMuted, textAlign: 'center', marginTop: -4 },
    barTrack: {
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    barFill: { height: 8, backgroundColor: theme.success },
    maxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    maxLabel: { flex: 1, color: theme.textMuted, fontWeight: '600' },
    statGrid: { flexDirection: 'row', gap: 8 },
    tile: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 4,
      alignItems: 'center',
    },
    tileValue: { fontSize: 22, fontWeight: '800' },
    tileLabel: { fontWeight: '700', marginTop: 2, fontSize: 11 },
    tileBtns: {
      flexDirection: 'row',
      gap: 18,
      marginTop: 8,
    },
    tileBtn: { color: theme.text, fontSize: 20, fontWeight: '700' },
    goldHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    goldValue: { color: theme.warning, fontSize: 28, fontWeight: '800' },
    goldSplit: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    goldGroup: { flexDirection: 'row', gap: 8 },
    goldBtn: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.surfaceLight,
    },
    goldBtnText: { color: theme.text, fontWeight: '700' },
    section: { color: theme.text, fontSize: 16, fontWeight: '800' },
    empty: { color: theme.textMuted, textAlign: 'center', paddingVertical: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemKind: { color: theme.accent, fontSize: 12, fontWeight: '700', width: 64 },
    itemName: { flex: 1, color: theme.text },
    remove: { color: theme.textMuted, fontSize: 16 },
    kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    kindChip: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    kindChipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
    kindText: { color: theme.text, fontSize: 13 },
    kindTextOn: { color: theme.onAccent, fontWeight: '700' },
    addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    addInput: { flex: 1, marginBottom: 0 },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: { color: theme.onAccent, fontSize: 24, fontWeight: '700' },
    label: { color: theme.textMuted, fontWeight: '600' },
    input: {
      backgroundColor: theme.bg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      fontSize: 16,
    },
    notes: { minHeight: 90, textAlignVertical: 'top' },
    primaryBtn: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    primaryBtnText: { color: theme.onAccent, fontWeight: '800' },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepperLabel: { color: theme.text, fontSize: 15, flex: 1 },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnOff: { opacity: 0.35 },
    stepBtnText: { color: theme.text, fontSize: 20 },
    stepValue: {
      minWidth: 28,
      textAlign: 'center',
      color: theme.text,
      fontWeight: '700',
      fontSize: 16,
    },
  });
