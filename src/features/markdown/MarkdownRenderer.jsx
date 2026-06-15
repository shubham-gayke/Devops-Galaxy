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

// IMPORTANT: This slug function MUST match the one in useToc.js exactly.
// Both use: text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
// If you change one, change the other. The sidebar, scroll spy, and content
// TOC links all rely on ID consistency between this renderer and the TOC cache.
const makeId = (text) => text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')

// ======================== HEADING RENDERERS ========================

const H1 = ({ node: _node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeId(text)
  return (
    <h1 id={id} className="heading-observe" {...props}>
      {text}
    </h1>
  )
}

const H2 = ({ node: _node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeId(text)

  if (text.includes('Cloud Service Models')) {
    return (
      <div id={id} className="heading-observe">
        <h2 {...props}>{text}</h2>
        <ServiceDiagram />
      </div>
    )
  }

  if (text.includes('How Git Works Internally')) {
    return (
      <div id={id} className="heading-observe">
        <h2 {...props}>{text}</h2>
        <WorkflowDiagram />
      </div>
    )
  }

  return (
    <h2 id={id} className="heading-observe" {...props}>
      {text}
    </h2>
  )
}

const H3 = ({ node: _node, children, ...props }) => {
  const text = stripEmoji(extractText(children).trim())
  const id = makeId(text)

  if (text.includes('Architecture Diagram - IAM')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <IAMDiagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - EC2')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <EC2Diagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - VPC')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <VPCDiagram />
      </div>
    )
  }

  return (
    <h3 id={id} className="heading-observe" {...props}>
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

// Handle in-page #hash links: React Router intercepts normal <a> clicks,
// so we need to manually perform the smooth scroll for anchor links.
const Anchor = ({ node: _node, href, children, ...props }) => {
  if (href && href.startsWith('#')) {
    const handleClick = (e) => {
      e.preventDefault()
      const targetId = href.slice(1) // remove the #
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('highlight-pulse')
        setTimeout(() => el.classList.remove('highlight-pulse'), 1500)
      }
    }
    return (
      <a href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    )
  }
  // External links open in new tab
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

// ======================== MAIN RENDERER ========================

/**
 * Memoized ReactMarkdown wrapper.
 * - `COMPONENTS` map is defined at module level — never recreated on re-renders.
 * - Heading IDs use the same slug function as useToc.js, ensuring sidebar/scrollspy/
 *   content links all point to matching DOM elements.
 * - The `a` override intercepts hash links for smooth scrolling instead of
 *   letting React Router handle them as route navigation.
 */
const COMPONENTS = {
  h1: H1,
  h2: H2,
  h3: H3,
  code: Code,
  pre: Pre,
  a: Anchor,
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
