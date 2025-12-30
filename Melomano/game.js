/**
 * Melómano - Multiplayer Music Trivia Game
 * Rock Nacional Argentino Edition
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  ABLY_API_KEY: '0609vA.En_nDQ:Kgcee1NdA-HVmitHeqnkn1azg3t6Lx5EqqonBlt_v3E',
  CHANNEL_PREFIX: 'jm:melomano',
  STORAGE_PREFIX: 'JM:melomano',
  TURN_RESULTS_DURATION: 5000, // 5 seconds countdown
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  TOTAL_CARDS: 12
};

const GameStates = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  PLAYING: 'playing',
  TURN_RESULTS: 'results',
  GAME_OVER: 'gameover'
};

const HYPE_PHRASES = [
  '🎸 ¡Dale que va! 🎸',
  '🔥 ¡A romperla toda! 🔥',
  '⚡ ¡Con toda la actitud! ⚡',
  '🎵 ¡Que empiece el rock! 🎵',
  '🤘 ¡Puro rock nacional! 🤘',
  '🎶 ¡A cantar y adivinar! 🎶',
  '💥 ¡Preparate para el recital! 💥',
  '🎤 ¡Sabelo que viene! 🎤',
  '🔊 ¡Al palo con el rock! 🔊',
  '🎸 ¡Que suene fuerte! 🎸',
  '⭐ ¡Dale campeón! ⭐',
  '🚀 ¡Arranquemos con todo! 🚀',
  '🏆 ¡A ganar se ha dicho! 🏆',
  '💪 ¡Con garra y corazón! 💪',
  '🎯 ¡A demostrar quién sabe más! 🎯'
];

// ==================== GLOBAL STATE ====================

let ably = null;
let gameChannel = null;
let eventsChannel = null;

let currentPlayer = null; // { id, name, isHost }
let currentRoom = null;
let gameState = {
  roomCode: null,
  state: GameStates.LOBBY,
  players: [],
  currentTurn: 0,
  currentPlayerId: null,
  turnStartTime: null,
  cards: [],
  turnAnswers: null,
  turnPoints: 0
};

let turnTimer = null;
let validationTimer = null;
let resultsTimer = null;
let debugMode = false;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a random 5-character room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique player ID
 */
function generatePlayerId() {
  return 'player-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

/**
 * Normalize text for comparison (lowercase, trim, remove accents)
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert YouTube URL to embed URL
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, search queries
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  // Check if it's already an embed URL
  if (url.includes('/embed/')) {
    return url;
  }

  // Extract video ID from youtube.com/watch?v=ID
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Extract video ID from youtu.be/ID
  match = url.match(/youtu\.be\/([^?]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // If it's a search URL, extract the search query and create a search embed
  match = url.match(/search_query=([^&]+)/);
  if (match) {
    const searchTerm = decodeURIComponent(match[1]);
    // YouTube doesn't support embedding search results directly
    // So we'll use a regular search URL but opened in iframe won't work
    // For now, return null and we'll show a message
    return null;
  }

  return null;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time in MM:SS
 */
function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show/hide connection banner
 */
function updateConnectionStatus(isConnected, message = '') {
  const banner = document.getElementById('connection-banner');
  const messageEl = document.getElementById('connection-message');

  if (!isConnected) {
    messageEl.textContent = message || 'Reconectando...';
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

// ==================== LOCALSTORAGE MANAGEMENT ====================

function savePlayer(player) {
  localStorage.setItem(`${CONFIG.STORAGE_PREFIX}:player`, JSON.stringify(player));
}

function loadPlayer() {
  const data = localStorage.getItem(`${CONFIG.STORAGE_PREFIX}:player`);
  return data ? JSON.parse(data) : null;
}

function saveCurrentRoom(roomCode) {
  localStorage.setItem(`${CONFIG.STORAGE_PREFIX}:currentRoom`, roomCode);
}

function loadCurrentRoom() {
  return localStorage.getItem(`${CONFIG.STORAGE_PREFIX}:currentRoom`);
}

function clearCurrentRoom() {
  localStorage.removeItem(`${CONFIG.STORAGE_PREFIX}:currentRoom`);
}

// ==================== SCREEN NAVIGATION ====================

function showScreen(screenId) {
  console.log('[SHOW SCREEN] Switching to:', screenId);

  // Hide all screens by removing 'active' class and adding 'hidden'
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  // Show the target screen by adding 'active' class and removing 'hidden'
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
    console.log('[SHOW SCREEN] Screen shown:', screenId);
  } else {
    console.error('[SHOW SCREEN] Screen not found:', screenId);
  }
}

function goToLobby() {
  showScreen('screen-lobby');
  gameState.state = GameStates.LOBBY;
  clearCurrentRoom();
  disconnectFromRoom();
}

function goToWaitingRoom() {
  showScreen('screen-waiting');
  gameState.state = GameStates.WAITING;
}

function goToPlayingScreen(isActivePlayer) {
  if (isActivePlayer) {
    showScreen('screen-playing-active');
  } else {
    showScreen('screen-playing-validation');
  }
  gameState.state = GameStates.PLAYING;
}

function goToTurnResults() {
  showScreen('screen-turn-results');
  gameState.state = GameStates.TURN_RESULTS;
}

function goToGameOver() {
  showScreen('screen-game-over');
  gameState.state = GameStates.GAME_OVER;
}

// ==================== ABLY CONNECTION ====================

async function initializeAbly() {
  try {
    ably = new Ably.Realtime({
      key: CONFIG.ABLY_API_KEY,
      clientId: currentPlayer.id,
      echoMessages: true, // Important: receive own messages
      autoConnect: true,
      disconnectedRetryTimeout: 3000,
      suspendedRetryTimeout: 3000
    });

    ably.connection.on('connected', () => {
      updateConnectionStatus(true);
      debugLog('Ably connected');
    });

    ably.connection.on('connecting', () => {
      debugLog('Ably connecting...');
    });

    ably.connection.on('disconnected', () => {
      updateConnectionStatus(false, 'Desconectado. Intentando reconectar...');
      debugLog('Ably disconnected');
    });

    ably.connection.on('suspended', () => {
      updateConnectionStatus(false, 'Conexión suspendida...');
      debugLog('Ably suspended');
    });

    ably.connection.on('failed', (error) => {
      debugLog('Ably connection failed', error);
      updateConnectionStatus(false, 'Conexión fallida');
    });

    ably.connection.on('closed', () => {
      debugLog('Ably connection closed');
    });

    ably.connection.on('update', () => {
      debugLog('Ably connection updated');
    });

    // Wait for connection with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 15000); // 15 seconds timeout

      ably.connection.once('connected', () => {
        clearTimeout(timeout);
        debugLog('Ably connected successfully');
        resolve();
      });

      ably.connection.once('failed', (error) => {
        clearTimeout(timeout);
        reject(error || new Error('Connection failed'));
      });
    });
  } catch (error) {
    console.error('Error initializing Ably:', error);
    showToast('Error de conexión. Por favor, recarga la página.', 'error');
    throw error;
  }
}

async function connectToRoom(roomCode) {
  if (!ably) {
    await initializeAbly();
  }

  try {
    // Get channels
    gameChannel = ably.channels.get(`${CONFIG.CHANNEL_PREFIX}:${roomCode}:game`);
    eventsChannel = ably.channels.get(`${CONFIG.CHANNEL_PREFIX}:${roomCode}:events`);

    debugLog(`Attaching to channels for room: ${roomCode}`);

    // Attach to channels before subscribing
    await Promise.all([
      new Promise((resolve, reject) => {
        gameChannel.attach((err) => {
          if (err) {
            debugLog('Error attaching to game channel', err);
            reject(err);
          } else {
            debugLog('Attached to game channel');
            resolve();
          }
        });
      }),
      new Promise((resolve, reject) => {
        eventsChannel.attach((err) => {
          if (err) {
            debugLog('Error attaching to events channel', err);
            reject(err);
          } else {
            debugLog('Attached to events channel');
            resolve();
          }
        });
      })
    ]);

    // Subscribe to game state updates
    gameChannel.subscribe((message) => {
      debugLog('Game state update:', message.data);
      handleGameStateUpdate(message.data);
    });

    // Subscribe to events
    eventsChannel.subscribe((message) => {
      debugLog('Event received:', message.data);
      handleGameEvent(message.data);
    });

    currentRoom = roomCode;
    saveCurrentRoom(roomCode);

    debugLog(`Successfully connected to room: ${roomCode}`);
  } catch (error) {
    console.error('Error connecting to room:', error);
    throw error;
  }
}

function disconnectFromRoom() {
  if (gameChannel) {
    gameChannel.unsubscribe();
    gameChannel.detach();
    gameChannel = null;
  }
  if (eventsChannel) {
    eventsChannel.unsubscribe();
    eventsChannel.detach();
    eventsChannel = null;
  }
  currentRoom = null;
  gameState = {
    roomCode: null,
    state: GameStates.LOBBY,
    players: [],
    currentTurn: 0,
    currentPlayerId: null,
    turnStartTime: null,
    cards: [],
    turnAnswers: null,
    turnPoints: 0
  };
}

// ==================== GAME EVENT HANDLERS ====================

function handleGameStateUpdate(data) {
  console.log('[GAME STATE UPDATE] Received:', data);
  gameState = { ...gameState, ...data };
  updateUI();
}

function handleGameEvent(event) {
  console.log('[GAME EVENT] Received:', event.type, event);
  switch (event.type) {
    case 'player-join':
      handlePlayerJoin(event);
      break;
    case 'player-leave':
      handlePlayerLeave(event);
      break;
    case 'player-ready':
      handlePlayerReady(event);
      break;
    case 'game-start':
      handleGameStart(event);
      break;
    case 'turn-start':
      handleTurnStart(event);
      break;
    case 'answer-submit':
      handleAnswerSubmit(event);
      break;
    case 'turn-end':
      handleTurnEnd(event);
      break;
    case 'next-turn':
      handleNextTurn(event);
      break;
    case 'game-over':
      handleGameOver(event);
      break;
  }
}

async function handlePlayerJoin(event) {
  console.log('[HANDLE PLAYER JOIN] Event:', event);
  const existingPlayer = gameState.players.find(p => p.id === event.player.id);
  if (!existingPlayer) {
    console.log('[HANDLE PLAYER JOIN] Adding new player:', event.player);
    gameState.players.push(event.player);
    showToast(`${event.player.name} se unió a la sala`, 'success');

    // If I'm the host, publish updated state to sync everyone
    if (currentPlayer && currentPlayer.isHost) {
      console.log('[HANDLE PLAYER JOIN] Host publishing updated state');
      await gameChannel.publish('state-update', gameState);
    }
  } else {
    console.log('[HANDLE PLAYER JOIN] Player already exists:', event.player.id);
  }
  updateWaitingRoomUI();
}

function handlePlayerLeave(event) {
  gameState.players = gameState.players.filter(p => p.id !== event.playerId);
  showToast(`Un jugador abandonó la sala`, 'info');

  // If host left, assign new host
  if (gameState.players.length > 0 && !gameState.players.some(p => p.isHost)) {
    gameState.players[0].isHost = true;
    if (gameState.players[0].id === currentPlayer.id) {
      currentPlayer.isHost = true;
      showToast('Ahora eres el host', 'info');
    }
  }

  updateWaitingRoomUI();
}

async function handlePlayerReady(event) {
  const player = gameState.players.find(p => p.id === event.playerId);
  if (player) {
    player.ready = event.ready;

    // If I'm the host, publish updated state to sync everyone
    if (currentPlayer && currentPlayer.isHost) {
      console.log('[HANDLE PLAYER READY] Host publishing updated state');
      await gameChannel.publish('state-update', gameState);
    }
  }
  updateWaitingRoomUI();
}

function handleGameStart(event) {
  gameState.cards = event.cards;
  gameState.currentTurn = 0;
  gameState.players = gameState.players.map(p => ({ ...p, score: 0 }));

  showToast('¡El juego comienza!', 'success');

  // Start first turn after a short delay
  setTimeout(() => {
    startNextTurn();
  }, 1000);
}

function handleTurnStart(event) {
  gameState.currentPlayerId = event.playerId;
  gameState.turnStartTime = event.startTime;
  gameState.turnAnswers = null;

  const isMyTurn = event.playerId === currentPlayer.id;
  goToPlayingScreen(isMyTurn);

  if (isMyTurn) {
    renderActivePlayerView();
    startTurnTimer();
  } else {
    renderValidationView();
    startValidationTimer();
  }
}

function handleAnswerSubmit(event) {
  gameState.turnAnswers = {
    word1: event.word1,
    word2: event.word2,
    answers: event.answers
  };

  // Calculate points
  const card = gameState.cards[gameState.currentTurn];
  let points = 0;

  // Check words
  if (normalizeText(event.word1) === normalizeText(card.word1.answer)) points++;
  if (normalizeText(event.word2) === normalizeText(card.word2.answer)) points++;

  // Check questions
  event.answers.forEach((answer, index) => {
    if (normalizeText(answer) === normalizeText(card.questions[index].a)) {
      points++;
    }
  });

  gameState.turnPoints = points;

  // Update player score
  const player = gameState.players.find(p => p.id === event.playerId);
  if (player) {
    player.score = (player.score || 0) + points;
  }

  // Show results
  setTimeout(() => {
    showTurnResults(event.playerId, points);
  }, 500);
}

function handleTurnEnd(event) {
  // Results are already showing, waiting for manual advancement
}

function handleNextTurn(event) {
  // Sync turn number across all players
  gameState.currentTurn = event.turnNumber;
  startNextTurn();
}

function handleGameOver(event) {
  goToGameOver();
  renderGameOverScreen();
}

// ==================== LOBBY LOGIC ====================

async function createRoom() {
  const nameInput = document.getElementById('player-name');
  const playerName = nameInput.value.trim();

  console.log('[CREATE ROOM] Starting...', { playerName });

  if (!playerName) {
    showToast('Por favor, ingresá tu nombre', 'error');
    nameInput.focus();
    return;
  }

  try {
    // Create or load player
    currentPlayer = {
      id: generatePlayerId(),
      name: playerName,
      isHost: true
    };
    savePlayer(currentPlayer);
    console.log('[CREATE ROOM] Player created:', currentPlayer);

    // Generate room code
    const roomCode = generateRoomCode();
    console.log('[CREATE ROOM] Room code generated:', roomCode);

    // Show connecting message
    showToast('Conectando...', 'info');

    // Initialize Ably and connect
    console.log('[CREATE ROOM] Initializing Ably...');
    await initializeAbly();
    console.log('[CREATE ROOM] Ably initialized, connecting to room...');
    await connectToRoom(roomCode);
    console.log('[CREATE ROOM] Connected to room channels');

    // Initialize game state
    gameState.roomCode = roomCode;
    gameState.state = GameStates.WAITING; // Set state BEFORE publishing
    gameState.players = [{ ...currentPlayer, ready: false, score: 0 }];
    console.log('[CREATE ROOM] Game state initialized:', gameState);

    // Show waiting room FIRST
    goToWaitingRoom();
    updateWaitingRoomUI();

    // Publish initial state AFTER showing UI
    console.log('[CREATE ROOM] Publishing initial state...');
    await gameChannel.publish('state-update', gameState);
    console.log('[CREATE ROOM] Initial state published');

    showToast(`Sala creada: ${roomCode}`, 'success');
    console.log('[CREATE ROOM] Success! Room created:', roomCode);
  } catch (error) {
    console.error('[CREATE ROOM] Error:', error);
    showToast('No se pudo crear la sala. Verificá tu conexión a internet.', 'error');
    disconnectFromRoom();
    // Stay on lobby screen
  }
}

async function joinRoom() {
  const nameInput = document.getElementById('player-name');
  const codeInput = document.getElementById('room-code-input');

  const playerName = nameInput.value.trim();
  const roomCode = codeInput.value.trim().toUpperCase();

  console.log('[JOIN ROOM] Starting...', { playerName, roomCode });

  if (!playerName) {
    showToast('Por favor, ingresá tu nombre', 'error');
    nameInput.focus();
    return;
  }

  if (!roomCode || roomCode.length !== 5) {
    showToast('Por favor, ingresá un código válido de 5 caracteres', 'error');
    codeInput.focus();
    return;
  }

  // Create player
  currentPlayer = {
    id: generatePlayerId(),
    name: playerName,
    isHost: false
  };
  savePlayer(currentPlayer);
  console.log('[JOIN ROOM] Player created:', currentPlayer);

  try {
    // Initialize Ably and connect
    console.log('[JOIN ROOM] Initializing Ably...');
    await initializeAbly();
    console.log('[JOIN ROOM] Ably initialized, connecting to room...');
    await connectToRoom(roomCode);
    console.log('[JOIN ROOM] Connected to room channels');

    // Wait a bit for channel to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Request current state
    console.log('[JOIN ROOM] Requesting channel history...');
    let history = null;
    try {
      history = await gameChannel.history({ limit: 1 });
      console.log('[JOIN ROOM] History result:', history);
    } catch (historyError) {
      console.error('[JOIN ROOM] Error getting history:', historyError);
      console.log('[JOIN ROOM] Continuing without history - room might be new');
    }

    if (history && history.items && history.items.length > 0) {
      const lastState = history.items[0].data;
      console.log('[JOIN ROOM] Last state found:', lastState);
      gameState = { ...gameState, ...lastState };

      // Check if game already started
      if (gameState.state !== GameStates.WAITING && gameState.state !== GameStates.LOBBY) {
        console.log('[JOIN ROOM] Game already started, state:', gameState.state);
        showToast('Esta partida ya comenzó', 'error');
        disconnectFromRoom();
        return;
      }

      // Check if room is full
      if (gameState.players.length >= CONFIG.MAX_PLAYERS) {
        console.log('[JOIN ROOM] Room is full:', gameState.players.length);
        showToast('La sala está llena', 'error');
        disconnectFromRoom();
        return;
      }
    } else {
      console.log('[JOIN ROOM] No history available - assuming new room');
    }

    // Announce join
    console.log('[JOIN ROOM] Publishing player-join event...');
    await eventsChannel.publish('player-join', {
      type: 'player-join',
      player: { ...currentPlayer, ready: false, score: 0 }
    });
    console.log('[JOIN ROOM] player-join event published');

    // Add self to local state
    gameState.players.push({ ...currentPlayer, ready: false, score: 0 });
    gameState.roomCode = roomCode;
    console.log('[JOIN ROOM] Updated local game state:', gameState);

    // Show waiting room
    goToWaitingRoom();
    updateWaitingRoomUI();

    showToast(`Te uniste a la sala ${roomCode}`, 'success');
    console.log('[JOIN ROOM] Success! Joined room:', roomCode);
  } catch (error) {
    console.error('[JOIN ROOM] Error:', error);
    console.error('[JOIN ROOM] Error stack:', error.stack);
    showToast('No se pudo unir a la sala. Verificá el código.', 'error');
    disconnectFromRoom();
  }
}

// ==================== WAITING ROOM LOGIC ====================

function showRandomHypePhrase() {
  const hypeText = document.querySelector('.hype-text');
  if (hypeText) {
    const randomPhrase = HYPE_PHRASES[Math.floor(Math.random() * HYPE_PHRASES.length)];
    hypeText.textContent = randomPhrase;
  }
}

function updateWaitingRoomUI() {
  const roomCodeDisplay = document.getElementById('room-code-display');
  const playerCount = document.getElementById('player-count');
  const playersList = document.getElementById('players-list');
  const startButton = document.getElementById('btn-start-game');
  const readyButton = document.getElementById('btn-ready');
  const instructionsCard = document.getElementById('waiting-instructions');

  // Show random hype phrase
  showRandomHypePhrase();

  // Update room code
  roomCodeDisplay.textContent = gameState.roomCode;

  // Update player count
  playerCount.textContent = gameState.players.length;

  // Show/hide instructions based on player count
  if (gameState.players.length > 1) {
    instructionsCard.classList.add('hidden');
  } else {
    instructionsCard.classList.remove('hidden');
  }

  // Update players list
  playersList.innerHTML = '';
  gameState.players.forEach(player => {
    const li = document.createElement('li');
    li.className = 'player-item';
    li.innerHTML = `
      <span class="player-name">${player.name} ${player.isHost ? '(Host)' : ''}</span>
      <span class="player-status ${player.ready ? 'ready' : ''}">
        ${player.ready ? '✓ Listo' : '○ Esperando'}
      </span>
    `;
    playersList.appendChild(li);
  });

  // Show/hide start button (only for host)
  if (currentPlayer.isHost) {
    const allReady = gameState.players.every(p => p.ready);
    const enoughPlayers = gameState.players.length >= CONFIG.MIN_PLAYERS;

    if (allReady && enoughPlayers) {
      startButton.classList.remove('hidden');
    } else {
      startButton.classList.add('hidden');
    }
  }

  // Update ready button state
  const myPlayer = gameState.players.find(p => p.id === currentPlayer.id);
  if (myPlayer && myPlayer.ready) {
    readyButton.classList.add('active');
    document.getElementById('ready-text').textContent = 'Listo ✓';
  } else {
    readyButton.classList.remove('active');
    document.getElementById('ready-text').textContent = 'Listo';
  }
}

async function toggleReady() {
  const myPlayer = gameState.players.find(p => p.id === currentPlayer.id);
  if (!myPlayer) return;

  const newReadyState = !myPlayer.ready;
  myPlayer.ready = newReadyState;

  await eventsChannel.publish('player-ready', {
    type: 'player-ready',
    playerId: currentPlayer.id,
    ready: newReadyState
  });

  updateWaitingRoomUI();
}

async function startGame() {
  if (!currentPlayer.isHost) return;

  // Shuffle cards
  const shuffledCards = shuffleArray(window.ROCK_NACIONAL_CARDS);

  // Publish game start
  await eventsChannel.publish('game-start', {
    type: 'game-start',
    cards: shuffledCards
  });
}

async function leaveRoom() {
  await eventsChannel.publish('player-leave', {
    type: 'player-leave',
    playerId: currentPlayer.id
  });

  goToLobby();
  showToast('Abandonaste la sala', 'info');
}

// ==================== GAME PLAYING LOGIC ====================

async function startNextTurn() {
  if (gameState.currentTurn >= CONFIG.TOTAL_CARDS) {
    // Game is over
    await eventsChannel.publish('game-over', {
      type: 'game-over',
      finalScores: gameState.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
    });
    return;
  }

  // Determine next player (rotate)
  const playerIndex = gameState.currentTurn % gameState.players.length;
  const nextPlayerId = gameState.players[playerIndex].id;

  // Publish turn start (only host)
  if (currentPlayer.isHost) {
    await eventsChannel.publish('turn-start', {
      type: 'turn-start',
      playerId: nextPlayerId,
      cardIndex: gameState.currentTurn,
      startTime: Date.now()
    });
  }
}

function renderActivePlayerView() {
  const card = gameState.cards[gameState.currentTurn];

  document.getElementById('active-card-num').textContent = gameState.currentTurn + 1;
  document.getElementById('active-score').textContent = gameState.players.find(p => p.id === currentPlayer.id)?.score || 0;
  document.getElementById('active-lyrics').textContent = card.lyrics;

  // Clear inputs
  document.getElementById('active-word1').value = '';
  document.getElementById('active-word2').value = '';

  // Render question inputs
  const questionsContainer = document.getElementById('active-questions');
  questionsContainer.innerHTML = '';

  card.questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label>${index + 1}. ${q.q}</label>
      <input
        type="text"
        id="active-question-${index}"
        class="input-word"
        autocomplete="off"
      >
    `;
    questionsContainer.appendChild(div);
  });
}

function renderValidationView() {
  const card = gameState.cards[gameState.currentTurn];
  const activePlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

  document.getElementById('validation-player-name').textContent = activePlayer?.name || '---';
  document.getElementById('validation-card-num').textContent = gameState.currentTurn + 1;
  document.getElementById('validation-lyrics').textContent = card.lyrics;
  document.getElementById('validation-waiting-name').textContent = activePlayer?.name || '---';

  // Show correct answers
  document.getElementById('validation-word1').textContent = card.word1.answer;
  document.getElementById('validation-word2').textContent = card.word2.answer;

  const questionsContainer = document.getElementById('validation-questions');
  questionsContainer.innerHTML = '';

  card.questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${q.q}</strong><br>${q.a}`;
    questionsContainer.appendChild(li);
  });
}

function startTurnTimer() {
  clearInterval(turnTimer);

  const updateTimer = () => {
    const elapsed = Date.now() - gameState.turnStartTime;

    // Show elapsed time instead of countdown (no time limit)
    document.getElementById('active-timer').textContent = '⏱️ ' + formatTime(elapsed);
  };

  updateTimer();
  turnTimer = setInterval(updateTimer, 1000); // Update every second
}

function startValidationTimer() {
  clearInterval(validationTimer);

  const updateTimer = () => {
    const elapsed = Date.now() - gameState.turnStartTime;

    // Show elapsed time for validation screen
    const timerEl = document.getElementById('validation-timer');
    if (timerEl) {
      timerEl.textContent = '⏱️ ' + formatTime(elapsed);
    }
  };

  updateTimer();
  validationTimer = setInterval(updateTimer, 1000); // Update every second
}

async function submitAnswers() {
  clearInterval(turnTimer);
  clearInterval(validationTimer);

  const word1 = document.getElementById('active-word1').value.trim();
  const word2 = document.getElementById('active-word2').value.trim();

  const answers = [];
  const card = gameState.cards[gameState.currentTurn];

  card.questions.forEach((_, index) => {
    const input = document.getElementById(`active-question-${index}`);
    answers.push(input ? input.value.trim() : '');
  });

  await eventsChannel.publish('answer-submit', {
    type: 'answer-submit',
    playerId: currentPlayer.id,
    word1,
    word2,
    answers
  });
}

function showTurnResults(playerId, points) {
  clearInterval(turnTimer);
  clearInterval(validationTimer);

  goToTurnResults();

  const card = gameState.cards[gameState.currentTurn];
  const player = gameState.players.find(p => p.id === playerId);
  const answers = gameState.turnAnswers;

  document.getElementById('results-player-name').textContent = player?.name || '---';
  document.getElementById('results-points').textContent = points;

  // Show detailed results
  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '';

  // Word 1
  const word1Correct = normalizeText(answers.word1) === normalizeText(card.word1.answer);
  resultsList.innerHTML += `
    <li class="${word1Correct ? 'correct' : 'incorrect'}">
      ${word1Correct ? '✓' : '✗'} Palabra 1: "${answers.word1}" ${!word1Correct ? `(correcta: "${card.word1.answer}")` : ''}
    </li>
  `;

  // Word 2
  const word2Correct = normalizeText(answers.word2) === normalizeText(card.word2.answer);
  resultsList.innerHTML += `
    <li class="${word2Correct ? 'correct' : 'incorrect'}">
      ${word2Correct ? '✓' : '✗'} Palabra 2: "${answers.word2}" ${!word2Correct ? `(correcta: "${card.word2.answer}")` : ''}
    </li>
  `;

  // Questions
  answers.answers.forEach((answer, index) => {
    const correct = normalizeText(answer) === normalizeText(card.questions[index].a);
    resultsList.innerHTML += `
      <li class="${correct ? 'correct' : 'incorrect'}">
        ${correct ? '✓' : '✗'} ${card.questions[index].q}<br>
        Respuesta: "${answer}" ${!correct ? `<br>(correcta: "${card.questions[index].a}")` : ''}
      </li>
    `;
  });

  // Video embed or link
  const videoContainer = document.getElementById('results-video-container');
  videoContainer.innerHTML = '';

  const embedUrl = getYouTubeEmbedUrl(card.videoLink);
  if (embedUrl) {
    // Create iframe for direct video links
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
  } else {
    // Fallback: show link to search or video
    const linkButton = document.createElement('a');
    linkButton.href = card.videoLink;
    linkButton.target = '_blank';
    linkButton.className = 'btn btn-video';
    linkButton.textContent = '🎵 Buscar en YouTube';
    videoContainer.appendChild(linkButton);
  }

  // Mini scoreboard
  const miniScoreboard = document.getElementById('mini-scoreboard');
  miniScoreboard.innerHTML = '';

  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  sortedPlayers.forEach(p => {
    miniScoreboard.innerHTML += `<li>${p.name}: ${p.score || 0} puntos</li>`;
  });
}

async function goToNextTurn() {
  // Any player can advance to the next turn
  gameState.currentTurn++;

  // Publish the advancement to all players
  if (eventsChannel) {
    await eventsChannel.publish('next-turn', {
      type: 'next-turn',
      turnNumber: gameState.currentTurn
    });
  }

  startNextTurn();
}

// ==================== GAME OVER ====================

function renderGameOverScreen() {
  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Winner
  const winner = sortedPlayers[0];
  document.getElementById('winner-name').textContent = winner.name;
  document.getElementById('winner-score').textContent = `${winner.score} puntos`;

  // Final scoreboard
  const finalScoreboard = document.getElementById('final-scoreboard');
  finalScoreboard.innerHTML = '';

  sortedPlayers.forEach((player, index) => {
    const li = document.createElement('li');
    li.className = 'scoreboard-item';
    li.innerHTML = `
      <span class="rank">${index + 1}º</span>
      <span class="name">${player.name}</span>
      <span class="score">${player.score} pts</span>
    `;
    finalScoreboard.appendChild(li);
  });
}

async function playAgain() {
  if (!currentPlayer.isHost) {
    showToast('Solo el host puede reiniciar el juego', 'error');
    return;
  }

  // Reset player scores and ready status
  gameState.players = gameState.players.map(p => ({
    ...p,
    score: 0,
    ready: false
  }));

  gameState.currentTurn = 0;
  gameState.cards = [];

  // Publish state reset
  await gameChannel.publish('state-update', gameState);

  goToWaitingRoom();
  updateWaitingRoomUI();
}

// ==================== UI UPDATE ====================

function updateUI() {
  // This is called when game state updates from Ably
  // Update relevant UI based on current screen

  if (gameState.state === GameStates.WAITING) {
    updateWaitingRoomUI();
  }
}

// ==================== DEBUG MODE ====================

function enableDebugMode() {
  debugMode = true;
  const panel = document.getElementById('debug-panel');
  const toggleBtn = document.getElementById('debug-toggle');

  panel.classList.remove('hidden');

  updateDebugPanel();

  // Toggle minimize/maximize
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('minimized');
    toggleBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
  });

  document.getElementById('debug-skip-turn').addEventListener('click', () => {
    if (currentPlayer.isHost) {
      gameState.currentTurn++;
      startNextTurn();
    }
  });

  document.getElementById('debug-add-points').addEventListener('click', () => {
    const myPlayer = gameState.players.find(p => p.id === currentPlayer.id);
    if (myPlayer) {
      myPlayer.score = (myPlayer.score || 0) + 5;
      updateUI();
    }
  });

  document.getElementById('debug-end-game').addEventListener('click', async () => {
    if (currentPlayer.isHost) {
      await eventsChannel.publish('game-over', {
        type: 'game-over',
        finalScores: gameState.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
    }
  });
}

function debugLog(message, data = null) {
  if (!debugMode) return;

  const messagesDiv = document.getElementById('debug-messages');
  const entry = document.createElement('div');
  entry.className = 'debug-entry';
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  if (data) {
    entry.textContent += ` ${JSON.stringify(data)}`;
  }
  messagesDiv.appendChild(entry);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  updateDebugPanel();
}

function updateDebugPanel() {
  if (!debugMode) return;

  const stateDiv = document.getElementById('debug-state');
  stateDiv.textContent = JSON.stringify(
    {
      currentPlayer,
      gameState,
      room: currentRoom
    },
    null,
    2
  );
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Check for debug mode
  if (urlParams.get('debug') === 'true') {
    enableDebugMode();
  }

  // Check for room code in URL
  const roomCodeFromUrl = urlParams.get('room');
  if (roomCodeFromUrl) {
    const roomCodeInput = document.getElementById('room-code-input');
    roomCodeInput.value = roomCodeFromUrl.toUpperCase();
    // Focus on name input so user just needs to type name and join
    document.getElementById('player-name').focus();
    showToast('Código de sala detectado! Ingresá tu nombre para unirte', 'info');

    // Hide "Create Room" button to avoid confusion
    const createRoomBtn = document.getElementById('btn-create-room');
    const divider = document.querySelector('.divider');
    if (createRoomBtn) createRoomBtn.style.display = 'none';
    if (divider) divider.style.display = 'none';
  }

  // Load saved player
  const savedPlayer = loadPlayer();
  if (savedPlayer) {
    document.getElementById('player-name').value = savedPlayer.name;
  }

  // Lobby buttons
  document.getElementById('btn-create-room').addEventListener('click', createRoom);
  document.getElementById('btn-join-room').addEventListener('click', joinRoom);

  // Allow join on Enter key
  document.getElementById('room-code-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
  });

  document.getElementById('player-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const roomCode = document.getElementById('room-code-input').value.trim();
      if (roomCode) {
        joinRoom();
      } else {
        createRoom();
      }
    }
  });

  // Waiting room buttons
  document.getElementById('btn-ready').addEventListener('click', toggleReady);
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-leave-room').addEventListener('click', leaveRoom);

  // Copy room code - entire container is clickable
  document.getElementById('room-code-container').addEventListener('click', async () => {
    const container = document.getElementById('room-code-container');
    const copyText = container.querySelector('.btn-copy-code');

    try {
      // Generate shareable URL with room code
      const baseUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${baseUrl}?room=${gameState.roomCode}`;

      await navigator.clipboard.writeText(shareableUrl);

      // Visual feedback
      container.classList.add('copied');
      copyText.textContent = '✓ ¡Link copiado!';
      showToast('Link de invitación copiado al portapapeles', 'success');

      // Reset after animation
      setTimeout(() => {
        container.classList.remove('copied');
        copyText.textContent = '👆 Toca para copiar link';
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('No se pudo copiar. Intenta de nuevo.', 'error');
    }
  });

  // Playing screen
  document.getElementById('btn-submit-answers').addEventListener('click', submitAnswers);

  // Turn results screen
  document.getElementById('btn-next-turn').addEventListener('click', goToNextTurn);

  // Game over buttons
  document.getElementById('btn-play-again').addEventListener('click', playAgain);
  document.getElementById('btn-back-to-lobby').addEventListener('click', goToLobby);
});

// ==================== AUTO-RECONNECT ====================

// Attempt to reconnect to saved room on page load
window.addEventListener('load', async () => {
  const savedRoom = loadCurrentRoom();
  const savedPlayer = loadPlayer(); // FIX: Load saved player

  if (savedRoom && savedPlayer) {
    try {
      console.log('[AUTO-RECONNECT] Attempting to reconnect...', { savedRoom, savedPlayer });

      // Try to rejoin
      currentPlayer = savedPlayer;
      await initializeAbly();
      await connectToRoom(savedRoom);

      // Request current state
      const history = await gameChannel.history({ limit: 1 });
      if (history && history.items && history.items.length > 0) {
        gameState = { ...gameState, ...history.items[0].data };

        // Check if still valid
        if (gameState.players.some(p => p.id === currentPlayer.id)) {
          goToWaitingRoom();
          updateWaitingRoomUI();
          showToast('Reconectado a la sala', 'success');
          console.log('[AUTO-RECONNECT] Successfully reconnected');
          return;
        }
      }

      console.log('[AUTO-RECONNECT] Reconnection failed - invalid state');
    } catch (error) {
      console.log('[AUTO-RECONNECT] Could not reconnect to previous room:', error);
    }

    // If reconnection failed, clear and go to lobby
    clearCurrentRoom();
    goToLobby();
  } else {
    console.log('[AUTO-RECONNECT] No saved room/player to reconnect');
  }
});
