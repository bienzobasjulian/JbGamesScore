import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../constants';
import { Button } from './Button';

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
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del jugador"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        maxLength={24}
      />
      <Button
        label="Añadir"
        onPress={handleAdd}
        disabled={!name.trim()}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  btn: {
    paddingHorizontal: 16,
    minWidth: 90,
  },
});
