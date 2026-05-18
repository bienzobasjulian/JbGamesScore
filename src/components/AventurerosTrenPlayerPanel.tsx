import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { AventurerosTrenDestinationRow } from './AventurerosTrenDestinationRow';
import { AventurerosTrenRouteRow } from './AventurerosTrenRouteRow';
import { theme } from '../constants';
import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenRouteEntry,
  Player,
} from '../types';
import {
  getDestinationEntryPoints,
  getRouteEntryPoints,
} from '../utils/aventurerosTren';

type Props = {
  player: Player;
  phase: AventurerosTrenPhase;
  routes: AventurerosTrenRouteEntry[];
  destinations: AventurerosTrenDestinationEntry[];
  expanded: boolean;
  onToggle: () => void;
  onAddRoute: () => void;
  onUpdateRoute: (
    routeId: string,
    patch: Partial<AventurerosTrenRouteEntry>,
  ) => void;
  onRemoveRoute: (routeId: string) => void;
  onAddDestination: () => void;
  onUpdateDestination: (
    destId: string,
    patch: Partial<AventurerosTrenDestinationEntry>,
  ) => void;
  onRemoveDestination: (destId: string) => void;
};

export function AventurerosTrenPlayerPanel({
  player,
  phase,
  routes,
  destinations,
  expanded,
  onToggle,
  onAddRoute,
  onUpdateRoute,
  onRemoveRoute,
  onAddDestination,
  onUpdateDestination,
  onRemoveDestination,
}: Props) {
  const constrTotal = routes.reduce(
    (sum, entry) => sum + getRouteEntryPoints(entry),
    0,
  );
  const destTotal = destinations.reduce(
    (sum, entry) => sum + getDestinationEntryPoints(entry),
    0,
  );
  const phaseTotal = phase === 'construccion' ? constrTotal : destTotal;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {phase === 'construccion'
              ? `${routes.length} recorrido${routes.length === 1 ? '' : 's'}`
              : `${destinations.length} destino${destinations.length === 1 ? '' : 's'}`}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>
            {phase === 'construccion' ? 'Constr.' : 'Dest.'}
          </Text>
          <Text
            style={[
              styles.score,
              phaseTotal < 0 && styles.scoreNegative,
            ]}
          >
            {phaseTotal > 0 && phase === 'destinos' ? '+' : ''}
            {phaseTotal}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {phase === 'construccion' ? (
            <>
              {routes.length === 0 ? (
                <Text style={styles.empty}>
                  Añade cada tramo de vías que hayas construido.
                </Text>
              ) : (
                routes.map((route) => (
                  <AventurerosTrenRouteRow
                    key={route.id}
                    entry={route}
                    color={player.color}
                    onChange={(patch) => onUpdateRoute(route.id, patch)}
                    onRemove={() => onRemoveRoute(route.id)}
                  />
                ))
              )}
              <Button
                label="Añadir recorrido"
                onPress={onAddRoute}
                variant="secondary"
              />
            </>
          ) : (
            <>
              {destinations.length === 0 ? (
                <Text style={styles.empty}>
                  Añade las cartas de destino de este jugador.
                </Text>
              ) : (
                destinations.map((dest) => (
                  <AventurerosTrenDestinationRow
                    key={dest.id}
                    entry={dest}
                    color={player.color}
                    onChange={(patch) => onUpdateDestination(dest.id, patch)}
                    onRemove={() => onRemoveDestination(dest.id)}
                  />
                ))
              )}
              <Button
                label="Añadir destino"
                onPress={onAddDestination}
                variant="secondary"
              />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  empty: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
});
