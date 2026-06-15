import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './NeonDiagram.css'
import './S3Architecture.css'

const STEPS = [
  { n:1, title:'Create Bucket',        desc:'Choose a globally unique name and AWS Region.' },
  { n:2, title:'Configure Options',    desc:'Set properties like versioning, encryption, block public access.' },
  { n:3, title:'Upload Objects',       desc:'Upload files (objects) into the bucket.' },
  { n:4, title:'Manage Access',        desc:'Use IAM policies, bucket policies and ACLs to control access.' },
  { n:5, title:'Organize & Optimize',  desc:'Use prefixes (folders), lifecycle rules, storage classes.' },
  { n:6, title:'Monitor & Audit',      desc:'Track usage with CloudWatch and S3 Server Access Logs.' },
  { n:7, title:'Protect & Retain',     desc:'Enable versioning, MFA Delete, Replication and Object Lock.' },
]

const HIW = [
  'Data is uploaded as objects into a bucket.',
  'Each object is stored across multiple AZs (except One Zone).',
  'Access is controlled via IAM and Bucket Policies.',
  'Lifecycle rules move objects to cheaper storage.',
  'Events can trigger Lambda or SNS/SQS.',
  'Usage and access are logged and monitored.',
  'Objects can be locked for WORM compliance.',
]

const BENEFITS = [
  '11 9\'s (99.999999999%) Durability',
  'Unlimited Scalability',
  'Strong Consistency (read-after-write)',
  'Multiple Storage Classes for Cost Savings',
  'Fine-grained Access Control',
  'Comprehensive Auditing & Logging',
]

const CONCEPTS = [
  { num:'1', name:'Bucket',   desc:'Container for objects stored in S3.' },
  { num:'2', name:'Object',   desc:'The file and its metadata.' },
  { num:'3', name:'Key',      desc:'The unique identifier for an object.' },
  { num:'4', name:'Prefix',   desc:'Similar to a folder path in the key.' },
  { num:'5', name:'Policy',   desc:'Rules defining who can access the bucket.' },
  { num:'6', name:'Lifecycle',desc:'Rules to transition or expire objects.' },
]

const STORAGE_CLASSES = [
  { lbl:'S3 Standard',           active: (s) => [0,1,2,3,4,5,6].includes(s), color: '#00ff88' },
  { lbl:'Intelligent-Tiering',   active: (s) => [4].includes(s), color: '#a855f7' },
  { lbl:'Standard-IA',           active: (s) => [4].includes(s), color: '#3b82f6' },
  { lbl:'One Zone-IA',           active: (s) => [4].includes(s), color: '#00d4ff' },
  { lbl:'Glacier Instant',       active: (s) => [4,6].includes(s), color: '#ff8c00' },
  { lbl:'Glacier Flexible',      active: (s) => [4,6].includes(s), color: '#ff006e' },
  { lbl:'Glacier Deep Archive',  active: (s) => [4,6].includes(s), color: '#ffd700' },
]

const PROPERTIES = [
  { lbl:'Versioning',          active: (s) => [1,6].includes(s) },
  { lbl:'Encryption (SSE)',    active: (s) => [1,6].includes(s) },
  { lbl:'Block Public Access', active: (s) => [1,3,6].includes(s) },
  { lbl:'Lifecycle Rules',     active: (s) => [1,4,6].includes(s) },
  { lbl:'Replication',         active: (s) => [6].includes(s) },
  { lbl:'Object Lock (WORM)',  active: (s) => [6].includes(s) },
]

const INTEGRATIONS = [
  { name: 'IAM',        desc: 'Access Control',      active: (s) => [3].includes(s) },
  { name: 'CloudFront', desc: 'CDN',                 active: (s) => [2,3,4].includes(s) },
  { name: 'Lambda',     desc: 'Event Trigger',       active: (s) => [2].includes(s) },
  { name: 'CloudWatch', desc: 'Monitoring',          active: (s) => [5].includes(s) },
  { name: 'AWS Backup', desc: 'Backup',              active: (s) => [6].includes(s) },
  { name: 'Athena',     desc: 'Query Data',          active: (s) => [4].includes(s) },
]

const STEP_COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ff8c00', '#ff006e', '#ffd700', '#3b82f6']

export default function S3ArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 7), 2500)
    return () => clearInterval(t)
  }, [playing])

  const cx = (...c) => c.filter(Boolean).join(' ')

  const g = (sec) => {
    const map = {
      bucket: [0,1,2,3,4,5,6],
      objects: [2,3,4,5,6],
      props: [1,3,4,6],
      integ: [2,3,4,5,6],
      storage: [4,6],
    }
    return (map[sec]||[]).includes(step)
  }

  return (
    <motion.div
      className="nd-wrap s3-wrap"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" />
        <div className="nd-bar-center">
          <span className="nd-bar-icon s3-bar-icon">S3</span>
          <h2 className="nd-bar-title">AWS S3 – ARCHITECTURE &amp; WORKFLOW</h2>
        </div>
        <div className="nd-bar-line" />
      </div>
      <div className="nd-subtitle">Durable, Scalable, Secure Object Storage</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn s3-playbtn" onClick={() => setPlaying(p => !p)}>
          {playing ? 'II  Pause' : 'Play'}
        </button>
        <span 
          className="nd-stepinfo" 
          style={{ 
            color: STEP_COLORS[step], 
            textShadow: `0 0 10px ${STEP_COLORS[step]}80` 
          }}
        >
          Step {step+1}/7 — {STEPS[step].title}
        </span>
      </div>

      {/* 3-PANEL BODY */}
      <div className="nd-body">

        {/* LEFT: Workflow */}
        <div className="nd-left">
          <div className="nd-panel-hdr">WORKFLOW</div>
          <div className="nd-panel-sub">HOW IT WORKS</div>
          {STEPS.map((s,i) => (
            <div key={i}>
              <motion.div
                className={cx('nd-step', step===i && 'nd-on')}
                onClick={() => { setStep(i); setPlaying(false) }}
                animate={{ scale: step===i ? 1.02 : 1 }}
                transition={{ duration:0.15 }}
              >
                <div className="nd-badge">{s.n}</div>
                <div>
                  <div className="nd-stitle">{s.title}</div>
                  <div className="nd-sdesc">{s.desc}</div>
                </div>
              </motion.div>
              {i < 6 && <div className="nd-step-sep">↓</div>}
            </div>
          ))}
        </div>

        {/* CENTER: Architecture */}
        <div className="s3-center">
          {/* AMAZON S3 BUCKET */}
          <div className={cx('ndbox bc s3-bucket', g('bucket') && 'gc')}>
            <div className="ndbox-lbl cc">AMAZON S3 BUCKET</div>
            
            <div className="s3-bucket-inner">
              {/* OBJECTS */}
              <div className={cx('ndbox bb s3-objects', g('objects') && 'gb')}>
                <div className="ndbox-lbl cb">Objects (Stored as Key-Value)</div>
                <div className="s3-obj-row">
                  <div className="s3-obj-icon">🖼️ photo.jpg</div>
                  <div className="s3-obj-icon">📄 report.pdf</div>
                  <div className="s3-obj-icon">📊 data.csv</div>
                  <div className="s3-obj-icon">🎥 video.mp4</div>
                </div>
                <div className="ndbox-lbl cb" style={{ marginTop: '1rem' }}>Prefixes (Virtual Folders)</div>
                <div className="s3-folder-row">
                  <div className="s3-folder">📁 images/</div>
                  <div className="s3-folder">📁 docs/</div>
                  <div className="s3-folder">📁 logs/</div>
                  <div className="s3-folder">📁 archive/</div>
                </div>
              </div>

              {/* BUCKET PROPERTIES */}
              <div className={cx('ndbox bp s3-props', g('props') && 'gp')}>
                <div className="ndbox-lbl cp">Bucket Properties</div>
                <div className="s3-props-list">
                  {PROPERTIES.map((p,i) => (
                    <div key={i} className={cx('s3-prop-item', p.active(step) && 's3-prop-on')}>
                      <span className="s3-prop-dot"></span> {p.lbl}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="nd-varrow s3-va">
            <div className={cx('nd-valine', g('storage') && 'nd-fv')}>
              <div className="ndpkt pkp" />
            </div>
            <div className="nd-vahead">▼</div>
          </div>

          {/* STORAGE CLASSES */}
          <div className={cx('ndbox bv s3-storage', g('storage') && 'gv')}>
            <div className="ndbox-lbl cv">STORAGE CLASSES (Optimize Cost)</div>
            <div className="s3-storage-row">
              {STORAGE_CLASSES.map((sc,i) => (
                <div key={i} className={cx('s3-sc-card', sc.active(step) && 's3-sc-on')} style={{ '--sc-color': sc.color }}>
                  <div className="s3-sc-icon">🪣</div>
                  <div className="s3-sc-lbl">{sc.lbl}</div>
                </div>
              ))}
            </div>
            <div className="s3-storage-spectrum">
              <span className="s3-spec-left">Frequent Access</span>
              <div className="s3-spec-line"></div>
              <span className="s3-spec-right">Archive (Lower Cost)</span>
            </div>
          </div>

          {/* INTEGRATIONS (Side block) */}
          <div className={cx('ndbox bg s3-integrations', g('integ') && 'gg')}>
            <div className="ndbox-lbl cg">INTEGRATIONS</div>
            <div className="s3-integ-list">
              {INTEGRATIONS.map((integ,i) => (
                <div key={i} className={cx('s3-integ-item', integ.active(step) && 's3-integ-on')}>
                  <div className="s3-integ-name">{integ.name}</div>
                  <div className="s3-integ-desc">{integ.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: How It Works + Benefits */}
        <div className="nd-right">
          <div className="nd-rbox">
            <div className="nd-rhdr">HOW IT WORKS</div>
            {HIW.map((text,i) => (
              <div key={i} className={cx('nd-hiw', step===i && 'nd-hiwon')}>
                <div className="nd-hnum">{i+1}</div>
                <div className="nd-htext">{text}</div>
              </div>
            ))}
          </div>
          <div className="nd-rbox nd-benefitsbox">
            <div className="nd-rhdr nd-gold">KEY BENEFITS</div>
            {BENEFITS.map((b,i) => (
              <div key={i} className="nd-ben">
                <span className="nd-tick nd-tick-num">{i+1}</span>{b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: KEY CONCEPTS */}
      <div className="nd-bottom">
        <div className="nd-btitle cp">KEY S3 CONCEPTS</div>
        <div className="nd-bgrid" style={{ gridTemplateColumns:'repeat(6,1fr)' }}>
          {CONCEPTS.map((c,i) => (
            <div key={i} className="nd-bcard">
              <span className="nd-bnum">{c.num}</span>
              <div className="nd-bname">{c.name}</div>
              <div className="nd-bdesc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
