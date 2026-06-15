import { motion } from 'framer-motion'
import { Server, Database, Cloud, Terminal, BookOpen } from 'lucide-react'

const getIcon = (title) => {
  if (title.includes('AWS')) return <Cloud size={32} color="var(--accent)" />
  if (title.includes('Git')) return <Terminal size={32} color="var(--accent)" />
  if (title.includes('Terraform')) return <Server size={32} color="var(--accent)" />
  if (title.includes('Ansible')) return <Database size={32} color="var(--accent)" />
  return <BookOpen size={32} color="var(--accent)" />
}

/**
 * Animated loading screen displayed while a route's markdown content is being fetched.
 * Uses Framer Motion for a sleek transition effect.
 */
export default function PageSkeleton({ title = 'Content' }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '2rem'
      }}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          filter: ['drop-shadow(0px 0px 0px rgba(59, 130, 246, 0))', 'drop-shadow(0px 10px 20px rgba(59, 130, 246, 0.4))', 'drop-shadow(0px 0px 0px rgba(59, 130, 246, 0))']
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)'
        }}
      >
        {getIcon(title)}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <div style={{
          fontSize: '1.5rem',
          color: 'var(--text-main)',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          Preparing {title}
        </div>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Fetching resources</span>
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            ...
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}
