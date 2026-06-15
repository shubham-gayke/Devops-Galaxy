import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from '../../components/CodeBlock'
import WorkflowDiagram from '../diagrams/WorkflowDiagram'
import IAMDiagram from '../diagrams/IAMDiagram'
import VPCDiagram from '../diagrams/VPCDiagram'
import EC2Diagram from '../diagrams/EC2Diagram'
import ServiceDiagram from '../diagrams/ServiceDiagram'

// ======================== HELPERS ========================

const extractText = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return ''
}

const stripEmoji = (text) =>
  text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF\u2B00-\u2BFF\u3000-\u303F\uFE00-\uFEFF\u200D]/g, '')
    .replace(/  +/g, ' ')
    .trim()

const makeId = (text) => text.toLowerCase().replace(/[^\w]+/g, '-')

// node.position.start.line (from mdast) is always unique per heading —
// appending it eliminates duplicate IDs when two headings share the same text.
const makeUniqueId = (text, node) => {
  const base = makeId(text)
  const line = node?.position?.start?.line
  return line != null ? `${base}-L${line}` : base
}

// ======================== HEADING RENDERERS ========================

const H1 = ({ node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeUniqueId(text, node)
  return (
    <h1 id={id} className="heading-observe scroll-mt-24" {...props}>
      {text}
    </h1>
  )
}

const H2 = ({ node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeUniqueId(text, node)

  if (text.includes('Cloud Service Models')) {
    return (
      <div id={id} className="heading-observe scroll-mt-24">
        <h2 {...props}>{text}</h2>
        <ServiceDiagram />
      </div>
    )
  }

  if (text.includes('How Git Works Internally')) {
    return (
      <div id={id} className="heading-observe scroll-mt-24">
        <h2 {...props}>{text}</h2>
        <WorkflowDiagram />
      </div>
    )
  }

  return (
    <h2 id={id} className="heading-observe scroll-mt-24" {...props}>
      {text}
    </h2>
  )
}

const H3 = ({ node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeUniqueId(text, node)

  if (text.includes('Architecture Diagram - IAM')) {
    return (
      <div id={id} className="heading-observe scroll-mt-24">
        <h3 {...props}>{text}</h3>
        <IAMDiagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - EC2')) {
    return (
      <div id={id} className="heading-observe scroll-mt-24">
        <h3 {...props}>{text}</h3>
        <EC2Diagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - VPC')) {
    return (
      <div id={id} className="heading-observe scroll-mt-24">
        <h3 {...props}>{text}</h3>
        <VPCDiagram />
      </div>
    )
  }

  return (
    <h3 id={id} className="heading-observe scroll-mt-24 mt-6 mb-3" {...props}>
      {text}
    </h3>
  )
}

const Code = ({ node: _node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  if (!inline && match) {
    return <CodeBlock className={className}>{children}</CodeBlock>
  }
  return <code className={className} {...props}>{children}</code>
}

const Pre = ({ children }) => {
  if (children?.type === CodeBlock) return children
  return <pre>{children}</pre>
}

// ======================== MAIN RENDERER ========================

/**
 * Memoized ReactMarkdown wrapper.
 * - `COMPONENTS` map is defined at module level — never recreated on re-renders.
 * - Heading IDs include line numbers from the mdast to prevent DOM ID duplicates.
 * - All diagrams use LazyDiagram (Intersection Observer + React.lazy).
 */
const COMPONENTS = {
  h1: H1,
  h2: H2,
  h3: H3,
  code: Code,
  pre: Pre,
  strong: ({ node: _node, ...props }) => <strong {...props} />,
  em: ({ node: _node, ...props }) => <em {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} />,
}

const MarkdownRenderer = React.memo(function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {content}
    </ReactMarkdown>
  )
})

export default MarkdownRenderer
