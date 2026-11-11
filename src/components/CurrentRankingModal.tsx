import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Player, RoundScores } from '../types';
import { RankedPlayer } from '../utils/match';
import { AppHeader } from './AppHeader';
import { MatchRanking } from './MatchRanking';
import { RoundHistory } from './RoundHistory';

type Tab = 'ranking' | 'history' | 'stats';

type Props = {
  visible: boolean;
  onClose: () => void;
  ranking: RankedPlayer[];
  pointsGoal?: number | null;
  players?: Player[];
  rounds?: RoundScores[];
  floorTotalAtZero?: boolean;
  roundLabels?: string[];
};

export function CurrentRankingModal({
  visible,
  onClose,
  ranking,
  pointsGoal = null,
  players = [],
  rounds = [],
  floorTotalAtZero = false,
  roundLabels,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState<Tab>('ranking');
  const showMatchTabs = players.length > 0 && rounds.length > 0;
  const severalPlayers = players.length > 1;
  const showStats = rounds.length > 1;
  const showHistory = showMatchTabs && (severalPlayers || rounds.length > 1);
  const showRanking = severalPlayers;
  const title = showMatchTabs ? 'Resumen de la partida' : 'Clasificación actual';
  const tabs = (
    [
      ...(showRanking ? [['ranking', 'Clasificación'] as const] : []),
      ...(showHistory ? [['history', 'Historial'] as const] : []),
      ...(showStats ? [['stats', 'Estadística'] as const] : []),
    ] as const
  );
  const activeTab = tabs.some(([id]) => id === tab) ? tab : tabs[0]?.[0] ?? 'ranking';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.screen}>
        <AppHeader title={title} onBack={onClose} plain />
        {tabs.length > 1 ? (
          <View style={styles.tabs}>
            {tabs.map(([id, label]) => {
              const selected = activeTab === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setTab(id)}
                  style={[styles.tab, selected && styles.tabSelected]}
                >
                  <Text
                    style={[styles.tabLabel, selected && styles.tabLabelSelected]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'history' && showHistory ? (
            <RoundHistory
              players={players}
              rounds={rounds}
              floorTotalAtZero={floorTotalAtZero}
              roundLabels={roundLabels}
            />
          ) : activeTab === 'stats' && showStats ? (
            <RoundProgressChart
              players={players}
              rounds={rounds}
              floorTotalAtZero={floorTotalAtZero}
              roundLabels={roundLabels}
              pointsGoal={pointsGoal}
            />
          ) : (
            <MatchRanking
              ranking={ranking}
              showPodium={false}
              pointsGoal={pointsGoal}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function cumulativeAt(
  rounds: RoundScores[],
  roundIndex: number,
  playerId: string,
  floorTotalAtZero: boolean,
): number {
  let total = 0;
  for (let index = 0; index <= roundIndex; index += 1) {
    total += rounds[index]?.[playerId] ?? 0;
    if (floorTotalAtZero && total < 0) total = 0;
  }
  return total;
}

function niceStep(span: number): number {
  const raw = span / 6;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const normalized = raw / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function RoundProgressChart({
  players,
  rounds,
  floorTotalAtZero,
  roundLabels,
  pointsGoal,
}: {
  players: Player[];
  rounds: RoundScores[];
  floorTotalAtZero: boolean;
  roundLabels?: string[];
  pointsGoal?: number | null;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const width = Math.max(280, windowWidth - 40);
  const height = 380;
  const plotLeft = 40;
  const plotRight = width - 12;
  const plotTop = 56;
  const plotBottom = height - 8;
  const series = players.map((player) =>
    rounds.map((_, index) =>
      cumulativeAt(rounds, index, player.id, floorTotalAtZero),
    ),
  );
  const values = series.flat();
  const dataMin = Math.min(0, ...values);
  const dataMax = Math.max(0, ...values, pointsGoal ?? 0);
  const step = niceStep(Math.max(dataMax - dataMin, 1));
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step + step;
  const span = max - min || 1;
  const ticks: number[] = [];
  for (let value = min; value <= max + step / 10; value += step) {
    ticks.push(Math.round(value));
  }
  const xAt = (index: number) =>
    rounds.length <= 1
      ? (plotLeft + plotRight) / 2
      : plotLeft + (index / (rounds.length - 1)) * (plotRight - plotLeft);
  const yAt = (value: number) =>
    plotBottom - ((value - min) / span) * (plotBottom - plotTop);

  return (
    <View style={styles.chartBlock}>
      <Svg width={width} height={height}>
        {ticks.map((tick) => (
          <Line
            key={tick}
            x1={plotLeft}
            x2={plotRight}
            y1={yAt(tick)}
            y2={yAt(tick)}
            stroke={theme.border}
            strokeDasharray="4 4"
          />
        ))}
        {ticks.map((tick) => (
          <SvgText
            key={`label-${tick}`}
            x={plotLeft - 6}
            y={yAt(tick) + 4}
            fill={theme.textMuted}
            fontSize={11}
            textAnchor="end"
          >
            {tick}
          </SvgText>
        ))}
        {rounds.map((_, index) => (
          <SvgText
            key={`round-${index}`}
            x={xAt(index)}
            y={16}
            fill={theme.textMuted}
            fontSize={12}
            fontWeight="700"
            textAnchor="middle"
          >
            {roundLabels?.[index] ?? `R${index + 1}`}
          </SvgText>
        ))}
        {pointsGoal != null && pointsGoal > 0 ? (
          <>
            <Line
              x1={plotLeft}
              x2={plotRight}
              y1={yAt(pointsGoal)}
              y2={yAt(pointsGoal)}
              stroke="#E7A3A8"
              strokeWidth={2}
            />
            <Rect
              x={plotLeft + 8}
              y={yAt(pointsGoal) - 11}
              width={132}
              height={18}
              rx={4}
              fill="#F3D0D4"
            />
            <SvgText
              x={plotLeft + 14}
              y={yAt(pointsGoal) + 2}
              fill="#5C3036"
              fontSize={11}
            >
              Puntos para ganar
            </SvgText>
          </>
        ) : null}
        {series.map((points, playerIndex) => {
          const player = players[playerIndex];
          const focused = focusedId == null || focusedId === player.id;
          return (
            <Polyline
              key={player.id}
              points={points
                .map((value, index) => `${xAt(index)},${yAt(value)}`)
                .join(' ')}
              fill="none"
              stroke={player.color}
              strokeWidth={focused && focusedId ? 3.5 : 2.5}
              strokeOpacity={focused ? 1 : 0.15}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        {series.map((points, playerIndex) => {
          const player = players[playerIndex];
          const focused = focusedId == null || focusedId === player.id;
          return points.map((value, index) => (
            <Circle
              key={`${player.id}-${index}`}
              cx={xAt(index)}
              cy={yAt(value)}
              r={focused && focusedId ? 5 : 4}
              fill={player.color}
              fillOpacity={focused ? 1 : 0.15}
            />
          ));
        })}
        {series.map((points, playerIndex) => {
          const player = players[playerIndex];
          if (focusedId != null && focusedId !== player.id) return null;
          return points.map((value, index) => (
            <SvgText
              key={`value-${player.id}-${index}`}
              x={xAt(index)}
              y={yAt(value) - 8}
              fill={theme.text}
              fontSize={10}
              fontWeight="700"
              textAnchor="middle"
            >
              {value}
            </SvgText>
          ));
        })}
      </Svg>
      <View style={styles.legend}>
        {players.map((player) => {
          const selected = focusedId === player.id;
          const dimmed = focusedId != null && !selected;
          return (
            <Pressable
              key={player.id}
              onPress={() =>
                setFocusedId((current) =>
                  current === player.id ? null : player.id,
                )
              }
              style={[
                styles.legendChip,
                selected && styles.legendChipSelected,
                dimmed && styles.legendChipDimmed,
              ]}
              accessibilityState={{ selected }}
            >
              <View style={[styles.legendSwatch, { backgroundColor: player.color }]} />
              <Text style={styles.legendName} numberOfLines={1}>
                {player.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bg,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    tabs: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: 4,
    },
    tabSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    tabLabelSelected: {
      color: theme.onAccent,
    },
    chartBlock: {
      gap: 16,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    legendChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: 160,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    legendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendChipSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.surfaceLight,
    },
    legendChipDimmed: {
      opacity: 0.4,
    },
    legendName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
  });
