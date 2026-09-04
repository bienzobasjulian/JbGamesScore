import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type { HowToPlayItem, HowToPlaySection } from '../types/howToPlay';
import { AppHeader } from './AppHeader';

function itemKey(item: HowToPlayItem, index: number): string {
  if (item.type === 'term') return `term-${item.term}`;
  if (item.type === 'heading') return `heading-${item.title}`;
  if (item.type === 'hierarchy') return `hierarchy-${index}`;
  if (item.type === 'matchups') return `matchups-${index}`;
  if (item.type === 'table') return `table-${index}`;
  return `note-${index}`;
}

function HowToPlayHierarchyView({
  levels,
}: {
  levels: Extract<HowToPlayItem, { type: 'hierarchy' }>['levels'];
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.hierarchy}>
      {levels.map((level, index) => (
        <View key={level.label} style={styles.hierarchyStep}>
          <View style={styles.hierarchyCard}>
            <Text style={styles.hierarchyLabel}>{level.label}</Text>
          </View>
          {index < levels.length - 1 ? (
            <View style={styles.hierarchyArrow}>
              <Text style={styles.hierarchyArrowMark}>↓</Text>
              <Text style={styles.hierarchyArrowText}>gana a</Text>
              {level.arrowBonus ? (
                <Text style={styles.hierarchyBonus}>{level.arrowBonus}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function HowToPlayMatchupsView({
  rows,
}: {
  rows: Extract<HowToPlayItem, { type: 'matchups' }>['rows'];
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.matchups}>
      {rows.map((row) => (
        <View key={`${row.from}-${row.to}`} style={styles.matchupRow}>
          <View style={styles.matchupCard}>
            <Text style={styles.hierarchyLabel}>{row.from}</Text>
          </View>
          <View style={styles.matchupArrow}>
            <Text style={styles.hierarchyArrowMark}>→</Text>
            <Text style={styles.hierarchyArrowText}>gana a</Text>
            {row.bonus ? (
              <Text style={styles.hierarchyBonus}>{row.bonus}</Text>
            ) : null}
          </View>
          <View style={styles.matchupCard}>
            <Text style={styles.hierarchyLabel}>{row.to}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function HowToPlayItemView({ item }: { item: HowToPlayItem }) {
  const styles = useThemedStyles(createStyles);

  if (item.type === 'heading') {
    return (
      <View style={styles.headingBlock}>
        <Text style={styles.heading}>{item.title}</Text>
        {item.body ? <Text style={styles.definition}>{item.body}</Text> : null}
      </View>
    );
  }

  if (item.type === 'note') {
    return (
      <View style={styles.noteBlock}>
        <Text style={styles.note}>{item.text}</Text>
      </View>
    );
  }

  if (item.type === 'hierarchy') {
    return <HowToPlayHierarchyView levels={item.levels} />;
  }

  if (item.type === 'matchups') {
    return <HowToPlayMatchupsView rows={item.rows} />;
  }

  if (item.type === 'table') {
    const align = item.align ?? 'score';
    const last = item.headers.length - 1;
    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {item.headers.map((header, index) => (
            <Text
              key={`${header}-${index}`}
              style={[
                styles.tableHeaderCell,
                align === 'center' && styles.tableCellCenter,
                align === 'score' &&
                  index === last &&
                  styles.tableHeaderCellRight,
                align === 'text' && index === last && styles.tableCellGrow,
              ]}
            >
              {header}
            </Text>
          ))}
        </View>
        {item.rows.map((cells, rowIndex) => (
          <View
            key={`${cells.join('-')}-${rowIndex}`}
            style={[
              styles.tableRow,
              rowIndex === 0 && styles.tableRowFirst,
              rowIndex % 2 === 1 && styles.tableRowAlt,
            ]}
          >
            {cells.map((cell, index) => (
              <Text
                key={`${cell}-${index}`}
                style={[
                  styles.tableCell,
                  align === 'center' && styles.tableCellCenter,
                  align === 'score' &&
                    index === last &&
                    styles.tableCellRight,
                  align === 'text' && styles.tableCellText,
                  align === 'text' && index === last && styles.tableCellGrow,
                ]}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.termBlock}>
      <Text style={styles.term}>{item.term}</Text>
      <Text style={styles.definition}>{item.definition}</Text>
    </View>
  );
}

type Props = {
  title: string;
  onBack: () => void;
  body?: string;
  items?: HowToPlayItem[];
  footer?: string;
  sections?: HowToPlaySection[];
};

export function HowToPlayScreen({
  title,
  body,
  items,
  footer,
  sections,
  onBack,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [openTitles, setOpenTitles] = useState<string[]>(() =>
    sections?.[0] ? [sections[0].title] : [],
  );

  const toggle = (sectionTitle: string) => {
    setOpenTitles((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((item) => item !== sectionTitle)
        : [...prev, sectionTitle],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={title} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {items?.map((item, index) => (
          <HowToPlayItemView key={itemKey(item, index)} item={item} />
        ))}
        {footer ? <Text style={styles.body}>{footer}</Text> : null}
        {sections?.map((section) => {
          const open = openTitles.includes(section.title);
          return (
            <View key={section.title} style={styles.section}>
              <Pressable
                onPress={() => toggle(section.title)}
                style={({ pressed }) => [
                  styles.sectionHeader,
                  pressed && styles.sectionHeaderPressed,
                ]}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
              </Pressable>
              {open ? (
                <View style={styles.sectionBody}>
                  {section.body ? (
                    <Text style={styles.body}>{section.body}</Text>
                  ) : null}
                  {section.items?.map((item, index) => (
                    <HowToPlayItemView key={itemKey(item, index)} item={item} />
                  ))}
                  {section.terms?.map((item) => (
                    <View key={item.term} style={styles.termBlock}>
                      <Text style={styles.term}>{item.term}</Text>
                      <Text style={styles.definition}>{item.definition}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      gap: 12,
      paddingBottom: 32,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.text,
    },
    section: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    sectionHeaderPressed: {
      opacity: 0.8,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    chevron: {
      fontSize: 14,
      color: theme.textMuted,
    },
    sectionBody: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 14,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 14,
    },
    termBlock: {
      gap: 4,
    },
    term: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.accent,
    },
    definition: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text,
    },
    headingBlock: {
      gap: 4,
      paddingTop: 12,
    },
    heading: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    noteBlock: {
      backgroundColor: theme.surfaceLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    note: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.textMuted,
    },
    hierarchy: {
      gap: 0,
    },
    hierarchyStep: {
      alignItems: 'center',
    },
    hierarchyCard: {
      alignSelf: 'stretch',
      alignItems: 'center',
      backgroundColor: theme.surfaceLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    hierarchyLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    hierarchyArrow: {
      alignItems: 'center',
      paddingVertical: 6,
      gap: 1,
    },
    hierarchyArrowMark: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.danger,
      lineHeight: 18,
    },
    hierarchyArrowText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.danger,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    hierarchyBonus: {
      alignSelf: 'stretch',
      fontSize: 12,
      fontWeight: '700',
      color: theme.warning,
      textAlign: 'center',
    },
    matchups: {
      gap: 10,
    },
    matchupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    matchupCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.surfaceLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 8,
      paddingVertical: 12,
    },
    matchupArrow: {
      width: 72,
      alignItems: 'center',
      gap: 1,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.surfaceLight,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tableHeaderCell: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      color: theme.textMuted,
      textTransform: 'uppercase',
    },
    tableHeaderCellRight: {
      textAlign: 'right',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    tableRowFirst: {
      borderTopWidth: 0,
    },
    tableCell: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    tableCellCenter: {
      textAlign: 'center',
    },
    tableCellRight: {
      textAlign: 'right',
      color: theme.accent,
    },
    tableCellText: {
      fontWeight: '600',
      lineHeight: 20,
    },
    tableCellGrow: {
      flex: 1.6,
    },
    tableRowAlt: {
      backgroundColor: theme.surface,
    },
  });
