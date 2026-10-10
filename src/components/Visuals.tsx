interface VisualProps {
  className?: string;
}

export function CitySkyline({ className }: VisualProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="40" y="120" width="52" height="120" rx="4" fill="#0b3d36" opacity="0.9" />
      <rect x="102" y="88" width="70" height="152" rx="4" fill="#0d5c4b" />
      <rect x="184" y="140" width="44" height="100" rx="4" fill="#134e4a" />
      <rect x="238" y="70" width="88" height="170" rx="6" fill="#0f766e" />
      <rect x="338" y="110" width="60" height="130" rx="4" fill="#0d5c4b" />
      <rect x="410" y="96" width="76" height="144" rx="5" fill="#115e59" />
      <rect x="498" y="150" width="50" height="90" rx="4" fill="#134e4a" />
      <rect x="556" y="128" width="40" height="112" rx="4" fill="#0b3d36" />
      {[112, 126, 140, 154, 168].map((y) => (
        <g key={y}>
          <rect x="114" y={y} width="10" height="8" rx="1" fill="#99f6e4" opacity="0.55" />
          <rect x="132" y={y} width="10" height="8" rx="1" fill="#99f6e4" opacity="0.35" />
          <rect x="150" y={y} width="10" height="8" rx="1" fill="#99f6e4" opacity="0.5" />
        </g>
      ))}
      {[88, 106, 124, 142, 160, 178].map((y) => (
        <g key={`t-${y}`}>
          <rect x="252" y={y} width="12" height="9" rx="1" fill="#ccfbf1" opacity="0.45" />
          <rect x="274" y={y} width="12" height="9" rx="1" fill="#ccfbf1" opacity="0.3" />
          <rect x="296" y={y} width="12" height="9" rx="1" fill="#ccfbf1" opacity="0.45" />
        </g>
      ))}
      <path d="M0 230h640v50H0z" fill="#052e26" />
      <ellipse cx="86" cy="238" rx="22" ry="8" fill="#14b8a6" opacity="0.25" />
      <rect x="70" y="204" width="32" height="36" rx="6" fill="#14b8a6" />
      <rect x="75" y="198" width="22" height="8" rx="3" fill="#2dd4bf" />
      <ellipse cx="318" cy="238" rx="20" ry="7" fill="#14b8a6" opacity="0.2" />
      <rect x="304" y="208" width="28" height="32" rx="5" fill="#0d9488" />
      <rect x="309" y="203" width="18" height="7" rx="3" fill="#5eead4" />
      <circle cx="548" cy="54" r="22" fill="#fde68a" opacity="0.85" />
    </svg>
  );
}

export function RecycleMark({ className }: VisualProps) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <circle cx="40" cy="40" r="38" fill="#0d5c4b" />
      <path
        d="M28 34c3-8 13-12 21-8l-3 4 12 1-5-12-3 4c-12-6-26 0-30 12 2-1 5-2 8-1z"
        fill="#ccfbf1"
      />
      <path
        d="M54 32c8 4 11 14 6 22l-4-2-6 10 10-8-4-2c7-11 2-25-10-30 1 2 2 6 8 10z"
        fill="#5eead4"
      />
      <path
        d="M50 56c-6 8-17 9-25 3l2-4-12 3 10 8 1-5c12 7 27 1 32-11-2 2-5 4-8 6z"
        fill="#99f6e4"
      />
    </svg>
  );
}

export function EmptyIllustration({ className }: VisualProps) {
  return (
    <svg className={className} viewBox="0 0 220 140" fill="none" aria-hidden>
      <rect x="20" y="40" width="180" height="86" rx="16" fill="#ecfdf5" />
      <rect x="78" y="22" width="64" height="72" rx="10" fill="#0d5c4b" />
      <rect x="88" y="12" width="44" height="16" rx="6" fill="#14b8a6" />
      <circle cx="110" cy="56" r="10" fill="#99f6e4" />
      <path d="M40 108h140" stroke="#99d6c8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="48" cy="118" r="6" fill="#14b8a6" />
      <circle cx="172" cy="118" r="6" fill="#0f766e" />
    </svg>
  );
}

export function BinGlyph({ className }: VisualProps) {
  return (
    <svg className={className} viewBox="0 0 48 56" fill="none" aria-hidden>
      <rect x="10" y="14" width="28" height="36" rx="5" fill="#0d5c4b" />
      <rect x="14" y="8" width="20" height="8" rx="3" fill="#14b8a6" />
      <rect x="16" y="22" width="4" height="20" rx="2" fill="#99f6e4" opacity="0.7" />
      <rect x="22" y="22" width="4" height="20" rx="2" fill="#99f6e4" opacity="0.45" />
      <rect x="28" y="22" width="4" height="20" rx="2" fill="#99f6e4" opacity="0.7" />
    </svg>
  );
}
