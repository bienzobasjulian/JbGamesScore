import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  Player,
  PiliPiliRoundConfig,
  PiliPiliRoundEntry,
} from '../types';
import {
  calculatePiliPiliRoundScore,
  emptyPiliPiliRoundEntry,
  getPiliPiliEffectiveRoundDelta,
  getPiliPiliForbiddenBid,
  getPiliPiliMaxBid,
  getPiliPiliPreviousBidder,
} from '../utils/piliPili';
import { CardCountStepper } from './CardCountStepper';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  player: Player;
  /** Todos los jugadores de la partida (para validar apuestas). */
  allPlayers: Player[];
  /** Orden de apuestas: repartidor primero, último en apostar al final. */
  players: Player[];
  roundIndex: number;
  roundByPlayer: Record<string, PiliPiliRoundEntry>;
  config: PiliPiliRoundConfig;
  entry: PiliPiliRoundEntry;
  /** Pilis acumulados antes de esta ronda (para mostrar el delta efectivo). */
  totalBeforeRound: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PiliPiliRoundEntry>) => void;
};

export function PiliPiliPlayerRoundPanel({
  player,
  allPlayers,
  players,
  roundIndex,
  roundByPlayer,
  config,
  entry,
  totalBeforeRound,
  expanded,
  onToggle,
  onChange,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const rawRoundScore = calculatePiliPiliRoundScore(roundByPlayer, config, player.id);
  const roundScore = getPiliPiliEffectiveRoundDelta(
    totalBeforeRound,
    rawRoundScore,
  );
  const maxBid = getPiliPiliMaxBid(config);
  const forbiddenBid = getPiliPiliForbiddenBid(
    roundByPlayer,
    allPlayers,
    player.id,
    config.cardsDealt,
    roundIndex,
  );
  const bidExact = entry.bid === entry.tricksWon;
  const isDealer = players[0]?.id === player.id;
  const isLastBidder = players[players.length - 1]?.id === player.id;
  const hasForbiddenBid =
    isLastBidder && forbiddenBid !== null && entry.bid === forbiddenBid;
  const missionForbiddenBid =
    config.mission === 'forbidden_bet' &&
    (config.forbiddenBidValue === 0 || config.forbiddenBidValue === 1) &&
    entry.bid === config.forbiddenBidValue;
  const previousBidder = getPiliPiliPreviousBidder(
    allPlayers,
    roundIndex,
    player.id,
  );
  const previousBid = previousBidder
    ? (roundByPlayer[previousBidder.id] ?? emptyPiliPiliRoundEntry()).bid
    : null;
  const copiedPreviousBid =
    config.mission === 'no_copy_bid' &&
    previousBidder != null &&
    previousBid !== null &&
    entry.bid === previousBid;

  const hasFirstLast = config.mission === 'first_last_trick';
  const hasMissionCards = config.mission === 'mission_card_numbers';
  const hasLinked = config.mission === 'linked_player';
  const hasExactDiscard = config.mission === 'exact_bet_discard';

  const otherPlayers = players.filter((p) => p.id !== player.id);

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text
            style={[
              styles.avatarText,
              { color: getPlayerAvatarTextColor(player.color) },
            ]}
          >
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
            {isDealer ? (
              <>
                {' · '}
                <Text style={styles.dealerTag}>Reparte</Text>
              </>
            ) : null}
          </Text>
          <Text style={styles.hint}>
            {expanded ? 'Ocultar apuesta' : 'Registrar apuesta y bazas'}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text
            style={[styles.score, roundScore > 0 && styles.scoreNegative]}
          >
            {roundScore > 0 ? '+' : ''}
            {roundScore}
            {roundScore !== 0 ? ' 🌶' : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Apuesta</Text>
              {maxBid > 0 ? (
                <Text style={styles.fieldHint}>0 a {maxBid}</Text>
              ) : null}
              {hasForbiddenBid ? (
                <Text style={styles.fieldHintMuted}>
                  No puedes apostar {forbiddenBid} (igualaría el total a{' '}
                  {config.cardsDealt} cartas)
                </Text>
              ) : null}
              {missionForbiddenBid ? (
                <Text style={styles.fieldHintMuted}>
                  Está prohibido apostar {config.forbiddenBidValue} esta ronda.
                </Text>
              ) : null}
              {copiedPreviousBid && previousBidder ? (
                <Text style={styles.fieldHintMuted}>
                  No puedes copiar la apuesta de {previousBidder.name} ({previousBid}).
                </Text>
              ) : null}
            </View>
            <CardCountStepper
              value={entry.bid}
              onChange={(bid) => onChange({ bid })}
              color={player.color}
              unbounded
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Bazas ganadas</Text>
              {maxBid > 0 ? (
                <Text style={styles.fieldHint}>0 a {maxBid}</Text>
              ) : null}
            </View>
            <CardCountStepper
              value={entry.tricksWon}
              onChange={(tricksWon) => onChange({ tricksWon })}
              color={player.color}
              unbounded
            />
          </View>

          {bidExact && entry.bid > 0 && !hasExactDiscard ? (
            <Text style={styles.ok}>Apuesta cumplida: 0 Pilis esta ronda.</Text>
          ) : null}

          {hasExactDiscard && bidExact && entry.bid > 0 ? (
            <Text style={styles.ok}>
              {totalBeforeRound >= entry.bid
                ? `Apuesta acertada: descarta ${entry.bid} Pili${entry.bid === 1 ? '' : 's'} (−${entry.bid}).`
                : totalBeforeRound > 0
                  ? `Apuesta acertada: descarta ${totalBeforeRound} de ${entry.bid} Pili${entry.bid === 1 ? '' : 's'} (−${totalBeforeRound}).`
                  : 'Apuesta acertada: no tienes Pilis que descartar.'}
            </Text>
          ) : null}

          {hasFirstLast ? (
            <View style={styles.missionBlock}>
              <Text style={styles.missionTitle}>Misión: primera / última baza</Text>
              <Text style={styles.missionHint}>
                +1 Pili si ganas la primera y/o la última (máx. 1 por jugador).
              </Text>
              <View style={styles.switchRow}>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>Ganó la primera baza</Text>
                </View>
                <Switch
                  value={entry.wonFirstTrick}
                  onValueChange={(wonFirstTrick) => onChange({ wonFirstTrick })}
                  trackColor={{ false: theme.border, true: theme.accentDark }}
                  thumbColor={
                    entry.wonFirstTrick ? theme.accent : theme.textMuted
                  }
                />
              </View>
              <View style={styles.switchRow}>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>Ganó la última baza</Text>
                </View>
                <Switch
                  value={entry.wonLastTrick}
                  onValueChange={(wonLastTrick) => onChange({ wonLastTrick })}
                  trackColor={{ false: theme.border, true: theme.accentDark }}
                  thumbColor={
                    entry.wonLastTrick ? theme.accent : theme.textMuted
                  }
                />
              </View>
            </View>
          ) : null}

          {hasMissionCards ? (
            <View style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldLabel}>Bazas con carta de misión</Text>
                <Text style={styles.fieldHint}>
                  0 a {maxBid} · +1 Pili por baza · suma total ≤ {maxBid}
                </Text>
              </View>
              <CardCountStepper
                value={entry.missionCardTricksWon}
                onChange={(missionCardTricksWon) =>
                  onChange({ missionCardTricksWon })
                }
                color={player.color}
                unbounded
              />
            </View>
          ) : null}

          {hasLinked && otherPlayers.length > 0 ? (
            <View style={styles.missionBlock}>
              <Text style={styles.missionTitle}>Misión: jugador elegido</Text>
              <Text style={styles.missionHint}>
                Al final de la ronda sumas tus Pilis y los suyos.
              </Text>
              <View style={styles.linkedRow}>
                {otherPlayers.map((other) => {
                  const selected = entry.linkedPlayerId === other.id;
                  return (
                    <Pressable
                      key={other.id}
                      onPress={() =>
                        onChange({
                          linkedPlayerId: selected ? null : other.id,
                        })
                      }
                      style={({ pressed }) => [
                        styles.linkedChip,
                        selected && {
                          borderColor: other.color,
                          backgroundColor: other.color + '22',
                        },
                        pressed && styles.linkedChipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.linkedChipText,
                          selected && { color: other.color, fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {other.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  headerPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  dealerTag: {
    color: theme.accent,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  scoreBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.accent,
  },
  scoreNegative: {
    color: theme.danger,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 2,
  },
  fieldInfo: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  fieldHintMuted: {
    fontSize: 12,
    color: theme.warning,
    lineHeight: 16,
  },
  ok: {
    fontSize: 12,
    color: theme.accent,
    lineHeight: 17,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  missionBlock: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  missionHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 6,
    minHeight: 44,
  },
  linkedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkedChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    maxWidth: '48%',
  },
  linkedChipPressed: {
    opacity: 0.85,
  },
  linkedChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
});
