const app = document.getElementById("app");

const RIGHT_INPUTS = [
  { id: "leftShift", label: "L Shift", code: "ShiftLeft" },
  { id: "rightShift", label: "R Shift", code: "ShiftRight" },
  { id: "mouseLeft", label: "Mouse L", button: 0 },
  { id: "mouseRight", label: "Mouse R", button: 2 },
];

const LEFT_INPUTS = [
  { id: "space", label: "SPACE", code: "Space" },
  { id: "mouseMiddle", label: "Mouse Middle", button: 1 },
];

const ALL_INPUTS = [...RIGHT_INPUTS, ...LEFT_INPUTS];

const STORAGE_KEY = "moveThinkCustomPresetsV1";
const CUSTOM_IDS = ["custom1", "custom2", "custom3"];

const SYSTEM_PRESETS = {
  easy: {
    label: "Easy",
    baseInterval: 1800,
    jitter: 300,
    responseWindow: 1800,
    sequenceLength: 2,
    redRate: 25,
    poisonRate: 0,
    rounds: 5,
  },
  normal: {
    label: "Normal",
    baseInterval: 1500,
    jitter: 450,
    responseWindow: 1500,
    sequenceLength: 3,
    redRate: 30,
    poisonRate: 10,
    rounds: 6,
  },
  hard: {
    label: "Hard",
    baseInterval: 1100,
    jitter: 550,
    responseWindow: 1100,
    sequenceLength: 4,
    redRate: 35,
    poisonRate: 30,
    rounds: 8,
  },
};

const CUSTOM_LABELS = {
  custom1: "Custom 1",
  custom2: "Custom 2",
  custom3: "Custom 3",
};

const state = {
  screen: "config",
  selectedPresetId: "normal",
  settings: { ...SYSTEM_PRESETS.normal },
  customPresets: loadCustomPresets(),
  soundEnabled: true,
  soundVolume: 0.28,
  audioContext: null,
  pointerLockReleaseExpected: false,
  phase: "idle",
  round: 1,
  score: 0,
  combo: 0,
  boardPath: [],
  nextRevealIndex: 0,
  roundMemoryStartIndex: 0,
  rightOnlyProgress: 0,
  recallIndex: 0,
  boardPosition: -1,
  revealedCell: -1,
  playerJumping: false,
  completedCells: new Set(),
  currentStimulus: null,
  stimulusStartedAt: 0,
  timerStartedAt: 0,
  timerDuration: 0,
  timerPercent: 0,
  message: "Pick a preset, adjust the current values, then start.",
  messageTone: "",
  trials: [],
  recallAttempts: [],
  timers: new Set(),
  raf: null,
};

function cleanPreset(preset) {
  return {
    label: preset.label,
    baseInterval: clampNumber(preset.baseInterval, 400, 4000, 1500),
    jitter: clampNumber(preset.jitter, 0, 2000, 450),
    responseWindow: clampNumber(preset.responseWindow, 400, 4000, 1500),
    sequenceLength: clampNumber(preset.sequenceLength, 0, 8, 3),
    redRate: clampNumber(preset.redRate, 0, 80, 30),
    poisonRate: clampNumber(preset.poisonRate, 0, 80, 10),
    rounds: clampNumber(preset.rounds, 1, 20, 6),
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function loadCustomPresets() {
  const defaults = {
    custom1: { ...SYSTEM_PRESETS.normal, label: CUSTOM_LABELS.custom1 },
    custom2: { ...SYSTEM_PRESETS.normal, label: CUSTOM_LABELS.custom2 },
    custom3: { ...SYSTEM_PRESETS.normal, label: CUSTOM_LABELS.custom3 },
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return CUSTOM_IDS.reduce((presets, id) => {
      presets[id] = cleanPreset({ ...defaults[id], ...(parsed[id] || {}), label: CUSTOM_LABELS[id] });
      return presets;
    }, {});
  } catch {
    return defaults;
  }
}

function saveCustomPresets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.customPresets));
}

function ensureAudio() {
  if (!state.soundEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!state.audioContext) state.audioContext = new AudioContextClass();
  if (state.audioContext.state === "suspended") state.audioContext.resume();
  return state.audioContext;
}

function playTone(frequency, startAt, duration, type = "sine", volume = 1) {
  const context = ensureAudio();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, state.soundVolume * volume), startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playSound(kind) {
  if (!state.soundEnabled) return;
  const context = ensureAudio();
  if (!context) return;
  const now = context.currentTime;
  if (kind === "cue") {
    playTone(660, now, 0.07, "triangle", 0.42);
  } else if (kind === "reveal") {
    playTone(784, now, 0.08, "sine", 0.55);
    playTone(988, now + 0.075, 0.09, "sine", 0.42);
  } else if (kind === "success") {
    playTone(523, now, 0.07, "sine", 0.5);
    playTone(659, now + 0.065, 0.08, "sine", 0.42);
  } else if (kind === "error") {
    playTone(180, now, 0.16, "sawtooth", 0.38);
  } else if (kind === "round") {
    playTone(523, now, 0.08, "triangle", 0.45);
    playTone(659, now + 0.08, 0.08, "triangle", 0.42);
    playTone(784, now + 0.16, 0.12, "triangle", 0.4);
  }
}

function allPresets() {
  return { ...SYSTEM_PRESETS, ...state.customPresets };
}

function clearTimers() {
  for (const timer of state.timers) clearTimeout(timer);
  state.timers.clear();
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
}

function requestGamePointerLock() {
  const target = document.body;
  if (!target.requestPointerLock) return;
  try {
    target.requestPointerLock();
  } catch {
    setMessage("Pointer lock is unavailable in this browser.", "bad");
  }
}

function requestGameFullscreen() {
  const target = document.documentElement;
  if (document.fullscreenElement || !target.requestFullscreen) return;
  try {
    target.requestFullscreen();
  } catch {
    setMessage("Fullscreen is unavailable in this browser.", "bad");
  }
}

function releaseGamePointerLock() {
  if (document.pointerLockElement) {
    state.pointerLockReleaseExpected = true;
    document.exitPointerLock();
  }
}

function releaseGameFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function exitGame() {
  if (state.screen !== "game") return;
  clearTimers();
  state.screen = "config";
  state.phase = "idle";
  state.currentStimulus = null;
  setMessage("Game exited. Adjust settings or start again.", "");
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function setTimer(callback, delay) {
  const timer = setTimeout(() => {
    state.timers.delete(timer);
    callback();
  }, delay);
  state.timers.add(timer);
  return timer;
}

function randomRightInput() {
  return RIGHT_INPUTS[Math.floor(Math.random() * RIGHT_INPUTS.length)].id;
}

function randomLeftInput() {
  return LEFT_INPUTS[Math.floor(Math.random() * LEFT_INPUTS.length)].id;
}

function randomDelay() {
  const offset = Math.round(Math.random() * state.settings.jitter * 2 - state.settings.jitter);
  return Math.max(250, state.settings.baseInterval + offset);
}

function invertInput(input) {
  if (input === "leftShift") return "rightShift";
  if (input === "rightShift") return "leftShift";
  if (input === "mouseLeft") return "mouseRight";
  if (input === "mouseRight") return "mouseLeft";
  return input;
}

function inputLabel(id) {
  return ALL_INPUTS.find((item) => item.id === id)?.label || "";
}

function inputVisual(id) {
  if (id === "mouseLeft" || id === "mouseRight" || id === "mouseMiddle") {
    const side = id === "mouseLeft" ? "left" : id === "mouseRight" ? "right" : "middle";
    return `
      <span class="input-visual mouse-visual mouse-${side}" role="img" aria-label="${side} mouse button">
        <span class="mouse-button mouse-button-left"></span>
        <span class="mouse-button mouse-button-right"></span>
        <span class="mouse-wheel"></span>
      </span>
    `;
  }
  return `<span class="input-visual key-visual ${id === "space" ? "space-key" : ""}">${inputLabel(id)}</span>`;
}

function isRightInput(input) {
  return RIGHT_INPUTS.some((item) => item.id === input);
}

function getEffectiveTarget(stimulus) {
  if (!stimulus || stimulus.light === "red") return null;
  return stimulus.poisoned ? invertInput(stimulus.displayKey) : stimulus.displayKey;
}

function setMessage(message, tone = "") {
  state.message = message;
  state.messageTone = tone;
}

function selectPreset(presetId) {
  const preset = allPresets()[presetId];
  if (!preset) return;
  state.selectedPresetId = presetId;
  state.settings = cleanPreset(preset);
  render();
}

function updateSetting(key, value) {
  state.settings[key] = Number(value);
}

function updateSoundSetting(key, value) {
  if (key === "soundEnabled") state.soundEnabled = value;
  if (key === "soundVolume") state.soundVolume = Number(value);
}

function saveCurrentPreset() {
  const targetId = CUSTOM_IDS.includes(state.selectedPresetId) ? state.selectedPresetId : "custom1";
  state.customPresets[targetId] = cleanPreset({ ...state.settings, label: CUSTOM_LABELS[targetId] });
  state.selectedPresetId = targetId;
  state.settings = { ...state.customPresets[targetId] };
  saveCustomPresets();
  render();
}

function startGame() {
  clearTimers();
  ensureAudio();
  requestGameFullscreen();
  requestGamePointerLock();
  state.settings = cleanPreset(state.settings);
  state.screen = "game";
  state.phase = "waiting";
  state.round = 1;
  state.score = 0;
  state.combo = 0;
  state.boardPath = generateBoardPath(state.settings.rounds * state.settings.sequenceLength);
  state.nextRevealIndex = 0;
  state.roundMemoryStartIndex = 0;
  state.rightOnlyProgress = 0;
  state.recallIndex = 0;
  state.boardPosition = -1;
  state.revealedCell = -1;
  state.playerJumping = false;
  state.completedCells = new Set();
  state.currentStimulus = null;
  state.trials = [];
  state.recallAttempts = [];
  setMessage("Return to start and wait for the right-side cue.", "");
  render();
  scheduleStimulus();
}

function generateBoardPath(length) {
  return Array.from({ length }, () => randomLeftInput());
}

function scheduleStimulus() {
  state.phase = "waiting";
  state.currentStimulus = null;
  state.timerPercent = 0;
  render();
  setTimer(showStimulus, randomDelay());
}

function showStimulus() {
  const light = Math.random() * 100 < state.settings.redRate ? "red" : "green";
  const displayKey = randomRightInput();
  const poisoned = Math.random() * 100 < state.settings.poisonRate;
  state.phase = "rightStimulus";
  state.currentStimulus = {
    light,
    displayKey,
    poisoned,
    responded: false,
  };
  state.stimulusStartedAt = performance.now();
  startVisualTimer(state.settings.responseWindow);
  playSound("cue");
  setMessage(
    light === "green" ? "GO: press the target, then return to start." : "NO-GO: stay still and do not press.",
    light === "green" ? "good" : "bad",
  );
  render();
  setTimer(() => {
    if (state.phase !== "rightStimulus" || !state.currentStimulus || state.currentStimulus.responded) return;
    if (state.currentStimulus.light === "red") {
      finishRightTrial({
        input: null,
        result: "nogoSuccess",
        success: true,
        reactionTime: state.settings.responseWindow,
      });
    } else {
      finishRightTrial({
        input: null,
        result: "miss",
        success: false,
        reactionTime: state.settings.responseWindow,
      });
    }
  }, state.settings.responseWindow);
}

function startVisualTimer(duration) {
  state.timerStartedAt = performance.now();
  state.timerDuration = duration;
  function tick() {
    if (state.phase !== "rightStimulus") return;
    const elapsed = performance.now() - state.timerStartedAt;
    state.timerPercent = Math.min(100, (elapsed / duration) * 100);
    updateTimerDom();
    state.raf = requestAnimationFrame(tick);
  }
  tick();
}

function updateTimerDom() {
  const fill = document.querySelector(".timer-fill");
  if (fill) fill.style.width = `${state.timerPercent}%`;
}

function finishRightTrial({ input, result, success, reactionTime }) {
  const stimulus = state.currentStimulus;
  if (!stimulus || stimulus.responded) return;
  stimulus.responded = true;
  state.trials.push({
    round: state.round,
    boardIndex: state.nextRevealIndex,
    light: stimulus.light,
    displayKey: stimulus.displayKey,
    effectiveKey: getEffectiveTarget(stimulus),
    poisoned: stimulus.poisoned,
    input,
    reactionTime: Math.round(reactionTime),
    result,
    revealedBoardCell: success,
  });

  if (success) {
    state.score += stimulus.light === "red" ? 120 : 100;
    state.combo += 1;
    advanceAfterRightSuccess();
  } else {
    playSound("error");
    state.combo = 0;
    setMessage(rightErrorMessage(result, stimulus), "bad");
    state.phase = "rightFeedback";
    render();
    setTimer(scheduleStimulus, 650);
  }
}

function isRightOnlyMode() {
  return state.settings.sequenceLength === 0;
}

function advanceAfterRightSuccess() {
  if (!isRightOnlyMode()) {
    revealNextBoardCell();
    return;
  }
  state.rightOnlyProgress += 1;
  state.phase = "rightFeedback";
  playSound("success");
  setMessage("Right-side success. No memory board in this mode.", "good");
  render();
  if (state.rightOnlyProgress >= state.settings.rounds) {
    setTimer(finishSession, 650);
  } else {
    setTimer(scheduleStimulus, 650);
  }
}

function rightErrorMessage(result, stimulus) {
  if (result === "wrongGo") {
    return "Wrong target. No board cell revealed.";
  }
  if (result === "falseAlarm") return "NO-GO error. No board cell revealed.";
  if (result === "miss") return "Timeout. No board cell revealed.";
  return "Error. This step does not advance.";
}

function revealNextBoardCell() {
  const key = state.boardPath[state.nextRevealIndex];
  state.revealedCell = state.nextRevealIndex;
  state.nextRevealIndex += 1;
  state.phase = "revealMemoryCell";
  playSound("reveal");
  setMessage("Remember the lit cell. It will be covered again.", "good");
  render();
  setTimer(() => {
    state.revealedCell = -1;
    const revealedThisRound = state.nextRevealIndex - state.roundMemoryStartIndex;
    if (revealedThisRound >= state.settings.sequenceLength) {
      startRecall();
    } else {
      scheduleStimulus();
    }
  }, 850);
}

function startRecall() {
  state.phase = "memoryRecall";
  state.recallIndex = 0;
  setMessage("Memory test: the current cell is highlighted, but the key stays hidden.", "");
  render();
}

function handleGameInput(input) {
  if (state.screen !== "game") return;
  if (state.phase === "rightStimulus") {
    if (!isRightInput(input)) return;
    handleRightInput(input);
    return;
  }
  if (state.phase === "memoryRecall") handleRecallInput(input);
}

function handleRightInput(input) {
  const stimulus = state.currentStimulus;
  if (!stimulus || stimulus.responded) return;
  const reactionTime = performance.now() - state.stimulusStartedAt;
  if (stimulus.light === "red") {
    finishRightTrial({ input, result: "falseAlarm", success: false, reactionTime });
    return;
  }
  const target = getEffectiveTarget(stimulus);
  finishRightTrial({
    input,
    result: input === target ? "goSuccess" : "wrongGo",
    success: input === target,
    reactionTime,
  });
}

function handleRecallInput(input) {
  const boardIndex = state.roundMemoryStartIndex + state.recallIndex;
  const expected = state.boardPath[boardIndex];
  const correct = input === expected;
  state.recallAttempts.push({
    round: state.round,
    boardIndex,
    expected,
    input,
    correct,
    time: Date.now(),
  });
  if (!correct) {
    state.combo = 0;
    playSound("error");
    setMessage("Wrong memory input. Stay on this cell and try again.", "bad");
    render();
    return;
  }

  state.score += 140;
  state.combo += 1;
  playSound("success");
  state.boardPosition = boardIndex;
  triggerPlayerJump();
  state.completedCells.add(boardIndex);
  state.recallIndex += 1;
  if (state.recallIndex >= state.settings.sequenceLength) {
    playSound("round");
    setMessage("Round complete. Return to start for the next round.", "good");
    state.phase = "roundComplete";
    render();
    setTimer(nextRound, 900);
  } else {
    setMessage(`Correct. Continue to cell ${state.recallIndex + 1} of this round.`, "good");
    render();
  }
}

function nextRound() {
  if (state.round >= state.settings.rounds) {
    finishSession();
    return;
  }
  state.round += 1;
  state.roundMemoryStartIndex = state.nextRevealIndex;
  state.recallIndex = 0;
  state.revealedCell = -1;
  scheduleStimulus();
}

function triggerPlayerJump() {
  state.playerJumping = true;
  setTimer(() => {
    state.playerJumping = false;
    if (state.screen === "game") render();
  }, 360);
}

function finishSession() {
  clearTimers();
  state.screen = "summary";
  state.phase = "sessionComplete";
  setMessage("Training complete.", "");
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function restart() {
  state.screen = "config";
  state.phase = "idle";
  clearTimers();
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function getMetrics() {
  const goTrials = state.trials.filter((trial) => trial.light === "green");
  const goHits = goTrials.filter((trial) => trial.result === "goSuccess").length;
  const noGoErrors = state.trials.filter((trial) => trial.result === "falseAlarm").length;
  const goReactionTimes = goTrials
    .filter((trial) => trial.result === "goSuccess")
    .map((trial) => trial.reactionTime);
  const avgRt =
    goReactionTimes.length === 0
      ? 0
      : Math.round(goReactionTimes.reduce((sum, value) => sum + value, 0) / goReactionTimes.length);
  const recallCorrect = state.recallAttempts.filter((attempt) => attempt.correct).length;
  const recallAccuracy =
    state.recallAttempts.length === 0
      ? 0
      : Math.round((recallCorrect / state.recallAttempts.length) * 100);
  const poisonErrors = state.trials.filter(
    (trial) => trial.poisoned && ["wrongGo", "falseAlarm", "miss"].includes(trial.result),
  ).length;
  const hitRate = goTrials.length === 0 ? 0 : Math.round((goHits / goTrials.length) * 100);
  return { hitRate, noGoErrors, avgRt, recallAccuracy, poisonErrors };
}

function renderConfig() {
  const s = state.settings;
  const saveLabel = CUSTOM_IDS.includes(state.selectedPresetId)
    ? `Save ${CUSTOM_LABELS[state.selectedPresetId]}`
    : "Save as Custom 1";
  app.innerHTML = `
    <section class="screen config-screen">
      <div class="config-shell">
        <div class="title-row">
          <div>
            <h1>Move & Think</h1>
            <p class="subtitle">Preset values fill the current editor. You can change any number and save three custom presets.</p>
          </div>
        </div>

        <div class="config-card preset-card">
          <div class="preset-card-header">
            <div>
              <label>Presets</label>
              <p class="card-help">Click a preset to load values into the editor below. Editing numbers never changes the defaults unless you save.</p>
            </div>
            <button id="savePresetBtn">${saveLabel}</button>
          </div>
          <div class="preset-row">
            ${Object.entries(allPresets())
              .map(
                ([id, preset]) =>
                  `<button type="button" class="${state.selectedPresetId === id ? "active" : ""}" data-preset="${id}">${preset.label}</button>`,
              )
              .join("")}
          </div>
        </div>

        <div class="current-preset">
          <div class="panel-header">
            <h2>Current Preset</h2>
            <span>${allPresets()[state.selectedPresetId]?.label || "Custom"}</span>
          </div>
          <div class="config-grid">
            ${numberField("baseInterval", "Cue interval ms", s.baseInterval, 400, 4000, 50)}
            ${numberField("jitter", "Random jitter ms", s.jitter, 0, 2000, 50)}
            ${numberField("responseWindow", "Response window ms", s.responseWindow, 400, 4000, 50)}
            ${numberField("sequenceLength", "Memory sequence", s.sequenceLength, 0, 8, 1)}
            ${numberField("redRate", "Red light rate %", s.redRate, 0, 80, 5)}
            ${numberField("poisonRate", "Poison reversal %", s.poisonRate, 0, 80, 5)}
            ${numberField("rounds", "Rounds", s.rounds, 1, 20, 1)}
          </div>
        </div>

        <div class="config-card sound-card">
          <label>Sound</label>
          <div class="sound-controls">
            <button type="button" class="${state.soundEnabled ? "active" : ""}" id="soundToggle">${state.soundEnabled ? "On" : "Off"}</button>
            <input id="soundVolume" type="range" min="0" max="1" step="0.05" value="${state.soundVolume}" />
            <button type="button" id="soundTestBtn">Test</button>
          </div>
        </div>

        <div class="actions">
          <p class="safety">Make sure the floor is clear and the mouse is fixed away from the computer before starting.</p>
          <div class="action-buttons">
            <button class="primary" id="startBtn">Start Training</button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => selectPreset(button.dataset.preset));
  });
  document.querySelectorAll("[data-setting]").forEach((input) => {
    input.addEventListener("input", () => updateSetting(input.dataset.setting, input.value));
  });
  document.getElementById("soundToggle").addEventListener("click", () => {
    updateSoundSetting("soundEnabled", !state.soundEnabled);
    render();
  });
  document.getElementById("soundVolume").addEventListener("input", (event) => {
    updateSoundSetting("soundVolume", event.target.value);
  });
  document.getElementById("soundTestBtn").addEventListener("click", () => playSound("reveal"));
  document.getElementById("savePresetBtn").addEventListener("click", saveCurrentPreset);
  document.getElementById("startBtn").addEventListener("click", startGame);
}

function numberField(key, label, value, min, max, step) {
  return `
    <div class="config-card field">
      <label for="${key}">${label}</label>
      <input id="${key}" data-setting="${key}" type="number" inputmode="numeric" min="${min}" max="${max}" step="${step}" value="${value}" />
    </div>
  `;
}

function renderGame() {
  const poisoned = state.currentStimulus?.poisoned && state.phase === "rightStimulus";
  app.innerHTML = `
    <section class="screen game-screen ${poisoned ? "poisoned" : ""}">
      ${renderHud()}
      <div class="playfield">
        ${renderBoard()}
        ${renderStimulus()}
      </div>
    </section>
  `;
  updateTimerDom();
}

function renderHud() {
  const revealedThisRound = isRightOnlyMode()
    ? state.rightOnlyProgress
    : Math.min(state.settings.sequenceLength, state.nextRevealIndex - state.roundMemoryStartIndex);
  return `
    <header class="hud">
      ${hudItem("Round", isRightOnlyMode() ? `${state.rightOnlyProgress}/${state.settings.rounds}` : `${state.round}/${state.settings.rounds}`)}
      ${hudItem("Score", state.score)}
      ${hudItem("Combo", state.combo)}
      ${hudItem(isRightOnlyMode() ? "Right" : "Memory", isRightOnlyMode() ? `${revealedThisRound}/${state.settings.rounds}` : `${revealedThisRound}/${state.settings.sequenceLength}`)}
      ${hudItem("Phase", phaseLabel())}
      ${hudItem("Poison", state.currentStimulus?.poisoned && state.phase === "rightStimulus" ? "Reverse" : "Off")}
    </header>
  `;
}

function hudItem(label, value) {
  return `
    <div class="hud-item">
      <div class="hud-label">${label}</div>
      <div class="hud-value">${value}</div>
    </div>
  `;
}

function phaseLabel() {
  const labels = {
    waiting: "Return",
    rightStimulus: "Right",
    rightFeedback: "Feedback",
    revealMemoryCell: "Reveal",
    memoryRecall: "Memory",
    roundComplete: "Done",
  };
  return labels[state.phase] || "Ready";
}

function renderBoard() {
  if (isRightOnlyMode()) {
    return `
      <section class="board-panel pixel-board-panel">
        <div class="panel-header">
          <h2>Right-Side Mode</h2>
          <span>No memory board</span>
        </div>
        <div class="pixel-stage right-only-stage">
          <div class="pixel-cloud cloud-a"></div>
          <div class="pixel-cloud cloud-b"></div>
          <div class="right-only-card">
            <strong>GO / NO-GO ONLY</strong>
            <span>Complete ${state.settings.rounds} right-side successes.</span>
          </div>
          <div class="pixel-ground"></div>
        </div>
        <div class="message-bar ${state.messageTone}">${state.message}</div>
      </section>
    `;
  }
  const visibleCells = getVisibleBoardCells();
  const cells = visibleCells.map(({ key, index }) => {
    const isRevealed = state.revealedCell === index;
    const currentRecallIndex = state.roundMemoryStartIndex + state.recallIndex;
    const isCurrent = state.phase === "memoryRecall" && currentRecallIndex === index;
    const isCompleted = state.completedCells.has(index);
    const isFuture = index >= state.nextRevealIndex;
    const showKey = isRevealed;
    return `
      <div class="cell pixel-brick ${isRevealed ? "revealed" : ""} ${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""} ${isFuture ? "future" : ""}">
        <div class="cell-index">${index + 1}</div>
        <div class="cell-key">${showKey ? inputVisual(key) : isCompleted ? '<span class="pixel-coin"></span>' : "?"}</div>
        ${state.boardPosition === index ? `<div class="player ${state.playerJumping ? "jump" : ""}"><span></span></div>` : ""}
      </div>
    `;
  }).join("");
  return `
    <section class="board-panel pixel-board-panel">
      <div class="panel-header">
        <h2>Pixel Run</h2>
        <span>${Math.max(0, state.boardPosition + 1)}/${state.boardPath.length} steps</span>
      </div>
      <div class="pixel-stage">
        <div class="pixel-cloud cloud-a"></div>
        <div class="pixel-cloud cloud-b"></div>
        <div class="board">${cells}</div>
        <div class="pixel-ground"></div>
      </div>
      <div class="message-bar ${state.messageTone}">${state.message}</div>
    </section>
  `;
}

function getVisibleBoardCells() {
  const visibleCount = 9;
  if (state.boardPath.length <= visibleCount) {
    return state.boardPath.map((key, index) => ({ key, index }));
  }
  const currentRecallIndex = state.roundMemoryStartIndex + state.recallIndex;
  let focusIndex = Math.max(0, state.boardPosition);
  if (state.revealedCell >= 0) focusIndex = state.revealedCell;
  else if (state.phase === "memoryRecall") focusIndex = currentRecallIndex;
  else if (state.boardPosition < 0) focusIndex = state.nextRevealIndex;

  let start = Math.max(0, focusIndex - 2);
  start = Math.min(start, state.boardPath.length - visibleCount);
  return state.boardPath.slice(start, start + visibleCount).map((key, offset) => ({
    key,
    index: start + offset,
  }));
}

function renderStimulus() {
  const stimulus = state.currentStimulus;
  const isActive = state.phase === "rightStimulus";
  const light = isActive ? stimulus.light : "green";
  const targetContent = getTargetContent();
  return `
    <section class="stimulus-panel">
      <div class="panel-header">
        <h2>Go / No-Go</h2>
        <span>${isActive ? "Respond before the bar fills" : "Waiting for next cue"}</span>
      </div>
      <div class="stimulus-main">
        <div class="traffic ${light === "red" ? "red" : ""}">${isActive ? (light === "red" ? "NO-GO" : "GO") : "READY"}</div>
        <div class="target-key ${isActive ? "" : "wait"}">${targetContent}</div>
        <div class="poison-note">${isActive && stimulus.poisoned ? "Purple border: left/right inputs are reversed" : ""}</div>
        <div class="timer"><div class="timer-fill" style="width:${state.timerPercent}%"></div></div>
      </div>
      <div class="controls-strip">
        ${RIGHT_INPUTS.map(
          (input) =>
            `<div class="key-chip ${isActive && stimulus.displayKey === input.id ? "active" : ""}">${inputVisual(input.id)}</div>`,
        ).join("")}
      </div>
    </section>
  `;
}

function getTargetContent() {
  if (state.phase === "waiting") return "Return";
  if (state.phase === "rightFeedback") return "No reveal";
  if (state.phase === "revealMemoryCell") return "Remember";
  if (state.phase === "memoryRecall") return "Hidden";
  if (state.phase === "roundComplete") return "Done";
  if (!state.currentStimulus) return "Ready";
  return inputVisual(state.currentStimulus.displayKey);
}

function renderSummary() {
  const metrics = getMetrics();
  app.innerHTML = `
    <section class="screen summary-screen">
      <div class="summary-shell">
        <div>
          <h1>Training Complete</h1>
          <p class="subtitle">Right-side errors did not reveal cells. Memory errors did not move the player.</p>
        </div>
        <div class="summary-grid">
          ${metricCard("Hit rate", `${metrics.hitRate}%`)}
          ${metricCard("No-go errors", metrics.noGoErrors)}
          ${metricCard("Avg RT", `${metrics.avgRt}ms`)}
          ${metricCard("Memory accuracy", `${metrics.recallAccuracy}%`)}
          ${metricCard("Reverse errors", metrics.poisonErrors)}
        </div>
        <div class="actions">
          <p class="safety">Final score ${state.score}. Adjust or save presets before another run.</p>
          <button class="primary" id="restartBtn">Back to Settings</button>
        </div>
      </div>
    </section>
  `;
  document.getElementById("restartBtn").addEventListener("click", restart);
}

function metricCard(label, value) {
  return `
    <div class="metric-card">
      <div class="hud-label">${label}</div>
      <div class="metric-value">${value}</div>
    </div>
  `;
}

function render() {
  if (state.screen === "config") renderConfig();
  if (state.screen === "game") renderGame();
  if (state.screen === "summary") renderSummary();
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Escape" && state.screen === "game") {
    event.preventDefault();
    exitGame();
    return;
  }
  const match = ALL_INPUTS.find((input) => input.code === event.code);
  if (!match) return;
  event.preventDefault();
  handleGameInput(match.id);
});

window.addEventListener("mousedown", (event) => {
  if (state.screen !== "game") return;
  const match = ALL_INPUTS.find((input) => input.button === event.button);
  if (!match) return;
  event.preventDefault();
  handleGameInput(match.id);
});

window.addEventListener("auxclick", (event) => {
  if (state.screen === "game" && event.button === 1) event.preventDefault();
});

window.addEventListener("contextmenu", (event) => {
  if (state.screen === "game") event.preventDefault();
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement) return;
  if (state.pointerLockReleaseExpected) {
    state.pointerLockReleaseExpected = false;
    return;
  }
  if (state.screen === "game") exitGame();
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && state.screen === "game") exitGame();
});

render();
