// Module-level cache: URL → { content: string }
// This Map lives for the lifetime of the browser tab session.
// It is never reset on re-renders, so content is fetched exactly once per page.
export const markdownCache = new Map()
