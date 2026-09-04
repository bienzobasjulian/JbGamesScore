import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  findDestinationTicket,
  getDestinationTickets,
} from '../constants/aventurerosTrenTickets';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenSubmode,
} from '../types';
import { getDestinationEntryPoints } from '../utils/aventurerosTren';

const TICKET = {
  paper: '#F3E2C0',
  paperVoid: '#DCCBB0',
  ink: '#3A2415',
  inkMuted: '#7A5533',
  maroon: '#6B2C2C',
  maroonSoft: '#8B4540',
  stampOk: '#2E6B45',
  stampFail: '#A3261B',
  badgeText: '#F3E2C0',
};

type Props = {
  entry: AventurerosTrenDestinationEntry;
  submode: AventurerosTrenSubmode;
  color: string;
  onChange: (patch: Partial<AventurerosTrenDestinationEntry>) => void;
  onRemove: () => void;
};

function TicketTrainIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={12} viewBox="0 0 32 20">
      <Path
        fill={color}
        d="M3 11h3V7.5h3.5V5h2.2v2.5H22c2.2 0 3.5 1.6 3.5 3.4V13H28v1.6h-2.4a2.7 2.7 0 0 1-5.1 0h-7.2a2.7 2.7 0 0 1-5.1 0H3V11zm20.2-1.2c0-.7-.5-1.2-1.2-1.2H13V8.2H9.6V9.8H6.2v1.4h17z"
      />
      <Circle cx="10.4" cy="16.2" r="2.3" fill={color} />
      <Circle cx="22.4" cy="16.2" r="2.3" fill={color} />
    </Svg>
  );
}

function RailDots({ color }: { color: string }) {
  return (
    <View style={railStyles.railDots}>
      {Array.from({ length: 3 }, (_, index) => (
        <View
          key={index}
          style={[railStyles.railDash, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

export function AventurerosTrenDestinationRow({
  entry,
  submode,
  color,
  onChange,
  onRemove,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const net = getDestinationEntryPoints(entry);
  const matched = findDestinationTicket(
    getDestinationTickets(submode),
    entry.origin,
    entry.destination,
  );
  const origin = matched?.origin || entry.origin.trim() || '—';
  const destination = matched?.destination || entry.destination.trim() || '—';
  const completed = entry.completed;
  const ink = completed ? TICKET.ink : TICKET.inkMuted;

  return (
    <View style={[styles.ticket, !completed && styles.ticketVoid]}>
      <View style={[styles.stripe, { backgroundColor: color }]} />

      <View style={styles.stub} pointerEvents="none">
        {Array.from({ length: 3 }, (_, index) => (
          <View
            key={index}
            style={[styles.hole, { backgroundColor: theme.surface }]}
          />
        ))}
      </View>

      <View style={styles.perforation} pointerEvents="none">
        {Array.from({ length: 5 }, (_, index) => (
          <View
            key={index}
            style={[styles.perfDot, { backgroundColor: theme.surface }]}
          />
        ))}
      </View>

      <Pressable
        onPress={() => onChange({ completed: !completed })}
        accessibilityRole="switch"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`${origin} a ${destination}, ${Math.abs(net)} puntos. ${
          completed ? 'Completado' : 'No completado'
        }`}
        style={({ pressed }) => [styles.body, pressed && styles.bodyPressed]}
      >
        <View style={styles.inner}>
          <Text style={styles.banner}>Billete de destino</Text>

          <View style={styles.route}>
            <View style={styles.cities}>
              <Text style={[styles.city, { color: ink }]} numberOfLines={2}>
                {origin}
              </Text>
              <View style={styles.rail}>
                <RailDots color={ink} />
                <TicketTrainIcon color={TICKET.maroon} />
                <RailDots color={ink} />
              </View>
              <Text style={[styles.city, { color: ink }]} numberOfLines={2}>
                {destination}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: completed
                    ? TICKET.maroon
                    : TICKET.stampFail,
                },
              ]}
            >
              <Text style={styles.badgeValue}>
                {net > 0 ? `+${net}` : `${net}`}
              </Text>
              <Text style={styles.badgeUnit}>pts</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View
              style={[
                styles.stamp,
                completed ? styles.stampOk : styles.stampFail,
              ]}
            >
              <Text
                style={[
                  styles.stampText,
                  { color: completed ? TICKET.stampOk : TICKET.stampFail },
                ]}
              >
                {completed ? 'COMPLETADO' : 'SIN COMPLETAR'}
              </Text>
            </View>
            <Text style={styles.hint} numberOfLines={1}>
              Toca para cambiar
            </Text>
            <Pressable
              onPress={onRemove}
              hitSlop={10}
              style={styles.removeBtn}
            >
              <Text style={styles.remove}>Quitar</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const railStyles = StyleSheet.create({
  railDots: {
    width: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  railDash: {
    width: 3,
    height: 2,
    borderRadius: 1,
    opacity: 0.55,
  },
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    ticket: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: TICKET.paper,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: TICKET.maroon,
      overflow: 'hidden',
    },
    ticketVoid: {
      backgroundColor: TICKET.paperVoid,
    },
    stripe: {
      width: 3,
    },
    stub: {
      width: 14,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: 8,
    },
    hole: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    perforation: {
      width: 6,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: 4,
    },
    perfDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    body: {
      flex: 1,
      paddingVertical: 5,
      paddingRight: 7,
      paddingLeft: 2,
    },
    bodyPressed: {
      opacity: 0.88,
    },
    inner: {
      flex: 1,
      borderWidth: 1,
      borderColor: TICKET.maroonSoft,
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 5,
      gap: 4,
    },
    banner: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      textAlign: 'center',
      color: TICKET.maroon,
    },
    route: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cities: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    city: {
      flexShrink: 1,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 16,
    },
    rail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      flexShrink: 0,
    },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: TICKET.ink,
      flexShrink: 0,
    },
    badgeValue: {
      color: TICKET.badgeText,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 14,
    },
    badgeUnit: {
      color: TICKET.badgeText,
      fontSize: 7,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      marginTop: -1,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stamp: {
      borderWidth: 1.5,
      borderRadius: 3,
      paddingHorizontal: 6,
      paddingVertical: 1,
      transform: [{ rotate: '-3deg' }],
    },
    stampOk: {
      borderColor: TICKET.stampOk,
      backgroundColor: 'rgba(46,107,69,0.1)',
    },
    stampFail: {
      borderColor: TICKET.stampFail,
      backgroundColor: 'rgba(163,38,27,0.1)',
    },
    stampText: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    hint: {
      flex: 1,
      fontSize: 9,
      color: TICKET.inkMuted,
    },
    removeBtn: {
      paddingVertical: 2,
    },
    remove: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.danger,
    },
  });
