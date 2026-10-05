// CURRENTLY UNUSED: routes now come from the official data (see scripts/build-routes.mjs).
// Kept as a fallback for lines missing from that data.

// Bus routes come from OpenStreetMap (free, ODbL) via the public Overpass API.
// Each line usually has several route relations (ida / vuelta / ramales);
// we draw every way that belongs to one.

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Greater Buenos Aires (AMBA) bounding box: south, west, north, east.
const AMBA_BBOX = '-35.1,-59.1,-34.2,-57.9';

const CACHE_KEY = 'bondis:routes:v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildQuery(refs) {
  const pattern = refs.map((r) => r.replace(/[^0-9A-Za-z]/g, '')).join('|');
  return `[out:json][timeout:90];
relation["type"="route"]["route"="bus"]["ref"~"^(${pattern})$"](${AMBA_BBOX});
out geom;`;
}

function readCache(refs) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS) return null;
    if (refs.some((r) => !(r in cached.routes))) return null;
    return cached.routes;
  } catch {
    return null;
  }
}

function writeCache(routes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), routes }));
  } catch {
    // Storage full or unavailable: routes still work, just not cached.
  }
}

// Returns { [ref]: Array<Array<[lat, lng]>> } — a list of polylines per line.
function toPolylines(osm, refs) {
  const routes = Object.fromEntries(refs.map((r) => [r, []]));
  for (const rel of osm.elements ?? []) {
    const ref = rel.tags?.ref;
    if (!(ref in routes)) continue;
    for (const member of rel.members ?? []) {
      // Skip stops and platforms; keep the ways the bus actually drives on.
      if (member.type !== 'way' || !member.geometry || member.role !== '') continue;
      routes[ref].push(member.geometry.map((p) => [p.lat, p.lon]));
    }
  }
  return routes;
}

export async function fetchRoutes(refs) {
  const cached = readCache(refs);
  if (cached) return cached;

  const body = new URLSearchParams({ data: buildQuery(refs) });
  let lastError;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { method: 'POST', body });
      if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
      const routes = toPolylines(await res.json(), refs);
      writeCache(routes);
      return routes;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
