# Juegos Miramar – Development Guidelines

## Objetivo
Desarrollar múltiples juegos simples usando tecnologías web, con ayuda de un agente de IA.
El repositorio se publica automáticamente como sitio estático.

URL base:
https://diejfer.github.io/JuegoMiramar/

---

## Estructura del repositorio

### Root
- `index.html` (home)
- `README.md`
- `development_guidelines.md`
- `agente.md`
- `shared/` (código común permitido)

### Por juego
```
/<game-slug>/
  ├─ requirements.md
  ├─ index.html
  ├─ style.css
  └─ game.js
```

Reglas:
- El agente trabaja solo dentro de la carpeta del juego asignado.
- No se tocan carpetas de otros juegos.
- El root solo se modifica si se pide explícitamente.

---

## Tecnologías
- Base: HTML, CSS, JavaScript
- Se permiten frameworks y librerías si mantienen el proyecto simple.
- No hay backend, base de datos ni lógica de servidor.

Build:
- No hay entorno de build local.
- Preferencia absoluta por soluciones sin build.
- GitHub Pages publica archivos estáticos directamente.

---

## Persistencia (LocalStorage)

- Toda la persistencia es local.
- Namespacing obligatorio por juego:

Formato:
JM:<game-slug>:<key>

Ejemplos:
- JM:domino:settings
- JM:truco:stats

Reglas:
- Nunca usar claves genéricas.
- Guardar datos en JSON.
- Cada juego solo puede borrar su propio namespace.

La home del sitio permite limpiar el storage de cada juego.

---

## Multiplayer (Ably)

Servicio:
- ably.com

API Key (pública):
0609vA.En_nDQ:Kgcee1NdA-HVmitHeqnkn1azg3t6Lx5EqqonBlt_v3E

### Namespacing de canales
Formato:
jm:<game-slug>:<roomCode>:<channel>

Ejemplo:
jm:domino:K7F2A:events

### Modelo de juego
- Cada jugador ingresa un identificador simple (nombre).
- Un jugador es host:
  - crea la partida
  - genera el roomCode
  - comparte el código manualmente
- Los demás jugadores se unen con el roomCode.
- Si no hay persistencia disponible, la partida es efímera.

---

## Debug

Todos los juegos deben soportar:
?debug=true

Cuando está activo:
- Se muestra una consola overlay para errores y logs.

El código de debug vive en el root (`shared/`) y se reutiliza.

---

## UI / UX
- Mobile-first obligatorio.
- Pensado primero para celular (portrait).
- Botones grandes y texto legible.
- Debe seguir funcionando en tablet y PC.

---

## Principio clave
Mantener todo lo más simple, chico y entendible posible.
