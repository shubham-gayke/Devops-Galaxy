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
 * Supports 3-level nesting for numbered sections (e.g. Chapter 3 → 3.1 IAM → topics).
 * Numbered h2 sections like "3.1 IAM" become children of the current chapter,
 * and their h3 topics become children of the service node (not the chapter).
 *
 * @param {string|null} content - Raw markdown string
 * @param {string} pageKey - Unique key for this page (e.g. 'git', 'aws')
 * @returns {{ id: string, title: string, level: number, children: object[] }[]}
 */
export function useToc(content, pageKey) {
  return useMemo(() => {
    if (!content) return []

    // Bump cache version to force refresh after structure changes
    const cacheKey = `toc:${pageKey}:v6`
    if (tocCache.has(cacheKey)) return tocCache.get(cacheKey)

    // Strip fenced code blocks to avoid matching code content as headings
    const stripped = content.replace(/```[\s\S]*?```/g, '')
    const matches = [...stripped.matchAll(/^(#{1,3})\s+(.+)$/gm)]

    const headings = []
    let currentChapter = null
    // Track the current numbered service section (e.g. "3.1 IAM") so
    // level-3 headings inside it become children of the service, not the chapter.
    let currentService = null

    matches.forEach(match => {
      const level = match[1].length
      const text = stripEmoji(match[2])
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
      
      // Check if this is a numbered section like "3.1 IAM", "3.2 EC2", etc.
      const isNumberedSection = /^\d+\.\d+/.test(text)
      
      const item = { id, title: text, level, children: [] }

      if (level === 2) {
        if (isNumberedSection && currentChapter) {
          // Numbered sub-section → child of the current chapter, becomes the active service
          currentChapter.children.push(item)
          currentService = item
        } else {
          // Regular chapter heading
          headings.push(item)
          currentChapter = item
          currentService = null // reset service when entering a new chapter
        }
      } else if (level === 3) {
        if (currentService) {
          // Inside a numbered service section → nest under the service
          currentService.children.push(item)
        } else if (currentChapter) {
          // Regular chapter child (no numbered service parent)
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
