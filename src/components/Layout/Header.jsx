import React, { useRef, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GitBranch, Cloud, Server, HelpCircle, Search, Menu, X } from 'lucide-react'
import { useSearch } from '../../features/search/useSearch'

const NAV_ITEMS = [
  { path: '/git',       label: 'Git & GitHub', icon: GitBranch },
  { path: '/terraform', label: 'Terraform',    icon: Cloud     },
  { path: '/ansible',   label: 'Ansible',      icon: Server    },
  { path: '/aws',       label: 'AWS Cloud',    icon: Cloud     },
  { path: '/interview', label: 'Interview Q&A',icon: HelpCircle},
]

/**
 * Top navigation header with:
 * - Logo + nav links (React Router Links for instant client-side navigation)
 * - Global search bar with keyboard shortcut (Ctrl+K)
 * - Theme selector
 * - Mobile hamburger menu
 *
 * @param {{ content: string|null, pageKey: string, scrollProgress: number, theme: string, onThemeChange: Function }} props
 */
export default function Header({ content, pageKey, scrollProgress, theme, onThemeChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const { query, setQuery, results, showResults } = useSearch(content, pageKey)

  // Ctrl+K opens search, Escape closes it
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') setQuery('')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setQuery])

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setQuery])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('highlight-pulse')
      setTimeout(() => el.classList.remove('highlight-pulse'), 1500)
    }
    setQuery('')
    setMobileOpen(false)
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <GitBranch size={26} />
          <span>DevMastery</span>
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Nav + search center section */}
        <div className={`header-center ${mobileOpen ? 'mobile-open' : ''}`}>
          <nav className="nav-links">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                className={`nav-btn ${location.pathname === path ? 'active' : ''}`}
                onClick={() => {
                  navigate(path)
                  window.scrollTo({ top: 0 })
                  setMobileOpen(false)
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
              <Search size={15} />
              <input
                ref={searchInputRef}
                className="search-input"
                type="text"
                placeholder="Search headings…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => {/* keep results visible on focus */}}
              />
              <span className="search-shortcut">Ctrl+K</span>
            </div>

            {showResults && (
              <div className="search-results fade-in">
                {results.length > 0 ? (
                  results.map((r, i) => (
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
            onChange={e => onThemeChange(e.target.value)}
          >
            <option value="dark">🌙 Dark</option>
            <option value="ocean">🌊 Ocean</option>
          </select>
        </div>
      </header>
    </>
  )
}
