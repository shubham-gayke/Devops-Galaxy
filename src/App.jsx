import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, GitBranch, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Workflow from './Workflow'

// Import the raw markdown string
import notesContent from './Git_GitHub_Complete_Notes.md?raw'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [headings, setHeadings] = useState([])
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Extract headings for TOC
    const headingMatches = [...notesContent.matchAll(/^## \d+\.\s+(.+)$/gm)]
    const extractedHeadings = headingMatches.map((match, index) => ({
      id: `section-${index}`,
      title: match[1],
      text: match[0]
    }))
    setHeadings(extractedHeadings)
    
    // Check local storage for theme
    const savedTheme = localStorage.getItem('gitnotes-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gitnotes-theme', theme)
  }, [theme])

  // Custom components for markdown rendering
  const components = {
    h2: ({node, children, ...props}) => {
      // Find index to create an ID
      const text = String(children).trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      
      // Inject workflow diagram after the internally works section
      if (text.includes("How Git Works Internally")) {
        return (
          <div id={id}>
            <h2 {...props}>{children}</h2>
            <Workflow />
          </div>
        )
      }
      return <h2 id={id} {...props}>{children}</h2>
    },
    h3: ({node, ...props}) => <h3 className="mt-6 mb-3" {...props} />,
    pre: ({node, ...props}) => (
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <pre {...props} />
      </motion.div>
    ),
    code: ({node, inline, ...props}) => {
      if (inline) {
        return <code {...props} />
      }
      return <code {...props} />
    },
    strong: ({node, ...props}) => <strong {...props} />,
    em: ({node, ...props}) => <em {...props} />,
    blockquote: ({node, ...props}) => (
      <motion.blockquote 
        initial={{ opacity: 0, x: -10 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
        {...props} 
      />
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <GitBranch size={28} />
          <span>GitMastery</span>
        </div>
        
        <div className="nav-links">
          <select 
            className="theme-selector" 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="ocean">Ocean Blue</option>
            <option value="dracula">Dracula</option>
          </select>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">
        
        {/* Sidebar Container */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div 
              className={`sidebar-container ${mobileMenuOpen ? 'block' : 'hidden lg:flex'}`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <aside className="sidebar">
                <div className="mb-4 text-sm font-semibold tracking-wider text-muted uppercase">Contents</div>
                <nav>
                  {headings.map((heading) => {
                    const id = heading.text.replace(/^##\s+/, '').toLowerCase().replace(/[^\w]+/g, '-');
                    return (
                      <a 
                        key={heading.id} 
                        href={`#${id}`}
                        className="toc-link"
                        onClick={() => {
                          setActiveSection(id);
                          if (window.innerWidth < 768) setMobileMenuOpen(false);
                        }}
                      >
                        {heading.title}
                      </a>
                    )
                  })}
                </nav>
              </aside>
              
              {/* Desktop Toggle Hide Button */}
              <button 
                className="sidebar-toggle-btn hidden lg:flex" 
                onClick={() => setSidebarOpen(false)}
                title="Hide contents"
              >
                <ChevronLeft size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Show Button (when sidebar is hidden) */}
        {!sidebarOpen && (
          <button 
            className="sidebar-toggle-btn floating hidden lg:flex" 
            onClick={() => setSidebarOpen(true)}
            title="Show contents"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Content Area */}
        <motion.div 
          className="content-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          layout
        >
          {mobileMenuOpen && (
            <div className="lg:hidden mb-6 flex justify-between items-center bg-card p-4 rounded-lg border border-border">
               <span className="font-semibold text-sm uppercase text-muted">Theme</span>
               <select 
                className="theme-selector w-auto" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="ocean">Ocean Blue</option>
                <option value="dracula">Dracula</option>
              </select>
            </div>
          )}

          <ReactMarkdown components={components}>
            {notesContent}
          </ReactMarkdown>
        </motion.div>
      </main>
    </div>
  )
}

export default App
