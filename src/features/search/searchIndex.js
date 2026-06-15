// Module-level cache: pageKey → SearchEntry[]
// The heading index is built once when content first loads, then reused on every
// subsequent search keystroke — eliminating repeated O(n) regex scans.
const searchIndexCache = new Map()

/**
 * Build (or return cached) a flat heading index for the given page content.
 * @param {string} content - Raw markdown text
 * @param {string} pageKey - Unique page identifier (e.g. 'git', 'aws')
 * @returns {{ level: number, title: string, id: string }[]}
 */
export function buildSearchIndex(content, pageKey) {
  if (searchIndexCache.has(pageKey)) return searchIndexCache.get(pageKey)

  // Strip fenced code blocks first so code content doesn't pollute heading search
  const stripped = content.replace(/```[\s\S]*?```/g, '')
  const matches = [...stripped.matchAll(/^(#{1,3})\s+(.+)$/gm)]
  const index = matches.map(m => ({
    level: m[1].length,
    title: m[2].trim(),
    id: m[2].trim().toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, ''),
  }))

  searchIndexCache.set(pageKey, index)
  return index
}
