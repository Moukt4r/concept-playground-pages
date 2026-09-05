import { ROUND_COUNT, createGame, placeGuess, submitGuess, nextRound, getCurrentMunicipality, summarizeGame, isValidSave } from './game.mjs';
import { NorwayMap } from './map.mjs';

const $ = (selector) => document.querySelector(selector);
const panel = $('#game-panel'), shell = $('#game-shell'), roundStrip = $('#round-strip');
const n = new Intl.NumberFormat('nb-NO');
const oneDecimal = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const STORAGE_PREFIX = 'kommunejakten:2026-09-05:v1:';
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const pointNote = 'Fasit er kommunens kartpunkt fra Kartverket, ikke nødvendigvis sentrum.';
let municipalities = [], map = null, game = null, mode = 'random', savedGame = null;
let bestScore = 0, newRecord = false, storageAvailable = true, loaded = false, soundOn = false;
let audioContext = null, toastTimer, pendingAction = null, selectedResult = null, announceTimer, panelAnimation;

function safeRead(key) {
  try {
    const text = localStorage.getItem(STORAGE_PREFIX + key);
    if (text === null) return null;
    try { return JSON.parse(text); }
    catch { safeRemove(key); return null; }
  } catch { storageAvailable = false; return null; }
}
function safeWrite(key, value) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); }
  catch { storageAvailable = false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(STORAGE_PREFIX + key); }
  catch { storageAvailable = false; }
}
function saveGame() {
  if (!game) return;
  savedGame = { game, mode };
  safeWrite('save', savedGame);
}
function toast(message, duration = 3800) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, duration);
}
function announce(message) {
  clearTimeout(announceTimer); $('#announcement').textContent = '';
  announceTimer = setTimeout(() => { $('#announcement').textContent = message; }, 50);
}
function formatDistance(km) { return km < 1 ? `${n.format(Math.round(km * 1000))} m` : `${oneDecimal.format(km)} km`; }
function randomSeed() {
  const bytes = new Uint32Array(2);
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else { bytes[0] = Math.random() * 0xffffffff; bytes[1] = Math.random() * 0xffffffff; }
  return `tur-${bytes[0].toString(36)}${bytes[1].toString(36)}`;
}
function dailySeed() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `norge-${p.year}${p.month}${p.day}`;
}
function sharedSeed() {
  const value = new URL(location.href).searchParams.get('rute');
  return value && /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : null;
}
function getModeLabel() { return mode === 'daily' ? 'DAGENS RUTE' : mode === 'challenge' ? 'VENNERUTE' : 'DIN NORGESREISE'; }
function isAmbiguous(m) { return municipalities.some((other) => other.id !== m.id && other.name === m.name); }
function displayName(m) { return isAmbiguous(m) ? `${m.name} (${m.county})` : m.name; }

function sound(kind) {
  if (!soundOn) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext ||= new Audio();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const pitches = kind === 'finish' ? [392, 493.88, 587.33, 783.99] : kind === 'score' ? [523.25, 659.25, 783.99] : [440];
    pitches.forEach((pitch, index) => {
      const at = audioContext.currentTime + index * 0.085;
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = 'sine'; osc.frequency.value = pitch;
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(kind === 'pin' ? 0.025 : 0.04, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.18);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(at); osc.stop(at + 0.2);
    });
  } catch { /* Sound is an optional enhancement. */ }
}
function updateSoundButton() {
  const b = $('#sound-toggle'); b.setAttribute('aria-pressed', String(soundOn));
  b.setAttribute('aria-label', soundOn ? 'Slå av lydeffekter' : 'Slå på lydeffekter');
  b.title = soundOn ? 'Lydeffekter på' : 'Lydeffekter av'; b.innerHTML = icon(soundOn ? 'sound' : 'muted');
}
function animatePanel() {
  panel.classList.remove('panel-enter'); clearTimeout(panelAnimation);
  requestAnimationFrame(() => panel.classList.add('panel-enter'));
  panelAnimation = setTimeout(() => panel.classList.remove('panel-enter'), 400);
}
function confetti() {
  if (reducedMotion.matches) return;
  const container = $('#confetti'); container.replaceChildren();
  const palette = ['#99b870', '#d3ef92', '#d86a43', '#233e36', '#e3cb8c'];
  for (let i = 0; i < 48; i++) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`; piece.style.background = palette[i % palette.length];
    piece.style.animationDelay = `${Math.random() * 0.5}s`; piece.style.animationDuration = `${1.9 + Math.random() * 0.9}s`;
    piece.style.setProperty('--drift', `${Math.random() * 260 - 130}px`); piece.style.setProperty('--spin', `${Math.random() * 850 - 425}deg`);
    container.appendChild(piece);
  }
  setTimeout(() => container.replaceChildren(), 3500);
}

function renderWelcome() {
  const seed = sharedSeed(), resume = savedGame && savedGame.game.phase !== 'finished';
  panel.innerHTML = `
    <span class="eyebrow"><span class="little-line"></span> EN LITEN NORGESREISE</span>
    <h1>Et sted<br> i <em>Norge.</em></h1>
    <p class="intro-copy">Fra værbitte øyer til dype daler.<br> Du får kommunen. Du setter nålen.</p>
    ${seed ? `<div class="challenge-box">${icon('route')}<span>En rute venter på deg. Klar for utfordringen?</span></div>` : ''}
    ${resume ? `<div class="resume-box"><p>Du har en tur på gang · runde ${Math.min(savedGame.game.roundIndex + 1, ROUND_COUNT)} av 10.</p><button type="button" class="primary-button" data-action="resume">Fortsett reisen ${icon('arrow')}</button></div>` : ''}
    <div class="intro-actions"><button type="button" class="primary-button" data-action="${seed ? 'challenge' : 'start'}">${seed ? 'Ta utfordringen' : 'Start jakten'} ${icon('arrow')}</button><button type="button" class="secondary-button daily-button" data-action="daily"><span class="button-start">${icon('sun')} Dagens rute</span><span class="button-sub">Lik for alle</span></button></div>
    <div class="intro-stats"><div class="intro-stat"><strong>${municipalities.length}</strong><span>KOMMUNER</span></div><div class="intro-stat"><strong>10</strong><span>RUNDER</span></div><div class="intro-stat"><strong>10 000</strong><span>MULIGE POENG</span></div></div>
    <div class="record-line">${icon('trophy')}<span>${bestScore ? `Din rekord: <strong>${n.format(bestScore)} poeng</strong>` : 'Hvor tar lokalsansen deg? Sett din første rekord.'}</span></div>
    <p class="point-note">${pointNote} <a href="#help-dialog" data-action="help">Slik fungerer det.</a></p>
    ${storageAvailable ? '' : '<p class="offline-note">Lagring er ikke tilgjengelig. Du kan fortsatt spille.</p>'}`;
}
function renderRoundStrip() {
  if (!game) { roundStrip.hidden = true; return; }
  roundStrip.hidden = false;
  roundStrip.innerHTML = `<div class="round-strip-top"><span>${game.phase === 'finished' ? 'REISEN ER FULLFØRT' : `RUNDE ${String(game.roundIndex + 1).padStart(2, '0')} <span style="color:var(--muted)">/ 10</span>`}</span><span class="total-score">${icon('trophy')} ${n.format(summarizeGame(game).score)} <small>POENG</small></span></div><div class="round-dots" aria-label="${game.results.length} av 10 kommuner besvart">${Array.from({ length: ROUND_COUNT }, (_, i) => {
    const result = game.results[i], cls = result ? `played ${result.points < 400 ? 'low' : ''}` : i === game.roundIndex ? 'current' : '';
    return `<span class="round-dot ${cls}" title="Runde ${i + 1}${result ? `: ${result.points} poeng` : ''}"></span>`;
  }).join('')}</div>`;
}
function renderGuessing() {
  const m = getCurrentMunicipality(game, municipalities);
  panel.innerHTML = `<p class="question-prefix">HVOR LIGGER</p>
    <h1 id="question-name" class="question-heading ${m.name.length > 14 ? 'long-name' : ''}" data-municipality-id="${m.id}">${escapeHtml(m.name)}<span style="color:#7f9565">?</span></h1>
    ${isAmbiguous(m) ? `<p class="county-name">${icon('pin')} ${escapeHtml(m.county)}</p>` : ''}
    <p class="question-copy">Finn frem lokalsansen og sett nålen på kartet.<br>Ingen hast. Bare en god magefølelse.</p>
    <div id="guess-status" class="guess-status"></div>
    <div class="round-actions"><button id="confirm-guess" type="button" class="primary-button" data-action="confirm" disabled>Sett en nål på kartet ${icon('pin')}</button><button type="button" class="quiet-action" data-action="home">Avslutt ruten</button></div>
    <p class="point-note">${pointNote}</p><p class="round-hint">Tips: Zoom inn for å treffe mer nøyaktig. Du kan flytte nålen helt til du låser svaret.</p>`;
  updateGuessPanel();
}
function updateGuessPanel() {
  const status = $('#guess-status'), button = $('#confirm-guess');
  if (!status || !button || !game) return;
  status.classList.toggle('placed', !!game.guess);
  if (game.guess) {
    status.innerHTML = `${icon('pin')}<span><strong>Nålen er satt. Er dette ditt svar?</strong><small>${oneDecimal.format(game.guess[1])}° N · ${oneDecimal.format(game.guess[0])}° Ø · klikk igjen for å flytte</small></span>`;
    button.disabled = false; button.innerHTML = `Lås svaret ${icon('check')}`;
  } else {
    status.innerHTML = `${icon('pin')}<span>Klikk på kartet for å velge et sted.</span>`;
    button.disabled = true; button.innerHTML = `Sett en nål på kartet ${icon('pin')}`;
  }
}
function resultTitle(points) {
  if (points >= 995) return 'Midt i blinken.';
  if (points >= 800) return 'Der har du det.';
  if (points >= 550) return 'God lokalsans.';
  if (points >= 250) return 'En liten omvei.';
  return 'Norge er langt.';
}
function renderRevealed() {
  const r = game.results.at(-1), last = game.results.length === ROUND_COUNT;
  panel.innerHTML = `<div class="result-topline"><span class="result-symbol">${icon(r.points >= 550 ? 'check' : 'route')}</span> ${r.points >= 800 ? 'GODT TREFF' : 'FASIT PÅ KARTET'}</div>
    <h2 class="result-title">${resultTitle(r.points)}</h2><p class="result-subtitle"><strong>${escapeHtml(r.name)}</strong> · ${escapeHtml(r.county)}<br>Den grønne nålen viser kommunens kartpunkt.</p>
    <div class="round-score-card"><div class="round-score"><span class="score-plus">+</span><strong class="score-number">${n.format(r.points)}</strong><small>/ 1000 poeng</small></div><div class="score-meter" role="meter" aria-label="Poeng i denne runden" aria-valuemin="0" aria-valuemax="1000" aria-valuenow="${r.points}"><span style="width:${r.points / 10}%"></span></div><div class="distance-line"><span>${icon('route')} Avstand til kartpunktet</span><strong data-result-distance="${r.distanceKm}">${formatDistance(r.distanceKm)}</strong></div></div>
    <div class="result-actions"><button type="button" class="primary-button" data-action="next">${last ? 'Se resultatet' : 'Neste kommune'} ${icon(last ? 'trophy' : 'arrow')}</button><p class="point-note">Det fargede området viser kommunen, grovt forenklet. Både sjø og land kan inngå.</p></div>`;
}
function finalRank(score) {
  if (score >= 9500) return ['Norge på fingertuppene.', 'Det er bare å pakke sekken. Lokalsansen er med.'];
  if (score >= 8000) return ['Fjellstø lokalsans.', 'Du kjenner landet ditt. Helt fra kyst til innland.'];
  if (score >= 6000) return ['En ekte norgeskjenner.', 'Noen omveier, mange gode treff. Klar for ti nye?'];
  if (score >= 3500) return ['På rett vei.', 'Norge er stort. Nå kjenner du ti steder litt bedre.'];
  return ['Reisen er belønningen.', 'Nye kommuner, nye oppdagelser. Neste rute sitter bedre.'];
}
function renderFinished() {
  const s = summarizeGame(game), [title, copy] = finalRank(s.score);
  panel.innerHTML = `<span class="eyebrow final-eyebrow">${getModeLabel()} · 10 AV 10</span><h2 class="final-title">${title}</h2><p class="final-copy">${copy}</p>
    <div class="final-score-wrap"><span class="eyebrow">DIN POENGSUM</span><div class="final-score" data-final-score="${s.score}">${n.format(s.score)}<small>/ 10 000</small></div>${newRecord ? `<div class="new-record">${icon('trophy')} NY PERSONLIG REKORD</div>` : `<div class="new-record">${icon('trophy')} Rekorden din: ${n.format(bestScore)} poeng</div>`}</div>
    <div class="summary-metrics"><div class="summary-metric"><span>GJENNOMSNITTLIG AVSTAND</span><strong>${formatDistance(s.averageKm)}</strong></div><div class="summary-metric"><span>DITT BESTE TREFF</span><strong>${escapeHtml(s.bestRound ? displayName(s.bestRound) : '—')}</strong></div></div>
    <div class="final-actions"><button type="button" class="primary-button" data-action="start">Ta en ny rute ${icon('arrow')}</button><button type="button" class="secondary-button" data-action="share">Utfordre en venn ${icon('share')}</button><button type="button" class="text-button" data-action="replay">Spill den samme ruten igjen</button></div>
    <details class="results-details"><summary>Se alle 10 svarene dine</summary><table class="results-table"><caption class="sr-only">Resultat for hver kommune. Avstand er til kommunens faste kartpunkt.</caption><thead><tr><th scope="col">Kommune</th><th scope="col">Avstand</th><th scope="col">Poeng</th></tr></thead><tbody>${game.results.map((r, i) => `<tr><td><button type="button" class="result-row-name" data-action="inspect-result" data-index="${i}" aria-label="Vis ${escapeHtml(displayName(r))} på kartet">${i + 1}. ${escapeHtml(r.name)}</button><span class="county-small">${escapeHtml(r.county)}</span></td><td>${formatDistance(r.distanceKm)}</td><td>${n.format(r.points)}</td></tr>`).join('')}</tbody></table><button type="button" class="text-button" data-action="map-reset">Vis hele reisen på kartet</button></details>`;
}
function render({ fit = true, animate = true } = {}) {
  shell.classList.toggle('summary-view', game?.phase === 'finished'); document.body.classList.toggle('is-playing', !!game); document.body.classList.toggle('is-finished', game?.phase === 'finished');
  renderRoundStrip();
  if (!game) renderWelcome(); else if (game.phase === 'guessing') renderGuessing(); else if (game.phase === 'revealed') renderRevealed(); else renderFinished();
  if (animate) animatePanel(); map?.renderState(fit);
}
function startGame(newMode = 'random', seed = null) {
  if (!loaded) return;
  mode = newMode; game = createGame(municipalities, seed || (newMode === 'daily' ? dailySeed() : randomSeed()));
  newRecord = false; selectedResult = null; saveGame(); render();
  announce(`Runde 1 av 10. Hvor ligger ${displayName(getCurrentMunicipality(game, municipalities))}? Sett en nål på kartet og lås svaret.`); sound('pin');
}
function requestStart(newMode, seed = null) {
  const inProgress = (game && game.phase !== 'finished') || (!game && savedGame && savedGame.game.phase !== 'finished');
  if (inProgress) { pendingAction = () => startGame(newMode, seed); $('#restart-dialog').showModal(); }
  else startGame(newMode, seed);
}
function setMapGuess(coordinate) {
  if (!game || game.phase !== 'guessing') return;
  if (!coordinate || !coordinate.every(Number.isFinite) || coordinate[0] < -8 || coordinate[0] > 38 || coordinate[1] < 53.5 || coordinate[1] > 73) { toast('Her er du utenfor spillkartet. Velg et sted nærmere Norge.'); return; }
  game = placeGuess(game, coordinate); saveGame(); updateGuessPanel(); map.renderState(false);
  announce('Nålen er satt. Flytt den gjerne, eller trykk Lås svaret.'); sound('pin');
}
function confirmGuess() {
  if (!game || game.phase !== 'guessing' || !game.guess) return;
  game = submitGuess(game, municipalities); saveGame(); render();
  const r = game.results.at(-1); announce(`${r.name}: ${formatDistance(r.distanceKm)} fra kartpunktet. ${r.points} av 1000 poeng.`);
  sound('score'); $('[data-action="next"]')?.focus({ preventScroll: true });
}
function advanceRound() {
  if (!game || game.phase !== 'revealed') return;
  game = nextRound(game); selectedResult = null;
  if (game.phase === 'finished') {
    const score = summarizeGame(game).score; newRecord = score > bestScore;
    if (score > bestScore) { bestScore = score; safeWrite('best', score); }
    sound('finish'); confetti(); announce(`Reisen er ferdig. Du fikk ${n.format(score)} av 10 000 poeng.${newRecord ? ' Ny personlig rekord!' : ''}`);
  } else announce(`Runde ${game.roundIndex + 1} av 10. Hvor ligger ${displayName(getCurrentMunicipality(game, municipalities))}?`);
  saveGame(); render(); panel.focus({ preventScroll: true });
}
function goHome() {
  if (game && game.phase !== 'finished') {
    pendingAction = () => { game = null; savedGame = null; selectedResult = null; safeRemove('save'); render(); }; $('#restart-dialog').showModal();
  } else { game = null; selectedResult = null; render(); }
}
async function shareRoute() {
  if (!game) return;
  const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('rute', game.seed);
  const text = `Jeg fikk ${n.format(summarizeGame(game).score)} av 10 000 poeng i Kommunejakten. Slår du meg på de samme ti kommunene?\n${url.href}`;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text); toast('Utfordringen er kopiert! Send lenken til en venn.');
  } catch {
    let dialog = $('#share-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.id = 'share-dialog'; dialog.className = 'confirm-dialog'; dialog.setAttribute('aria-label', 'Kopier utfordringen');
      dialog.innerHTML = '<h2>Send en liten utfordring.</h2><p>Marker og kopier teksten under.</p><textarea readonly aria-label="Utfordringslenke" style="width:100%;min-height:135px;padding:12px;border:1px solid #aab99b;border-radius:8px;font:12px Manrope,system-ui;line-height:1.8;background:#fffef9;color:#233e36"></textarea><button type="button" class="primary-button" data-action="close-share" style="margin-top:15px">Ferdig</button>';
      document.body.appendChild(dialog);
    }
    dialog.querySelector('textarea').value = text; dialog.showModal(); dialog.querySelector('textarea').select();
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  event.preventDefault();
  switch (button.dataset.action) {
    case 'help': $('#help-dialog').showModal(); break;
    case 'close-help': $('#help-dialog').close(); break;
    case 'sound': soundOn = !soundOn; safeWrite('sound', soundOn); updateSoundButton(); if (soundOn) sound('pin'); break;
    case 'start': requestStart('random'); break;
    case 'daily': requestStart('daily'); break;
    case 'challenge': requestStart('challenge', sharedSeed()); break;
    case 'resume': if (savedGame && isValidSave(savedGame.game, municipalities)) { game = savedGame.game; mode = savedGame.mode; newRecord = false; render(); announce(`Reisen fortsetter på runde ${game.roundIndex + 1}.`); } break;
    case 'home': if (loaded) goHome(); break;
    case 'confirm': confirmGuess(); break;
    case 'next': advanceRound(); break;
    case 'replay': if (game) requestStart(mode, game.seed); break;
    case 'share': shareRoute(); break;
    case 'close-share': $('#share-dialog')?.close(); break;
    case 'zoom-in': map?.zoomBy(1.65); break;
    case 'zoom-out': map?.zoomBy(1 / 1.65); break;
    case 'map-reset': selectedResult = null; map?.renderState(true, true); break;
    case 'inspect-result': if (game?.phase === 'finished') { selectedResult = Number(button.dataset.index); map?.renderState(true); if (innerWidth <= 680) $('#map-card').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' }); } break;
    case 'cancel-restart': pendingAction = null; $('#restart-dialog').close(); break;
    case 'confirm-restart': { const run = pendingAction; pendingAction = null; $('#restart-dialog').close(); run?.(); break; }
    case 'reload': location.reload(); break;
  }
});
$('#restart-dialog').addEventListener('cancel', () => { pendingAction = null; });
for (const dialog of [$('#help-dialog'), $('#restart-dialog')]) {
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return; const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { dialog.close(); pendingAction = null; }
  });
}
async function fetchJson(path) {
  const response = await fetch(path); if (!response.ok) throw new Error(`Kunne ikke laste ${path} (${response.status}).`); return response.json();
}
async function boot() {
  try {
    const [data, background, geometry] = await Promise.all([fetchJson('./data/municipalities.json'), fetchJson('./data/scandinavia.geojson'), fetchJson('./data/municipalities.geojson')]);
    if (!Array.isArray(data.municipalities) || data.municipalities.length !== 357) throw new Error('Kommunelisten er ufullstendig.');
    municipalities = data.municipalities;
    if (new Set(municipalities.map((m) => m.id)).size !== municipalities.length) throw new Error('Kommunelisten har duplikater.');
    if (!municipalities.every((m) => typeof m.id === 'string' && typeof m.name === 'string' && m.name && typeof m.county === 'string' && Number.isFinite(m.lon) && Number.isFinite(m.lat))) throw new Error('Kommunelisten har ugyldige oppføringer.');
    const storedBest = safeRead('best'); bestScore = Number.isInteger(storedBest) && storedBest >= 0 && storedBest <= 10000 ? storedBest : 0;
    soundOn = safeRead('sound') === true;
    const saved = safeRead('save');
    if (saved && ['random', 'daily', 'challenge'].includes(saved.mode) && isValidSave(saved.game, municipalities)) savedGame = saved;
    else if (saved) safeRemove('save');
    updateSoundButton();
    map = new NorwayMap(background, geometry, { municipalities, getGame: () => game, getSelected: () => selectedResult, onGuess: setMapGuess, onReset: () => { selectedResult = null; } });
    document.querySelectorAll('[data-municipality-count]').forEach((e) => { e.textContent = municipalities.length; });
    loaded = true; $('#map-loading').hidden = true; render({ fit: true, animate: false }); document.documentElement.dataset.ready = 'true';
  } catch (error) {
    console.error('Kommunejakten:', error); $('#map-loading').hidden = true;
    panel.innerHTML = `<div class="load-error" role="alert"><span class="eyebrow">KARTET TOK EN OMVEI</span><h2>Vi kom ikke helt frem.</h2><p>En spillfil kunne ikke lastes. Sjekk forbindelsen og prøv igjen. Ingen poeng er mistet.</p><button type="button" class="primary-button" data-action="reload">Prøv på nytt ${icon('refresh')}</button></div>`;
  }
}
boot();
