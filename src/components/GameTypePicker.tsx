import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GameRulesSheet } from './GameRulesSheet';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  getCreateMatchHowTo,
  type CreateMatchHowTo,
} from '../utils/createMatchHowTo';
import {
  CreateMatchGameOption,
  CreateMatchGameType,
} from '../utils/games';

type Props = {
  selected: CreateMatchGameType;
  onSelect: (gameType: CreateMatchGameType) => void;
  games: CreateMatchGameOption[];
};

export function GameTypePicker({ selected, onSelect, games }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rules, setRules] = useState<CreateMatchHowTo | null>(null);

  const selectedGame = games.find((game) => game.id === selected);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return games;
    return games.filter((game) =>
      game.name.toLocaleLowerCase().includes(needle),
    );
  }, [games, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (game: CreateMatchGameOption) => {
    onSelect(game.id);
    close();
  };

  return (
    <>
    <Pressable
      onPress={() => setOpen(true)}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Elegir juego"
    >
      <Text style={styles.triggerText} numberOfLines={1}>
        {selectedGame?.name ?? 'Elegir juego'}
      </Text>
      <Ionicons name="pencil-outline" size={18} color={theme.textMuted} />
    </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: 12 + bottomInset }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Juego</Text>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar juego"
              placeholderTextColor={theme.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filtered.length === 0 ? (
                <Text style={styles.empty}>Ningún juego coincide</Text>
              ) : (
                filtered.map((game) => {
                  const isSelected = game.id === selected;
                  const howTo = getCreateMatchHowTo(game.id);
                  return (
                    <View key={game.id} style={styles.option}>
                      <Pressable
                        onPress={() => pick(game)}
                        style={({ pressed }) => [
                          styles.optionMain,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            isSelected && styles.optionTitleSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {game.name}
                        </Text>
                        {isSelected ? (
                          <Text style={styles.check}>✓</Text>
                        ) : null}
                      </Pressable>
                      {howTo ? (
                        <Pressable
                          onPress={() => setRules(howTo)}
                          hitSlop={8}
                          accessibilityLabel={`Cómo jugar a ${game.name}`}
                          style={styles.infoBtn}
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={22}
                            color={theme.textMuted}
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <GameRulesSheet rules={rules} onClose={() => setRules(null)} />
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    pressed: {
      opacity: 0.7,
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      maxHeight: '78%',
      backgroundColor: theme.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 10,
      gap: 12,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      marginBottom: 4,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    search: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      gap: 12,
    },
    infoBtn: {
      paddingLeft: 8,
      paddingVertical: 16,
    },
    optionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    optionTitleSelected: {
      color: theme.accent,
      fontWeight: '800',
    },
    check: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.accent,
    },
    empty: {
      paddingVertical: 24,
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 15,
    },
  });
