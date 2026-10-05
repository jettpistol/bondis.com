// Turns the official route GeoJSON in data/raw/ into what the site loads:
//   public/data/routes/<line>.json  simplified routes of one line (ramal + sentido per feature)
//   public/data/terminals.json      both ends of every branch, clustered into terminals
//
// Run with `npm run build:data` after replacing the raw files.

import fs from 'node:fs';
import path from 'node:path';
import mapshaper from 'mapshaper';

const RAW = 'data/raw/national_routes.json';
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
const round = (n) => Math.round(n * 1e5) / 1e5;

// Natural sort for branch names: A, B, … N, NN, O.
const byBranch = (a, b) => a.length - b.length || a.localeCompare(b);

function computeTerminals(features) {
  const clusters = [];
  for (const f of features) {
    const parts = partsOf(f.geometry);
    for (const end of [parts[0][0], parts.at(-1).at(-1)]) {
      let c = clusters.find((c) => distance(c.points[0], end) < TERMINAL_RADIUS_M);
      if (!c) clusters.push((c = { points: [], branches: new Set() }));
      c.points.push(end);
      c.branches.add(String(f.properties.RAMAL));
    }
  }
  return clusters.map((c) => {
    const lng = c.points.reduce((s, p) => s + p[0], 0) / c.points.length;
    const lat = c.points.reduce((s, p) => s + p[1], 0) / c.points.length;
    return { lat: round(lat), lng: round(lng), branches: [...c.branches].sort(byBranch) };
  });
}

const raw = fs.readFileSync(RAW, 'utf8');
const { 'routes.json': simplified } = await mapshaper.applyCommands(
  `-i routes.json -simplify dp interval=${SIMPLIFY_METERS} keep-shapes -o routes.json precision=0.00001`,
  { 'routes.json': raw },
);

const byLine = Map.groupBy(JSON.parse(simplified).features, (f) => String(f.properties.LINEA));
const rawByLine = Map.groupBy(JSON.parse(raw).features, (f) => String(f.properties.LINEA));

fs.rmSync(path.join(OUT, 'routes'), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'routes'), { recursive: true });

const terminals = {};
for (const [line, features] of byLine) {
  const fc = {
    type: 'FeatureCollection',
    features: features
      .map((f) => ({
        type: 'Feature',
        properties: { ramal: String(f.properties.RAMAL), sentido: f.properties.SENTIDO },
        geometry: f.geometry,
      }))
      .sort((a, b) => byBranch(a.properties.ramal, b.properties.ramal)),
  };
  fs.writeFileSync(path.join(OUT, 'routes', `${line}.json`), JSON.stringify(fc));
  // Terminals come from the unsimplified geometry so the ends stay exact.
  terminals[line] = computeTerminals(rawByLine.get(line));
}
fs.writeFileSync(path.join(OUT, 'terminals.json'), JSON.stringify(terminals));

const count = Object.values(terminals).reduce((s, t) => s + t.length, 0);
console.log(`Wrote ${byLine.size} lines and ${count} terminals to ${OUT}/`);
