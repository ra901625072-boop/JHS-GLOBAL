import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      volume: 'Castor Derivatives, Personal Care, Animal Feed',
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
      volume: 'Soybean Meal DOC, Animal Feed, Herbal Extracts',
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
      volume: 'Curcumin 95%, Psyllium Husk, Botanical Extracts',
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
      volume: 'Castor Oil FSG, 12-HSA, Industrial Raw Materials',
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
      volume: 'Nutraceutical Ingredients, Ashwagandha, Personal Care',
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
      volume: 'Curcumin 95%, Psyllium 99%, Botanical Extracts',
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
      volume: 'Standardized Botanical Extracts, Nutritional Ingredients',
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
      volume: 'Personal Care Raw Materials, Castor Derivatives, Feed Meals',
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
      volume: 'High-Assay Botanical Extracts, Nutraceutical Raw Materials',
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
      volume: 'Nutraceutical Raw Materials, Animal Nutrition, Feed Premix',
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
      volume: 'Soybean Meal DOC, Animal Feed Meals, Feed Concentrates',
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
      volume: 'Personal Care Raw Materials, Botanical Extracts',
    },
  ];

  const [isPaused, setIsPaused] = useState(false);

  const trackRef = useRef(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Pause auto-scroll immediately on user interaction
  const startInteraction = useCallback(() => {
    isInteractingRef.current = true;
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  // Schedule auto-scroll resume after idle window (~1.8s) so user can comfortably read
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      setIsPaused(false);
      lastTimestampRef.current = null;
    }, 1800);
  }, []);

  // Bidirectional seamless infinite loop boundary wrap
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    if (setWidth <= 0) return;

    // Wrap seamlessly forward or backward
    if (el.scrollLeft >= setWidth * 2) {
      el.scrollLeft -= setWidth;
    } else if (el.scrollLeft <= 10) {
      el.scrollLeft += setWidth;
    }

    // If user is actively scrolling with touch momentum, refresh the resume timer
    if (isInteractingRef.current) {
      scheduleResume();
    }
  }, [scheduleResume]);

  const handleTouchStart = useCallback(() => {
    startInteraction();
  }, [startInteraction]);

  const handleTouchEnd = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  const handleMouseDown = useCallback((e) => {
    if (!trackRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    startScrollLeftRef.current = trackRef.current.scrollLeft;
    startInteraction();
  }, [startInteraction]);

  const handleMouseMove = useCallback((e) => {
    if (!isMouseDownRef.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    trackRef.current.scrollLeft = startScrollLeftRef.current - walk;
  }, []);

  const handleMouseUpOrLeave = useCallback(() => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      scheduleResume();
    }
  }, [scheduleResume]);

  // Step scroll left or right with navigation buttons
  const nudge = useCallback((direction) => {
    const el = trackRef.current;
    if (!el) return;
    startInteraction();
    const step = 272; // One card width (260px) + gap (12px)
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
    scheduleResume();
  }, [startInteraction, scheduleResume]);

  // Ultra-calm auto-scroll animation loop (slow speed ~22px/second)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Respect user motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Center scroll position on middle set on initial render
    const initTimer = setTimeout(() => {
      if (el && el.scrollWidth > 0 && el.scrollLeft === 0) {
        el.scrollLeft = el.scrollWidth / 3;
      }
    }, 150);

    const SPEED_PX_PER_SEC = 22; // Slow, calm reading velocity

    const animate = (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      // Only run auto-scroll if visible and user is not interacting
      if (!isInteractingRef.current && el && el.offsetWidth > 0) {
        const setWidth = el.scrollWidth / 3;
        if (setWidth > 0) {
          el.scrollLeft += delta * SPEED_PX_PER_SEC;

          if (el.scrollLeft >= setWidth * 2) {
            el.scrollLeft -= setWidth;
          } else if (el.scrollLeft <= 10) {
            el.scrollLeft += setWidth;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(initTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Mobile: Interactive Bidirectional Auto-Scrolling Shipping Corridors (<1024px) */}
      <div className="lg:hidden w-full select-none py-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-accent-300 uppercase tracking-wider">
              Global Shipping Corridors
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Auto-Scroll / Paused Status Indicator */}
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 transition-colors">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'
                }`}
              />
              {isPaused ? 'Paused' : 'Auto-Scroll'}
            </span>

            {/* Manual Nudge Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => nudge(-1)}
                aria-label="Scroll corridor backward"
                className="w-6 h-6 flex items-center justify-center rounded bg-primary-900/90 border border-primary-700/70 text-neutral-300 hover:text-white hover:border-accent-400 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                aria-label="Scroll corridor forward"
                className="w-6 h-6 flex items-center justify-center rounded bg-primary-900/90 border border-primary-700/70 text-neutral-300 hover:text-white hover:border-accent-400 active:scale-95 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Continuous Smooth Horizontal Track: Native Touch Swipe + Fluid Mouse Drag */}
        <div
          ref={trackRef}
          data-lenis-prevent="true"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="relative w-full overflow-x-auto no-scrollbar py-1 cursor-grab active:cursor-grabbing select-none"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y pinch-zoom',
          }}
        >
          <div className="flex gap-3 w-max">
            {/* Seamless 3-Loop Set of all 12 Global Discharge Ports for Infinite Bidirectional Traversal */}
            {[...destinationPorts, ...destinationPorts, ...destinationPorts].map((port, idx) => {
              const isSelected = activePort?.id === port.id;
              return (
                <div
                  key={`${port.id}-${idx}`}
                  onClick={(e) => {
                    if (hasDraggedRef.current) {
                      e.preventDefault();
                      return;
                    }
                    setActivePort(isSelected ? null : port);
                  }}
                  className={`w-[260px] shrink-0 p-3.5 rounded-xl bg-primary-950/95 border text-left space-y-2.5 backdrop-blur-xs transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#c59b27] shadow-[0_0_15px_rgba(197,155,39,0.25)] ring-1 ring-[#c59b27]'
                      : 'border-primary-700/60 hover:border-[#c59b27]/60 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg leading-none shrink-0">{port.flag}</span>
                        <h4 className="text-xs font-bold text-white leading-tight truncate">{port.name}</h4>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono truncate">{port.code} • {port.country}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full shrink-0">
                      {port.transit}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-primary-800/80 space-y-1 text-[11px]">
                    <div className="text-accent-300 font-semibold text-[10px] flex items-center gap-1 truncate">
                      <span>🚢</span>
                      <span>{port.type}</span>
                    </div>
                    <p className="text-[10px] text-neutral-300 truncate">
                      📦 {port.volume}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[10px] text-neutral-400/90 flex items-center justify-center gap-1.5 font-sans">
          <span>← Swipe freely left or right • Auto-scroll resumes after release →</span>
        </p>
      </div>

      {/* Desktop: Vector Map and Interactive SVG Overlay (>=1024px) */}
      <div className="hidden lg:flex relative w-full h-full items-center justify-center select-none overflow-visible">
        {/* Aspect Ratio Container for the Map and Interactive SVG Overlay */}
        <div className="relative w-full max-w-full aspect-[1010/666] flex items-center justify-center">
        
        {/* Subtle Ambient Ocean Radar Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Base Vector World Map Image - Loaded strictly on desktop via media query to prevent mobile transfer */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/images/map/world-blue.svg" type="image/svg+xml" />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1010 666'%3E%3C/svg%3E"
            alt="World Trade Route Map - Jhs Global"
            width="1010"
            height="666"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-90 drop-shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
          />
        </picture>

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
