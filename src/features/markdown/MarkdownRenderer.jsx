import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from '../../components/CodeBlock'
import WorkflowDiagram from '../diagrams/WorkflowDiagram'
import IAMDiagram from '../diagrams/IAMDiagram'
import VPCDiagram from '../diagrams/VPCDiagram'
import EC2Diagram from '../diagrams/EC2Diagram'
import ServiceDiagram from '../diagrams/ServiceDiagram'
import S3Diagram from '../diagrams/S3Diagram'
import Route53Diagram from '../diagrams/Route53Diagram'
import ELBDiagram from '../diagrams/ELBDiagram'
import ASGDiagram from '../diagrams/ASGDiagram'

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

  if (text.includes('Architecture Diagram - S3')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <S3Diagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - Route 53')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <Route53Diagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - ELB')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <ELBDiagram />
      </div>
    )
  }

  if (text.includes('Architecture Diagram - ASG')) {
    return (
      <div id={id} className="heading-observe">
        <h3 {...props}>{text}</h3>
        <ASGDiagram />
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

const ASGProblemVisual = () => (
  <div className="md-visual-card asg-problem-visual">
    <div className="md-visual-header">
      <span className="md-visual-kicker">Capacity Planning</span>
      <strong>Fixed fleet problem</strong>
    </div>
    <div className="asg-load-row">
      <div>
        <span>Normal Load</span>
        <strong>10</strong>
        <small>instances needed</small>
      </div>
      <div>
        <span>Peak Load</span>
        <strong>50</strong>
        <small>instances needed</small>
      </div>
    </div>
    <div className="asg-problem-grid">
      <div className="asg-problem-panel">
        <span className="asg-panel-label">Provision 50 always</span>
        <strong>High waste</strong>
        <p>40 idle instances keep running during normal traffic.</p>
      </div>
      <div className="asg-problem-panel danger">
        <span className="asg-panel-label">Provision 10 always</span>
        <strong>High risk</strong>
        <p>The app is under-provisioned during peaks and can fail.</p>
      </div>
    </div>
  </div>
)

const ASGCoreVisual = () => (
  <div className="md-visual-card asg-core-visual">
    <div className="md-visual-header">
      <span className="md-visual-kicker">Architecture</span>
      <strong>Auto Scaling Group</strong>
    </div>
    <div className="asg-core-grid">
      <div className="asg-core-node blue">
        <span>Blueprint</span>
        <strong>Launch Template</strong>
        <small>AMI, instance type, SG, IAM role, user data</small>
      </div>
      <div className="asg-core-arrow">-&gt;</div>
      <div className="asg-core-node green">
        <span>Capacity</span>
        <strong>EC2 Instance Fleet</strong>
        <small>i-001, i-002, i-003...</small>
      </div>
      <div className="asg-core-node purple">
        <span>Decision rules</span>
        <strong>Scaling Policies</strong>
        <small>Target tracking, step, scheduled, predictive</small>
      </div>
      <div className="asg-core-arrow down">-&gt;</div>
      <div className="asg-core-node amber">
        <span>Safety loop</span>
        <strong>Health Checks</strong>
        <small>Replace unhealthy instances automatically</small>
      </div>
    </div>
    <div className="asg-capacity-pills">
      <span>Min: 2</span>
      <span>Desired: 4</span>
      <span>Max: 10</span>
    </div>
  </div>
)

const ASGLifecycleVisual = () => {
  const states = [
    ['Pending', 'Instance is being launched'],
    ['Pending:Wait', 'Lifecycle hook pauses for custom actions'],
    ['InService', 'Healthy and serving traffic'],
    ['Terminating', 'Marked for termination'],
  ]

  return (
    <div className="md-visual-card asg-lifecycle-visual">
      <div className="md-visual-header">
        <span className="md-visual-kicker">Lifecycle</span>
        <strong>ASG state transitions</strong>
      </div>
      <div className="asg-lifecycle-flow">
        {states.map(([name, desc], index) => (
          <React.Fragment key={name}>
            <div className="asg-life-state">
              <strong>{name}</strong>
              <small>{desc}</small>
            </div>
            {index < states.length - 1 && <span className="asg-life-arrow">-&gt;</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="asg-hook-row">
        <div>
          <span>Launch hook</span>
          <p>Install software, warm cache, register service discovery.</p>
        </div>
        <div>
          <span>Terminate hook</span>
          <p>Drain connections, flush logs, backup before shutdown.</p>
        </div>
      </div>
    </div>
  )
}

const ASGProductionArchitectureVisual = () => (
  <div className="md-visual-card asg-production-visual">
    <div className="md-visual-header">
      <span className="md-visual-kicker">Real Project</span>
      <strong>E-Commerce Production ASG Setup</strong>
    </div>
    <div className="asg-prod-flow">
      <div className="asg-prod-node edge">
        <span>Entry</span>
        <strong>Route 53</strong>
        <small>DNS for www.example.com</small>
      </div>
      <div className="asg-prod-node edge">
        <span>Edge</span>
        <strong>CloudFront + S3</strong>
        <small>CDN and static assets</small>
      </div>
      <div className="asg-prod-node alb">
        <span>Traffic</span>
        <strong>Application Load Balancer</strong>
        <small>Public HTTP/S entry point</small>
      </div>
    </div>
    <div className="asg-tier-grid">
      <div className="asg-tier-card">
        <span>Web Tier ASG</span>
        <strong>AZ-1a + AZ-1b</strong>
        <p>Min 4, desired 8, max 40. Target tracking keeps CPU near 60%.</p>
      </div>
      <div className="asg-tier-card">
        <span>App Tier ASG</span>
        <strong>Private app subnets</strong>
        <p>Min 2, desired 4, max 20. Scales by ALB requests per target.</p>
      </div>
      <div className="asg-tier-card data">
        <span>Managed Data Layer</span>
        <strong>RDS Multi-AZ + ElastiCache</strong>
        <p>Database is managed outside ASG; Redis keeps instances stateless.</p>
      </div>
    </div>
    <div className="asg-support-strip">
      <span>CloudWatch metrics and alarms</span>
      <span>SNS scale alerts</span>
      <span>Systems Manager patching</span>
      <span>Parameter Store config</span>
    </div>
  </div>
)

const ASGQuickRevisionVisual = () => {
  const sections = [
    ['What is ASG?', 'Automated EC2 fleet management: right size, right time. Min <= Desired <= Max.'],
    ['Launch Template', 'AMI, instance type, security group, IAM role, user data. Use versions instead of Launch Configurations.'],
    ['Scaling Policies', 'Target Tracking for simple production scaling; Step, Scheduled, and Predictive for specialized patterns.'],
    ['Health Checks', 'EC2 checks infrastructure; ELB checks the application. Grace period prevents boot loops.'],
    ['Lifecycle Hooks', 'Pause launch or termination so custom automation can run safely.'],
    ['Instance Refresh', 'Rolling AMI or launch template updates with warmup, health percentage, and checkpoints.'],
    ['ELB Integration', 'ASG auto-registers instances in target groups and respects connection draining.'],
    ['Multi-AZ', 'Spread instances across AZs and rebalance when capacity becomes uneven.'],
  ]

  return (
    <div className="md-visual-card asg-revision-visual">
      <div className="md-visual-header">
        <span className="md-visual-kicker">Quick Revision</span>
        <strong>AWS Auto Scaling Group</strong>
      </div>
      <div className="asg-revision-grid">
        {sections.map(([title, desc]) => (
          <div className="asg-revision-card" key={title}>
            <strong>{title}</strong>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const PlainCodeBlock = ({ code }) => {
  const trimmed = code.trim()
  const isAsciiDiagram =
    /[┌┐└┘├┤─│╔╗╚╝═║]/.test(trimmed) ||
    /(->|=>|→|│|└|┌)/.test(trimmed)

  if (/Fixed Fleet Problems:/i.test(trimmed)) return <ASGProblemVisual />
  if (/Auto Scaling Group/i.test(trimmed) && /Launch Template/i.test(trimmed) && /EC2 Instance Fleet/i.test(trimmed)) {
    return <ASGCoreVisual />
  }
  if (/ASG Lifecycle States/i.test(trimmed)) return <ASGLifecycleVisual />
  if (/PRODUCTION ARCHITECTURE/i.test(trimmed) && /Web Tier ASG/i.test(trimmed)) {
    return <ASGProductionArchitectureVisual />
  }
  if (/AWS AUTO SCALING GROUP/i.test(trimmed) && /QUICK REVISION/i.test(trimmed)) {
    return <ASGQuickRevisionVisual />
  }

  if (isAsciiDiagram) {
    return (
      <div className="md-diagram-block">
        <div className="md-diagram-label">Visual flow</div>
        <pre>{trimmed}</pre>
      </div>
    )
  }

  return (
    <div className="md-plain-code">
      <pre>{trimmed}</pre>
    </div>
  )
}

const Pre = ({ children }) => {
  const child = Array.isArray(children) ? children[0] : children
  if (child?.type === CodeBlock) return children

  const code = extractText(child?.props?.children ?? children)

  return <PlainCodeBlock code={code} />
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
