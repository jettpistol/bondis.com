import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { LINES } from './data/lines.js';
import { fetchRoutes } from './routes.js';

const BA_CENTER = [-34.6037, -58.4416];

// Placeholder palette until each line gets its real livery colors.
const PALETTE = [
  '#e8452c', '#1f6feb', '#2da44e', '#8250df', '#d4a72c', '#cf222e',
  '#0a7ea4', '#bf3989', '#6e7781', '#fb8f44', '#1b7c83', '#953800',
];
const colorFor = (i) => PALETTE[i % PALETTE.length];

const map = L.map('map', { zoomControl: false }).setView(BA_CENTER, 11);
L.control.zoom({ position: 'bottomleft' }).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// ---------- Side panel ----------
const panel = document.getElementById('panel');
const panelBadge = document.getElementById('panel-badge');
const panelTitle = document.getElementById('panel-title');
const panelSub = document.getElementById('panel-sub');
const panelBody = document.getElementById('panel-body');
let activeLine = null;

function wikipediaUrl(title) {
  // The mobile site fits a narrow panel much better than the desktop one.
  return `https://es.m.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}

function openPanel(line) {
  if (activeLine) activeLine.pinEl()?.classList.remove('is-active');
  activeLine = line;
  line.pinEl()?.classList.add('is-active');

  panel.style.setProperty('--pin-color', line.color);
  panelBadge.textContent = line.line;
  panelTitle.textContent = `Línea ${line.line}`;
  panelSub.textContent = [line.terminal, line.otherEnd].filter(Boolean).join(' ↔ ')
    + (line.coords === 'approx' ? ' · ubicación aproximada' : '');

  panelBody.replaceChildren();
  if (line.wikipedia) {
    const frame = document.createElement('iframe');
    frame.src = wikipediaUrl(line.wikipedia);
    frame.title = `Wikipedia: ${line.wikipedia}`;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer';
    panelBody.append(frame);
  } else {
    const empty = document.createElement('div');
    empty.className = 'panel-empty';
    empty.textContent = 'Todavía no tenemos información de esta línea.';
    panelBody.append(empty);
  }

  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
}

function closePanel() {
  activeLine?.pinEl()?.classList.remove('is-active');
  activeLine = null;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
}

document.getElementById('panel-close').addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => e.key === 'Escape' && closePanel());
map.on('click', closePanel);

// ---------- Terminal pins ----------
// Lines sharing a terminal (e.g. 10, 17 and 24 in Wilde) get fanned out sideways.
const PIN_SPACING_PX = 40;
const siblings = new Map();
for (const l of LINES) {
  const key = `${l.lat.toFixed(3)},${l.lng.toFixed(3)}`;
  siblings.set(key, [...(siblings.get(key) ?? []), l.line]);
}
function pinOffset(l) {
  const group = siblings.get(`${l.lat.toFixed(3)},${l.lng.toFixed(3)}`);
  return (group.indexOf(l.line) - (group.length - 1) / 2) * PIN_SPACING_PX;
}

const lines = LINES.map((data, i) => {
  const line = { ...data, color: colorFor(i) };
  const icon = L.divIcon({
    className: 'pin-icon',
    html: `<div class="pin" style="--pin-color:${line.color};--dx:${pinOffset(line)}px">${line.line}</div>`,
    iconSize: [0, 0],
  });
  line.marker = L.marker([line.lat, line.lng], {
    icon,
    title: `Línea ${line.line} — ${line.terminal}`,
    keyboard: true,
    riseOnHover: true,
  })
    .on('click', () => openPanel(line))
    .on('keypress', (e) => e.originalEvent.key === 'Enter' && openPanel(line))
    .addTo(map);
  line.pinEl = () => line.marker.getElement()?.querySelector('.pin');
  return line;
});

map.fitBounds(L.latLngBounds(lines.map((l) => [l.lat, l.lng])), { padding: [48, 48] });

// ---------- Routes toggle ----------
const toggle = document.getElementById('routes-toggle');
const status = document.getElementById('status');
const routesLayer = L.layerGroup();
let routesLoaded = false;

function showStatus(text, isError = false) {
  status.textContent = text;
  status.classList.toggle('error', isError);
  status.hidden = !text;
}

async function loadRoutes() {
  showStatus('Cargando recorridos desde OpenStreetMap…');
  toggle.disabled = true;
  try {
    const routes = await fetchRoutes(lines.map((l) => l.line));
    const missing = [];
    for (const line of lines) {
      const segments = routes[line.line] ?? [];
      if (!segments.length) missing.push(line.line);
      L.polyline(segments, { color: line.color, weight: 3, opacity: 0.75 })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          openPanel(line);
        })
        .bindTooltip(`Línea ${line.line}`, { sticky: true })
        .addTo(routesLayer);
    }
    routesLoaded = true;
    showStatus(missing.length ? `Sin recorrido en OpenStreetMap: ${missing.join(', ')}` : '');
    if (missing.length) setTimeout(() => showStatus(''), 5000);
  } catch (err) {
    console.error(err);
    toggle.checked = false;
    showStatus('No se pudieron cargar los recorridos. Probá de nuevo en un rato.', true);
    setTimeout(() => showStatus(''), 5000);
  } finally {
    toggle.disabled = false;
  }
}

toggle.addEventListener('change', async () => {
  if (!toggle.checked) {
    routesLayer.remove();
    return;
  }
  if (!routesLoaded) await loadRoutes();
  if (toggle.checked && routesLoaded) {
    routesLayer.addTo(map);
    lines.forEach((l) => l.marker.setZIndexOffset(1000));
  }
});
