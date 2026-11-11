import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Player, RoundBreakdown, RoundScores, ScoreRoundOrder } from '../types';
import { formatScoreNumber, getPlayerBreakdownItems } from '../utils/scoring';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreCalculatorSheet } from './ScoreCalculatorSheet';

type Props = {
  players: Player[];
  rounds: RoundScores[];
  roundBreakdowns: RoundBreakdown[];
  activeRoundIndex: number;
  roundLabels?: string[];
  onGoToRound: (roundIndex: number) => void;
  onSetScore: (playerId: string, value: number) => void;
  onSetBreakdown: (playerId: string, items: number[]) => void;
  maxRounds?: number | null;
  onAddRound?: () => void;
  roundOrder?: ScoreRoundOrder;
};

export function ScoreTableView({
  players,
  rounds,
  roundBreakdowns,
  activeRoundIndex,
  roundLabels,
  onGoToRound,
  onSetScore,
  onSetBreakdown,
  maxRounds = null,
  onAddRound,
  roundOrder = 'asc',
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const editingPlayer = players.find((player) => player.id === editingPlayerId);
  const activeBreakdown = roundBreakdowns[activeRoundIndex];
  const activeRound = rounds[activeRoundIndex];
  const onLastRound =
    maxRounds != null
      ? activeRoundIndex === maxRounds - 1
      : activeRoundIndex === rounds.length - 1;
  const showAddRound = Boolean(onAddRound) && onLastRound;
  const roundIndexes = rounds.map((_, index) => index);
  if (roundOrder === 'desc') roundIndexes.reverse();
  const headerHeight = 78;
  const rowHeight = 52;

  return (
    <>
      <ScrollView
        horizontal
        style={{ minHeight: headerHeight + (rounds.length + 1) * rowHeight }}
        contentContainerStyle={styles.table}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <View style={styles.headerRow}>
            <View style={styles.roundCell}>
              <Text style={styles.headerText}>#</Text>
            </View>
            {players.map((player) => (
              <View key={player.id} style={styles.playerCell}>
                <PlayerAvatar
                  name={player.name}
                  color={player.color}
                  avatar={player.avatar}
                  size={36}
                  radius={10}
                />
                <Text style={styles.headerText} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
            ))}
          </View>
          {roundIndexes.map((roundIndex) => {
            const round = rounds[roundIndex];
            const active = roundIndex === activeRoundIndex;
            const label = roundLabels?.[roundIndex] ?? String(roundIndex + 1);
            return (
              <View
                key={roundIndex}
                style={[styles.dataRow, active && styles.dataRowActive]}
              >
                <Pressable
                  onPress={() => onGoToRound(roundIndex)}
                  style={styles.roundCell}
                >
                  <Text style={[styles.roundLabel, active && styles.activeText]}>
                    {label}
                  </Text>
                </Pressable>
                {players.map((player) => {
                  const value = round[player.id] ?? 0;
                  return (
                    <Pressable
                      key={player.id}
                      onPress={() => {
                        if (roundIndex !== activeRoundIndex) {
                          onGoToRound(roundIndex);
                          return;
                        }
                        setEditingPlayerId(player.id);
                      }}
                      style={styles.playerCell}
                    >
                      <Text style={[styles.score, active && styles.activeText]}>
                        {formatScoreNumber(value)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <View style={styles.roundCell}>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
            {players.map((player) => {
              const total = rounds.reduce(
                (sum, round) => sum + (round[player.id] ?? 0),
                0,
              );
              return (
                <View key={player.id} style={styles.playerCell}>
                  <Text style={styles.totalScore}>
                    {formatScoreNumber(total)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <Text style={[styles.hint, { color: theme.textMuted }]}>
        Toca una fila para cambiar de ronda. Toca un punto de la ronda activa
        para editarlo.
      </Text>
      {showAddRound ? (
        <Pressable onPress={onAddRound} style={styles.addRound}>
          <Text style={[styles.addRoundLabel, { color: theme.accent }]}>
            Añadir ronda
          </Text>
        </Pressable>
      ) : null}
      {editingPlayer ? (
        <ScoreCalculatorSheet
          visible
          roundScore={activeRound?.[editingPlayer.id] ?? 0}
          items={getPlayerBreakdownItems(activeBreakdown, editingPlayer.id)}
          onClose={() => setEditingPlayerId(null)}
          onSetScore={(value) => onSetScore(editingPlayer.id, value)}
          onSetBreakdown={(items) => onSetBreakdown(editingPlayer.id, items)}
        />
      ) : null}
    </>
  );
}

const COL = 96;

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    table: {
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dataRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dataRowActive: {
      backgroundColor: theme.surfaceLight,
    },
    roundCell: {
      width: 48,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerCell: {
      width: COL,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      gap: 4,
    },
    headerText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    roundLabel: {
      color: theme.textMuted,
      fontSize: 14,
      fontWeight: '700',
    },
    score: {
      color: theme.textMuted,
      fontSize: 18,
      fontWeight: '700',
    },
    activeText: {
      color: theme.text,
    },
    totalRow: {
      flexDirection: 'row',
      borderTopWidth: 2,
      borderTopColor: theme.border,
    },
    totalLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
    },
    totalScore: {
      color: theme.accent,
      fontSize: 18,
      fontWeight: '800',
    },
    hint: {
      fontSize: 13,
      marginTop: 10,
    },
    addRound: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingVertical: 8,
    },
    addRoundLabel: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
