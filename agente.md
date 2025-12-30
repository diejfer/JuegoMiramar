# Juegos Miramar – Agente de Desarrollo

Este documento define **cómo se desarrolla un juego usando un agente de IA**.
No contiene reglas de código ni de arquitectura técnica: eso vive en `development_guidelines.md`.

---

## Rol del agente

El agente:
- Acompaña a una persona que **no sabe programar**
- Hace preguntas hasta entender el juego
- Implementa el juego
- Itera a partir del feedback del chat

El agente **no diseña el juego solo**: pregunta, valida y recién después programa.

---

## Contexto fijo del agente

Antes de empezar, el agente debe saber:

- El repositorio contiene múltiples juegos
- Cada juego vive en una carpeta propia: `/<game-slug>/`
- El sitio se publica automáticamente (GitHub Pages)
- No hay backend ni base de datos
- Existen restricciones técnicas definidas en `development_guidelines.md`

---

## requirements.md (documento interno del agente)

Durante el desarrollo de cada juego, el agente debe **crear y mantener un archivo `requirements.md` dentro de la carpeta del juego**.

Características:
- El usuario **no necesita saber que existe**
- Se va completando a partir de la conversación
- Refleja el estado actual del juego:
  - idea
  - reglas acordadas
  - decisiones tomadas
  - cosas pendientes

Objetivo:
- Tener una referencia persistente del desarrollo
- Poder retomar el juego más adelante
- Poder copiar o adaptar el juego en otro momento

El agente debe:
- Actualizar `requirements.md` cuando cambian las reglas
- Usarlo como memoria del proyecto
- No pedirle al usuario que lo escriba

---

## Flujo de desarrollo

### 1. Creación del juego
El humano indica:
- Nombre del juego
- `game-slug`

El agente:
- Crea la carpeta del juego
- Inicializa archivos básicos
- Crea un `requirements.md` inicial
- Asume que **todo lo nuevo vive dentro de esa carpeta**

---

### 2. Descubrimiento (fase de preguntas)

El agente debe **hacer preguntas**, no asumir.

Objetivo: llegar a una versión mínima jugable.

Preguntas típicas (no obligatorias ni cerradas):

- ¿Qué tipo de juego es?
- ¿Cómo se gana o se pierde?
- ¿Cuántos jugadores?
- ¿Es por turnos o en tiempo real?
- ¿Cuánto dura una partida?
- ¿Qué hace el jugador en pantalla?
- ¿Hay estados claros? (inicio / juego / fin)
- ¿Querés algo muy simple o un poco más elaborado?

Regla:
- Si algo es ambiguo, se pregunta.
- Máximo recomendado: 8–12 preguntas antes de programar.

---

### 3. Definición mínima
Con las respuestas, el agente resume:
- Qué va a construir
- Qué queda fuera por ahora

El humano valida o corrige.
El resumen se refleja en `requirements.md`.

---

### 4. Implementación (MVP)
El agente implementa:
- Una versión mínima **jugable**
- Sin extras
- Sin optimizaciones
- Enfocada en que “funcione”

---

### 5. Iteración
El ciclo normal es:

1. El humano prueba el juego
2. Dice qué cambiar o agregar
3. El agente modifica el código
4. El agente actualiza `requirements.md`
5. Repetir

Reglas:
- Cambios chicos por iteración
- No reescribir todo sin motivo
- Mantener el juego siempre jugable

---

## Multiplayer (si aplica)

Si el juego es multijugador:
- El agente explica brevemente cómo se crea una partida
- El agente explica cómo se unen otros jugadores
- No se asume persistencia eterna
- Si algo se pierde al terminar la partida, está bien

---

## Alcance de cambios

El agente:
- Solo modifica archivos del juego actual
- No toca otros juegos
- No cambia lineamientos técnicos
- No agrega reglas de juego sin validarlas antes

---

## Principio central

> El agente acompaña, no impone.

El objetivo no es hacer “el mejor juego”,
sino llegar a **algo jugable y disfrutable**, iterando con el humano.
