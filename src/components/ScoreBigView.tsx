import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { Player, RoundBreakdown, ScoreTileWidth } from '../types';
import { formatScoreNumber, getPlayerBreakdownItems } from '../utils/scoring';
import { ScoreCalculatorSheet } from './ScoreCalculatorSheet';

type Props = {
  players: Player[];
  roundScores: Record<string, number>;
  tileWidth: ScoreTileWidth;
  breakdown: RoundBreakdown;
  onSetScore: (playerId: string, value: number) => void;
  onSetBreakdown: (playerId: string, items: number[]) => void;
  onAdjustScore: (playerId: string, delta: number) => void;
};

export function ScoreBigView({
  players,
  roundScores,
  tileWidth,
  breakdown,
  onSetScore,
  onSetBreakdown,
  onAdjustScore,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const editingPlayer = players.find((player) => player.id === editingPlayerId);

  return (
    <View style={styles.board}>
      {players.map((player, index) => {
        const roundScore = roundScores[player.id] ?? 0;
        const ink = inkOn(player.color);
        const muted =
          ink === '#FFFFFF' ? 'rgba(255,255,255,0.72)' : 'rgba(26,35,50,0.55)';
        return (
          <View
            key={player.id}
            style={[
              styles.tile,
              tileWidth === 'full' ||
              (index === players.length - 1 && players.length % 2 === 1)
                ? styles.tileFull
                : styles.tileHalf,
              { backgroundColor: player.color },
            ]}
          >
            <Text style={[styles.name, { color: ink }]} numberOfLines={1}>
              {player.name}
            </Text>
            <View style={styles.controls}>
              <Pressable
                onPress={() => onAdjustScore(player.id, -1)}
                style={styles.step}
                accessibilityLabel={`Restar un punto a ${player.name}`}
              >
                <Text style={[styles.stepLabel, { color: muted }]}>−</Text>
              </Pressable>
              <Pressable
                onPress={() => setEditingPlayerId(player.id)}
                style={styles.scoreHit}
                accessibilityLabel={`Editar puntos de ${player.name}`}
              >
                <Text style={[styles.score, { color: ink }]}>
                  {formatScoreNumber(roundScore)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onAdjustScore(player.id, 1)}
                style={styles.step}
                accessibilityLabel={`Sumar un punto a ${player.name}`}
              >
                <Text style={[styles.stepLabel, { color: muted }]}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {editingPlayer ? (
        <ScoreCalculatorSheet
          visible
          roundScore={roundScores[editingPlayer.id] ?? 0}
          items={getPlayerBreakdownItems(breakdown ?? {}, editingPlayer.id)}
          onClose={() => setEditingPlayerId(null)}
          onSetScore={(value) => onSetScore(editingPlayer.id, value)}
          onSetBreakdown={(items) => onSetBreakdown(editingPlayer.id, items)}
        />
      ) : null}
    </View>
  );
}

/** Texto oscuro sobre colores claros (blanco, amarillo) y blanco sobre el resto. */
function inkOn(color: string): string {
  const hex = color.trim().replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value) || full.length !== 6) return '#FFFFFF';
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? '#1A2332' : '#FFFFFF';
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    board: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingBottom: 8,
    },
    tile: {
      minHeight: 132,
      paddingHorizontal: 12,
      paddingVertical: 14,
      justifyContent: 'space-between',
    },
    tileFull: {
      width: '100%',
    },
    tileHalf: {
      width: '50%',
    },
    name: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '700',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    step: {
      width: 36,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepLabel: {
      fontSize: 28,
      fontWeight: '500',
      lineHeight: 32,
    },
    scoreHit: {
      flex: 1,
      alignItems: 'center',
    },
    score: {
      textAlign: 'center',
      fontSize: 40,
      fontWeight: '700',
      lineHeight: 46,
    },
  });
