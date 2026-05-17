import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { isRoundSelectable } from '../utils/rounds';

type Props = {
  roundCount: number;
  activeIndex: number;
  maxRounds: number | null;
  disabled?: boolean;
  onSelectRound: (index: number) => void;
  onAddRound: () => void;
};

export function RoundPagination({
  roundCount,
  activeIndex,
  maxRounds,
  disabled,
  onSelectRound,
  onAddRound,
}: Props) {
  const fixedTabs = maxRounds != null;
  const displayCount = fixedTabs ? maxRounds : roundCount;
  const showAddButton =
    !disabled &&
    !fixedTabs &&
    activeIndex === roundCount - 1;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {Array.from({ length: displayCount }, (_, index) => {
          const active = index === activeIndex;
          const selectable = isRoundSelectable(
            activeIndex,
            index,
            maxRounds,
            roundCount,
          );
          const pageDisabled = disabled || !selectable;

          return (
            <Pressable
              key={index}
              onPress={() => onSelectRound(index)}
              disabled={pageDisabled}
              style={({ pressed }) => [
                styles.page,
                active && styles.pageActive,
                pageDisabled && !active && styles.pageDisabled,
                pressed && !pageDisabled && !active && styles.pagePressed,
              ]}
            >
              <Text
                style={[
                  styles.pageText,
                  active && styles.pageTextActive,
                  pageDisabled && !active && styles.pageTextDisabled,
                ]}
              >
                {index + 1}
              </Text>
            </Pressable>
          );
        })}
        {showAddButton && (
          <Pressable
            onPress={onAddRound}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.pagePressed,
            ]}
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>
        )}
      </ScrollView>
      {fixedTabs ? (
        <Text style={styles.hint}>
          Ronda {activeIndex + 1} de {maxRounds}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    paddingVertical: 4,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  page: {
    minWidth: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pageActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '22',
  },
  pageDisabled: {
    opacity: 0.35,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  pagePressed: {
    opacity: 0.8,
  },
  pageText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.textMuted,
  },
  pageTextActive: {
    color: theme.accent,
    fontWeight: '800',
  },
  pageTextDisabled: {
    color: theme.textMuted,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.accent + '66',
    backgroundColor: theme.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 26,
    fontWeight: '300',
    color: theme.accent,
    lineHeight: 28,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
});
