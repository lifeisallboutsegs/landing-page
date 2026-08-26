import React, { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Activity, Layers, Zap, ArrowUpRight } from "lucide-react"

export function MacbookScroll({
  src,
  showGradient = true,
  title,
  subtitle,
  badge,
  children,
}) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Scroll animations for 3D lid angle, scale, and translateY — settles fast
  // so the screen reads clearly from the first frame instead of opening
  // through a long, hard-to-read tilt.
  const rotateX = useTransform(scrollYProgress, [0, 0.15], [18, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15], [0.96, 1])
  const translateY = useTransform(scrollYProgress, [0, 0.15], [20, 0])
  // Content must be fully visible immediately — never faded/dimmed at start.
  const screenOpacity = 1

  return (
    <div
      ref={containerRef}
      className="min-h-[160vh] flex flex-col items-center justify-start py-20 px-4 relative [perspective:1400px]"
    >
      {/* Section Header */}
      <div className="sticky top-20 z-20 flex flex-col items-center text-center max-w-3xl mb-12 pointer-events-none">
        {badge || (
          <Badge variant="glass" className="mb-4 px-4 py-1.5 gap-2 text-zinc-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Interactive 3D Hardware Simulation</span>
          </Badge>
        )}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
          {title || "Crafted for effortless precision."}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-base md:text-lg text-zinc-600 max-w-2xl">
            {subtitle}
          </p>
        ) : (
          <p className="mt-4 text-base md:text-lg text-zinc-600 max-w-xl">
            Scroll smoothly to unfold the workstation display and experience real-time perspective choreography.
          </p>
        )}
      </div>

      {/* 3D Laptop Container */}
      <div className="sticky top-44 z-10 w-full max-w-5xl flex flex-col items-center justify-center">
        <motion.div
          style={{
            rotateX: rotateX,
            scale: scale,
            translateY: translateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full max-w-[860px] flex flex-col items-center"
        >
          {/* Top Lid / Screen */}
          <motion.div
            style={{ opacity: screenOpacity }}
            className="relative w-full aspect-[16/10] bg-zinc-900 rounded-[24px] p-3 md:p-4 shadow-2xl border-[3px] border-zinc-300/80 ring-1 ring-zinc-950/10 [transform-origin:bottom_center]"
          >
            {/* Screen Bezel Notch / Camera */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-950 rounded-b-xl flex items-center justify-center gap-2 z-30 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-zinc-800 ring-1 ring-zinc-700/50 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-ping" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>

            {/* Screen Content */}
            <div className="w-full h-full rounded-[18px] bg-slate-50 overflow-hidden relative flex flex-col shadow-inner border border-zinc-200">
              {children ? (
                children
              ) : (
                <>
                  {/* App Titlebar */}
                  <div className="h-10 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400/90" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                      <span className="text-xs font-medium text-zinc-500 ml-3">fey-workspace.cloud</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" /> Live Sync
                      </span>
                    </div>
                  </div>

                  {/* Inside Dashboard Body */}
                  <div className="p-4 md:p-6 flex-1 overflow-hidden grid grid-cols-12 gap-4 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/40">
                    {/* Left Sidebar */}
                    <div className="col-span-3 hidden md:flex flex-col gap-2 p-3 bg-white/80 rounded-xl border border-zinc-200/70 shadow-sm text-xs text-zinc-600">
                      <div className="font-bold text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" /> Projects
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-100/90 font-medium text-zinc-900 flex items-center justify-between">
                        <span>Performance Matrix</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                      </div>
                      <div className="p-2 rounded-lg hover:bg-zinc-50 transition-colors">Shader Benchmarks</div>
                      <div className="p-2 rounded-lg hover:bg-zinc-50 transition-colors">WebGL Assets</div>
                      <div className="p-2 rounded-lg hover:bg-zinc-50 transition-colors">Design Systems</div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                      {/* Top Stats Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/95 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 text-xs">
                            <span>Framerate</span>
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-zinc-900 mt-1">120 FPS</div>
                          <div className="text-[10px] text-emerald-600 font-medium mt-1">↑ 100% hardware smooth</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/95 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 text-xs">
                            <span>Latency</span>
                            <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-zinc-900 mt-1">1.8 ms</div>
                          <div className="text-[10px] text-emerald-600 font-medium mt-1">Ultra-low GPU draw</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/95 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 text-xs">
                            <span>Memory</span>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-zinc-900 mt-1">14.2 MB</div>
                          <div className="text-[10px] text-zinc-500 font-medium mt-1">Optimized GL tree</div>
                        </div>
                      </div>

                      {/* Visual Chart Wave Preview */}
                      <div className="flex-1 p-4 rounded-xl bg-white/95 border border-zinc-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-zinc-800">Realtime GPU Shader Throughput</span>
                          <span className="text-[11px] text-zinc-400 font-mono">buffer_size: 4096</span>
                        </div>
                        <div className="h-20 w-full flex items-end gap-1.5 pt-4">
                          {[40, 65, 45, 80, 60, 95, 75, 88, 55, 92, 100, 85, 70, 90, 82, 98, 77, 89, 95, 100].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className="flex-1 bg-gradient-to-t from-indigo-500/20 via-indigo-500 to-violet-500 rounded-t-sm transition-all duration-300 hover:brightness-110"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Subtle Screen Glare Light Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
            </div>
          </motion.div>

          {/* Lower Chassis / Base */}
          <div className="w-[104%] -mt-1 h-5 md:h-7 bg-gradient-to-b from-zinc-300 via-zinc-200 to-zinc-400 rounded-b-3xl shadow-2xl relative border-t border-zinc-300 flex items-center justify-center">
            {/* Center Thumb Notch for opening */}
            <div className="w-20 md:w-28 h-1.5 md:h-2 bg-zinc-400/80 rounded-b-md shadow-inner" />
          </div>

          {/* Shadow underneath laptop base */}
          <div className="w-[90%] h-12 bg-zinc-900/15 blur-2xl rounded-full -mt-2 -z-10" />
        </motion.div>
      </div>
    </div>
  )
}
