import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { theme } from '../constants';
import { EditTemplateDraft } from '../types/playerSelection';
import { AppScreen, GameSettings, MatchTemplate, Player, SavedPlayer } from '../types';
import { defaultSettings } from '../utils/game';
import { isAnonymousPlayer } from '../utils/playerSelection';

type Props = {
  template?: MatchTemplate;
  savedPlayers: SavedPlayer[];
  restoredDraft?: EditTemplateDraft | null;
  onBack: () => void;
  onSave: (draft: {
    id?: string;
    name: string;
    settings: GameSettings;
    playerIds: string[];
  }) => string | null;
  onDelete?: () => void;
  onOpenPlayerSelection: (config: {
    draftKey: 'editTemplate';
    parentDraft: EditTemplateDraft;
    players: Player[];
    maxPlayers: number;
    allowAnonymous: boolean;
    returnScreen: AppScreen;
  }) => void;
};

function initialPlayerIds(
  restoredDraft?: EditTemplateDraft | null,
  template?: MatchTemplate,
): string[] {
  if (restoredDraft?.players) {
    return restoredDraft.players
      .filter((player) => !isAnonymousPlayer(player))
      .map((player) => player.id);
  }
  return restoredDraft?.playerIds ?? template?.playerIds ?? [];
}

export function EditTemplateScreen({
  template,
  savedPlayers,
  restoredDraft,
  onBack,
  onSave,
  onDelete,
  onOpenPlayerSelection,
}: Props) {
  const isNew = template == null;
  const [name, setName] = useState(restoredDraft?.name ?? template?.name ?? '');
  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? template?.settings ?? defaultSettings(),
  );
  const [playerIds, setPlayerIds] = useState<string[]>(() =>
    initialPlayerIds(restoredDraft, template),
  );
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rosterPlayers = useMemo(
    () =>
      playerIds
        .map((id) => savedPlayers.find((p) => p.id === id))
        .filter((p): p is SavedPlayer => p != null)
        .map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        })),
    [playerIds, savedPlayers],
  );

  const handleChoosePlayers = () => {
    onOpenPlayerSelection({
      draftKey: 'editTemplate',
      parentDraft: { name, settings, playerIds },
      players: rosterPlayers,
      maxPlayers: Number.POSITIVE_INFINITY,
      allowAnonymous: false,
      returnScreen: {
        type: 'editTemplate',
        templateId: template?.id,
      },
    });
  };

  const handleRemove = (id: string) => {
    setPlayerIds((prev) => prev.filter((pid) => pid !== id));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('El nombre de la plantilla es obligatorio');
      return;
    }
    const id = onSave({
      id: template?.id,
      name: trimmed,
      settings,
      playerIds,
    });
    if (id) {
      onBack();
    } else {
      setError('No se pudo guardar la plantilla');
    }
  };

  const formBlock = (
    <View style={styles.headerBlock}>
      <View style={styles.namePanel}>
        <Text style={styles.nameLabel}>Nombre de la plantilla</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Ej. Domino en familia"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(null);
          }}
          maxLength={40}
          returnKeyType="done"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <GameSettingsPanel settings={settings} onChange={setSettings} />

      <MatchPlayerRoster
        title="Jugadores habituales"
        intro="Opcional. Se cargarán al usar esta plantilla en una partida nueva."
        playerCount={rosterPlayers.length}
        onChoosePlayers={handleChoosePlayers}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title={isNew ? 'Nueva plantilla' : 'Editar plantilla'}
        onBack={onBack}
      />

      <ReorderablePlayersList
        players={rosterPlayers}
        contentContainerStyle={styles.list}
        listHeaderComponent={formBlock}
        listEmptyComponent={
          <Text style={styles.empty}>
            Pulsa «Elegir jugadores» para añadir jugadores habituales.
          </Text>
        }
        onChange={(players) => setPlayerIds(players.map((player) => player.id))}
        onRemove={handleRemove}
      />

      <View style={styles.footer}>
        <Button label="Guardar plantilla" onPress={handleSave} />
        {!isNew && onDelete ? (
          <Button
            label="Eliminar plantilla"
            onPress={() => setDeleteVisible(true)}
            variant="danger"
          />
        ) : null}
      </View>

      <ConfirmModal
        visible={deleteVisible}
        title="¿Eliminar plantilla?"
        message={
          template
            ? `Se borrará «${template.name}» permanentemente.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          setDeleteVisible(false);
          onDelete?.();
        }}
        onCancel={() => setDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 12,
  },
  namePanel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  nameInput: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  error: {
    fontSize: 13,
    color: theme.danger,
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  empty: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
