import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Tracks which heading is currently in the viewport using IntersectionObserver.
 * When the user scrolls, the active heading ID is updated, the sidebar highlights
 * the corresponding item, and the parent chapter auto-expands.
 *
 * Service-level sections (e.g. "3.1 IAM") are NOT auto-expanded by scroll spy —
 * they are managed independently by the Sidebar component so users can manually
 * collapse/expand individual services.
 *
 * @param {object[]} headings - Heading items with { id, children }
 * @param {string} contentKey - Dependency key to reset observer when page changes
 * @returns {{ activeSection: string, openSections: string[], setOpenSections: Function }}
 */
export function useScrollSpy(headings, contentKey) {
  const [activeSection, setActiveSection] = useState('')
  const [openSections, setOpenSections] = useState([])
  const observerRef = useRef(null)

  // Build a flat set of all known heading IDs (parent + child + grandchild) for fast lookup
  const allIdSetRef = useRef(new Set())
  useEffect(() => {
    const idSet = new Set()
    headings.forEach(h => {
      idSet.add(h.id)
      h.children?.forEach(c => {
        idSet.add(c.id)
        c.children?.forEach(gc => idSet.add(gc.id))
      })
    })
    allIdSetRef.current = idSet
  }, [headings])

  // Initialize open sections when headings change
  useEffect(() => {
    if (headings.length > 0) {
      setOpenSections([headings[0].id])
      setActiveSection('')
    }
  }, [headings])

  // Accordion auto-expand: when scrolling into a new chapter, collapse all
  // other chapters and expand only the active one. Service-level toggle
  // states are preserved so manually opened services stay open.
  const autoExpandParent = useCallback((currentId) => {
    // Build a set of all chapter (top-level) IDs for filtering
    const chapterIds = new Set(headings.map(h => h.id))

    // Find which chapter the active heading belongs to
    let chapterToOpen = null

    for (const chapter of headings) {
      // The heading IS the chapter itself
      if (chapter.id === currentId) {
        chapterToOpen = chapter.id
        break
      }

      // Direct child of this chapter
      if (chapter.children?.some(c => c.id === currentId)) {
        chapterToOpen = chapter.id
        break
      }

      // Grandchild (topic under a service)
      for (const service of (chapter.children || [])) {
        if (service.children?.some(gc => gc.id === currentId)) {
          chapterToOpen = chapter.id
          break
        }
      }

      if (chapterToOpen) break
    }

    if (chapterToOpen) {
      setOpenSections(prev => {
        // Keep non-chapter IDs (service toggles) + the active chapter
        const nonChapterIds = prev.filter(id => !chapterIds.has(id))
        const alreadyCorrect = prev.includes(chapterToOpen) &&
          prev.filter(id => chapterIds.has(id)).length === 1
        if (alreadyCorrect) return prev
        return [chapterToOpen, ...nonChapterIds]
      })
    }
  }, [headings])

  useEffect(() => {
    if (!headings.length) return

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Track which headings are currently visible
    const visibleHeadings = new Map() // id → IntersectionObserverEntry

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.id
          if (!id) return

          if (entry.isIntersecting) {
            visibleHeadings.set(id, entry)
          } else {
            visibleHeadings.delete(id)
          }
        })

        // Pick the topmost visible heading (smallest boundingClientRect.top)
        if (visibleHeadings.size > 0) {
          let topmost = null
          let topY = Infinity

          visibleHeadings.forEach((entry, id) => {
            const y = entry.boundingClientRect.top
            if (y < topY) {
              topY = y
              topmost = id
            }
          })

          if (topmost) {
            setActiveSection(topmost)
          }
        }
      },
      {
        root: null,
        // Top 10% is dead zone (behind fixed header), bottom 70% is dead zone
        // so we only track headings in the top 30% of the viewport
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    )

    observerRef.current = observer

    // Delay initial observation to let the DOM render (especially after
    // markdown content is loaded and parsed into HTML)
    const initTimeout = setTimeout(() => {
      const elements = document.querySelectorAll('.heading-observe')
      elements.forEach(el => {
        if (el.id) observer.observe(el)
      })
    }, 500)

    return () => {
      clearTimeout(initTimeout)
      observer.disconnect()
      visibleHeadings.clear()
    }
  }, [headings, contentKey, autoExpandParent])

  return { activeSection, openSections, setOpenSections }
}
