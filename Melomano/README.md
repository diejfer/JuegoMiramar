# 🎵 Melómano - Rock Nacional Argentino

Juego de trivia musical multijugador para 2-4 personas. Completá letras de canciones icónicas del rock argentino y respondé preguntas sobre las bandas y artistas.

## 🎮 Cómo Jugar

### Configuración Inicial

1. **Un jugador crea la sala:**
   - Ingresá tu nombre
   - Presioná "Crear Sala"
   - Compartí el código de 5 caracteres con los demás jugadores

2. **Los demás se unen:**
   - Ingresá tu nombre
   - Ingresá el código de sala
   - Presioná "Unirse"

3. **Todos marcan "Listo"** cuando estén preparados

4. **El host inicia el juego** cuando todos estén listos (mínimo 2 jugadores)

### Durante el Juego

**Para el jugador activo:**
- Verás un fragmento de letra con 2 palabras faltantes
- Completá las palabras en los espacios indicados
- Respondé 4 preguntas sobre la canción/banda
- Tenés 2 minutos por turno
- Cada respuesta correcta suma 1 punto (máximo 6 puntos por turno)

**Para los demás jugadores:**
- Ven las respuestas correctas en su pantalla
- Validan manualmente las respuestas del jugador activo
- Están todos juntos físicamente o en videollamada

### Sistema de Puntajes

- **1 punto** por cada palabra correcta (2 palabras)
- **1 punto** por cada pregunta correcta (4 preguntas)
- **Total: 6 puntos máximos por turno**

Las respuestas deben ser **exactas** (sin importar mayúsculas/minúsculas o acentos).

### Fin del Juego

Después de 12 rondas (1 tarjeta por cada jugador en rotación), se muestra:
- El ganador con su puntaje
- La clasificación final de todos los jugadores
- Opción de jugar de nuevo

## 🎵 Canciones Incluidas

1. **De Música Ligera** - Soda Stereo
2. **Los Dinosaurios** - Charly García
3. **Seguir Viviendo Sin Tu Amor** - Luis Alberto Spinetta
4. **Muchacha (Ojos de Papel)** - Almendra
5. **La Balsa** - Los Gatos
6. **Canción Para Mi Muerte** - Sui Generis
7. **Matador** - Los Fabulosos Cadillacs
8. **Crua-Chan** - Divididos
9. **Seminare** - Pescado Rabioso
10. **Cuando Pase el Temblor** - Soda Stereo
11. **Demoliendo Hoteles** - Charly García
12. **Luzbelito** - Patricio Rey y sus Redonditos de Ricota

## 🚀 Instalación y Uso

### Para Jugadores

Simplemente abrí la URL del juego en tu celular:
```
https://diejfer.github.io/JuegoMiramar/Melomano/
```

### Para Desarrollo Local

1. Cloná el repositorio:
```bash
git clone https://github.com/diejfer/JuegoMiramar.git
cd JuegoMiramar/Melomano
```

2. Iniciá un servidor HTTP local:
```bash
python3 -m http.server 8080
```

3. Abrí en tu navegador:
```
http://localhost:8080
```

### Modo Debug

Para activar el modo debug, agregá `?debug=true` a la URL:
```
http://localhost:8080/?debug=true
```

Funcionalidades del modo debug:
- Panel con estado del juego en tiempo real
- Log de mensajes de Ably
- Controles manuales (saltar turno, agregar puntos, terminar juego)

## 📱 Requisitos Técnicos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para sincronización multiplayer)
- Diseñado para celulares en modo portrait
- También funciona en tablets y desktop

## 🔧 Tecnología

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Multiplayer**: Ably Realtime
- **Persistencia**: LocalStorage
- **Hosting**: GitHub Pages

## 📝 Estructura de Archivos

```
Melomano/
├── index.html              # Estructura HTML de todas las pantallas
├── style.css               # Estilos mobile-first responsive
├── game.js                 # Lógica del juego y multiplayer
├── data/
│   └── rock-nacional.js    # 12 tarjetas de canciones
├── requirements.md         # Documentación técnica completa
└── README.md              # Este archivo
```

## 🐛 Solución de Problemas

### No puedo conectarme a una sala
- Verificá que el código sea correcto (5 caracteres)
- Asegurate de tener conexión a internet
- Probá recargar la página

### La sala se desconectó
- El juego intenta reconectar automáticamente
- Si el host se desconecta, el siguiente jugador se convierte en host

### Las respuestas no se validan correctamente
- Las palabras deben coincidir exactamente con la letra
- No importan mayúsculas/minúsculas ni acentos
- Los espacios al principio/final se ignoran

## 🎯 Características

✅ Multijugador en tiempo real (2-4 jugadores)
✅ Sincronización automática entre dispositivos
✅ Sistema de turnos con temporizador de 2 minutos
✅ Validación automática de respuestas
✅ Links a videos de YouTube de cada canción
✅ Diseño mobile-first responsive
✅ Modo debug para desarrollo
✅ Reconexión automática

## 📄 Licencia

Este juego está basado en el juego físico "Melómano" y fue desarrollado como un proyecto educativo.

## 👥 Créditos

- **Desarrollo**: Claude AI Assistant
- **Juego original**: Melómano (versión física)
- **Categoría**: Rock Nacional Argentino

---

**Versión**: 1.0
**Fecha**: Diciembre 2025
**URL**: https://diejfer.github.io/JuegoMiramar/Melomano/
