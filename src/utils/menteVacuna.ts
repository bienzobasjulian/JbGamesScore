import type {
  MenteVacunaCategory,
  MenteVacunaQuestion,
} from '../types';

export const MENTE_VACUNA_OFFICIAL_CATEGORIES: MenteVacunaCategory[] = [
  { id: 'general', name: 'General', icon: '\u{1F30D}', minAge: 0, source: 'official' },
  { id: 'comida', name: 'Comida', icon: '\u{1F355}', minAge: 0, source: 'official' },
  { id: 'cine', name: 'Cine y series', icon: '\u{1F3AC}', minAge: 0, source: 'official' },
  { id: 'divertidas', name: 'Divertidas', icon: '\u{1F602}', minAge: 0, source: 'official' },
  { id: 'grupo', name: 'El grupo', icon: '\u{1F465}', minAge: 0, source: 'official' },
  { id: 'amor', name: 'Amor y parejas', icon: '\u2764\uFE0F', minAge: 0, source: 'official' },
  { id: 'picante', name: 'Picante', icon: '\u{1F336}\uFE0F', minAge: 18, source: 'official' },
  { id: 'adultos', name: 'Adultos', icon: '\u{1F37B}', minAge: 18, source: 'official' },
  {
    id: 'personalidad',
    name: 'Personalidad y hábitos',
    icon: '\u{1F9E0}',
    minAge: 0,
    source: 'official',
  },
  { id: 'viajes', name: 'Viajes', icon: '\u2708\uFE0F', minAge: 0, source: 'official' },
  { id: 'deportes', name: 'Deportes', icon: '\u{1F3C6}', minAge: 0, source: 'official' },
  { id: 'gaming', name: 'Gaming', icon: '\u{1F3AE}', minAge: 0, source: 'official' },
  { id: 'prefieres', name: 'Qué prefieres', icon: '\u2696\uFE0F', minAge: 0, source: 'official' },
];

const OFFICIAL_PROMPTS: Record<string, string[]> = {
  general: [
    'El país más bonito del mundo',
    'La mejor estación del año',
    'La peor estación del año',
    'El superpoder más deseado',
    'El superpoder más inútil',
    'El peor día de la semana',
    'El mejor día de la semana',
    'El mejor mes del año',
    'El idioma más bonito',
    'Un miedo',
    'El color del cuaderno de… (di una asignatura)',
    'Una asignatura',
    'Una profesión',
    'Una marca de ropa',
    'Una aplicación del móvil',
    'Si tu pelo pudiera ser de cualquier color, ¿de qué color sería?',
    'Un politico',
    'Un partido político',
  ],
  comida: [
    'La mejor comida del mundo',
    'El sabor de helado favorito',
    'La mejor comida rápida',
    'Una comida infravalorada',
    'Una comida sobrevalorada',
    'El ingrediente imprescindible en una pizza',
    'El ingrediente que sobra en una pizza',
    'El ingrediente imprescindible en una hamburguesa',
    'El ingrediente que sobra en una hamburguesa',
    'La fruta más rica',
    '¿Qué va antes, los cereales o la leche?',
    'La bebida más popular',
    'El mejor plato español',
    '¿Tortilla con o sin cebolla?',
    'El mejor postre',
    '¿Cuál es tu comida favorita del día?',
    'Un tipo de leche',
    'Un tipo de café',
  ],
  cine: [
    'La mejor película de la historia',
    'Un superhéroe',
    'Un superhéroe de Marvel',
    'Un superhéroe de DC',
    'Un villano',
    'Un villano de Marvel',
    'Un villano de DC',
    'Un villano de Disney',
    'Una princesa',
    'Un personaje de Disney',
    'Un personaje animado',
    'El actor más famoso',
    'La mejor película de miedo',
    'Un personaje de terror',
    'Una saga de películas',
    'Una serie que todo el mundo ha visto',
    'Nombra una Jennifer famosa',
    'Nombra un Chris famoso',
    'Menciona uno de los siete enanitos',
    'Pelicula de disney',
    'Una casa de Howarts',
    'Un personaje de [Inserte serie/pelicula]'
  ],
  grupo: [
    '¿Quién del grupo es más probable que acabe en la cárcel?',
    '¿Quién llegaría tarde incluso a su propia boda?',
    '¿Quién sobreviviría peor a una isla desierta?',
    '¿Quién sería el primero en hacerse famoso?',
    '¿Quién tiene más posibilidades de hacerse millonario?',
    '¿Quién sería el peor presidente del Gobierno?',
    '¿Quién se perdería incluso usando Google Maps?',
    '¿Quién tiene más posibilidades de hacerse viral por accidente?',
    '¿Quién se gastaría todo su dinero en un día?',
    '¿Quién sería el primero en quedarse dormido de fiesta?',
    '¿Quién tiene más posibilidades de revisar el perfil de su ex?',
    '¿Quién es más probable que llegue tarde?',
    '¿Quién habla más?',
    '¿Quién da los mejores consejos y luego no los aplica?',
    '¿Quién tiene más posibilidades de cancelar un plan a última hora?',
    '¿Quién sería incapaz de pasar un día sin el móvil?',
    '¿Quién se cree siempre que tiene razón?',
    '¿Quién tendría más posibilidades de ligar con alguien en una discoteca?',
    '¿Quién se casará primero?',
    '¿Quién tendrá hijos primero?',
    '¿Quién tendría más posibilidades de enamorarse de alguien del grupo?',
    '¿Quién sobreviviría mejor a un apocalipsis zombi?',
    '¿Quién sería el primero en traicionar al grupo por dinero?',
    '¿Quién tendría más posibilidades de acabar en un reality show?',
    '¿Quién sería capaz de abandonar al grupo en una situación peligrosa?',
    '¿Quién tiene más posibilidades de ligar con dos personas la misma noche?',
    '¿Qué tema provocaría una discusión en el grupo?',
    '¿Quién es más competitivo?',
    '¿Quién sería el primero en morir en un apocalipsis zombi?',
    '¿Quién del grupo tiene el lore más loco?',
    '¿Quién es el más NPC del grupo?',
    '¿Quién es el más guapo del grupo?'
  ],
  divertidas: [
    'El peor animal como mascota',
    'La mayor vergüenza en público',
    'El peor regalo de cumpleaños',
    'La mayor manía de la gente',
    'El peor sitio para quedarse dormido',
    'El peor compañero de piso',
    'La mayor tontería por la que discutir',
  ],
  amor: [
    'La edad ideal para casarse',
    'El número ideal de hijos',
    'Una aplicación para ligar',
  ],
  picante: [
    'El lugar más atrevido para hacerlo',
    'El lugar más extraño para hacerlo',
    'La parte del cuerpo más sexy',
    'El mejor momento del día para el sexo',
    'La prenda más sexy',
    'Una postura sexual',
    'Un juguete sexual',
  ],
  adultos: ['La mejor bebida de fiesta', 'El mejor chupito de fiesta'],
  viajes: [
    'El mejor destino de vacaciones',
    'El país con mejor gastronomía',
    'El objeto imprescindible en una maleta',
    'El mejor destino para una luna de miel',
    'El mejor medio de transporte',
  ],
  deportes: [
    'El mejor deporte del mundo',
    'El deportista más famoso',
    'El equipo de fútbol más popular',
    'El deporte más aburrido',
    'El mejor futbolista de la historia',
    'El deporte más difícil',
  ],
  gaming: [
    'El mejor videojuego de la historia',
    'El mejor videojuego de Nintendo',
    'Un villano de los videojuegos',
    'Un villano de Nintendo',
    'Un personaje de videojuegos',
    'Un personaje de Nintendo',
    'Una consola',
    'Un videojuego difícil',
  ],
  prefieres: [
    '100.000 € ahora o 1 millón dentro de 10 años',
    'Viajar al pasado o al futuro',
    'Vivir sin música o sin películas',
    'No volver a usar redes sociales o no volver a ver series',
    'Frío o calor',
    'Saber cuándo vas a morir o cómo vas a morir',
    'Morir ahogado o morir quemado',
    'Playa o montaña',
    'No poder mentir nunca o que todo el mundo sepa cuándo mientes',
    'Perder todos tus recuerdos o no poder crear recuerdos nuevos',
    'Ser el más inteligente o el más atractivo',
    'Café o té',
    'Cola cao o Nesquick',
    'Coca cola o Pepsi',
    'Fanta o Kas'
  ],
};

export const MENTE_VACUNA_OFFICIAL_QUESTIONS: MenteVacunaQuestion[] =
  MENTE_VACUNA_OFFICIAL_CATEGORIES.flatMap((category) =>
    (OFFICIAL_PROMPTS[category.id] ?? []).map((text, index) => ({
      id: `mv-${category.id}-${index + 1}`,
      text,
      categoryId: category.id,
      source: 'official' as const,
      creatorId: null,
      createdAt: 0,
      active: true,
      minAge: category.minAge,
    })),
  );

const OFFICIAL_IDS = new Set(
  MENTE_VACUNA_OFFICIAL_CATEGORIES.map((category) => category.id),
);

export function menteVacunaCategories(
  custom: MenteVacunaCategory[],
): MenteVacunaCategory[] {
  const extra = custom.filter((category) => !OFFICIAL_IDS.has(category.id));
  return [...MENTE_VACUNA_OFFICIAL_CATEGORIES, ...extra];
}

export function menteVacunaCategory(
  id: string,
  custom: MenteVacunaCategory[] = [],
): MenteVacunaCategory {
  return (
    menteVacunaCategories(custom).find((category) => category.id === id) ?? {
      id,
      name: 'General',
      icon: '\u{1F30D}',
      minAge: 0,
      source: 'official',
    }
  );
}

export function normalizeMenteVacunaCategory(
  raw: unknown,
): MenteVacunaCategory | null {
  if (raw == null || typeof raw !== 'object') return null;
  const category = raw as Partial<MenteVacunaCategory>;
  if (typeof category.id !== 'string' || typeof category.name !== 'string') {
    return null;
  }
  const name = category.name.trim();
  if (!name || OFFICIAL_IDS.has(category.id)) return null;
  const icon =
    typeof category.icon === 'string' && category.icon.trim()
      ? category.icon.trim()
      : '\u{1F4CC}';
  return {
    id: category.id,
    name,
    icon,
    minAge: typeof category.minAge === 'number' ? category.minAge : 0,
    source: 'custom',
  };
}

export function normalizeMenteVacunaQuestion(
  raw: unknown,
  categories: MenteVacunaCategory[],
): MenteVacunaQuestion | null {
  if (raw == null || typeof raw !== 'object') return null;
  const question = raw as Partial<MenteVacunaQuestion>;
  if (typeof question.id !== 'string' || typeof question.text !== 'string') {
    return null;
  }
  const text = question.text.trim();
  if (!text) return null;
  const known = categories.some((category) => category.id === question.categoryId);
  const categoryId = known ? (question.categoryId as string) : 'general';
  const category = menteVacunaCategory(categoryId, categories);
  return {
    id: question.id,
    text,
    categoryId,
    source: question.source === 'official' ? 'official' : 'custom',
    creatorId: typeof question.creatorId === 'string' ? question.creatorId : null,
    createdAt: typeof question.createdAt === 'number' ? question.createdAt : Date.now(),
    active: question.active !== false,
    minAge:
      typeof question.minAge === 'number' ? question.minAge : category.minAge,
  };
}

export function menteVacunaQuestions(
  custom: MenteVacunaQuestion[],
): MenteVacunaQuestion[] {
  return [...MENTE_VACUNA_OFFICIAL_QUESTIONS, ...custom].filter(
    (question) => question.active,
  );
}

export function categoriesWithQuestions(
  customCategories: MenteVacunaCategory[],
  customQuestions: MenteVacunaQuestion[],
  archivedIds: readonly string[] = [],
): MenteVacunaCategory[] {
  const hidden = new Set(archivedIds);
  const questions = menteVacunaQuestions(customQuestions).filter(
    (question) => !hidden.has(question.id),
  );
  return menteVacunaCategories(customCategories).filter((category) =>
    questions.some((question) => question.categoryId === category.id),
  );
}

export function menteVacunaPool(
  customQuestions: MenteVacunaQuestion[],
  selection: string | 'all',
  archivedIds: readonly string[] = [],
): MenteVacunaQuestion[] {
  const hidden = new Set(archivedIds);
  return menteVacunaQuestions(customQuestions).filter(
    (question) =>
      !hidden.has(question.id) &&
      (selection === 'all' || question.categoryId === selection),
  );
}

export function archivedMenteVacunaQuestions(
  customQuestions: MenteVacunaQuestion[],
  archivedIds: readonly string[],
): MenteVacunaQuestion[] {
  const byId = new Map(
    menteVacunaQuestions(customQuestions).map((question) => [question.id, question]),
  );
  return archivedIds
    .map((id) => byId.get(id))
    .filter((question): question is MenteVacunaQuestion => question != null);
}

export function drawMenteVacunaQuestion(
  pool: MenteVacunaQuestion[],
  seenIds: readonly string[],
): { question: MenteVacunaQuestion | null; seenIds: string[] } {
  if (pool.length === 0) return { question: null, seenIds: [] };
  const unseen = pool.filter((question) => !seenIds.includes(question.id));
  const source = unseen.length > 0 ? unseen : pool;
  const nextSeen = unseen.length > 0 ? [...seenIds] : [];
  const index = Math.floor(Math.random() * source.length);
  const question = source[index] ?? null;
  if (!question) return { question: null, seenIds: nextSeen };
  return { question, seenIds: [...nextSeen, question.id] };
}
