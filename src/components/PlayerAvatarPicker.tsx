import { Pressable, StyleSheet, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { PLAYER_AVATAR_OPTIONS } from '../utils/playerAvatars';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  value: string | null;
  onChange: (avatar: string | null) => void;
  previewName: string;
  previewColor: string;
};

export function PlayerAvatarPicker({
  value,
  onChange,
  previewName,
  previewColor,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const initialSelected = value == null;

  return (
    <View style={styles.grid}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Usar inicial"
        accessibilityState={{ selected: initialSelected }}
        onPress={() => onChange(null)}
        style={({ pressed }) => [
          styles.swatch,
          initialSelected && styles.swatchSelected,
          pressed && styles.swatchPressed,
        ]}
      >
        <PlayerAvatar
          name={previewName}
          color={previewColor}
          avatar={null}
          size={40}
          radius={10}
        />
      </Pressable>

      {PLAYER_AVATAR_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.swatch,
              selected && styles.swatchSelected,
              pressed && styles.swatchPressed,
            ]}
          >
            <PlayerAvatar
              name={option.label}
              color={previewColor}
              avatar={option.id}
              size={40}
              radius={10}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
    },
    swatch: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      padding: 1,
    },
    swatchSelected: {
      borderColor: theme.text,
    },
    swatchPressed: {
      opacity: 0.85,
    },
  });
