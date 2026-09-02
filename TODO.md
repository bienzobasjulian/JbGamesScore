# TODO — Jb Games Score

> Última actualización: 2026-09-02 (análisis SYNC-01, THEME-01)

## Cómo usar este fichero

1. Añade ideas nuevas en **Pendiente de analizar**.
2. Cuando digas *«analiza el TODO»*, se estimará la **complejidad** (S / M / L / XL), se desglosarán tareas si hace falta y se **ordenarán por prioridad**.
3. Cuando digas *«desarrolla la tarea X»* (o similar), se implementará la tarea correspondiente.

## Convenciones por tarea

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador corto y estable (ej. `F7-01`, `SYNC-02`) |
| **Título** | Qué hay que hacer, en una frase |
| **Notas** | Contexto, archivos relacionados, dependencias |
| **Complejidad** | Vacío hasta analizar → `S` · `M` | `L` · `XL` |
| **Prioridad** | Vacío hasta analizar → número de orden (1 = primero) |

---

## Pendiente de analizar

Ideas o necesidades que aún no están desglosadas ni priorizadas.

### [SYNC-02] Partida en tiempo real por Wi‑Fi local (host + clientes)

- **Notas:** Un móvil actúa como host (fuente de verdad); los demás se conectan por IP/QR en la misma red. Requiere nueva APK con módulos nativos (WebSocket, permisos de red local). Android ↔ Android como primer objetivo.
- **Complejidad:** —
- **Prioridad:** —

### [SYNC-03] Varios móviles anotando a la vez

- **Notas:** Extensión de SYNC-02: cada cliente envía operaciones pequeñas (`toggleFlip7RoundNumber`, `adjustRoundScore`, etc.) en lugar de sincronizar todo el `Match`. Definir reglas de conflicto (p. ej. un jugador = un dispositivo).
- **Complejidad:** —
- **Prioridad:** —

### [UX-01] Plantillas para juegos dedicados

- **Notas:** Hoy las plantillas parecen orientadas a partidas estándar. Valorar si Flip 7, Pelusas, Skull King, etc. pueden guardarse/reutilizarse como plantilla (jugadores + tipo de juego).
- **Complejidad:** —
- **Prioridad:** —

### [UX-02] Editar partida en curso (juegos dedicados)

- **Notas:** `editMatch` solo permite partidas `standard`. Evaluar si conviene cambiar jugadores o ajustes en Pelusas, Flip 7, Pili Pili, etc.
- **Complejidad:** —
- **Prioridad:** —

### [UX-03] Exportar o compartir resultados de partida/sesión

- **Notas:** Texto, imagen o captura de clasificación final para WhatsApp, etc.
- **Complejidad:** —
- **Prioridad:** —

### [PLAT-01] Soporte iOS y publicación en App Store

- **Notas:** El flujo actual está muy orientado a APK Android (`build:apk`). Valorar build iOS, permisos y diferencias de UX.
- **Complejidad:** —
- **Prioridad:** —

### [QA-01] Tests automatizados de lógica de puntuación

- **Notas:** Funciones puras en `src/utils/` (`flip7.ts`, `piliPili.ts`, `skullKing.ts`, etc.) son buenos candidatos para tests unitarios.
- **Complejidad:** —
- **Prioridad:** —

---

## Pendiente

Tareas ya entendidas; listas para desarrollar cuando se indique.

### [SYNC-01] Compartir partida por QR o enlace

- **Notas:** Importar/exportar el estado de una partida comprimido. Útil para que otro móvil vea la clasificación o recupere la partida si el host se queda sin batería. Sin servidor propio; primer paso hacia partidas compartidas.
- **Complejidad:** **M**
- **Prioridad:** **1**
- **Desglose estimado:**
  - Serializar `Match` (incl. sesiones dedicadas: Flip7, Pelusas, etc.) + versión del payload → **S**
  - Exportar/importar por portapapeles (base64 comprimido) → **S**
  - Validación al importar, nuevo `id`, navegar a la partida → **M**
  - UI «Compartir» / «Importar» (p. ej. en menú de partida) → **S**
  - Generar QR con el payload → **M**
  - Escanear QR (`expo-camera`, permisos) → **M** · requiere nueva APK
  - Modo solo lectura en el otro móvil (sin editar) → **L** · fuera del MVP; importar copia editable es suficiente al inicio
- **Riesgos:** partidas largas pueden superar el tamaño útil de un QR → ofrecer siempre portapapeles como alternativa.
- **Dependencias:** ninguna crítica para MVP por clipboard; QR de lectura implica build nativo.

### [THEME-01] Modo claro, oscuro o según el sistema

- **Notas:** Hoy hay un único `theme` oscuro en `src/constants.ts`, importado en ~85 ficheros. Añadir preferencia `light` | `dark` | `system`, persistirla y adaptar la UI.
- **Complejidad:** **L**
- **Prioridad:** **2**
- **Desglose estimado:**
  - Paleta clara + `ThemeContext` / `useTheme()` → **M**
  - Migrar componentes y pantallas del `theme` estático al hook → **L** (muchas pantallas, riesgo de regresiones)
  - `useColorScheme` + opción «Seguir sistema» + AsyncStorage → **S**
  - Ajustar `StatusBar` y colores hardcoded fuera de `theme` → **M**
- **Alcance excluido:** cartas/recursos de juego con colores propios (Flip 7, Pelusas…) pueden mantener su diseño; solo cambia el «marco» de la app.
- **Dependencias:** ninguna nativa.

### [F7-02] Integrar y commitear Flip 7

- **Notas:** Implementación presente pero sin commit (`Flip7CounterScreen`, `flip7.ts`, cartas visuales, hook `useApp`, etc.). Revisar, probar en dispositivo y dejar estable en `main`.
- **Complejidad:** —
- **Prioridad:** —

### [F7-03] Limpiar código Flip 7 obsoleto o sin usar

- **Notas:** Componentes que no se importan en ningún sitio: `Flip7CelebrationModal`, `Flip7ActivePlayerPanel`, `Flip7PlayerStrip`, `Flip7PickPlayerModal`. Decidir si integrarlos (p. ej. modal al lograr Flip 7) o eliminarlos.
- **Complejidad:** —
- **Prioridad:** —

### [F7-04] Probar Flip 7 en partida real

- **Notas:** Validar reglas: mazo (copias por número), bonus Flip 7 (+15), modificadores, bust, objetivo 200 pts, empates, persistencia al salir/volver.
- **Complejidad:** —
- **Prioridad:** —

### [DOC-01] Actualizar README con juegos dedicados

- **Notas:** El README describe solo el flujo de partida estándar. Documentar Pelusas, Skull King, Pili Pili, Flip 7, Aventureros al Tren y Regicide.
- **Complejidad:** —
- **Prioridad:** —

---

## En proceso

Trabajo activo ahora mismo.

### [F7-01] Contador Flip 7

- **Notas:** Pantalla dedicada, rondas ilimitadas, cartas 0–12, modificadores, validación de mazo, objetivo 200 puntos, integración en crear partida y sesiones. Pendiente: cerrar (ver F7-02, F7-04).
- **Complejidad:** —
- **Prioridad:** —

---

## Hecha

Tareas completadas (mantener como histórico breve).

### [CORE-01] Partida estándar con rondas y clasificación

- **Notas:** Flujo base: jugadores, puntuación por ronda, historial, game over, persistencia local.

### [GAME-01] Pelusas — contador de cartas

- **Notas:** Modo Revolution, conteo 1–10, pantalla dedicada.

### [GAME-02] Skull King — bazas y apuestas

- **Notas:** 10 rondas, bonificaciones, pantalla dedicada.

### [GAME-03] Pili Pili — apuestas y penalizaciones

- **Notas:** 2–8 jugadores, misiones de ronda, pantalla dedicada.

### [GAME-04] Aventureros al tren — Base y Europa

- **Notas:** Rutas, destinos, fases, submodos.

### [GAME-05] Regicide — asistente cooperativo

- **Notas:** Vida y ataque de J/Q/K, orientación horizontal.

### [CORE-02] Sesiones de juego

- **Notas:** Agrupar partidas, ranking de sesión, partidas «solo ganador».

### [CORE-03] Jugadores, grupos y plantillas

- **Notas:** Lista de jugadores, grupos, plantillas de partida estándar, selección reutilizable.

### [CORE-04] Build APK Android

- **Notas:** Perfil EAS `preview`, script `npm run build:apk`.
