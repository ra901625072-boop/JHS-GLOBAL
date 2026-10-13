import React, { useState } from 'react';

/**
 * WorldTradeMap Component
 * Pure, high-impact World Trade Map without any surrounding box container.
 * Directly renders the user-provided vector map: /images/map/world-blue.svg
 * Covers half width and full height of the Hero section.
 */
export const WorldTradeMap = () => {
  const [activePort, setActivePort] = useState(null);

  // Origin Coordinates: Western India (Mundra Port & Nhava Sheva / JNPT Gateway)
  const origin = { x: 686, y: 395, name: 'India Hub (Mundra & JNPT)' };

  // Key Global Discharge Ports accurately mapped to 1010 x 666 coordinates
  const destinationPorts = [
    {
      id: 'jebel-ali',
      name: 'Jebel Ali / Dubai',
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      code: 'AEJEA',
      x: 626,
      y: 391,
      controlX: 655,
      controlY: 380,
      transit: '4–7 Days',
      type: 'Direct FCL / Weekly',
      volume: 'Spices, Basmati Rice, Oilseeds',
    },
    {
      id: 'jeddah',
      name: 'Jeddah Islamic Port',
      country: 'Saudi Arabia',
      flag: '🇸🇦',
      code: 'SAJED',
      x: 580,
      y: 394,
      controlX: 630,
      controlY: 420,
      transit: '6–8 Days',
      type: 'Direct Feeder Sailings',
      volume: 'Pulses, Sesame, Agro Cargo',
    },
    {
      id: 'rotterdam',
      name: 'Port of Rotterdam',
      country: 'Netherlands / EU Hub',
      flag: '🇳🇱',
      code: 'NLRTM',
      x: 489,
      y: 290,
      controlX: 575,
      controlY: 310,
      transit: '16–20 Days',
      type: 'EU MRL Lab Certified FCL',
      volume: 'Turmeric, Psyllium, Botanical Extracts',
    },
    {
      id: 'hamburg',
      name: 'Port of Hamburg',
      country: 'Germany',
      flag: '🇩🇪',
      code: 'DEHAM',
      x: 504,
      y: 285,
      controlX: 590,
      controlY: 305,
      transit: '18–22 Days',
      type: 'Direct Vessel Service',
      volume: 'Seed Spices, Dehydrated Onion Flakes',
    },
    {
      id: 'felixstowe',
      name: 'Port of Felixstowe / London',
      country: 'United Kingdom',
      flag: '🇬🇧',
      code: 'GBFXT',
      x: 466,
      y: 280,
      controlX: 560,
      controlY: 300,
      transit: '18–22 Days',
      type: 'Direct Container Service',
      volume: 'Ethnic Foods, Spices, Rice',
    },
    {
      id: 'new-york',
      name: 'Port of New York & New Jersey',
      country: 'United States (East Coast)',
      flag: '🇺🇸',
      code: 'USNYC',
      x: 268,
      y: 305,
      controlX: 450,
      controlY: 230,
      transit: '22–26 Days',
      type: 'FDA Inspected Liner',
      volume: 'Curcumin 95%, Psyllium, Essential Oils',
    },
    {
      id: 'los-angeles',
      name: 'Port of Los Angeles / Long Beach',
      country: 'United States (West Coast)',
      flag: '🇺🇸',
      code: 'USLAX',
      x: 172,
      y: 325,
      controlX: 400,
      controlY: 200,
      transit: '28–32 Days',
      type: 'Pacific Ocean Service',
      volume: 'Superfoods, Moringa, Spices',
    },
    {
      id: 'singapore',
      name: 'Port of Singapore',
      country: 'Singapore / ASEAN Hub',
      flag: '🇸🇬',
      code: 'SGSIN',
      x: 766,
      y: 459,
      controlX: 725,
      controlY: 435,
      transit: '6–9 Days',
      type: 'Direct Weekly Sailings',
      volume: 'Black Pepper, Cardamom, Agro Bulks',
    },
    {
      id: 'tokyo',
      name: 'Port of Tokyo & Yokohama',
      country: 'Japan',
      flag: '🇯🇵',
      code: 'JPTYO',
      x: 853,
      y: 356,
      controlX: 780,
      controlY: 340,
      transit: '14–18 Days',
      type: 'Fast Container Transit',
      volume: 'Sesame Seeds, Spices, Organic Extracts',
    },
    {
      id: 'sydney',
      name: 'Port of Sydney & Melbourne',
      country: 'Australia',
      flag: '🇦🇺',
      code: 'AUSYD',
      x: 880,
      y: 580,
      controlX: 805,
      controlY: 520,
      transit: '16–21 Days',
      type: 'Direct Liner Service',
      volume: 'Basmati Rice, Chickpeas, Spices',
    },
    {
      id: 'mombasa',
      name: 'Port of Mombasa',
      country: 'Kenya / East Africa',
      flag: '🇰🇪',
      code: 'KEMBA',
      x: 588,
      y: 465,
      controlX: 635,
      controlY: 440,
      transit: '9–12 Days',
      type: 'Indian Ocean Feeder',
      volume: 'Grains, Rice, Spices, Pulses',
    },
    {
      id: 'santos',
      name: 'Port of Santos',
      country: 'Brazil / South America',
      flag: '🇧🇷',
      code: 'BRSSZ',
      x: 345,
      y: 520,
      controlX: 510,
      controlY: 520,
      transit: '26–30 Days',
      type: 'South Atlantic Liner',
      volume: 'Spices, Botanical Extracts',
    },
  ];

  return (
    <>
      {/* Mobile: Swipeable Destination Ports Carousel (<1024px) */}
      <div className="lg:hidden w-full select-none py-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-accent-300 uppercase tracking-wider">
              Global Shipping Corridors
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono bg-primary-950/80 px-2 py-0.5 rounded border border-primary-800">
            Mundra & JNPT Hub
          </span>
        </div>

        {/* Swipeable Horizontal Cards Track */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-1">
          {destinationPorts.map((port) => (
            <div
              key={port.id}
              className="w-[260px] shrink-0 snap-center p-3.5 rounded-xl bg-primary-950/90 border border-primary-700/60 shadow-lg text-left space-y-2.5 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{port.flag}</span>
                    <h4 className="text-xs font-bold text-white leading-tight">{port.name}</h4>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">{port.code} • {port.country}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full shrink-0">
                  {port.transit}
                </span>
              </div>

              <div className="pt-2 border-t border-primary-800/80 space-y-1 text-[11px]">
                <div className="text-accent-300 font-semibold text-[10px] flex items-center gap-1">
                  <span>🚢</span>
                  <span>{port.type}</span>
                </div>
                <p className="text-[10px] text-neutral-300 truncate">
                  📦 {port.volume}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-neutral-400 flex items-center justify-center gap-1">
          <span>← Swipe 12 global discharge destinations →</span>
        </p>
      </div>

      {/* Desktop: Vector Map and Interactive SVG Overlay (>=1024px) */}
      <div className="hidden lg:flex relative w-full h-full items-center justify-center select-none overflow-visible">
        {/* Aspect Ratio Container for the Map and Interactive SVG Overlay */}
        <div className="relative w-full max-w-full aspect-[1010/666] flex items-center justify-center">
        
        {/* Subtle Ambient Ocean Radar Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Base Vector World Map Image provided by the user in map folder */}
        <img
          src="/images/map/world-blue.svg"
          alt="World Trade Route Map - Jhs Global"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-90 drop-shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
        />

        {/* Interactive SVG Overlay (Strictly aligned to viewBox 0 0 1010 666) */}
        <svg
          viewBox="0 0 1010 666"
          className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible"
          aria-label="Interactive Global Shipping Corridors"
        >
          <defs>
            {/* Radar Beacon Radial Glow for India */}
            <radialGradient id="indiaPulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D2B684" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#C5A059" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0D2818" stopOpacity="0" />
            </radialGradient>

            {/* Shipping Line Gradient */}
            <linearGradient id="maritimeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2B684" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
            </linearGradient>

            {/* Active Route Highlight Gradient */}
            <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Maritime Flow Animation Keyframes & Radiating Radar Wave Styling */}
          <style>
            {`
              @keyframes maritimeFlowAnim {
                from { stroke-dashoffset: 96; }
                to { stroke-dashoffset: 0; }
              }
              .maritime-flow {
                animation: maritimeFlowAnim 2.0s linear infinite;
              }
              .maritime-flow-active {
                animation: maritimeFlowAnim 1.0s linear infinite;
              }
              @keyframes radarExpand {
                0% {
                  r: 12px;
                  opacity: 0.85;
                  stroke-width: 1.6px;
                }
                60% {
                  opacity: 0.4;
                }
                100% {
                  r: 48px;
                  opacity: 0;
                  stroke-width: 0.4px;
                }
              }
              .radar-ring-1 {
                animation: radarExpand 3.2s cubic-bezier(0.2, 0.8, 0.35, 1) infinite;
              }
              .radar-ring-2 {
                animation: radarExpand 3.2s cubic-bezier(0.2, 0.8, 0.35, 1) infinite;
                animation-delay: 1.6s;
              }
              @keyframes portBeacon {
                0%, 100% {
                  transform: scale(1);
                  opacity: 0.4;
                }
                50% {
                  transform: scale(1.4);
                  opacity: 0.85;
                }
              }
              .port-beacon {
                animation: portBeacon 2.6s ease-in-out infinite;
              }
            `}
          </style>

          {/* RADIATING SHIPPING CORRIDORS (Curved Quadratic Beziers) */}
          <g className="routes-layer">
            {destinationPorts.map((port) => {
              const isSelected = activePort?.id === port.id;
              const pathData = `M ${origin.x} ${origin.y} Q ${port.controlX} ${port.controlY} ${port.x} ${port.y}`;

              return (
                <g key={`route-${port.id}`}>
                  {/* Background Soft Glow Path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isSelected ? '#F59E0B' : '#C5A059'}
                    strokeWidth={isSelected ? 4 : 2}
                    strokeOpacity={isSelected ? 0.8 : 0.25}
                    filter="url(#corridorGlow)"
                  />

                  {/* Animated Dashed Maritime Corridor */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isSelected ? 'url(#activeRouteGrad)' : 'url(#maritimeRouteGrad)'}
                    strokeWidth={isSelected ? 2.8 : 1.8}
                    strokeDasharray={isSelected ? '8 6' : '6 6'}
                    strokeLinecap="round"
                    className={isSelected ? 'maritime-flow-active' : 'maritime-flow'}
                  />
                </g>
              );
            })}
          </g>

          {/* DESTINATION PORT NODES & RADAR TARGETS */}
          <g className="ports-layer">
            {destinationPorts.map((port, idx) => {
              const isSelected = activePort?.id === port.id;

              return (
                <g
                  key={`node-${port.id}`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setActivePort(port)}
                  onMouseLeave={() => setActivePort(null)}
                  onClick={() => setActivePort(port)}
                >
                  {/* Translucent Radar Ping Ring */}
                  <circle
                    cx={port.x}
                    cy={port.y}
                    r={isSelected ? 14 : 7}
                    fill="none"
                    stroke={isSelected ? '#F59E0B' : '#10B981'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    strokeOpacity={isSelected ? 0.9 : 0.4}
                    className={isSelected ? 'animate-ping' : 'port-beacon'}
                    style={{
                      animationDelay: `${(idx % 4) * 0.65}s`,
                      transformOrigin: `${port.x}px ${port.y}px`,
                    }}
                  />

                  {/* Outer Ambient Circle */}
                  <circle
                    cx={port.x}
                    cy={port.y}
                    r={isSelected ? 8 : 4.5}
                    fill={isSelected ? '#F59E0B' : '#0B2D1D'}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 1.8 : 1.2}
                  />

                  {/* Center Core Dot */}
                  <circle
                    cx={port.x}
                    cy={port.y}
                    r={isSelected ? 3.5 : 2}
                    fill={isSelected ? '#FFFFFF' : '#34D399'}
                  />

                  {/* Expanded Hit Target for Easy Touch / Hover */}
                  <circle
                    cx={port.x}
                    cy={port.y}
                    r={20}
                    fill="transparent"
                  />
                </g>
              );
            })}
          </g>

          {/* CENTRAL ORIGIN BEACON: INDIA (Mundra & JNPT Gateways) */}
          <g className="origin-hub-layer select-none">
            {/* Concentric Radiating Radar Waves */}
            <circle
              cx={origin.x}
              cy={origin.y}
              className="radar-ring-1"
              fill="none"
              stroke="#D2B684"
            />
            <circle
              cx={origin.x}
              cy={origin.y}
              className="radar-ring-2"
              fill="none"
              stroke="#D2B684"
            />
            <circle
              cx={origin.x}
              cy={origin.y}
              r={24}
              fill="none"
              stroke="#C5A059"
              strokeWidth={1.2}
              strokeOpacity={0.45}
            />
            <circle
              cx={origin.x}
              cy={origin.y}
              r={14}
              fill="url(#indiaPulseGlow)"
            />

            {/* Sunburst Radial Ticks (Exact reference design) */}
            {[-60, -35, -10, 15, 40, 65].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const r1 = 16;
              const r2 = 21;
              const x1 = origin.x + r1 * Math.sin(rad);
              const y1 = origin.y - r1 * Math.cos(rad);
              const x2 = origin.x + r2 * Math.sin(rad);
              const y2 = origin.y - r2 * Math.cos(rad);
              return (
                <line
                  key={`ray-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#D2B684"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeOpacity={0.8}
                />
              );
            })}

            {/* Solid Origin Core Circle */}
            <circle
              cx={origin.x}
              cy={origin.y}
              r={7.5}
              fill="#0A2619"
              stroke="#D2B684"
              strokeWidth={2}
            />
            <circle
              cx={origin.x}
              cy={origin.y}
              r={3}
              fill="#F59E0B"
            />

            {/* High-Contrast Origin Brand Label */}
            <g transform={`translate(${origin.x}, ${origin.y + 19})`}>
              <rect
                x="-32"
                y="-8"
                width="64"
                height="16"
                rx="8"
                fill="#06180E"
                stroke="#D2B684"
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#D2B684"
                fontSize="8.5"
                fontWeight="bold"
                letterSpacing="0.08em"
                fontFamily="sans-serif"
              >
                INDIA
              </text>
            </g>
          </g>

          {/* REAL-TIME INTERACTIVE SVG HOVER TOOLTIP */}
          {activePort && (
            <g
              transform={`translate(${
                Math.min(Math.max(activePort.x, 140), 870)
              }, ${
                activePort.y < 180 ? activePort.y + 24 : activePort.y - 88
              })`}
              className="transition-all duration-200 pointer-events-none"
            >
              {/* Tooltip Card Background */}
              <rect
                x="-110"
                y="0"
                width="220"
                height="78"
                rx="10"
                fill="#05160E"
                stroke="#D2B684"
                strokeWidth="1.5"
                filter="url(#corridorGlow)"
              />

              {/* Country Flag & Port Name */}
              <text x="-98" y="22" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                {activePort.flag} {activePort.name}
              </text>

              {/* Port Code & Country */}
              <text x="-98" y="38" fill="#D2B684" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
                {activePort.code} • {activePort.country}
              </text>

              {/* Divider Line */}
              <line x1="-98" y1="45" x2="98" y2="45" stroke="#133D29" strokeWidth="1" />

              {/* Ocean Transit Speed */}
              <text x="-98" y="59" fill="#34D399" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                ⏱ Ocean Transit: {activePort.transit}
              </text>

              {/* Primary Commodity Spec */}
              <text x="-98" y="70" fill="#E2E8F0" fontSize="8" fontFamily="sans-serif">
                📦 {activePort.volume}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
    </>
  );
};

export default WorldTradeMap;
