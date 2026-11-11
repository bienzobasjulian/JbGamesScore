import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
        <View style={styles.hpLabel}>
          <HqIcon name="heart" color={hpColor} size={18} />
          <Text style={[styles.hpOf, { color: hpColor }]}>Vida</Text>
        </View>
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
          icon="sword"
          label="Ataque"
          value={String(attackTotal)}
          hint={`base ${sheet.baseAttack}${attackGear ? ` +${attackGear}` : ''}`}
          tone={theme.danger}
          onDec={() => onPatch({ attackMod: sheet.attackMod - 1 })}
          onInc={() => onPatch({ attackMod: sheet.attackMod + 1 })}
        />
        <StatTile
          icon="shield"
          label="Defensa"
          value={String(defenseTotal)}
          hint={`base ${sheet.baseDefense}${defenseGear ? ` +${defenseGear}` : ''}`}
          tone="#3D8BFF"
          onDec={() => onPatch({ defenseMod: sheet.defenseMod - 1 })}
          onInc={() => onPatch({ defenseMod: sheet.defenseMod + 1 })}
        />
        <StatTile
          icon="brain"
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
          <View style={styles.sectionRow}>
            <HqIcon name="gold" color={theme.warning} size={18} />
            <Text style={styles.section}>Oro</Text>
          </View>
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

function HqIcon({
  name,
  color,
  size,
}: {
  name: 'heart' | 'sword' | 'shield' | 'brain' | 'gold';
  color: string;
  size: number;
}) {
  if (name === 'heart') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'shield') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M11.302 21.6149C11.5234 21.744 11.6341 21.8086 11.7903 21.8421C11.9116 21.8681 12.0884 21.8681 12.2097 21.8421C12.3659 21.8086 12.4766 21.744 12.698 21.6149C14.646 20.4784 20 16.9084 20 12V6.6C20 6.04207 20 5.7631 19.8926 5.55048C19.7974 5.36198 19.6487 5.21152 19.4613 5.11409C19.25 5.00419 18.9663 5.00084 18.3988 4.99413C15.4272 4.95899 13.7136 4.71361 12 3C10.2864 4.71361 8.57279 4.95899 5.6012 4.99413C5.03373 5.00084 4.74999 5.00419 4.53865 5.11409C4.35129 5.21152 4.20259 5.36198 4.10739 5.55048C4 5.7631 4 6.04207 4 6.6V12C4 16.9084 9.35396 20.4784 11.302 21.6149Z"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'brain') {
    const paths = [
      'M12,4.36V20.59a1.92,1.92,0,0,1-1.91,1.91,1.93,1.93,0,0,1-1.91-1.91v0a2.45,2.45,0,0,1-.48,0,3.35,3.35,0,0,1-3.34-3.34,3.19,3.19,0,0,1,.08-.7A4.29,4.29,0,0,1,3.6,8.79,3.24,3.24,0,0,1,3.41,7.7,3.34,3.34,0,0,1,6.27,4.4v0a2.87,2.87,0,0,1,5.73,0Z',
      'M6.75,11.05a3.35,3.35,0,0,1,0-6.69',
      'M8.18,13.91h0A3.82,3.82,0,0,1,12,17.73h0',
      'M9.14,7.23h0A2.86,2.86,0,0,0,12,4.36h0',
      'M12,4.36V20.59a1.92,1.92,0,0,0,1.91,1.91,1.93,1.93,0,0,0,1.91-1.91v0a2.45,2.45,0,0,0,.48,0,3.35,3.35,0,0,0,3.34-3.34,3.19,3.19,0,0,0-.08-.7,4.29,4.29,0,0,0,.84-7.76,3.24,3.24,0,0,0,.19-1.09,3.34,3.34,0,0,0-2.86-3.3v0a2.87,2.87,0,0,0-5.73,0Z',
      'M17.25,11.05a3.35,3.35,0,0,0,0-6.69',
      'M15.82,13.91h0A3.82,3.82,0,0,0,12,17.73h0',
      'M14.86,7.23h0A2.86,2.86,0,0,1,12,4.36h0',
    ];
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {paths.map((d, index) => (
          <Path
            key={index}
            d={d}
            stroke={color}
            strokeWidth={1.91}
            fill="none"
          />
        ))}
      </Svg>
    );
  }
  if (name === 'gold') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.59235 5H13.8141C14.8954 5 14.3016 6.664 13.8638 7.679L13.3656 8.843L13.2983 9C13.7702 8.97651 14.2369 9.11054 14.6282 9.382C16.0921 10.7558 17.2802 12.4098 18.1256 14.251C18.455 14.9318 18.5857 15.6958 18.5019 16.451C18.4013 18.3759 16.8956 19.9098 15.0182 20H8.38823C6.51033 19.9125 5.0024 18.3802 4.89968 16.455C4.81587 15.6998 4.94656 14.9358 5.27603 14.255C6.12242 12.412 7.31216 10.7565 8.77823 9.382C9.1696 9.11054 9.63622 8.97651 10.1081 9L10.0301 8.819L9.54263 7.679C9.1068 6.664 8.5101 5 9.59235 5Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path
          d="M11.9785 18H11.497C11.3893 18 11.302 17.9105 11.302 17.8V17.3985C11.302 17.2929 11.2219 17.2061 11.1195 17.1944C10.8757 17.1667 10.6399 17.115 10.412 17.0394C10.1906 16.9648 9.99879 16.8764 9.83657 16.7739C9.76202 16.7268 9.7349 16.6312 9.76572 16.5472L10.096 15.6466C10.1405 15.5254 10.284 15.479 10.3945 15.5417C10.5437 15.6262 10.7041 15.6985 10.8755 15.7585C11.131 15.8429 11.3762 15.8851 11.611 15.8851C11.8129 15.8851 11.9572 15.8628 12.0437 15.8181C12.1302 15.7684 12.1735 15.6964 12.1735 15.6021C12.1735 15.4929 12.1158 15.411 12.0004 15.3564C11.8892 15.3018 11.7037 15.2422 11.4442 15.1777C11.1104 15.0933 10.8323 15.0039 10.6098 14.9096C10.3873 14.8103 10.1936 14.6514 10.0288 14.433C9.86396 14.2096 9.78156 13.9092 9.78156 13.5319C9.78156 13.095 9.91136 12.7202 10.1709 12.4074C10.4049 12.13 10.7279 11.9424 11.1401 11.8447C11.2329 11.8227 11.302 11.7401 11.302 11.6425V11.2C11.302 11.0895 11.3893 11 11.497 11H11.9785C12.0862 11 12.1735 11.0895 12.1735 11.2V11.6172C12.1735 11.7194 12.2487 11.8045 12.3471 11.8202C12.7082 11.8777 13.0255 11.9866 13.2989 12.1469C13.3765 12.1924 13.4073 12.2892 13.3775 12.3756L13.0684 13.2725C13.0275 13.3914 12.891 13.4417 12.7812 13.3849C12.433 13.2049 12.1007 13.1149 11.7841 13.1149C11.4091 13.1149 11.2216 13.2241 11.2216 13.4425C11.2216 13.5468 11.2773 13.6262 11.3885 13.6809C11.4998 13.7305 11.6831 13.7851 11.9386 13.8447C12.2682 13.9192 12.5464 14.006 12.773 14.1053C12.9996 14.1996 13.1953 14.356 13.3602 14.5745C13.5291 14.7929 13.6136 15.0908 13.6136 15.4681C13.6136 15.8851 13.4879 16.25 13.2365 16.5628C13.0176 16.8354 12.7145 17.0262 12.3274 17.1353C12.2384 17.1604 12.1735 17.2412 12.1735 17.3358V17.8C12.1735 17.9105 12.0862 18 11.9785 18Z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19 1.48416e-05L23 0C23.2652 -9.53668e-07 23.5195 0.105355 23.7071 0.292891C23.8946 0.480426 24 0.73478 24 0.999997L24 5.00001C24 5.26523 23.8946 5.51958 23.7071 5.70712L11.9142 17.5L13.7071 19.2929C14.0976 19.6834 14.0976 20.3166 13.7071 20.7071C13.3166 21.0977 12.6834 21.0977 12.2929 20.7071L9.79289 18.2071L9.46376 17.878L5.9999 20.9955C6.00096 21.7635 5.70873 22.534 5.12132 23.1214C3.94975 24.293 2.05025 24.293 0.87868 23.1214C-0.292893 21.9498 -0.292893 20.0503 0.87868 18.8787C1.46607 18.2913 2.23647 17.9991 3.00451 18.0002L6.12202 14.5363L5.79287 14.2071L3.29289 11.7071C2.90237 11.3166 2.90237 10.6834 3.29289 10.2929C3.68342 9.90239 4.31658 9.90239 4.70711 10.2929L6.49998 12.0858L18.2929 0.292907C18.4804 0.105372 18.7348 1.57952e-05 19 1.48416e-05ZM7.91419 13.5L8.2071 13.7929L10.2071 15.7929L10.5 16.0858L22 4.5858L22 2L19.4142 2.00001L7.91419 13.5ZM7.53819 15.9524L5.00435 18.7678C5.0441 18.8035 5.08311 18.8405 5.12132 18.8787C5.15952 18.9169 5.19648 18.9559 5.23221 18.9957L8.04759 16.4618L7.53819 15.9524ZM3.20676 20.0214C2.88445 19.954 2.54009 20.0458 2.29289 20.293C1.90237 20.6835 1.90237 21.3166 2.29289 21.7072C2.68342 22.0977 3.31658 22.0977 3.70711 21.7072C3.95431 21.46 4.0461 21.1156 3.97862 20.7933C3.94032 20.6103 3.85075 20.4366 3.70711 20.293C3.56346 20.1493 3.3897 20.0597 3.20676 20.0214Z"
      />
    </Svg>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  tone,
  onDec,
  onInc,
  onPressValue,
  incDisabled,
}: {
  icon: 'sword' | 'shield' | 'brain';
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
      <View style={styles.tileLabelRow}>
        <HqIcon name={icon} color={tone} size={16} />
        <Text style={[styles.tileLabel, { color: tone }]}>{label}</Text>
      </View>
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
    hpLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tileLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
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
