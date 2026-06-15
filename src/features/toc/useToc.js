import { useMemo } from 'react'
import { tocCache } from './tocCache'

// Strip emoji and decoration characters from heading text
const stripEmoji = (text) =>
  text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF\u2B00-\u2BFF\u3000-\u303F\uFE00-\uFEFF\u200D]/g, '')
    .replace(/  +/g, ' ')
    .trim()

/**
 * Extracts and caches the heading hierarchy from markdown content.
 * Parsing runs exactly once per page (cached in the module-level tocCache Map).
 *
 * @param {string|null} content - Raw markdown string
 * @param {string} pageKey - Unique key for this page (e.g. 'git', 'aws')
 * @returns {{ id: string, title: string, level: number, children: object[] }[]}
 */
export function useToc(content, pageKey) {
  return useMemo(() => {
    if (!content) return []

    const cacheKey = `toc:${pageKey}`
    if (tocCache.has(cacheKey)) return tocCache.get(cacheKey)

    // Strip fenced code blocks to avoid matching code content as headings
    const stripped = content.replace(/```[\s\S]*?```/g, '')
    const matches = [...stripped.matchAll(/^(#{1,3})\s+(.+)$/gm)]

    const headings = []
    let currentChapter = null

    matches.forEach(match => {
      const level = match[1].length
      const text = stripEmoji(match[2])
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      const item = { id, title: text, level, children: [] }

      if (level <= 2) {
        headings.push(item)
        currentChapter = item
      } else if (level === 3) {
        if (currentChapter) {
          currentChapter.children.push(item)
        } else {
          headings.push(item)
        }
      }
    })

    tocCache.set(cacheKey, headings)
    return headings
  }, [content, pageKey])
}
