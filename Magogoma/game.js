const API_KEY = "0609vA.En_nDQ:Kgcee1NdA-HVmitHeqnkn1azg3t6Lx5EqqonBlt_v3E";
const STORAGE_KEYS = {
  name: "JM:magogoma:playerName",
  room: "JM:magogoma:lastRoom",
};
const WORD_BANK = [
  "casa",
  "perro",
  "árbol",
  "mesa",
  "libro",
  "ventana",
  "mariposa",
  "pelota",
  "guitarra",
  "computadora",
  "elefante",
  "chocolate",
  "biblioteca",
  "refrigerador",
  "murciélago",
  "universidad",
  "matemática",
  "canción",
  "cuaderno",
  "pájaro",
];
const ROUND_DURATION_MS = 15000;
const TOTAL_ROUNDS = 10;

const elements = {
  screens: {
    lobby: document.getElementById("screen-lobby"),
    room: document.getElementById("screen-room"),
    game: document.getElementById("screen-game"),
    roundResult: document.getElementById("screen-round-result"),
    gameOver: document.getElementById("screen-game-over"),
  },
  playerName: document.getElementById("player-name"),
  roomCode: document.getElementById("room-code"),
  createRoom: document.getElementById("create-room"),
  joinRoom: document.getElementById("join-room"),
  copyRoom: document.getElementById("copy-room"),
  playersList: document.getElementById("players-list"),
  readyButton: document.getElementById("ready-button"),
  startGame: document.getElementById("start-game"),
  leaveRoom: document.getElementById("leave-room"),
  roundCounter: document.getElementById("round-counter"),
  roundTimer: document.getElementById("round-timer"),
  baseWord: document.getElementById("base-word"),
  syllables: document.getElementById("syllables"),
  wordType: document.getElementById("word-type"),
  wordInput: document.getElementById("word-input"),
  sendWord: document.getElementById("send-word"),
  responsesList: document.getElementById("responses-list"),
  scoresList: document.getElementById("scores-list"),
  roundWinner: document.getElementById("round-winner"),
  roundResponses: document.getElementById("round-responses"),
  roundScores: document.getElementById("round-scores"),
  nextRound: document.getElementById("next-round"),
  finalWinner: document.getElementById("final-winner"),
  finalScores: document.getElementById("final-scores"),
  playAgain: document.getElementById("play-again"),
  backLobby: document.getElementById("back-lobby"),
  debugToggle: document.getElementById("debug-toggle"),
  debugPanel: document.getElementById("debug-panel"),
  debugClose: document.getElementById("debug-close"),
  debugLog: document.getElementById("debug-log"),
};

const state = {
  playerId: `p-${Math.random().toString(36).slice(2, 10)}`,
  playerName: "",
  roomCode: "",
  hostId: "",
  isHost: false,
  phase: "lobby",
  round: 0,
  responses: [],
  roundStartTime: 0,
  roundWord: null,
  lastWinnerId: null,
  players: {},
  hasSubmitted: false,
  timerInterval: null,
  roundTimeout: null,
  debug: false,
};

let ablyClient = null;
let ablyChannel = null;

const INSEPARABLE_CLUSTERS = new Set([
  "bl",
  "br",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gl",
  "gr",
  "pl",
  "pr",
  "tr",
  "ch",
  "ll",
  "rr",
]);

function logDebug(message) {
  if (!state.debug) {
    return;
  }
  const timestamp = new Date().toLocaleTimeString();
  elements.debugLog.textContent = `[${timestamp}] ${message}\n${elements.debugLog.textContent}`;
}

function showScreen(name) {
  Object.values(elements.screens).forEach((screen) => screen.classList.remove("active"));
  elements.screens[name].classList.add("active");
  state.phase = name;
}

function savePlayerName(name) {
  localStorage.setItem(STORAGE_KEYS.name, name);
}

function saveRoomCode(code) {
  localStorage.setItem(STORAGE_KEYS.room, code);
}

function loadSavedData() {
  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  const savedRoom = localStorage.getItem(STORAGE_KEYS.room);
  if (savedName) {
    elements.playerName.value = savedName;
  }
  if (savedRoom) {
    elements.roomCode.value = savedRoom;
  }
}

function normalizeWord(word) {
  return word
    .toLowerCase()
    .trim()
    .replace(/[á]/g, "a")
    .replace(/[é]/g, "e")
    .replace(/[í]/g, "i")
    .replace(/[ó]/g, "o")
    .replace(/[úü]/g, "u");
}

function isVowel(char) {
  return "aeiouáéíóúü".includes(char);
}

function isStrongVowel(char) {
  return "aáeéoóíú".includes(char);
}

function isWeakVowel(char) {
  return "iuü".includes(char);
}

function shouldFormDiphthong(vowelA, vowelB) {
  if (isStrongVowel(vowelA) && isStrongVowel(vowelB)) {
    return false;
  }
  if (isWeakVowel(vowelA) && isWeakVowel(vowelB)) {
    return true;
  }
  if (isStrongVowel(vowelA) && isWeakVowel(vowelB)) {
    return true;
  }
  if (isWeakVowel(vowelA) && isStrongVowel(vowelB)) {
    return true;
  }
  return false;
}

function splitCluster(cluster) {
  if (cluster.length === 1) {
    return { left: "", right: cluster };
  }
  if (cluster.length === 2) {
    if (INSEPARABLE_CLUSTERS.has(cluster)) {
      return { left: "", right: cluster };
    }
    return { left: cluster[0], right: cluster.slice(1) };
  }
  if (cluster.length === 3) {
    const lastTwo = cluster.slice(1);
    if (INSEPARABLE_CLUSTERS.has(lastTwo)) {
      return { left: cluster[0], right: lastTwo };
    }
    return { left: cluster.slice(0, 2), right: cluster.slice(2) };
  }
  return { left: cluster.slice(0, 2), right: cluster.slice(2) };
}

function splitSyllables(word) {
  const clean = word.toLowerCase();
  const syllables = [];
  let index = 0;

  while (index < clean.length) {
    let syllable = "";
    while (index < clean.length && !isVowel(clean[index])) {
      syllable += clean[index];
      index += 1;
    }

    if (index >= clean.length) {
      if (syllable) {
        syllables.push(syllable);
      }
      break;
    }

    syllable += clean[index];
    if (
      index + 1 < clean.length &&
      isVowel(clean[index + 1]) &&
      shouldFormDiphthong(clean[index], clean[index + 1])
    ) {
      syllable += clean[index + 1];
      index += 2;
    } else {
      index += 1;
    }

    let cluster = "";
    let lookahead = index;
    while (lookahead < clean.length && !isVowel(clean[lookahead])) {
      cluster += clean[lookahead];
      lookahead += 1;
    }

    if (cluster.length === 0) {
      syllables.push(syllable);
      continue;
    }

    const { left } = splitCluster(cluster);
    syllable += left;
    syllables.push(syllable);
    index += left.length;
  }

  return syllables.filter(Boolean);
}

function classifyWord(word) {
  const syllables = splitSyllables(word);
  const syllableCount = syllables.length;
  const type = syllableCount % 2 === 0 ? "GOMA" : "MAGO";
  return { syllables, type, syllableCount };
}

function validateWord(word) {
  const trimmed = word.trim();
  if (trimmed.length < 2) {
    return { valid: false, reason: "Debe tener al menos 2 letras." };
  }
  const normalized = trimmed.toLowerCase();
  if (!/^[a-záéíóúüñ]+$/i.test(normalized)) {
    return { valid: false, reason: "Solo letras del español." };
  }
  const classification = classifyWord(normalized);
  return {
    valid: true,
    normalized: normalizeWord(normalized),
    syllables: classification.syllables,
    type: classification.type,
  };
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function setRoomCodeDisplay(code) {
  elements.copyRoom.textContent = code;
}

function renderPlayersList() {
  elements.playersList.innerHTML = "";
  const players = Object.values(state.players).sort((a, b) => a.joinedAt - b.joinedAt);
  players.forEach((player) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = player.name + (player.id === state.hostId ? " (Host)" : "");
    const status = document.createElement("span");
    status.textContent = player.ready ? "Listo" : "Esperando";
    item.append(label, status);
    elements.playersList.appendChild(item);
  });

  const allReady = players.length >= 2 && players.every((player) => player.ready);
  elements.startGame.disabled = !state.isHost || !allReady;
  elements.readyButton.textContent = state.players[state.playerId]?.ready ? "No estoy listo" : "Estoy listo";
}

function renderScores(targetElement) {
  targetElement.innerHTML = "";
  const players = Object.values(state.players).sort((a, b) => b.score - a.score);
  players.forEach((player) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${player.name}</span><strong>${player.score ?? 0}</strong>`;
    targetElement.appendChild(item);
  });
}

function renderResponses(targetElement, responses) {
  targetElement.innerHTML = "";
  responses.forEach((response) => {
    const item = document.createElement("li");
    const status = response.valid ? "✓" : "✗";
    const syllableText = response.syllables?.length ? response.syllables.join("-") : "";
    const typeText = response.type ? ` · ${response.type}` : "";
    const detail = response.valid ? `${syllableText}${typeText}` : response.reason || "Inválida";
    item.innerHTML = `<span>${response.name}: ${response.word}<small>${detail}</small></span><span>${status} ${response.time}s</span>`;
    targetElement.appendChild(item);
  });
}

function renderRoundWinner(winnerId) {
  if (winnerId && state.players[winnerId]) {
    const winner = state.players[winnerId];
    const word = state.responses.find((response) => response.playerId === winnerId)?.word || "";
    elements.roundWinner.textContent = `Ganó ${winner.name} con \"${word}\"`;
  } else {
    elements.roundWinner.textContent = "Sin ganador";
  }
}

function updateGameHeader() {
  elements.roundCounter.textContent = `${state.round}/${TOTAL_ROUNDS}`;
}

function updateRoundWord() {
  if (!state.roundWord) {
    return;
  }
  elements.baseWord.textContent = state.roundWord.word;
  elements.syllables.textContent = state.roundWord.syllables.join("-");
  elements.wordType.textContent = state.roundWord.type;
  elements.wordType.classList.remove("mago", "goma");
  elements.wordType.classList.add(state.roundWord.type.toLowerCase());
}

function updateTimer() {
  if (!state.roundStartTime) {
    return;
  }
  const remaining = Math.max(0, ROUND_DURATION_MS - (Date.now() - state.roundStartTime));
  elements.roundTimer.textContent = Math.ceil(remaining / 1000);
}

function startTimer() {
  stopTimer();
  updateTimer();
  state.timerInterval = setInterval(updateTimer, 200);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function stopRoundTimeout() {
  if (state.roundTimeout) {
    clearTimeout(state.roundTimeout);
    state.roundTimeout = null;
  }
}

function chooseBaseWord() {
  const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  const { syllables, type } = classifyWord(word);
  return { word, syllables, type };
}

function publishEvent(name, data) {
  if (!ablyChannel) {
    return;
  }
  ablyChannel.publish(name, { ...data, sender: state.playerId });
}

function connectToRoom(code, isHost) {
  state.roomCode = code;
  state.isHost = isHost;
  state.hostId = isHost ? state.playerId : "";
  saveRoomCode(code);

  ablyClient = new Ably.Realtime({ key: API_KEY, clientId: state.playerId });
  ablyChannel = ablyClient.channels.get(`jm:magogoma:${code}:events`);

  ablyChannel.attach((error) => {
    if (error) {
      logDebug(`Error al conectar: ${error.message}`);
      return;
    }
    ablyChannel.presence.enter({ name: state.playerName });
    if (!state.isHost) {
      publishEvent("request-state", {});
    }
    publishEvent("player-join", { id: state.playerId, name: state.playerName });
  });

  ablyChannel.presence.subscribe((presenceMessage) => {
    if (presenceMessage.action === "leave") {
      handlePlayerLeave(presenceMessage.clientId);
    }
  });

  ablyChannel.subscribe((message) => {
    handleEvent(message.name, message.data);
  });

  showScreen("room");
  setRoomCodeDisplay(code);
  renderPlayersList();
}

function handlePlayerLeave(playerId) {
  if (state.players[playerId]) {
    delete state.players[playerId];
  }
  if (playerId === state.hostId) {
    transferHost();
  }
  if (state.isHost) {
    syncState();
  } else {
    renderPlayersList();
  }
}

function transferHost() {
  const players = Object.values(state.players).sort((a, b) => a.joinedAt - b.joinedAt);
  if (players.length > 0) {
    state.hostId = players[0].id;
    state.isHost = state.hostId === state.playerId;
  } else {
    state.hostId = "";
    state.isHost = false;
  }
}

function handleEvent(name, data) {
  switch (name) {
    case "request-state":
      if (state.isHost) {
        syncState();
      }
      break;
    case "state-sync":
      if (!state.isHost) {
        applyState(data.state);
      }
      break;
    case "player-join":
      if (state.isHost) {
        if (!state.players[data.id]) {
          state.players[data.id] = {
            id: data.id,
            name: data.name,
            ready: false,
            score: 0,
            joinedAt: Date.now(),
          };
          syncState();
        }
      }
      break;
    case "player-ready":
      if (state.isHost && state.players[data.id]) {
        state.players[data.id].ready = data.ready;
        syncState();
      }
      break;
    case "round-start":
      startRoundLocal(data);
      break;
    case "word-submit":
      if (state.isHost) {
        handleWordSubmission(data);
      }
      break;
    case "response-update":
      if (!state.isHost) {
        if (!state.responses.find((response) => response.playerId === data.response.playerId)) {
          state.responses.push(data.response);
          if (state.phase === "game") {
            renderResponses(elements.responsesList, state.responses);
          }
        }
      }
      break;
    case "round-end":
      handleRoundEnd(data);
      break;
    case "next-round":
      if (state.isHost) {
        startNextRound();
      }
      break;
    case "game-over":
      handleGameOver(data);
      break;
    case "reset-game":
      if (!state.isHost) {
        resetToRoom();
      }
      break;
    default:
      break;
  }
}

function syncState() {
  const snapshot = {
    hostId: state.hostId,
    players: state.players,
    round: state.round,
    phase: state.phase,
    roundWord: state.roundWord,
    responses: state.responses,
    roundStartTime: state.roundStartTime,
    lastWinnerId: state.lastWinnerId,
  };
  publishEvent("state-sync", { state: snapshot });
  renderPlayersList();
}

function applyState(snapshot) {
  if (!snapshot) {
    return;
  }
  state.hostId = snapshot.hostId;
  state.players = snapshot.players || {};
  state.round = snapshot.round || 0;
  state.roundWord = snapshot.roundWord || null;
  state.responses = snapshot.responses || [];
  state.roundStartTime = snapshot.roundStartTime || 0;
  state.lastWinnerId = snapshot.lastWinnerId || null;
  state.isHost = state.hostId === state.playerId;

  if (snapshot.phase === "game") {
    showScreen("game");
    updateRoundWord();
    updateGameHeader();
    renderScores(elements.scoresList);
    renderResponses(elements.responsesList, state.responses);
    startTimer();
  } else if (snapshot.phase === "roundResult") {
    showScreen("roundResult");
    renderRoundWinner(state.lastWinnerId);
    renderScores(elements.roundScores);
    renderResponses(elements.roundResponses, state.responses);
  } else if (snapshot.phase === "gameOver") {
    showScreen("gameOver");
  } else {
    showScreen("room");
  }
  renderPlayersList();
}

function createPlayerEntry() {
  if (!state.players[state.playerId]) {
    state.players[state.playerId] = {
      id: state.playerId,
      name: state.playerName,
      ready: false,
      score: 0,
      joinedAt: Date.now(),
    };
  }
}

function toggleReady() {
  const current = state.players[state.playerId];
  if (!current) {
    return;
  }
  current.ready = !current.ready;
  if (state.isHost) {
    syncState();
  } else {
    publishEvent("player-ready", { id: state.playerId, ready: current.ready });
  }
  renderPlayersList();
}

function startGame() {
  if (!state.isHost) {
    return;
  }
  state.round = 0;
  Object.values(state.players).forEach((player) => {
    player.score = 0;
  });
  startNextRound();
}

function startNextRound() {
  if (state.round >= TOTAL_ROUNDS) {
    endGame();
    return;
  }
  state.round += 1;
  state.responses = [];
  state.hasSubmitted = false;
  state.roundWord = chooseBaseWord();
  state.roundStartTime = Date.now();

  publishEvent("round-start", {
    round: state.round,
    roundWord: state.roundWord,
    roundStartTime: state.roundStartTime,
  });

  startRoundLocal({
    round: state.round,
    roundWord: state.roundWord,
    roundStartTime: state.roundStartTime,
  });

  stopRoundTimeout();
  state.roundTimeout = setTimeout(() => {
    endRound(null);
  }, ROUND_DURATION_MS);
}

function startRoundLocal(data) {
  state.round = data.round;
  state.roundWord = data.roundWord;
  state.roundStartTime = data.roundStartTime;
  state.responses = [];
  state.hasSubmitted = false;

  showScreen("game");
  updateRoundWord();
  updateGameHeader();
  renderScores(elements.scoresList);
  renderResponses(elements.responsesList, state.responses);
  startTimer();
  elements.wordInput.value = "";
  elements.wordInput.focus();
}

function handleWordSubmission(data) {
  const { id, word, submittedAt } = data;
  if (state.phase !== "game") {
    return;
  }
  if (state.responses.find((response) => response.playerId === id)) {
    return;
  }
  const validation = validateWord(word);
  const response = {
    playerId: id,
    name: state.players[id]?.name ?? "Jugador",
    word,
    time: ((submittedAt - state.roundStartTime) / 1000).toFixed(1),
    valid: validation.valid,
    syllables: validation.syllables || [],
    type: validation.type || "",
    reason: validation.reason || "",
  };
  state.responses.push(response);
  renderResponses(elements.responsesList, state.responses);
  publishEvent("response-update", { response });

  if (validation.valid) {
    endRound(id);
  }
}

function endRound(winnerId) {
  stopRoundTimeout();
  stopTimer();
  if (winnerId && state.players[winnerId]) {
    state.players[winnerId].score += 1;
  }
  state.lastWinnerId = winnerId;
  publishEvent("round-end", {
    round: state.round,
    winnerId,
    responses: state.responses,
    players: state.players,
  });
  handleRoundEnd({
    round: state.round,
    winnerId,
    responses: state.responses,
    players: state.players,
  });
}

function handleRoundEnd(data) {
  stopRoundTimeout();
  stopTimer();
  state.responses = data.responses || [];
  state.lastWinnerId = data.winnerId;
  if (data.players) {
    state.players = data.players;
  }
  showScreen("roundResult");
  renderRoundWinner(data.winnerId);
  renderResponses(elements.roundResponses, state.responses);
  renderScores(elements.roundScores);
}

function endGame() {
  publishEvent("game-over", { players: state.players });
  handleGameOver({ players: state.players });
}

function handleGameOver(data) {
  stopTimer();
  stopRoundTimeout();
  if (data.players) {
    state.players = data.players;
  }
  showScreen("gameOver");
  const ranking = Object.values(state.players).sort((a, b) => b.score - a.score);
  const winner = ranking[0];
  elements.finalWinner.textContent = winner ? `Ganó ${winner.name} 🏆` : "Fin del juego";
  elements.finalScores.innerHTML = "";
  ranking.forEach((player) => {
    const item = document.createElement("li");
    item.textContent = `${player.name} - ${player.score} pts`;
    elements.finalScores.appendChild(item);
  });
}

function resetToRoom() {
  stopTimer();
  stopRoundTimeout();
  state.round = 0;
  state.responses = [];
  state.roundStartTime = 0;
  state.roundWord = null;
  state.lastWinnerId = null;
  state.hasSubmitted = false;
  Object.values(state.players).forEach((player) => {
    player.ready = false;
  });
  showScreen("room");
  renderPlayersList();
}

function leaveRoom() {
  if (ablyChannel) {
    ablyChannel.presence.leave();
    ablyChannel.detach();
  }
  if (ablyClient) {
    ablyClient.close();
  }
  ablyClient = null;
  ablyChannel = null;
  state.roomCode = "";
  state.isHost = false;
  state.hostId = "";
  state.players = {};
  state.round = 0;
  showScreen("lobby");
}

function submitWord() {
  if (state.phase !== "game" || state.hasSubmitted) {
    return;
  }
  const word = elements.wordInput.value.trim();
  if (!word) {
    return;
  }
  state.hasSubmitted = true;
  elements.wordInput.value = "";
  publishEvent("word-submit", {
    id: state.playerId,
    word,
    submittedAt: Date.now(),
  });
}

function copyRoomLink() {
  const link = `${window.location.origin}${window.location.pathname}?room=${state.roomCode}`;
  navigator.clipboard.writeText(link).then(() => {
    elements.copyRoom.textContent = `${state.roomCode} ✓`;
    setTimeout(() => {
      elements.copyRoom.textContent = state.roomCode;
    }, 1500);
  });
}

function setupDebug() {
  state.debug = new URLSearchParams(window.location.search).has("debug");
  elements.debugToggle.hidden = !state.debug;
  if (state.debug) {
    elements.debugPanel.hidden = false;
  }
}

function bindEvents() {
  elements.createRoom.addEventListener("click", () => {
    const name = elements.playerName.value.trim();
    if (!name) {
      return;
    }
    state.playerName = name;
    savePlayerName(name);
    createPlayerEntry();
    connectToRoom(generateRoomCode(), true);
  });

  elements.joinRoom.addEventListener("click", () => {
    const name = elements.playerName.value.trim();
    const code = elements.roomCode.value.trim().toUpperCase();
    if (!name || !code) {
      return;
    }
    state.playerName = name;
    savePlayerName(name);
    createPlayerEntry();
    connectToRoom(code, false);
  });

  elements.readyButton.addEventListener("click", toggleReady);
  elements.startGame.addEventListener("click", startGame);
  elements.leaveRoom.addEventListener("click", leaveRoom);
  elements.sendWord.addEventListener("click", submitWord);
  elements.wordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitWord();
    }
  });
  elements.copyRoom.addEventListener("click", copyRoomLink);
  elements.nextRound.addEventListener("click", () => publishEvent("next-round", {}));
  elements.playAgain.addEventListener("click", () => {
    if (state.isHost) {
      resetToRoom();
      syncState();
      publishEvent("reset-game", {});
    }
  });
  elements.backLobby.addEventListener("click", leaveRoom);
  elements.debugToggle.addEventListener("click", () => {
    elements.debugPanel.hidden = !elements.debugPanel.hidden;
  });
  elements.debugClose.addEventListener("click", () => {
    elements.debugPanel.hidden = true;
  });
}

function init() {
  setupDebug();
  loadSavedData();
  bindEvents();

  const params = new URLSearchParams(window.location.search);
  const code = params.get("room");
  if (code) {
    elements.roomCode.value = code.toUpperCase();
  }
}

init();
