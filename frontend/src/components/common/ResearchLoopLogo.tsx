import React from 'react';

interface ResearchLoopLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light' | 'white';
}

export const ResearchLoopLogo: React.FC<ResearchLoopLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'dark',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 40, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Precision Biomedical Loop SVG Icon */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl shadow-xs"
        style={{ width: dim.icon, height: dim.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="rl-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#155EEF" />
              <stop offset="60%" stopColor="#0F48BD" />
              <stop offset="100%" stopColor="#082F75" />
            </linearGradient>

            <linearGradient id="rl-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06AED4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <filter id="rl-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Rounded Slate Container */}
          <rect width="100" height="100" rx="24" fill="url(#rl-grad-primary)" />

          {/* Intertwined Biomedical Infinity / Helix Loop */}
          <path
            d="M32 36C22 36 16 43 16 50C16 57 22 64 32 64C42 64 50 50 50 50C50 50 58 36 68 36C78 36 84 43 84 50C84 57 78 64 68 64C58 64 50 50 50 50C50 50 42 36 32 36Z"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Forward Precision Accent Curve */}
          <path
            d="M50 50C58 36 68 36 76 40C82 44 84 50 82 55"
            stroke="url(#rl-grad-accent)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Precision Molecular Nodes */}
          <circle cx="32" cy="50" r="4.5" fill="#38BDF8" filter="url(#rl-glow)" />
          <circle cx="68" cy="50" r="4.5" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="5" fill="#06AED4" filter="url(#rl-glow)" />
          <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight font-sans ${dim.text} ${
              variant === 'white' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Research<span className="text-brand-500">Loop</span>
          </span>
          <span
            className={`font-semibold uppercase tracking-wider mt-0.5 ${dim.sub} ${
              variant === 'white' ? 'text-blue-200' : 'text-slate-400'
            }`}
          >
            Biomedical Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
