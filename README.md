# Bondis.com

A just-for-fun site about Buenos Aires' *bondis* (colectivos) and public transport culture.

## Terminales (map)

Leaflet map on OpenStreetMap tiles with a pin at **both ends of every branch** of each line.
Lines ending at the same spot (within 300 m) share one pin.

- Click a line number to open its side panel: the route is highlighted, a **branch picker** filters it by ramal, and the line's Spanish Wikipedia article loads below (placeholder for an internal page).
- **Mostrar recorridos** draws every route of the listed lines.
- Lines shown are listed in `src/data/lines.js`.

### Route data

Routes come from the official AMBA bus route data of the Secretaría de Transporte (`data/raw/`).
`npm run build:data` simplifies it and writes:

- `public/data/routes/<line>.json`: one file per line, with `ramal` and `sentido` on each route
- `public/data/terminals.json`: route ends clustered into terminals, with the branches ending there

Only the national lines (1–195) are processed for now. The OpenStreetMap/Overpass loader is kept in `src/osm-routes.js` but isn't used.

```sh
npm install
npm run dev          # http://localhost:5173
npm run build:data   # regenerate public/data after replacing data/raw
npm run build        # static site in dist/
```
