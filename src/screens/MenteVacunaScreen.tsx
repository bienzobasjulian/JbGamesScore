import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type { MenteVacunaCategory, MenteVacunaQuestion } from '../types';
import {
  categoriesWithQuestions,
  drawMenteVacunaQuestion,
  menteVacunaCategories,
  menteVacunaCategory,
  archivedMenteVacunaQuestions,
  menteVacunaPool,
} from '../utils/menteVacuna';

type ViewMode =
  | { type: 'menu' }
  | { type: 'createQuestion' }
  | { type: 'createCategory' }
  | { type: 'archived' }
  | { type: 'play'; selection: string | 'all' };

type Props = {
  categories: MenteVacunaCategory[];
  customQuestions: MenteVacunaQuestion[];
  archivedIds: string[];
  onBack: () => void;
  onAddCategory: (name: string, icon: string) => void;
  onRemoveCategory: (id: string) => void;
  onAddQuestion: (text: string, categoryId: string) => void;
  onUpdateQuestion: (id: string, text: string, categoryId: string) => void;
  onRemoveQuestion: (id: string) => void;
  onArchiveQuestion: (id: string) => void;
  onUnarchiveQuestion: (id: string) => void;
};

export function MenteVacunaScreen({
  categories,
  customQuestions,
  archivedIds,
  onBack,
  onAddCategory,
  onRemoveCategory,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onArchiveQuestion,
  onUnarchiveQuestion,
}: Props) {
  const [view, setView] = useState<ViewMode>({ type: 'menu' });

  if (view.type === 'play') {
    return (
      <PlayView
        selection={view.selection}
        categories={categories}
        customQuestions={customQuestions}
        archivedIds={archivedIds}
        onArchive={onArchiveQuestion}
        onBack={() => setView({ type: 'menu' })}
      />
    );
  }

  if (view.type === 'createQuestion') {
    return (
      <CreateQuestionView
        categories={categories}
        customQuestions={customQuestions}
        onBack={() => setView({ type: 'menu' })}
        onAddQuestion={onAddQuestion}
        onUpdateQuestion={onUpdateQuestion}
        onRemoveQuestion={onRemoveQuestion}
      />
    );
  }

  if (view.type === 'archived') {
    return (
      <ArchivedView
        categories={categories}
        customQuestions={customQuestions}
        archivedIds={archivedIds}
        onBack={() => setView({ type: 'menu' })}
        onUnarchive={onUnarchiveQuestion}
      />
    );
  }

  if (view.type === 'createCategory') {
    return (
      <CreateCategoryView
        categories={categories}
        onBack={() => setView({ type: 'menu' })}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
      />
    );
  }

  return (
    <MenuView
      categories={categories}
      customQuestions={customQuestions}
      archivedIds={archivedIds}
      onBack={onBack}
      onPlay={(selection) => setView({ type: 'play', selection })}
      onCreateQuestion={() => setView({ type: 'createQuestion' })}
      onCreateCategory={() => setView({ type: 'createCategory' })}
      onArchived={() => setView({ type: 'archived' })}
    />
  );
}

function MenuView({
  categories,
  customQuestions,
  archivedIds,
  onBack,
  onPlay,
  onCreateQuestion,
  onCreateCategory,
  onArchived,
}: {
  categories: MenteVacunaCategory[];
  customQuestions: MenteVacunaQuestion[];
  archivedIds: string[];
  onBack: () => void;
  onPlay: (selection: string | 'all') => void;
  onCreateQuestion: () => void;
  onCreateCategory: () => void;
  onArchived: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const playable = categoriesWithQuestions(
    categories,
    customQuestions,
    archivedIds,
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Mente Vacuna" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>
          Responded lo mismo. No hay respuesta correcta: gana quien piensa
          como la mayoría.
        </Text>
        <View style={styles.actions}>
          <ActionRow label="Crear pregunta" onPress={onCreateQuestion} />
          <ActionRow label="Crear categoría" onPress={onCreateCategory} />
          {archivedIds.length > 0 ? (
            <ActionRow
              label="Archivadas"
              hint={`${archivedIds.length}`}
              onPress={onArchived}
            />
          ) : null}
        </View>
        {playable.length > 0 ? (
          <Text style={styles.sectionLabel}>Categorías</Text>
        ) : null}
        <View style={styles.list}>
          {playable.length > 0 ? (
            <CategoryCard
              name="Todas"
              hint="Todas las que tienen preguntas"
              onPress={() => onPlay('all')}
            />
          ) : null}
          {playable.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              onPress={() => onPlay(category.id)}
            />
          ))}
        </View>
        {playable.length === 0 ? (
          <Text style={styles.lead}>
            Aún no hay categorías con preguntas. Crea una pregunta para que
            aparezca su categoría.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ActionRow({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionHint}>{hint ?? '›'}</Text>
    </Pressable>
  );
}

function CategoryCard({
  name,
  hint,
  onPress,
}: {
  name: string;
  hint?: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.cardName}>{name}</Text>
      {hint ? <Text style={styles.cardHint}>{hint}</Text> : null}
    </Pressable>
  );
}

function PlayView({
  selection,
  categories,
  customQuestions,
  archivedIds,
  onArchive,
  onBack,
}: {
  selection: string | 'all';
  categories: MenteVacunaCategory[];
  customQuestions: MenteVacunaQuestion[];
  archivedIds: string[];
  onArchive: (id: string) => void;
  onBack: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const pool = menteVacunaPool(customQuestions, selection, archivedIds);
  const [draw, setDraw] = useState(() => drawMenteVacunaQuestion(pool, []));
  const category =
    draw.question != null
      ? menteVacunaCategory(draw.question.categoryId, categories)
      : null;
  const title =
    selection === 'all'
      ? 'Todas'
      : menteVacunaCategory(selection, categories).name;

  const next = () => {
    const currentPool = menteVacunaPool(customQuestions, selection, archivedIds);
    setDraw((prev) => drawMenteVacunaQuestion(currentPool, prev.seenIds));
  };

  const dislike = () => {
    if (!draw.question) return;
    const id = draw.question.id;
    onArchive(id);
    const currentPool = menteVacunaPool(customQuestions, selection, [
      ...archivedIds,
      id,
    ]);
    setDraw((prev) => drawMenteVacunaQuestion(currentPool, prev.seenIds));
  };

  return (
    <View style={styles.container}>
      <AppHeader title={title} subtitle="Mente Vacuna" onBack={onBack} />
      <View style={styles.play}>
        {draw.question && category ? (
          <>
            <Text style={styles.playCategory}>
              {category.name}
              {draw.question.source === 'custom' ? ' · Tuya' : ''}
            </Text>
            <View style={styles.questionCard}>
              <Text style={styles.question}>{draw.question.text}</Text>
            </View>
          </>
        ) : (
          <View style={styles.questionCard}>
            <Text style={styles.emptyTitle}>No hay preguntas aquí</Text>
          </View>
        )}
        <Pressable
          onPress={next}
          disabled={!draw.question}
          style={[styles.primaryBtn, !draw.question && styles.primaryOff]}
        >
          <Text style={styles.primaryText}>Siguiente pregunta</Text>
        </Pressable>
        {draw.question ? (
          <Pressable onPress={dislike} style={styles.dislikeBtn}>
            <Text style={styles.dislikeText}>No me gusta</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function CreateQuestionView({
  categories,
  customQuestions,
  onBack,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
}: {
  categories: MenteVacunaCategory[];
  customQuestions: MenteVacunaQuestion[];
  onBack: () => void;
  onAddQuestion: (text: string, categoryId: string) => void;
  onUpdateQuestion: (id: string, text: string, categoryId: string) => void;
  onRemoveQuestion: (id: string) => void;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const choices = menteVacunaCategories(categories);
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState(choices[0]?.id ?? 'general');
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (editingId) onUpdateQuestion(editingId, trimmed, categoryId);
    else onAddQuestion(trimmed, categoryId);
    setText('');
    setEditingId(null);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={editingId ? 'Editar pregunta' : 'Crear pregunta'}
        onBack={onBack}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.input}
          placeholder="Escribe la pregunta"
          placeholderTextColor={theme.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={180}
        />
        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.chips}>
          {choices.map((category) => {
            const selected = category.id === categoryId;
            return (
              <Pressable
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={styles.chipText}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={save} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>
            {editingId ? 'Guardar cambios' : 'Guardar pregunta'}
          </Text>
        </Pressable>
        {customQuestions.length > 0 ? (
          <View style={styles.list}>
            <Text style={styles.fieldLabel}>Tus preguntas</Text>
            {customQuestions.map((question) => {
              const category = menteVacunaCategory(question.categoryId, categories);
              return (
                <View key={question.id} style={styles.row}>
                  <Pressable
                    style={styles.rowMain}
                    onPress={() => {
                      setEditingId(question.id);
                      setText(question.text);
                      setCategoryId(question.categoryId);
                    }}
                  >
                    <Text style={styles.rowText}>{question.text}</Text>
                    <Text style={styles.cardHint}>
                      {category.name}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => onRemoveQuestion(question.id)} hitSlop={8}>
                    <Text style={styles.remove}>Eliminar</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ArchivedView({
  categories,
  customQuestions,
  archivedIds,
  onBack,
  onUnarchive,
}: {
  categories: MenteVacunaCategory[];
  customQuestions: MenteVacunaQuestion[];
  archivedIds: string[];
  onBack: () => void;
  onUnarchive: (id: string) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const archived = archivedMenteVacunaQuestions(customQuestions, archivedIds);

  return (
    <View style={styles.container}>
      <AppHeader title="Archivadas" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>
          Estas preguntas no salen al jugar. Puedes devolverlas cuando quieras.
        </Text>
        {archived.map((question) => {
          const category = menteVacunaCategory(question.categoryId, categories);
          return (
            <View key={question.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowText}>{question.text}</Text>
                <Text style={styles.cardHint}>
                  {category.name}
                </Text>
              </View>
              <Pressable onPress={() => onUnarchive(question.id)} hitSlop={8}>
                <Text style={styles.restore}>Recuperar</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function CreateCategoryView({
  categories,
  onBack,
  onAddCategory,
  onRemoveCategory,
}: {
  categories: MenteVacunaCategory[];
  onBack: () => void;
  onAddCategory: (name: string, icon: string) => void;
  onRemoveCategory: (id: string) => void;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddCategory(trimmed, '');
    setName('');
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Crear categoría" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.singleInput}
          placeholder="Nombre"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={32}
        />
        <Pressable onPress={save} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Guardar categoría</Text>
        </Pressable>
        <Text style={styles.lead}>
          Aparece en el menú cuando tenga al menos una pregunta. Al borrarla
          se eliminan también sus preguntas.
        </Text>
        {categories.map((category) => (
          <View key={category.id} style={styles.row}>
            <Text style={styles.rowText}>
              {category.name}
            </Text>
            <Pressable onPress={() => onRemoveCategory(category.id)} hitSlop={8}>
              <Text style={styles.remove}>Eliminar</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    content: { padding: 16, gap: 16, paddingBottom: 40 },
    lead: { color: theme.textMuted, lineHeight: 20 },
    sectionLabel: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    actions: { gap: 8 },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    actionLabel: { color: theme.text, fontWeight: '700', fontSize: 16 },
    actionHint: { color: theme.textMuted, fontSize: 16 },
    list: { gap: 8 },
    card: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 18,
      gap: 4,
    },
    cardName: { color: theme.text, fontWeight: '800', fontSize: 16 },
    cardHint: { color: theme.textMuted, fontSize: 12 },
    play: { flex: 1, padding: 20, gap: 16, justifyContent: 'center' },
    playCategory: {
      color: theme.accent,
      fontWeight: '700',
      textAlign: 'center',
    },
    questionCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 28,
      minHeight: 180,
      justifyContent: 'center',
      gap: 8,
    },
    question: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 34,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    primaryBtn: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryOff: { opacity: 0.4 },
    primaryText: { color: theme.onAccent, fontWeight: '800', fontSize: 16 },
    dislikeBtn: { alignItems: 'center', paddingVertical: 8 },
    dislikeText: { color: theme.textMuted, fontWeight: '700' },
    restore: { color: theme.accent, fontWeight: '700' },
    input: {
      minHeight: 96,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 12,
      color: theme.text,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    singleInput: {
      height: 48,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      color: theme.text,
      fontSize: 16,
    },
    fieldLabel: { color: theme.text, fontWeight: '700' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.surface,
    },
    chipOn: { borderColor: theme.accent, backgroundColor: theme.surfaceLight },
    chipText: { color: theme.text, fontWeight: '600' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },
    rowMain: { flex: 1, gap: 4 },
    rowText: { flex: 1, color: theme.text },
    remove: { color: theme.danger, fontWeight: '700' },
  });
