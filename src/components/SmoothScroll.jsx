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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // `lerp` rather than `duration`: duration-based easing restarts on every
    // wheel event, which reads as stutter. A frame-rate independent lerp keeps
    // one continuous glide no matter how the wheel is driven.
    //
    // 0.13 rather than the 0.095 this used to run at. Everything scroll-linked
    // on this page reads its position *from* Lenis, so a slow lerp is not
    // smoothness — it is latency that every scrubbed animation then inherits
    // and adds its own delay on top of.
    const lenis = reducedMotion
      ? null
      : new Lenis({
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
          stopInertiaOnNavigate: true,
        })

    lenisRef.current = lenis
    setLenis(lenis)

    const tickerCallback = (time) => lenis?.raf(time * 1000)
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)
    }

    const targetFromHash = (hash = window.location.hash) => {
      if (!hash || hash === '#') return null
      try {
        return document.getElementById(decodeURIComponent(hash.slice(1)))
      } catch {
        return null
      }
    }

    const scrollToHash = (hash, { immediate = false } = {}) => {
      const target = targetFromHash(hash)
      if (!target) return false

      if (lenis) {
        lenis.resize()
        lenis.scrollTo(target, {
          offset: -16,
          immediate,
          force: true,
          duration: immediate ? 0 : 0.9,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        })
      } else {
        const top = window.scrollY + target.getBoundingClientRect().top - 16
        window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
      }
      return true
    }

    // Pinning inserts spacer elements, which pushes every section below down.
    // Anything that measured its own offsets at mount — ScrollTrigger starts,
    // and Framer Motion's useScroll targets — is stale from that moment on, and
    // stale offsets are what make the snap transitions fire at the wrong place.
    // Re-measure once the layout has actually settled.
    const resync = ({ restoreHash = true } = {}) => {
      lenis?.resize()
      ScrollTrigger.refresh()
      // Framer Motion re-measures its scroll targets on resize, and has no idea
      // ScrollTrigger just moved them.
      window.dispatchEvent(new Event('resize'))

      // A hard load may apply the browser's hash position before pin spacers,
      // fonts and client-only scenes have reached their final dimensions.
      // Re-apply it after every startup refresh so /#diagnose cannot be reset
      // to the hero or left at a stale pre-pin offset.
      if (restoreHash && window.location.hash) {
        requestAnimationFrame(() => scrollToHash(window.location.hash, { immediate: true }))
      }
    }

    const firstFrame = requestAnimationFrame(() => resync())
    const settleTimers = [
      setTimeout(resync, 200),
      setTimeout(resync, 800),
    ]

    if (document.fonts?.ready) document.fonts.ready.then(resync)
    window.addEventListener('load', resync)

    const onHashChange = () => {
      requestAnimationFrame(() => {
        lenis?.resize()
        ScrollTrigger.refresh()
        scrollToHash(window.location.hash)
      })
    }
    window.addEventListener('hashchange', onHashChange)

    // Own same-page hash clicks so the browser and Lenis never issue competing
    // scrolls. Cross-page links such as /about -> /#diagnose remain normal
    // navigation and are restored by the startup path above.
    const onDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target.closest?.('a[href]')
      if (!anchor) return

      const next = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      if (next.origin !== current.origin || next.pathname !== current.pathname || next.search !== current.search || !next.hash) return
      if (!targetFromHash(next.hash)) return

      event.preventDefault()
      window.history.pushState(null, '', next.hash)
      scrollToHash(next.hash)
    }
    document.addEventListener('click', onDocumentClick)

    // A width change is a real layout change and does need a re-measure; a
    // height-only change is the mobile address bar, which does not.
    let lastWidth = window.innerWidth
    let resizeTimer = 0
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => resync({ restoreHash: false }), 180)
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(firstFrame)
      settleTimers.forEach(clearTimeout)
      clearTimeout(resizeTimer)
      window.removeEventListener('load', resync)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', onDocumentClick)
      if (lenis) gsap.ticker.remove(tickerCallback)
      setLenis(null)
      lenis?.destroy()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="smooth-scroll-wrapper w-full">
      {children}
    </div>
  )
}
