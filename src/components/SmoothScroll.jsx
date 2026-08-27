import React, { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenis } from '@/lib/smooth-scroll'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }) {
  const wrapperRef = useRef(null)
  const lenisRef = useRef(null)

  useEffect(() => {
    // On a phone the address bar shrinks and grows as you scroll, which fires
    // a resize on every direction change. ScrollTrigger's default response is
    // a full refresh — re-measuring every trigger on the page, mid-scroll —
    // and that is the single worst hitch on mobile. Ignoring the height-only
    // resize keeps the measurements the page was laid out with.
    ScrollTrigger.config({ ignoreMobileResize: true })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // No smoothing layer at all: the visitor asked for the browser's own
      // scroll, and `scrollToElement` falls back to the native API when no
      // Lenis instance is registered.
      return
    }

    // `lerp` rather than `duration`: duration-based easing restarts on every
    // wheel event, which reads as stutter. A frame-rate independent lerp keeps
    // one continuous glide no matter how the wheel is driven.
    //
    // 0.13 rather than the 0.095 this used to run at. Everything scroll-linked
    // on this page reads its position *from* Lenis, so a slow lerp is not
    // smoothness — it is latency that every scrubbed animation then inherits
    // and adds its own delay on top of.
    const lenis = new Lenis({
      lerp: 0.13,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Touch scrolling stays native. Synthesising it costs a main-thread
      // frame per finger move and always trails the finger.
      syncTouch: false,
      autoResize: true,
    })

    lenisRef.current = lenis
    setLenis(lenis)

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

    // A width change is a real layout change and does need a re-measure; a
    // height-only change is the mobile address bar, which does not.
    let lastWidth = window.innerWidth
    let resizeTimer = 0
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resync, 180)
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      settleTimers.forEach(clearTimeout)
      clearTimeout(resizeTimer)
      window.removeEventListener('load', resync)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tickerCallback)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="smooth-scroll-wrapper w-full">
      {children}
    </div>
  )
}
