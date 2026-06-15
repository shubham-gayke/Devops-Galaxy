import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import Header from './Header'
import Sidebar from './Sidebar'
import ErrorBoundary from './ErrorBoundary'
import { useTheme } from '../../hooks/useTheme'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useScrollSpy } from '../../hooks/useScrollSpy'

/**
 * Root layout shell. Renders once and never unmounts — only the <Outlet> changes.
 * This means Header and Sidebar remain stable across route changes.
 *
 * Content, headings, and pageKey are passed down via Outlet context so each
 * route page can inform the layout of its own data.
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { scrollProgress, showScrollTop } = useScrollProgress()

  // These are set by child routes via the LayoutContext
  const [layoutCtx, setLayoutCtx] = useState({
    content: null,
    headings: [],
    pageKey: '',
    showSidebar: true,
  })

  const { activeSection, openSections, setOpenSections } = useScrollSpy(
    layoutCtx.headings,
    layoutCtx.pageKey
  )

  const toggleSection = (id) =>
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('highlight-pulse')
      setTimeout(() => el.classList.remove('highlight-pulse'), 1500)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="app-container">
      <Header
        content={layoutCtx.content}
        pageKey={layoutCtx.pageKey}
        scrollProgress={scrollProgress}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="main-content">
        {layoutCtx.showSidebar && layoutCtx.headings.length > 0 && (
          <Sidebar
            headings={layoutCtx.headings}
            activeSection={activeSection}
            openSections={openSections}
            onToggleSection={toggleSection}
            onScrollTo={scrollToSection}
            isOpen={sidebarOpen}
            onSetOpen={setSidebarOpen}
          />
        )}

        {/* Animate route transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="content-area"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <ErrorBoundary>
              {/* Outlet receives setLayoutCtx so each page can push its data up */}
              <Outlet context={{ setLayoutCtx }} />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="scroll-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            title="Back to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
