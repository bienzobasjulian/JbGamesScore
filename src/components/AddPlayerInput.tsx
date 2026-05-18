import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { theme } from '../constants';

type Props = {
  onAdd: (name: string) => boolean;
  disabled?: boolean;
};

export function AddPlayerInput({ onAdd, disabled = false }: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (disabled) return;
    if (onAdd(name)) {
      setName('');
      Keyboard.dismiss();
    }
  };

  return (
    <>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Escribe un nombre y pulsa enter"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        maxLength={24}
        editable={!disabled}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  inputDisabled: {
    opacity: 0.5,
  },
});
