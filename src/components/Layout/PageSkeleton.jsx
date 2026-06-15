/**
 * Loading skeleton displayed while a route's markdown content is being fetched.
 * Animated shimmer bars simulate the content structure.
 */
export default function PageSkeleton() {
  const bars = [
    { width: '55%', height: '2rem' },   // h1 title
    { width: '100%', height: '1rem' },  // paragraph
    { width: '90%', height: '1rem' },
    { width: '75%', height: '1rem' },
    { width: '45%', height: '1.5rem' }, // h2
    { width: '100%', height: '1rem' },
    { width: '85%', height: '1rem' },
    { width: '60%', height: '1rem' },
    { width: '40%', height: '1.5rem' }, // h2
    { width: '100%', height: '1rem' },
    { width: '95%', height: '1rem' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '100%' }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            height: bar.height,
            width: bar.width,
            background: 'var(--bg-card)',
            borderRadius: '6px',
            marginBottom: '0.85rem',
            animation: `shimmer 1.5s infinite`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}
