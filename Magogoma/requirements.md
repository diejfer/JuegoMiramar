# Mago-Goma - Requirements

## Estado
- [x] Idea definida
- [x] Reglas acordadas
- [x] MVP implementado
- [ ] Iteración

## Idea
Juego multijugador en tiempo real donde cada ronda los jugadores escriben una palabra y gana el primero en enviar una palabra válida. Las palabras se clasifican como **MAGO** (sílabas impares) o **GOMA** (sílabas pares).

## Reglas
- 2 a 6 jugadores.
- 10 rondas por partida.
- 15 segundos por ronda.
- Cada jugador puede enviar solo una palabra por ronda.
- La primera palabra válida gana 1 punto.
- Si nadie envía palabra válida, nadie suma puntos.
- El host inicia el juego y actúa como autoridad.
- Se muestran todas las respuestas y tiempos al final de cada ronda.

## Validación
- Mínimo 2 letras.
- Solo letras del español (a-z, á, é, í, ó, ú, ü, ñ).
- Se ignoran mayúsculas y tildes para comparar.

## Pantallas
- Lobby: crear sala, unirse con código, nombre del jugador.
- Sala de espera: lista de jugadores, listos, botón iniciar (host).
- Juego: palabra inicial, sílabas, etiqueta MAGO/GOMA, input, respuestas en vivo, tabla de puntajes.
- Resultado de ronda: ganador, respuestas, siguiente ronda.
- Fin de juego: clasificación final, jugar de nuevo (host), volver al lobby.

## Estado local (LocalStorage)
- `JM:magogoma:playerName`
- `JM:magogoma:lastRoom`

## Multiplayer
- Ably Realtime con canales: `jm:magogoma:<roomCode>:events`.
- Eventos: player-join, player-leave, player-ready, game-start, round-start, word-submit, round-end, game-over, next-round.

## Pendientes
- [ ] Validar y ajustar el silabeo con feedback real.
- [ ] Mejorar mensajes y feedback visual.
