# Melómano - Requirements Document

## 🎵 Descripción General

Melómano es un juego de trivia musical multijugador para 2-4 jugadores. Los jugadores se turnan para completar fragmentos de canciones y responder preguntas sobre ellas. Cada jugador está en su propio dispositivo móvil, pero están juntos físicamente o en una videollamada.

## 🎮 Mecánica del Juego

### Configuración Inicial
- **Jugadores**: 2-4 personas
- **Duración**: ~35 minutos (aprox.)
- **Tarjetas por partida**: 12
- **Categoría inicial**: Rock Nacional Argentino

### Flujo del Juego

1. **Lobby**
   - Un jugador crea una sala y recibe un código de 5 caracteres (ej: "AB3X9")
   - Los demás jugadores se unen usando el código
   - El host puede ver cuántos jugadores están listos

2. **Sala de Espera**
   - Se muestra la lista de jugadores conectados
   - Los jugadores marcan "Listo"
   - El host inicia el juego cuando todos están listos
   - Mínimo 2 jugadores para comenzar

3. **Desarrollo del Juego**
   - El juego dura exactamente 12 turnos (1 por tarjeta)
   - Los turnos rotan entre todos los jugadores
   - Cada turno tiene un límite de 2 minutos

### Turno Individual

#### Para el Jugador Activo:
1. Ve un fragmento de letra con **2 palabras faltantes** (representadas con _____)
2. Debe completar las palabras escribiéndolas
3. Ve **4 preguntas** sobre la canción:
   - ¿Cómo se llama la canción?
   - ¿A qué banda/artista pertenece?
   - ¿En qué disco se lanzó? (o información complementaria)
   - ¿De qué año es la canción?
4. Tiene **2 minutos** para responder todo
5. Envía sus respuestas
6. Ve sus resultados y el link del video de la canción

#### Para los Otros Jugadores:
1. Ven el mismo fragmento de letra con las palabras faltantes
2. Ven **todas las respuestas correctas** para poder validar manualmente
3. No interactúan con el sistema durante el turno
4. Validan las respuestas del jugador activo (están en call o juntos físicamente)

### Sistema de Puntuación
- **1 punto** por cada palabra correcta (máximo 2 puntos)
- **1 punto** por cada pregunta correcta (máximo 4 puntos)
- **Total por turno**: 6 puntos máximos
- El sistema calcula automáticamente los puntos comparando las respuestas

#### Validación de Respuestas
- Las palabras deben ser **exactas** (ignorando mayúsculas/minúsculas y acentos)
- Los espacios antes/después se ignoran
- No se aceptan sinónimos o variaciones
- El sistema normaliza las respuestas automáticamente:
  ```
  "Historia" = "historia" ✓
  "  historia  " = "historia" ✓
  "história" (con acento portugués) = "historia" ✓
  ```

### Fin del Juego
1. Después de las 12 tarjetas, se muestra la pantalla de resultados
2. Se ordenan los jugadores por puntaje (de mayor a menor)
3. Se destaca al ganador
4. Opción de jugar de nuevo o volver al lobby

## 🎵 Contenido del Juego

### Categoría: Rock Nacional Argentino

El juego incluye 12 canciones icónicas del rock argentino:

1. **De Música Ligera** - Soda Stereo (1990)
2. **Los Dinosaurios** - Charly García (1983)
3. **Seguir Viviendo Sin Tu Amor** - Luis Alberto Spinetta / Invisible (1974)
4. **Muchacha (Ojos de Papel)** - Almendra (1969)
5. **La Balsa** - Los Gatos (1967)
6. **Canción Para Mi Muerte** - Sui Generis (1972)
7. **El Matador** - Los Fabulosos Cadillacs (1995)
8. **Crua-Chan** - Divididos (1998)
9. **Seminare** - Pescado Rabioso (1973)
10. **Cuando Pase el Temblor** - Soda Stereo (1985)
11. **Demoliendo Hoteles** - Charly García (1984)
12. **Luzbelito** - Patricio Rey y sus Redonditos de Ricota (1991)

### Estructura de una Tarjeta

```javascript
{
  id: 1,
  category: "Rock Nacional Argentino",
  lyrics: "Fragmento de letra con _____ palabras _____",
  word1: { answer: "palabra1", position: 1 },
  word2: { answer: "palabra2", position: 2 },
  questions: [
    { q: "¿Cómo se llama la canción?", a: "Nombre de la canción" },
    { q: "¿A qué banda pertenece?", a: "Nombre de la banda" },
    { q: "¿En qué disco se lanzó?", a: "Nombre del disco" },
    { q: "¿De qué año es la canción?", a: "1984" }
  ],
  videoLink: "https://www.youtube.com/watch?v=..."
}
```

## 🔧 Requisitos Técnicos

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (vanilla, sin frameworks)
- **Multiplayer**: Ably Realtime (con la API key proporcionada)
- **Persistencia**: LocalStorage del navegador
- **Hosting**: GitHub Pages (archivos estáticos)

### Arquitectura Multiplayer

#### Canales Ably
- `jm:melomano:lobby` - Canal global para salas activas
- `jm:melomano:<roomCode>:game` - Estado del juego sincronizado
- `jm:melomano:<roomCode>:events` - Eventos y acciones de jugadores

#### Tipos de Mensajes
```javascript
// Jugador se une
{ type: 'player-join', player: { id, name, isHost } }

// Jugador listo
{ type: 'player-ready', playerId }

// Iniciar juego
{ type: 'game-start', cards: [...], turnOrder: [...] }

// Inicio de turno
{ type: 'turn-start', playerId, cardIndex, startTime }

// Respuestas enviadas
{ type: 'answer-submit', playerId, word1, word2, answers: [...] }

// Fin de turno
{ type: 'turn-end', playerId, points, totalScore }

// Fin de juego
{ type: 'game-over', finalScores: [...] }
```

### Persistencia Local (LocalStorage)

#### Claves utilizadas
- `JM:melomano:player` - Información del jugador actual
  ```javascript
  { id: "uuid-v4", name: "NombreJugador" }
  ```
- `JM:melomano:currentRoom` - Código de sala activa (si existe)
- `JM:melomano:settings` - Preferencias del usuario
  ```javascript
  { soundEnabled: true, debugMode: false }
  ```

### Estados del Juego

```javascript
const GameStates = {
  LOBBY: 'lobby',           // Pantalla inicial
  WAITING: 'waiting',       // Sala de espera
  PLAYING: 'playing',       // Juego en curso
  TURN_RESULTS: 'results',  // Mostrando resultados del turno
  GAME_OVER: 'gameover'     // Juego terminado
};
```

### Estado del Juego (sincronizado)

```javascript
{
  roomCode: "AB3X9",
  state: "PLAYING",
  players: [
    { id: "uuid1", name: "Juan", score: 12, isHost: true, ready: true },
    { id: "uuid2", name: "María", score: 8, ready: true },
    { id: "uuid3", name: "Pedro", score: 10, ready: true }
  ],
  currentTurn: 3,           // Índice del turno actual (0-11)
  currentPlayer: "uuid2",   // ID del jugador activo
  turnStartTime: 1234567890, // Timestamp de inicio del turno
  cards: [...],             // 12 tarjetas seleccionadas aleatoriamente
  turnAnswers: {            // Respuestas del turno actual
    word1: "historia",
    word2: "tristeza",
    answers: ["Los Dinosaurios", "Charly García", "Clics modernos", "1983"]
  },
  turnPoints: 5             // Puntos obtenidos en el turno actual
}
```

## 📱 Diseño UI/UX

### Principios de Diseño
1. **Mobile-First**: Diseñado primero para celulares en modo portrait
2. **Responsive**: Funciona en tablets y desktop
3. **Touch-Friendly**: Botones grandes, fáciles de presionar
4. **Legible**: Texto grande, alto contraste
5. **Minimalista**: Interfaz limpia, sin distracciones

### Pantallas

#### 1. Lobby
- Input para nombre del jugador
- Botón "Crear Sala"
- Input para código + Botón "Unirse a Sala"
- (Opcional) Lista de salas activas

#### 2. Sala de Espera
- Código de sala destacado (para compartir)
- Lista de jugadores conectados
- Indicador de "Listo" para cada jugador
- Botón "Iniciar Juego" (solo para host, solo si todos están listos)
- Botón "Salir"

#### 3. Turno Activo (para jugador activo)
- Header: "Tarjeta X/12 | ⏱️ Tiempo | Score: X"
- Fragmento de letra con espacios para palabras
- 2 inputs para las palabras faltantes
- 4 inputs para las preguntas
- Botón "Enviar Respuestas"

#### 4. Turno Activo (para otros jugadores)
- Header: "Turno de [Nombre] | Tarjeta X/12 | ⏱️ Tiempo"
- Texto: "RESPUESTAS PARA VALIDAR:"
- Muestra las palabras correctas
- Muestra las respuestas a las 4 preguntas
- Texto: "Esperando que [Nombre] responda..."

#### 5. Resultados del Turno
- "[Nombre] obtuvo X puntos!"
- Lista con checkmarks ✓ o ✗ para cada respuesta
- Botón "🎵 Escuchar la canción" (link a YouTube)
- Countdown: "Siguiente turno en 5 segundos..."

#### 6. Fin del Juego
- "¡Juego Terminado!"
- Podio con los 3 primeros lugares
- Tabla completa de puntuaciones
- Botones: "Jugar de Nuevo" | "Volver al Lobby"

## 🐛 Modo Debug

Activación: `?debug=true` en la URL

Funcionalidades:
- Panel overlay con estado del juego en JSON
- Log de mensajes Ably en tiempo real
- Botones para simular eventos
- Indicador de latencia de red
- Controles manuales (saltar turno, modificar puntos, etc.)

## 🔒 Manejo de Errores

### Conexión Perdida
- Detectar desconexión de Ably
- Mostrar banner: "Reconectando..."
- Intentar reconexión automática
- Si el jugador activo se desconecta durante su turno, el host puede saltar el turno

### Validaciones
- No permitir crear sala sin nombre
- No permitir unirse sin código válido
- No permitir iniciar juego con menos de 2 jugadores
- Validar que todos los jugadores estén listos antes de iniciar

### Casos Edge
- Jugador abandona durante su turno → Auto-skip después de que termine el tiempo
- Host abandona la partida → El siguiente jugador más antiguo se convierte en host
- Todos los jugadores menos uno abandonan → Fin del juego automático

## 🎯 Alcance MVP

### Incluido en la Primera Versión
✅ Juego multijugador 2-4 personas
✅ Una categoría: Rock Nacional Argentino
✅ 12 tarjetas
✅ Sistema de turnos con temporizador
✅ Validación exacta de respuestas
✅ Puntuación automática
✅ Links a videos de YouTube
✅ Modo debug

### Fuera del Alcance Inicial (futuras versiones)
❌ Múltiples categorías
❌ Reproducción de audio in-app
❌ Validación "fuzzy" (aproximada)
❌ Sistema de rankings global
❌ Modo torneo
❌ Cartas personalizadas por usuario
❌ Integración con Spotify
❌ Modo solo

## 📊 Métricas de Éxito

- Los jugadores pueden crear y unirse a salas sin problemas
- El juego sincroniza correctamente el estado entre todos los jugadores
- El temporizador funciona consistentemente
- La validación de respuestas es precisa
- No hay lag perceptible en la comunicación entre jugadores
- El juego es jugable en celulares de diferentes tamaños

## 🚀 Plan de Lanzamiento

1. **Desarrollo** (esta sesión): Implementar todas las funcionalidades MVP
2. **Testing interno**: Probar con 2-4 dispositivos reales
3. **Deploy a GitHub Pages**: Publicar en https://diejfer.github.io/JuegoMiramar/Melomano/
4. **Testing con usuarios reales**: 2-3 partidas con amigos/familia
5. **Iteración**: Ajustes basados en feedback
6. **Lanzamiento público**: Compartir el link

## 📝 Notas de Implementación

- **Generación de Room Code**: Función que genera 5 caracteres aleatorios (A-Z, 0-9)
- **Normalización de respuestas**: Función que elimina acentos, convierte a minúsculas y trimea espacios
- **Shuffle de tarjetas**: Algoritmo Fisher-Yates para randomizar las 12 tarjetas
- **Timer sincronizado**: Usar timestamp de Ably, no reloj local del dispositivo
- **Host como autoridad**: El host es el source of truth para transiciones de estado

## 🎨 Paleta de Colores (sugerida)

- **Primary**: #FF6B35 (naranja vibrante) - Botones principales
- **Secondary**: #004E89 (azul oscuro) - Headers
- **Success**: #2EC4B6 (verde azulado) - Respuestas correctas
- **Error**: #E71D36 (rojo) - Respuestas incorrectas
- **Background**: #F7F7F7 (gris muy claro)
- **Text**: #1A1A1A (casi negro)

---

**Versión del documento**: 1.0
**Fecha de creación**: 2025-12-30
**Última actualización**: 2025-12-30
