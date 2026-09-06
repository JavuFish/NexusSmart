import React from 'react';

interface AppLogoIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const AppLogoIcon: React.FC<AppLogoIconProps> = ({
  className = '',
  size = 32,
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Squircle Gradient */}
          <linearGradient id="squircleBg" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="50%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Glowing Neon Stroke Gradient */}
          <linearGradient id="neonBorder" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Accent Glow Circle */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id="iconGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Halo if enabled */}
        {glow && (
          <rect
            x="8"
            y="8"
            width="104"
            height="104"
            rx="30"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="6"
            strokeOpacity="0.35"
            filter="url(#iconGlowFilter)"
          />
        )}

        {/* Main Squircle Glass Base */}
        <rect
          x="10"
          y="10"
          width="100"
          height="100"
          rx="28"
          fill="url(#squircleBg)"
          stroke="url(#neonBorder)"
          strokeWidth="2.5"
        />

        {/* Inner Futuristic Calculator Grid Outline */}
        <rect
          x="22"
          y="22"
          width="76"
          height="76"
          rx="18"
          fill="#0f172a"
          fillOpacity="0.55"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Inner Grid Dividers */}
        <line x1="47" y1="22" x2="47" y2="98" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.35" />
        <line x1="73" y1="22" x2="73" y2="98" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.35" />
        <line x1="22" y1="47" x2="98" y2="47" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.35" />
        <line x1="22" y1="73" x2="98" y2="73" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.35" />

        {/* Glowing Matrix Keypad Elements */}
        {/* Top Left: '1' */}
        <text x="34.5" y="39" fill="#e0f2fe" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1</text>
        {/* Top Mid: '2' */}
        <text x="60" y="39" fill="#e0f2fe" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2</text>
        {/* Top Right: '÷' */}
        <text x="85.5" y="40" fill="#38bdf8" fontSize="17" fontWeight="bold" fontFamily="monospace" textAnchor="middle">÷</text>

        {/* Mid Left: '4' */}
        <text x="34.5" y="65" fill="#e0f2fe" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">4</text>
        {/* Bot Left: '7' */}
        <text x="34.5" y="90.5" fill="#e0f2fe" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">7</text>

        {/* Bot Mid: '0' */}
        <text x="60" y="90.5" fill="#e0f2fe" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">0</text>
        {/* Bot Right: '=' */}
        <text x="85.5" y="91" fill="#38bdf8" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">=</text>

        {/* Center Orb (Quantum Smart Engine Core) */}
        <circle
          cx="60"
          cy="60"
          r="13"
          fill="url(#centerGlow)"
          stroke="#e0f2fe"
          strokeWidth="1.5"
          filter={glow ? 'url(#iconGlowFilter)' : undefined}
        />
        <circle
          cx="56"
          cy="56"
          r="3"
          fill="#ffffff"
          fillOpacity="0.9"
        />
      </svg>
    </div>
  );
};
