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
};

export function AddPlayerInput({ onAdd }: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (onAdd(name)) {
      setName('');
      Keyboard.dismiss();
    }
  };

  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="Escribe un nombre y pulsa enter"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        maxLength={24}
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
});
