import React, { useEffect, useRef } from "react"
import createGlobe from "cobe"

export function CobeGlobe({ className = "" }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let phi = 0
    let width = 0

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    window.addEventListener("resize", onResize)
    onResize()

    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 0, // Light mode
      diffuse: 1.4,
      mapSamples: 14000,
      mapBrightness: 4.5,
      baseColor: [1, 1, 1],
      markerColor: [0.38, 0.4, 0.95], // Indigo marker
      glowColor: [0.93, 0.94, 0.99],
      markers: [
        { location: [37.7595, -122.4367], size: 0.05 },
        { location: [40.7128, -74.006], size: 0.06 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6762, 139.6503], size: 0.06 },
        { location: [1.3521, 103.8198], size: 0.04 },
        { location: [-33.8688, 151.2093], size: 0.04 },
      ],
      onRender: (state) => {
        state.phi = phi
        phi += 0.004
        state.width = width * 2
        state.height = width * 2
      },
    })

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div className={`relative w-full aspect-square max-w-[480px] mx-auto flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90 transition-opacity duration-500 hover:opacity-100"
        style={{ width: "100%", height: "100%", contain: "layout paint size" }}
      />
    </div>
  )
}
