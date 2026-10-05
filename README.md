# Bondis.com

A just-for-fun site about Buenos Aires' *bondis* (colectivos) and public transport culture.

## Terminales (map)

Leaflet map on a light CARTO basemap (OpenStreetMap data) with **every line in the official data**:
138 national, 106 provincial and 57 municipal lines (301 in total).

- Terminals are both ends of every branch. Lines ending within 300 m of each other share one pin.
- Zoomed out, terminals are dots (dark dots show how many lines end there). Click one, or zoom to 14+, to see numbered pins.
- Click a line number to open its side panel: the route is highlighted, a **branch picker** filters it by ramal, each route's length is shown in km, and the line's Spanish Wikipedia article loads below when we have one (`src/data/lines.js`).
- Filter by jurisdiction (Nacionales / Provinciales / Municipales). **Mostrar recorridos** draws every route of the visible lines.

### Route data

Routes come from the official AMBA bus route data of the Secretaría de Transporte (`data/raw/`).
`npm run build:data` simplifies it and writes:

- `public/data/routes/<line>.json`: one file per line, with `ramal`, `sentido` (`ida`/`vuelta`) and `km` on each route
- `public/data/lines.json`: every line with its jurisdiction, km per branch and direction, and terminals

Lengths and terminals are measured on the unsimplified geometry. The OpenStreetMap/Overpass loader is kept in `src/osm-routes.js` but isn't used.

Known data quirks:
- Municipal line numbers are reused in different municipalities (e.g. 501 in six places) and the data doesn't say which, so they show up as one line.
- Branch "NN" in the data is shown as "Ñ".

```sh
npm install
npm run dev          # http://localhost:5173
npm run build:data   # regenerate public/data after replacing data/raw (restart `npm run dev` afterwards)
npm run build        # static site in dist/
```
