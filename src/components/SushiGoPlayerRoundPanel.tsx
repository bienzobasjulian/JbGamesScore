import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { Player, SushiGoRoundEntry } from '../types';
import {
  formatSushiGoSigned,
  getSushiGoPersonalBreakdown,
  scoreGyoza,
  scoreNigiri,
  scoreSashimi,
  scoreTempura,
} from '../utils/sushiGo';
import { CardCountStepper } from './CardCountStepper';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  player: Player;
  entry: SushiGoRoundEntry;
  expanded: boolean;
  handSize: number;
  roundScore: number;
  makiPoints: number;
  totalScore: number;
  puddingCount: number;
  /** Pudines de rondas anteriores, que siguen delante del jugador. */
  carriedPudding: number;
  onToggle: () => void;
  onChange: (patch: Partial<SushiGoRoundEntry>) => void;
};

export function SushiGoPlayerRoundPanel({
  player,
  entry,
  expanded,
  handSize,
  roundScore,
  makiPoints,
  totalScore,
  puddingCount,
  carriedPudding,
  onToggle,
  onChange,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const breakdown = getSushiGoPersonalBreakdown(entry);
  const puddingLabel =
    puddingCount === 1 ? '1 pudin' : `${puddingCount} pudines`;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <PlayerAvatar
          name={player.name}
          color={player.color}
          avatar={player.avatar}
          size={44}
          radius={12}
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {expanded ? 'Ocultar cartas' : 'Anotar cartas de la ronda'}
          </Text>
          <Text style={styles.totalHint}>
            Total {totalScore} · {puddingLabel}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text style={styles.score}>{formatSushiGoSigned(roundScore)}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <CountRow
            label="Rollos de maki"
            hint="Suma los símbolos de la parte superior"
            value={entry.makiRolls}
            max={handSize * 3}
            points={makiPoints}
            color={player.color}
            onChange={(makiRolls) => onChange({ makiRolls })}
          />
          <CountRow
            label="Tempura"
            hint="Pareja 5 · suelta 0"
            value={entry.tempura}
            max={handSize}
            points={scoreTempura(entry.tempura)}
            color={player.color}
            onChange={(tempura) => onChange({ tempura })}
          />
          <CountRow
            label="Sashimi"
            hint="Trío 10 · suelta o pareja 0"
            value={entry.sashimi}
            max={handSize}
            points={scoreSashimi(entry.sashimi)}
            color={player.color}
            onChange={(sashimi) => onChange({ sashimi })}
          />
          <CountRow
            label="Gyoza"
            hint="1, 3, 6, 10 o 15 según las cartas"
            value={entry.gyoza}
            max={handSize}
            points={scoreGyoza(entry.gyoza)}
            color={player.color}
            onChange={(gyoza) => onChange({ gyoza })}
          />

          <Text style={styles.groupTitle}>Nigiri</Text>
          <CountRow
            label="De calamar"
            hint="3 puntos · 9 con wasabi"
            value={entry.nigiriSquid}
            max={handSize}
            points={scoreNigiri(entry.nigiriSquid, entry.nigiriSquidWasabi, 3)}
            color={player.color}
            onChange={(nigiriSquid) => onChange({ nigiriSquid })}
          />
          {entry.nigiriSquid > 0 ? (
            <CountRow
              label="Encima de wasabi"
              hint="Un nigiri por cada wasabi"
              value={entry.nigiriSquidWasabi}
              max={entry.nigiriSquid}
              color={player.color}
              nested
              onChange={(nigiriSquidWasabi) => onChange({ nigiriSquidWasabi })}
            />
          ) : null}
          <CountRow
            label="De salmón"
            hint="2 puntos · 6 con wasabi"
            value={entry.nigiriSalmon}
            max={handSize}
            points={scoreNigiri(
              entry.nigiriSalmon,
              entry.nigiriSalmonWasabi,
              2,
            )}
            color={player.color}
            onChange={(nigiriSalmon) => onChange({ nigiriSalmon })}
          />
          {entry.nigiriSalmon > 0 ? (
            <CountRow
              label="Encima de wasabi"
              hint="Un nigiri por cada wasabi"
              value={entry.nigiriSalmonWasabi}
              max={entry.nigiriSalmon}
              color={player.color}
              nested
              onChange={(nigiriSalmonWasabi) =>
                onChange({ nigiriSalmonWasabi })
              }
            />
          ) : null}
          <CountRow
            label="De tortilla"
            hint="1 punto · 3 con wasabi"
            value={entry.nigiriEgg}
            max={handSize}
            points={scoreNigiri(entry.nigiriEgg, entry.nigiriEggWasabi, 1)}
            color={player.color}
            onChange={(nigiriEgg) => onChange({ nigiriEgg })}
          />
          {entry.nigiriEgg > 0 ? (
            <CountRow
              label="Encima de wasabi"
              hint="Un nigiri por cada wasabi"
              value={entry.nigiriEggWasabi}
              max={entry.nigiriEgg}
              color={player.color}
              nested
              onChange={(nigiriEggWasabi) => onChange({ nigiriEggWasabi })}
            />
          ) : null}

          <CountRow
            label="Pudin"
            hint={
              carriedPudding > 0
                ? carriedPudding === 1
                  ? 'Incluye el de rondas anteriores. Suma los nuevos de esta.'
                  : `Incluye los ${carriedPudding} de rondas anteriores. Suma los nuevos de esta.`
                : 'Se queda en la mesa y se puntúa al final'
            }
            value={carriedPudding + entry.pudding}
            min={carriedPudding}
            max={carriedPudding + handSize}
            color={player.color}
            onChange={(total) =>
              onChange({ pudding: Math.max(0, total - carriedPudding) })
            }
          />

          <Text style={styles.breakdown}>
            Tempura {breakdown.tempura} · Sashimi {breakdown.sashimi} · Gyoza{' '}
            {breakdown.gyoza} · Nigiri {breakdown.nigiri} · Maki {makiPoints}
          </Text>
          <Text style={styles.footerNote}>
            El wasabi suelto y los palillos no dan puntos. Si usas palillos,
            anota las dos cartas que has puesto en la mesa.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CountRow({
  label,
  hint,
  value,
  min = 0,
  max,
  points,
  color,
  nested = false,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min?: number;
  max: number;
  points?: number;
  color: string;
  nested?: boolean;
  onChange: (value: number) => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.fieldRow, nested && styles.fieldRowNested]}>
      <View style={styles.fieldInfo}>
        <View style={styles.fieldTitleRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {points != null && value > 0 ? (
            <Text style={styles.fieldPoints}>{formatSushiGoSigned(points)}</Text>
          ) : null}
        </View>
        <Text style={styles.fieldHint}>{hint}</Text>
      </View>
      <CardCountStepper
        value={value}
        onChange={onChange}
        color={color}
        max={max}
        isValueAllowed={min > 0 ? (next) => next >= min : undefined}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    headerText: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    hint: {
      fontSize: 12,
      color: theme.textMuted,
    },
    totalHint: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
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
    chevron: {
      fontSize: 12,
      color: theme.textMuted,
      marginLeft: 2,
    },
    body: {
      gap: 14,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 14,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    fieldRowNested: {
      marginLeft: 12,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: theme.border,
    },
    fieldInfo: {
      flex: 1,
      gap: 2,
    },
    fieldTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    fieldLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    fieldPoints: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.accent,
    },
    fieldHint: {
      fontSize: 12,
      color: theme.textMuted,
      lineHeight: 16,
    },
    groupTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    breakdown: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      lineHeight: 18,
    },
    footerNote: {
      fontSize: 12,
      color: theme.textMuted,
      lineHeight: 17,
    },
  });
