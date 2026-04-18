export function Logo() {
  return (
    <div className="sidebar-brand">
      <svg
        width="34"
        height="34"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CFT Audit"
      >
        <defs>
          <linearGradient
            id="brand-gradient"
            x1="4"
            y1="4"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFB066" />
            <stop offset="55%" stopColor="#DE6A1B" />
            <stop offset="100%" stopColor="#9C3E0A" />
          </linearGradient>
          <linearGradient
            id="brand-core"
            x1="12"
            y1="12"
            x2="20"
            y2="20"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFE9D2" />
            <stop offset="100%" stopColor="#FFB066" />
          </linearGradient>
        </defs>
        {/* 4-point sparkle: острые пики, плавные «долины» — выглядит как блеск */}
        <path
          d="M16 1.5
             C 16 11, 17 14.5, 30.5 16
             C 17 17.5, 16 21, 16 30.5
             C 16 21, 15 17.5, 1.5 16
             C 15 14.5, 16 11, 16 1.5 Z"
          fill="url(#brand-gradient)"
        />
        {/* Малый ромб в центре — добавляет глубину */}
        <path d="M16 11 L21 16 L16 21 L11 16 Z" fill="url(#brand-core)" opacity="0.9" />
      </svg>
    </div>
  );
}
