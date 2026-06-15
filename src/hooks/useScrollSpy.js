import { useEffect, useState } from 'react'

/**
 * Tracks which heading is currently in the viewport using IntersectionObserver.
 * Fires a 150ms debounced callback to avoid excessive state updates during fast scrolls.
 *
 * @param {object[]} headings - Heading items with { id, children }
 * @param {string} contentKey - Dependency key to reset observer when page changes
 * @returns {{ activeSection: string, openSections: string[], setOpenSections: Function }}
 */
export function useScrollSpy(headings, contentKey) {
  const [activeSection, setActiveSection] = useState('')
  const [openSections, setOpenSections] = useState([])

  // Initialize open sections when headings change
  useEffect(() => {
    if (headings.length > 0) {
      setOpenSections([headings[0].id])
      setActiveSection('')
    }
  }, [headings])

  useEffect(() => {
    if (!headings.length) return

    let timeoutId = null

    const handleObserver = (entries) => {
      if (timeoutId) return
      timeoutId = setTimeout(() => {
        let currentActiveId = null
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            currentActiveId = entry.target.id
          }
        })
        if (currentActiveId) {
          setActiveSection(currentActiveId)
          // Auto-expand parent section in TOC if a child heading is active
          const parent = headings.find(h =>
            h.children?.some(c => c.id === currentActiveId)
          )
          if (parent) {
            setOpenSections(prev =>
              prev.includes(parent.id) ? prev : [...prev, parent.id]
            )
          }
        }
        timeoutId = null
      }, 150)
    }

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0,
    })

    // Delay initial observation to let the DOM render first
    const initTimeout = setTimeout(() => {
      document.querySelectorAll('.heading-observe').forEach(el => observer.observe(el))
    }, 300)

    return () => {
      clearTimeout(initTimeout)
      if (timeoutId) clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [headings, contentKey])

  return { activeSection, openSections, setOpenSections }
}
