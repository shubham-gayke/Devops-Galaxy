import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMarkdownContent } from '../features/markdown/useMarkdownContent'
import InterviewQA from '../features/markdown/InterviewQA'
import PageSkeleton from '../components/Layout/PageSkeleton'

const PAGE_KEY = 'interview'

export default function InterviewPage() {
  const { setLayoutCtx } = useOutletContext()
  const { content, loading, error } = useMarkdownContent(PAGE_KEY)

  // Interview page has no sidebar TOC — it uses its own accordion structure
  useEffect(() => {
    setLayoutCtx({
      content,
      headings: [],
      pageKey: PAGE_KEY,
      showSidebar: false,
    })
  }, [content, setLayoutCtx])

  if (loading) return <PageSkeleton />
  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--danger)' }}>
      Failed to load Interview Q&A. Please refresh the page.
    </div>
  )

  return <InterviewQA content={content} />
}
