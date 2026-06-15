import { useState, useEffect } from 'react'

/**
 * Manages theme state with localStorage persistence.
 * Also syncs the `data-theme` attribute on <html> for CSS variable scoping.
 *
 * @returns {{ theme: string, setTheme: Function }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gitnotes-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gitnotes-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
