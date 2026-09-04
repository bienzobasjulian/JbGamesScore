import type { TourDefinition, TourId } from './types';

export const TOURS: Record<TourId, TourDefinition> = {
  home: {
    id: 'home',
    steps: [
      {
        id: 'home.sessions',
        title: 'Nueva sesión',
        body: 'Crea aquí una sesión para agrupar las partidas de hoy.',
        anchorId: 'home.sessions',
      },
      {
        id: 'home.matches',
        title: 'Crear partida',
        body: 'Empieza un juego suelto desde este botón.',
        anchorId: 'home.matches',
      },
      {
        id: 'home.players',
        title: 'Ver todos',
        body: 'Desde ahí creas, editas y organizas jugadores y grupos.',
        anchorId: 'home.players',
      },
      {
        id: 'home.menu',
        title: 'Menú',
        body: 'Atajos a listas, plantillas y apariencia.',
        anchorId: 'home.menu',
      },
    ],
  },
  createMatch: {
    id: 'createMatch',
    steps: [
      {
        id: 'createMatch.game',
        title: 'Juego',
        body: 'Opcional. Solo si quieres un juego integrado. Si no, déjalo y configura la partida tú.',
        anchorId: 'createMatch.game',
      },
      {
        id: 'createMatch.templates',
        title: 'Plantillas',
        body: 'Carga una para reutilizar ajustes y/ jugadores. Las creas desde el menú.',
        anchorId: 'createMatch.templates',
      },
      {
        id: 'createMatch.settings',
        title: 'Configuración',
        body: 'Límite de rondas, de puntos, y si gana quien tiene más o menos.',
        anchorId: 'createMatch.settings',
      },
      {
        id: 'createMatch.players',
        title: 'Jugadores',
        body: 'Elige quién juega: los que ya tienes, unos nuevos o un grupo.',
        anchorId: 'createMatch.players',
      },
    ],
  },
  session: {
    id: 'session',
    steps: [
      {
        id: 'session.scored',
        title: 'Con puntuación',
        body: 'Igual que una partida normal: anotas puntos y cuenta para el ranking de la sesión.',
        anchorId: 'session.scored',
      },
      {
        id: 'session.winner',
        title: 'Con ganador',
        body: 'Para juegos sin puntos. Solo indicas quién ganó, para contar su victoria.',
        anchorId: 'session.winner',
      },
    ],
  },
  match: {
    id: 'match',
    steps: [
      {
        id: 'match.scores',
        title: 'Anotar puntos',
        body: 'Cada carta es un jugador. Suma o resta en la ronda actual. Si te es más fácil, desglosa y ve sumando poco a poco.',
        anchorId: 'match.scores',
      },
      {
        id: 'match.rounds',
        title: 'Rondas',
        body: 'El + cierra la ronda, suma los puntos y abre la siguiente. Puedes volver a una anterior para editarla.',
        anchorId: 'match.rounds',
      },
      {
        id: 'match.menu',
        title: 'Más acciones',
        body: 'El menú ⋮ sirve para ver la clasificación, editar la partida o finalizarla cuando hayáis terminado.',
        anchorId: 'match.menu',
      },
    ],
  },
  rounds: {
    id: 'rounds',
    steps: [
      {
        id: 'rounds.pagination',
        title: 'Rondas',
        body: 'El + (o ✓) confirma la ronda y sigue. Pulsa un número anterior para volver y editarla.',
        anchorId: 'rounds.pagination',
      },
      {
        id: 'rounds.menu',
        title: 'Menú de la partida',
        body: 'Con ⋮ puedes ver la clasificación actual o finalizar y guardar la partida.',
        anchorId: 'rounds.menu',
      },
    ],
  },
  pelusas: {
    id: 'pelusas',
    steps: [
      {
        id: 'pelusas.revolution',
        title: 'Modo Revolution',
        body: 'Actívalo si jugáis con la versión Pelusas Revolution para contar sus cartas (20 y −7).',
        anchorId: 'pelusas.revolution',
      },
      {
        id: 'pelusas.players',
        title: 'Cartas por jugador',
        body: 'Toca un jugador e indica cuántas cartas de cada valor tiene.',
        anchorId: 'pelusas.players',
      },
    ],
  },
  skullKing: {
    id: 'skullKing',
    steps: [
      {
        id: 'skullKing.players',
        title: 'Apuesta y bazas',
        body: 'Toca un jugador para anotar su apuesta, las bazas ganadas y las bonificaciones ganadas.',
        anchorId: 'skullKing.players',
      },
      {
        id: 'skullKing.rounds',
        title: 'Rondas',
        body: 'Cambia de ronda con los números. Si saltas una, cuenta como apuesta 0 y 0 bazas. Puedes volver a editarla. En la última, ✓ cierra la partida.',
        anchorId: 'skullKing.rounds',
      },
    ],
  },
  piliPili: {
    id: 'piliPili',
    steps: [
      {
        id: 'piliPili.cards',
        title: 'Cartas repartidas',
        body: 'Indica cuántas cartas tiene cada uno esta ronda. Sin misión, lo habitual son 5. Con misión, usa las que diga la carta.',
        anchorId: 'piliPili.cards',
      },
      {
        id: 'piliPili.missions',
        title: 'Misión especial',
        body: 'Si la ronda tiene misión, actívala aquí. La app solo incluye las que hacen ganar o perder Pilis.',
        anchorId: 'piliPili.missions',
      },
      {
        id: 'piliPili.players',
        title: 'Apuesta y bazas',
        body: 'Toca un jugador para anotar su apuesta y las bazas ganadas. Empieza el repartidor. El último no puede dejar la suma total de apuestas igual a las cartas repartidas.',
        anchorId: 'piliPili.players',
      },
      {
        id: 'piliPili.rounds',
        title: 'Rondas',
        body: 'El + confirma la ronda y abre la siguiente. Si alguien llega a 7 Pilis, pulsa + para finalizar. Puedes volver a una ronda anterior para editarla.',
        anchorId: 'piliPili.rounds',
      },
    ],
  },
  flip7: {
    id: 'flip7',
    steps: [
      {
        id: 'flip7.players',
        title: 'Cartas de la ronda',
        body: 'Toca un jugador y marca los números y modificadores que tiene. Siete números distintos suman el bonus Flip 7 (+15).',
        anchorId: 'flip7.players',
      },
      {
        id: 'flip7.rounds',
        title: 'Rondas',
        body: 'El + confirma la ronda y abre la siguiente. Si alguien llega a 200, puedes finalizar. Puedes volver a una anterior para editarla.',
        anchorId: 'flip7.rounds',
      },
    ],
  },
  aventurerosSubmode: {
    id: 'aventurerosSubmode',
    steps: [
      {
        id: 'aventurerosSubmode.picker',
        title: 'Submodo',
        body: 'Elige según la versión que tengáis. Cambia las longitudes de vía y alguna puntuación extra.',
        anchorId: 'aventurerosSubmode.picker',
      },
    ],
  },
  aventurerosConstruccion: {
    id: 'aventurerosConstruccion',
    steps: [
      {
        id: 'aventureros.routes',
        title: 'Construcción',
        body: 'En cada turno de construcción, toca al jugador y añade los recorridos que complete. Indica cuántos trenes tiene el tramo. Origen y destino son opcionales, por si quieres recordar qué caminos ya has contado.',
        anchorId: 'aventureros.players',
      },
      {
        id: 'aventureros.phase',
        title: 'Pasar a destinos',
        body: 'Cuando estén anotados todos los recorridos, pasa a la fase de destinos. Puedes volver a construcción si hace falta.',
        anchorId: 'aventureros.phase',
      },
    ],
  },
  aventurerosDestinos: {
    id: 'aventurerosDestinos',
    steps: [
      {
        id: 'aventureros.destinations',
        title: 'Destinos',
        body: 'Añade las cartas de destino desde la lista (búscalas por ciudad). Marca si cada una está completada: se suman o se restan los puntos.',
        anchorId: 'aventureros.players',
      },
      {
        id: 'aventureros.longest',
        title: 'Ruta más larga',
        body: 'Al final, localiza quién tiene más trenes unidos en una sola ruta y márcale la bonificación de ruta más larga.',
        anchorId: 'aventureros.players',
      },
    ],
  },
  regicideSelect: {
    id: 'regicideSelect',
    steps: [
      {
        id: 'regicide.bosses',
        title: 'Enemigo actual',
        body: 'Elige el que tengáis boca arriba en el Castillo. Primero las 4 jotas, luego las reinas y al final los reyes.',
        anchorId: 'regicide.bosses',
      },
    ],
  },
  regicideCombat: {
    id: 'regicideCombat',
    steps: [
      {
        id: 'regicide.top',
        title: 'Nivel y deshacer',
        body: 'Arriba ves los enemigos que quedan vivos en la partida. ↩ deshace el último ataque. ⇄ cambia de enemigo si os habíais equivocado.',
        anchorId: 'regicide.top',
      },
      {
        id: 'regicide.stats',
        title: 'Vida y ataque',
        body: 'La vida baja con cada ataque. Las picas bajan el ataque (se acumula hasta derrotarlo). El palo del enemigo bloquea su propio poder.',
        anchorId: 'regicide.stats',
      },
      {
        id: 'regicide.suits',
        title: 'Anotar cartas',
        body: 'Pulsa el palo de la carta que jugáis y elige el valor. Puedes juntar el mismo número (suma ≤10) o una carta + un as. El bufón quita la inmunidad hasta derrotar al enemigo actual.',
        anchorId: 'regicide.suits',
      },
    ],
  },
};

export const TOUR_LABELS: Record<TourId, string> = {
  home: 'Tutorial de inicio',
  createMatch: 'Tutorial al crear partida',
  session: 'Tutorial de sesión',
  match: 'Tutorial de partidas',
  rounds: 'Tutorial de rondas',
  pelusas: 'Tutorial de Pelusas',
  skullKing: 'Tutorial de Skull King',
  piliPili: 'Tutorial de Pili pili',
  flip7: 'Tutorial de Flip 7',
  aventurerosSubmode: 'Tutorial de submodo',
  aventurerosConstruccion: 'Tutorial de construcción',
  aventurerosDestinos: 'Tutorial de destinos',
  regicideSelect: 'Tutorial de enemigo',
  regicideCombat: 'Tutorial de combate',
};
