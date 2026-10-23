/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'gold';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'gold' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Royal Crest Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl p-2 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #1c2438 0%, #0d1322 100%)',
          border: '1px solid rgba(197, 160, 89, 0.4)',
          boxShadow: '0 4px 20px rgba(197, 160, 89, 0.15)',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Octagonal Royal Shield */}
          <polygon
            points="50,4 88,20 96,58 70,92 50,96 30,92 4,58 12,20"
            stroke="#c5a059"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />
          {/* Inner Golden Crown Motif */}
          <path
            d="M26,62 L32,40 L44,52 L50,30 L56,52 L68,40 L74,62 Z"
            fill="url(#goldGradient)"
            stroke="#d4af37"
            strokeWidth="1.5"
          />
          {/* Stylized Arch of Awadh & Letter 'L' */}
          <path
            d="M38,72 C38,68 44,65 50,65 C56,65 62,68 62,72"
            stroke="#f5e6c8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="22" r="3" fill="#f5e6c8" />
          <circle cx="32" cy="33" r="2.5" fill="#c5a059" />
          <circle cx="68" cy="33" r="2.5" fill="#c5a059" />

          {/* Golden Gradient Definition */}
          <defs>
            <linearGradient id="goldGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7e1ad" />
              <stop offset="0.5" stopColor="#c5a059" />
              <stop offset="1" stopColor="#9a7732" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className="font-serif tracking-[0.2em] text-lg sm:text-xl font-black uppercase text-[#0f2b5c]"
          >
            Laxmi Hotel
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-500/15 text-[#9a7732] border border-amber-500/30 font-bold hidden sm:inline-block">
            Lucknow
          </span>
        </div>
        <span className="text-[10px] tracking-[0.16em] uppercase text-slate-500 font-semibold">
          Gomti Nagar • Premium Luxury
        </span>
      </div>
    </div>
  );
};
