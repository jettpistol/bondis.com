// Turns the official route GeoJSON in data/raw/ into what the site loads:
//   public/data/routes/<line>.json  simplified routes of one line (ramal, sentido, km per feature)
//   public/data/lines.json          every line: jurisdiction, terminals, km per branch
//
// Run with `npm run build:data` after replacing the raw files.

import fs from 'node:fs';
import path from 'node:path';
import mapshaper from 'mapshaper';

const SOURCES = [
  { file: 'data/raw/national_routes.json', jurisdiction: 'nacional' },
  { file: 'data/raw/provincial_routes.json', jurisdiction: 'provincial' },
  { file: 'data/raw/municipal_routes.json', jurisdiction: 'municipal' },
];
const OUT = 'public/data';
const SIMPLIFY_METERS = 8; // invisible at street zoom, cuts the file ~70%
const TERMINAL_RADIUS_M = 500; // route ends closer than this are the same terminal

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
function distance([lng1, lat1], [lng2, lat2]) {
  const h = Math.sin(rad(lat2 - lat1) / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const partsOf = (g) => (g.type === 'LineString' ? [g.coordinates] : g.coordinates);
const round = (n, digits) => Math.round(n * 10 ** digits) / 10 ** digits;

// Length of everything the bus drives, summing all parts of a MultiLineString.
function lengthKm(geometry) {
  let m = 0;
  for (const part of partsOf(geometry)) {
    for (let i = 1; i < part.length; i++) m += distance(part[i - 1], part[i]);
  }
  return round(m / 1000, 1);
}

// The data has no Ñ, so ramal Ñ is written "NN" (line 60 has N, NN, O).
const normalizeRamal = (r) => (String(r) === 'NN' ? 'Ñ' : String(r));

// National data says IDA/VUELTA; provincial and municipal say 0/1.
const normalizeSentido = (s) => ({ IDA: 'ida', VUELTA: 'vuelta', 0: 'ida', 1: 'vuelta' })[s] ?? String(s);

// Natural sort for branch names: A, B, … N, NN, O and 1, 2, … 10.
const byBranch = (a, b) => a.length - b.length || a.localeCompare(b, 'es', { numeric: true });

function computeTerminals(features) {
  const clusters = [];
  for (const f of features) {
    const parts = partsOf(f.geometry);
    for (const end of [parts[0][0], parts.at(-1).at(-1)]) {
      let c = clusters.find((c) => distance(c.points[0], end) < TERMINAL_RADIUS_M);
      if (!c) clusters.push((c = { points: [], branches: new Set() }));
      c.points.push(end);
      c.branches.add(normalizeRamal(f.properties.RAMAL));
    }
  }
  return clusters.map((c) => {
    const lng = c.points.reduce((s, p) => s + p[0], 0) / c.points.length;
    const lat = c.points.reduce((s, p) => s + p[1], 0) / c.points.length;
    return { lat: round(lat, 5), lng: round(lng, 5), branches: [...c.branches].sort(byBranch) };
  });
}

fs.rmSync(path.join(OUT, 'routes'), { recursive: true, force: true });
fs.rmSync(path.join(OUT, 'terminals.json'), { force: true });
fs.mkdirSync(path.join(OUT, 'routes'), { recursive: true });

const index = {};
for (const { file, jurisdiction } of SOURCES) {
  const raw = fs.readFileSync(file, 'utf8');
  const { 'routes.json': simplified } = await mapshaper.applyCommands(
    `-i routes.json -simplify dp interval=${SIMPLIFY_METERS} keep-shapes -o routes.json precision=0.00001`,
    { 'routes.json': raw },
  );
  const rawFeatures = JSON.parse(raw).features;
  const simplifiedFeatures = JSON.parse(simplified).features;
  const lineOf = (f) => String(f.properties.LINEA);

  const rawByLine = Map.groupBy(rawFeatures, lineOf);
  for (const [line, features] of Map.groupBy(simplifiedFeatures, lineOf)) {
    if (index[line]) throw new Error(`Line ${line} appears in more than one source`);
    // Lengths and terminals come from the unsimplified geometry, so they stay exact.
    const rawFs = rawByLine.get(line);
    const kmById = new Map(rawFs.map((f) => [f.properties.ID, lengthKm(f.geometry)]));

    const out = features
      .map((f) => ({
        type: 'Feature',
        properties: {
          ramal: normalizeRamal(f.properties.RAMAL),
          sentido: normalizeSentido(f.properties.SENTIDO),
          km: kmById.get(f.properties.ID),
        },
        geometry: f.geometry,
      }))
      .sort((a, b) => byBranch(a.properties.ramal, b.properties.ramal));
    fs.writeFileSync(path.join(OUT, 'routes', `${line}.json`), JSON.stringify({ type: 'FeatureCollection', features: out }));

    const branches = {};
    for (const { properties: p } of out) {
      branches[p.ramal] ??= {};
      // A few branches have two features for the same direction; keep the longest.
      branches[p.ramal][p.sentido] = Math.max(branches[p.ramal][p.sentido] ?? 0, p.km);
    }
    index[line] = { jurisdiction, branches, terminals: computeTerminals(rawFs) };
  }
}

const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => Number(a) - Number(b)));
fs.writeFileSync(path.join(OUT, 'lines.json'), JSON.stringify(sorted));

const count = (j) => Object.values(index).filter((l) => l.jurisdiction === j).length;
const terminals = Object.values(index).reduce((s, l) => s + l.terminals.length, 0);
console.log(`Wrote ${Object.keys(index).length} lines (${SOURCES.map((s) => `${count(s.jurisdiction)} ${s.jurisdiction}`).join(', ')}) and ${terminals} terminals to ${OUT}/`);
