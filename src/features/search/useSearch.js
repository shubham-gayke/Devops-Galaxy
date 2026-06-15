import { useState, useEffect, useMemo } from 'react'
import { buildSearchIndex } from './searchIndex'

/**
 * Search hook that builds a heading index once per page and filters it on each query.
 * No repeated regex scans — index is built once and reused via the module-level cache.
 *
 * @param {string|null} content - Raw markdown content
 * @param {string} pageKey - Page identifier used as the cache key
 * @returns {{ query: string, setQuery: Function, results: object[], showResults: boolean }}
 */
export function useSearch(content, pageKey) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  // Build index (or retrieve from cache) — synchronous, O(1) on subsequent calls
  const index = useMemo(() => {
    if (!content) return []
    return buildSearchIndex(content, pageKey)
  }, [content, pageKey])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    // 150ms debounce — filter is O(k) where k = index size (just heading strings)
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      setResults(
        index
          .filter(item => item.title.toLowerCase().includes(q))
          .slice(0, 15)
      )
    }, 150)

    return () => clearTimeout(t)
  }, [query, index])

  const showResults = query.length > 0

  return { query, setQuery, results, showResults }
}
