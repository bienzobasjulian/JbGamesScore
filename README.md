# Jb Games Score

Aplicación móvil con **React Native** y **Expo** para llevar el conteo de puntos en partidas de juegos de mesa.

## Funcionalidades

- Añadir y quitar jugadores antes de empezar
- Sumar o restar puntos ronda por ronda
- Finalizar cada ronda y pasar a la siguiente
- Ver clasificación en tiempo real y historial de rondas
- Deshacer la última ronda
- Guardado automático de la partida en el dispositivo

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- [Expo Go](https://expo.dev/go) en tu móvil (para probar sin compilar)

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Escanea el código QR con **Expo Go** (Android) o la cámara (iOS).

También puedes usar:

```bash
npm run android   # Emulador o dispositivo Android
npm run web       # Navegador (vista previa)
```

## Estructura del proyecto

```
src/
  components/   # UI reutilizable
  screens/      # Pantallas de configuración y partida
  hooks/        # Lógica de estado del juego
  utils/        # Cálculos de puntuación
  types.ts      # Tipos TypeScript
  constants.ts  # Tema y colores
  storage.ts    # Persistencia con AsyncStorage
```

## Cómo usar la app

1. Añade al menos **2 jugadores** con sus nombres.
2. Pulsa **Comenzar partida**.
3. En cada ronda, usa **+** y **−** para registrar los puntos de cada jugador.
4. Pulsa **Finalizar ronda** cuando todos hayan anotado sus puntos.
5. Repite hasta terminar la partida. La clasificación se actualiza automáticamente.
