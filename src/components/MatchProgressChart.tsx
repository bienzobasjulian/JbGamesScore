import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { theme } from '../constants';
import { Player, RoundScores } from '../types';
import { getMatchProgressSeries } from '../utils/chartData';

type Props = {
  players: Player[];
  rounds: RoundScores[];
};

const CHART_HEIGHT = 220;
const PAD_LEFT = 40;
const PAD_RIGHT = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function MatchProgressChart({ players, rounds }: Props) {
  const [width, setWidth] = useState(0);
  const series = useMemo(
    () => getMatchProgressSeries(players, rounds),
    [players, rounds],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  if (rounds.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.heading}>Evolución de la partida</Text>
        <Text style={styles.empty}>No hay rondas registradas para graficar.</Text>
      </View>
    );
  }

  const plotW = Math.max(width - PAD_LEFT - PAD_RIGHT, 1);
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const roundCount = rounds.length;

  let minY = 0;
  let maxY = 0;
  for (const s of series) {
    for (const v of s.cumulativeByRound) {
      minY = Math.min(minY, v);
      maxY = Math.max(maxY, v);
    }
  }
  if (minY === maxY) {
    maxY = minY + 1;
  }
  const yRange = maxY - minY;

  const toX = (roundIndex: number) =>
    roundCount === 1
      ? plotW / 2
      : (roundIndex / (roundCount - 1)) * plotW;

  const toY = (value: number) =>
    PAD_TOP + plotH - ((value - minY) / yRange) * plotH;

  const yTicks = useMemo(() => {
    const steps = 4;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      ticks.push(Math.round(minY + (yRange * i) / steps));
    }
    return [...new Set(ticks)];
  }, [minY, yRange]);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Text style={styles.heading}>Evolución de la partida</Text>
      <Text style={styles.subtitle}>Puntos acumulados por ronda</Text>

      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT}>
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <Line
                key={tick}
                x1={PAD_LEFT}
                y1={y}
                x2={width - PAD_RIGHT}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {yTicks.map((tick) => (
            <SvgText
              key={`label-${tick}`}
              x={PAD_LEFT - 6}
              y={toY(tick) + 4}
              fontSize={10}
              fill={theme.textMuted}
              textAnchor="end"
            >
              {tick}
            </SvgText>
          ))}

          {rounds.map((_, i) => {
            const x = PAD_LEFT + toX(i);
            return (
              <SvgText
                key={`round-${i}`}
                x={x}
                y={CHART_HEIGHT - 6}
                fontSize={10}
                fill={theme.textMuted}
                textAnchor="middle"
              >
                R{i + 1}
              </SvgText>
            );
          })}

          {series.map((s) => {
            const points = s.cumulativeByRound
              .map((v, i) => `${PAD_LEFT + toX(i)},${toY(v)}`)
              .join(' ');
            return (
              <Polyline
                key={s.player.id}
                points={points}
                fill="none"
                stroke={s.player.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {series.map((s) =>
            s.cumulativeByRound.map((v, i) => (
              <Circle
                key={`${s.player.id}-${i}`}
                cx={PAD_LEFT + toX(i)}
                cy={toY(v)}
                r={4}
                fill={s.player.color}
                stroke={theme.bg}
                strokeWidth={1.5}
              />
            )),
          )}
        </Svg>
      )}

      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.player.id} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: s.player.color }]}
            />
            <Text style={styles.legendName} numberOfLines={1}>
              {s.player.name}
            </Text>
            <Text style={styles.legendScore}>
              {s.cumulativeByRound[s.cumulativeByRound.length - 1]} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  empty: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  legend: {
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  legendScore: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.accent,
  },
});
