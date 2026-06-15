import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMarkdownContent } from '../features/markdown/useMarkdownContent'
import { useToc } from '../features/toc/useToc'
import MarkdownRenderer from '../features/markdown/MarkdownRenderer'
import PageSkeleton from '../components/Layout/PageSkeleton'
import Lightbox from '../components/Lightbox'

const PAGE_KEY = 'terraform'

export default function TerraformPage() {
  const { setLayoutCtx } = useOutletContext()
  const { content, loading, error } = useMarkdownContent(PAGE_KEY)
  const headings = useToc(content, PAGE_KEY)

  useEffect(() => {
    setLayoutCtx({
      content,
      headings,
      pageKey: PAGE_KEY,
      showSidebar: true,
    })
  }, [content, headings, setLayoutCtx])

  if (loading) return <PageSkeleton />
  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--danger)' }}>
      Failed to load Terraform notes. Please refresh the page.
    </div>
  )

  return (
    <>
      <MarkdownRenderer content={content} />
      <Lightbox />
    </>
  )
}
