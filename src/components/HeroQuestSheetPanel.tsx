import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type {
  HeroQuestGearSlot,
  HeroQuestItemCategory,
  HeroQuestSheet,
  HeroQuestStatus,
} from '../types';
import {
  createHeroQuestGoldEntry,
  createHeroQuestItem,
  equippedAttackBonus,
  equippedDefenseBonus,
  heroQuestAttackTotal,
  heroQuestDefenseTotal,
  HERO_QUEST_CATEGORIES,
  HERO_QUEST_GEAR,
  HERO_QUEST_PRESETS,
  restoreHeroQuestSheet,
} from '../utils/heroQuest';

const STATUS: { id: HeroQuestStatus; label: string }[] = [
  { id: 'alive', label: 'Vivo' },
  { id: 'dead', label: 'Muerto' },
  { id: 'retired', label: 'Retirado' },
];

type Props = {
  sheet: HeroQuestSheet;
  startedAt: number;
  onPatch: (patch: Partial<HeroQuestSheet>) => void;
};

export function HeroQuestSheetPanel({ sheet, startedAt, onPatch }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [goldAmount, setGoldAmount] = useState('');
  const [goldNote, setGoldNote] = useState('');
  const [category, setCategory] = useState<HeroQuestItemCategory>('gear');
  const [gear, setGear] = useState<HeroQuestGearSlot>('weapon');
  const [itemName, setItemName] = useState('');
  const [itemBonus, setItemBonus] = useState('1');
  const [itemQty, setItemQty] = useState('1');
  const [itemDesc, setItemDesc] = useState('');
  const className =
    HERO_QUEST_PRESETS.find((preset) => preset.id === sheet.heroId)?.name ??
    'Héroe';
  const attackGear = equippedAttackBonus(sheet);
  const defenseGear = equippedDefenseBonus(sheet);
  const attackTotal = heroQuestAttackTotal(sheet);
  const defenseTotal = heroQuestDefenseTotal(sheet);
  const started = new Date(startedAt).toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const retired = sheet.status === 'retired';
  const dead = sheet.status === 'dead';
  const healthRatio =
    sheet.maxHealth === 0 ? 0 : Math.min(1, sheet.health / sheet.maxHealth);
  const hpColor =
    healthRatio > 0.5
      ? theme.success
      : healthRatio > 0.25
        ? theme.warning
        : theme.danger;

  const changeGold = (delta: number, note: string) => {
    if (delta === 0) return;
    const next = Math.max(0, sheet.gold + delta);
    const applied = next - sheet.gold;
    if (applied === 0) return;
    onPatch({
      gold: next,
      goldLog: [createHeroQuestGoldEntry(applied, note), ...sheet.goldLog].slice(
        0,
        30,
      ),
    });
  };

  const addItem = () => {
    const name = itemName.trim();
    if (!name) return;
    onPatch({
      items: [
        ...sheet.items,
        createHeroQuestItem({
          name,
          category,
          gear,
          bonus: Number(itemBonus) || 0,
          quantity: Number(itemQty) || 1,
          description: itemDesc,
        }),
      ],
    });
    setItemName('');
    setItemDesc('');
  };

  const updateItem = (id: string, patch: Partial<(typeof sheet.items)[number]>) => {
    onPatch({
      items: sheet.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.started}>Campaña empezada el {started}</Text>

      <View style={styles.card}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroEmoji}>{sheet.emoji}</Text>
          </View>
          <Text style={styles.className}>{className}</Text>
        </View>
        <TextInput
          style={styles.nameInput}
          placeholder="Nombre del héroe"
          placeholderTextColor={theme.textMuted}
          value={sheet.characterName}
          onChangeText={(characterName) => onPatch({ characterName })}
          maxLength={32}
        />
        <View style={[styles.hpRow, (retired || dead) && styles.locked]}>
          <Pressable
            onPress={() => onPatch({ health: Math.max(0, sheet.health - 1) })}
            disabled={retired || dead}
            style={[styles.hpBtn, { backgroundColor: theme.danger }]}
          >
            <Text style={styles.hpBtnText}>−</Text>
          </Pressable>
          <Text style={[styles.hpValue, { color: hpColor }]}>{sheet.health}</Text>
          <Pressable
            onPress={() =>
              onPatch({ health: Math.min(sheet.maxHealth, sheet.health + 1) })
            }
            disabled={retired || dead || sheet.health >= sheet.maxHealth}
            style={[
              styles.hpBtn,
              { backgroundColor: theme.success },
              (retired || dead || sheet.health >= sheet.maxHealth) && styles.stepBtnOff,
            ]}
          >
            <Text style={styles.hpBtnText}>+</Text>
          </Pressable>
        </View>
        <Text style={[styles.hpOf, { color: hpColor }]}>
          / {sheet.maxHealth} HP
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${healthRatio * 100}%`, backgroundColor: hpColor },
            ]}
          />
        </View>
        <View style={styles.kindRow}>
          {STATUS.map((entry) => {
            const selected = sheet.status === entry.id;
            return (
              <Pressable
                key={entry.id}
                onPress={() =>
                  onPatch(
                    entry.id === 'dead'
                      ? { status: 'dead', health: 0 }
                      : { status: entry.id },
                  )
                }
                style={[styles.kindChip, selected && styles.kindChipOn]}
              >
                <Text style={[styles.kindText, selected && styles.kindTextOn]}>
                  {entry.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => onPatch(restoreHeroQuestSheet(sheet))}
            style={styles.kindChip}
          >
            <Text style={styles.kindText}>Restaurar</Text>
          </Pressable>
        </View>
        {sheet.status === 'retired' ? (
          <Text style={styles.muted}>
            No juega esta misión. La ficha queda bloqueada hasta que vuelva a estar vivo.
          </Text>
        ) : null}
        {sheet.status === 'dead' ? (
          <Text style={styles.muted}>
            La vida queda a 0. Restaurar lo devuelve al máximo de la carta.
          </Text>
        ) : null}
      </View>

      <View style={[styles.statGrid, retired && styles.locked]} pointerEvents={retired ? 'none' : 'auto'}>
        <StatTile
          label="Ataque"
          value={String(attackTotal)}
          hint={`base ${sheet.baseAttack}${attackGear ? ` +${attackGear}` : ''}`}
          tone={theme.danger}
          onDec={() => onPatch({ attackMod: sheet.attackMod - 1 })}
          onInc={() => onPatch({ attackMod: sheet.attackMod + 1 })}
        />
        <StatTile
          label="Defensa"
          value={String(defenseTotal)}
          hint={`base ${sheet.baseDefense}${defenseGear ? ` +${defenseGear}` : ''}`}
          tone="#3D8BFF"
          onDec={() => onPatch({ defenseMod: sheet.defenseMod - 1 })}
          onInc={() => onPatch({ defenseMod: sheet.defenseMod + 1 })}
        />
        <StatTile
          label="Mente"
          value={String(sheet.mind)}
          hint={`/ ${sheet.maxMind}`}
          tone="#A78BFA"
          onDec={() => onPatch({ mind: Math.max(0, sheet.mind - 1) })}
          onInc={() =>
            onPatch({ mind: Math.min(sheet.maxMind, sheet.mind + 1) })
          }
          incDisabled={sheet.mind >= sheet.maxMind}
        />
      </View>

      <View style={[styles.card, retired && styles.locked]} pointerEvents={retired ? 'none' : 'auto'}>
        <View style={styles.rowBetween}>
          <Text style={styles.section}>Oro</Text>
          <Text style={styles.goldValue}>{sheet.gold}</Text>
        </View>
        <View style={styles.goldSplit}>
          {[-10, -5, -1].map((delta) => (
            <Pressable
              key={delta}
              onPress={() => changeGold(delta, 'Ajuste')}
              style={styles.goldBtn}
            >
              <Text style={styles.goldBtnText}>{delta}</Text>
            </Pressable>
          ))}
          <View style={styles.goldGap} />
          {[1, 5, 10].map((delta) => (
            <Pressable
              key={delta}
              onPress={() => changeGold(delta, 'Ajuste')}
              style={styles.goldBtn}
            >
              <Text style={styles.goldBtnText}>+{delta}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Cantidad, ej. -250 o 100"
          placeholderTextColor={theme.textMuted}
          value={goldAmount}
          onChangeText={setGoldAmount}
        />
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.addInput]}
            placeholder="Concepto, ej. espada"
            placeholderTextColor={theme.textMuted}
            value={goldNote}
            onChangeText={setGoldNote}
          />
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              const delta = Number(goldAmount);
              if (!Number.isFinite(delta) || delta === 0) return;
              changeGold(Math.trunc(delta), goldNote || 'Apunte');
              setGoldAmount('');
              setGoldNote('');
            }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
        {sheet.goldLog.slice(0, 5).map((entry) => (
          <Text key={entry.id} style={styles.log}>
            {entry.delta > 0 ? `+${entry.delta}` : entry.delta} {entry.note}
          </Text>
        ))}
      </View>

      <View style={[styles.card, retired && styles.locked]} pointerEvents={retired ? 'none' : 'auto'}>
        <Text style={styles.section}>Inventario</Text>
        {sheet.items.length === 0 ? (
          <Text style={styles.empty}>Inventario vacío</Text>
        ) : (
          sheet.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity > 1 ? `${item.quantity}× ` : ''}
                {item.name}
                {item.category === 'gear' && item.bonus ? ` +${item.bonus}` : ''}
              </Text>
              {item.category === 'gear' ? (
                <Pressable
                  onPress={() => updateItem(item.id, { equipped: !item.equipped })}
                  style={[styles.kindChip, item.equipped && styles.kindChipOn]}
                >
                  <Text style={[styles.kindText, item.equipped && styles.kindTextOn]}>
                    {item.equipped ? 'Puesto' : 'Equipar'}
                  </Text>
                </Pressable>
              ) : null}
              {item.category === 'spell' ? (
                <Pressable
                  onPress={() => updateItem(item.id, { used: !item.used })}
                  style={[styles.kindChip, item.used && styles.kindChipOn]}
                >
                  <Text style={[styles.kindText, item.used && styles.kindTextOn]}>
                    {item.used ? 'Usado' : 'Listo'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() =>
                  onPatch({
                    items: sheet.items.filter((entry) => entry.id !== item.id),
                  })
                }
              >
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
        <View style={styles.kindRow}>
          {HERO_QUEST_CATEGORIES.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => setCategory(entry.id)}
              style={[
                styles.kindChip,
                styles.kindChipFill,
                category === entry.id && styles.kindChipOn,
              ]}
            >
              <Text
                style={[
                  styles.kindText,
                  category === entry.id && styles.kindTextOn,
                ]}
              >
                {entry.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {category === 'gear' ? (
          <View style={styles.gearBox}>
            <View style={styles.kindRow}>
              {HERO_QUEST_GEAR.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => setGear(entry.id)}
                  style={[styles.kindChip, styles.kindChipFill, gear === entry.id && styles.kindChipOn]}
                >
                  <Text
                    style={[styles.kindText, gear === entry.id && styles.kindTextOn]}
                  >
                    {entry.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.bonusRow}>
              <Text style={styles.muted}>Dados extra</Text>
              <Pressable
                onPress={() =>
                  setItemBonus(String(Math.max(0, (Number(itemBonus) || 0) - 1)))
                }
                style={styles.miniBtn}
              >
                <Text style={styles.miniBtnText}>−</Text>
              </Pressable>
              <Text style={styles.bonusValue}>{Number(itemBonus) || 0}</Text>
              <Pressable
                onPress={() => setItemBonus(String((Number(itemBonus) || 0) + 1))}
                style={styles.miniBtn}
              >
                <Text style={styles.miniBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.addInput]}
            placeholder="Añadir objeto"
            placeholderTextColor={theme.textMuted}
            value={itemName}
            onChangeText={setItemName}
            onSubmitEditing={addItem}
          />
          <Pressable onPress={addItem} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Notas</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Pistas, secretos, objetivos…"
          placeholderTextColor={theme.textMuted}
          value={sheet.notes}
          onChangeText={(notes) => onPatch({ notes })}
          multiline
        />
      </View>

    </ScrollView>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone,
  onDec,
  onInc,
  onPressValue,
  incDisabled,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: string;
  onDec: () => void;
  onInc: () => void;
  onPressValue?: () => void;
  incDisabled?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.tile, { backgroundColor: `${tone}22`, borderColor: `${tone}88` }]}>
      <Pressable onPress={onPressValue} disabled={!onPressValue}>
        <Text style={[styles.tileValue, { color: tone }]}>{value}</Text>
      </Pressable>
      <Text style={[styles.tileLabel, { color: tone }]}>{label}</Text>
      {hint ? <Text style={styles.tileHint}>{hint}</Text> : null}
      <View style={styles.tileBtns}>
        <Pressable onPress={onDec} hitSlop={8}>
          <Text style={styles.tileBtn}>−</Text>
        </Pressable>
        <Pressable onPress={onInc} hitSlop={8} disabled={incDisabled}>
          <Text style={[styles.tileBtn, incDisabled && styles.stepBtnOff]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 48, gap: 12 },
    started: { color: theme.textMuted, textAlign: 'center' },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      gap: 8,
    },
    heroTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    hpRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    locked: { opacity: 0.45 },
    heroBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
    },
    heroEmoji: { fontSize: 24 },
    heroTitles: { flex: 1, gap: 4 },
    className: { color: theme.warning, fontSize: 18, fontWeight: '800' },
    nameInput: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '700',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingVertical: 6,
    },
    section: { color: theme.text, fontSize: 16, fontWeight: '800' },
    muted: { color: theme.textMuted },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    hpValue: { fontSize: 34, fontWeight: '800', minWidth: 28, textAlign: 'center' },
    hpOf: { textAlign: 'right', fontWeight: '700', marginTop: -4 },
    hpBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
    statGrid: { flexDirection: 'row', gap: 8 },
    tile: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 2,
      alignItems: 'center',
      minWidth: 0,
    },
    tileValue: { fontSize: 18, fontWeight: '800' },
    tileLabel: { fontSize: 10, fontWeight: '800', marginTop: 2 },
    tileHint: { color: theme.textMuted, fontSize: 9 },
    tileBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
    tileBtn: { color: theme.text, fontSize: 16, fontWeight: '700' },
    goldSplit: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    goldGap: { width: 8 },
    goldBtn: {
      minWidth: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.surfaceLight,
    },
    goldBtnText: { color: theme.text, fontWeight: '700' },
    hpBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
    },
    stepBtnOff: { opacity: 0.35 },
    stepBtnText: { color: theme.text, fontSize: 20 },
    stepValue: {
      minWidth: 24,
      textAlign: 'center',
      color: theme.text,
      fontWeight: '700',
    },
    barTrack: {
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    barFill: { height: 8, backgroundColor: theme.success },
    movement: { color: theme.warning, fontSize: 28, fontWeight: '800' },
    goldValue: { color: theme.warning, fontSize: 28, fontWeight: '800' },
    log: { color: theme.textMuted, fontSize: 13 },
    group: { gap: 6 },
    groupTitle: { color: theme.accent, fontWeight: '700' },
    empty: { color: theme.textMuted, textAlign: 'center', paddingVertical: 4 },
    itemBlock: { gap: 4 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemName: { flex: 1, color: theme.text, fontWeight: '600' },
    remove: { color: theme.textMuted, fontSize: 16, paddingHorizontal: 4 },
    kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    kindChip: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    kindChipFill: { flexGrow: 1, alignItems: 'center' },
    kindChipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
    gearBox: { gap: 8 },
    bonusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bonusValue: {
      minWidth: 16,
      textAlign: 'center',
      color: theme.text,
      fontWeight: '700',
    },
    miniBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
    },
    miniBtnText: { color: theme.text, fontSize: 16, fontWeight: '700' },
    kindText: { color: theme.text, fontSize: 13 },
    kindTextOn: { color: theme.onAccent, fontWeight: '700' },
    addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', height: 44 },
    addInput: { flex: 1, height: 44, paddingVertical: 0 },
    amount: { width: 72 },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: { color: theme.onAccent, fontSize: 24, fontWeight: '700' },
    input: {
      backgroundColor: theme.bg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      fontSize: 16,
    },
    notes: { minHeight: 90, textAlignVertical: 'top' },
    primaryBtn: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    primaryBtnText: { color: theme.onAccent, fontWeight: '800' },
    roll: { color: theme.text, fontWeight: '700', textAlign: 'center' },
  });
