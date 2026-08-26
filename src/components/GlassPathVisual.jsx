import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GlassPathVisual() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current) return;

    // Subtle scroll-driven parallax scrub
    const ctx = gsap.context(() => {
      gsap.to(pathRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: -40,
        opacity: 0.4,
        ease: 'none',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#050713]">
      
      {/* 1. Atmospheric Deep Cobalt -> Violet Horizon Canvas */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle 550px at 82% 22%, rgba(255, 154, 118, 0.14) 0%, rgba(138, 56, 245, 0.10) 40%, transparent 70%),
            radial-gradient(ellipse 65% 50% at 72% 42%, rgba(124, 58, 237, 0.16) 0%, transparent 65%),
            radial-gradient(ellipse 70% 65% at 30% 65%, rgba(28, 70, 215, 0.22) 0%, transparent 75%),
            linear-gradient(135deg, #050713 0%, #070d26 45%, #0e0824 80%, #150920 100%)
          `
        }}
      />

      {/* 2. Ultra-Subtle 2.5% Film Grain Overlay */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* 3. Architectural Thin Vector Line & Distant Light */}
      <svg 
        ref={pathRef}
        className="absolute inset-0 w-full h-full z-[2]"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Architectural linear gradient (Cobalt -> Violet -> Soft Coral) */}
          <linearGradient id="architecturalLineGradient" x1="1200" y1="1080" x2="1580" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1c46d7" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#8a38f5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff9a76" stopOpacity="0.95" />
          </linearGradient>

          {/* Soft, restrained distant radial glow (15-20% opacity) */}
          <radialGradient id="distantLightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#ff9a76" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#ff9a76" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050713" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle architectural guide offset (echo) */}
        <motion.path
          d="M 1260 1120 C 1360 860, 1530 620, 1420 460 C 1340 340, 1430 270, 1578 242"
          stroke="url(#architecturalLineGradient)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="4 8"
          opacity="0.25"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.25 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        {/* Primary Crisp Architectural Vector Line (1.75px) */}
        <motion.path
          d="M 1250 1100 C 1350 850, 1520 610, 1410 450 C 1330 330, 1420 265, 1580 240"
          stroke="url(#architecturalLineGradient)"
          strokeWidth="1.75"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />

        {/* Small subtle destination point of light (8-10px core + soft ambient halo) */}
        <motion.g
          transform="translate(1580, 240)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Soft ambient halo (18% opacity, 36px) */}
          <circle cx="0" cy="0" r="36" fill="url(#distantLightGlow)" opacity="0.4" />
          
          {/* Subtle midpoint dot (5px) */}
          <circle cx="0" cy="0" r="3.5" fill="#ff9a76" opacity="0.8" />
          
          {/* Inner needle-pin center (1.5px) */}
          <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
        </motion.g>
      </svg>

    </div>
  );
}
