// Module-level cache: pageKey → HeadingItem[]
// TOC is parsed once per page and reused on every subsequent render.
export const tocCache = new Map()
