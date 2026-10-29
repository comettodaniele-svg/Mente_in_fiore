// Piccole immagini per gli esercizi: forme nette, riconoscibili anche senza distinguere i colori.

export type TokenKind =
  | 'margherita'
  | 'tulipano'
  | 'girasole'
  | 'foglia'
  | 'goccia'
  | 'sole'
  | 'ape'
  | 'farfalla'
  | 'erbaccia'
  | 'fungo';

export const TOKEN_NAME: Record<TokenKind, string> = {
  margherita: 'margherita',
  tulipano: 'tulipano',
  girasole: 'girasole',
  foglia: 'foglia',
  goccia: 'goccia',
  sole: 'sole',
  ape: 'ape',
  farfalla: 'farfalla',
  erbaccia: 'erbaccia',
  fungo: 'fungo',
};

function Shape({ kind }: { kind: TokenKind }) {
  switch (kind) {
    case 'margherita':
      return (
        <g transform="translate(24 24)">
          {Array.from({ length: 10 }, (_, i) => i * 36).map((a) => (
            <ellipse key={a} cx={0} cy={-11} rx={4.2} ry={9} fill="#FFFFFF" stroke="#9CA3AF" strokeWidth={1.2} transform={`rotate(${a})`} />
          ))}
          <circle r={6.5} fill="#F5B000" stroke="#B87F00" strokeWidth={1.2} />
        </g>
      );
    case 'girasole':
      return (
        <g transform="translate(24 24)">
          {Array.from({ length: 14 }, (_, i) => (i * 360) / 14).map((a, i) => (
            <ellipse key={a} cx={0} cy={-13} rx={3.6} ry={8} fill={i % 2 ? '#FFC93C' : '#F5B000'} transform={`rotate(${a})`} />
          ))}
          <circle r={9} fill="#5E3416" />
          <circle r={5.5} fill="#7A4A22" />
        </g>
      );
    case 'tulipano':
      return (
        <g>
          <path d="M24 46 V28" stroke="#4F8A43" strokeWidth={3} strokeLinecap="round" />
          <path d="M24 40 C18 38 14 34 13 29 C19 30 22 34 24 40 Z" fill="#5E9B4F" />
          <path d="M12 24 C11 14 15 8 19 6 C21 12 21 18 20 28 Z" fill="#C23B27" />
          <path d="M36 24 C37 14 33 8 29 6 C27 12 27 18 28 28 Z" fill="#C23B27" />
          <path d="M14 28 C12 16 18 8 24 4 C30 8 36 16 34 28 Q24 34 14 28 Z" fill="#E8553E" />
        </g>
      );
    case 'foglia':
      return (
        <g transform="translate(24 44) rotate(25)">
          <path d="M0 0 C16 -8 16 -30 0 -40 C-16 -30 -16 -8 0 0 Z" fill="#46A302" />
          <path d="M0 2 L0 -36" stroke="#2A6900" strokeWidth={2} strokeLinecap="round" />
          <path d="M0 -12 L8 -18 M0 -22 L-8 -28 M0 -26 L7 -31" stroke="#2A6900" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
    case 'goccia':
      return (
        <g>
          <path d="M24 4 C32 16 38 24 38 31 C38 39 32 44 24 44 C16 44 10 39 10 31 C10 24 16 16 24 4 Z" fill="#2B70C9" />
          <ellipse cx={18.5} cy={30} rx={3} ry={5} fill="#9CC3F2" />
        </g>
      );
    case 'sole':
      return (
        <g transform="translate(24 24)">
          {Array.from({ length: 8 }, (_, i) => i * 45).map((a) => (
            <rect key={a} x={-2} y={-21} width={4} height={8} rx={2} fill="#F5B000" transform={`rotate(${a})`} />
          ))}
          <circle r={10.5} fill="#FFC800" stroke="#D99B00" strokeWidth={1.5} />
        </g>
      );
    case 'ape':
      return (
        <g transform="translate(24 26)">
          <ellipse cx={-5} cy={-10} rx={7} ry={5} fill="#DCEFFF" stroke="#7FA7CF" strokeWidth={1.2} transform="rotate(-25 -5 -10)" />
          <ellipse cx={5} cy={-10} rx={7} ry={5} fill="#DCEFFF" stroke="#7FA7CF" strokeWidth={1.2} transform="rotate(25 5 -10)" />
          <ellipse rx={13} ry={9} fill="#FFC800" stroke="#1F2937" strokeWidth={1.6} />
          <rect x={-5} y={-8.6} width={3.5} height={17.2} fill="#1F2937" />
          <rect x={2.5} y={-8.6} width={3.5} height={17.2} fill="#1F2937" />
          <circle cx={11} cy={-2} r={1.4} fill="#1F2937" />
        </g>
      );
    case 'farfalla':
      return (
        <g transform="translate(24 24)">
          <path d="M0 0 C-6 -16 -20 -18 -20 -8 C-20 0 -10 2 0 0 Z" fill="#9B5DE5" />
          <path d="M0 0 C6 -16 20 -18 20 -8 C20 0 10 2 0 0 Z" fill="#9B5DE5" />
          <path d="M0 2 C-6 14 -16 16 -16 8 C-16 3 -8 2 0 2 Z" fill="#F15BB5" />
          <path d="M0 2 C6 14 16 16 16 8 C16 3 8 2 0 2 Z" fill="#F15BB5" />
          <rect x={-1.6} y={-8} width={3.2} height={16} rx={1.6} fill="#1F2937" />
          <path d="M-1 -8 C-3 -13 -5 -15 -7 -16 M1 -8 C3 -13 5 -15 7 -16" stroke="#1F2937" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'erbaccia':
      return (
        <g transform="translate(24 44)">
          {[-55, -30, -8, 14, 36, 58].map((a, i) => (
            <path
              key={a}
              d="M0 0 L-3 -10 L-7 -12 L-3 -18 L-6 -24 L-1 -28 L0 -38 L1 -28 L6 -24 L3 -18 L7 -12 L3 -10 Z"
              fill={i % 2 ? '#5B6B2E' : '#6E7F38'}
              transform={`rotate(${a}) scale(${i % 2 ? 0.85 : 1})`}
            />
          ))}
          <path d="M-14 0 H14" stroke="#6B4423" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'fungo':
      return (
        <g>
          <path d="M18 26 H30 L31 42 Q24 45 17 42 Z" fill="#F5EBDD" stroke="#B9A88F" strokeWidth={1.2} />
          <path d="M6 27 C6 14 14 6 24 6 C34 6 42 14 42 27 Z" fill="#D64545" />
          <circle cx={17} cy={16} r={3} fill="#FFFFFF" />
          <circle cx={29} cy={13} r={2.6} fill="#FFFFFF" />
          <circle cx={34} cy={21} r={2.2} fill="#FFFFFF" />
          <circle cx={23} cy={22} r={2.2} fill="#FFFFFF" />
        </g>
      );
  }
}

export function Token({ kind, size = 48, label }: { kind: TokenKind; size?: number; label?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label ? TOKEN_NAME[kind] : undefined}
      aria-hidden={label ? undefined : true}
    >
      <Shape kind={kind} />
    </svg>
  );
}
