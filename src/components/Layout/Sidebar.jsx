import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Collapsible left sidebar showing the Table of Contents for the current page.
 * Active section is highlighted and synced via the scroll spy hook.
 *
 * @param {{ headings, activeSection, openSections, onToggleSection, onScrollTo, isOpen, onSetOpen }} props
 */
export default function Sidebar({
  headings,
  activeSection,
  openSections,
  onToggleSection,
  onScrollTo,
  isOpen,
  onSetOpen,
}) {
  const isDesktop = window.innerWidth > 1024

  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="sidebar-container"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <aside className="sidebar">
              <div className="sidebar-header">📑 Contents</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {headings.map(chapter => {
                  const isChapterOpen = openSections.includes(chapter.id)
                  const isChapterActive = activeSection === chapter.id
                  return (
                    <div key={chapter.id}>
                      <button
                        className={`toc-chapter-btn ${isChapterActive ? 'active' : ''}`}
                        onClick={() => {
                          onToggleSection(chapter.id)
                          onScrollTo(chapter.id)
                        }}
                      >
                        <span style={{ flex: 1 }}>{chapter.title}</span>
                        {chapter.children.length > 0 && (
                          <span
                            style={{
                              transform: isChapterOpen ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.2s',
                              display: 'flex',
                            }}
                          >
                            <ChevronRight size={14} />
                          </span>
                        )}
                      </button>

                      {isChapterOpen && chapter.children.length > 0 && (
                        <div className="toc-children">
                          {chapter.children.map(sub => (
                            <a
                              key={sub.id}
                              href={`#${sub.id}`}
                              className={`toc-sub-link ${activeSection === sub.id ? 'active' : ''}`}
                              onClick={e => {
                                e.preventDefault()
                                onScrollTo(sub.id)
                              }}
                            >
                              {sub.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </aside>

            {/* Collapse button */}
            {isDesktop && (
              <button
                className="sidebar-toggle-btn"
                onClick={() => onSetOpen(false)}
                title="Hide contents"
                style={{ display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating expand button when sidebar is hidden */}
      {!isOpen && isDesktop && (
        <button
          className="sidebar-toggle-btn floating"
          onClick={() => onSetOpen(true)}
          title="Show contents"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </>
  )
}
