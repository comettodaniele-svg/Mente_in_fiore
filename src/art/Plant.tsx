// Piante illustrate in SVG, in 5 stadi: 0 Seme, 1 Germoglio, 2 Foglie, 3 Boccioli, 4 Fiori.
// Ogni specie si riconosce dalla FORMA (non solo dal colore), così la distingue anche chi vede male i colori.
// Coordinate: riquadro 120 x 140, base del terreno a y = 128.

import type { ReactNode } from 'react';
import type { Species } from '../data/plants';

const leafPath = (L: number, W: number) =>
  `M0 0 C ${W} ${-L * 0.25} ${W * 1.05} ${-L * 0.7} 0 ${-L} C ${-W * 1.05} ${-L * 0.7} ${-W} ${-L * 0.25} 0 0 Z`;

function Leaf({ x, y, a, L, W, fill, vein }: { x: number; y: number; a: number; L: number; W: number; fill: string; vein?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={leafPath(L, W)} fill={fill} />
      {vein && <path d={`M0 -1 L0 ${-L * 0.85}`} stroke={vein} strokeWidth={0.8} strokeLinecap="round" />}
    </g>
  );
}

const Soil = () => (
  <g>
    <ellipse cx={60} cy={131} rx={36} ry={7} fill="#6E4826" />
    <ellipse cx={60} cy={129} rx={34} ry={5.5} fill="#946339" />
  </g>
);

function Seed() {
  return (
    <g>
      <path d="M38 130 Q60 112 82 130 Z" fill="#8B5E34" />
      <path d="M46 126 Q60 116 74 126" stroke="#A8784A" strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={60} cy={119} rx={5} ry={3.4} fill="#5B3A1E" transform="rotate(-20 60 119)" />
      <ellipse cx={58.6} cy={118} rx={1.6} ry={0.9} fill="#A8784A" transform="rotate(-20 58.6 118)" />
    </g>
  );
}

function Sprout() {
  return (
    <g>
      <path d="M60 128 C60 120 61 114 60 104" stroke="#5DA83A" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Leaf x={60} y={106} a={-58} L={17} W={6.5} fill="#7CC24A" vein="#5DA83A" />
      <Leaf x={60} y={106} a={58} L={17} W={6.5} fill="#8BD158" vein="#5DA83A" />
    </g>
  );
}

// ---------- Fiori ----------

function Rose({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.48} rx={r * 0.55} ry={r * 0.6} fill="#B5123E" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.82} fill="#D6345A" />
      <circle r={r * 0.56} fill="#E5486F" />
      <path d={`M${-r * 0.3} 0 A ${r * 0.3} ${r * 0.3} 0 1 1 ${r * 0.15} ${r * 0.26}`} stroke="#A80F3A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d={`M${-r * 0.12} ${-r * 0.05} A ${r * 0.13} ${r * 0.13} 0 1 1 ${r * 0.08} ${r * 0.1}`} stroke="#A80F3A" strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Sunflower({ x, y, r }: { x: number; y: number; r: number }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((a, i) => (
        <ellipse key={a} cx={0} cy={-r * 0.92} rx={r * 0.26} ry={r * 0.55} fill={i % 2 ? '#FFC93C' : '#F5B000'} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.6} fill="#5E3416" />
      <circle r={r * 0.42} fill="#7A4A22" />
      {Array.from({ length: 8 }, (_, i) => i * 45).map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.3} cy={Math.sin((a * Math.PI) / 180) * r * 0.3} r={r * 0.06} fill="#3E200B" />
      ))}
    </g>
  );
}

function Tulip({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-12 6 C-14 -6 -10 -14 -4 -18 C-2 -8 -2 0 -4 10 Z" fill="#C23B27" />
      <path d="M12 6 C14 -6 10 -14 4 -18 C2 -8 2 0 4 10 Z" fill="#C23B27" />
      <path d="M-9 10 C-11 -4 -6 -14 0 -20 C6 -14 11 -4 9 10 Q0 16 -9 10 Z" fill="#E8553E" />
      <path d="M-3 6 C-4 -4 -2 -10 0 -14" stroke="#F58A70" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cyclamen({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-34, -17, 0, 17, 34].map((a) => (
        <Leaf key={a} x={0} y={0} a={a} L={15} W={3.8} fill={a === 0 ? '#E86AA6' : '#E0569B'} />
      ))}
      <circle r={2.6} fill="#A0285F" />
    </g>
  );
}

function Raceme({ x, y, n = 7, color = ['#9B8FE0', '#B9AEF0', '#7F72CF'] }: { x: number; y: number; n?: number; color?: string[] }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const w = (n - i) * 1.1;
    const cnt = i < n - 2 ? 2 : 1;
    for (let k = 0; k < cnt; k++) {
      const cx = cnt === 1 ? 0 : (k === 0 ? -w * 0.5 : w * 0.5);
      out.push(<circle key={`${i}-${k}`} cx={x + cx} cy={y + i * 4.2} r={Math.max(1.6, 3.3 - i * 0.22)} fill={color[(i + k) % color.length]} />);
    }
  }
  return <g>{out}</g>;
}

// ---------- Specie ----------

function rosa(stage: number, blooms: number) {
  const extra = [
    { x: 80, y: 82, r: 8, stem: 'M61 104 C70 98 76 92 80 84' },
    { x: 34, y: 98, r: 7, stem: 'M60 116 C50 112 40 106 35 100' },
    { x: 84, y: 104, r: 6.5, stem: 'M61 118 C70 114 78 110 83 106' },
  ];
  return (
    <g>
      <path d="M60 128 C58 108 62 85 60 58" stroke="#3B6E2B" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      <path d="M60 98 C52 92 46 84 42 76" stroke="#3B6E2B" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {stage === 4 && extra.slice(0, Math.min(3, blooms)).map((e) => (
        <path key={e.stem} d={e.stem} stroke="#3B6E2B" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ))}
      {[112, 96, 80].map((y, i) => (
        <g key={y}>
          <Leaf x={60} y={y} a={-62 + i * 4} L={13} W={5.5} fill="#3F7D33" vein="#2E5E25" />
          <Leaf x={60} y={y - 6} a={60 - i * 4} L={12} W={5} fill="#4A8A3A" vein="#2E5E25" />
        </g>
      ))}
      <Leaf x={49} y={86} a={-28} L={10} W={4.5} fill="#4A8A3A" />
      {stage === 3 && (
        <g>
          <path d="M60 46 C66 52 66 60 60 62 C54 60 54 52 60 46 Z" fill="#C9184A" />
          <Leaf x={60} y={62} a={-35} L={8} W={2.5} fill="#3F7D33" />
          <Leaf x={60} y={62} a={35} L={8} W={2.5} fill="#3F7D33" />
          <path d="M42 66 C46 70 46 75 42 76 C38 75 38 70 42 66 Z" fill="#C9184A" />
        </g>
      )}
      {stage === 4 && (
        <g>
          <Rose x={60} y={54} r={13} />
          <Rose x={42} y={74} r={9} />
          {extra.slice(0, Math.min(3, blooms)).map((e) => <Rose key={e.x} x={e.x} y={e.y} r={e.r} />)}
        </g>
      )}
    </g>
  );
}

function girasole(stage: number, blooms: number) {
  const extra = [
    { x: 86, y: 74, r: 9, stem: 'M61 100 C72 92 80 84 85 76' },
    { x: 34, y: 82, r: 8.5, stem: 'M60 108 C48 100 40 92 35 84' },
  ];
  return (
    <g>
      <path d="M60 128 C61 100 59 70 60 40" stroke="#4C7A2A" strokeWidth={5} fill="none" strokeLinecap="round" />
      {stage === 4 && extra.slice(0, Math.min(2, blooms)).map((e) => (
        <path key={e.stem} d={e.stem} stroke="#4C7A2A" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      <Leaf x={60} y={112} a={-66} L={25} W={11} fill="#5C8F2E" vein="#40691D" />
      <Leaf x={60} y={96} a={64} L={23} W={10} fill="#6A9E36" vein="#40691D" />
      <Leaf x={60} y={78} a={-58} L={18} W={8.5} fill="#5C8F2E" vein="#40691D" />
      {stage === 3 && (
        <g transform="translate(60 40)">
          {Array.from({ length: 10 }, (_, i) => i * 36).map((a) => (
            <ellipse key={a} cx={0} cy={-11} rx={2.4} ry={4.2} fill="#F5B000" transform={`rotate(${a})`} />
          ))}
          <circle r={10} fill="#6E9A3A" />
          <circle r={6} fill="#5C8530" />
        </g>
      )}
      {stage === 4 && (
        <g>
          <Sunflower x={60} y={38} r={18} />
          {extra.slice(0, Math.min(2, blooms)).map((e) => <Sunflower key={e.x} x={e.x} y={e.y} r={e.r} />)}
        </g>
      )}
    </g>
  );
}

function lavanda(stage: number, blooms: number) {
  const leaves = [-62, -46, -30, -16, -4, 8, 20, 34, 48, 62];
  const baseStems = [
    [36, 62], [45, 52], [53, 46], [60, 42], [67, 46], [75, 52], [84, 62],
  ];
  const extraStems = [[28, 74], [92, 74], [40, 70], [80, 70]];
  const stems = stage === 4 ? [...baseStems, ...extraStems.slice(0, Math.min(4, blooms))] : baseStems;
  return (
    <g>
      {stage >= 3 && stems.map(([tx, ty]) => (
        <g key={`${tx}-${ty}`}>
          <path d={`M60 122 Q${(60 + tx) / 2} ${(122 + ty) / 2 + 6} ${tx} ${ty}`} stroke="#6F8A68" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {Array.from({ length: 6 }, (_, i) => {
            const t = i / 6;
            const px = tx + (60 - tx) * t * 0.22;
            const py = ty + (122 - ty) * t * 0.22;
            const col = stage === 4 ? (i % 2 ? '#A88BD8' : '#8566C1') : (i % 2 ? '#A9BCA1' : '#93AA8B');
            return <ellipse key={i} cx={px} cy={py} rx={2.7} ry={3.5} fill={col} />;
          })}
        </g>
      ))}
      {leaves.map((a, i) => (
        <Leaf key={a} x={60} y={127} a={a} L={stage >= 2 ? 26 - Math.abs(a) * 0.08 : 18} W={2.6} fill={i % 2 ? '#93AE8E' : '#7E9B7A'} />
      ))}
    </g>
  );
}

function tulipano(stage: number, blooms: number) {
  const extra = [
    { x: 38, y: 72, stem: 'M56 128 C50 108 42 92 38 80' },
    { x: 84, y: 76, stem: 'M64 128 C70 110 80 94 84 84' },
  ];
  return (
    <g>
      {stage === 4 && extra.slice(0, Math.min(2, blooms)).map((e) => (
        <path key={e.stem} d={e.stem} stroke="#4F8A43" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      <path d="M60 128 C60 105 61 80 60 62" stroke="#4F8A43" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <Leaf x={57} y={128} a={-16} L={52} W={8.5} fill="#5E9B4F" />
      <Leaf x={63} y={128} a={20} L={44} W={7.5} fill="#6BA85B" />
      <Leaf x={60} y={128} a={-2} L={34} W={6} fill="#4F8A43" />
      {stage === 3 && (
        <g>
          <path d="M54 62 C53 52 56 46 60 44 C64 46 67 52 66 62 Q60 66 54 62 Z" fill="#D9653F" />
          <path d="M55 62 C55 56 57 52 58 50 C58 56 58 60 60 64 Z" fill="#7FA94A" />
        </g>
      )}
      {stage === 4 && (
        <g>
          <Tulip x={60} y={56} />
          {extra.slice(0, Math.min(2, blooms)).map((e) => <Tulip key={e.x} x={e.x} y={e.y} s={0.8} />)}
        </g>
      )}
    </g>
  );
}

function ciclamino(stage: number, blooms: number) {
  const heart = (L: number, W: number) =>
    `M0 0 C ${-W} ${-L * 0.25} ${-W * 1.05} ${-L * 0.95} ${-W * 0.35} ${-L} C ${-W * 0.12} ${-L} 0 ${-L * 0.9} 0 ${-L * 0.82} C 0 ${-L * 0.9} ${W * 0.12} ${-L} ${W * 0.35} ${-L} C ${W * 1.05} ${-L * 0.95} ${W} ${-L * 0.25} 0 0 Z`;
  const tips = [
    [44, 72], [60, 62], [76, 72],
  ];
  const extraTips = [[34, 86], [86, 86], [52, 78], [68, 78]];
  const all = stage === 4 ? [...tips, ...extraTips.slice(0, Math.min(4, blooms))] : tips;
  return (
    <g>
      {stage >= 3 && all.map(([tx, ty]) => (
        <path key={`s${tx}-${ty}`} d={`M60 120 C${60 + (tx - 60) * 0.3} ${ty + 20} ${tx} ${ty + 22} ${tx} ${ty + 4}`} stroke="#8C3B5E" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      ))}
      {[-72, -38, 0, 38, 72, -18, 18].map((a, i) => (
        <g key={a} transform={`translate(60 127) rotate(${a})`}>
          <path d={heart(i > 4 ? 16 : 19, i > 4 ? 10 : 12)} fill={i % 2 ? '#2F6B3A' : '#285E33'} />
          <ellipse cx={0} cy={i > 4 ? -9 : -10} rx={i > 4 ? 4.5 : 5.5} ry={i > 4 ? 4 : 5} fill="#86AE90" opacity={0.7} />
        </g>
      ))}
      {stage === 3 && all.map(([tx, ty]) => (
        <path key={`b${tx}`} d={`M${tx} ${ty + 4} C${tx + 3} ${ty + 8} ${tx + 2} ${ty + 13} ${tx} ${ty + 14} C${tx - 2} ${ty + 13} ${tx - 3} ${ty + 8} ${tx} ${ty + 4} Z`} fill="#E07AA8" />
      ))}
      {stage === 4 && all.map(([tx, ty]) => <Cyclamen key={`f${tx}-${ty}`} x={tx} y={ty + 4} />)}
    </g>
  );
}

const OLIVE_CLUSTERS = [
  [40, 62], [80, 56], [60, 50], [48, 72], [72, 70], [60, 64], [30, 70], [90, 66],
];
const OLIVE_SPOTS = [
  [36, 60], [44, 68], [52, 52], [58, 60], [66, 50], [72, 64], [80, 58], [86, 66], [48, 76], [64, 72], [30, 72], [90, 70],
];

function ulivo(stage: number, blooms: number) {
  const clusters = stage === 2 ? OLIVE_CLUSTERS.slice(2, 6) : OLIVE_CLUSTERS;
  const angles = [-70, -40, -15, 10, 35, 60, 90, 130];
  return (
    <g>
      <path d="M56 128 C53 112 63 104 58 92 C55 84 61 78 60 68" stroke="#7D6B5D" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M59 86 C50 80 44 74 38 66" stroke="#7D6B5D" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      <path d="M60 80 C68 74 76 66 82 58" stroke="#7D6B5D" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      {clusters.map(([cx, cy], ci) => (
        <g key={`${cx}-${cy}`}>
          {angles.map((a, i) => (
            <Leaf key={a} x={cx} y={cy} a={a + ci * 11} L={12} W={2.7} fill={['#8FA889', '#A7BDA1', '#6F8C69'][(i + ci) % 3]} />
          ))}
        </g>
      ))}
      {stage === 3 && OLIVE_SPOTS.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="#F3EFD2" />)}
      {stage === 4 && OLIVE_SPOTS.slice(0, 8 + Math.min(4, blooms)).map(([x, y], i) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y + 2} rx={2.7} ry={3.7} fill={i % 3 === 0 ? '#5E3B5C' : '#4B5320'} />
      ))}
    </g>
  );
}

const LEMON_SPOTS = [
  [44, 66], [74, 62], [58, 56], [52, 80], [70, 80], [36, 76], [84, 74], [62, 70], [46, 52], [76, 50],
];

function limone(stage: number, blooms: number) {
  const s = stage === 2 ? 0.72 : 1;
  const crown = (
    <g transform={`translate(60 72) scale(${s}) translate(-60 -72)`}>
      <circle cx={60} cy={64} r={25} fill="#2F7D32" />
      <circle cx={42} cy={74} r={17} fill="#2B7230" />
      <circle cx={78} cy={74} r={17} fill="#2B7230" />
      <circle cx={51} cy={52} r={15} fill="#358A38" />
      <circle cx={70} cy={50} r={15} fill="#358A38" />
      {[[40, 66, -30], [50, 48, 10], [64, 44, -10], [78, 58, 30], [58, 66, 0], [72, 74, 40], [46, 80, -50], [84, 70, 60], [62, 56, 20], [36, 74, -70]].map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} a={a} L={10} W={4} fill="#4C9A47" />
      ))}
    </g>
  );
  return (
    <g>
      <path d="M60 128 C59 112 61 100 60 82" stroke="#7A5A3A" strokeWidth={6} fill="none" strokeLinecap="round" />
      {crown}
      {stage === 3 && LEMON_SPOTS.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={0} cy={-1.9} r={1.5} fill="#FFFFFF" transform={`rotate(${a})`} />)}
          <circle r={0.9} fill="#F7D31C" />
        </g>
      ))}
      {stage === 4 && LEMON_SPOTS.slice(0, 6 + Math.min(4, blooms)).map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y + 3}) rotate(-20)`}>
          <ellipse rx={5.6} ry={4.3} fill="#F7D31C" stroke="#D8B400" strokeWidth={0.6} />
          <ellipse cx={-1.8} cy={-1.4} rx={1.6} ry={0.9} fill="#FFF3A6" />
        </g>
      ))}
    </g>
  );
}

const WISTERIA_POINTS = [
  [40, 54], [52, 49], [64, 50], [80, 50], [94, 58], [34, 58], [72, 52], [88, 54],
];

function glicine(stage: number, blooms: number) {
  const leafSpots = [[36, 50, -60], [46, 46, -20], [58, 44, 10], [70, 46, 30], [84, 46, 60], [96, 54, 90], [64, 64, -40], [56, 82, 40], [62, 98, -40]];
  return (
    <g>
      <path d="M58 128 C54 108 64 96 58 80 C54 68 60 56 70 50 C80 46 92 48 98 56" stroke="#6E5A49" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M70 50 C62 44 48 44 34 52" stroke="#6E5A49" strokeWidth={3} fill="none" strokeLinecap="round" />
      {leafSpots.map(([x, y, a]) => (
        <g key={`${x}-${y}`}>
          <Leaf x={x} y={y} a={a} L={9} W={3.2} fill="#7BAE57" />
          <Leaf x={x} y={y} a={a + 40} L={7} W={2.8} fill="#8FC069" />
          <Leaf x={x} y={y} a={a - 40} L={7} W={2.8} fill="#6A9D49" />
        </g>
      ))}
      {stage === 3 && WISTERIA_POINTS.slice(0, 5).map(([x, y]) => (
        <Raceme key={`${x}-${y}`} x={x} y={y + 3} n={3} color={['#B8C99A', '#C9BDEB']} />
      ))}
      {stage === 4 && WISTERIA_POINTS.slice(0, 5 + Math.min(3, blooms)).map(([x, y]) => (
        <Raceme key={`${x}-${y}`} x={x} y={y + 3} n={7} />
      ))}
    </g>
  );
}

const POM_CLUSTERS: [number, number, number, string][] = [
  [60, 52, 24, '#4E9A5C'], [38, 66, 18, '#468C53'], [82, 66, 18, '#468C53'], [48, 44, 15, '#5AA866'], [72, 42, 15, '#5AA866'], [60, 72, 16, '#4E9A5C'],
];
const POM_SPOTS = [
  [40, 60], [52, 46], [68, 44], [80, 60], [60, 62], [46, 74], [74, 74], [32, 70], [88, 70], [60, 36],
];

function melograno(stage: number, blooms: number) {
  const s = stage === 2 ? 0.7 : 1;
  return (
    <g>
      <path d="M60 128 C57 110 64 98 60 82" stroke="#7A5A3A" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M60 92 C52 86 46 80 42 72" stroke="#7A5A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M61 88 C68 82 74 76 78 70" stroke="#7A5A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
      <g transform={`translate(60 70) scale(${s}) translate(-60 -70)`}>
        {POM_CLUSTERS.map(([x, y, r, c]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c} />)}
        {[[42, 58, -30], [56, 40, 0], [76, 50, 30], [64, 70, 20], [36, 74, -60], [86, 72, 60], [50, 62, -10]].map(([x, y, a]) => (
          <Leaf key={`${x}-${y}`} x={x} y={y} a={a} L={9} W={3.4} fill="#6BB36F" />
        ))}
        {stage === 3 && POM_SPOTS.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 3} ${y - 3} L${x + 3} ${y - 3} L${x + 1.6} ${y + 3} L${x - 1.6} ${y + 3} Z`} fill="#E8553E" />
        ))}
        {stage === 4 && POM_SPOTS.slice(0, 7 + Math.min(3, blooms)).map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y + 3})`}>
            <circle r={6} fill="#B8323A" />
            <path d="M-2.2 -5.6 L-1 -8 L0 -6 L1 -8 L2.2 -5.6 Z" fill="#7A1F25" />
            <ellipse cx={-2} cy={-2} rx={1.6} ry={1} fill="#E86A6F" />
          </g>
        ))}
      </g>
    </g>
  );
}

// ---------- Fiori e ortaggi aggiunti ----------

function Daisy({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 14 }, (_, i) => i * (360 / 14)).map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.62} rx={r * 0.2} ry={r * 0.48} fill="#FFFFFF" stroke="#E2E6EA" strokeWidth={0.5} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.34} fill="#F5B800" />
      <circle r={r * 0.2} fill="#E09A00" />
    </g>
  );
}

const DAISY_SPOTS: [number, number, number][] = [[60, 56, 15], [36, 72, 13], [84, 70, 13], [46, 42, 12], [74, 40, 12], [26, 94, 11], [94, 92, 11], [60, 84, 12]];

function margherita(stage: number, blooms: number) {
  const n = stage === 4 ? 4 + Math.min(4, blooms) : 0;
  return (
    <g>
      <ellipse cx={60} cy={112} rx={36} ry={20} fill="#4F8A3A" />
      {[[34, 110, -50], [44, 100, -25], [56, 96, -5], [68, 98, 15], [80, 106, 40], [88, 116, 65], [30, 120, -75], [62, 108, 0]].map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} a={a} L={16} W={5.5} fill="#5E9B45" vein="#3F6E2C" />
      ))}
      {stage >= 3 && DAISY_SPOTS.slice(0, stage === 3 ? 5 : n).map(([x, y]) => (
        <path key={`s${x}-${y}`} d={`M${x} ${y} C${x} ${y + 14} ${60 + (x - 60) * 0.5} ${y + 24} ${60 + (x - 60) * 0.4} 104`} stroke="#4F8A3A" strokeWidth={2.2} fill="none" />
      ))}
      {stage === 3 && DAISY_SPOTS.slice(0, 5).map(([x, y]) => (
        <g key={`b${x}-${y}`}>
          <circle cx={x} cy={y} r={4.2} fill="#7FB04F" />
          <circle cx={x} cy={y - 1.5} r={2.4} fill="#FFFFFF" />
        </g>
      ))}
      {stage === 4 && DAISY_SPOTS.slice(0, n).map(([x, y, r]) => <Daisy key={`d${x}-${y}`} x={x} y={y} r={r} />)}
    </g>
  );
}

function Aster({ x, y, r, color, dark }: { x: number; y: number; r: number; color: string; dark: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 16 }, (_, i) => i * 22.5).map((a) => (
        <ellipse key={`o${a}`} cx={0} cy={-r * 0.6} rx={r * 0.17} ry={r * 0.45} fill={color} transform={`rotate(${a})`} />
      ))}
      {Array.from({ length: 12 }, (_, i) => i * 30 + 15).map((a) => (
        <ellipse key={`i${a}`} cx={0} cy={-r * 0.36} rx={r * 0.15} ry={r * 0.32} fill={dark} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.2} fill="#F4C430" />
    </g>
  );
}

const ASTER_SPOTS: [number, number, number, string, string][] = [
  [60, 60, 12, '#7B4FD6', '#5B33B5'],
  [36, 74, 10.5, '#E06A9C', '#C24B7E'],
  [84, 72, 10.5, '#FFFFFF', '#E3E0F5'],
  [48, 48, 9, '#E06A9C', '#C24B7E'],
  [74, 46, 9, '#7B4FD6', '#5B33B5'],
  [30, 94, 9, '#7B4FD6', '#5B33B5'],
  [90, 92, 9, '#E06A9C', '#C24B7E'],
  [60, 86, 9.5, '#FFFFFF', '#E3E0F5'],
];

function astro(stage: number, blooms: number) {
  const n = stage === 4 ? 4 + Math.min(4, blooms) : 0;
  return (
    <g>
      <ellipse cx={60} cy={110} rx={38} ry={22} fill="#3E7A35" />
      {[[30, 108, -55], [42, 96, -30], [56, 92, -8], [70, 94, 18], [84, 104, 45], [92, 116, 70], [26, 120, -80]].map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} a={a} L={18} W={7} fill="#4E8C40" vein="#336628" />
      ))}
      {stage === 3 && ASTER_SPOTS.slice(0, 5).map(([x, y, , c]) => (
        <g key={`b${x}-${y}`}>
          <circle cx={x} cy={y + 4} r={5} fill="#5E9B4F" />
          <ellipse cx={x} cy={y + 1} rx={3} ry={4} fill={c} stroke="#5B33B5" strokeWidth={0.6} />
        </g>
      ))}
      {stage === 4 && ASTER_SPOTS.slice(0, n).map(([x, y, r, c, d]) => <Aster key={`a${x}-${y}`} x={x} y={y} r={r} color={c} dark={d} />)}
    </g>
  );
}

const TOMATO_SPOTS: [number, number][] = [[46, 70], [74, 66], [56, 90], [82, 92], [38, 98], [66, 52], [50, 52], [88, 74], [62, 106], [34, 82]];

function pomodoro(stage: number, blooms: number) {
  const n = stage === 4 ? 5 + Math.min(5, blooms) : 0;
  return (
    <g>
      {/* paletto di sostegno */}
      <rect x={58} y={32} width={4} height={98} rx={1.5} fill="#8B5E34" />
      <path d="M60 128 C56 110 64 92 58 74 C54 62 62 50 60 40" stroke="#4E8A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
      {[[58, 108, -70], [62, 100, 70], [58, 88, -60], [62, 78, 65], [58, 66, -55], [62, 56, 60], [60, 44, -15]].map(([x, y, a]) => (
        <g key={`${x}-${y}`}>
          <Leaf x={x} y={y} a={a} L={20} W={7.5} fill="#4C8B3B" vein="#2F5F24" />
          <Leaf x={x} y={y} a={a + (a < 0 ? 30 : -30)} L={13} W={5} fill="#5C9C47" />
        </g>
      ))}
      {stage === 3 && TOMATO_SPOTS.slice(0, 6).map(([x, y]) => (
        <g key={`f${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-2.3} rx={1.2} ry={2.3} fill="#F7D31C" transform={`rotate(${a})`} />)}
          <circle r={1} fill="#C99A00" />
        </g>
      ))}
      {stage === 4 && TOMATO_SPOTS.slice(0, n).map(([x, y], i) => (
        <g key={`t${x}-${y}`} transform={`translate(${x} ${y})`}>
          <circle r={6.4} fill={i % 4 === 3 ? '#F08A24' : '#D9312B'} />
          <ellipse cx={-2} cy={-2.2} rx={1.8} ry={1.1} fill="#FFFFFF" opacity={0.45} />
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-6.6} rx={0.9} ry={2.2} fill="#3F7A2F" transform={`rotate(${a} 0 -5)`} />)}
        </g>
      ))}
    </g>
  );
}

const EGGPLANT_SPOTS: [number, number, number][] = [[42, 94, 18], [78, 92, -18], [58, 104, 6], [30, 108, 26], [90, 106, -24], [66, 82, -10], [50, 80, 14]];

function melanzana(stage: number, blooms: number) {
  const n = stage === 4 ? 3 + Math.min(4, blooms) : 0;
  return (
    <g>
      <path d="M60 128 C58 112 62 96 60 70" stroke="#6B4A7A" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M60 104 C50 98 42 92 36 82 M60 96 C70 90 78 84 84 74" stroke="#6B4A7A" strokeWidth={3} fill="none" strokeLinecap="round" />
      {[[36, 82, -60], [84, 74, 60], [60, 70, 0], [46, 70, -30], [74, 62, 30], [30, 96, -80], [90, 90, 80], [60, 56, -5]].map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} a={a} L={26} W={13} fill="#7DA35B" vein="#557A3A" />
      ))}
      {stage === 3 && [[48, 78], [72, 74], [60, 92], [40, 96], [80, 92]].map(([x, y]) => (
        <g key={`f${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-3} rx={2} ry={3.2} fill="#9C6FD6" transform={`rotate(${a})`} />)}
          <circle r={1.4} fill="#F7D31C" />
        </g>
      ))}
      {stage === 4 && EGGPLANT_SPOTS.slice(0, n).map(([x, y, a]) => (
        <g key={`e${x}-${y}`} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M0 -5 C6 -5 7 4 6 12 C5 20 -5 20 -6 12 C-7 4 -6 -5 0 -5 Z" fill="#3D1F4E" />
          <ellipse cx={-2.4} cy={4} rx={1.4} ry={4} fill="#7B4B93" opacity={0.7} />
          <path d="M-5 -4 L0 -9 L5 -4 L2 -2 L0 -5 L-2 -2 Z" fill="#4E7A35" />
        </g>
      ))}
    </g>
  );
}

const DRAW: Record<Species, (stage: number, blooms: number) => ReactNode> = {
  rosa, girasole, lavanda, tulipano, ciclamino, ulivo, limone, glicine, melograno, margherita, astro, pomodoro, melanzana,
};

/** Solo le forme, da inserire in altre scene (coordinate 120 x 140). */
export function PlantShapes({ species, stage, blooms = 0, soil = true }: { species: Species; stage: number; blooms?: number; soil?: boolean }) {
  return (
    <g>
      {soil && <Soil />}
      {stage <= 0 && <Seed />}
      {stage === 1 && <Sprout />}
      {stage >= 2 && DRAW[species](Math.min(4, stage), blooms)}
    </g>
  );
}

export function Plant({
  species, stage, blooms = 0, size = 120, label, className,
}: { species: Species; stage: number; blooms?: number; size?: number; label?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <PlantShapes species={species} stage={stage} blooms={blooms} />
    </svg>
  );
}
