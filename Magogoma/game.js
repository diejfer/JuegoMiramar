/**
 * Mago-Goma - Multiplayer Syllable Game
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  ABLY_API_KEY: '0609vA.En_nDQ:Kgcee1NdA-HVmitHeqnkn1azg3t6Lx5EqqonBlt_v3E',
  CHANNEL_PREFIX: 'jm:magogoma',
  STORAGE_PREFIX: 'JM:magogoma',
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  TOTAL_ROUNDS: 10,
  ROUND_TIME: 15000 // 15 seconds per round
};

const GameStates = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  PLAYING: 'playing',
  ROUND_RESULTS: 'round-results',
  GAME_OVER: 'gameover'
};

// Banco de palabras iniciales para cada ronda
const STARTER_WORDS = [
  'casa', 'perro', 'computadora', 'árbol', 'mariposa',
  'ventana', 'teléfono', 'murciélago', 'elefante', 'biblioteca',
  'automóvil', 'chocolate', 'universidad', 'refrigerador', 'hospital',
  'dinosaurio', 'matemática', 'aventura', 'corazón', 'helicóptero'
];

// ==================== GLOBAL STATE ====================

let ably = null;
let gameChannel = null;
let eventsChannel = null;

let currentPlayer = null;
let currentRoom = null;
let gameState = {
  roomCode: null,
  state: GameStates.LOBBY,
  players: [],
  currentRound: 0,
  starterWord: null,
  roundStartTime: null,
  roundAnswers: [],
  roundWinner: null
};

let roundTimer = null;
let hasSubmittedThisRound = false;

// ==================== UTILITY FUNCTIONS ====================

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId() {
  return 'player-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  return totalSeconds;
}

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
  console.log('[SHOW SCREEN]', screenId);

  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
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

function goToPlayingScreen() {
  showScreen('screen-playing');
  gameState.state = GameStates.PLAYING;
}

function goToRoundResults() {
  showScreen('screen-round-results');
  gameState.state = GameStates.ROUND_RESULTS;
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
      echoMessages: true,
      autoConnect: true,
      disconnectedRetryTimeout: 3000,
      suspendedRetryTimeout: 3000
    });

    ably.connection.on('connected', () => {
      updateConnectionStatus(true);
      console.log('[ABLY] Connected');
    });

    ably.connection.on('disconnected', () => {
      updateConnectionStatus(false, 'Desconectado. Intentando reconectar...');
    });

    ably.connection.on('suspended', () => {
      updateConnectionStatus(false, 'Conexión suspendida...');
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 15000);

      ably.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });

      ably.connection.once('failed', (error) => {
        clearTimeout(timeout);
        reject(error || new Error('Connection failed'));
      });
    });
  } catch (error) {
    console.error('[ABLY] Error:', error);
    showToast('Error de conexión. Por favor, recarga la página.', 'error');
    throw error;
  }
}

async function connectToRoom(roomCode) {
  if (!ably) {
    await initializeAbly();
  }

  try {
    gameChannel = ably.channels.get(`${CONFIG.CHANNEL_PREFIX}:${roomCode}:game`);
    eventsChannel = ably.channels.get(`${CONFIG.CHANNEL_PREFIX}:${roomCode}:events`);

    console.log('[CONNECT] Attaching to channels...');

    await Promise.all([
      new Promise((resolve, reject) => {
        gameChannel.attach((err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
      new Promise((resolve, reject) => {
        eventsChannel.attach((err) => {
          if (err) reject(err);
          else resolve();
        });
      })
    ]);

    gameChannel.subscribe((message) => {
      console.log('[GAME STATE]', message.data);
      handleGameStateUpdate(message.data);
    });

    eventsChannel.subscribe((message) => {
      console.log('[EVENT]', message.data);
      handleGameEvent(message.data);
    });

    currentRoom = roomCode;
    saveCurrentRoom(roomCode);

    console.log('[CONNECT] Success');
  } catch (error) {
    console.error('[CONNECT] Error:', error);
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
    currentRound: 0,
    starterWord: null,
    roundStartTime: null,
    roundAnswers: [],
    roundWinner: null
  };
}

// ==================== GAME EVENT HANDLERS ====================

function handleGameStateUpdate(data) {
  gameState = { ...gameState, ...data };
  updateUI();
}

function handleGameEvent(event) {
  console.log('[HANDLE EVENT]', event.type);

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
    case 'round-start':
      handleRoundStart(event);
      break;
    case 'word-submit':
      handleWordSubmit(event);
      break;
    case 'round-end':
      handleRoundEnd(event);
      break;
    case 'next-round':
      handleNextRound(event);
      break;
    case 'game-over':
      handleGameOver(event);
      break;
  }
}

async function handlePlayerJoin(event) {
  const existingPlayer = gameState.players.find(p => p.id === event.player.id);
  if (!existingPlayer) {
    gameState.players.push(event.player);
    showToast(`${event.player.name} se unió a la sala`, 'success');

    if (currentPlayer && currentPlayer.isHost) {
      await gameChannel.publish('state-update', gameState);
    }
  }
  updateWaitingRoomUI();
}

function handlePlayerLeave(event) {
  gameState.players = gameState.players.filter(p => p.id !== event.playerId);
  showToast('Un jugador abandonó la sala', 'info');

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

    if (currentPlayer && currentPlayer.isHost) {
      await gameChannel.publish('state-update', gameState);
    }
  }
  updateWaitingRoomUI();
}

function handleGameStart(event) {
  gameState.currentRound = 0;
  gameState.players = gameState.players.map(p => ({ ...p, score: 0 }));

  showToast('¡El juego comienza!', 'success');

  setTimeout(() => {
    startNextRound();
  }, 1000);
}

function handleRoundStart(event) {
  gameState.starterWord = event.starterWord;
  gameState.roundStartTime = event.startTime;
  gameState.roundAnswers = [];
  gameState.roundWinner = null;
  hasSubmittedThisRound = false;

  goToPlayingScreen();
  renderPlayingScreen();
  startRoundTimer();
}

function handleWordSubmit(event) {
  gameState.roundAnswers.push({
    playerId: event.playerId,
    playerName: event.playerName,
    word: event.word,
    syllables: event.syllables,
    type: event.type,
    timestamp: event.timestamp,
    isValid: event.isValid
  });

  updateLiveAnswers();

  // If this is the first valid answer, mark as winner and end round
  if (event.isValid && !gameState.roundWinner) {
    gameState.roundWinner = {
      playerId: event.playerId,
      playerName: event.playerName,
      word: event.word,
      syllables: event.syllables,
      type: event.type
    };

    // Update player score
    const player = gameState.players.find(p => p.id === event.playerId);
    if (player) {
      player.score = (player.score || 0) + 1;
    }

    // End round after short delay
    setTimeout(async () => {
      if (currentPlayer.isHost) {
        await eventsChannel.publish('round-end', {
          type: 'round-end',
          winner: gameState.roundWinner,
          allAnswers: gameState.roundAnswers
        });
      }
    }, 1000);
  }
}

function handleRoundEnd(event) {
  clearInterval(roundTimer);
  gameState.roundWinner = event.winner;
  gameState.roundAnswers = event.allAnswers;

  goToRoundResults();
  renderRoundResults();
}

function handleNextRound(event) {
  gameState.currentRound = event.roundNumber;
  startNextRound();
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
    currentPlayer = {
      id: generatePlayerId(),
      name: playerName,
      isHost: true
    };
    savePlayer(currentPlayer);

    const roomCode = generateRoomCode();
    showToast('Conectando...', 'info');

    await initializeAbly();
    await connectToRoom(roomCode);

    gameState.roomCode = roomCode;
    gameState.state = GameStates.WAITING;
    gameState.players = [{ ...currentPlayer, ready: false, score: 0 }];

    goToWaitingRoom();
    updateWaitingRoomUI();

    await gameChannel.publish('state-update', gameState);

    showToast(`Sala creada: ${roomCode}`, 'success');
  } catch (error) {
    console.error('[CREATE ROOM] Error:', error);
    showToast('No se pudo crear la sala. Verificá tu conexión.', 'error');
    disconnectFromRoom();
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

  currentPlayer = {
    id: generatePlayerId(),
    name: playerName,
    isHost: false
  };
  savePlayer(currentPlayer);

  try {
    await initializeAbly();
    await connectToRoom(roomCode);

    await new Promise(resolve => setTimeout(resolve, 500));

    let history = null;
    try {
      history = await gameChannel.history({ limit: 1 });
    } catch (historyError) {
      console.error('[JOIN] History error:', historyError);
    }

    if (history && history.items && history.items.length > 0) {
      const lastState = history.items[0].data;
      gameState = { ...gameState, ...lastState };

      if (gameState.state !== GameStates.WAITING && gameState.state !== GameStates.LOBBY) {
        showToast('Esta partida ya comenzó', 'error');
        disconnectFromRoom();
        return;
      }

      if (gameState.players.length >= CONFIG.MAX_PLAYERS) {
        showToast('La sala está llena', 'error');
        disconnectFromRoom();
        return;
      }
    }

    await eventsChannel.publish('player-join', {
      type: 'player-join',
      player: { ...currentPlayer, ready: false, score: 0 }
    });

    gameState.players.push({ ...currentPlayer, ready: false, score: 0 });
    gameState.roomCode = roomCode;

    goToWaitingRoom();
    updateWaitingRoomUI();

    showToast(`Te uniste a la sala ${roomCode}`, 'success');
  } catch (error) {
    console.error('[JOIN] Error:', error);
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

  roomCodeDisplay.textContent = gameState.roomCode;
  playerCount.textContent = gameState.players.length;

  if (gameState.players.length > 1) {
    instructionsCard.classList.add('hidden');
  } else {
    instructionsCard.classList.remove('hidden');
  }

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

  if (currentPlayer.isHost) {
    const allReady = gameState.players.every(p => p.ready);
    const enoughPlayers = gameState.players.length >= CONFIG.MIN_PLAYERS;

    if (allReady && enoughPlayers) {
      startButton.classList.remove('hidden');
    } else {
      startButton.classList.add('hidden');
    }
  }

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

  await eventsChannel.publish('game-start', {
    type: 'game-start'
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

async function startNextRound() {
  if (gameState.currentRound >= CONFIG.TOTAL_ROUNDS) {
    if (currentPlayer.isHost) {
      await eventsChannel.publish('game-over', {
        type: 'game-over',
        finalScores: gameState.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
    }
    return;
  }

  if (currentPlayer.isHost) {
    const shuffledWords = shuffleArray(STARTER_WORDS);
    const starterWord = shuffledWords[gameState.currentRound % shuffledWords.length];

    await eventsChannel.publish('round-start', {
      type: 'round-start',
      roundNumber: gameState.currentRound,
      starterWord: starterWord,
      startTime: Date.now()
    });
  }
}

function renderPlayingScreen() {
  const starterWord = gameState.starterWord;
  const syllables = dividirEnSilabas(starterWord);
  const type = esMagoOGoma(starterWord);

  document.getElementById('current-round').textContent = gameState.currentRound + 1;
  document.getElementById('starter-word').textContent = starterWord.toUpperCase();
  document.getElementById('syllables-display').textContent = `${syllables.join('-')} (${syllables.length})`;

  const wordTypeEl = document.getElementById('word-type');
  wordTypeEl.textContent = type.toUpperCase();
  wordTypeEl.className = `word-type ${type}`;

  document.getElementById('word-input').value = '';
  document.getElementById('word-input').disabled = false;
  document.getElementById('btn-submit-word').disabled = false;
  document.getElementById('word-feedback').classList.add('hidden');
  document.getElementById('live-answers').innerHTML = '';

  updateGameScoreboard();

  // Focus on input
  document.getElementById('word-input').focus();
}

function startRoundTimer() {
  clearInterval(roundTimer);

  const updateTimer = () => {
    const elapsed = Date.now() - gameState.roundStartTime;
    const remaining = CONFIG.ROUND_TIME - elapsed;

    if (remaining <= 0) {
      clearInterval(roundTimer);
      document.getElementById('round-timer').textContent = '⏱️ 0';

      // Auto-end round if no winner yet
      if (!gameState.roundWinner && currentPlayer.isHost) {
        eventsChannel.publish('round-end', {
          type: 'round-end',
          winner: null,
          allAnswers: gameState.roundAnswers
        });
      }
    } else {
      document.getElementById('round-timer').textContent = `⏱️ ${formatTime(remaining)}`;
    }
  };

  updateTimer();
  roundTimer = setInterval(updateTimer, 100);
}

async function submitWord() {
  if (hasSubmittedThisRound) {
    showToast('Ya enviaste una respuesta', 'info');
    return;
  }

  const input = document.getElementById('word-input');
  const word = input.value.trim().toLowerCase();

  if (!word) {
    showToast('Escribe una palabra', 'error');
    return;
  }

  const isValid = esPalabraValida(word);

  if (!isValid) {
    const feedback = document.getElementById('word-feedback');
    feedback.textContent = 'Palabra inválida (mínimo 2 letras, solo letras)';
    feedback.className = 'word-feedback error';
    feedback.classList.remove('hidden');
    return;
  }

  const syllables = dividirEnSilabas(word);
  const type = esMagoOGoma(word);

  hasSubmittedThisRound = true;
  input.disabled = true;
  document.getElementById('btn-submit-word').disabled = true;

  const feedback = document.getElementById('word-feedback');
  feedback.textContent = `Enviado: ${word} (${syllables.join('-')}) - ${type.toUpperCase()}`;
  feedback.className = 'word-feedback success';
  feedback.classList.remove('hidden');

  await eventsChannel.publish('word-submit', {
    type: 'word-submit',
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    word: word,
    syllables: syllables.length,
    type: type,
    timestamp: Date.now(),
    isValid: true
  });
}

function updateLiveAnswers() {
  const list = document.getElementById('live-answers');
  list.innerHTML = '';

  const sortedAnswers = [...gameState.roundAnswers].sort((a, b) => a.timestamp - b.timestamp);

  sortedAnswers.forEach((answer, index) => {
    const li = document.createElement('li');
    li.className = 'live-answer-item';

    const elapsed = answer.timestamp - gameState.roundStartTime;
    const timeText = `${(elapsed / 1000).toFixed(2)}s`;

    const isWinner = index === 0 && answer.isValid;
    if (isWinner) {
      li.style.borderLeft = '4px solid #48bb78';
    }

    li.innerHTML = `
      <span class="player-name">${isWinner ? '🏆 ' : ''}${answer.playerName}</span>
      <span class="word">${answer.word} (${answer.syllables} - ${answer.type})</span>
      <span class="time">${timeText}</span>
    `;
    list.appendChild(li);
  });
}

function updateGameScoreboard() {
  const scoreboard = document.getElementById('game-scoreboard');
  scoreboard.innerHTML = '';

  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  sortedPlayers.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${p.name}</span>
      <span>${p.score || 0} pts</span>
    `;
    scoreboard.appendChild(li);
  });
}

// ==================== ROUND RESULTS ====================

function renderRoundResults() {
  if (gameState.roundWinner) {
    document.getElementById('round-winner-name').textContent = gameState.roundWinner.playerName;
    document.getElementById('winning-word').textContent = gameState.roundWinner.word;

    const syllables = dividirEnSilabas(gameState.roundWinner.word);
    document.getElementById('winning-syllables-display').textContent =
      `${syllables.join('-')} (${gameState.roundWinner.syllables} sílabas)`;

    const typeEl = document.getElementById('winning-word-type');
    typeEl.textContent = gameState.roundWinner.type.toUpperCase();
    typeEl.className = `word-type ${gameState.roundWinner.type}`;
  } else {
    document.getElementById('round-winner-name').textContent = 'Nadie';
    document.getElementById('winning-word').textContent = 'Tiempo agotado';
    document.getElementById('winning-syllables-display').textContent = '';
    document.getElementById('winning-word-type').textContent = '';
  }

  const allAnswersList = document.getElementById('all-answers-list');
  allAnswersList.innerHTML = '';

  if (gameState.roundAnswers.length === 0) {
    allAnswersList.innerHTML = '<li>No hubo respuestas</li>';
  } else {
    const sortedAnswers = [...gameState.roundAnswers].sort((a, b) => a.timestamp - b.timestamp);
    sortedAnswers.forEach((answer, index) => {
      const li = document.createElement('li');
      const elapsed = answer.timestamp - gameState.roundStartTime;
      const timeText = `${(elapsed / 1000).toFixed(2)}s`;

      li.innerHTML = `
        <span>${index === 0 ? '🏆 ' : ''}${answer.playerName}: ${answer.word}</span>
        <span>${timeText}</span>
      `;
      allAnswersList.appendChild(li);
    });
  }

  const resultsScoreboard = document.getElementById('results-scoreboard');
  resultsScoreboard.innerHTML = '';

  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  sortedPlayers.forEach(p => {
    resultsScoreboard.innerHTML += `<li><span>${p.name}</span><span>${p.score || 0} pts</span></li>`;
  });
}

async function goToNextRound() {
  gameState.currentRound++;

  if (eventsChannel) {
    await eventsChannel.publish('next-round', {
      type: 'next-round',
      roundNumber: gameState.currentRound
    });
  }

  startNextRound();
}

// ==================== GAME OVER ====================

function renderGameOverScreen() {
  const sortedPlayers = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  const winner = sortedPlayers[0];
  document.getElementById('winner-name').textContent = winner.name;
  document.getElementById('winner-score').textContent = `${winner.score} puntos`;

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

  gameState.players = gameState.players.map(p => ({
    ...p,
    score: 0,
    ready: false
  }));

  gameState.currentRound = 0;

  await gameChannel.publish('state-update', gameState);

  goToWaitingRoom();
  updateWaitingRoomUI();
}

// ==================== UI UPDATE ====================

function updateUI() {
  if (gameState.state === GameStates.WAITING) {
    updateWaitingRoomUI();
  }
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);

  const roomCodeFromUrl = urlParams.get('room');
  if (roomCodeFromUrl) {
    const roomCodeInput = document.getElementById('room-code-input');
    roomCodeInput.value = roomCodeFromUrl.toUpperCase();
    document.getElementById('player-name').focus();
    showToast('Código de sala detectado! Ingresá tu nombre para unirte', 'info');

    const createRoomBtn = document.getElementById('btn-create-room');
    const divider = document.querySelector('.divider');
    if (createRoomBtn) createRoomBtn.style.display = 'none';
    if (divider) divider.style.display = 'none';
  }

  const savedPlayer = loadPlayer();
  if (savedPlayer) {
    document.getElementById('player-name').value = savedPlayer.name;
  }

  // Lobby
  document.getElementById('btn-create-room').addEventListener('click', createRoom);
  document.getElementById('btn-join-room').addEventListener('click', joinRoom);

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

  // Waiting room
  document.getElementById('btn-ready').addEventListener('click', toggleReady);
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-leave-room').addEventListener('click', leaveRoom);

  // Copy room code
  document.getElementById('room-code-container').addEventListener('click', async () => {
    const container = document.getElementById('room-code-container');
    const copyText = container.querySelector('.btn-copy-code');

    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${baseUrl}?room=${gameState.roomCode}`;

      await navigator.clipboard.writeText(shareableUrl);

      container.classList.add('copied');
      copyText.textContent = '✓ ¡Link copiado!';
      showToast('Link de invitación copiado al portapapeles', 'success');

      setTimeout(() => {
        container.classList.remove('copied');
        copyText.textContent = '👆 Toca para copiar link';
      }, 2000);
    } catch (error) {
      console.error('Error copying:', error);
      showToast('No se pudo copiar. Intenta de nuevo.', 'error');
    }
  });

  // Playing
  document.getElementById('btn-submit-word').addEventListener('click', submitWord);
  document.getElementById('word-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWord();
  });

  // Results
  document.getElementById('btn-next-round').addEventListener('click', goToNextRound);

  // Game over
  document.getElementById('btn-play-again').addEventListener('click', playAgain);
  document.getElementById('btn-back-to-lobby').addEventListener('click', goToLobby);
});
