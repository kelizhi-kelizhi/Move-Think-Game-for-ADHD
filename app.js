const app = document.getElementById("app");

const INPUT_OPTIONS = [
  { id: "leftShift", label: "L Shift", code: "ShiftLeft", side: "left", pair: "rightShift" },
  { id: "rightShift", label: "R Shift", code: "ShiftRight", side: "right", pair: "leftShift" },
  { id: "leftCtrl", label: "L Ctrl", code: "ControlLeft", side: "left", pair: "rightCtrl" },
  { id: "rightCtrl", label: "R Ctrl", code: "ControlRight", side: "right", pair: "leftCtrl" },
  { id: "leftAlt", label: "L Alt", code: "AltLeft", side: "left", pair: "rightAlt" },
  { id: "rightAlt", label: "R Alt", code: "AltRight", side: "right", pair: "leftAlt" },
  { id: "mouseLeft", label: "Mouse L", button: 0, side: "left", pair: "mouseRight" },
  { id: "mouseRight", label: "Mouse R", button: 2, side: "right", pair: "mouseLeft" },
];

const DEFAULT_INPUT_GROUPS = {
  groupAKey1: "leftShift",
  groupAKey2: "rightShift",
  groupBKey1: "mouseLeft",
  groupBKey2: "mouseRight",
};

const ROUTE_PAGE_SIZE = 42;
const MAX_PATH_LENGTH = 420;
const STORAGE_KEY = "moveThinkCustomPresetsV21";
const CUSTOM_IDS = ["custom1", "custom2", "custom3"];

const SYSTEM_PRESETS = {
  easy: {
    label: "Easy",
    baseInterval: 1800,
    jitter: 300,
    responseWindow: 1800,
    pathLength: 18,
    redRate: 25,
    reverseZones: 1,
    nbackZones: 1,
    abAlternation: 0,
    ...DEFAULT_INPUT_GROUPS,
  },
  normal: {
    label: "Normal",
    baseInterval: 1500,
    jitter: 450,
    responseWindow: 1500,
    pathLength: 24,
    redRate: 30,
    reverseZones: 2,
    nbackZones: 1,
    abAlternation: 0,
    ...DEFAULT_INPUT_GROUPS,
  },
  hard: {
    label: "Hard",
    baseInterval: 1100,
    jitter: 550,
    responseWindow: 1100,
    pathLength: 30,
    redRate: 35,
    reverseZones: 2,
    nbackZones: 2,
    abAlternation: 0,
    ...DEFAULT_INPUT_GROUPS,
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
  score: 0,
  combo: 0,
  boardCells: [],
  boardPosition: 0,
  previousBoardPosition: 0,
  playerStepping: false,
  stepDirection: "",
  visitedCells: new Set(),
  activeHand: "left",
  currentStimulus: null,
  stimulusId: 0,
  responseTimer: null,
  lastDisplayedInstruction: null,
  lastDisplayedGroup: null,
  stimulusStartedAt: 0,
  timerStartedAt: 0,
  timerDuration: 0,
  timerPercent: 0,
  message: "Pick a preset, adjust the current values, then start.",
  messageTone: "",
  trials: [],
  movementHistory: [],
  timers: new Set(),
  raf: null,
};

function cleanPreset(preset) {
  const cleaned = {
    label: preset.label,
    baseInterval: clampNumber(preset.baseInterval, 400, 4000, 1500),
    jitter: clampNumber(preset.jitter, 0, 2000, 450),
    responseWindow: clampNumber(preset.responseWindow, 400, 4000, 1500),
    pathLength: clampNumber(preset.pathLength, 8, MAX_PATH_LENGTH, 24),
    redRate: clampNumber(preset.redRate, 0, 80, 30),
    reverseZones: clampNumber(preset.reverseZones, 0, 6, 2),
    nbackZones: clampNumber(preset.nbackZones, 0, 6, 1),
    abAlternation: clampNumber(preset.abAlternation, 0, 1, 0),
    groupAKey1: preset.groupAKey1,
    groupAKey2: preset.groupAKey2,
    groupBKey1: preset.groupBKey1,
    groupBKey2: preset.groupBKey2,
  };
  return { ...cleaned, ...cleanInputGroups(cleaned) };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cleanInputGroups(settings) {
  const keys = ["groupAKey1", "groupAKey2", "groupBKey1", "groupBKey2"];
  const ids = keys.map((key) => settings[key]);
  const validIds = new Set(INPUT_OPTIONS.map((input) => input.id));
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size || ids.some((id) => !validIds.has(id))) {
    return { ...DEFAULT_INPUT_GROUPS };
  }
  return keys.reduce((groups, key) => {
    groups[key] = settings[key];
    return groups;
  }, {});
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
  } else if (kind === "step") {
    playTone(784, now, 0.06, "square", 0.35);
    playTone(988, now + 0.06, 0.07, "square", 0.28);
  } else if (kind === "success") {
    playTone(523, now, 0.07, "sine", 0.5);
    playTone(659, now + 0.065, 0.08, "sine", 0.42);
  } else if (kind === "error") {
    playTone(180, now, 0.16, "sawtooth", 0.38);
  } else if (kind === "finish") {
    playTone(523, now, 0.08, "triangle", 0.45);
    playTone(659, now + 0.08, 0.08, "triangle", 0.42);
    playTone(784, now + 0.16, 0.12, "triangle", 0.4);
  }
}

function getSpeechVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    englishVoices.find((voice) => /male|david|mark|daniel|george|alex/i.test(voice.name)) ||
    englishVoices[0] ||
    voices[0] ||
    null
  );
}

function speakHandCue(hand) {
  if (!state.soundEnabled) return;
  if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
    playSound("cue");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(hand === "left" ? "left hand" : "right hand");
  const voice = getSpeechVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 0.82;
  utterance.volume = Math.max(0, Math.min(1, state.soundVolume));
  window.speechSynthesis.speak(utterance);
}

function allPresets() {
  return { ...SYSTEM_PRESETS, ...state.customPresets };
}

function clearTimers() {
  for (const timer of state.timers) clearTimeout(timer);
  state.timers.clear();
  state.responseTimer = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
}

function clearResponseTimer() {
  if (!state.responseTimer) return;
  clearTimeout(state.responseTimer);
  state.timers.delete(state.responseTimer);
  state.responseTimer = null;
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
  const groups = getInputGroups();
  const previousGroup = state.lastDisplayedGroup;
  let nextGroup;
  if (!previousGroup) {
    nextGroup = Math.random() < 0.5 ? "A" : "B";
  } else {
    const oppositeGroup = previousGroup === "A" ? "B" : "A";
    const alternateChance = 0.5 + state.settings.abAlternation * 0.5;
    nextGroup = Math.random() < alternateChance ? oppositeGroup : previousGroup;
  }
  const inputs = groups[nextGroup];
  return inputs[Math.floor(Math.random() * inputs.length)];
}

function randomDelay() {
  const extraDelay = Math.round(Math.random() * state.settings.jitter);
  return Math.max(250, state.settings.baseInterval + extraDelay);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function invertInput(input) {
  const option = INPUT_OPTIONS.find((item) => item.id === input);
  if (!option) return input;
  const configuredIds = getConfiguredInputIds();
  if (configuredIds.includes(option.pair)) return option.pair;
  const oppositeSide = option.side === "left" ? "right" : "left";
  const fallback = getConfiguredInputs().find((item) => item.side === oppositeSide);
  return fallback?.id || input;
}

function inputLabel(id) {
  return INPUT_OPTIONS.find((item) => item.id === id)?.label || "";
}

function inputVisual(id) {
  if (id === "mouseLeft" || id === "mouseRight") {
    const side = id === "mouseLeft" ? "left" : "right";
    return `
      <span class="input-visual mouse-visual mouse-${side}" role="img" aria-label="${side} mouse button">
        <span class="mouse-button mouse-button-left"></span>
        <span class="mouse-button mouse-button-right"></span>
        <span class="mouse-wheel"></span>
      </span>
    `;
  }
  return `<span class="input-visual key-visual">${inputLabel(id)}</span>`;
}

function isRightInput(input) {
  return getConfiguredInputIds().includes(input);
}

function getInputGroups(settings = state.settings) {
  const groups = cleanInputGroups(settings);
  return {
    A: [groups.groupAKey1, groups.groupAKey2],
    B: [groups.groupBKey1, groups.groupBKey2],
  };
}

function getConfiguredInputIds(settings = state.settings) {
  const groups = getInputGroups(settings);
  return [...groups.A, ...groups.B];
}

function getConfiguredInputs(settings = state.settings) {
  const ids = getConfiguredInputIds(settings);
  return ids.map((id) => INPUT_OPTIONS.find((input) => input.id === id)).filter(Boolean);
}

function inputGroup(id, settings = state.settings) {
  const groups = getInputGroups(settings);
  if (groups.A.includes(id)) return "A";
  if (groups.B.includes(id)) return "B";
  return null;
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
  if (key.startsWith("group")) {
    state.settings[key] = value;
    state.settings = cleanPreset(state.settings);
    render();
    return;
  }
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
  state.score = 0;
  state.combo = 0;
  state.boardCells = generateBoardCells(state.settings);
  state.boardPosition = 0;
  state.previousBoardPosition = 0;
  state.playerStepping = false;
  state.stepDirection = "";
  state.visitedCells = new Set([0]);
  state.activeHand = getHandForPosition(0);
  state.currentStimulus = null;
  state.stimulusId = 0;
  state.responseTimer = null;
  state.lastDisplayedInstruction = null;
  state.lastDisplayedGroup = null;
  state.trials = [];
  state.movementHistory = [];
  setMessage("Ready... wait for the right-side cue.", "");
  render();
  speakHandCue(state.activeHand);
  scheduleStimulus();
}

function generateBoardCells(settings) {
  const length = settings.pathLength;
  const cells = Array.from({ length }, (_, index) => ({ index, type: "normal" }));

  placeZones(cells, "reverse", settings.reverseZones, 2, 4);
  placeZones(cells, "nback1", settings.nbackZones, 2, 3);
  cells[0].type = "start";
  cells[cells.length - 1].type = "finish";
  return cells;
}

function placeZones(cells, type, count, minLength, maxLength) {
  const occupied = new Set(cells.flatMap((cell) => (cell.type === "normal" ? [] : [cell.index])));
  occupied.add(0);
  occupied.add(cells.length - 1);

  for (let zone = 0; zone < count; zone += 1) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt += 1) {
      const length = randomInteger(minLength, maxLength);
      const minStart = type === "nback1" ? 1 : 1;
      const maxStart = cells.length - length - 1;
      if (maxStart < minStart) break;
      const start = randomInteger(minStart, maxStart);
      const indexes = Array.from({ length }, (_, offset) => start + offset);
      if (indexes.some((index) => occupied.has(index))) continue;
      indexes.forEach((index) => {
        cells[index].type = type;
        occupied.add(index);
      });
      placed = true;
    }
  }
}

function scheduleStimulus() {
  clearResponseTimer();
  state.phase = "waiting";
  state.currentStimulus = null;
  state.timerPercent = 0;
  render();
  setTimer(showStimulus, randomDelay());
}

function queueNextStimulus() {
  const delay = randomDelay();
  setTimer(showStimulus, delay);
}

function showStimulus() {
  clearResponseTimer();
  const displayedInstruction = {
    light: Math.random() * 100 < state.settings.redRate ? "red" : "green",
    displayKey: randomRightInput(),
  };
  const rule = getCurrentRule();
  const requiredInstruction = getRequiredInstruction(displayedInstruction, rule);
  const stimulusId = state.stimulusId + 1;
  state.stimulusId = stimulusId;
  state.phase = "rightStimulus";
  state.currentStimulus = {
    id: stimulusId,
    displayedInstruction,
    requiredInstruction,
    rule,
    responded: false,
    startPosition: state.boardPosition,
  };
  state.stimulusStartedAt = performance.now();
  startVisualTimer(state.settings.responseWindow);
  playSound("cue");
  setMessage(stimulusMessage(state.currentStimulus), requiredInstruction.light === "green" ? "good" : "bad");
  render();
  state.responseTimer = setTimer(() => {
    if (
      state.phase !== "rightStimulus" ||
      !state.currentStimulus ||
      state.currentStimulus.id !== stimulusId ||
      state.currentStimulus.responded
    ) {
      return;
    }
    state.responseTimer = null;
    const required = state.currentStimulus.requiredInstruction;
    finishRightTrial({
      input: null,
      result: required.light === "red" ? "nogoSuccess" : "miss",
      success: required.light === "red",
      reactionTime: state.settings.responseWindow,
    });
  }, state.settings.responseWindow);
}

function getCurrentRule() {
  return state.boardCells[state.boardPosition]?.type || "normal";
}

function getRequiredInstruction(displayedInstruction, rule) {
  if (rule === "nback1") {
    const previous = state.lastDisplayedInstruction || displayedInstruction;
    return {
      light: previous.light,
      displayKey: previous.displayKey,
      effectiveKey: previous.light === "green" ? previous.displayKey : null,
      source: "previous",
    };
  }
  if (displayedInstruction.light === "red") {
    return { light: "red", displayKey: displayedInstruction.displayKey, effectiveKey: null, source: "current" };
  }
  return {
    light: "green",
    displayKey: displayedInstruction.displayKey,
    effectiveKey: rule === "reverse" ? invertInput(displayedInstruction.displayKey) : displayedInstruction.displayKey,
    source: "current",
  };
}

function stimulusMessage(stimulus) {
  const required = stimulus.requiredInstruction;
  if (stimulus.rule === "nback1") {
    if (required.light === "red") return "1-back: the previous cue was NO-GO. Do not press.";
    return `1-back: press the previous cue, ${inputLabel(required.effectiveKey)}.`;
  }
  if (required.light === "red") return "NO-GO: stay still and do not press.";
  if (stimulus.rule === "reverse") return "Reverse zone: press the opposite side.";
  return "GO: press the target, then get ready.";
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
  clearResponseTimer();
  stimulus.responded = true;
  const fromPosition = state.boardPosition;

  state.lastDisplayedInstruction = { ...stimulus.displayedInstruction };
  state.lastDisplayedGroup = inputGroup(stimulus.displayedInstruction.displayKey);
  if (success) {
    state.score += stimulus.requiredInstruction.light === "red" ? 120 : 100;
    if (stimulus.rule === "reverse" || stimulus.rule === "nback1") state.score += 20;
    state.combo += 1;
    playSound("success");
    movePlayer(1);
    setMessage(successMessage(stimulus), "good");
  } else {
    state.combo = 0;
    playSound("error");
    movePlayer(-1);
    setMessage(errorMessage(result, stimulus), "bad");
  }

  state.trials.push({
    step: state.trials.length + 1,
    rule: stimulus.rule,
    fromPosition,
    toPosition: state.boardPosition,
    displayedLight: stimulus.displayedInstruction.light,
    displayedKey: stimulus.displayedInstruction.displayKey,
    displayedGroup: state.lastDisplayedGroup,
    requiredLight: stimulus.requiredInstruction.light,
    requiredKey: stimulus.requiredInstruction.effectiveKey,
    input,
    reactionTime: Math.round(reactionTime),
    result,
    success,
  });

  state.phase = "waiting";
  state.currentStimulus = null;
  state.timerPercent = 0;
  setMessage("Ready... wait for the right-side cue.", "");
  render();
  if (state.boardPosition >= state.boardCells.length - 1) {
    playSound("finish");
    setTimer(finishSession, 750);
  } else {
    queueNextStimulus();
  }
}

function successMessage(stimulus) {
  if (stimulus.requiredInstruction.light === "red") return "Correct NO-GO. Move forward one space.";
  if (stimulus.rule === "nback1") return "Correct 1-back action. Move forward one space.";
  if (stimulus.rule === "reverse") return "Correct reverse action. Move forward one space.";
  return "Correct. Move forward one space.";
}

function errorMessage(result, stimulus) {
  if (result === "wrongGo") {
    return stimulus.rule === "nback1"
      ? "Wrong 1-back action. Move back one space."
      : "Wrong target. Move back one space.";
  }
  if (result === "falseAlarm") return "NO-GO error. Move back one space.";
  if (result === "miss") return "Timeout. Move back one space.";
  return "Error. Move back one space.";
}

function movePlayer(delta) {
  const from = state.boardPosition;
  const to = Math.max(0, Math.min(state.boardCells.length - 1, from + delta));
  const fromHand = getHandForPosition(from);
  const toHand = getHandForPosition(to);
  state.previousBoardPosition = from;
  state.boardPosition = to;
  state.activeHand = toHand;
  state.stepDirection = delta > 0 ? "forward" : "back";
  state.visitedCells.add(to);
  state.movementHistory.push({ from, to, delta, time: Date.now() });
  triggerPlayerStep();
  if (to !== from) playSound("step");
  if (to !== from && fromHand !== toHand) speakHandCue(toHand);
}

function getHandForPosition(position) {
  const switchIndex = Math.floor(state.boardCells.length / 2);
  return position >= switchIndex ? "right" : "left";
}

function triggerPlayerStep() {
  state.playerStepping = true;
  setTimer(() => {
    state.playerStepping = false;
    state.stepDirection = "";
    if (state.screen === "game") render();
  }, 360);
}

function handleGameInput(input) {
  if (state.screen !== "game" || state.phase !== "rightStimulus") return;
  if (!isRightInput(input)) return;
  handleRightInput(input);
}

function handleRightInput(input) {
  const stimulus = state.currentStimulus;
  if (!stimulus || stimulus.responded) return;
  const reactionTime = performance.now() - state.stimulusStartedAt;
  const required = stimulus.requiredInstruction;
  if (required.light === "red") {
    finishRightTrial({ input, result: "falseAlarm", success: false, reactionTime });
    return;
  }
  finishRightTrial({
    input,
    result: input === required.effectiveKey ? "goSuccess" : "wrongGo",
    success: input === required.effectiveKey,
    reactionTime,
  });
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
  const goTrials = state.trials.filter((trial) => trial.requiredLight === "green");
  const goHits = goTrials.filter((trial) => trial.result === "goSuccess").length;
  const noGoTrials = state.trials.filter((trial) => trial.requiredLight === "red");
  const noGoErrors = noGoTrials.filter((trial) => trial.result === "falseAlarm").length;
  const goReactionTimes = goTrials
    .filter((trial) => trial.result === "goSuccess")
    .map((trial) => trial.reactionTime);
  const avgRt =
    goReactionTimes.length === 0
      ? 0
      : Math.round(goReactionTimes.reduce((sum, value) => sum + value, 0) / goReactionTimes.length);
  const reverseErrors = state.trials.filter((trial) => trial.rule === "reverse" && !trial.success).length;
  const nbackErrors = state.trials.filter((trial) => trial.rule === "nback1" && !trial.success).length;
  const hitRate = goTrials.length === 0 ? 0 : Math.round((goHits / goTrials.length) * 100);
  const progress = `${state.boardPosition + 1}/${state.boardCells.length}`;
  return { hitRate, noGoErrors, avgRt, reverseErrors, nbackErrors, progress };
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
            <p class="subtitle">V2 forest route training: right-side cues move the explorer forward or backward across special rule zones.</p>
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
            ${numberField("pathLength", "Path length", s.pathLength, 8, MAX_PATH_LENGTH, 1)}
            ${numberField("redRate", "Red light rate %", s.redRate, 0, 80, 5)}
            ${numberField("reverseZones", "Reverse zones", s.reverseZones, 0, 6, 1)}
            ${numberField("nbackZones", "1-back zones", s.nbackZones, 0, 6, 1)}
            ${numberField("abAlternation", "AB alternation", s.abAlternation, 0, 1, 0.05)}
          </div>
        </div>

        <div class="current-preset input-groups-panel">
          <div class="panel-header">
            <h2>Input Groups</h2>
            <span>A/B group selection for right-side cues</span>
          </div>
          <div class="config-grid">
            ${selectField("groupAKey1", "Group A key 1", s.groupAKey1)}
            ${selectField("groupAKey2", "Group A key 2", s.groupAKey2)}
            ${selectField("groupBKey1", "Group B key 1", s.groupBKey1)}
            ${selectField("groupBKey2", "Group B key 2", s.groupBKey2)}
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
    const listener = () => updateSetting(input.dataset.setting, input.value);
    input.addEventListener("input", listener);
    input.addEventListener("change", listener);
  });
  document.getElementById("soundToggle").addEventListener("click", () => {
    updateSoundSetting("soundEnabled", !state.soundEnabled);
    render();
  });
  document.getElementById("soundVolume").addEventListener("input", (event) => {
    updateSoundSetting("soundVolume", event.target.value);
  });
  document.getElementById("soundTestBtn").addEventListener("click", () => playSound("success"));
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

function selectField(key, label, value) {
  const selectedIds = new Set(getConfiguredInputIds().filter((id) => id !== value));
  return `
    <div class="config-card field">
      <label for="${key}">${label}</label>
      <select id="${key}" data-setting="${key}">
        ${INPUT_OPTIONS.map(
          (input) =>
            `<option value="${input.id}" ${input.id === value ? "selected" : ""} ${selectedIds.has(input.id) ? "disabled" : ""}>${input.label}</option>`,
        ).join("")}
      </select>
    </div>
  `;
}

function renderGame() {
  const rule = getCurrentRule();
  app.innerHTML = `
    <section class="screen game-screen rule-${rule}">
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
  return `
    <header class="hud">
      ${hudItem("Position", `${state.boardPosition + 1}/${state.boardCells.length}`)}
      ${hudItem("Score", state.score)}
      ${hudItem("Combo", state.combo)}
      ${hudItem("Rule", ruleLabel(getCurrentRule()))}
      ${hudItem("Phase", phaseLabel())}
      ${renderHandHud()}
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
    waiting: "Ready",
    rightStimulus: "Right",
  };
  return labels[state.phase] || "Ready";
}

function ruleLabel(rule) {
  if (rule === "reverse") return "Reverse";
  if (rule === "nback1") return "1-back";
  if (rule === "finish") return "Finish";
  return "Normal";
}

function renderHandHud() {
  const hand = state.activeHand || getHandForPosition(state.boardPosition);
  return `
    <div class="hud-item hand-hud">
      <div class="hud-label">Hand</div>
      <div class="hand-toggle" aria-label="Current hand">
        <span class="hand-side ${hand === "left" ? "active" : ""}">Left</span>
        <span class="hand-side ${hand === "right" ? "active" : ""}">Right</span>
      </div>
    </div>
  `;
}

function renderBoard() {
  const page = getRoutePage();
  const pathPoints = page.cells.map((cell) => `${cell.x},${cell.y}`).join(" ");
  const cells = page.cells
    .map((cell) => {
      const isCurrent = state.boardPosition === cell.index;
      const isVisited = state.visitedCells.has(cell.index);
      return `
        <div class="trail-cell ${cell.type} ${isCurrent ? "current" : ""} ${isVisited ? "visited" : ""}" style="--x:${cell.x}%; --y:${cell.y}%;">
          <span class="trail-index">${cell.index + 1}</span>
          <span class="trail-label">${cellLabel(cell)}</span>
          ${isCurrent ? renderPlayer() : ""}
        </div>
      `;
    })
    .join("");
  return `
    <section class="board-panel forest-board-panel">
      <div class="panel-header">
        <h2>Forest Route</h2>
        <span>${state.boardPosition + 1}/${state.boardCells.length} spaces | Page ${page.currentPage}/${page.totalPages}</span>
      </div>
      <div class="forest-stage">
        <div class="forest-canopy canopy-a"></div>
        <div class="forest-canopy canopy-b"></div>
        <div class="forest-canopy canopy-c"></div>
        <svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${pathPoints}" pathLength="1"></polyline>
        </svg>
        <div class="forest-map">${cells}</div>
      </div>
      <div class="message-bar ${state.messageTone}">${state.message}</div>
    </section>
  `;
}

function getRoutePage(position = state.boardPosition) {
  const total = state.boardCells.length;
  const pageStart = Math.floor(position / ROUTE_PAGE_SIZE) * ROUTE_PAGE_SIZE;
  const pageEnd = Math.min(total, pageStart + ROUTE_PAGE_SIZE);
  const visibleCount = pageEnd - pageStart;
  return {
    currentPage: Math.floor(pageStart / ROUTE_PAGE_SIZE) + 1,
    totalPages: Math.max(1, Math.ceil(total / ROUTE_PAGE_SIZE)),
    cells: state.boardCells.slice(pageStart, pageEnd).map((cell, localIndex) => ({
      ...cell,
      ...getRouteCellPosition(localIndex, visibleCount),
    })),
  };
}

function getRouteCellPosition(localIndex, visibleCount) {
  const cols = Math.min(7, Math.max(5, Math.ceil(Math.sqrt(visibleCount + 4))));
  const rows = Math.ceil(visibleCount / cols);
  const row = Math.floor(localIndex / cols);
  const col = localIndex % cols;
  const zCol = row % 2 === 0 ? col : cols - 1 - col;
  const xStep = cols <= 1 ? 0 : 82 / (cols - 1);
  const yStep = rows <= 1 ? 0 : 78 / (rows - 1);
  const xWiggle = Math.sin(localIndex * 1.7) * 2.8;
  const yWiggle = Math.cos(localIndex * 1.13) * 2.3;
  return {
    x: Math.max(5, Math.min(95, 9 + zCol * xStep + xWiggle)),
    y: Math.max(7, Math.min(91, 10 + row * yStep + yWiggle)),
  };
}

function cellLabel(cell) {
  if (cell.type === "start") return "START";
  if (cell.type === "finish") return "END";
  if (cell.type === "reverse") return "REV";
  if (cell.type === "nback1") return "1B";
  return "";
}

function renderPlayer() {
  return `<div class="trail-player ${state.playerStepping ? `step-${state.stepDirection}` : ""}"><span></span></div>`;
}

function renderStimulus() {
  const stimulus = state.currentStimulus;
  const isActive = state.phase === "rightStimulus";
  const displayed = isActive ? stimulus.displayedInstruction : null;
  const light = displayed?.light || "green";
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
        <div class="poison-note">${ruleNote(stimulus)}</div>
        <div class="timer"><div class="timer-fill" style="width:${state.timerPercent}%"></div></div>
      </div>
      <div class="controls-strip">
        ${getConfiguredInputs().map(
          (input) =>
            `<div class="key-chip ${isActive && displayed?.displayKey === input.id ? "active" : ""}">${inputVisual(input.id)}</div>`,
        ).join("")}
      </div>
    </section>
  `;
}

function getTargetContent() {
  if (state.phase === "waiting") return "Ready...";
  if (!state.currentStimulus) return "Ready";
  return inputVisual(state.currentStimulus.displayedInstruction.displayKey);
}

function ruleNote(stimulus) {
  if (!stimulus || state.phase !== "rightStimulus") return "";
  if (stimulus.rule === "reverse") return "Purple zone: green targets are left/right reversed";
  if (stimulus.rule === "nback1") {
    const required = stimulus.requiredInstruction;
    if (required.light === "red") return "Blue zone: do the previous cue, which was NO-GO";
    return `Blue zone: do the previous cue, ${inputLabel(required.effectiveKey)}`;
  }
  return "";
}

function renderSummary() {
  const metrics = getMetrics();
  app.innerHTML = `
    <section class="screen summary-screen">
      <div class="summary-shell">
        <div>
          <h1>Training Complete</h1>
          <p class="subtitle">Right-side successes moved forward. Errors and missed green cues moved backward.</p>
        </div>
        <div class="summary-grid">
          ${metricCard("Progress", metrics.progress)}
          ${metricCard("Hit rate", `${metrics.hitRate}%`)}
          ${metricCard("No-go errors", metrics.noGoErrors)}
          ${metricCard("Avg RT", `${metrics.avgRt}ms`)}
          ${metricCard("Reverse errors", metrics.reverseErrors)}
          ${metricCard("1-back errors", metrics.nbackErrors)}
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
  const match = getConfiguredInputs().find((input) => input.code === event.code);
  if (!match) return;
  event.preventDefault();
  handleGameInput(match.id);
});

window.addEventListener("mousedown", (event) => {
  if (state.screen !== "game") return;
  const match = getConfiguredInputs().find((input) => input.button === event.button);
  if (!match) return;
  event.preventDefault();
  handleGameInput(match.id);
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
