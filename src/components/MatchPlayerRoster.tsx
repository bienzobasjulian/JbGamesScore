import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  playerCount: number;
  onChoosePlayers: () => void;
  title?: string;
  intro?: string;
  soloHint?: string;
  maxPlayers?: number;
};

export function MatchPlayerRoster({
  playerCount,
  onChoosePlayers,
  title = 'Jugadores',
  intro,
  soloHint,
  maxPlayers,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const maxLabel =
    maxPlayers != null && Number.isFinite(maxPlayers)
      ? ` · máx. ${maxPlayers}`
      : '';

  return (
    <View style={styles.section}>
      {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      <Text style={styles.title}>
        {title} ({playerCount}){maxLabel}
      </Text>
      {soloHint ? <Text style={styles.soloHint}>{soloHint}</Text> : null}
      <Button
        label="Elegir jugadores"
        onPress={onChoosePlayers}
        variant="secondary"
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  section: {
    gap: 10,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  soloHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
});
