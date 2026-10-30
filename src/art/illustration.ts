// Illustrazioni create con Gemini: il giardino nelle quattro stagioni e alcune piante fiorite.
import primavera from '../assets/garden/primavera.webp';
import estate from '../assets/garden/estate.webp';
import autunno from '../assets/garden/autunno.webp';
import inverno from '../assets/garden/inverno.webp';
import girasole from '../assets/plants/girasole.webp';
import ulivo from '../assets/plants/ulivo.webp';
import lavanda from '../assets/plants/lavanda.webp';
import rosa from '../assets/plants/rosa.webp';
import glicine from '../assets/plants/glicine.webp';
import ciclamino from '../assets/plants/ciclamino.webp';
import type { Season } from '../lib/dates';
import type { PlantId } from '../data/plants';

/** Il giardino della stagione in corso. In autunno il melograno ha i frutti maturi. */
export const GARDEN_BY_SEASON: Record<Season, string> = { primavera, estate, autunno, inverno };

/** Foto della pianta fiorita nel proprio angolo (per le altre piante resta il disegno). */
export const PLANT_PHOTO: Partial<Record<PlantId, string>> = { girasole, ulivo, lavanda, rosa, glicine, ciclamino };
