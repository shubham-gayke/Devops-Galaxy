import { useEffect, useState } from 'react'

/**
 * Tracks scroll progress percentage and whether to show the scroll-to-top button.
 * Uses requestAnimationFrame to throttle updates and avoid forced layouts on every scroll.
 *
 * @returns {{ scrollProgress: number, showScrollTop: boolean }}
 */
export function useScrollProgress() {
  const [state, setState] = useState({ scrollProgress: 0, showScrollTop: false })

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        setState({ scrollProgress: progress, showScrollTop: scrollTop > 400 })
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return state
}
