/**
 * Melómano - Multiplayer Music Trivia Game
 * Rock Nacional Argentino Edition
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  ABLY_API_KEY: '0609vA.En_nDQ:Kgcee1NdA-HVmitHeqnkn1azg3t6Lx5EqqonBlt_v3E',
  CHANNEL_PREFIX: 'jm:melomano',
  STORAGE_PREFIX: 'JM:melomano',
  TURN_DURATION: 120000, // 2 minutes in milliseconds
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
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
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
  gameState = { ...gameState, ...data };
  updateUI();
}

function handleGameEvent(event) {
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
    case 'game-over':
      handleGameOver(event);
      break;
  }
}

function handlePlayerJoin(event) {
  const existingPlayer = gameState.players.find(p => p.id === event.player.id);
  if (!existingPlayer) {
    gameState.players.push(event.player);
    showToast(`${event.player.name} se unió a la sala`, 'success');
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

function handlePlayerReady(event) {
  const player = gameState.players.find(p => p.id === event.playerId);
  if (player) {
    player.ready = event.ready;
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
  // Results are already showing, just wait for countdown
}

function handleGameOver(event) {
  goToGameOver();
  renderGameOverScreen();
}

// ==================== LOBBY LOGIC ====================

async function createRoom() {
  const nameInput = document.getElementById('player-name');
  const playerName = nameInput.value.trim();

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

    // Generate room code
    const roomCode = generateRoomCode();

    // Show connecting message
    showToast('Conectando...', 'info');

    // Initialize Ably and connect
    await initializeAbly();
    await connectToRoom(roomCode);

    // Initialize game state
    gameState.roomCode = roomCode;
    gameState.players = [{ ...currentPlayer, ready: false, score: 0 }];

    // Publish initial state
    await gameChannel.publish('state-update', gameState);

    // Show waiting room
    goToWaitingRoom();
    updateWaitingRoomUI();

    showToast(`Sala creada: ${roomCode}`, 'success');
  } catch (error) {
    console.error('Error creating room:', error);
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

  try {
    // Initialize Ably and connect
    await initializeAbly();
    await connectToRoom(roomCode);

    // Request current state
    const history = await gameChannel.history({ limit: 1 });
    if (history.items.length > 0) {
      const lastState = history.items[0].data;
      gameState = { ...gameState, ...lastState };

      // Check if game already started
      if (gameState.state !== GameStates.WAITING && gameState.state !== GameStates.LOBBY) {
        showToast('Esta partida ya comenzó', 'error');
        disconnectFromRoom();
        return;
      }

      // Check if room is full
      if (gameState.players.length >= CONFIG.MAX_PLAYERS) {
        showToast('La sala está llena', 'error');
        disconnectFromRoom();
        return;
      }
    }

    // Announce join
    await eventsChannel.publish('player-join', {
      type: 'player-join',
      player: { ...currentPlayer, ready: false, score: 0 }
    });

    // Add self to local state
    gameState.players.push({ ...currentPlayer, ready: false, score: 0 });
    gameState.roomCode = roomCode;

    // Show waiting room
    goToWaitingRoom();
    updateWaitingRoomUI();

    showToast(`Te uniste a la sala ${roomCode}`, 'success');
  } catch (error) {
    console.error('Error joining room:', error);
    showToast('No se pudo unir a la sala. Verificá el código.', 'error');
    disconnectFromRoom();
  }
}

// ==================== WAITING ROOM LOGIC ====================

function updateWaitingRoomUI() {
  const roomCodeDisplay = document.getElementById('room-code-display');
  const playerCount = document.getElementById('player-count');
  const playersList = document.getElementById('players-list');
  const startButton = document.getElementById('btn-start-game');
  const readyButton = document.getElementById('btn-ready');
  const instructionsCard = document.getElementById('waiting-instructions');

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
    const remaining = Math.max(0, CONFIG.TURN_DURATION - elapsed);

    document.getElementById('active-timer').textContent = '⏱️ ' + formatTime(remaining);

    if (remaining <= 0) {
      clearInterval(turnTimer);
      showToast('¡Se acabó el tiempo!', 'error');
      // Auto-submit empty answers
      submitAnswers();
    }
  };

  updateTimer();
  turnTimer = setInterval(updateTimer, 100);
}

async function submitAnswers() {
  clearInterval(turnTimer);

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

  // Video link
  document.getElementById('results-video-link').href = card.videoLink;

  // Mini scoreboard
  const miniScoreboard = document.getElementById('mini-scoreboard');
  miniScoreboard.innerHTML = '';

  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  sortedPlayers.forEach(p => {
    miniScoreboard.innerHTML += `<li>${p.name}: ${p.score || 0} puntos</li>`;
  });

  // Start countdown
  startResultsCountdown();
}

function startResultsCountdown() {
  let countdown = 5;
  const countdownEl = document.getElementById('countdown-timer');

  clearInterval(resultsTimer);

  const updateCountdown = () => {
    countdownEl.textContent = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(resultsTimer);
      gameState.currentTurn++;
      startNextTurn();
    }
  };

  updateCountdown();
  resultsTimer = setInterval(updateCountdown, 1000);
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
  // Check for debug mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    enableDebugMode();
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
      await navigator.clipboard.writeText(gameState.roomCode);

      // Visual feedback
      container.classList.add('copied');
      copyText.textContent = '✓ ¡Copiado!';
      showToast('Código copiado al portapapeles', 'success');

      // Reset after animation
      setTimeout(() => {
        container.classList.remove('copied');
        copyText.textContent = '👆 Toca para copiar';
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('No se pudo copiar. Intenta de nuevo.', 'error');
    }
  });

  // Playing screen
  document.getElementById('btn-submit-answers').addEventListener('click', submitAnswers);

  // Game over buttons
  document.getElementById('btn-play-again').addEventListener('click', playAgain);
  document.getElementById('btn-back-to-lobby').addEventListener('click', goToLobby);
});

// ==================== AUTO-RECONNECT ====================

// Attempt to reconnect to saved room on page load
window.addEventListener('load', async () => {
  const savedRoom = loadCurrentRoom();
  if (savedRoom && savedPlayer) {
    try {
      // Try to rejoin
      currentPlayer = savedPlayer;
      await initializeAbly();
      await connectToRoom(savedRoom);

      // Request current state
      const history = await gameChannel.history({ limit: 1 });
      if (history.items.length > 0) {
        gameState = { ...gameState, ...history.items[0].data };

        // Check if still valid
        if (gameState.players.some(p => p.id === currentPlayer.id)) {
          goToWaitingRoom();
          updateWaitingRoomUI();
          showToast('Reconectado a la sala', 'success');
          return;
        }
      }
    } catch (error) {
      console.log('Could not reconnect to previous room');
    }

    // If reconnection failed, clear and go to lobby
    clearCurrentRoom();
    goToLobby();
  }
});
