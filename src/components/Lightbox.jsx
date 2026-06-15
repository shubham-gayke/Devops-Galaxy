import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Full-screen image lightbox with zoom controls.
 * Listens for clicks on images inside .content-area globally.
 */
export default function Lightbox() {
  const [lightboxImage, setLightboxImage] = useState(null)
  const [imageZoom, setImageZoom] = useState(1)

  const open = (src) => {
    setLightboxImage(src)
    setImageZoom(1)
    document.body.style.overflow = 'hidden'
  }

  const close = () => {
    setLightboxImage(null)
    setImageZoom(1)
    document.body.style.overflow = 'auto'
  }

  // Delegate click to all images inside content-area
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.content-area')) {
        e.preventDefault()
        open(e.target.src)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && lightboxImage) close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxImage])

  // Mouse wheel zoom
  useEffect(() => {
    if (!lightboxImage) return
    const handler = (e) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.1 : -0.1
      setImageZoom(prev => {
        const next = parseFloat((prev + delta).toFixed(2))
        return Math.min(Math.max(next, 0.25), 4)
      })
    }
    window.addEventListener('wheel', handler, { passive: false })
    return () => window.removeEventListener('wheel', handler)
  }, [lightboxImage])

  return (
    <AnimatePresence>
      {lightboxImage && (
        <motion.div
          className="image-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <button className="image-lightbox-close" onClick={close} title="Close (ESC)">
            <X size={24} />
          </button>

          <img
            src={lightboxImage}
            alt="Zoomed"
            style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
            onClick={e => e.stopPropagation()}
          />

          <div className="image-lightbox-controls" onClick={e => e.stopPropagation()}>
            <button
              className="lightbox-control-btn"
              onClick={() => setImageZoom(p => Math.max(parseFloat((p - 0.25).toFixed(2)), 0.25))}
              title="Zoom Out"
            >−</button>
            <button
              className="lightbox-control-btn reset"
              onClick={() => setImageZoom(1)}
              title="Reset Zoom"
            >⟲</button>
            <span className="lightbox-zoom-label">{Math.round(imageZoom * 100)}%</span>
            <button
              className="lightbox-control-btn"
              onClick={() => setImageZoom(p => Math.min(parseFloat((p + 0.25).toFixed(2)), 4))}
              title="Zoom In"
            >+</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
