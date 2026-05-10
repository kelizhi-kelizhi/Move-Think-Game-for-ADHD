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
  groupAKey2: "",
  groupBKey1: "mouseLeft",
  groupBKey2: "",
};

const EMPTY_INPUT_OPTION = { id: "", label: "Empty" };

const MAX_PATH_LENGTH = 1000;
const DEFAULT_ROUTE_PAGE_SIZE = 42;
const MIN_ROUTE_PAGE_SIZE = 8;
const MAX_ROUTE_PAGE_SIZE = 84;
const MAX_ROUTE_PAGE_COUNT = 50;
const MIN_RESPONSE_WINDOW = 400;
const MAX_RESPONSE_WINDOW = 4000;
const STORAGE_KEY = "moveThinkCustomPresetsV21";
const MAP_STORAGE_KEY = "moveThinkMapsV1";
const SOUND_STORAGE_KEY = "moveThinkSoundSettingsV1";
const HISTORY_STORAGE_KEY = "moveThinkSessionHistoryV1";
const CUSTOM_IDS = ["custom1", "custom2", "custom3"];
const MAX_HISTORY_ENTRIES = 100;
const MAX_SAVED_MAPS = 50;
const MAP_VERSION = 7;
const DEFAULT_DELAY_COLOR_STRENGTH = 0.45;
const DEFAULT_CUE_VISIBLE_MS = 750;
const DEFAULT_SOUND_VOLUME = 0.28;
const MAX_SOUND_VOLUME = 2;
const DEFAULT_SEQUENCE_START_PAGE = 2;
const DEFAULT_SEQUENCE_INCREMENT_PAGES = 1;
const DEFAULT_MAX_SEQUENCE_LENGTH = 3;
const MAX_SEQUENCE_LENGTH = 12;
const DEFAULT_FIRST_RESPONSE_KEY_BONUS_MS = 50;
const DEFAULT_ADAPTIVE_STREAK_TARGET = 3;
const DEFAULT_ADAPTIVE_DECREASE_PERCENT = 5;
const DEFAULT_ADAPTIVE_INCREASE_PERCENT = 8;
const DEFAULT_MAX_LIVES = 10;
const MAX_LIVES = 50;
const SLOT_VOICE_DELAY_MS = 50;
const SLOT_AUDIO_PLAYBACK_RATE = 1.5;
const SLOT_IDS = ["A1", "A2", "B1", "B2"];
const SLOT_AUDIO_PATHS = {
  A1: "assets/audio/a1.mp3",
  A2: "assets/audio/a2.mp3",
  B1: "assets/audio/b1.mp3",
  B2: "assets/audio/b2.mp3",
};

const FALLBACK_PRESET = {
  baseInterval: 1500,
  jitter: 450,
  delayBlockSize: 1,
  delayBalance: 0,
  delayColorStrength: DEFAULT_DELAY_COLOR_STRENGTH,
  responseWindow: 1500,
  firstResponseKeyBonusMs: DEFAULT_FIRST_RESPONSE_KEY_BONUS_MS,
  adaptiveResponseEnabled: false,
  adaptiveCorrectStreakTarget: DEFAULT_ADAPTIVE_STREAK_TARGET,
  adaptiveDecreasePercent: DEFAULT_ADAPTIVE_DECREASE_PERCENT,
  adaptiveIncreasePercent: DEFAULT_ADAPTIVE_INCREASE_PERCENT,
  cueVisibleMs: DEFAULT_CUE_VISIBLE_MS,
  slotVoiceEnabled: true,
  distinctNoGoToneEnabled: false,
  livesEnabled: false,
  maxLives: DEFAULT_MAX_LIVES,
  sequenceStartPage: DEFAULT_SEQUENCE_START_PAGE,
  sequenceIncrementPages: DEFAULT_SEQUENCE_INCREMENT_PAGES,
  maxSequenceLength: DEFAULT_MAX_SEQUENCE_LENGTH,
  routePageSize: DEFAULT_ROUTE_PAGE_SIZE,
  routePageCount: 1,
  pathLength: DEFAULT_ROUTE_PAGE_SIZE,
  mapSlotPairs: 1,
  redRate: 30,
  reverseZones: 2,
  nbackZones: 1,
  abAlternation: 0,
  ...DEFAULT_INPUT_GROUPS,
};

const CUSTOM_LABELS = {
  custom1: "Custom 1",
  custom2: "Custom 2",
  custom3: "Custom 3",
};

const SETTING_HELP = {
  baseInterval: "Minimum wait after a cue is resolved before the next cue appears.",
  jitter: "Extra wait range added to the cue interval. A 1500ms interval with 500ms jitter creates waits from 1500ms to 2000ms.",
  delayBlockSize: "Number of consecutive route spaces that share one generated wait time.",
  delayBalance: "0 makes each wait block independently random. 1 spreads the wait values evenly across the interval range, then shuffles them.",
  delayColorStrength: "Controls how strongly route spaces show wait time. 0 hides the effect; 1 makes short waits lighter and long waits darker.",
  responseWindow: "How long the player has to respond after a GO / NO-GO cue appears.",
  firstResponseKeyBonusMs: "Extra time added to the first response window in each route space for every displayed key. Set to 0 to disable.",
  adaptiveResponseEnabled: "When on, the game adjusts response window and first-window bonus after each successful GO streak or error.",
  adaptiveCorrectStreakTarget: "Number of complete green GO successes needed before the adaptive window decreases.",
  adaptiveDecreasePercent: "Percentage used to shrink the adaptive response window and first-window bonus after a correct streak.",
  adaptiveIncreasePercent: "Percentage used to grow the adaptive response window and first-window bonus after one error.",
  cueVisibleMs: "How long the target keys stay visible before fading out. Must be shorter than the response window.",
  slotVoiceEnabled: "Whether to play A1, B1, A2, and B2 voice cues during the response window.",
  distinctNoGoToneEnabled: "When on, NO-GO cue start tones use 500Hz for stronger contrast from GO cues.",
  livesEnabled: "When on, each error removes one life and the run ends when lives reach zero.",
  maxLives: "Number of lives at the start of a run when lives are enabled.",
  sequenceStartPage: "First route page where the target sequence starts growing beyond one key.",
  sequenceIncrementPages: "How many pages pass before the target sequence gains another key.",
  maxSequenceLength: "Maximum number of keys that can appear in one route-space sequence.",
  routePageSize: "Number of route spaces shown on each page.",
  routePageCount: "Total number of route pages. Total route spaces equal page size multiplied by page count.",
  mapSlotPairs: "How many A/B slot pairs the generated map may use. Two pairs can generate A2 and B2 cues.",
  redRate: "Chance that a generated cue is NO-GO.",
  reverseZones: "Number of purple route segments where green targets use the matching slot in the other input group.",
  nbackZones: "Number of blue route segments where the required action comes from the previous route space's generated cue.",
  abAlternation: "Controls how strongly generated cues switch between input group A and group B.",
  groupAKey1: "First input assigned to group A. In reverse zones, this maps to group B key 1.",
  groupAKey2: "Optional second input assigned to group A. In reverse zones, this maps to group B key 2.",
  groupBKey1: "First input assigned to group B. In reverse zones, this maps to group A key 1.",
  groupBKey2: "Optional second input assigned to group B. In reverse zones, this maps to group A key 2.",
};

const savedSoundSettings = loadSoundSettings();
const savedCustomPresets = loadCustomPresets();
const savedSessionHistory = loadSessionHistory();
const savedMaps = loadSavedMaps();

const state = {
  screen: "config",
  selectedPresetId: "custom1",
  settings: { ...savedCustomPresets.custom1 },
  customPresets: savedCustomPresets,
  maps: savedMaps,
  selectedMapId: savedMaps[0]?.id || "",
  activeMap: null,
  soundEnabled: savedSoundSettings.soundEnabled,
  soundVolume: savedSoundSettings.soundVolume,
  audioContext: null,
  slotAudio: null,
  pointerLockReleaseExpected: false,
  phase: "idle",
  score: 0,
  combo: 0,
  lives: 0,
  boardCells: [],
  boardPosition: 0,
  previousBoardPosition: 0,
  playerStepping: false,
  stepDirection: "",
  visitedCells: new Set(),
  currentStimulus: null,
  stimulusId: 0,
  cueTimer: null,
  cueTimerStartedAt: 0,
  cueTimerDelay: 0,
  responseTimer: null,
  cueVisibilityTimer: null,
  isPaused: false,
  pausedPhase: null,
  cueRemainingMs: 0,
  responseElapsedBeforePause: 0,
  cueVisibilityElapsedBeforePause: 0,
  stimulusStartedAt: 0,
  cueVisibleStartedAt: 0,
  timerStartedAt: 0,
  timerDuration: 0,
  timerPercent: 0,
  message: "Pick a preset, adjust the current values, then start.",
  messageTone: "",
  trials: [],
  movementHistory: [],
  sessionHistory: savedSessionHistory,
  sessionHistorySaved: false,
  adaptiveMultiplier: 1,
  adaptiveCorrectStreak: 0,
  sessionStartedAt: 0,
  sessionEndedAt: 0,
  timers: new Set(),
  raf: null,
};

function cleanPreset(preset) {
  const fallbackLength = clampNumber(preset.pathLength, MIN_ROUTE_PAGE_SIZE, MAX_PATH_LENGTH, 24);
  const routePageSize = Math.round(
    clampNumber(
      preset.routePageSize,
      MIN_ROUTE_PAGE_SIZE,
      Math.min(MAX_ROUTE_PAGE_SIZE, MAX_PATH_LENGTH),
      Math.min(DEFAULT_ROUTE_PAGE_SIZE, fallbackLength),
    ),
  );
  const maxPagesForSize = Math.max(1, Math.floor(MAX_PATH_LENGTH / routePageSize));
  const maxRoutePageCount = Math.min(MAX_ROUTE_PAGE_COUNT, maxPagesForSize);
  const routePageCount = Math.round(
    clampNumber(
      preset.routePageCount,
      1,
      maxRoutePageCount,
      Math.max(1, Math.ceil(fallbackLength / routePageSize)),
    ),
  );
  const pathLength = routePageSize * routePageCount;
  const cleaned = {
    label: preset.label,
    baseInterval: clampNumber(preset.baseInterval, 400, 4000, 1500),
    jitter: clampNumber(preset.jitter, 0, 2000, 450),
    delayBlockSize: clampNumber(preset.delayBlockSize, 1, pathLength, 1),
    delayBalance: clampNumber(preset.delayBalance, 0, 1, 0),
    delayColorStrength: clampNumber(preset.delayColorStrength, 0, 1, DEFAULT_DELAY_COLOR_STRENGTH),
    responseWindow: clampNumber(preset.responseWindow, MIN_RESPONSE_WINDOW, MAX_RESPONSE_WINDOW, 1500),
    firstResponseKeyBonusMs: clampNumber(
      preset.firstResponseKeyBonusMs,
      0,
      1000,
      DEFAULT_FIRST_RESPONSE_KEY_BONUS_MS,
    ),
    adaptiveResponseEnabled: preset.adaptiveResponseEnabled === true,
    adaptiveCorrectStreakTarget: Math.round(
      clampNumber(preset.adaptiveCorrectStreakTarget, 1, 10, DEFAULT_ADAPTIVE_STREAK_TARGET),
    ),
    adaptiveDecreasePercent: clampNumber(
      preset.adaptiveDecreasePercent,
      0,
      50,
      DEFAULT_ADAPTIVE_DECREASE_PERCENT,
    ),
    adaptiveIncreasePercent: clampNumber(
      preset.adaptiveIncreasePercent,
      0,
      50,
      DEFAULT_ADAPTIVE_INCREASE_PERCENT,
    ),
    cueVisibleMs: 0,
    slotVoiceEnabled: preset.slotVoiceEnabled === false ? false : true,
    distinctNoGoToneEnabled: preset.distinctNoGoToneEnabled === true,
    livesEnabled: preset.livesEnabled === true,
    maxLives: Math.round(clampNumber(preset.maxLives, 1, MAX_LIVES, DEFAULT_MAX_LIVES)),
    sequenceStartPage: clampNumber(preset.sequenceStartPage, 1, maxRoutePageCount, DEFAULT_SEQUENCE_START_PAGE),
    sequenceIncrementPages: clampNumber(preset.sequenceIncrementPages, 1, 20, DEFAULT_SEQUENCE_INCREMENT_PAGES),
    maxSequenceLength: clampNumber(preset.maxSequenceLength, 1, MAX_SEQUENCE_LENGTH, DEFAULT_MAX_SEQUENCE_LENGTH),
    routePageSize,
    routePageCount,
    pathLength,
    mapSlotPairs: Math.round(clampNumber(preset.mapSlotPairs, 1, 2, 1)),
    redRate: clampNumber(preset.redRate, 0, 80, 30),
    reverseZones: clampNumber(preset.reverseZones, 0, 6, 2),
    nbackZones: clampNumber(preset.nbackZones, 0, 6, 1),
    abAlternation: clampNumber(preset.abAlternation, 0, 1, 0),
    groupAKey1: preset.groupAKey1,
    groupAKey2: preset.groupAKey2,
    groupBKey1: preset.groupBKey1,
    groupBKey2: preset.groupBKey2,
  };
  cleaned.cueVisibleMs = clampNumber(
    preset.cueVisibleMs,
    100,
    Math.max(100, cleaned.responseWindow - 50),
    Math.min(DEFAULT_CUE_VISIBLE_MS, Math.max(100, cleaned.responseWindow - 50)),
  );
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
  const filledIds = ids.filter(Boolean);
  const uniqueIds = new Set(filledIds);
  const hasGroupA = Boolean(settings.groupAKey1 || settings.groupAKey2);
  const hasGroupB = Boolean(settings.groupBKey1 || settings.groupBKey2);
  const hasReversePair = Boolean(
    (settings.groupAKey1 && settings.groupBKey1) || (settings.groupAKey2 && settings.groupBKey2),
  );
  if (
    filledIds.length !== uniqueIds.size ||
    filledIds.some((id) => !validIds.has(id)) ||
    !hasGroupA ||
    !hasGroupB ||
    !hasReversePair
  ) {
    return { ...DEFAULT_INPUT_GROUPS };
  }
  return keys.reduce((groups, key) => {
    groups[key] = settings[key] || "";
    return groups;
  }, {});
}

function getDefaultPresetValues() {
  const externalDefault =
    typeof window !== "undefined" && window.MOVE_THINK_DEFAULT_PRESET && typeof window.MOVE_THINK_DEFAULT_PRESET === "object"
      ? window.MOVE_THINK_DEFAULT_PRESET
      : {};
  const legacyExternalPresets =
    typeof window !== "undefined" && window.MOVE_THINK_DEFAULT_PRESETS && typeof window.MOVE_THINK_DEFAULT_PRESETS === "object"
      ? window.MOVE_THINK_DEFAULT_PRESETS
      : {};
  return CUSTOM_IDS.reduce((presets, id) => {
    presets[id] = cleanPreset({
      ...FALLBACK_PRESET,
      ...externalDefault,
      ...(legacyExternalPresets[id] || {}),
      label: CUSTOM_LABELS[id],
    });
    return presets;
  }, {});
}

function loadCustomPresets() {
  const defaults = getDefaultPresetValues();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return CUSTOM_IDS.reduce((presets, id) => {
      const saved = parsed[id] || {};
      const merged = { ...defaults[id], ...saved, label: CUSTOM_LABELS[id] };
      if (saved.pathLength && saved.routePageSize === undefined && saved.routePageCount === undefined) {
        delete merged.routePageSize;
        delete merged.routePageCount;
      }
      presets[id] = cleanPreset(merged);
      return presets;
    }, {});
  } catch {
    return defaults;
  }
}

function saveCustomPresets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.customPresets));
}

function loadSoundSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SOUND_STORAGE_KEY) || "{}");
    return {
      soundEnabled: parsed.soundEnabled === false ? false : true,
      soundVolume: clampNumber(parsed.soundVolume, 0, MAX_SOUND_VOLUME, DEFAULT_SOUND_VOLUME),
    };
  } catch {
    return { soundEnabled: true, soundVolume: DEFAULT_SOUND_VOLUME };
  }
}

function saveSoundSettings() {
  localStorage.setItem(
    SOUND_STORAGE_KEY,
    JSON.stringify({
      soundEnabled: state.soundEnabled,
      soundVolume: state.soundVolume,
    }),
  );
}

function loadSessionHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry === "object")
      .slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

function saveSessionHistory() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state.sessionHistory.slice(0, MAX_HISTORY_ENTRIES)));
}

function loadSavedMaps() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MAP_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(cleanSavedMap).filter(Boolean).slice(0, MAX_SAVED_MAPS);
  } catch {
    return [];
  }
}

function saveSavedMaps() {
  localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(state.maps.slice(0, MAX_SAVED_MAPS)));
}

function cleanSavedMap(map) {
  if (!map || typeof map !== "object" || !Array.isArray(map.cells)) return null;
  const settings = cleanPreset({
    ...FALLBACK_PRESET,
    ...(map.mapSettingsSnapshot || {}),
    routePageSize: map.routePageSize,
    routePageCount: map.routePageCount,
    pathLength: map.pathLength,
  });
  const pathLength = settings.pathLength;
  const cells = map.cells
    .slice(0, pathLength)
    .map((cell, index) => cleanMapCell(cell, index))
    .filter(Boolean);
  if (cells.length !== pathLength) return null;
  cells[0].type = "start";
  cells[cells.length - 1].type = "finish";
  const requiredSlots = getMapRequiredSlots({ ...map, cells });
  return {
    id: typeof map.id === "string" && map.id ? map.id : createId("map"),
    name: typeof map.name === "string" && map.name.trim() ? map.name.trim().slice(0, 64) : "Untitled Map",
    createdAt: Number.isFinite(map.createdAt) ? map.createdAt : Date.now(),
    version: MAP_VERSION,
    mapSettingsSnapshot: pickMapSettings(settings),
    routePageSize: settings.routePageSize,
    routePageCount: settings.routePageCount,
    pathLength,
    requiredSlots,
    cells,
  };
}

function cleanMapCell(cell, index) {
  if (!cell || typeof cell !== "object") return null;
  const type = ["normal", "start", "finish", "reverse", "nback1"].includes(cell.type) ? cell.type : "normal";
  const displayed = cleanMapDisplayedInstruction(cell.displayedInstruction);
  if (!displayed) return null;
  return {
    index,
    type,
    delayMs: Math.max(250, Math.round(clampNumber(cell.delayMs, 250, 6000, FALLBACK_PRESET.baseInterval))),
    displayedInstruction: displayed,
  };
}

function cleanMapDisplayedInstruction(instruction) {
  if (!instruction || typeof instruction !== "object") return null;
  const slots = Array.isArray(instruction.slots)
    ? instruction.slots.filter((slot) => SLOT_IDS.includes(slot))
    : instructionDisplayKeys(instruction).map((id) => inputSlotLabel(id, FALLBACK_PRESET)).filter((slot) => SLOT_IDS.includes(slot));
  if (!slots.length) return null;
  return {
    light: instruction.light === "red" ? "red" : "green",
    slots,
  };
}

function clearSessionHistory() {
  state.sessionHistory = [];
  saveSessionHistory();
  render();
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
  } else if (kind === "nogoCue") {
    playTone(state.settings.distinctNoGoToneEnabled ? 500 : 620, now, 0.07, "triangle", 0.42);
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

function speakSlotSequence(keys, onEnd) {
  if (!state.soundEnabled) return false;
  if (!state.settings.slotVoiceEnabled) return false;
  if (playSlotAudioSequence(keys, onEnd, () => speakSlotSequenceFallback(keys, onEnd))) return true;
  return speakSlotSequenceFallback(keys, onEnd);
}

function speakSlotSequenceFallback(keys, onEnd) {
  const spoken = keys.map(inputSlotSpeechLabel).filter(Boolean).join(", ");
  if (!spoken) return false;
  if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
    playSound("cue");
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spoken);
  const voice = getSpeechVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 0.9;
  utterance.volume = Math.max(0, Math.min(1, state.soundVolume));
  utterance.onend = () => {
    if (typeof onEnd === "function") onEnd();
  };
  utterance.onerror = () => {
    if (typeof onEnd === "function") onEnd();
  };
  window.speechSynthesis.speak(utterance);
  return true;
}

function playSlotAudioSequence(keys, onEnd, onFail) {
  if (!window.Audio) return false;
  const sources = keys.map((key) => SLOT_AUDIO_PATHS[inputSlotLabel(key)]).filter(Boolean);
  if (!sources.length) return false;
  stopSlotAudio();
  let index = 0;
  let failed = false;
  const failSequence = () => {
    if (failed) return;
    failed = true;
    stopSlotAudio();
    if (typeof onFail === "function") onFail();
  };
  const playNext = () => {
    if (index >= sources.length) {
      state.slotAudio = null;
      if (typeof onEnd === "function") onEnd();
      return;
    }
    const audio = new Audio(sources[index]);
    state.slotAudio = audio;
    index += 1;
    audio.playbackRate = SLOT_AUDIO_PLAYBACK_RATE;
    audio.volume = Math.max(0, Math.min(1, state.soundVolume));
    audio.onended = playNext;
    audio.onerror = failSequence;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(failSequence);
    }
  };
  playNext();
  return true;
}

function stopSlotAudio() {
  if (state.slotAudio) {
    state.slotAudio.onended = null;
    state.slotAudio.onerror = null;
    state.slotAudio.pause();
    state.slotAudio.currentTime = 0;
    state.slotAudio = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function allPresets() {
  return state.customPresets;
}

function clampAdaptiveMultiplier(multiplier, settings = state.settings) {
  const baseWindow = Math.max(1, settings.responseWindow || MIN_RESPONSE_WINDOW);
  const minMultiplier = MIN_RESPONSE_WINDOW / baseWindow;
  const maxMultiplier = MAX_RESPONSE_WINDOW / baseWindow;
  return clampNumber(multiplier, minMultiplier, maxMultiplier, 1);
}

function getScaledResponseWindow(settings = state.settings, multiplier = 1) {
  return Math.round(clampNumber(settings.responseWindow * multiplier, MIN_RESPONSE_WINDOW, MAX_RESPONSE_WINDOW, settings.responseWindow));
}

function getScaledFirstResponseKeyBonus(settings = state.settings, multiplier = 1) {
  return Math.round(Math.max(0, settings.firstResponseKeyBonusMs * multiplier));
}

function clearTimers() {
  for (const timer of state.timers) clearTimeout(timer);
  state.timers.clear();
  state.cueTimer = null;
  state.responseTimer = null;
  state.cueVisibilityTimer = null;
  stopSlotAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
}

function clearCueTimer() {
  if (!state.cueTimer) return;
  clearTimeout(state.cueTimer);
  state.timers.delete(state.cueTimer);
  state.cueTimer = null;
}

function clearResponseTimer() {
  if (!state.responseTimer) return;
  clearTimeout(state.responseTimer);
  state.timers.delete(state.responseTimer);
  state.responseTimer = null;
}

function clearCueVisibilityTimer() {
  if (!state.cueVisibilityTimer) return;
  clearTimeout(state.cueVisibilityTimer);
  state.timers.delete(state.cueVisibilityTimer);
  state.cueVisibilityTimer = null;
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
  state.activeMap = null;
  resetPauseState();
  setMessage("Game exited. Adjust settings or start again.", "");
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function resetPauseState() {
  state.isPaused = false;
  state.pausedPhase = null;
  state.cueRemainingMs = 0;
  state.responseElapsedBeforePause = 0;
  state.cueVisibilityElapsedBeforePause = 0;
}

function setTimer(callback, delay) {
  const timer = setTimeout(() => {
    state.timers.delete(timer);
    callback();
  }, delay);
  state.timers.add(timer);
  return timer;
}

function setCueTimer(callback, delay) {
  clearCueTimer();
  state.cueTimerDelay = Math.max(0, delay);
  state.cueTimerStartedAt = performance.now();
  state.cueTimer = setTimer(() => {
    state.cueTimer = null;
    callback();
  }, state.cueTimerDelay);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pickMapSettings(settings) {
  const cleaned = cleanPreset(settings);
  return {
    routePageSize: cleaned.routePageSize,
    routePageCount: cleaned.routePageCount,
    pathLength: cleaned.pathLength,
    mapSlotPairs: cleaned.mapSlotPairs,
    baseInterval: cleaned.baseInterval,
    jitter: cleaned.jitter,
    delayBlockSize: cleaned.delayBlockSize,
    delayBalance: cleaned.delayBalance,
    sequenceStartPage: cleaned.sequenceStartPage,
    sequenceIncrementPages: cleaned.sequenceIncrementPages,
    maxSequenceLength: cleaned.maxSequenceLength,
    redRate: cleaned.redRate,
    reverseZones: cleaned.reverseZones,
    nbackZones: cleaned.nbackZones,
    abAlternation: cleaned.abAlternation,
  };
}

function randomRightInput(previousGroup = null, settings = state.settings, options = {}) {
  const groups = getInputGroups(settings);
  const candidates = getInputCandidates(settings, options);
  const availableGroups = Object.entries(candidates)
    .filter(([, inputs]) => inputs.length)
    .map(([group]) => group);
  let nextGroup;
  if (!previousGroup) {
    nextGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)] || "A";
  } else {
    const oppositeGroup = previousGroup === "A" ? "B" : "A";
    const alternateChance = 0.5 + settings.abAlternation * 0.5;
    nextGroup = Math.random() < alternateChance ? oppositeGroup : previousGroup;
    if (!candidates[nextGroup]?.length) {
      nextGroup = candidates[oppositeGroup]?.length ? oppositeGroup : availableGroups[0];
    }
  }
  const inputs = candidates[nextGroup]?.length ? candidates[nextGroup] : groups[nextGroup].filter(Boolean);
  return inputs[Math.floor(Math.random() * inputs.length)];
}

function randomRightInputSequence(length, previousGroup = null, settings = state.settings, options = {}) {
  const sequence = [];
  let group = previousGroup;
  for (let index = 0; index < length; index += 1) {
    const input = randomRightInput(group, settings, options);
    sequence.push(input);
    group = inputGroup(input, settings);
  }
  return sequence;
}

function randomSlot(previousGroup = null, settings = state.settings) {
  const candidates = getMapSlotGroups(settings);
  const availableGroups = Object.entries(candidates)
    .filter(([, slots]) => slots.length)
    .map(([group]) => group);
  let nextGroup;
  if (!previousGroup) {
    nextGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)] || "A";
  } else {
    const oppositeGroup = previousGroup === "A" ? "B" : "A";
    const alternateChance = 0.5 + settings.abAlternation * 0.5;
    nextGroup = Math.random() < alternateChance ? oppositeGroup : previousGroup;
    if (!candidates[nextGroup]?.length) {
      nextGroup = candidates[oppositeGroup]?.length ? oppositeGroup : availableGroups[0];
    }
  }
  const slots = candidates[nextGroup]?.length ? candidates[nextGroup] : candidates.A;
  return slots[Math.floor(Math.random() * slots.length)] || "A1";
}

function randomSlotSequence(length, previousGroup = null, settings = state.settings) {
  const sequence = [];
  let group = previousGroup;
  for (let index = 0; index < length; index += 1) {
    const slot = randomSlot(group, settings);
    sequence.push(slot);
    group = slotGroup(slot);
  }
  return sequence;
}

function getMapSlotGroups(settings = state.settings) {
  const pairs = Math.max(1, Math.min(2, Math.round(settings.mapSlotPairs || 1)));
  return {
    A: pairs >= 2 ? ["A1", "A2"] : ["A1"],
    B: pairs >= 2 ? ["B1", "B2"] : ["B1"],
  };
}

function slotGroup(slot) {
  if (typeof slot !== "string") return null;
  if (slot.startsWith("A")) return "A";
  if (slot.startsWith("B")) return "B";
  return null;
}

function getSequenceLengthForCell(index, settings = state.settings) {
  const page = Math.floor(index / getRoutePageSize(settings)) + 1;
  const startPage = Math.max(1, Math.round(settings.sequenceStartPage));
  const incrementPages = Math.max(1, Math.round(settings.sequenceIncrementPages));
  const maxLength = Math.max(1, Math.round(settings.maxSequenceLength));
  if (page < startPage) return 1;
  return Math.min(maxLength, 2 + Math.floor((page - startPage) / incrementPages));
}

function getRoutePageSize(settings = state.settings) {
  if (
    settings === state.settings &&
    state.activeMap &&
    (state.screen === "game" || state.screen === "summary")
  ) {
    return Math.max(MIN_ROUTE_PAGE_SIZE, Math.round(state.activeMap.routePageSize || DEFAULT_ROUTE_PAGE_SIZE));
  }
  return Math.max(MIN_ROUTE_PAGE_SIZE, Math.round(settings.routePageSize || DEFAULT_ROUTE_PAGE_SIZE));
}

function getInputCandidates(settings = state.settings, options = {}) {
  const groups = getInputGroups(settings);
  const candidates = {
    A: groups.A.filter(Boolean),
    B: groups.B.filter(Boolean),
  };
  if (!options.requireReversePair) return candidates;
  return {
    A: candidates.A.filter((input) => Boolean(reverseInput(input, settings))),
    B: candidates.B.filter((input) => Boolean(reverseInput(input, settings))),
  };
}

function slotToInputId(slot, settings = state.settings) {
  const groups = cleanInputGroups(settings);
  const slots = {
    A1: groups.groupAKey1,
    A2: groups.groupAKey2,
    B1: groups.groupBKey1,
    B2: groups.groupBKey2,
  };
  return slots[slot] || "";
}

function slotSequenceToInputs(slots, settings = state.settings) {
  return slots.map((slot) => slotToInputId(slot, settings)).filter(Boolean);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function reverseInput(input, settings = state.settings) {
  const groups = cleanInputGroups(settings);
  const pairs = [
    ["groupAKey1", "groupBKey1"],
    ["groupAKey2", "groupBKey2"],
  ];
  for (const [aKey, bKey] of pairs) {
    if (groups[aKey] === input) return groups[bKey] || null;
    if (groups[bKey] === input) return groups[aKey] || null;
  }
  return null;
}

function inputLabel(id) {
  return INPUT_OPTIONS.find((item) => item.id === id)?.label || "";
}

function inputSequenceLabel(ids) {
  return ids.map(inputSlotLabel).filter(Boolean).join(" -> ");
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

function slotVisual(id) {
  return `<span class="input-visual key-visual slot-visual">${inputSlotLabel(id)}</span>`;
}

function cueSlotVisual(id) {
  return slotVisual(id);
  const label = inputSlotLabel(id);
  if (label.startsWith("A")) {
    return `<span class="input-visual key-visual slot-visual cue-slot"><span class="cue-arrow">←</span><span>${label}</span></span>`;
  }
  if (label.startsWith("B")) {
    return `<span class="input-visual key-visual slot-visual cue-slot"><span>${label}</span><span class="cue-arrow">→</span></span>`;
  }
  return slotVisual(id);
}

function inputSlotLabel(id, settings = state.settings) {
  if (SLOT_IDS.includes(id)) return id;
  const groups = cleanInputGroups(settings);
  const slots = [
    ["groupAKey1", "A1"],
    ["groupAKey2", "A2"],
    ["groupBKey1", "B1"],
    ["groupBKey2", "B2"],
  ];
  const match = slots.find(([key]) => groups[key] === id);
  return match?.[1] || inputLabel(id);
}

function inputSlotSpeechLabel(id) {
  const label = inputSlotLabel(id);
  return label.replace(/^([AB])(\d+)$/, (_, group, slot) => `${group} ${slot === "1" ? "one" : "two"}`);
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
  return [...groups.A, ...groups.B].filter(Boolean);
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

function getSelectedMap() {
  return state.maps.find((map) => map.id === state.selectedMapId) || null;
}

function getMapRequiredSlots(map) {
  const slots = new Set();
  (map?.cells || []).forEach((cell) => {
    const cellSlots = cell?.displayedInstruction?.slots || [];
    cellSlots.forEach((slot) => {
      if (SLOT_IDS.includes(slot)) slots.add(slot);
    });
  });
  return SLOT_IDS.filter((slot) => slots.has(slot));
}

function validateMapForRun(map, settings = state.settings) {
  if (!map) return { ok: false, message: "Generate or select a map before starting." };
  const missingSlots = getMapRequiredSlots(map).filter((slot) => !slotToInputId(slot, settings));
  if (missingSlots.length) {
    return {
      ok: false,
      message: `Selected map needs ${missingSlots.join(", ")}. Assign those input slots before starting.`,
    };
  }
  return { ok: true, message: "" };
}

function defaultMapName() {
  return `Map ${new Date().toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function generateMapFromCurrentSettings() {
  state.settings = cleanPreset(state.settings);
  const map = generateSavedMap(state.settings);
  state.maps = [map, ...state.maps.filter((item) => item.id !== map.id)].slice(0, MAX_SAVED_MAPS);
  state.selectedMapId = map.id;
  saveSavedMaps();
  setMessage(`Generated ${map.name}.`, "good");
  render();
}

function selectMap(mapId) {
  if (!state.maps.some((map) => map.id === mapId)) return;
  state.selectedMapId = mapId;
  setMessage("Map selected. Start training or adjust run settings.", "");
  render();
}

function deleteSelectedMap() {
  const selectedMap = getSelectedMap();
  if (!selectedMap) return;
  state.maps = state.maps.filter((map) => map.id !== selectedMap.id);
  state.selectedMapId = state.maps[0]?.id || "";
  saveSavedMaps();
  setMessage(`Deleted ${selectedMap.name}.`, "");
  render();
}

function renameSelectedMap() {
  const selectedMap = getSelectedMap();
  if (!selectedMap) return;
  const nextName = window.prompt("Map name", selectedMap.name);
  if (nextName === null) return;
  const cleanedName = nextName.trim().slice(0, 64);
  if (!cleanedName) return;
  selectedMap.name = cleanedName;
  saveSavedMaps();
  render();
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
  if (
    key === "slotVoiceEnabled" ||
    key === "adaptiveResponseEnabled" ||
    key === "distinctNoGoToneEnabled" ||
    key === "livesEnabled"
  ) {
    state.settings[key] = value === true || value === "true";
    state.settings = cleanPreset(state.settings);
    if (key === "slotVoiceEnabled" && !state.settings[key]) stopSlotAudio();
    render();
    return;
  }
  if (key === "routePageSize" || key === "routePageCount") {
    state.settings[key] = Number(value);
    syncRouteSettingLimits();
    return;
  }
  state.settings[key] = Number(value);
}

function syncRouteSettingLimits() {
  const routePageSize = Math.round(
    clampNumber(
      state.settings.routePageSize,
      MIN_ROUTE_PAGE_SIZE,
      Math.min(MAX_ROUTE_PAGE_SIZE, MAX_PATH_LENGTH),
      DEFAULT_ROUTE_PAGE_SIZE,
    ),
  );
  const maxRoutePages = Math.min(MAX_ROUTE_PAGE_COUNT, Math.max(1, Math.floor(MAX_PATH_LENGTH / routePageSize)));
  const routePageCountInput = document.getElementById("routePageCount");
  const sequenceStartPageInput = document.getElementById("sequenceStartPage");
  if (routePageCountInput) routePageCountInput.max = String(maxRoutePages);
  if (sequenceStartPageInput) sequenceStartPageInput.max = String(maxRoutePages);
}

function updateSoundSetting(key, value) {
  if (key === "soundEnabled") state.soundEnabled = value;
  if (key === "soundVolume") state.soundVolume = clampNumber(value, 0, MAX_SOUND_VOLUME, DEFAULT_SOUND_VOLUME);
  if (state.slotAudio) {
    state.slotAudio.volume = Math.max(0, Math.min(1, state.soundVolume));
  }
  saveSoundSettings();
}

function saveCurrentPreset() {
  const targetId = CUSTOM_IDS.includes(state.selectedPresetId) ? state.selectedPresetId : "custom1";
  state.customPresets[targetId] = cleanPreset({ ...state.settings, label: CUSTOM_LABELS[targetId] });
  state.selectedPresetId = targetId;
  state.settings = { ...state.customPresets[targetId] };
  saveCustomPresets();
  render();
}

function restoreCurrentDefaultPreset() {
  const targetId = CUSTOM_IDS.includes(state.selectedPresetId) ? state.selectedPresetId : "custom1";
  state.settings = cleanPreset(getDefaultPresetValues()[targetId]);
  render();
}

function initializeAdaptiveSession() {
  state.adaptiveCorrectStreak = 0;
  state.adaptiveMultiplier = 1;
}

function startGame() {
  clearTimers();
  state.settings = cleanPreset(state.settings);
  const selectedMap = getSelectedMap();
  const validation = validateMapForRun(selectedMap, state.settings);
  if (!validation.ok) {
    setMessage(validation.message, "bad");
    render();
    return;
  }
  ensureAudio();
  requestGameFullscreen();
  requestGamePointerLock();
  initializeAdaptiveSession();
  state.screen = "game";
  state.phase = "waiting";
  state.score = 0;
  state.combo = 0;
  state.lives = state.settings.maxLives;
  state.activeMap = selectedMap;
  state.boardCells = loadBoardCellsFromMap(selectedMap, state.settings);
  state.boardPosition = 0;
  state.previousBoardPosition = 0;
  state.playerStepping = false;
  state.stepDirection = "";
  state.visitedCells = new Set([0]);
  state.currentStimulus = null;
  state.stimulusId = 0;
  state.cueTimer = null;
  state.cueTimerStartedAt = 0;
  state.cueTimerDelay = 0;
  state.responseTimer = null;
  state.cueVisibilityTimer = null;
  resetPauseState();
  state.trials = [];
  state.movementHistory = [];
  state.sessionStartedAt = Date.now();
  state.sessionEndedAt = 0;
  state.sessionHistorySaved = false;
  setMessage("Ready... wait for the target cue.", "");
  scheduleViewportSync();
  render();
  scheduleStimulus();
}

function generateBoardCells(settings) {
  return loadBoardCellsFromMap(generateSavedMap(settings), settings);
}

function generateSavedMap(settings) {
  const mapSettings = cleanPreset(settings);
  const length = mapSettings.pathLength;
  const cells = Array.from({ length }, (_, index) => ({ index, type: "normal" }));

  placeZones(cells, "reverse", mapSettings.reverseZones, 2, 4);
  placeZones(cells, "nback1", mapSettings.nbackZones, 2, 3);
  cells[0].type = "start";
  cells[cells.length - 1].type = "finish";
  applyMapEvents(cells, mapSettings);
  return {
    id: createId("map"),
    name: defaultMapName(),
    createdAt: Date.now(),
    version: MAP_VERSION,
    mapSettingsSnapshot: pickMapSettings(mapSettings),
    routePageSize: mapSettings.routePageSize,
    routePageCount: mapSettings.routePageCount,
    pathLength: mapSettings.pathLength,
    requiredSlots: getMapRequiredSlots({ cells }),
    cells,
  };
}

function applyMapEvents(cells, settings) {
  const delays = generateRouteDelays(settings, cells.length);
  let previousGroup = null;

  cells.forEach((cell, index) => {
    const slots = randomSlotSequence(
      getSequenceLengthForCell(index, settings),
      previousGroup,
      settings,
    );
    previousGroup = slotGroup(slots[slots.length - 1]);
    cell.delayMs = delays[index];
    cell.displayedInstruction = {
      light: Math.random() * 100 < settings.redRate ? "red" : "green",
      slots,
    };
  });
}

function loadBoardCellsFromMap(map, settings = state.settings) {
  if (!map) return [];
  const cells = map.cells.map((cell, index) => ({
    index,
    type: cell.type,
    delayMs: cell.delayMs,
    displayedInstruction: {
      light: cell.displayedInstruction.light,
      slots: [...cell.displayedInstruction.slots],
      displayKeys: slotSequenceToInputs(cell.displayedInstruction.slots, settings),
    },
  }));
  cells.forEach((cell, index) => {
    const previousDisplayed = cells[index - 1]?.displayedInstruction || null;
    cell.requiredInstruction = getRequiredInstruction(
      cell.displayedInstruction,
      cell.type,
      previousDisplayed,
      settings,
    );
  });
  return cells;
}

function generateRouteDelays(settings, routeLength) {
  const blockSize = Math.max(1, Math.round(settings.delayBlockSize));
  const blockCount = Math.max(1, Math.ceil(routeLength / blockSize));
  const randomValues = Array.from({ length: blockCount }, () => settings.baseInterval + Math.random() * settings.jitter);
  const balancedValues = shuffleArray(evenlySpacedDelays(settings.baseInterval, settings.jitter, blockCount));
  const balance = settings.delayBalance;
  const blockDelays = randomValues.map((randomValue, index) =>
    Math.max(250, Math.round(randomValue * (1 - balance) + balancedValues[index] * balance)),
  );

  return Array.from({ length: routeLength }, (_, index) => blockDelays[Math.floor(index / blockSize)]);
}

function evenlySpacedDelays(baseInterval, jitter, count) {
  if (count === 1) return [baseInterval + jitter / 2];
  return Array.from({ length: count }, (_, index) => baseInterval + (jitter * index) / (count - 1));
}

function shuffleArray(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
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
  clearCueVisibilityTimer();
  clearCueTimer();
  stopSlotAudio();
  state.phase = "waiting";
  state.currentStimulus = null;
  state.timerPercent = 0;
  render();
  setCueTimer(showStimulus, getCurrentDelay());
}

function queueNextStimulus() {
  setCueTimer(showStimulus, getCurrentDelay());
}

function showStimulus() {
  if (state.isPaused) return;
  clearResponseTimer();
  clearCueVisibilityTimer();
  stopSlotAudio();
  if (!state.currentStimulus || state.currentStimulus.responded) {
    const routeCell = getCurrentRouteCell();
    if (!routeCell) return;
    const stimulusId = state.stimulusId + 1;
    state.stimulusId = stimulusId;
    state.currentStimulus = {
      id: stimulusId,
      displayedInstruction: cloneInstruction(routeCell.displayedInstruction),
      requiredInstruction: cloneInstruction(routeCell.requiredInstruction),
      rule: routeCell.type,
      responded: false,
      stepIndex: 0,
      stepReactionTimes: [],
      targetVisible: true,
      startPosition: state.boardPosition,
    };
  }
  const stimulusId = state.currentStimulus.id;
  state.phase = "rightStimulus";
  state.currentStimulus.stepIndex = 0;
  state.cueVisibleStartedAt = performance.now();
  playSound(state.currentStimulus.displayedInstruction.light === "red" ? "nogoCue" : "cue");
  setMessage(
    stimulusMessage(state.currentStimulus),
    state.currentStimulus.requiredInstruction.light === "green" ? "good" : "bad",
  );
  syncTargetVisibility(stimulusId);
  startResponseStep(stimulusId, 0);
  scheduleSlotVoice(stimulusId);
}

function scheduleSlotVoice(stimulusId) {
  const keys = instructionDisplayKeys(state.currentStimulus?.displayedInstruction);
  if (!keys.length) return;
  setTimer(() => {
    if (
      state.phase !== "rightStimulus" ||
      state.isPaused ||
      !state.currentStimulus ||
      state.currentStimulus.id !== stimulusId ||
      state.currentStimulus.responded
    ) {
      return;
    }
    speakSlotSequence(keys);
  }, SLOT_VOICE_DELAY_MS);
}

function cloneInstruction(instruction) {
  return {
    ...instruction,
    slots: Array.isArray(instruction.slots) ? [...instruction.slots] : [],
    displayKeys: instructionDisplayKeys(instruction),
    effectiveKeys: instructionEffectiveKeys(instruction),
  };
}

function startResponseStep(stimulusId, stepIndex, elapsed = 0) {
  const stimulus = state.currentStimulus;
  if (!stimulus || stimulus.id !== stimulusId || stimulus.responded) return;
  clearResponseTimer();
  stimulus.stepIndex = stepIndex;
  const responseWindow = getResponseWindowForStep(stimulus, stepIndex);
  state.stimulusStartedAt = performance.now() - elapsed;
  startVisualTimer(responseWindow, elapsed);
  render();
  startResponseTimer(stimulusId, responseWindow - elapsed);
}

function startResponseTimer(stimulusId, delay) {
  clearResponseTimer();
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
    const responseWindow = getResponseWindowForStep(state.currentStimulus, state.currentStimulus.stepIndex);
    finishRightTrial({
      input: null,
      result: required.light === "red" ? "nogoSuccess" : "miss",
      success: required.light === "red",
      reactionTime: responseWindow,
    });
  }, Math.max(0, delay));
}

function getResponseWindowForStep(stimulus, stepIndex = 0) {
  const multiplier = state.settings.adaptiveResponseEnabled ? state.adaptiveMultiplier : 1;
  const baseWindow = getScaledResponseWindow(state.settings, multiplier);
  if (!stimulus || stepIndex !== 0) return baseWindow;
  const displayedKeyCount = Math.max(1, instructionDisplayKeys(stimulus.displayedInstruction).length);
  return baseWindow + getScaledFirstResponseKeyBonus(state.settings, multiplier) * displayedKeyCount;
}

function startCueVisibilityTimer(stimulusId, delay) {
  clearCueVisibilityTimer();
  if (delay <= 0) {
    hideCurrentTarget(stimulusId);
    return;
  }
  state.cueVisibilityTimer = setTimer(() => hideCurrentTarget(stimulusId), delay);
}

function syncTargetVisibility(stimulusId) {
  const stimulus = state.currentStimulus;
  if (!stimulus || stimulus.id !== stimulusId) return;
  const elapsed = Math.max(0, performance.now() - state.cueVisibleStartedAt);
  const remaining = state.settings.cueVisibleMs - elapsed;
  stimulus.targetVisible = remaining > 0;
  if (remaining > 0) {
    startCueVisibilityTimer(stimulusId, remaining);
  } else {
    clearCueVisibilityTimer();
  }
}

function hideCurrentTarget(stimulusId) {
  if (
    state.phase !== "rightStimulus" ||
    !state.currentStimulus ||
    state.currentStimulus.id !== stimulusId ||
    state.currentStimulus.responded
  ) {
    return;
  }
  state.cueVisibilityTimer = null;
  state.currentStimulus.targetVisible = false;
  render();
}

function togglePause() {
  if (!canPauseGame()) return;
  if (state.isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function canPauseGame() {
  return (
    state.screen === "game" &&
    state.boardPosition < state.boardCells.length - 1 &&
    (state.phase === "waiting" || state.phase === "rightStimulus")
  );
}

function pauseGame() {
  if (!canPauseGame() || state.isPaused) return;
  const now = performance.now();
  state.isPaused = true;
  state.pausedPhase = state.phase;

  if (state.phase === "waiting") {
    state.cueRemainingMs = state.cueTimer
      ? Math.max(0, state.cueTimerDelay - (now - state.cueTimerStartedAt))
      : getCurrentDelay();
    clearCueTimer();
  }

  if (state.phase === "rightStimulus") {
    stopSlotAudio();
    const responseWindow = getResponseWindowForStep(state.currentStimulus, state.currentStimulus?.stepIndex || 0);
    state.responseElapsedBeforePause = Math.min(responseWindow, Math.max(0, now - state.stimulusStartedAt));
    state.cueVisibilityElapsedBeforePause = Math.min(state.settings.cueVisibleMs, Math.max(0, now - state.cueVisibleStartedAt));
    clearResponseTimer();
    clearCueVisibilityTimer();
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
    state.timerPercent = Math.min(100, (state.responseElapsedBeforePause / responseWindow) * 100);
  }

  render();
}

function resumeGame() {
  if (!state.isPaused) return;
  const pausedPhase = state.pausedPhase;
  state.isPaused = false;
  state.pausedPhase = null;

  if (pausedPhase === "waiting") {
    setCueTimer(showStimulus, state.cueRemainingMs);
  }

  if (pausedPhase === "rightStimulus" && state.currentStimulus && !state.currentStimulus.responded) {
    const responseWindow = getResponseWindowForStep(state.currentStimulus, state.currentStimulus.stepIndex);
    const elapsed = Math.min(responseWindow, Math.max(0, state.responseElapsedBeforePause));
    state.cueVisibleStartedAt = performance.now() - state.cueVisibilityElapsedBeforePause;
    syncTargetVisibility(state.currentStimulus.id);
    startResponseStep(state.currentStimulus.id, state.currentStimulus.stepIndex, elapsed);
    scheduleSlotVoice(state.currentStimulus.id);
  }

  state.cueRemainingMs = 0;
  state.responseElapsedBeforePause = 0;
  state.cueVisibilityElapsedBeforePause = 0;
  render();
}

function getCurrentRule() {
  return getCurrentRouteCell()?.type || "normal";
}

function getCurrentRouteCell(position = state.boardPosition) {
  return state.boardCells[position] || null;
}

function getCurrentDelay() {
  const delay = getCurrentRouteCell()?.delayMs ?? state.settings.baseInterval;
  return Math.max(250, delay);
}

function getRequiredInstruction(displayedInstruction, rule, previousDisplayedInstruction = null, settings = state.settings) {
  if (rule === "nback1") {
    const previous = previousDisplayedInstruction || displayedInstruction;
    const previousDisplayKeys = instructionDisplayKeys(previous);
    return {
      light: previous.light,
      displayKeys: previousDisplayKeys,
      effectiveKeys: previous.light === "green" ? [...previousDisplayKeys] : [],
      source: "previous",
    };
  }
  const displayKeys = instructionDisplayKeys(displayedInstruction);
  if (displayedInstruction.light === "red") {
    return { light: "red", displayKeys, effectiveKeys: [], source: "current" };
  }
  return {
    light: "green",
    displayKeys,
    effectiveKeys: rule === "reverse" ? displayKeys.map((input) => reverseInput(input, settings)) : [...displayKeys],
    source: "current",
  };
}

function instructionDisplayKeys(instruction) {
  if (!instruction) return [];
  if (Array.isArray(instruction.displayKeys)) return instruction.displayKeys.filter(Boolean);
  return instruction.displayKey ? [instruction.displayKey] : [];
}

function instructionEffectiveKeys(instruction) {
  if (!instruction || instruction.light === "red") return [];
  if (Array.isArray(instruction.effectiveKeys)) return instruction.effectiveKeys.filter(Boolean);
  return instruction.effectiveKey ? [instruction.effectiveKey] : [];
}

function stimulusMessage(stimulus) {
  const required = stimulus.requiredInstruction;
  if (stimulus.rule === "nback1") {
    if (required.light === "red") return "1-back: the previous cue was NO-GO. Do not press.";
    return `1-back: press the previous cue sequence, ${inputSequenceLabel(instructionEffectiveKeys(required))}.`;
  }
  if (required.light === "red") return "NO-GO: stay still and do not press.";
  if (stimulus.rule === "reverse") return "Reverse zone: press the matching slot in the other group.";
  return "GO: press the target, then get ready.";
}

function startVisualTimer(duration, elapsed = 0) {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
  state.timerStartedAt = performance.now() - elapsed;
  state.timerDuration = duration;
  function tick() {
    if (state.phase !== "rightStimulus" || state.isPaused) return;
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
  stopSlotAudio();
  clearResponseTimer();
  clearCueVisibilityTimer();
  stimulus.responded = true;
  const fromPosition = state.boardPosition;
  const displayedKeys = instructionDisplayKeys(stimulus.displayedInstruction);
  const requiredKeys = instructionEffectiveKeys(stimulus.requiredInstruction);
  const displayedGroups = displayedKeys.map((key) => inputGroup(key));
  const reactionTimes = [...stimulus.stepReactionTimes];
  const adaptiveMultiplier = state.settings.adaptiveResponseEnabled ? state.adaptiveMultiplier : 1;
  const trialResponseWindow = getScaledResponseWindow(state.settings, adaptiveMultiplier);
  const trialFirstResponseKeyBonusMs = getScaledFirstResponseKeyBonus(state.settings, adaptiveMultiplier);
  if (success && stimulus.requiredInstruction.light === "green" && Number.isFinite(reactionTime)) {
    reactionTimes.push(reactionTime);
  }

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
    reduceLife();
    setMessage(errorMessage(result, stimulus), "bad");
  }

  state.trials.push({
    step: state.trials.length + 1,
    rule: stimulus.rule,
    fromPosition,
    toPosition: state.boardPosition,
    displayedLight: stimulus.displayedInstruction.light,
    displayedKey: displayedKeys[0] || null,
    displayedKeys,
    displayedGroup: displayedGroups[0] || null,
    displayedGroups,
    requiredLight: stimulus.requiredInstruction.light,
    requiredKey: requiredKeys[0] || null,
    requiredKeys,
    input,
    reactionTime: Math.round(reactionTime),
    reactionTimes: reactionTimes.map((time) => Math.round(time)),
    completedSteps: stimulus.requiredInstruction.light === "green" ? reactionTimes.length : 0,
    responseWindow: trialResponseWindow,
    firstResponseKeyBonusMs: trialFirstResponseKeyBonusMs,
    adaptiveMultiplier: Number(adaptiveMultiplier.toFixed(4)),
    livesRemaining: state.settings.livesEnabled ? state.lives : null,
    result,
    success,
  });

  updateAdaptiveAfterTrial(stimulus, success);

  state.phase = "waiting";
  state.currentStimulus = null;
  state.timerPercent = 0;
  setMessage("Ready... wait for the target cue.", "");
  render();
  if (isOutOfLives()) {
    playSound("finish");
    setTimer(finishSession, 750);
  } else if (state.boardPosition >= state.boardCells.length - 1) {
    playSound("finish");
    setTimer(finishSession, 750);
  } else {
    queueNextStimulus();
  }
}

function reduceLife() {
  if (!state.settings.livesEnabled) return;
  state.lives = Math.max(0, state.lives - 1);
}

function isOutOfLives() {
  return state.settings.livesEnabled && state.lives <= 0;
}

function updateAdaptiveAfterTrial(stimulus, success) {
  if (!state.settings.adaptiveResponseEnabled || !stimulus) return;
  const required = stimulus.requiredInstruction;
  if (success && required.light === "green") {
    state.adaptiveCorrectStreak += 1;
    if (state.adaptiveCorrectStreak >= state.settings.adaptiveCorrectStreakTarget) {
      state.adaptiveCorrectStreak = 0;
      applyAdaptiveMultiplierChange(1 - state.settings.adaptiveDecreasePercent / 100);
    }
    return;
  }
  if (!success) {
    state.adaptiveCorrectStreak = 0;
    applyAdaptiveMultiplierChange(1 + state.settings.adaptiveIncreasePercent / 100);
  }
}

function applyAdaptiveMultiplierChange(factor) {
  if (!Number.isFinite(factor) || factor <= 0) return;
  state.adaptiveMultiplier = clampAdaptiveMultiplier(state.adaptiveMultiplier * factor, state.settings);
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
  state.previousBoardPosition = from;
  state.boardPosition = to;
  state.stepDirection = delta > 0 ? "forward" : "back";
  state.visitedCells.add(to);
  state.movementHistory.push({ from, to, delta, time: Date.now() });
  triggerPlayerStep();
  if (to !== from) playSound("step");
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
  if (state.isPaused) return;
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
  const requiredKeys = instructionEffectiveKeys(required);
  const stepIndex = stimulus.stepIndex || 0;
  const expectedInput = requiredKeys[stepIndex];
  if (input !== expectedInput) {
    finishRightTrial({ input, result: "wrongGo", success: false, reactionTime });
    return;
  }
  if (stepIndex < requiredKeys.length - 1) {
    stimulus.stepReactionTimes.push(reactionTime);
    playSound("success");
    clearCueVisibilityTimer();
    stimulus.targetVisible = false;
    setMessage(`Correct key ${stepIndex + 1}/${requiredKeys.length}. Continue the sequence.`, "good");
    startResponseStep(stimulus.id, stepIndex + 1);
    return;
  }
  finishRightTrial({
    input,
    result: "goSuccess",
    success: true,
    reactionTime,
  });
}

function finishSession() {
  clearTimers();
  state.sessionEndedAt = Date.now();
  recordSessionHistory();
  state.screen = "summary";
  state.phase = "sessionComplete";
  setMessage("Training complete.", "");
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function recordSessionHistory() {
  if (state.sessionHistorySaved || !state.sessionStartedAt || !state.sessionEndedAt) return;
  const metrics = getMetrics();
  const map = state.activeMap || getSelectedMap();
  const entry = {
    id: `${state.sessionEndedAt}-${Math.random().toString(36).slice(2, 8)}`,
    startedAt: state.sessionStartedAt,
    endedAt: state.sessionEndedAt,
    durationMs: getSessionDurationMs(),
    presetId: state.selectedPresetId,
    presetLabel: CUSTOM_LABELS[state.selectedPresetId] || "Custom",
    mapId: map?.id || "",
    mapName: map?.name || "Unknown map",
    progress: metrics.progress,
    reachedPage: metrics.reachedPage,
    totalPages: metrics.totalPages,
    reachedPageLabel: metrics.reachedPageLabel,
    hitRate: metrics.hitRate,
    avgRt: metrics.avgRt,
    noGoErrors: metrics.noGoErrors,
    reverseErrors: metrics.reverseErrors,
    nbackErrors: metrics.nbackErrors,
    finalResponseWindow: metrics.finalResponseWindow,
    score: state.score,
    trials: state.trials.length,
    routeSpaces: state.boardCells.length,
    adaptiveResponseEnabled: state.settings.adaptiveResponseEnabled,
  };
  state.sessionHistory = [entry, ...state.sessionHistory].slice(0, MAX_HISTORY_ENTRIES);
  state.sessionHistorySaved = true;
  saveSessionHistory();
}

function restart() {
  state.screen = "config";
  state.phase = "idle";
  state.activeMap = null;
  clearTimers();
  releaseGamePointerLock();
  releaseGameFullscreen();
  render();
}

function showHistory() {
  state.screen = "history";
  state.phase = "idle";
  render();
}

function backToConfig() {
  state.screen = "config";
  state.phase = "idle";
  render();
}

function getMetrics() {
  const goTrials = state.trials.filter((trial) => trial.requiredLight === "green");
  const goHits = goTrials.filter((trial) => trial.result === "goSuccess").length;
  const noGoTrials = state.trials.filter((trial) => trial.requiredLight === "red");
  const noGoErrors = noGoTrials.filter((trial) => trial.result === "falseAlarm").length;
  const goReactionTimes = goTrials
    .filter((trial) => trial.result === "goSuccess")
    .flatMap((trial) => (Array.isArray(trial.reactionTimes) && trial.reactionTimes.length ? trial.reactionTimes : [trial.reactionTime]));
  const avgRt =
    goReactionTimes.length === 0
      ? 0
      : Math.round(goReactionTimes.reduce((sum, value) => sum + value, 0) / goReactionTimes.length);
  const reverseErrors = state.trials.filter((trial) => trial.rule === "reverse" && !trial.success).length;
  const nbackErrors = state.trials.filter((trial) => trial.rule === "nback1" && !trial.success).length;
  const hitRate = goTrials.length === 0 ? 0 : Math.round((goHits / goTrials.length) * 100);
  const progress = `${state.boardPosition + 1}/${state.boardCells.length}`;
  const pageInfo = getReachedPageInfo();
  const duration = formatSessionDuration(getSessionDurationMs());
  const finalResponseWindow = getScaledResponseWindow(
    state.settings,
    state.settings.adaptiveResponseEnabled ? state.adaptiveMultiplier : 1,
  );
  return {
    hitRate,
    noGoErrors,
    avgRt,
    reverseErrors,
    nbackErrors,
    progress,
    reachedPage: pageInfo.current,
    totalPages: pageInfo.total,
    reachedPageLabel: pageInfo.label,
    duration,
    finalResponseWindow,
  };
}

function getReachedPageInfo(position = state.boardPosition) {
  const routePageSize = getRoutePageSize();
  const totalSpaces = Math.max(1, state.boardCells.length || state.settings.pathLength || routePageSize);
  const total = Math.max(1, Math.ceil(totalSpaces / routePageSize));
  const current = Math.max(1, Math.min(total, Math.floor(Math.max(0, position) / routePageSize) + 1));
  return {
    current,
    total,
    label: `Page ${current}/${total}`,
  };
}

function getHistoryMetrics() {
  const entries = state.sessionHistory;
  const completed = entries.filter((entry) => entry.progress && entry.progress.split("/")[0] === entry.progress.split("/")[1]).length;
  const avgHitRate = averageMetric(entries, "hitRate");
  const avgRt = averageMetric(entries.filter((entry) => entry.avgRt > 0), "avgRt");
  const bestHitRate = entries.length ? Math.max(...entries.map((entry) => entry.hitRate || 0)) : 0;
  return {
    sessions: entries.length,
    completed,
    avgHitRate,
    avgRt,
    bestHitRate,
  };
}

function averageMetric(entries, key) {
  if (!entries.length) return 0;
  return Math.round(entries.reduce((sum, entry) => sum + (Number(entry[key]) || 0), 0) / entries.length);
}

function getSessionDurationMs() {
  if (!state.sessionStartedAt) return 0;
  const endedAt = state.sessionEndedAt || Date.now();
  return Math.max(0, endedAt - state.sessionStartedAt);
}

function formatSessionDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderConfig() {
  const s = state.settings;
  const currentLabel = CUSTOM_LABELS[state.selectedPresetId] || "Custom 1";
  const saveLabel = `Save ${currentLabel}`;
  const selectedMap = getSelectedMap();
  const mapValidation = validateMapForRun(selectedMap, s);
  const startDisabled = mapValidation.ok ? "" : "disabled";
  app.innerHTML = `
    <section class="screen config-screen">
      <div class="config-shell">
        <div class="title-row">
          <div>
            <h1>Move & Think</h1>
            <p class="subtitle">V7 map mode: generate a saved route map, then replay it with the current run settings.</p>
          </div>
        </div>

        <div class="config-card preset-card">
          <div class="preset-card-header">
            <div>
              <label>Settings</label>
              <p class="card-help">Pick one custom settings set. Map settings affect future generated maps; run settings affect each play session.</p>
            </div>
            <div class="preset-actions">
              <button id="restorePresetBtn" type="button">Restore Defaults</button>
              <button id="savePresetBtn" type="button">${saveLabel}</button>
            </div>
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

        ${renderMapLibrary(selectedMap, mapValidation)}

        <div class="current-preset">
          <div class="panel-header">
            <h2>Map Settings</h2>
            <span>${currentLabel}</span>
          </div>
          <div class="preset-sections">
            ${settingsSection("Route Shape", "These values are frozen into newly generated maps.", `
              ${numberField("routePageSize", "Spaces per page", s.routePageSize, MIN_ROUTE_PAGE_SIZE, Math.min(MAX_ROUTE_PAGE_SIZE, MAX_PATH_LENGTH), 1)}
              ${numberField("routePageCount", "Route pages", s.routePageCount, 1, Math.min(MAX_ROUTE_PAGE_COUNT, Math.floor(MAX_PATH_LENGTH / s.routePageSize)), 1)}
              ${numberField("mapSlotPairs", "Slot pairs", s.mapSlotPairs, 1, 2, 1)}
              ${numberField("sequenceStartPage", "Sequence start page", s.sequenceStartPage, 1, Math.min(MAX_ROUTE_PAGE_COUNT, Math.floor(MAX_PATH_LENGTH / s.routePageSize)), 1)}
              ${numberField("sequenceIncrementPages", "Sequence page step", s.sequenceIncrementPages, 1, 20, 1)}
              ${numberField("maxSequenceLength", "Max sequence length", s.maxSequenceLength, 1, MAX_SEQUENCE_LENGTH, 1)}
            `)}
            ${settingsSection("Map Events", "Generated maps save each cue, zone, and wait time.", `
              ${numberField("baseInterval", "Cue interval ms", s.baseInterval, 400, 4000, 50)}
              ${numberField("jitter", "Random jitter ms", s.jitter, 0, 2000, 50)}
              ${numberField("delayBlockSize", "Delay block size", s.delayBlockSize, 1, MAX_PATH_LENGTH, 1)}
              ${numberField("delayBalance", "Delay balance", s.delayBalance, 0, 1, 0.05)}
              ${numberField("redRate", "Red light rate %", s.redRate, 0, 80, 5)}
              ${numberField("reverseZones", "Reverse zones", s.reverseZones, 0, 6, 1)}
              ${numberField("nbackZones", "1-back zones", s.nbackZones, 0, 6, 1)}
              ${numberField("abAlternation", "AB alternation", s.abAlternation, 0, 1, 0.05)}
            `)}
          </div>
        </div>

        <div class="current-preset">
          <div class="panel-header">
            <h2>Run Settings</h2>
            <span>Applied when a selected map starts</span>
          </div>
          <div class="preset-sections">
            ${settingsSection("Timing", "Response windows and audio prompts can change between runs.", `
              ${toggleField("adaptiveResponseEnabled", "Adaptive window", s.adaptiveResponseEnabled)}
              ${numberField("adaptiveCorrectStreakTarget", "Correct streak to decrease", s.adaptiveCorrectStreakTarget, 1, 10, 1)}
              ${numberField("adaptiveDecreasePercent", "Decrease %", s.adaptiveDecreasePercent, 0, 50, 1)}
              ${numberField("adaptiveIncreasePercent", "Increase %", s.adaptiveIncreasePercent, 0, 50, 1)}
              ${numberField("responseWindow", "Response window ms", s.responseWindow, MIN_RESPONSE_WINDOW, MAX_RESPONSE_WINDOW, 50)}
              ${numberField("firstResponseKeyBonusMs", "First window bonus / key ms", s.firstResponseKeyBonusMs, 0, 1000, 50)}
              ${numberField("cueVisibleMs", "Cue visible ms", s.cueVisibleMs, 100, Math.max(100, s.responseWindow - 50), 50)}
              ${toggleField("slotVoiceEnabled", "Slot voice", s.slotVoiceEnabled)}
              ${toggleField("distinctNoGoToneEnabled", "Distinct NO-GO tone", s.distinctNoGoToneEnabled)}
              ${numberField("delayColorStrength", "Delay color strength", s.delayColorStrength, 0, 1, 0.05)}
            `)}
            ${settingsSection("Lives", "Lives affect only the current run, not the selected map.", `
              ${toggleField("livesEnabled", "Lives", s.livesEnabled)}
              ${numberField("maxLives", "Max lives", s.maxLives, 1, MAX_LIVES, 1)}
            `)}
          </div>
        </div>

        <div class="current-preset input-groups-panel">
          <div class="panel-header">
            <h2>Input Groups</h2>
            <span>Place A and B inputs far apart; reverse maps A1/B1 and A2/B2</span>
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
            <input id="soundVolume" type="range" min="0" max="${MAX_SOUND_VOLUME}" step="0.05" value="${state.soundVolume}" />
            <button type="button" id="soundTestBtn">Test</button>
          </div>
        </div>

        <div class="actions">
          <p class="safety ${state.messageTone}">${escapeHtml(state.message || "Make sure the floor is clear. Place group A and group B inputs far apart.")}</p>
          <div class="action-buttons">
            <button id="historyBtn" type="button">History</button>
            <button class="primary" id="startBtn" ${startDisabled}>Start Training</button>
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
  document.getElementById("restorePresetBtn").addEventListener("click", restoreCurrentDefaultPreset);
  document.getElementById("savePresetBtn").addEventListener("click", saveCurrentPreset);
  document.getElementById("generateMapBtn").addEventListener("click", generateMapFromCurrentSettings);
  document.getElementById("renameMapBtn").addEventListener("click", renameSelectedMap);
  document.getElementById("deleteMapBtn").addEventListener("click", deleteSelectedMap);
  document.querySelectorAll("[data-map-id]").forEach((button) => {
    button.addEventListener("click", () => selectMap(button.dataset.mapId));
  });
  document.getElementById("historyBtn").addEventListener("click", showHistory);
  document.getElementById("startBtn").addEventListener("click", startGame);
}

function renderMapLibrary(selectedMap, mapValidation) {
  const mapList = state.maps.length
    ? state.maps
        .map(
          (map) => `
            <button type="button" class="map-list-item ${map.id === state.selectedMapId ? "active" : ""}" data-map-id="${map.id}">
              <strong>${escapeHtml(map.name)}</strong>
              <span>${map.pathLength} spaces | ${map.routePageCount} pages | ${formatSlotList(map.requiredSlots)}</span>
              <span>${formatHistoryDate(map.createdAt)}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="map-empty">No saved maps yet. Generate a map from the current map settings.</div>`;
  return `
    <div class="current-preset map-panel">
      <div class="panel-header">
        <h2>Maps</h2>
        <span>${selectedMap ? escapeHtml(selectedMap.name) : "No map selected"}</span>
      </div>
      <div class="map-panel-body">
        <div class="map-actions">
          <button class="primary" id="generateMapBtn" type="button">Generate Map</button>
          <button id="renameMapBtn" type="button" ${selectedMap ? "" : "disabled"}>Rename</button>
          <button id="deleteMapBtn" type="button" ${selectedMap ? "" : "disabled"}>Delete</button>
        </div>
        <div class="map-list">${mapList}</div>
        <p class="map-status ${mapValidation.ok ? "good" : "bad"}">${escapeHtml(mapValidation.ok ? "Selected map is ready for the current input slots." : mapValidation.message)}</p>
      </div>
    </div>
  `;
}

function formatSlotList(slots) {
  return slots?.length ? slots.join(", ") : "No slots";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function numberField(key, label, value, min, max, step) {
  return `
    <div class="config-card field">
      <div class="field-label-row">
        <label for="${key}">${label}</label>
        ${fieldHelp(key)}
      </div>
      <input id="${key}" data-setting="${key}" type="number" inputmode="numeric" min="${min}" max="${max}" step="${step}" value="${value}" />
    </div>
  `;
}

function settingsSection(title, description, fields) {
  return `
    <section class="settings-group">
      <div class="settings-group-header">
        <h3>${title}</h3>
        <span>${description}</span>
      </div>
      <div class="config-grid">
        ${fields}
      </div>
    </section>
  `;
}

function selectField(key, label, value) {
  const selectedIds = new Set(getConfiguredInputIds().filter((id) => id && id !== value));
  const options = [EMPTY_INPUT_OPTION, ...INPUT_OPTIONS];
  return `
    <div class="config-card field">
      <div class="field-label-row">
        <label for="${key}">${label}</label>
        ${fieldHelp(key)}
      </div>
      <select id="${key}" data-setting="${key}">
        ${options.map(
          (input) =>
            `<option value="${input.id}" ${input.id === value ? "selected" : ""} ${selectedIds.has(input.id) ? "disabled" : ""}>${input.label}</option>`,
        ).join("")}
      </select>
    </div>
  `;
}

function toggleField(key, label, value) {
  return `
    <div class="config-card field">
      <div class="field-label-row">
        <label for="${key}">${label}</label>
        ${fieldHelp(key)}
      </div>
      <select id="${key}" data-setting="${key}">
        <option value="true" ${value ? "selected" : ""}>On</option>
        <option value="false" ${!value ? "selected" : ""}>Off</option>
      </select>
    </div>
  `;
}

function fieldHelp(key) {
  const help = SETTING_HELP[key];
  if (!help) return "";
  return `
    <span class="field-help" tabindex="0" aria-label="${help}">
      ?
      <span class="field-tooltip" role="tooltip">${help}</span>
    </span>
  `;
}

function renderGame() {
  const rule = getCurrentRule();
  app.innerHTML = `
    <section class="screen game-screen rule-${rule}">
      ${renderBoard()}
      ${renderCueOverlay()}
      ${renderResponseTimer()}
      ${renderGameHud()}
      ${state.isPaused ? renderPauseOverlay() : ""}
    </section>
  `;
  updateTimerDom();
}

function renderGameHud() {
  const pageInfo = getReachedPageInfo();
  const progress = state.boardCells.length ? `${state.boardPosition + 1}/${state.boardCells.length}` : "0/0";
  return `
    <div class="game-hud" aria-label="Game status">
      <div class="hud-chip">
        <span class="hud-label">Page</span>
        <strong>${pageInfo.current}/${pageInfo.total}</strong>
      </div>
      <div class="hud-chip">
        <span class="hud-label">Progress</span>
        <strong>${progress}</strong>
      </div>
      ${renderLivesHud()}
    </div>
  `;
}

function renderLivesHud() {
  if (!state.settings.livesEnabled) return "";
  const maxLives = Math.max(1, Math.round(state.settings.maxLives || DEFAULT_MAX_LIVES));
  const lives = Math.max(0, Math.min(maxLives, state.lives));
  return `
    <div class="hud-chip lives-chip" aria-label="Lives ${lives} of ${maxLives}">
      <span class="hud-label">Lives</span>
      <div class="life-track">
        ${Array.from({ length: maxLives }, (_, index) => `<span class="life-heart ${index < lives ? "full" : "empty"}"></span>`).join("")}
      </div>
    </div>
  `;
}

function renderPauseOverlay() {
  return `
    <div class="pause-overlay" role="status" aria-live="polite">
      <div class="pause-modal">
        <span>PAUSED</span>
        <strong>Press Space to continue</strong>
      </div>
    </div>
  `;
}

function renderBoard() {
  const page = getRoutePage();
  const pathPoints = page.cells.map((cell) => `${cell.x},${cell.y}`).join(" ");
  const delayRange = getRouteDelayRange();
  const cells = page.cells
    .map((cell) => {
      const isCurrent = state.boardPosition === cell.index;
      return `
        <div class="trail-cell ${cell.type} ${isCurrent ? "current" : ""}" style="--x:${cell.x}%; --y:${cell.y}%; ${delayColorStyle(cell, delayRange)}">
          <span class="trail-index">${cell.index + 1}</span>
          <span class="trail-label">${cellLabel(cell)}</span>
          ${isCurrent ? renderPlayer() : ""}
        </div>
      `;
    })
    .join("");
  return `
    <section class="board-panel forest-board-panel">
      <div class="forest-stage">
        <div class="forest-canopy canopy-a"></div>
        <div class="forest-canopy canopy-b"></div>
        <div class="forest-canopy canopy-c"></div>
        <svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${pathPoints}" pathLength="1"></polyline>
        </svg>
        <div class="forest-map">${cells}</div>
      </div>
    </section>
  `;
}

function getRouteDelayRange() {
  const delays = state.boardCells.map((cell) => cell.delayMs).filter((delay) => Number.isFinite(delay));
  if (!delays.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...delays),
    max: Math.max(...delays),
  };
}

function delayColorStyle(cell, range) {
  const strength = state.settings.delayColorStrength;
  if (!strength || range.max <= range.min || !Number.isFinite(cell.delayMs)) {
    return "--delay-lighten:0; --delay-darken:0;";
  }
  const normalized = (cell.delayMs - range.min) / (range.max - range.min);
  const lighten = (1 - normalized) * 0.16 * strength;
  const darken = normalized * 0.34 * strength;
  return `--delay-lighten:${lighten.toFixed(3)}; --delay-darken:${darken.toFixed(3)};`;
}

function getRoutePage(position = state.boardPosition) {
  const total = state.boardCells.length;
  const routePageSize = getRoutePageSize();
  const pageStart = Math.floor(position / routePageSize) * routePageSize;
  const pageEnd = Math.min(total, pageStart + routePageSize);
  const visibleCount = pageEnd - pageStart;
  return {
    currentPage: Math.floor(pageStart / routePageSize) + 1,
    totalPages: Math.max(1, Math.ceil(total / routePageSize)),
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

function renderCueOverlay() {
  const stimulus = state.currentStimulus;
  if (state.phase !== "rightStimulus" || !stimulus || !stimulus.targetVisible) return "";
  const light = stimulus.displayedInstruction.light;
  const cueText = light === "red" ? "NO-GO" : "GO";
  const cueClass = light === "red" ? "nogo" : "go";
  return `
    <aside class="cue-overlay ${cueClass}" aria-live="assertive">
      <div class="cue-card">
        <div class="cue-light">${cueText}</div>
        <div class="cue-target">${getTargetContent()}</div>
        <div class="sequence-progress">${getStimulusStepLabel(stimulus)}</div>
        <div class="poison-note">${ruleNote(stimulus)}</div>
      </div>
    </aside>
  `;
}

function renderResponseTimer() {
  if (state.phase !== "rightStimulus" || !state.currentStimulus || state.currentStimulus.responded) return "";
  return `
    <div class="response-timer timer" aria-hidden="true">
      <div class="timer-fill" style="width:${state.timerPercent}%"></div>
    </div>
  `;
}

function getTargetContent() {
  if (state.phase === "waiting") return "Ready...";
  if (!state.currentStimulus) return "Ready";
  const keys = instructionDisplayKeys(state.currentStimulus.displayedInstruction);
  return `
    <div class="target-sequence">
      ${keys.map((key, index) => `
        <span class="target-sequence-item ${state.phase === "rightStimulus" && index === state.currentStimulus.stepIndex ? "current-step" : ""}">
          ${slotVisual(key)}
        </span>
      `).join("")}
    </div>
  `;
}

function getStimulusStepLabel(stimulus) {
  if (!stimulus) return "";
  if (state.phase !== "rightStimulus") return "";
  const requiredKeys = instructionEffectiveKeys(stimulus.requiredInstruction);
  if (stimulus.requiredInstruction.light === "red") return "NO-GO window";
  return `Key ${Math.min(requiredKeys.length, stimulus.stepIndex + 1)}/${requiredKeys.length}`;
}

function ruleNote(stimulus) {
  if (!stimulus || state.phase !== "rightStimulus") return "";
  if (stimulus.rule === "reverse") return "Purple zone: press the matching slot in the other group";
  if (stimulus.rule === "nback1") {
    const required = stimulus.requiredInstruction;
    if (required.light === "red") return "Blue zone: do the previous cue, which was NO-GO";
    return `Blue zone: do the previous cue, ${inputSequenceLabel(instructionEffectiveKeys(required))}`;
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
          <p class="subtitle">Successful GO actions moved forward. Errors and missed green cues moved backward.</p>
        </div>
        <div class="summary-grid">
          ${metricCard("Progress", metrics.progress)}
          ${metricCard("Page reached", metrics.reachedPageLabel)}
          ${metricCard("Time", metrics.duration)}
          ${metricCard("Hit rate", `${metrics.hitRate}%`)}
          ${metricCard("No-go errors", metrics.noGoErrors)}
          ${metricCard("Avg RT", `${metrics.avgRt}ms`)}
          ${metricCard("Final window", `${metrics.finalResponseWindow}ms`)}
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

function renderHistory() {
  const metrics = getHistoryMetrics();
  app.innerHTML = `
    <section class="screen summary-screen history-screen">
      <div class="summary-shell">
        <div>
          <h1>History</h1>
          <p class="subtitle">Recent local training sessions saved in this browser.</p>
        </div>
        <div class="summary-grid">
          ${metricCard("Sessions", metrics.sessions)}
          ${metricCard("Completed", metrics.completed)}
          ${metricCard("Avg hit rate", `${metrics.avgHitRate}%`)}
          ${metricCard("Avg RT", `${metrics.avgRt}ms`)}
          ${metricCard("Best hit rate", `${metrics.bestHitRate}%`)}
        </div>
        ${renderHistoryList()}
        <div class="actions">
          <p class="safety">History is stored only in this browser's local storage.</p>
          <div class="action-buttons">
            <button id="clearHistoryBtn" type="button">Clear History</button>
            <button class="primary" id="backToSettingsBtn" type="button">Back to Settings</button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.getElementById("backToSettingsBtn").addEventListener("click", backToConfig);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearSessionHistory);
}

function renderHistoryList() {
  if (!state.sessionHistory.length) {
    return `<div class="history-empty">No sessions yet.</div>`;
  }
  return `
    <div class="history-list">
      ${state.sessionHistory.map((entry) => `
        <article class="history-item">
          <div>
            <strong>${formatHistoryDate(entry.endedAt)}</strong>
            <span>${escapeHtml(entry.mapName || entry.presetLabel || "Custom")} | ${formatSessionDuration(entry.durationMs || 0)} | ${entry.progress || "0/0"} | ${formatHistoryPage(entry)}</span>
          </div>
          <div class="history-stats">
            <span>Hit ${entry.hitRate || 0}%</span>
            <span>RT ${entry.avgRt || 0}ms</span>
            <span>Window ${entry.finalResponseWindow || 0}ms</span>
            <span>Errors ${historyErrorCount(entry)}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function formatHistoryPage(entry) {
  if (entry.reachedPageLabel) return entry.reachedPageLabel;
  const reachedPage = Number(entry.reachedPage);
  const totalPages = Number(entry.totalPages);
  if (Number.isFinite(reachedPage) && reachedPage > 0 && Number.isFinite(totalPages) && totalPages > 0) {
    return `Page ${reachedPage}/${totalPages}`;
  }
  return "Page -";
}

function historyErrorCount(entry) {
  return (Number(entry.noGoErrors) || 0) + (Number(entry.reverseErrors) || 0) + (Number(entry.nbackErrors) || 0);
}

function formatHistoryDate(timestamp) {
  if (!timestamp) return "Unknown time";
  return new Date(timestamp).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function metricCard(label, value) {
  return `
    <div class="metric-card">
      <div class="hud-label">${label}</div>
      <div class="metric-value">${value}</div>
    </div>
  `;
}

function syncViewportHeight() {
  const height = Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight || 0));
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

function scheduleViewportSync() {
  syncViewportHeight();
  requestAnimationFrame(syncViewportHeight);
  [80, 180, 360, 720].forEach((delay) => window.setTimeout(syncViewportHeight, delay));
}

function render() {
  syncViewportHeight();
  document.body.classList.toggle("game-active", state.screen === "game");
  if (state.screen === "config") renderConfig();
  if (state.screen === "game") renderGame();
  if (state.screen === "summary") renderSummary();
  if (state.screen === "history") renderHistory();
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Escape" && state.screen === "game") {
    event.preventDefault();
    exitGame();
    return;
  }
  if (event.code === "Space" && state.screen === "game") {
    event.preventDefault();
    togglePause();
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
  scheduleViewportSync();
  if (!document.fullscreenElement && state.screen === "game") exitGame();
});

window.addEventListener("resize", scheduleViewportSync);
window.addEventListener("orientationchange", scheduleViewportSync);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", scheduleViewportSync);
  window.visualViewport.addEventListener("scroll", scheduleViewportSync);
}

render();
