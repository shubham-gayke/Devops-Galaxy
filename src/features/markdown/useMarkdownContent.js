import { useState, useEffect } from 'react'
import { markdownCache } from './markdownCache'

/**
 * Fetches markdown content from public/content/{page}.md exactly once.
 * Subsequent calls for the same page return instantly from the module-level cache.
 *
 * @param {string} page - e.g. 'git', 'aws', 'terraform'
 * @returns {{ content: string|null, loading: boolean, error: Error|null }}
 */
export function useMarkdownContent(page) {
  const url = `/content/${page}.md`
  const cached = markdownCache.get(url)

  const [state, setState] = useState({
    content: cached?.content ?? null,
    loading: !cached,
    error: null,
  })

  useEffect(() => {
    // Already cached — no fetch needed
    if (markdownCache.has(url)) {
      const { content } = markdownCache.get(url)
      setState({ content, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    Promise.all([
      fetch(url).then(r => {
        if (!r.ok) throw new Error(`Failed to load ${url}: ${r.statusText}`)
        return r.text()
      }),
      // Enforce a minimum 2-second loading time so the user can enjoy the cool animation
      new Promise(resolve => setTimeout(resolve, 2000))
    ])
      .then(([content]) => {
        if (cancelled) return
        markdownCache.set(url, { content })
        setState({ content, loading: false, error: null })
      })
      .catch(error => {
        if (cancelled) return
        console.error('[useMarkdownContent]', error)
        setState({ content: null, loading: false, error })
      })

    return () => { cancelled = true }
  }, [url])

  return state
}
