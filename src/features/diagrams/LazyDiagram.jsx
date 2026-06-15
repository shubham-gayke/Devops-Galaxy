import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'

/**
 * Wraps any diagram component with:
 * 1. IntersectionObserver — only begins loading when the placeholder enters viewport
 * 2. React.lazy — the diagram JS chunk is only downloaded when visible
 * 3. Suspense — shows an animated skeleton while the chunk loads
 *
 * @param {Function} loader - Dynamic import function, e.g. () => import('../../../Workflow')
 * @param {number} fallbackHeight - Pixel height of the loading skeleton
 */
export function LazyDiagram({ loader, fallbackHeight = 300 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  // Memoize the lazy component so it's only created once per `loader` reference
  const LazyComp = useMemo(
    () => (visible ? React.lazy(loader) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible]
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 200px root margin means we start loading the chunk just before it scrolls
    // into view — eliminating any visible loading delay on fast scrolls
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {LazyComp ? (
        <Suspense fallback={<DiagramSkeleton height={fallbackHeight} />}>
          <LazyComp />
        </Suspense>
      ) : (
        <DiagramSkeleton height={fallbackHeight} />
      )}
    </div>
  )
}

function DiagramSkeleton({ height }) {
  return (
    <div
      style={{
        height,
        borderRadius: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>⬡</span>
      Loading diagram…
    </div>
  )
}
