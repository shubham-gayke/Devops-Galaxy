import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { BookOpen, GitBranch, Cloud, HelpCircle, Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, ArrowUp, Copy, Check, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Workflow from './Workflow'

// Import markdown files
import gitNotesContent from './Git_GitHub_Complete_Notes.md?raw'
import terraformNotesContent from './Terraform_Complete_Notes.md?raw'
import interviewQuestionsContent from './interview_questions.md?raw'

// ======================== CODE BLOCK COMPONENT ========================
const CodeBlock = React.memo(function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!match) {
    return <code className={className}>{children}</code>
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang-badge">{language}</span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="pre"
        customStyle={{ margin: 0, padding: '1rem 1.25rem', background: 'var(--code-bg)', fontSize: '0.88rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
})

// ======================== INTERVIEW Q&A COMPONENT ========================
function InterviewPage({ content }) {
  const [openQuestions, setOpenQuestions] = useState(new Set())
  const [expandAll, setExpandAll] = useState(false)
  
  // Parse the markdown into sections and questions
  const parsed = useMemo(() => {
    const sections = []
    let currentSection = null
    const lines = content.split('\n')
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Section headers (## ...)
      if (line.startsWith('## ')) {
        currentSection = { title: line.replace('## ', ''), questions: [] }
        sections.push(currentSection)
        i++
        continue
      }
      
      // Question (bold with number)
      const qMatch = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*$/)
      if (qMatch && currentSection) {
        const qNum = qMatch[1]
        const qText = qMatch[2]
        let answer = ''
        i++
        
        // Collect answer lines until next question or section
        while (i < lines.length) {
          const nextLine = lines[i]
          if (nextLine.match(/^\*\*\d+\.\s/) || nextLine.startsWith('## ') || nextLine.startsWith('# ')) break
          if (nextLine === '---') { i++; continue }
          answer += nextLine + '\n'
          i++
        }
        
        currentSection.questions.push({ num: qNum, question: qText, answer: answer.trim() })
        continue
      }
      
      i++
    }
    
    return sections
  }, [content])

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (expandAll) {
      setOpenQuestions(new Set())
    } else {
      const allIds = new Set()
      parsed.forEach(s => s.questions.forEach(q => allIds.add(q.num)))
      setOpenQuestions(allIds)
    }
    setExpandAll(!expandAll)
  }

  return (
    <div>
      <h1>Terraform Interview Questions</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        100 questions from beginner to advanced — click any question to reveal the answer.
      </p>
      <button
        onClick={toggleAll}
        style={{
          background: 'var(--bg-card)',
          color: 'var(--accent)',
          border: '1px solid var(--border)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
      >
        {expandAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expandAll ? 'Collapse All' : 'Expand All'}
      </button>

      {parsed.map((section, si) => (
        <div key={si}>
          <div className="qa-section-title">
            {section.title}
          </div>
          {section.questions.map((q) => {
            const isOpen = openQuestions.has(q.num)
            return (
              <div className="qa-item" key={q.num}>
                <button className="qa-question" onClick={() => toggleQuestion(q.num)}>
                  <span className="q-number">Q{q.num}</span>
                  <span style={{ flex: 1 }}>{q.question}</span>
                  <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="qa-answer">
                        <ReactMarkdown>{q.answer}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ======================== MAIN APP ========================
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [headings, setHeadings] = useState([])
  const [openSections, setOpenSections] = useState([])
  const [theme, setTheme] = useState('dark')
  const [currentPage, setCurrentPage] = useState('git')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const pages = {
    git: { content: gitNotesContent, label: 'Git & GitHub', icon: GitBranch },
    terraform: { content: terraformNotesContent, label: 'Terraform', icon: Cloud },
    interview: { content: interviewQuestionsContent, label: 'Interview Q&A', icon: HelpCircle },
  }

  const currentContent = pages[currentPage].content

  // Extract headings for TOC
  useEffect(() => {
    if (currentPage === 'interview') {
      setHeadings([])
      return
    }
    
    const contentWithoutCodeBlocks = currentContent.replace(/```[\s\S]*?```/g, '')
    const headingMatches = [...contentWithoutCodeBlocks.matchAll(/^(#{1,3})\s+(.+)$/gm)]
    const extractedHeadings = []
    let currentChapter = null

    headingMatches.forEach((match) => {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      
      const item = { id, title: text, level, children: [] }
      
      if (level <= 2) {
        extractedHeadings.push(item)
        currentChapter = item
      } else if (level === 3) {
        if (currentChapter) {
          currentChapter.children.push(item)
        } else {
          extractedHeadings.push(item)
        }
      }
    })
    setHeadings(extractedHeadings)
    if (extractedHeadings.length > 0) {
      setOpenSections([extractedHeadings[0].id])
    }
  }, [currentContent, currentPage])

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('gitnotes-theme')
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gitnotes-theme', theme)
  }, [theme])

  // Scroll progress + scroll-to-top visibility (throttled with rAF)
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        setScrollProgress(progress)
        setShowScrollTop(scrollTop > 400)
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut: Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearch(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const contentWithoutCode = currentContent.replace(/```[\s\S]*?```/g, '')
    const matches = [...contentWithoutCode.matchAll(/^(#{1,3})\s+(.+)$/gm)]
    
    const results = matches
      .filter(m => m[2].toLowerCase().includes(query))
      .map(m => ({
        level: m[1].length,
        title: m[2],
        id: m[2].toLowerCase().replace(/[^\w]+/g, '-')
      }))
      .slice(0, 15)
    
    setSearchResults(results)
    setShowSearch(results.length > 0 || searchQuery.length > 0)
  }, [searchQuery, currentContent])

  // Intersection Observer for scroll-spy
  const extractText = (children) => {
    if (typeof children === 'string' || typeof children === 'number') return String(children)
    if (Array.isArray(children)) return children.map(extractText).join('')
    if (children?.props?.children) return extractText(children.props.children)
    return ''
  }

  useEffect(() => {
    const handleObserver = (entries) => {
      let currentActiveId = null
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentActiveId = entry.target.id
        }
      })
      if (currentActiveId) {
        setActiveSection(currentActiveId)
        const parent = headings.find(h => h.children.some(c => c.id === currentActiveId))
        if (parent) {
          setOpenSections(prev => prev.includes(parent.id) ? prev : [...prev, parent.id])
        }
      }
    }

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    })

    const contentArea = document.querySelector('.content-area')
    const observedElements = new Set()

    const observeHeadings = () => {
      const elements = document.querySelectorAll('.heading-observe')
      elements.forEach((elem) => {
        if (!observedElements.has(elem)) {
          observer.observe(elem)
          observedElements.add(elem)
        }
      })
    }

    // Use MutationObserver only briefly to catch initial render, then disconnect
    const mutationObserver = new MutationObserver(observeHeadings)
    if (contentArea) {
      mutationObserver.observe(contentArea, { childList: true, subtree: true })
      observeHeadings()
      // Disconnect MutationObserver after content settles (500ms)
      setTimeout(() => {
        mutationObserver.disconnect()
        observeHeadings() // One final pass
      }, 500)
    }

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [currentContent, headings])

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('highlight-pulse')
      setTimeout(() => el.classList.remove('highlight-pulse'), 1500)
    }
    setSearchQuery('')
    setShowSearch(false)
    if (window.innerWidth < 768) setMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Markdown rendering components — memoized to avoid recreating on every render
  const components = useMemo(() => ({
    h1: ({ node: _node, children, ...props }) => {
      const text = extractText(children).trim()
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      return <h1 id={id} className="scroll-mt-24 heading-observe" {...props}>{children}</h1>
    },
    h2: ({ node: _node, children, ...props }) => {
      const text = extractText(children).trim()
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      if (text.includes("How Git Works Internally")) {
        return (
          <div id={id} className="scroll-mt-24 heading-observe">
            <h2 {...props}>{children}</h2>
            <Workflow />
          </div>
        )
      }
      return <h2 id={id} className="scroll-mt-24 heading-observe" {...props}>{children}</h2>
    },
    h3: ({ node: _node, children, ...props }) => {
      const text = extractText(children).trim()
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      return <h3 id={id} className="mt-6 mb-3 scroll-mt-24 heading-observe" {...props}>{children}</h3>
    },
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      if (!inline && match) {
        return <CodeBlock className={className}>{children}</CodeBlock>
      }
      return <code className={className} {...props}>{children}</code>
    },
    pre: ({ children }) => {
      // If the child is already a CodeBlock, just render it directly
      if (children?.type === CodeBlock) return children
      return <pre>{children}</pre>
    },
    strong: ({ node, ...props }) => <strong {...props} />,
    em: ({ node, ...props }) => <em {...props} />,
    // Plain blockquote — no Framer Motion animation (was causing massive perf hit
    // by creating an IntersectionObserver for EVERY blockquote on the page)
    blockquote: ({ node, ...props }) => <blockquote {...props} />,
  }), [])

  return (
    <div className="app-container">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <GitBranch size={26} />
          <span>DevMastery</span>
        </div>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Center section: nav + search */}
        <div className={`header-center ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            {Object.entries(pages).map(([key, page]) => {
              const Icon = page.icon
              return (
                <button
                  key={key}
                  className={`nav-btn ${currentPage === key ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage(key)
                    setSearchQuery('')
                    window.scrollTo({ top: 0 })
                  }}
                >
                  <Icon size={15} />
                  {page.label}
                </button>
              )
            })}
          </div>

          {/* Search bar */}
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
              <Search size={15} />
              <input
                ref={searchInputRef}
                className="search-input"
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery) setShowSearch(true) }}
              />
              <span className="search-shortcut">Ctrl+K</span>
            </div>

            {/* Search results dropdown */}
            {showSearch && (
              <div className="search-results fade-in">
                {searchResults.length > 0 ? (
                  searchResults.map((r, i) => (
                    <div
                      key={i}
                      className="search-result-item"
                      onClick={() => scrollToSection(r.id)}
                    >
                      <span className="result-level">H{r.level}</span>
                      <span>{r.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Theme selector */}
          <select
            className="theme-selector"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="dark">🌙 Dark</option>
            <option value="light">☀️ Light</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="dracula">🧛 Dracula</option>
          </select>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">

        {/* Sidebar */}
        {currentPage !== 'interview' && (
          <>
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.div
                  className="sidebar-container"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <aside className="sidebar">
                    <div className="sidebar-header">📑 Contents</div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {headings.map((chapter) => {
                        const isOpen = openSections.includes(chapter.id)
                        const isChapterActive = activeSection === chapter.id
                        return (
                          <div key={chapter.id}>
                            <button
                              onClick={() => {
                                toggleSection(chapter.id)
                                scrollToSection(chapter.id)
                              }}
                              className={`toc-chapter-btn ${isChapterActive ? 'active' : ''}`}
                            >
                              <span style={{ flex: 1 }}>{chapter.title}</span>
                              {chapter.children.length > 0 && (
                                <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                                  <ChevronRight size={14} />
                                </span>
                              )}
                            </button>

                            {isOpen && chapter.children.length > 0 && (
                              <div className="toc-children">
                                {chapter.children.map(sub => (
                                  <a
                                    key={sub.id}
                                    href={`#${sub.id}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      scrollToSection(sub.id)
                                    }}
                                    className={`toc-sub-link ${activeSection === sub.id ? 'active' : ''}`}
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

                  {/* Sidebar hide button (desktop) */}
                  <button
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarOpen(false)}
                    title="Hide contents"
                    style={{ display: window.innerWidth > 1024 ? 'flex' : 'none' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating show button */}
            {!sidebarOpen && window.innerWidth > 1024 && (
              <button
                className="sidebar-toggle-btn floating"
                onClick={() => setSidebarOpen(true)}
                title="Show contents"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </>
        )}

        {/* Content Area */}
        <motion.div
          className="content-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          key={currentPage}
        >
          {currentPage === 'interview' ? (
            <InterviewPage content={currentContent} />
          ) : (
            <ReactMarkdown components={components}>
              {currentContent}
            </ReactMarkdown>
          )}
        </motion.div>
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

export default App
