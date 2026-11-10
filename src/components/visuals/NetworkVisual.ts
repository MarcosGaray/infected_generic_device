export function renderNetworkVisualSvg(className = 'hero-visual-svg'): string {
  const uid = `netviz-${Math.random().toString(36).slice(2, 9)}`;

  return `
    <svg
      class="${className}"
      viewBox="0 0 420 420"
      role="img"
      aria-label="Ilustración genérica de una red GPON con un dispositivo comprometido en el hogar"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="${uid}-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f2747" />
          <stop offset="100%" stop-color="#081326" />
        </linearGradient>
        <linearGradient id="${uid}-fiber" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
      </defs>

      <rect
        x="10"
        y="10"
        width="400"
        height="400"
        rx="32"
        fill="url(#${uid}-bg)"
        stroke="rgba(56,189,248,0.35)"
        stroke-width="2"
      />
      <circle cx="210" cy="210" r="150" fill="none" stroke="rgba(56,189,248,0.12)" stroke-width="2" />
      <circle cx="210" cy="210" r="105" fill="none" stroke="rgba(56,189,248,0.10)" stroke-width="2" />

      <path
        d="M110 210 L170 160 L230 210 L230 290 L110 290 Z"
        fill="#0b1f3a"
        stroke="#38bdf8"
        stroke-width="3"
      />
      <path
        d="M95 214 L170 150 L245 214"
        fill="none"
        stroke="#38bdf8"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect x="145" y="225" width="50" height="30" rx="4" fill="#050b16" stroke="#fbbf24" stroke-width="2" />
      <circle cx="170" cy="240" r="5" fill="#fb7185" />
      <circle cx="170" cy="240" r="18" fill="none" stroke="#fb7185" stroke-width="2" opacity="0.8" />
      <circle cx="170" cy="240" r="30" fill="none" stroke="#fb7185" stroke-width="1.5" opacity="0.45" />

      <path
        d="M230 265 C280 265 290 230 330 230"
        fill="none"
        stroke="url(#${uid}-fiber)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <rect x="326" y="185" width="28" height="46" rx="4" fill="#0b1f3a" stroke="#38bdf8" stroke-width="2" />
      <path d="M340 231 L340 300" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
      <circle cx="340" cy="208" r="4" fill="#10b981" />

      <path d="M340 250 C370 250 375 275 390 275" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.6" />
      <path d="M340 265 C365 265 370 300 388 300" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.4" />
      <circle cx="390" cy="275" r="6" fill="#38bdf8" />
      <circle cx="388" cy="300" r="5" fill="#38bdf8" opacity="0.7" />

      <rect
        x="120"
        y="320"
        width="100"
        height="24"
        rx="12"
        fill="rgba(56,189,248,0.12)"
        stroke="rgba(56,189,248,0.5)"
      />
      <text
        x="170"
        y="337"
        text-anchor="middle"
        fill="#bae6fd"
        font-family="Raleway, sans-serif"
        font-size="12"
        font-weight="800"
      >
        ONU + HOGAR
      </text>
      <rect
        x="300"
        y="320"
        width="80"
        height="24"
        rx="12"
        fill="rgba(251,191,36,0.12)"
        stroke="rgba(251,191,36,0.5)"
      />
      <text
        x="340"
        y="337"
        text-anchor="middle"
        fill="#fde68a"
        font-family="Raleway, sans-serif"
        font-size="12"
        font-weight="800"
      >
        RED GPON
      </text>
    </svg>
  `;
}
