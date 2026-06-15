import React, { useState, Suspense, lazy } from 'react'
import { Copy, Check } from 'lucide-react'

// Lazy load SyntaxHighlighter — the Prism bundle is ~150 KB and only needed when
// a code block is visible on screen. This eliminates it from the initial parse cost.
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
)

// The style object is small (~3KB) — it can be imported eagerly since it's just a
// plain JS object, not a heavy module. The visual styles need to be available
// synchronously to avoid a flash of unstyled code.
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = React.memo(function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Inline code (no language match) — lightweight, no SyntaxHighlighter needed
  if (!match) {
    return (
      <code
        className={className}
        style={{
          background: 'var(--code-inline-bg, var(--bg-card))',
          padding: '0.2em 0.4em',
          borderRadius: '4px',
          fontSize: '0.9em',
          fontFamily: '"Fira Code", "Consolas", monospace',
          color: 'var(--accent)',
          border: '1px solid var(--border)',
        }}
      >
        {children}
      </code>
    )
  }

  return (
    <div
      className="code-block-wrapper"
      style={{
        position: 'relative',
        marginBottom: '1.5rem',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header bar */}
      <div
        className="code-block-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span
          className="code-lang-badge"
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.25rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {language}
        </span>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>

      {/* Code content — Suspense shows a simple pre-tag while the highlighter chunk loads */}
      <Suspense
        fallback={
          <pre
            style={{
              margin: 0,
              padding: '1.5rem 1.25rem',
              background: '#1e1e1e',
              color: '#d4d4d4',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              fontFamily: '"Fira Code", "Consolas", monospace',
              overflowX: 'auto',
            }}
          >
            {code}
          </pre>
        }
      >
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="pre"
          customStyle={{
            margin: 0,
            padding: '1.5rem 1.25rem',
            background: '#1e1e1e',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            fontFamily: '"Fira Code", "Consolas", monospace',
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  )
})

export default CodeBlock
