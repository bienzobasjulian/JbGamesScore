import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import {
  PlayerColorPicker,
  type PlayerColorOption,
} from './PlayerColorPicker';

type Props = {
  player: Player;
  isActive?: boolean;
  tokenColors?: readonly PlayerColorOption[];
  takenColors?: string[];
  onChangeColor?: (color: string) => void;
  onDrag: () => void;
  onRemove: () => void;
};

export function TurnOrderPlayerCard({
  player,
  isActive = false,
  tokenColors,
  takenColors,
  onChangeColor,
  onDrag,
  onRemove,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const [editingColor, setEditingColor] = useState(false);
  const canPickTokenColor = Boolean(tokenColors && onChangeColor);

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.header}>
        <PlayerAvatar
          name={player.name}
          color={player.color}
          avatar={player.avatar}
          size={48}
          radius={14}
        />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
        </View>

        <View style={styles.actions}>
          {canPickTokenColor ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                editingColor ? 'Cerrar color de ficha' : 'Editar color de ficha'
              }
              onPress={() => setEditingColor((open) => !open)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                editingColor && styles.iconBtnActive,
                pressed && styles.iconBtnPressed,
              ]}
            >
              <Text style={styles.iconText}>✎</Text>
            </Pressable>
          ) : null}

          <Pressable
            onLongPress={onDrag}
            delayLongPress={120}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <Text style={styles.iconText}>::</Text>
          </Pressable>

          <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
            <Text style={styles.removeText}>x</Text>
          </Pressable>
        </View>
      </View>

      {canPickTokenColor && editingColor ? (
        <PlayerColorPicker
          value={player.color}
          onChange={(color) => {
            onChangeColor?.(color);
            setEditingColor(false);
          }}
          options={tokenColors}
          takenValues={takenColors}
          compact
        />
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  cardActive: {
    borderColor: theme.accent,
    backgroundColor: theme.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  iconBtnActive: {
    borderColor: theme.accent,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
    color: theme.textMuted,
  },
});
