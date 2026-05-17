import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import {
  CREATE_MATCH_GAMES,
  CreateMatchGameType,
} from '../utils/games';

type Props = {
  selected: CreateMatchGameType;
  onSelect: (gameType: CreateMatchGameType) => void;
};

export function GameTypePicker({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const current = CREATE_MATCH_GAMES.find((g) => g.id === selected)!;

  const pick = (gameType: CreateMatchGameType) => {
    onSelect(gameType);
    setOpen(false);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Juego</Text>

      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {current.name}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.list}>
          {CREATE_MATCH_GAMES.map((game, index) => {
            const isSelected = selected === game.id;
            const isLast = index === CREATE_MATCH_GAMES.length - 1;
            return (
              <Pressable
                key={game.id}
                onPress={() => pick(game.id)}
                style={({ pressed }) => [
                  styles.option,
                  isLast && styles.optionLast,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleSelected,
                  ]}
                >
                  {game.name}
                </Text>
                <Text style={styles.optionSub}>{game.description}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerOpen: {
    borderColor: theme.accent,
  },
  triggerPressed: {
    opacity: 0.9,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
  },
  list: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.surfaceLight,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 2,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: theme.accent + '14',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  optionTitleSelected: {
    color: theme.accent,
  },
  optionSub: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
  },
});
