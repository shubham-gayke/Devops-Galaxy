// Module-level cache: pageKey → HeadingItem[]
// TOC is parsed once per page and reused on every subsequent render.
export const tocCache = new Map()

// Helper to clear cache (useful during development or when content structure changes)
export const clearTocCache = (pageKey) => {
  if (pageKey) {
    tocCache.delete(`toc:${pageKey}`)
  } else {
    tocCache.clear()
  }
}
