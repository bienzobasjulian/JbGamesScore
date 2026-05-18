import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AddPlayerInput } from '../components/AddPlayerInput';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { GameTypePicker } from '../components/GameTypePicker';
import { PlayerCard } from '../components/PlayerCard';
import { SavedPlayerPicker } from '../components/SavedPlayerPicker';
import { TemplatePicker } from '../components/TemplatePicker';
import { AventurerosTrenSubmodePicker } from '../components/AventurerosTrenSubmodePicker';
import { theme } from '../constants';
import {
  AventurerosTrenSubmode,
  GameSettings,
  MatchTemplate,
  Player,
  SavedPlayer,
} from '../types';
import {
  CreateMatchGameType,
  getCreateMatchPlayerLimits,
  isDedicatedCreateMatchGame,
} from '../utils/games';
import {
  AVENTUREROS_TREN_MAX_PLAYERS,
  AVENTUREROS_TREN_MIN_PLAYERS,
} from '../utils/aventurerosTren';
import { defaultSettings } from '../utils/game';
import { applyTemplateDraft } from '../utils/template';

function buildInitialFromTemplate(
  templates: MatchTemplate[],
  savedPlayers: SavedPlayer[],
  templateId?: string,
) {
  if (!templateId) {
    return {
      settings: defaultSettings(),
      matchName: '',
      players: [] as Player[],
      loadedTemplateId: null as string | null,
    };
  }
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return {
      settings: defaultSettings(),
      matchName: '',
      players: [] as Player[],
      loadedTemplateId: null as string | null,
    };
  }
  const draft = applyTemplateDraft(template, savedPlayers);
  return {
    settings: draft.settings,
    matchName: draft.suggestedMatchName,
    players: draft.players,
    loadedTemplateId: template.id,
  };
}

type Props = {
  templates: MatchTemplate[];
  savedPlayers: SavedPlayer[];
  initialTemplateId?: string;
  initialGameType?: CreateMatchGameType;
  onBack: () => void;
  onStartStandard: (
    players: Player[],
    settings: GameSettings,
    name?: string | null,
  ) => void;
  onStartPelusas: (players: Player[]) => void;
  onStartSkullKing: (players: Player[]) => void;
  onStartAventurerosTren: (
    players: Player[],
    submode: AventurerosTrenSubmode,
  ) => void;
  onAddFromSaved: (player: SavedPlayer) => Player;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function CreateMatchScreen({
  templates,
  savedPlayers,
  initialTemplateId,
  initialGameType = 'standard',
  onBack,
  onStartStandard,
  onStartPelusas,
  onStartSkullKing,
  onStartAventurerosTren,
  onAddFromSaved,
  onCreateNewPlayer,
}: Props) {
  const initial = buildInitialFromTemplate(
    templates,
    savedPlayers,
    initialTemplateId,
  );
  const [gameType, setGameType] = useState<CreateMatchGameType>(initialGameType);
  const [settings, setSettings] = useState<GameSettings>(initial.settings);
  const [matchName, setMatchName] = useState(initial.matchName);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(
    initial.loadedTemplateId,
  );
  const [aventurerosSubmode, setAventurerosSubmode] =
    useState<AventurerosTrenSubmode>('base');

  const isPelusas = gameType === 'pelusas';
  const isSkullKing = gameType === 'skull_king';
  const isAventurerosTren = gameType === 'aventureros_tren';
  const isSpecialGame = isDedicatedCreateMatchGame(gameType);
  const playerLimits = getCreateMatchPlayerLimits(gameType);

  const selectedIds = useMemo(
    () => new Set(players.map((p) => p.id)),
    [players],
  );

  const canStart =
    players.length >= playerLimits.min &&
    players.length <= playerLimits.max;
  const startLabel = isPelusas ? 'Contar puntos' : 'Comenzar partida';
  const atPlayerCap = players.length >= playerLimits.max;

  const handleAddSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id) || atPlayerCap) return;
    const player = onAddFromSaved(saved);
    setPlayers((prev) => [...prev, player]);
  };

  const handleAddNew = (name: string) => {
    if (atPlayerCap) return false;
    const player = onCreateNewPlayer(name, players);
    if (!player) return false;
    if (players.some((p) => p.id === player.id)) return false;
    setPlayers((prev) => [...prev, player]);
    return true;
  };

  const handleRemove = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectGame = (next: CreateMatchGameType) => {
    setGameType(next);
    if (isDedicatedCreateMatchGame(next)) {
      setLoadedTemplateId(null);
      setSettings(defaultSettings());
      setMatchName('');
    }
  };

  const handleSelectTemplate = (template: MatchTemplate | null) => {
    if (!template) {
      setLoadedTemplateId(null);
      setSettings(defaultSettings());
      setPlayers([]);
      setMatchName('');
      return;
    }
    const draft = applyTemplateDraft(template, savedPlayers);
    setLoadedTemplateId(template.id);
    setSettings(draft.settings);
    setPlayers(draft.players);
    setMatchName(draft.suggestedMatchName);
  };

  const handleStart = () => {
    if (!canStart) return;
    if (isPelusas) {
      onStartPelusas(players);
    } else if (isSkullKing) {
      onStartSkullKing(players);
    } else if (isAventurerosTren) {
      onStartAventurerosTren(players, aventurerosSubmode);
    } else {
      onStartStandard(players, settings, matchName.trim() || null);
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      <GameTypePicker selected={gameType} onSelect={handleSelectGame} />

      {!isSpecialGame ? (
        <>
          <View style={styles.namePanel}>
            <Text style={styles.nameLabel}>Nombre de la partida (opcional)</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Ej. Domino del viernes"
              placeholderTextColor={theme.textMuted}
              value={matchName}
              onChangeText={setMatchName}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          <TemplatePicker
            templates={templates}
            savedPlayers={savedPlayers}
            selectedId={loadedTemplateId}
            onSelect={handleSelectTemplate}
          />

          <GameSettingsPanel settings={settings} onChange={setSettings} />
        </>
      ) : isPelusas ? (
        <Text style={styles.specialHint}>
          Solo necesitas elegir quién juega. El conteo de cartas y el modo
          Revolution se configuran en la siguiente pantalla.
        </Text>
      ) : isSkullKing ? (
        <Text style={styles.specialHint}>
          Partida a 10 rondas de bazas. Elige entre {playerLimits.min} y{' '}
          {playerLimits.max} jugadores.
        </Text>
      ) : (
        <>
          <AventurerosTrenSubmodePicker
            selected={aventurerosSubmode}
            onSelect={setAventurerosSubmode}
          />
          <Text style={styles.specialHint}>
            Dos fases: construcción de vías y comprobación de destinos. Elige
            entre {AVENTUREROS_TREN_MIN_PLAYERS} y{' '}
            {AVENTUREROS_TREN_MAX_PLAYERS} jugadores.
          </Text>
        </>
      )}

      <View style={styles.playersSection}>
        <Text style={styles.playersTitle}>Jugadores</Text>
        <Text style={styles.playersHint}>Guardados</Text>
        <SavedPlayerPicker
          players={savedPlayers}
          selectedIds={selectedIds}
          onSelect={handleAddSaved}
        />
        <Text style={styles.playersHint}>Nuevo nombre</Text>
        <AddPlayerInput onAdd={handleAddNew} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Nueva partida" onBack={onBack} />

      {players.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {header}
          <Text style={styles.empty}>
            {isSpecialGame
              ? `Añade entre ${playerLimits.min} y ${playerLimits.max} jugadores`
              : 'Añade al menos 2 jugadores'}
          </Text>
          <Button
            label={startLabel}
            onPress={handleStart}
            disabled={!canStart}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListFooterComponent={
            <View style={styles.footer}>
              <Button
                label={startLabel}
                onPress={handleStart}
                disabled={!canStart}
              />
            </View>
          }
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              total={0}
              roundScore={0}
              onAdjust={() => {}}
              onRemove={() => handleRemove(item.id)}
              showRoundControls={false}
              showTotal={false}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    gap: 16,
    paddingBottom: 24,
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
  specialHint: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  playersSection: {
    gap: 10,
  },
  playersTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  playersHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 2,
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
    paddingTop: 16,
    gap: 10,
  },
});
