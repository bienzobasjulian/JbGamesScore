import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { theme } from '../constants';

type Props = {
  onBack: () => void;
  onSave: (name: string) => boolean;
};

export function CreatePlayerScreen({ onBack, onSave }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const ok = onSave(name);
    if (ok) {
      onBack();
    } else {
      setError('Introduce un nombre válido y único');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Nuevo jugador" onBack={onBack} />

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del jugador"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={(t) => {
          setName(t);
          setError(null);
        }}
        onSubmitEditing={handleSave}
        returnKeyType="done"
        maxLength={24}
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label="Guardar jugador"
        onPress={handleSave}
        disabled={!name.trim()}
        style={styles.saveBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  error: {
    color: theme.danger,
    fontSize: 14,
    marginTop: 8,
  },
  saveBtn: {
    marginTop: 24,
  },
});
