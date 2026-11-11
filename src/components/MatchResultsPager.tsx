import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Player, RoundScores } from '../types';
import { RankedPlayer } from '../utils/match';
import { PlayerAvatar } from './PlayerAvatar';
import { RoundProgressChart } from './CurrentRankingModal';

const TROPHY_PATH =
  'M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z M8,16v-4h8v12C11.582,24,8,20.414,8,16z M56,16c0,4.414-3.582,8-8,8V12h8V16z';

const TROPHY_COLORS = ['#F5C518', '#C5CCD4', '#C47B3A'];
const POOP_COLOR = '#A56B2A';
const POOP_PATH =
  'M451.36 369.14C468.66 355.99 480 335.41 480 312c0-39.77-32.24-72-72-72h-14.07c13.42-11.73 22.07-28.78 22.07-48 0-35.35-28.65-64-64-64h-5.88c3.57-10.05 5.88-20.72 5.88-32 0-53.02-42.98-96-96-96-5.17 0-10.15.74-15.11 1.52C250.31 14.64 256 30.62 256 48c0 44.18-35.82 80-80 80h-16c-35.35 0-64 28.65-64 64 0 19.22 8.65 36.27 22.07 48H104c-39.76 0-72 32.23-72 72 0 23.41 11.34 43.99 28.64 57.14C26.31 374.62 0 404.12 0 440c0 39.76 32.24 72 72 72h368c39.76 0 72-32.24 72-72 0-35.88-26.31-65.38-60.64-70.86z';

type Props = {
  ranking: RankedPlayer[];
  players: Player[];
  rounds: RoundScores[];
  floorTotalAtZero?: boolean;
  roundLabels?: string[];
  lowestScoreWins?: boolean;
  lowestScoreLoses?: boolean;
  pointsGoal?: number | null;
};

export function MatchResultsPager({
  ranking,
  players,
  rounds,
  floorTotalAtZero = false,
  lowestScoreWins = false,
  lowestScoreLoses = false,
  pointsGoal = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [compact, setCompact] = useState(false);
  const note = buildMatchNote(
    players,
    rounds,
    ranking,
    lowestScoreWins,
    lowestScoreLoses,
  );
  const podium = podiumEntries(ranking);
  const solo = players.length < 2;
  const soloPlayer = ranking[0];
  const lowestTotal =
    ranking.length > 0 ? Math.min(...ranking.map((entry) => entry.total)) : 0;
  const losers = lowestScoreLoses
    ? ranking.filter((entry) => entry.total === lowestTotal)
    : [];
  const everyoneTied =
    lowestScoreLoses && losers.length > 0 && losers.length === ranking.length;

  return (
    <View style={styles.screen}>
      {solo && soloPlayer ? (
        <View style={styles.solo}>
          <PlayerAvatar
            name={soloPlayer.player.name}
            color={soloPlayer.player.color}
            avatar={soloPlayer.player.avatar}
            size={compact ? 40 : 64}
            radius={compact ? 20 : 32}
          />
          <Text style={styles.podiumName} numberOfLines={1}>
            {soloPlayer.player.name}
          </Text>
          {compact ? null : (
            <Text style={styles.soloScore}>{soloPlayer.total}</Text>
          )}
        </View>
      ) : lowestScoreLoses ? (
        <View style={styles.solo}>
          {everyoneTied ? (
            <Text style={styles.loserMark}>🤝</Text>
          ) : (
            <PoopIcon size={compact ? 28 : 48} />
          )}
          <Text style={styles.loserTitle}>
            {everyoneTied
              ? 'Empate'
              : losers.length > 1
                ? 'Pierden'
                : 'Pierde'}
          </Text>
          <Text style={styles.podiumName} numberOfLines={2}>
            {everyoneTied
              ? 'Todos con los mismos puntos'
              : losers.map((entry) => entry.player.name).join(', ')}
          </Text>
          {compact || losers.length === 0 ? null : (
            <Text style={styles.podiumScore}>{losers[0].total}</Text>
          )}
        </View>
      ) : (
        <View style={styles.podium}>
          {podium.map((entry) => (
            <View key={entry.player.id} style={styles.podiumCol}>
              <TrophyIcon
                color={TROPHY_COLORS[entry.rank - 1] ?? theme.textMuted}
                size={
                  compact
                    ? entry.rank === 1
                      ? 36
                      : 28
                    : entry.rank === 1
                      ? 64
                      : 46
                }
              />
              <Text style={styles.podiumName} numberOfLines={1}>
                {entry.player.name}
              </Text>
              {compact ? null : (
                <Text style={styles.podiumScore}>{entry.total}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          setCompact(event.nativeEvent.contentOffset.y > 24);
        }}
      >
        {note ? <Text style={styles.note}>{note}</Text> : null}
        {solo
          ? null
          : ranking.map((entry) => (
          <View key={entry.player.id} style={styles.card}>
            {lowestScoreLoses ? (
              entry.total === lowestTotal && !everyoneTied ? (
                <PoopIcon size={18} />
              ) : (
                <Text style={styles.rankLabel}>
                  {everyoneTied ? '=' : ''}
                </Text>
              )
            ) : entry.rank <= 3 ? (
              <TrophyIcon
                color={TROPHY_COLORS[entry.rank - 1]}
                size={18}
              />
            ) : (
              <Text style={styles.rankLabel}>{entry.rank}.</Text>
            )}
            <PlayerAvatar
              name={entry.player.name}
              color={entry.player.color}
              avatar={entry.player.avatar}
              size={36}
              radius={18}
            />
            <Text style={styles.cardName} numberOfLines={1}>
              {entry.player.name}
            </Text>
            <Text style={styles.cardScore}>{entry.total}</Text>
          </View>
        ))}
        {rounds.length > 1 ? (
          <RoundProgressChart
            players={players}
            rounds={rounds}
            floorTotalAtZero={floorTotalAtZero}
            pointsGoal={pointsGoal}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function podiumEntries(ranking: RankedPlayer[]): RankedPlayer[] {
  if (ranking.length >= 3) return [ranking[1], ranking[0], ranking[2]];
  if (ranking.length === 2) return [ranking[1], ranking[0]];
  return ranking.slice(0, 1);
}

export function PoopIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path d={POOP_PATH} fill={POOP_COLOR} />
    </Svg>
  );
}

function TrophyIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d={TROPHY_PATH} fill={color} />
    </Svg>
  );
}

function pointsLabel(value: number): string {
  const amount = Math.abs(value);
  return amount === 1 ? '1 punto' : `${amount} puntos`;
}

function totalsAt(
  players: Player[],
  rounds: RoundScores[],
  throughIndex: number,
): Map<string, number> {
  const totals = new Map<string, number>();
  players.forEach((player) => {
    let total = 0;
    for (let step = 0; step <= throughIndex; step += 1) {
      total += rounds[step]?.[player.id] ?? 0;
    }
    totals.set(player.id, total);
  });
  return totals;
}

function bestOtherTotal(
  players: Player[],
  totals: Map<string, number>,
  playerId: string,
  lowestScoreWins: boolean,
): number {
  const others = players
    .filter((player) => player.id !== playerId)
    .map((player) => totals.get(player.id) ?? 0);
  if (others.length === 0) return 0;
  return others.reduce((best, total) =>
    lowestScoreWins ? Math.min(best, total) : Math.max(best, total),
  );
}

function isAhead(
  total: number,
  other: number,
  lowestScoreWins: boolean,
): boolean {
  return lowestScoreWins ? total < other : total > other;
}

function buildMatchNote(
  players: Player[],
  rounds: RoundScores[],
  ranking: RankedPlayer[],
  lowestScoreWins: boolean,
  lowestScoreLoses: boolean,
): string | null {
  if (players.length < 2 || rounds.length === 0 || ranking.length === 0) {
    return null;
  }

  if (lowestScoreLoses) {
    const lowest = Math.min(...ranking.map((entry) => entry.total));
    const losers = ranking.filter((entry) => entry.total === lowest);
    if (losers.length === ranking.length) {
      return `Empate: todos acaban con ${pointsLabel(lowest)}.`;
    }
    const names =
      losers.length === 2
        ? `${losers[0].player.name} y ${losers[1].player.name}`
        : losers.map((entry) => entry.player.name).join(', ');
    const verb = losers.length > 1 ? 'Pierden' : 'Pierde';
    return `${verb} ${names} con ${pointsLabel(lowest)}. El resto gana.`;
  }

  let bestPlayer = players[0];
  let bestScore = rounds[0]?.[bestPlayer.id] ?? 0;
  let bestRound = 1;
  rounds.forEach((round, roundIndex) => {
    players.forEach((player) => {
      const score = round[player.id] ?? 0;
      const better = lowestScoreWins ? score < bestScore : score > bestScore;
      if (better) {
        bestPlayer = player;
        bestScore = score;
        bestRound = roundIndex + 1;
      }
    });
  });
  const bestRoundLine =
    bestScore === 0
      ? ''
      : ` Mejor ronda: ${bestPlayer.name} con ${pointsLabel(bestScore)}${
          rounds.length > 1 ? ` en la ronda ${bestRound}` : ''
        }.`;

  const leaders = ranking.filter((entry) => entry.rank === 1);
  if (leaders.length > 1) {
    const names = leaders.map((entry) => entry.player.name).join(' y ');
    return `Empate en lo más alto: ${names} acaban con ${pointsLabel(leaders[0].total)}.${bestRoundLine}`;
  }

  const winner = leaders[0];
  const runnerUp = ranking.find((entry) => entry.rank > 1);
  const finalGap = runnerUp
    ? Math.abs(winner.total - runnerUp.total)
    : 0;

  let maxDeficit = 0;
  let tookLeadOnRound = 0;
  let roundsAhead = 0;
  rounds.forEach((_, index) => {
    const totals = totalsAt(players, rounds, index);
    const winnerTotal = totals.get(winner.player.id) ?? 0;
    const other = bestOtherTotal(
      players,
      totals,
      winner.player.id,
      lowestScoreWins,
    );
    const ahead = isAhead(winnerTotal, other, lowestScoreWins);
    const gap = Math.abs(winnerTotal - other);
    if (ahead) roundsAhead += 1;
    if (!ahead && gap > maxDeficit) maxDeficit = gap;
    if (ahead && maxDeficit > 0 && tookLeadOnRound === 0) {
      tookLeadOnRound = index + 1;
    }
  });

  let headline = `${winner.player.name} se lleva la partida.`;
  if (rounds.length > 1 && tookLeadOnRound > 1 && maxDeficit > 0) {
    headline = `¡Vaya remontada! ${winner.player.name} perdía por ${pointsLabel(maxDeficit)}, pero se puso al frente en la ronda ${tookLeadOnRound}.`;
  } else if (finalGap === 1) {
    headline = `¡Un final de infarto! ${winner.player.name} ganó por solo 1 punto.`;
  } else if (rounds.length > 1 && roundsAhead === rounds.length) {
    headline = `${winner.player.name} lideró de principio a fin.`;
  }

  return `${headline}${bestRoundLine}`;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    solo: {
      alignItems: 'center',
      gap: 4,
      paddingBottom: 8,
    },
    soloScore: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '800',
    },
    loserMark: {
      fontSize: 40,
    },
    loserTitle: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    podium: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: 18,
      paddingBottom: 8,
    },
    podiumCol: {
      width: 96,
      alignItems: 'center',
      gap: 2,
    },
    podiumName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    podiumScore: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    content: {
      gap: 10,
      paddingTop: 8,
      paddingBottom: 16,
    },
    note: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rankLabel: {
      width: 22,
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 16,
      fontWeight: '700',
    },
    cardName: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      fontWeight: '700',
    },
    cardScore: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
  });
