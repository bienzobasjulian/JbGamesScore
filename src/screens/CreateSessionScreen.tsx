import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  onBack: () => void;
  onCreated: (sessionId: string) => void;
  onSave: (name: string) => string;
};

export function CreateSessionScreen({ onBack, onCreated, onSave }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [name, setName] = useState('');

  const handleSave = () => {
    const sessionId = onSave(name);
    onCreated(sessionId);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Nueva sesión de juego" onBack={onBack} />

      <Text style={styles.intro}>
        Una sesión agrupa varias partidas de la misma tarde o reunión. Los
        jugadores pueden cambiar entre partidas y verás quién ha ganado más.
      </Text>

      <Text style={styles.label}>Nombre de la sesión (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Noche de juegos del viernes"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleSave}
        returnKeyType="done"
        maxLength={40}
        autoFocus
      />

      <Button
        label="Crear sesión"
        onPress={handleSave}
        style={styles.saveBtn}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  saveBtn: {
    marginTop: 24,
  },
});
