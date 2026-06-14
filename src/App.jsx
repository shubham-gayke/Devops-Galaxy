import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// Lazy load SyntaxHighlighter to improve initial load time
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(m => ({ default: m.Prism })))
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { BookOpen, GitBranch, Cloud, Server, HelpCircle, Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, ArrowUp, Copy, Check, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Workflow from './Workflow'
import ServiceModelDiagram from './ServiceModelDiagram'
import VPCArchitectureDiagram from './VPCArchitectureDiagram'

// Import markdown files
import gitNotesContent from './Git_GitHub_Complete_Notes.md?raw'
import terraformNotesContent from './Terraform_Complete_Notes.md?raw'
import ansibleNotesContent from './Ansible_Complete_Notes.md?raw'
import awsNotesContent from './AWS_Complete_Notes.md?raw'
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
    return <code className={className} style={{
      background: 'var(--code-inline-bg)',
      padding: '0.2em 0.4em',
      borderRadius: '4px',
      fontSize: '0.9em',
      fontFamily: '"Fira Code", "Consolas", monospace',
      color: 'var(--accent)'
    }}>{children}</code>
  }

  return (
    <div className="code-block-wrapper" style={{ 
      position: 'relative',
      marginBottom: '1.5rem',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid var(--border)'
    }}>
      <div className="code-block-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span className="code-lang-badge" style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'white',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>{language}</span>
        <button 
          className={`copy-btn ${copied ? 'copied' : ''}`} 
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <Suspense fallback={<pre style={{ margin: 0, padding: '1.5rem 1.25rem', background: '#1e1e1e', color: '#d4d4d4', fontSize: '0.9rem', lineHeight: '1.6', fontFamily: '"Fira Code", "Consolas", monospace' }}>Loading code...</pre>}>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="pre"
          customStyle={{ 
            margin: 0, 
            padding: '1.5rem 1.25rem', 
            background: '#1e1e1e',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            fontFamily: '"Fira Code", "Consolas", monospace'
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </Suspense>
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.answer}</ReactMarkdown>
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

// ======================== HELPER FUNCTIONS ========================
const extractText = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return ''
}

const pages = {
  git: { content: gitNotesContent, label: 'Git & GitHub', icon: GitBranch },
  terraform: { content: terraformNotesContent, label: 'Terraform', icon: Cloud },
  ansible: { content: ansibleNotesContent, label: 'Ansible', icon: Server },
  aws: { content: awsNotesContent, label: 'AWS Cloud', icon: Cloud },
  interview: { content: interviewQuestionsContent, label: 'Interview Q&A', icon: HelpCircle },
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
  const [{ scrollProgress, showScrollTop }, setScrollState] = useState({ scrollProgress: 0, showScrollTop: false })
  const [lightboxImage, setLightboxImage] = useState(null)
  const [imageZoom, setImageZoom] = useState(1)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const currentContent = pages[currentPage].content

  // Cache stripped content to avoid running heavy regex multiple times
  const strippedContent = useMemo(() => {
    if (currentPage === 'interview') return ''
    return currentContent.replace(/```[\s\S]*?```/g, '')
  }, [currentContent, currentPage])

  // Extract headings for TOC
  useEffect(() => {
    if (currentPage === 'interview') {
      setHeadings([])
      return
    }
    
    let isCancelled = false
    
    setTimeout(() => {
      if (isCancelled) return
      
      const headingMatches = [...strippedContent.matchAll(/^(#{1,3})\s+(.+)$/gm)]
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
    }, 0)
    
    return () => { isCancelled = true }
  }, [strippedContent, currentPage])

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
        setScrollState({ scrollProgress: progress, showScrollTop: scrollTop > 400 })
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
    
    const timer = setTimeout(() => {
      const matches = [...strippedContent.matchAll(/^(#{1,3})\s+(.+)$/gm)]
      
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
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery, strippedContent])

  // Intersection Observer for scroll-spy - OPTIMIZED
  useEffect(() => {
    // Throttle observer updates
    let timeoutId = null
    
    const handleObserver = (entries) => {
      if (timeoutId) return
      
      timeoutId = setTimeout(() => {
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
        timeoutId = null
      }, 150)
    }

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    })

    // Observe headings only after content loads
    const observeHeadings = () => {
      const elements = document.querySelectorAll('.heading-observe')
      elements.forEach(elem => observer.observe(elem))
    }

    // Delay initial observation
    const initTimeout = setTimeout(observeHeadings, 300)

    return () => {
      clearTimeout(initTimeout)
      if (timeoutId) clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [currentContent, headings, currentPage])

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

  // Image zoom/lightbox functions
  const openLightbox = (imageSrc) => {
    setLightboxImage(imageSrc)
    setImageZoom(1)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setImageZoom(1)
    document.body.style.overflow = 'auto'
  }

  const zoomIn = () => {
    setImageZoom(prev => Math.min(parseFloat((prev + 0.25).toFixed(2)), 4))
  }

  const zoomOut = () => {
    setImageZoom(prev => Math.max(parseFloat((prev - 0.25).toFixed(2)), 0.25))
  }

  const resetZoom = () => {
    setImageZoom(1)
  }

  // Close lightbox on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && lightboxImage) {
        closeLightbox()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [lightboxImage])

  // Mouse wheel zoom in lightbox
  useEffect(() => {
    if (!lightboxImage) return
    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.1 : -0.1
      setImageZoom(prev => {
        const next = parseFloat((prev + delta).toFixed(2))
        return Math.min(Math.max(next, 0.25), 4)
      })
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [lightboxImage])

  // Handle image clicks to open lightbox
  useEffect(() => {
    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.content-area')) {
        e.preventDefault()
        openLightbox(e.target.src)
      }
    }
    document.addEventListener('click', handleImageClick)
    return () => document.removeEventListener('click', handleImageClick)
  }, [])

  // Track which service section we're in
  
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
      
      // Insert Service Model Diagram after Cloud Service Models heading
      if (text.includes("Cloud Service Models")) {
        return (
          <div id={id} className="scroll-mt-24 heading-observe">
            <h2 {...props}>{children}</h2>
            <ServiceModelDiagram />
          </div>
        )
      }
      
      if (text.includes("How Git Works Internally")) {
        return (
          <div id={id} className="scroll-mt-24 heading-observe">
            <h2 {...props}>{children}</h2>
            <Workflow />
          </div>
        )
      }

      if (text.includes("Architecture Diagram - VPC")) {
        return (
          <div id={id} className="scroll-mt-24 heading-observe">
            <h2 {...props}>{children}</h2>
            <VPCArchitectureDiagram />
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
      if (children?.type === CodeBlock) return children
      return <pre>{children}</pre>
    },
    strong: ({ node, ...props }) => <strong {...props} />,
    em: ({ node, ...props }) => <em {...props} />,
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
            <option value="ocean">🌊 Ocean</option>
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
                  animate={{ width: 220, opacity: 1 }}
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
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
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

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="image-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="image-lightbox-close" onClick={closeLightbox} title="Close (ESC)">
              <X size={24} />
            </button>

            <img
              src={lightboxImage}
              alt="Zoomed"
              style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="image-lightbox-controls" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-control-btn" onClick={zoomOut} title="Zoom Out (scroll down)">
                −
              </button>
              <button className="lightbox-control-btn reset" onClick={resetZoom} title="Reset Zoom">
                ⟲
              </button>
              <span className="lightbox-zoom-label">{Math.round(imageZoom * 100)}%</span>
              <button className="lightbox-control-btn" onClick={zoomIn} title="Zoom In (scroll up)">
                +
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
