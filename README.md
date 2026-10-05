# Bondis.com

A just-for-fun site about Buenos Aires' *bondis* (colectivos) and public transport culture.

## Terminales (map)

Leaflet map on OpenStreetMap tiles with a pin at the terminal (cabecera) of each line.

- Click a pin to open a side panel with the line's Spanish Wikipedia article (placeholder for an internal page).
- **Mostrar recorridos** loads routes from OpenStreetMap through the public Overpass API, in the browser. They're cached for 24 h in `localStorage`.
- Line data lives in `src/data/lines.js`. Most coordinates are approximate (`coords: 'approx'`) until verified.

```sh
npm install
npm run dev     # http://localhost:5173
npm run build   # static site in dist/
```
