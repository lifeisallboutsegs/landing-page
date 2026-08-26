import React, { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }) {
  const wrapperRef = useRef(null)
  const lenisRef = useRef(null)

  useEffect(() => {
    // `lerp` rather than `duration`: duration-based easing restarts on every
    // wheel event, which reads as stutter. A frame-rate independent lerp keeps
    // one continuous glide no matter how the wheel is driven.
    const lenis = new Lenis({
      lerp: 0.095,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
      autoResize: true,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    // Pinning inserts spacer elements, which pushes every section below down.
    // Anything that measured its own offsets at mount — ScrollTrigger starts,
    // and Framer Motion's useScroll targets — is stale from that moment on, and
    // stale offsets are what make the snap transitions fire at the wrong place.
    // Re-measure once the layout has actually settled.
    const resync = () => {
      ScrollTrigger.refresh()
      // Framer Motion re-measures its scroll targets on resize, and has no idea
      // ScrollTrigger just moved them.
      window.dispatchEvent(new Event('resize'))
    }

    const settleTimers = [
      setTimeout(resync, 200),
      setTimeout(resync, 800),
    ]

    if (document.fonts?.ready) document.fonts.ready.then(resync)
    window.addEventListener('load', resync)

    return () => {
      settleTimers.forEach(clearTimeout)
      window.removeEventListener('load', resync)
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="smooth-scroll-wrapper w-full">
      {children}
    </div>
  )
}
