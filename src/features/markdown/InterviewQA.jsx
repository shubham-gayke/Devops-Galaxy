import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Parses the interview Q&A markdown format and renders an accordion UI.
 * Parsing is memoized — runs once when content first loads, never again.
 *
 * @param {{ content: string }} props
 */
export default function InterviewQA({ content }) {
  const [openQuestions, setOpenQuestions] = useState(new Set())
  const [expandAll, setExpandAll] = useState(false)

  const sections = useMemo(() => {
    if (!content) return []
    const result = []
    let currentSection = null
    // Normalize Windows CRLF → LF so the regex anchors work correctly
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      if (line.startsWith('## ')) {
        currentSection = { title: line.replace('## ', '').trim(), questions: [] }
        result.push(currentSection)
        i++
        continue
      }

      // \r? at the end handles any remaining carriage returns after CRLF normalization
      const qMatch = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\r?$/)
      if (qMatch && currentSection) {
        const qNum = qMatch[1]
        const qText = qMatch[2]
        let answer = ''
        i++

        while (i < lines.length) {
          const nextLine = lines[i]
          if (nextLine.match(/^\*\*\d+\.\s/) || nextLine.startsWith('## ') || nextLine.startsWith('# ')) break
          if (nextLine === '---') { i++; continue }
          answer += nextLine + '\n'
          i++
        }

        currentSection.questions.push({ num: qNum, question: qText, answer: answer.trim() })
        continue
      }

      i++
    }

    return result
  }, [content])

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (expandAll) {
      setOpenQuestions(new Set())
    } else {
      const allIds = new Set()
      sections.forEach(s => s.questions.forEach(q => allIds.add(q.num)))
      setOpenQuestions(allIds)
    }
    setExpandAll(e => !e)
  }

  return (
    <div>
      <h1>Terraform Interview Questions</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        100 questions from beginner to advanced — click any question to reveal the answer.
      </p>

      <button
        onClick={toggleAll}
        style={{
          background: 'var(--bg-card)',
          color: 'var(--accent)',
          border: '1px solid var(--border)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
        }}
      >
        {expandAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expandAll ? 'Collapse All' : 'Expand All'}
      </button>

      {sections.map((section, si) => (
        <div key={si}>
          <div className="qa-section-title">{section.title}</div>
          {section.questions.map(q => {
            const isOpen = openQuestions.has(q.num)
            // Use section index + question number to guarantee unique keys across sections
            const uniqueKey = `${si}-${q.num}`
            return (
              <div className="qa-item" key={uniqueKey}>
                <button className="qa-question" onClick={() => toggleQuestion(q.num)}>
                  <span className="q-number">Q{q.num}</span>
                  <span style={{ flex: 1 }}>{q.question}</span>
                  <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="qa-answer">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {q.answer}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
