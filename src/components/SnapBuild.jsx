import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import SplitText from '@/components/SplitText';
import BlurText from '@/components/BlurText';
import SpotlightCard from '@/components/SpotlightCard';
import FadeContent from '@/components/FadeContent';
import AnimatedContent from '@/components/AnimatedContent';
import GradientText from '@/components/GradientText';
import Aurora from '@/components/Aurora';
import Ribbons from '@/components/Ribbons';
import DecryptedText from '@/components/DecryptedText';
import RotatingText from '@/components/RotatingText';
import GlareHover from '@/components/GlareHover';
import CountUp from '@/components/CountUp';
import ShinyText from '@/components/ShinyText';
import Magnet from '@/components/Magnet';
import { Target, Sparkles, Zap, MousePointerClick, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SnapBuild() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.6], [60, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const pillarsY = useTransform(scrollYProgress, [0.1, 0.7], [80, 0]);
  const pillarsOpacity = useTransform(scrollYProgress, [0.1, 0.55], [0, 1]);

  return (
    <section 
      ref={sectionRef}
      id="build"
      className="relative z-20 w-full bg-white text-zinc-950 select-none font-sans antialiased overflow-hidden rounded-t-[40px] md:rounded-t-[64px] shadow-[0_-30px_90px_rgba(0,0,0,0.65)] border-t border-white/40 -mt-12 md:-mt-16"
    >
      {/* ── BACKGROUND LAYER 0: REACT BITS RIBBONS CURSOR PHYSICS ──── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Ribbons
          colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f97316']}
          baseSpring={0.02}
          baseFriction={0.9}
          baseThickness={26}
          offsetFactor={0.03}
          maxAge={400}
          pointCount={40}
          speedMultiplier={0.4}
          enableFade={true}
          enableShaderEffect={false}
          backgroundColor={[0, 0, 0, 0]}
        />
      </div>

      {/* ── BACKGROUND LAYER 1: REACT BITS AURORA ──────────────────── */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <Aurora 
          colorStops={['#2563eb', '#9333ea', '#f97316']}
          amplitude={0.7}
          blend={0.35}
        />
      </div>

      {/* ── SECTION HEADER & EDITORIAL INTRO ────────────────────────── */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative z-10 w-full max-w-[1680px] mx-auto px-8 md:px-16 pt-24 pb-8 flex flex-col items-center text-center"
      >
        
        {/* Step Badge */}
        <FadeContent blur={true} duration={500} delay={0} className="mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <GradientText
              colors={['#2563eb', '#7c3aed', '#ea580c']}
              animationSpeed={4}
              className="font-mono text-xs font-bold tracking-[0.25em] uppercase"
            >
              01 / BUILD
            </GradientText>
          </div>
        </FadeContent>

        {/* Main Headline */}
        <h2 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-medium tracking-[-0.035em] text-zinc-950 leading-[1.05] max-w-4xl mb-6">
          <SplitText
            text="A website built to sell."
            splitType="words"
            ease="expo.out"
            delay={100}
            duration={1}
            textAlign="center"
            tag="span"
          />
        </h2>

        {/* Subhead */}
        <BlurText
          text="We design landing pages around what the visitor needs to see, understand and do next. Not web development — conversion architecture."
          delay={20}
          stepDuration={0.18}
          animateBy="words"
          direction="top"
          className="text-lg sm:text-xl text-zinc-500 font-normal leading-relaxed max-w-2xl"
        />

        {/* 4 Pillars Flow Ribbon */}
        <AnimatedContent
          distance={20}
          direction="vertical"
          delay={0.4}
          duration={0.8}
          ease="power3.out"
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono uppercase tracking-wider text-zinc-500"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Clear message
          </span>
          <span className="text-zinc-300">→</span>
          <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Strong offer
          </span>
          <span className="text-zinc-300">→</span>
          <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Fast experience
          </span>
          <span className="text-zinc-300">→</span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Action
          </span>
        </AnimatedContent>
      </motion.div>

      {/* ── ACETERNITY MACBOOK SCROLL WITH LIVE ASSEMBLING WEBSITE ──── */}
      <div className="relative z-10 w-full overflow-hidden">
        <MacbookScroll
          title={
            <span className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-900 leading-snug">
              Every detail engineered for conversion. <br />
              <span className="text-zinc-400 text-lg sm:text-2xl font-normal">
                Scroll to watch the high-velocity landing page assemble live.
              </span>
            </span>
          }
          showGradient={false}
        >
          {/* ── LIVE CONVERSION SYSTEM WEBSITE INSIDE MACBOOK DISPLAY ── */}
          <div className="w-full h-full bg-white flex flex-col overflow-hidden text-zinc-900 select-none">
            
            {/* 1. Browser Navigation Header Bar */}
            <div className="h-9 bg-zinc-100/90 border-b border-zinc-200 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="ml-2 px-2.5 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-mono text-zinc-600 flex items-center gap-1">
                  <span className="text-zinc-400">https://</span>
                  <ShinyText text="system.digitalassurances.com" speed={3} color="#475569" shineColor="#2563eb" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System
              </div>
            </div>

            {/* 2. Scrollable Website Body Content */}
            <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/40 flex flex-col justify-between gap-4">
              
              {/* Assembling Website Hero */}
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-600 mb-1">
                  CONVERSION ARCHITECTURE
                </span>
                <h4 className="text-base md:text-xl font-bold text-zinc-900 tracking-tight leading-tight mb-1.5">
                  <DecryptedText text="Engineered to turn attention into customers." speed={40} animateOn="view" />
                </h4>
                <p className="text-[10px] md:text-xs text-zinc-500 mb-3 max-w-xs leading-relaxed">
                  Clear message, strong offer, sub-second speed, decisive action.
                </p>
                <Magnet padding={20} magnetStrength={3}>
                  <div className="px-4 py-1.5 rounded-full bg-zinc-950 text-white font-medium text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer">
                    <span>Book Strategy Call</span>
                    <ArrowRight className="w-3 h-3 text-orange-400" />
                  </div>
                </Magnet>
              </div>

              {/* Assembling 3 Performance Metric Cards */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto">
                <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80 shadow-xs flex flex-col items-center text-center">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase mb-0.5">Speed</span>
                  <div className="text-sm md:text-base font-bold text-emerald-600 flex items-baseline">
                    <CountUp to={0.4} from={2.8} duration={2} />
                    <span className="text-[9px] ml-0.5 font-mono text-zinc-400">s</span>
                  </div>
                  <span className="text-[7px] text-emerald-600 font-medium">Instant Paint</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80 shadow-xs flex flex-col items-center text-center">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase mb-0.5">Lift</span>
                  <div className="text-sm md:text-base font-bold text-purple-600 flex items-baseline">
                    <span className="text-[10px] mr-0.5">+</span>
                    <CountUp to={320} from={0} duration={2.2} />
                    <span className="text-[9px] ml-0.5 font-mono text-zinc-400">%</span>
                  </div>
                  <span className="text-[7px] text-purple-600 font-medium">Qualified Leads</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80 shadow-xs flex flex-col items-center text-center">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase mb-0.5">Score</span>
                  <div className="text-sm md:text-base font-bold text-blue-600 flex items-baseline">
                    <CountUp to={100} from={45} duration={1.8} />
                    <span className="text-[9px] ml-0.5 font-mono text-zinc-400">/100</span>
                  </div>
                  <span className="text-[7px] text-blue-600 font-medium">Performance</span>
                </div>
              </div>

            </div>

          </div>
        </MacbookScroll>
      </div>

      {/* ── 4 DETAILED PILLARS (SpotlightCard + GlareHover) ─────────── */}
      <motion.div 
        style={{ y: pillarsY, opacity: pillarsOpacity }}
        className="relative z-10 w-full max-w-[1680px] mx-auto px-8 md:px-16 py-16"
      >
        <AnimatedContent
          distance={30}
          direction="vertical"
          delay={0.2}
          duration={0.8}
          ease="power3.out"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Pillar 1: Clear Message */}
          <GlareHover
            width="100%"
            height="auto"
            background="#ffffff"
            borderRadius="20px"
            borderColor="#e4e4e7"
            glareColor="#3b82f6"
            glareOpacity={0.12}
            glareSize={200}
            className="!w-full shadow-sm"
          >
            <SpotlightCard
              className="!p-6 !bg-white !border-0 !rounded-[20px] w-full text-left"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center mb-4 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 tracking-wider block mb-1">01 / CLARITY</span>
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                <DecryptedText text="Clear Message" speed={50} animateOn="view" />
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Visitors comprehend who you are and why it matters in under 3 seconds. Zero cognitive friction.
              </p>
            </SpotlightCard>
          </GlareHover>

          {/* Pillar 2: Strong Offer */}
          <GlareHover
            width="100%"
            height="auto"
            background="#ffffff"
            borderRadius="20px"
            borderColor="#e4e4e7"
            glareColor="#8b5cf6"
            glareOpacity={0.12}
            glareSize={200}
            className="!w-full shadow-sm"
          >
            <SpotlightCard
              className="!p-6 !bg-white !border-0 !rounded-[20px] w-full text-left"
              spotlightColor="rgba(139, 92, 246, 0.15)"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center mb-4 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-600 tracking-wider block mb-1">02 / PROPOSITION</span>
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                <DecryptedText text="Strong Offer" speed={50} animateOn="view" />
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                A value proposition so distinct and compelling that hesitation is eliminated before they scroll.
              </p>
            </SpotlightCard>
          </GlareHover>

          {/* Pillar 3: Fast Experience */}
          <GlareHover
            width="100%"
            height="auto"
            background="#ffffff"
            borderRadius="20px"
            borderColor="#e4e4e7"
            glareColor="#f97316"
            glareOpacity={0.12}
            glareSize={200}
            className="!w-full shadow-sm"
          >
            <SpotlightCard
              className="!p-6 !bg-white !border-0 !rounded-[20px] w-full text-left"
              spotlightColor="rgba(249, 115, 22, 0.15)"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center mb-4 text-orange-600">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-orange-600 tracking-wider block mb-1">03 / VELOCITY</span>
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                <DecryptedText text="Fast Experience" speed={50} animateOn="view" />
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Sub-second load times with zero layout shifts. Every millisecond shaved increases revenue.
              </p>
            </SpotlightCard>
          </GlareHover>

          {/* Pillar 4: Decisive Action */}
          <GlareHover
            width="100%"
            height="auto"
            background="#ffffff"
            borderRadius="20px"
            borderColor="#e4e4e7"
            glareColor="#10b981"
            glareOpacity={0.12}
            glareSize={200}
            className="!w-full shadow-sm"
          >
            <SpotlightCard
              className="!p-6 !bg-white !border-0 !rounded-[20px] w-full text-left"
              spotlightColor="rgba(16, 185, 129, 0.15)"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center mb-4 text-emerald-600">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 tracking-wider block mb-1">04 / CONVERSION</span>
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                <DecryptedText text="Decisive Action" speed={50} animateOn="view" />
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Clear and persuasive calls-to-action that convert qualified visitors into booked calls and buyers.
              </p>
            </SpotlightCard>
          </GlareHover>
        </AnimatedContent>
      </motion.div>

      {/* ── BOTTOM TRANSITION BAR ─────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1680px] mx-auto px-8 md:px-16 pb-16">
        <FadeContent blur={false} duration={600} delay={600}>
          <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] font-medium uppercase text-zinc-400 border-t border-zinc-200 pt-6">
            <span>NEXT → 02 ATTRACT</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">CAPABILITY:</span>
              <RotatingText
                texts={['SEARCH ENGINE OPTIMIZATION', 'GOOGLE ADS ENGINE', 'QUALIFIED TRAFFIC FLOW']}
                mainClassName="text-blue-600 font-mono text-[11px] tracking-[0.2em] font-bold uppercase"
                staggerFrom="last"
                staggerDuration={0.025}
                rotationInterval={2500}
              />
            </div>
          </div>
        </FadeContent>
      </div>

    </section>
  );
}
