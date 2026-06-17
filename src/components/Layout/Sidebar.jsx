import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Recursive tree node for sidebar items that may have nested children.
 * Used for the 3-level nesting in Chapter 3: Chapter → Service → Topic.
 *
 * - depth 0 = chapter (collapsible, managed by openSections from scroll spy)
 * - depth 1 = service or direct topic (services are collapsible, managed by openSections)
 * - depth 2 = topic under a service (leaf link)
 *
 * @param {{ node, depth, activeSection, openSections, onToggleSection, onScrollTo }} props
 */
function SidebarNode({ node, depth, activeSection, openSections, onToggleSection, onScrollTo }) {
  const hasChildren = node.children && node.children.length > 0
  const isOpen = openSections.includes(node.id)
  const isActive = activeSection === node.id

  if (!hasChildren) {
    // Leaf node — render as a clickable link
    return (
      <a
        href={`#${node.id}`}
        className={`toc-sub-link ${isActive ? 'active' : ''}`}
        onClick={e => {
          e.preventDefault()
          onScrollTo(node.id)
        }}
      >
        {node.title}
      </a>
    )
  }

  // Branch node — collapsible at any depth
  const isChapter = depth === 0
  const btnClass = isChapter ? 'toc-chapter-btn' : 'toc-service-btn'

  return (
    <div>
      <button
        className={`${btnClass} ${isActive ? 'active' : ''}`}
        onClick={() => {
          onToggleSection(node.id)
          onScrollTo(node.id)
        }}
      >
        <span style={{ flex: 1 }}>{node.title}</span>
        <span
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'flex',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={isChapter ? 14 : 12} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="toc-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {node.children.map(child => (
              <SidebarNode
                key={child.id}
                node={child}
                depth={depth + 1}
                activeSection={activeSection}
                openSections={openSections}
                onToggleSection={onToggleSection}
                onScrollTo={onScrollTo}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Collapsible left sidebar showing the Table of Contents for the current page.
 * Active section is highlighted and synced via the scroll spy hook.
 * Supports recursive nesting for multi-level hierarchies (e.g. Chapter → Service → Topic).
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
                {headings.map(chapter => (
                  <SidebarNode
                    key={chapter.id}
                    node={chapter}
                    depth={0}
                    activeSection={activeSection}
                    openSections={openSections}
                    onToggleSection={onToggleSection}
                    onScrollTo={onScrollTo}
                  />
                ))}
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
