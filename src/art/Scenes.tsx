// Scene illustrate: il giardino condiviso e l'angolo personale.
import type { ReactNode } from 'react';
import type { Season } from '../lib/dates';
import type { Species } from '../data/plants';
import { PlantShapes } from './Plant';

const PALETTE: Record<Season, { top: string; bottom: string; far: string; grass: string; grass2: string; path: string; sun: string }> = {
  primavera: { top: '#CDEBFF', bottom: '#F2FAEF', far: '#B9DDA5', grass: '#A6D488', grass2: '#94C877', path: '#EFE3C2', sun: '#FFD54A' },
  estate: { top: '#BFE3FF', bottom: '#FFF8E1', far: '#A9CF85', grass: '#98C86C', grass2: '#86BB5C', path: '#F1E2BC', sun: '#FFC800' },
  autunno: { top: '#FCDDB0', bottom: '#FFF4E6', far: '#D6BE86', grass: '#C9D088', grass2: '#B8C177', path: '#EEDDB8', sun: '#FFB547' },
  inverno: { top: '#DCE8F2', bottom: '#F7FAFC', far: '#C7D5CE', grass: '#D7E3DA', grass2: '#C6D6CB', path: '#ECE6DA', sun: '#FFE08A' },
};

/** Inserisce una pianta (120x140) con la base in (x, y). */
function Placed({ x, y, scale, children }: { x: number; y: number; scale: number; children: ReactNode }) {
  return <g transform={`translate(${x - 60 * scale} ${y - 128 * scale}) scale(${scale})`}>{children}</g>;
}

function Sky({ season, id }: { season: Season; id: string }) {
  const p = PALETTE[season];
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="1" stopColor={p.bottom} />
        </linearGradient>
        <radialGradient id={`sun-${id}`}>
          <stop offset="0.55" stopColor={p.sun} />
          <stop offset="1" stopColor={p.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="360" height="400" fill={`url(#sky-${id})`} />
      <circle cx={304} cy={52} r={38} fill={`url(#sun-${id})`} />
      <circle cx={304} cy={52} r={18} fill={p.sun} />
      <g fill="#FFFFFF" opacity={0.85}>
        <ellipse cx={70} cy={56} rx={30} ry={11} />
        <ellipse cx={92} cy={48} rx={20} ry={11} />
        <ellipse cx={196} cy={84} rx={22} ry={7} />
        <ellipse cx={212} cy={78} rx={14} ry={8} />
      </g>
    </>
  );
}

function Label({ x, y, text, me }: { x: number; y: number; text: string; me?: boolean }) {
  const w = Math.max(34, text.length * 7.6 + 16);
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={20} rx={10} fill={me ? '#378500' : '#FFFFFF'} stroke={me ? '#2A6900' : '#CBD5E1'} strokeWidth={1.5} />
      <text x={x} y={y + 14.5} textAnchor="middle" fontSize={13} fontWeight={800} fill={me ? '#FFFFFF' : '#1F2937'} fontFamily="'Plus Jakarta Sans Variable', sans-serif">
        {text}
      </text>
    </g>
  );
}

export interface PlotInfo {
  name: string;
  species: Species;
  stage: number;
  blooms: number;
  me?: boolean;
}

const POSITIONS: Record<number, [number, number][]> = {
  1: [[180, 300]],
  2: [[112, 292], [248, 292]],
  3: [[76, 280], [180, 304], [284, 280]],
  4: [[60, 272], [138, 300], [222, 300], [300, 272]],
  5: [[48, 266], [112, 296], [180, 310], [248, 296], [312, 266]],
  6: [[40, 262], [98, 290], [152, 308], [208, 308], [262, 290], [320, 262]],
};

export function GardenScene({
  season, treeStage, plots, label,
}: { season: Season; treeStage: number; plots: PlotInfo[]; label: string }) {
  const p = PALETTE[season];
  const n = Math.min(6, plots.length);
  // L'utente sta al centro.
  const ordered = [...plots.slice(0, n)];
  const meIdx = ordered.findIndex((x) => x.me);
  if (meIdx >= 0) {
    const [me] = ordered.splice(meIdx, 1);
    ordered.splice(Math.floor(n / 2), 0, me);
  }
  const pos = POSITIONS[n] ?? POSITIONS[1];
  return (
    <svg viewBox="0 0 360 344" className="w-full h-auto block" role="img" aria-label={label}>
      <Sky season={season} id="g" />
      <path d="M0 150 C60 120 120 130 180 140 C250 150 300 118 360 132 L360 344 L0 344 Z" fill={p.far} />
      <path d="M0 182 C80 162 160 170 220 174 C280 178 320 164 360 172 L360 344 L0 344 Z" fill={p.grass} />
      <path d="M0 236 C90 222 170 230 250 226 C300 224 330 218 360 222 L360 344 L0 344 Z" fill={p.grass2} />
      <path d="M150 344 C164 300 196 270 176 224 L186 222 C214 270 190 304 214 344 Z" fill={p.path} />
      {/* fiorellini nel prato */}
      {[[24, 210], [70, 196], [118, 214], [262, 204], [300, 212], [336, 196], [140, 250], [232, 252], [20, 300], [338, 300]].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={2.6} fill={['#FFFFFF', '#FFE07A', '#F2A7C3'][i % 3]} />
          <circle cx={x} cy={y} r={1} fill="#F5B000" />
        </g>
      ))}
      <Placed x={180} y={222} scale={1.3}>
        <PlantShapes species="melograno" stage={treeStage} />
      </Placed>
      {ordered.map((pl, i) => {
        const [x, y] = pos[i];
        return (
          <g key={pl.name}>
            <Placed x={x} y={y - 6} scale={0.5}>
              <PlantShapes species={pl.species} stage={pl.stage} blooms={pl.blooms} />
            </Placed>
            <Label x={x} y={y - 2} text={pl.me ? 'Tu' : pl.name} me={pl.me} />
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Angolo personale ----------

function Bench() {
  return (
    <g transform="translate(268 206)">
      <rect x={0} y={0} width={70} height={7} rx={2} fill="#B07A47" />
      <rect x={0} y={10} width={70} height={7} rx={2} fill="#9C6A3B" />
      <rect x={-2} y={-18} width={74} height={6} rx={2} fill="#B07A47" />
      <rect x={-2} y={-9} width={74} height={6} rx={2} fill="#9C6A3B" />
      <rect x={6} y={17} width={5} height={16} fill="#5B3A1E" />
      <rect x={59} y={17} width={5} height={16} fill="#5B3A1E" />
    </g>
  );
}

function Sign({ name }: { name: string }) {
  const t = name ? `L'angolo di ${name}` : 'Il mio angolo';
  const w = Math.max(96, t.length * 6.6 + 18);
  return (
    <g transform="translate(26 196)">
      <rect x={w / 2 - 3} y={18} width={6} height={30} fill="#7A5A3A" />
      <rect x={0} y={0} width={w} height={24} rx={5} fill="#E8C895" stroke="#B0884F" strokeWidth={2} />
      <text x={w / 2} y={16.5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#4A3216" fontFamily="'Plus Jakarta Sans Variable', sans-serif">{t}</text>
    </g>
  );
}

function Pot() {
  return (
    <g transform="translate(232 214)">
      <path d="M0 0 H34 L29 30 H5 Z" fill="#C8693B" />
      <rect x={-3} y={-6} width={40} height={9} rx={3} fill="#D97E4C" />
      <g transform="translate(17 -6)">
        {[-40, -15, 10, 35].map((a) => (
          <ellipse key={a} cx={0} cy={-9} rx={3} ry={10} fill="#5E9B4F" transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  );
}

function Stones() {
  const s: [number, number, number, string][] = [[120, 258, 9, '#9DB4D8'], [140, 262, 7, '#E5A99A'], [158, 258, 8, '#F2D58A'], [206, 262, 8, '#B6D7A8'], [224, 258, 9, '#C9B2E0'], [242, 263, 6, '#9DB4D8']];
  return <g>{s.map(([x, y, r, c]) => <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.65} fill={c} stroke="#FFFFFF" strokeWidth={1.2} />)}</g>;
}

function Lantern() {
  return (
    <g transform="translate(2 118)">
      <rect x={10} y={30} width={4} height={98} fill="#3F4A52" />
      <path d="M2 4 H22 L18 30 H6 Z" fill="#FFE7A3" stroke="#3F4A52" strokeWidth={2.5} />
      <path d="M0 4 L12 -6 L24 4 Z" fill="#3F4A52" />
      <circle cx={12} cy={17} r={4} fill="#FFC800" />
    </g>
  );
}

function Birdhouse() {
  return (
    <g transform="translate(300 96)">
      <rect x={12} y={34} width={5} height={80} fill="#7A5A3A" />
      <rect x={0} y={10} width={30} height={26} rx={2} fill="#E5484D" />
      <path d="M-4 12 L15 -6 L34 12 Z" fill="#8B3A2E" />
      <circle cx={15} cy={22} r={4.5} fill="#3B2615" />
      <rect x={13} y={28} width={4} height={4} fill="#3B2615" />
    </g>
  );
}

export function CornerScene({
  season, species, stage, blooms, decorations, name,
}: { season: Season; species: Species; stage: number; blooms: number; decorations: string[]; name: string }) {
  const p = PALETTE[season];
  const has = (d: string) => decorations.includes(d);
  return (
    <svg viewBox="0 0 360 290" className="w-full h-auto block" role="img" aria-label={`Il tuo angolo del giardino. La tua pianta è nello stadio ${['seme', 'germoglio', 'foglie', 'boccioli', 'fiori'][stage]}.`}>
      <Sky season={season} id="c" />
      <path d="M0 180 C90 166 200 172 360 170 L360 290 L0 290 Z" fill={p.grass} />
      <path d="M0 222 C100 214 240 218 360 214 L360 290 L0 290 Z" fill={p.grass2} />
      {/* staccionata */}
      <g stroke="#C9A77A" strokeWidth={4} strokeLinecap="round">
        <line x1={0} y1={168} x2={360} y2={166} />
        <line x1={0} y1={184} x2={360} y2={182} />
        {Array.from({ length: 13 }, (_, i) => i * 30 + 6).map((x) => <line key={x} x1={x} y1={156} x2={x} y2={192} />)}
      </g>
      {has('lanterna') && <Lantern />}
      {has('casetta') && <Birdhouse />}
      <Placed x={180} y={250} scale={1.45}>
        <PlantShapes species={species} stage={stage} blooms={blooms} />
      </Placed>
      {has('panchina') && <Bench />}
      {has('vaso') && <Pot />}
      {has('cartellino') && <Sign name={name} />}
      {has('sassi') && <Stones />}
    </svg>
  );
}
