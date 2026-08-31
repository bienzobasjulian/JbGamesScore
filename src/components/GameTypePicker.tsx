import { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../constants';
import {
  CREATE_MATCH_GAMES,
  CreateMatchGameType,
} from '../utils/games';

type Props = {
  selected: CreateMatchGameType;
  onSelect: (gameType: CreateMatchGameType) => void;
};

type TriggerLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DROPDOWN_GAP = 4;
const DROPDOWN_MAX_HEIGHT = 360;
const SCREEN_PADDING = 16;

function getDropdownLayout(trigger: TriggerLayout) {
  const windowHeight = Dimensions.get('window').height;
  const triggerBottom = trigger.y + trigger.height;
  const spaceBelow = windowHeight - triggerBottom - SCREEN_PADDING;
  const spaceAbove = trigger.y - SCREEN_PADDING;
  const openBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
  const maxListHeight = Math.min(
    DROPDOWN_MAX_HEIGHT,
    Math.max(
      120,
      (openBelow ? spaceBelow : spaceAbove) - DROPDOWN_GAP,
    ),
  );

  if (openBelow) {
    return {
      maxListHeight,
      style: {
        top: triggerBottom + DROPDOWN_GAP,
        left: trigger.x,
        width: trigger.width,
        maxHeight: maxListHeight,
      },
    };
  }

  return {
    maxListHeight,
    style: {
      bottom: windowHeight - trigger.y + DROPDOWN_GAP,
      left: trigger.x,
      width: trigger.width,
      maxHeight: maxListHeight,
    },
  };
}

export function GameTypePicker({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(
    null,
  );
  const triggerRef = useRef<View>(null);
  const current = CREATE_MATCH_GAMES.find((g) => g.id === selected)!;

  const close = () => {
    setOpen(false);
    setTriggerLayout(null);
  };

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  const pick = (gameType: CreateMatchGameType) => {
    onSelect(gameType);
    close();
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Juego</Text>

      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={openDropdown}
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
      </View>

      <Modal
        visible={open && triggerLayout != null}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          {triggerLayout ? (
            (() => {
              const { style: listPosition } = getDropdownLayout(triggerLayout);
              return (
                <View style={[styles.list, listPosition]}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    bounces={false}
                    showsVerticalScrollIndicator
                  >
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
                  </ScrollView>
                </View>
              );
            })()
          ) : null}
        </View>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  list: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.surfaceLight,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 360,
    zIndex: 1,
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
