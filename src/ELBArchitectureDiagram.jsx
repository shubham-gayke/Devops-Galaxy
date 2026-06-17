import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './NeonDiagram.css'
import './ELBArchitecture.css'

const STEPS = [
  { n: 1, title: 'User Request',       desc: 'User sends request to www.example.com from browser.' },
  { n: 2, title: 'Route 53 (DNS)',     desc: 'Route 53 resolves domain to ALB DNS name (Anycast IP).' },
  { n: 3, title: 'Reaches ALB',        desc: 'Traffic arrives at the Application Load Balancer.' },
  { n: 4, title: 'Listener Rules',     desc: 'ALB listener evaluates rules (host/path/header/query).' },
  { n: 5, title: 'Forward to Targets', desc: 'Request forwarded to healthy EC2 targets in a target group.' },
  { n: 6, title: 'Health Check',       desc: 'ALB continuously polls targets — only healthy ones get traffic.' },
  { n: 7, title: 'App Responds',       desc: 'EC2 instances process request & query private RDS database.' },
  { n: 8, title: 'Response Back',      desc: 'ALB returns the response to the user. Connection may be kept alive.' },
]

const KEY_FEATURES = [
  { icon: '🔀', name: 'Path Routing',      desc: 'Route /api vs /app to different targets' },
  { icon: '🔒', name: 'SSL Termination',   desc: 'ACM certs terminate TLS at ALB' },
  { icon: '📌', name: 'Sticky Sessions',   desc: 'Cookie-based session affinity' },
  { icon: '⚖️', name: 'Cross-Zone LB',     desc: 'Even distribution across all AZs' },
  { icon: '🔄', name: 'Auto Scaling',      desc: 'Auto registers/deregisters with ASG' },
]

const STEP_COLORS = [
  '#00d4ff', '#a855f7', '#00d4ff', '#ff8c00',
  '#00ff88', '#ff4444', '#a855f7', '#00d4ff',
]

export default function ELBArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 8), 2500)
    return () => clearInterval(t)
  }, [playing])

  // Which nodes glow at each step
  const g = (sec) => {
    const map = {
      users:   [0, 1, 7],
      r53:     [1],
      alb:     [2, 3, 4, 7],
      tg1:     [4, 5, 6],
      tg2:     [4, 5, 6],
      subnet_a: [4, 5, 6],
      subnet_b: [4, 5, 6],
      rds:     [6],
      acm:     [2, 3],
    }
    return (map[sec] || []).includes(step)
  }

  // Which arrows flow at each step
  const f = (arrow) => {
    const map = {
      'user-r53':  [1],
      'r53-alb':   [2],
      'alb-tg1':   [4, 5, 6],
      'alb-tg2':   [4, 5, 6],
      'tg-ec2-a':  [5, 6],
      'tg-ec2-b':  [5, 6],
      'ec2-rds':   [6],
      'alb-user':  [7],
      'acm-alb':   [2, 3],
    }
    return (map[arrow] || []).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  return (
    <motion.div
      className="nd-wrap elb-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" style={{ background: 'linear-gradient(90deg,transparent,#00d4ff,transparent)' }} />
        <div className="nd-bar-center">
          <span className="nd-bar-icon elb-bar-icon">⚖️</span>
          <h2 className="nd-bar-title elb-title">AWS ELB – Architecture &amp; Request Flow</h2>
        </div>
        <div className="nd-bar-line" style={{ background: 'linear-gradient(90deg,transparent,#00d4ff,transparent)' }} />
      </div>
      <div className="nd-subtitle">Elastic Load Balancing distributes traffic across healthy targets in multiple AZs</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn elb-playbtn" onClick={() => setPlaying(p => !p)}>
          {playing ? 'II  Pause' : '▶  Play'}
        </button>
        <span
          className="nd-stepinfo"
          style={{ color: STEP_COLORS[step], textShadow: `0 0 10px ${STEP_COLORS[step]}80` }}
        >
          Step {step + 1}/8 — {STEPS[step].title}
        </span>
      </div>

      {/* STEP DESCRIPTION BAR */}
      <div className="nd-rbox" style={{ marginBottom: '0.75rem', borderColor: `${STEP_COLORS[step]}30`, padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: STEP_COLORS[step], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: '#050510', flexShrink: 0 }}>{step + 1}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--nd-text)' }}>{STEPS[step].desc}</div>
      </div>

      {/* ── MAIN DIAGRAM ── */}
      <div className="nd-body">

        {/* LEFT: Workflow Steps */}
        <div className="nd-left">
          <div className="nd-panel-hdr cc">WORKFLOW</div>
          <div className="nd-panel-sub">END-TO-END FLOW</div>
          {STEPS.map((s, i) => (
            <div key={i}>
              <motion.div
                className={cx('nd-step', step === i && 'nd-on')}
                style={step === i ? { background: 'rgba(0,212,255,0.07)', borderColor: 'rgba(0,212,255,0.3)' } : {}}
                onClick={() => { setStep(i); setPlaying(false) }}
                animate={{ scale: step === i ? 1.02 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="nd-badge" style={{
                  borderColor: '#00d4ff',
                  color: step === i ? '#050510' : '#00d4ff',
                  background: step === i ? '#00d4ff' : 'rgba(0,212,255,0.1)',
                  boxShadow: step === i ? '0 0 8px #00d4ff' : 'none',
                }}>{s.n}</div>
                <div>
                  <div className="nd-stitle" style={step === i ? { color: '#00d4ff' } : {}}>{s.title}</div>
                  <div className="nd-sdesc">{s.desc}</div>
                </div>
              </motion.div>
              {i < 7 && <div className="nd-step-sep">↓</div>}
            </div>
          ))}
        </div>

        {/* CENTER: Architecture Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>

          {/* Row 1: Users → R53 → ALB → ACM (horizontal) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>

            {/* Users */}
            <div className="elb-flow-section">
              <div className={cx('elb-users', g('users') && 'elb-users-glow')}>
                <div className="elb-users-icon">👥</div>
                <div style={{ fontWeight: 700, fontSize: '0.6rem' }}>Users</div>
                <div style={{ fontSize: '0.45rem', color: 'var(--nd-muted)' }}>www.example.com</div>
              </div>
            </div>

            {/* Users → R53 Connector */}
            <div className="elb-hconn" style={{ minWidth: 28 }}>
              {f('user-r53') && <div className="ndpkt pkv" style={{ top: '-3px', animation: 'pktH 0.75s linear infinite' }} />}
              {f('alb-user') && <div className="ndpkt pkc" style={{ top: '-3px', animation: 'pktH 0.75s linear infinite reverse' }} />}
              <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.38rem', color: 'var(--nd-muted)', whiteSpace: 'nowrap' }}>DNS req/resp</div>
            </div>

            {/* Route 53 */}
            <div className="elb-flow-section">
              <div className={cx('elb-r53', g('r53') && 'elb-r53-glow')}>
                <div className="elb-r53-icon">53</div>
                <div style={{ fontWeight: 700, fontSize: '0.58rem' }}>Route 53</div>
                <div style={{ fontSize: '0.43rem', color: 'var(--nd-muted)' }}>Resolves to ALB</div>
              </div>
            </div>

            {/* R53 → ALB Connector */}
            <div className="elb-hconn" style={{ minWidth: 28 }}>
              {f('r53-alb') && <div className="ndpkt pkc" style={{ top: '-3px', animation: 'pktH 0.75s linear infinite' }} />}
              <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.38rem', color: 'var(--nd-muted)', whiteSpace: 'nowrap' }}>HTTP/S</div>
            </div>

            {/* ALB */}
            <div className="elb-flow-section" style={{ minWidth: 110 }}>
              <div className={cx('elb-alb', g('alb') && 'elb-alb-glow')}>
                <div className="elb-alb-icon">⚖️</div>
                <div className="elb-alb-name">ALB</div>
                <div style={{ fontSize: '0.44rem', color: 'var(--nd-muted)', marginTop: '-0.1rem' }}>Application Load Balancer</div>
                <div className="elb-listeners">
                  <span className="elb-listener-badge elb-listener-http">HTTP 80</span>
                  <span className="elb-listener-badge elb-listener-https">HTTPS 443</span>
                </div>
              </div>
            </div>

            {/* ACM Dashed connector */}
            <div className="elb-hconn" style={{ minWidth: 20, borderTop: '1px dashed rgba(255,68,68,0.3)', background: 'transparent' }}>
              {f('acm-alb') && <div className="ndpkt pkb" style={{ top: '-3px', animation: 'pktH 0.9s linear infinite reverse' }} />}
            </div>

            {/* ACM */}
            <div className="elb-flow-section">
              <div className={cx('elb-acm', g('acm') && 'elb-acm-glow')}>
                <div className="elb-acm-icon">🔒</div>
                <div style={{ fontWeight: 700, fontSize: '0.5rem', color: 'var(--nd-red)' }}>ACM</div>
                <div style={{ fontSize: '0.42rem', color: 'var(--nd-muted)', textAlign: 'center' }}>SSL/TLS<br/>Certificates</div>
              </div>
            </div>

          </div>

          {/* Vertical connector from ALB down to Target Groups */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', width: '100%' }}>
            <div className="elb-vconn" style={{ height: 20, flex: 'none', width: 2, background: f('alb-tg1') ? 'var(--nd-green)' : 'rgba(255,255,255,0.08)' }}>
              {f('alb-tg1') && <div className="ndpkt pkg" style={{ left: '-3px', animation: 'pktV 0.75s linear infinite' }} />}
            </div>
            <div className="elb-vconn" style={{ height: 20, flex: 'none', width: 2, background: f('alb-tg2') ? 'var(--nd-green)' : 'rgba(255,255,255,0.08)' }}>
              {f('alb-tg2') && <div className="ndpkt pkg" style={{ left: '-3px', animation: 'pktV 0.75s linear infinite' }} />}
            </div>
          </div>

          {/* Target Groups Row */}
          <div className="elb-tg-section">
            <div className="elb-tg-label">Target Groups</div>
            <div className="elb-tg-row">
              <div className={cx('elb-tg', g('tg1') && 'elb-tg-glow')}>
                <div className="elb-tg-icon">🎯</div>
                <div className="elb-tg-name">Target Group 1</div>
                <div style={{ fontSize: '0.43rem', color: 'var(--nd-muted)' }}>Port 80 · HTTP</div>
                <div className={cx('elb-hc-row')}>
                  <span className="elb-hc elb-hc-healthy">✅ Healthy</span>
                </div>
              </div>
              <div className={cx('elb-tg', g('tg2') && 'elb-tg-glow')}>
                <div className="elb-tg-icon">🎯</div>
                <div className="elb-tg-name">Target Group 2</div>
                <div style={{ fontSize: '0.43rem', color: 'var(--nd-muted)' }}>Port 80 · HTTP</div>
                <div className="elb-hc-row">
                  <span className="elb-hc elb-hc-healthy">✅ Healthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical connectors TG → Subnets */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', width: '100%' }}>
            <div className="elb-vconn" style={{ height: 18, flex: 'none', width: 2, background: f('tg-ec2-a') ? 'var(--nd-orange)' : 'rgba(255,255,255,0.08)' }}>
              {f('tg-ec2-a') && <div className="ndpkt pko" style={{ left: '-3px', animation: 'pktV 0.75s linear infinite' }} />}
            </div>
            <div className="elb-vconn" style={{ height: 18, flex: 'none', width: 2, background: f('tg-ec2-b') ? 'var(--nd-orange)' : 'rgba(255,255,255,0.08)' }}>
              {f('tg-ec2-b') && <div className="ndpkt pko" style={{ left: '-3px', animation: 'pktV 0.75s linear infinite' }} />}
            </div>
          </div>

          {/* Private Subnets with EC2 */}
          <div className="elb-subnet-row">
            <div className={cx('elb-subnet', g('subnet_a') && 'elb-subnet-glow')}>
              <div className="elb-subnet-label">Private Subnet A</div>
              <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)', marginBottom: '0.2rem' }}>AZ-A · 10.0.3.0/24</div>
              <div className={cx('elb-ec2-row', g('subnet_a') && 'elb-ec2-glow')}>
                <div className="elb-ec2" title="EC2">EC2</div>
                <div className="elb-ec2" title="EC2">EC2</div>
              </div>
              <div style={{ fontSize: '0.38rem', color: 'var(--nd-muted)', marginTop: '0.2rem' }}>Auto Scaling Group</div>
            </div>
            <div className={cx('elb-subnet', g('subnet_b') && 'elb-subnet-glow')}>
              <div className="elb-subnet-label">Private Subnet B</div>
              <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)', marginBottom: '0.2rem' }}>AZ-B · 10.0.4.0/24</div>
              <div className={cx('elb-ec2-row', g('subnet_b') && 'elb-ec2-glow')}>
                <div className="elb-ec2" title="EC2">EC2</div>
                <div className="elb-ec2" title="EC2">EC2</div>
              </div>
              <div style={{ fontSize: '0.38rem', color: 'var(--nd-muted)', marginTop: '0.2rem' }}>Auto Scaling Group</div>
            </div>
          </div>

          {/* EC2 → RDS connector */}
          <div style={{ width: 2, height: 18, background: f('ec2-rds') ? 'var(--nd-purple)' : 'rgba(255,255,255,0.08)', position: 'relative', margin: '0 auto' }}>
            {f('ec2-rds') && <div className="ndpkt pkv" style={{ left: '-3px', animation: 'pktV 0.75s linear infinite' }} />}
          </div>

          {/* RDS */}
          <div style={{ width: '100%' }}>
            <div className={cx('elb-rds', g('rds') && 'elb-rds-glow')}>
              <div className="elb-rds-icon">🗄️</div>
              <div style={{ fontWeight: 700, fontSize: '0.55rem', color: 'var(--nd-purple)' }}>Amazon RDS</div>
              <div style={{ fontSize: '0.42rem', color: 'var(--nd-muted)' }}>MySQL / PostgreSQL · Private Subnet</div>
            </div>
          </div>

        </div>

        {/* RIGHT: How It Works + Benefits */}
        <div className="nd-right">
          <div className="nd-rbox" style={{ borderColor: 'rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.02)' }}>
            <div className="nd-rhdr cc">HOW IT WORKS</div>
            {STEPS.map((s, i) => (
              <div key={i} className={cx('nd-hiw', step === i && 'nd-hiwon')}>
                <div className="nd-hnum">{i + 1}</div>
                <div className="nd-htext">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="nd-rbox nd-benefitsbox">
            <div className="nd-rhdr nd-gold">KEY BENEFITS</div>
            {['High Availability', 'Fault Tolerance', 'Auto Scaling', 'SSL/TLS Offload', 'Health Checks', 'Multi-AZ', 'Cost Effective'].map((b, i) => (
              <div key={i} className="nd-ben">
                <span className="nd-tick">+</span>{b}
              </div>
            ))}
          </div>
        </div>

      </div>{/* nd-body */}

      {/* BOTTOM: Key Features */}
      <div className="nd-bottom">
        <div className="nd-btitle cc">KEY FEATURES</div>
        <div className="nd-bgrid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {KEY_FEATURES.map((f, i) => (
            <div key={i} className="nd-bcard">
              <div className="nd-bicon">{f.icon}</div>
              <div className="nd-bname">{f.name}</div>
              <div className="nd-bdesc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
