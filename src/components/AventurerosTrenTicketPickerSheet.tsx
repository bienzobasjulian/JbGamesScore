import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  filterDestinationTickets,
  formatTicketLabel,
  getDestinationTickets,
  getTicketKey,
  type AventurerosTrenTicket,
} from '../constants/aventurerosTrenTickets';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { AventurerosTrenSubmode } from '../types';
import { TakenDestinationTicket } from '../utils/aventurerosTren';
import { Button } from './Button';

type Props = {
  visible: boolean;
  submode: AventurerosTrenSubmode;
  currentPlayerId: string;
  takenBy?: ReadonlyMap<string, TakenDestinationTicket>;
  onClose: () => void;
  onSelect: (ticket: AventurerosTrenTicket) => void;
};

export function AventurerosTrenTicketPickerSheet({
  visible,
  submode,
  currentPlayerId,
  takenBy,
  onClose,
  onSelect,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();
  const { height: windowHeight } = useWindowDimensions();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const tickets = getDestinationTickets(submode);
  const filtered = useMemo(
    () => filterDestinationTickets(tickets, query),
    [tickets, query],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              height: Math.round(windowHeight * 0.88),
              paddingBottom: 16 + bottomInset,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Elegir destino</Text>
          <Text style={styles.subtitle}>
            Busca por ciudad o puntos.
          </Text>

          <TextInput
            style={styles.search}
            placeholder="Boston, Miami, 21…"
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />

          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filtered.length === 0 ? (
              <Text style={styles.empty}>Ningún billete coincide.</Text>
            ) : (
              filtered.map((ticket) => {
                const key = getTicketKey(ticket);
                const owner = takenBy?.get(key);
                const taken = Boolean(owner);
                const takenLabel = owner
                  ? owner.playerId === currentPlayerId
                    ? 'Ya añadido'
                    : `Lo tiene ${owner.playerName}`
                  : null;
                const content = (
                  <>
                    <View style={styles.optionText}>
                      <Text
                        style={[
                          styles.optionTitle,
                          taken && styles.optionTitleTaken,
                        ]}
                        numberOfLines={2}
                      >
                        {formatTicketLabel(ticket)}
                      </Text>
                      {taken && takenLabel ? (
                        <Text style={styles.taken}>{takenLabel}</Text>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.optionPoints,
                        taken && styles.optionTitleTaken,
                      ]}
                    >
                      {ticket.points} pts
                    </Text>
                  </>
                );
                if (taken) {
                  return (
                    <View
                      key={key}
                      pointerEvents="none"
                      style={[styles.option, styles.optionTaken]}
                    >
                      {content}
                    </View>
                  );
                }
                return (
                  <Pressable
                    key={key}
                    onPress={() => onSelect(ticket)}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    {content}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Button label="Cerrar" onPress={onClose} variant="ghost" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: theme.border,
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
      marginBottom: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    search: {
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    list: {
      flex: 1,
    },
    listContent: {
      gap: 6,
      paddingBottom: 8,
    },
    empty: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      paddingVertical: 24,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceLight,
    },
    optionPressed: {
      opacity: 0.85,
    },
    optionTaken: {
      opacity: 0.55,
    },
    optionText: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    optionTitleTaken: {
      color: theme.textMuted,
    },
    taken: {
      fontSize: 12,
      color: theme.textMuted,
    },
    optionPoints: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.textMuted,
    },
  });
