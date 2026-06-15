export default function PageSkeleton({ title = 'Content' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)'
    }}>
      Loading {title}...
    </div>
  )
}
