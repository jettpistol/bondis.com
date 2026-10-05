// Terminal (cabecera) of each colectivo line, starting with the most famous ones.
//
// Coordinates were researched from addresses but most are APPROXIMATE
// (could be a few hundred metres off) — see `coords`. Fix them as we verify.
// `wikipedia` is the Spanish Wikipedia article title, shown in the side panel
// until each line gets its own internal page.

export const LINES = [
  { line: '7', company: 'NUDO S.A. (Grupo DOTA)', terminal: 'Parque Avellaneda (Medina 1750)', otherEnd: 'Retiro', lat: -34.6555, lng: -58.4815, coords: 'approx', wikipedia: 'Línea 7 (Buenos Aires)' },
  { line: '10', company: 'Línea 10 S.A.', terminal: 'Wilde (Camacuá y Fabián Onsari)', otherEnd: 'Palermo', lat: -34.7000, lng: -58.3085, coords: 'approx', wikipedia: 'Línea 10 (Buenos Aires)' },
  { line: '12', company: 'Transportes Automotores Callao S.A.', terminal: 'Puente Pueyrredón (Pedro de Luján 2070, Barracas)', otherEnd: 'Plaza Falucho, Palermo', lat: -34.6560, lng: -58.3780, coords: 'approx', wikipedia: 'Línea 12 (Buenos Aires)' },
  { line: '15', company: 'Transportes Sur Nor C.I.S.A.', terminal: 'Valentín Alsina, Lanús', otherEnd: 'Benavídez / Gral. Pacheco', lat: -34.6690, lng: -58.4175, coords: 'approx', wikipedia: 'Línea 15 (Buenos Aires)' },
  { line: '17', company: 'Línea 17 S.A.', terminal: 'Wilde (Fabián Onsari y Camacuá)', otherEnd: 'Recoleta (Facultad de Derecho)', lat: -34.7000, lng: -58.3085, coords: 'approx', wikipedia: 'Línea 17 (Buenos Aires)' },
  { line: '24', company: 'ETAPSA', terminal: 'Wilde (Av. Fabián Onsari 2150)', otherEnd: 'Villa del Parque', lat: -34.7000, lng: -58.3085, coords: 'approx', wikipedia: 'Línea 24 (Buenos Aires)' },
  { line: '29', company: 'Pedro de Mendoza C.I.S.A.', terminal: 'La Boca (Rocha 945)', otherEnd: 'Olivos / Parque Sarmiento', lat: -34.6409, lng: -58.3640, coords: 'approx', wikipedia: 'Línea 29 (Buenos Aires)' },
  { line: '37', company: '4 de Septiembre S.A.T.C.P.', terminal: 'Remedios de Escalada (Av. H. Yrigoyen 5432)', otherEnd: 'Ciudad Universitaria / Plaza Italia', lat: -34.7179, lng: -58.3931, coords: 'verified', wikipedia: 'Línea 37 (Buenos Aires)' },
  { line: '39', company: 'Transportes Santa Fe S.A.C.I.', terminal: 'Barracas (Pedro de Mendoza y Regimiento de Patricios)', otherEnd: 'Chacarita', lat: -34.6455, lng: -58.3680, coords: 'approx', wikipedia: 'Línea 39 (Buenos Aires)' },
  { line: '41', company: 'Azul S.A.T.A.', terminal: 'Bajo Autopista 25 de Mayo (Sánchez de Loria)', otherEnd: 'Villa Adelina / Munro', lat: -34.6250, lng: -58.4110, coords: 'approx', wikipedia: 'Línea 41 (Buenos Aires)' },
  { line: '59', company: 'MOCBA', terminal: 'Barracas (Olavarría 2980)', otherEnd: 'Munro / Florida', lat: -34.6455, lng: -58.3960, coords: 'approx', wikipedia: 'Línea 59 (Buenos Aires)' },
  { line: '60', company: 'MONSA (Micro Ómnibus Norte S.A.)', terminal: 'Barracas (Santa Elena 1168)', otherEnd: 'Tigre / Escobar', lat: -34.6525, lng: -58.3845, coords: 'approx', wikipedia: 'Línea 60 (Buenos Aires)' },
  { line: '64', company: 'Vuelta de Rocha S.A.T.C.I.', terminal: 'La Boca (Rocha 973)', otherEnd: 'Barrancas de Belgrano', lat: -34.6410, lng: -58.3638, coords: 'verified', wikipedia: 'Línea 64 (Buenos Aires)' },
  { line: '68', company: 'Transportes Sesenta y Ocho S.R.L.', terminal: 'Puente Saavedra (Av. Maipú 75)', otherEnd: 'Plaza Miserere', lat: -34.5525, lng: -58.4885, coords: 'approx', wikipedia: 'Línea 68 (Buenos Aires)' },
  { line: '109', company: 'Grupo Metropol', terminal: 'Estación Liniers', otherEnd: 'Puerto Madero', lat: -34.6395, lng: -58.5230, coords: 'approx', wikipedia: 'Línea 109 (Buenos Aires)' },
  { line: '132', company: 'Nuevos Rumbos S.A.', terminal: 'Cementerio de Flores (Av. Varela 1628)', otherEnd: 'Retiro', lat: -34.6440, lng: -58.4620, coords: 'approx', wikipedia: 'Línea 132 (Buenos Aires)' },
  { line: '152', company: 'Empresa Tandilense S.A.C.I.F.I. y de S.', terminal: 'Olivos (J. G. de Bermúdez 3318)', otherEnd: 'La Boca', lat: -34.5175, lng: -58.5075, coords: 'approx', wikipedia: 'Línea 152 (Buenos Aires)' },
  { line: '168', company: 'Expreso San Isidro (Grupo DOTA)', terminal: 'La Boca (Ministro Brin 1279)', otherEnd: 'San Isidro / Puente Saavedra', lat: -34.6345, lng: -58.3605, coords: 'approx', wikipedia: 'Línea 168 (Buenos Aires)' },
];
