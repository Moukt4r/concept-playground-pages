/** Kommunejakten's dependency-free, deterministic game engine. */

export const ROUND_COUNT = 10;
export const MAX_ROUND_SCORE = 1000;
export const FULL_SCORE_KM = 1;
export const SCORE_DECAY_KM = 150;

const EARTH_RADIUS_KM = 6371.0088;
const RADIANS_PER_DEGREE = Math.PI / 180;
const UINT32_RANGE = 0x100000000;
const GAME_KEYS = [
  'version', 'seed', 'municipalityIds', 'roundIndex', 'phase', 'guess', 'results',
];
const RESULT_KEYS = [
  'id', 'name', 'county', 'target', 'guess', 'distanceKm', 'points',
];
const MUNICIPALITY_KEYS = ['id', 'name', 'county', 'lon', 'lat'];

function assertRecord(value, label, exactKeys) {
  if (value === null || typeof value !== 'object') {
    throw new TypeError(`${label} must be a plain object.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  if (exactKeys && Reflect.ownKeys(value).length !== exactKeys.length) {
    throw new TypeError(`${label} has missing or unexpected fields.`);
  }
  for (const key of exactKeys ?? MUNICIPALITY_KEYS) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}.${key} must be an own enumerable data field.`);
    }
  }
}

function assertArray(value, label, expectedLength) {
  if (!Array.isArray(value) ||
      (expectedLength !== undefined && value.length !== expectedLength)) {
    throw new TypeError(`${label} must be an array of the expected length.`);
  }
  if (Reflect.ownKeys(value).length !== value.length + 1) {
    throw new TypeError(`${label} must be dense and have no extra fields.`);
  }
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label} must contain own data elements, not holes or getters.`);
    }
  }
}

function assertText(value, label) {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a string.`);
  }
}

function assertCoordinates(coordinates, label = 'Coordinates') {
  assertArray(coordinates, label, 2);
  const [lon, lat] = coordinates;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    throw new TypeError(`${label} must contain finite numbers [longitude, latitude].`);
  }
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    throw new RangeError(`${label} must be within longitude [-180, 180], latitude [-90, 90].`);
  }
}

function normalizeSeed(seed = '') {
  if (typeof seed === 'string') return seed;
  if (typeof seed === 'number' && Number.isFinite(seed)) return String(seed);
  throw new TypeError('Seed must be a string or a finite number (or omitted).');
}

function prepareMunicipalities(municipalities) {
  assertArray(municipalities, 'Municipalities');
  const byId = new Map();
  for (const municipality of municipalities) {
    assertRecord(municipality, 'Municipality');
    const { id, name, county, lon, lat } = municipality;
    assertText(id, 'Municipality.id');
    assertText(name, 'Municipality.name');
    assertText(county, 'Municipality.county');
    assertCoordinates([lon, lat], 'Municipality coordinates');
    if (byId.has(id)) throw new RangeError(`Duplicate municipality ID: ${id}`);
    // Copy only contract fields: caller-owned objects and optional metadata stay outside.
    byId.set(id, { id, name, county, lon, lat });
  }
  // Code-unit ordering, not localeCompare: data order and runtime locale cannot change a game.
  const ordered = [...byId.values()].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  return { byId, ordered };
}

function assertCount(count, available) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Count must be a nonnegative safe integer.');
  }
  if (count > available) throw new RangeError('Insufficient unique municipalities.');
}

function seededUint32(seed) {
  // xmur3 hashes UTF-16 code units into the four initial sfc32 words.
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  const seedWord = () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
  let a = seedWord();
  let b = seedWord();
  let c = seedWord();
  let d = seedWord();
  const next = () => {
    const word = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + word) | 0;
    return word >>> 0;
  };
  for (let index = 0; index < 12; index += 1) next();
  return next;
}

function randomBelow(nextUint32, upperExclusive) {
  // Rejection sampling removes modulo bias, including for non-power-of-two bounds.
  const limit = UINT32_RANGE - (UINT32_RANGE % upperExclusive);
  let word;
  do {
    word = nextUint32();
  } while (word >= limit);
  return word % upperExclusive;
}

function selectPrepared(ordered, seed, count) {
  assertCount(count, ordered.length);
  const shuffled = ordered.slice();
  const nextUint32 = seededUint32(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = randomBelow(nextUint32, index + 1);
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

/** Great-circle kilometres on the IUGG mean-radius sphere; coordinates are [lon, lat]. */
export function haversineKm(from, to) {
  assertCoordinates(from, 'Origin');
  assertCoordinates(to, 'Destination');
  const [lonA, latA] = from;
  const [lonB, latB] = to;
  let deltaLon = lonB - lonA;
  if (deltaLon > 180) deltaLon -= 360;
  if (deltaLon < -180) deltaLon += 360;

  // Different longitudes at a pole, and +/-180 on the dateline, can be the same point.
  if (latA === latB && (deltaLon === 0 || Math.abs(latA) === 90)) return 0;

  const halfDeltaLon = deltaLon * RADIANS_PER_DEGREE / 2;
  const cosProduct = Math.cos(latA * RADIANS_PER_DEGREE) *
    Math.cos(latB * RADIANS_PER_DEGREE);
  const haversine = Math.sin((latB - latA) * RADIANS_PER_DEGREE / 2) ** 2 +
    cosProduct * Math.sin(halfDeltaLon) ** 2;
  // Evaluate 1-h algebraically rather than subtracting from 1; this preserves
  // small separations from an antipode when h would round to exactly 1.
  const complement = Math.sin((latA + latB) * RADIANS_PER_DEGREE / 2) ** 2 +
    cosProduct * Math.cos(halfDeltaLon) ** 2;
  const clamp = (value) => Math.max(0, Math.min(1, value));
  return 2 * EARTH_RADIUS_KM * Math.atan2(
    Math.sqrt(clamp(haversine)), Math.sqrt(clamp(complement)),
  );
}

export function pointsForDistance(km) {
  if (!Number.isFinite(km)) throw new TypeError('Distance must be a finite number.');
  if (km < 0) throw new RangeError('Distance must be nonnegative.');
  return Math.round(MAX_ROUND_SCORE *
    Math.exp(-Math.max(0, km - FULL_SCORE_KM) / SCORE_DECAY_KM));
}

export function selectMunicipalities(municipalities, { seed, count = ROUND_COUNT } = {}) {
  const { ordered } = prepareMunicipalities(municipalities);
  return selectPrepared(ordered, normalizeSeed(seed), count);
}

export function createGame(municipalities, seed) {
  const normalizedSeed = normalizeSeed(seed);
  return {
    version: 1,
    seed: normalizedSeed,
    municipalityIds: selectMunicipalities(municipalities, { seed: normalizedSeed })
      .map((municipality) => municipality.id),
    roundIndex: 0,
    phase: 'guessing',
    guess: null,
    results: [],
  };
}

function sameCoordinates(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

function assertGame(game) {
  assertRecord(game, 'Game', GAME_KEYS);
  if (game.version !== 1) throw new RangeError('Unsupported game version.');
  assertText(game.seed, 'Game.seed');
  assertArray(game.municipalityIds, 'Game.municipalityIds', ROUND_COUNT);
  for (const id of game.municipalityIds) assertText(id, 'Municipality ID');
  if (new Set(game.municipalityIds).size !== ROUND_COUNT) {
    throw new RangeError('A game must contain ten unique municipality IDs.');
  }
  if (!Number.isInteger(game.roundIndex) || game.roundIndex < 0 ||
      game.roundIndex >= ROUND_COUNT) {
    throw new RangeError('Round index must be an integer from 0 to 9.');
  }
  if (!['guessing', 'revealed', 'finished'].includes(game.phase)) {
    throw new RangeError('Unknown game phase.');
  }
  if (game.phase === 'finished' && game.roundIndex !== ROUND_COUNT - 1) {
    throw new RangeError('Only the tenth round can finish a game.');
  }
  const expectedResults = game.phase === 'guessing' ? game.roundIndex : game.roundIndex + 1;
  assertArray(game.results, 'Game.results', expectedResults);

  if (game.phase === 'finished') {
    if (game.guess !== null) throw new TypeError('A finished game must have a null guess.');
  } else if (game.guess !== null) {
    assertCoordinates(game.guess, 'Game.guess');
  } else if (game.phase === 'revealed') {
    throw new TypeError('A revealed round must retain its submitted guess.');
  }

  for (let index = 0; index < game.results.length; index += 1) {
    const result = game.results[index];
    assertRecord(result, 'Result', RESULT_KEYS);
    if (result.id !== game.municipalityIds[index]) {
      throw new RangeError('Results must follow the selected municipality order.');
    }
    assertText(result.name, 'Result.name');
    assertText(result.county, 'Result.county');
    assertCoordinates(result.target, 'Result.target');
    assertCoordinates(result.guess, 'Result.guess');
    const expectedDistance = haversineKm(result.guess, result.target);
    if (!Number.isFinite(result.distanceKm) || result.distanceKm < 0 ||
        result.distanceKm !== expectedDistance) {
      throw new RangeError('Result distance does not match its coordinates.');
    }
    if (!Number.isInteger(result.points) || result.points < 0 ||
        result.points > MAX_ROUND_SCORE || result.points !== pointsForDistance(expectedDistance)) {
      throw new RangeError('Result points do not match its distance.');
    }
  }
  if (game.phase === 'revealed' &&
      !sameCoordinates(game.guess, game.results[game.roundIndex].guess)) {
    throw new RangeError('The revealed guess must match the latest result.');
  }
}

function assertCatalogMatches(game, catalog) {
  const expected = selectPrepared(catalog.ordered, game.seed, ROUND_COUNT);
  for (let index = 0; index < ROUND_COUNT; index += 1) {
    if (game.municipalityIds[index] !== expected[index].id) {
      throw new RangeError('Selected municipalities do not match the seed and catalog.');
    }
  }
  for (const result of game.results) {
    const municipality = catalog.byId.get(result.id);
    if (result.name !== municipality.name || result.county !== municipality.county ||
        !sameCoordinates(result.target, [municipality.lon, municipality.lat])) {
      throw new RangeError('Result metadata or target does not match the municipality catalog.');
    }
  }
}

function cloneResult(result) {
  return { ...result, target: result.target.slice(), guess: result.guess.slice() };
}

function cloneGame(game) {
  return {
    ...game,
    municipalityIds: game.municipalityIds.slice(),
    guess: game.guess === null ? null : game.guess.slice(),
    results: game.results.map(cloneResult),
  };
}

export function placeGuess(game, coordinates) {
  assertGame(game);
  if (game.phase !== 'guessing') throw new Error('Guesses are only allowed during guessing.');
  assertCoordinates(coordinates, 'Guess');
  const next = cloneGame(game);
  next.guess = coordinates.slice();
  return next;
}

export function submitGuess(game, municipalities) {
  assertGame(game);
  if (game.phase !== 'guessing') throw new Error('Only a guessing round can be submitted.');
  if (game.guess === null) throw new Error('Place a guess before submitting.');
  const catalog = prepareMunicipalities(municipalities);
  assertCatalogMatches(game, catalog);
  const { id, name, county, lon, lat } = catalog.byId.get(game.municipalityIds[game.roundIndex]);
  const target = [lon, lat];
  const distanceKm = haversineKm(game.guess, target);
  const next = cloneGame(game);
  next.results.push({
    id, name, county, target, guess: game.guess.slice(),
    distanceKm, points: pointsForDistance(distanceKm),
  });
  next.phase = 'revealed';
  return next;
}

export function nextRound(game) {
  assertGame(game);
  if (game.phase !== 'revealed') throw new Error('Reveal the current round before advancing.');
  const next = cloneGame(game);
  next.guess = null;
  if (game.roundIndex === ROUND_COUNT - 1) {
    next.phase = 'finished';
  } else {
    next.roundIndex += 1;
    next.phase = 'guessing';
  }
  return next;
}

export function getCurrentMunicipality(game, municipalities) {
  assertGame(game);
  if (game.phase === 'finished') return null;
  const catalog = prepareMunicipalities(municipalities);
  assertCatalogMatches(game, catalog);
  return { ...catalog.byId.get(game.municipalityIds[game.roundIndex]) };
}

export function summarizeGame(game) {
  assertGame(game);
  let score = 0;
  let totalKm = 0;
  let bestRound = null;
  let perfectCount = 0;
  for (const result of game.results) {
    score += result.points;
    totalKm += result.distanceKm;
    if (bestRound === null || result.distanceKm < bestRound.distanceKm) bestRound = result;
    if (result.points === MAX_ROUND_SCORE) perfectCount += 1;
  }
  return {
    score,
    totalKm,
    averageKm: game.results.length === 0 ? 0 : totalKm / game.results.length,
    bestRound: bestRound === null ? null : cloneResult(bestRound),
    perfectCount,
  };
}

/** Validate an already-parsed version-1 save against the same logical catalog. Never throws. */
export function isValidSave(value, municipalities) {
  try {
    assertGame(value);
    assertCatalogMatches(value, prepareMunicipalities(municipalities));
    return true;
  } catch {
    return false;
  }
}
