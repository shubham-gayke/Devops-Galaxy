import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './NeonDiagram.css'
import './ASGArchitecture.css'

const STEPS = [
  { n: 1, title: 'Traffic Rises',       desc: 'Users hit the application — CPU across the fleet climbs above 70%.' },
  { n: 2, title: 'CloudWatch Alarm',    desc: 'CloudWatch detects CPU > 70% and triggers a scaling alarm.' },
  { n: 3, title: 'ASG Evaluates',       desc: 'Auto Scaling Group evaluates its Target Tracking policy.' },
  { n: 4, title: 'Launch Template',     desc: 'ASG uses the Launch Template to determine what instances to create.' },
  { n: 5, title: 'Scale Out',           desc: 'New EC2 instances launch across AZs and register with ALB Target Group.' },
  { n: 6, title: 'Health Checks',       desc: 'ALB health checks verify new instances are healthy before routing traffic.' },
  { n: 7, title: 'Traffic Balanced',    desc: 'ALB distributes traffic across all healthy instances evenly.' },
  { n: 8, title: 'Traffic Drops',       desc: 'Demand falls — ASG scales in, terminating excess instances after cooldown.' },
]

const KEY_FEATURES = [
  { icon: '📈', name: 'Target Tracking',    desc: 'Maintain a metric at target (e.g. CPU 50%)' },
  { icon: '🕐', name: 'Scheduled Scaling',  desc: 'Scale at predictable times (cron)' },
  { icon: '🔄', name: 'Instance Refresh',   desc: 'Rolling AMI updates, zero downtime' },
  { icon: '🪝', name: 'Lifecycle Hooks',    desc: 'Custom logic on launch/terminate' },
  { icon: '🛡️', name: 'Multi-AZ HA',        desc: 'Auto-rebalance across AZs' },
]

const STEP_COLORS = [
  '#ff8c00', '#a855f7', '#ff8c00', '#00d4ff',
  '#00ff88', '#ff4444', '#00d4ff', '#ffd700',
]

/* ── Animated flowing arrow (SVG-based, always visible) ── */
function FlowArrow({ active, color = '#00d4ff', direction = 'right', length = 60, label }) {
  const isH = direction === 'right' || direction === 'left'
  const w = isH ? length : 12
  const h = isH ? 12 : length

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)', marginBottom: 2, whiteSpace: 'nowrap' }}>{label}</div>}
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        {/* Base line */}
        {isH ? (
          <line x1={0} y1={6} x2={length} y2={6} stroke={active ? color : 'rgba(255,255,255,0.12)'} strokeWidth={2} />
        ) : (
          <line x1={6} y1={0} x2={6} y2={length} stroke={active ? color : 'rgba(255,255,255,0.12)'} strokeWidth={2} />
        )}
        {/* Arrowhead */}
        {isH && direction === 'right' && (
          <polygon points={`${length-6},2 ${length},6 ${length-6},10`} fill={active ? color : 'rgba(255,255,255,0.15)'} />
        )}
        {isH && direction === 'left' && (
          <polygon points={`6,2 0,6 6,10`} fill={active ? color : 'rgba(255,255,255,0.15)'} />
        )}
        {!isH && direction === 'down' && (
          <polygon points={`2,${length-6} 6,${length} 10,${length-6}`} fill={active ? color : 'rgba(255,255,255,0.15)'} />
        )}
        {!isH && direction === 'up' && (
          <polygon points={`2,6 6,0 10,6`} fill={active ? color : 'rgba(255,255,255,0.15)'} />
        )}
        {/* Flowing dot */}
        {active && (
          <circle r={4} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
            {isH && direction === 'right' && (
              <animate attributeName="cx" from={0} to={length} dur="0.8s" repeatCount="indefinite" />
            )}
            {isH && direction === 'left' && (
              <animate attributeName="cx" from={length} to={0} dur="0.8s" repeatCount="indefinite" />
            )}
            {!isH && direction === 'down' && (
              <animate attributeName="cy" from={0} to={length} dur="0.8s" repeatCount="indefinite" />
            )}
            {!isH && direction === 'up' && (
              <animate attributeName="cy" from={length} to={0} dur="0.8s" repeatCount="indefinite" />
            )}
            {/* Keep dot centered on the line */}
            {isH ? (
              <animate attributeName="cy" values="6;6" dur="1s" />
            ) : (
              <animate attributeName="cx" values="6;6" dur="1s" />
            )}
          </circle>
        )}
        {/* Second flowing dot for extra effect */}
        {active && (
          <circle r={3} fill={color} opacity={0.5} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
            {isH && direction === 'right' && (
              <animate attributeName="cx" from={0} to={length} dur="0.8s" begin="0.4s" repeatCount="indefinite" />
            )}
            {isH && direction === 'left' && (
              <animate attributeName="cx" from={length} to={0} dur="0.8s" begin="0.4s" repeatCount="indefinite" />
            )}
            {!isH && direction === 'down' && (
              <animate attributeName="cy" from={0} to={length} dur="0.8s" begin="0.4s" repeatCount="indefinite" />
            )}
            {!isH && direction === 'up' && (
              <animate attributeName="cy" from={length} to={0} dur="0.8s" begin="0.4s" repeatCount="indefinite" />
            )}
            {isH ? (
              <animate attributeName="cy" values="6;6" dur="1s" />
            ) : (
              <animate attributeName="cx" values="6;6" dur="1s" />
            )}
          </circle>
        )}
      </svg>
    </div>
  )
}

/* ── Pulsing glow ring ── */
function PulseRing({ color, active }) {
  if (!active) return null
  return (
    <motion.div
      style={{
        position: 'absolute', inset: -3, borderRadius: 'inherit',
        border: `2px solid ${color}`,
        pointerEvents: 'none',
      }}
      animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.04, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function ASGArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 8), 3000)
    return () => clearInterval(t)
  }, [playing])

  // Which nodes glow at each step
  const g = (sec) => {
    const map = {
      users:      [0, 6, 7],
      alb:        [0, 5, 6, 7],
      cw:         [1, 2],
      asg:        [2, 3, 4, 7],
      lt:         [3, 4],
      az_a:       [4, 5, 6],
      az_b:       [4, 5, 6],
      az_c:       [4, 5, 6],
      sns:        [4, 7],
    }
    return (map[sec] || []).includes(step)
  }

  // Which arrows flow at each step
  const f = (arrow) => {
    const map = {
      'users-alb':  [0, 6],
      'alb-cw':     [0, 1],
      'cw-asg':     [1, 2],
      'asg-lt':     [3],
      'asg-fleet':  [4, 5],
      'alb-fleet':  [5, 6],
      'asg-sns':    [4, 7],
      'drain':      [7],
    }
    return (map[arrow] || []).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  // Simulate instance counts based on step
  const getInstances = (az) => {
    const base = az === 'c' ? 1 : 2
    if (step >= 4 && step <= 6) return base + 1
    if (step === 7) return Math.max(1, base - 1)
    return base
  }

  const isNewInstance = (az, idx) => {
    const base = az === 'c' ? 1 : 2
    return (step === 4 || step === 5) && idx >= base
  }

  return (
    <motion.div
      className="nd-wrap asg-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" style={{ background: 'linear-gradient(90deg,transparent,#ff8c00,transparent)' }} />
        <div className="nd-bar-center">
          <span className="nd-bar-icon asg-bar-icon">📈</span>
          <h2 className="nd-bar-title asg-title">AWS Auto Scaling Group – Architecture &amp; Workflow</h2>
        </div>
        <div className="nd-bar-line" style={{ background: 'linear-gradient(90deg,transparent,#ff8c00,transparent)' }} />
      </div>
      <div className="nd-subtitle">Automatically scales EC2 fleet based on demand, health checks, and policies</div>

      {/* CAPACITY BAR */}
      <motion.div className="asg-cap-bar" animate={{ borderColor: step >= 4 && step <= 6 ? 'rgba(0,255,136,0.4)' : 'rgba(255,140,0,0.15)' }}>
        <div className="asg-cap-item asg-cap-min"><div className="asg-cap-dot" />Min: 2</div>
        <div className="asg-cap-sep" />
        <div className="asg-cap-item asg-cap-des">
          <div className="asg-cap-dot" />
          Desired:&nbsp;
          <AnimatePresence mode="wait">
            <motion.span
              key={step >= 4 && step <= 6 ? 'high' : step === 7 ? 'drain' : 'normal'}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ fontWeight: 900, fontSize: '0.7rem', color: step >= 4 && step <= 6 ? 'var(--nd-green)' : step === 7 ? 'var(--nd-red)' : 'var(--nd-green)' }}
            >
              {step >= 4 && step <= 6 ? '8' : step === 7 ? '3' : '5'}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="asg-cap-sep" />
        <div className="asg-cap-item asg-cap-max"><div className="asg-cap-dot" />Max: 12</div>
      </motion.div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn asg-playbtn" onClick={() => setPlaying(p => !p)}>
          {playing ? 'II  Pause' : '▶  Play'}
        </button>
        <motion.span
          className="nd-stepinfo"
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ color: STEP_COLORS[step], textShadow: `0 0 12px ${STEP_COLORS[step]}` }}
        >
          Step {step + 1}/8 — {STEPS[step].title}
        </motion.span>
      </div>

      {/* STEP DESCRIPTION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="nd-rbox"
          style={{ marginBottom: '0.75rem', borderColor: `${STEP_COLORS[step]}40`, background: `${STEP_COLORS[step]}08`, padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            style={{ width: 22, height: 22, borderRadius: '50%', background: STEP_COLORS[step], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#050510', flexShrink: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6 }}
          >{step + 1}</motion.div>
          <div style={{ fontSize: '0.62rem', color: 'var(--nd-text)', lineHeight: 1.4 }}>{STEPS[step].desc}</div>
        </motion.div>
      </AnimatePresence>

      {/* ══ MAIN DIAGRAM ══ */}
      <div className="nd-body">

        {/* LEFT: Workflow Steps */}
        <div className="nd-left">
          <div className="nd-panel-hdr co">WORKFLOW</div>
          <div className="nd-panel-sub">SCALING LIFECYCLE</div>
          {STEPS.map((s, i) => (
            <div key={i}>
              <motion.div
                className={cx('nd-step', step === i && 'nd-on')}
                style={step === i ? { background: 'rgba(255,140,0,0.07)', borderColor: 'rgba(255,140,0,0.3)' } : {}}
                onClick={() => { setStep(i); setPlaying(false) }}
                animate={{ scale: step === i ? 1.03 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="nd-badge"
                  style={{
                    borderColor: '#ff8c00',
                    color: step === i ? '#050510' : '#ff8c00',
                    background: step === i ? '#ff8c00' : 'rgba(255,140,0,0.1)',
                  }}
                  animate={step === i ? { boxShadow: ['0 0 4px #ff8c00', '0 0 14px #ff8c00', '0 0 4px #ff8c00'] } : { boxShadow: '0 0 0px transparent' }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >{s.n}</motion.div>
                <div>
                  <div className="nd-stitle" style={step === i ? { color: '#ff8c00' } : {}}>{s.title}</div>
                  <div className="nd-sdesc">{s.desc}</div>
                </div>
              </motion.div>
              {i < 7 && <div className="nd-step-sep">↓</div>}
            </div>
          ))}
        </div>

        {/* CENTER: Architecture Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center', flex: 1, minWidth: 0 }}>

          {/* ── ROW 1: Users ── */}
          <motion.div
            className={cx('asg-alb')}
            style={{ position: 'relative', minWidth: 90, borderColor: g('users') ? 'var(--nd-cyan)' : undefined }}
            animate={g('users') ? { boxShadow: ['0 0 5px rgba(0,212,255,0.3)', '0 0 20px rgba(0,212,255,0.6)', '0 0 5px rgba(0,212,255,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PulseRing color="#00d4ff" active={g('users')} />
            <div style={{ fontSize: '1.4rem' }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: '0.58rem', color: 'var(--nd-cyan)' }}>Users / Traffic</div>
            <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>www.example.com</div>
          </motion.div>

          {/* Arrow: Users → ALB */}
          <FlowArrow active={f('users-alb')} color="#00d4ff" direction="down" length={28} label="HTTP/S" />

          {/* ── ROW 2: ALB ── */}
          <motion.div
            className={cx('asg-alb')}
            style={{ position: 'relative', minWidth: 130, borderWidth: 2, borderColor: g('alb') ? 'var(--nd-cyan)' : undefined }}
            animate={g('alb') ? { boxShadow: ['0 0 5px rgba(0,212,255,0.3)', '0 0 25px rgba(0,212,255,0.6)', '0 0 5px rgba(0,212,255,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PulseRing color="#00d4ff" active={g('alb')} />
            <div className="asg-alb-icon">⚖️</div>
            <div style={{ fontWeight: 800, fontSize: '0.62rem', color: 'var(--nd-cyan)' }}>Application Load Balancer</div>
            <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>Target Group · Health Checks</div>
          </motion.div>

          {/* Arrow: ALB → CW + ALB → Fleet (split) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', justifyContent: 'center' }}>
            <FlowArrow active={f('alb-cw')} color="#a855f7" direction="down" length={25} label="Metrics" />
            <FlowArrow active={f('alb-fleet')} color="#00d4ff" direction="down" length={25} label="Traffic" />
          </div>

          {/* ── ROW 3: CloudWatch + ASG Controller + Launch Template ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>

            {/* CloudWatch */}
            <motion.div
              className={cx('asg-cw')}
              style={{ position: 'relative', minWidth: 85 }}
              animate={g('cw') ? { boxShadow: ['0 0 5px rgba(168,85,247,0.3)', '0 0 20px rgba(168,85,247,0.6)', '0 0 5px rgba(168,85,247,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <PulseRing color="#a855f7" active={g('cw')} />
              <div className="asg-cw-icon">📊</div>
              <div style={{ fontWeight: 700, fontSize: '0.55rem', color: 'var(--nd-purple)' }}>CloudWatch</div>
              <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>Alarms</div>
            </motion.div>

            {/* CW → ASG Arrow */}
            <FlowArrow active={f('cw-asg')} color="#ff8c00" direction="right" length={45} label="Scale Alarm" />

            {/* ASG Controller */}
            <motion.div
              className={cx('asg-controller')}
              style={{ position: 'relative', minWidth: 120 }}
              animate={g('asg') ? { boxShadow: ['0 0 5px rgba(255,140,0,0.3)', '0 0 25px rgba(255,140,0,0.7)', '0 0 5px rgba(255,140,0,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <PulseRing color="#ff8c00" active={g('asg')} />
              <div className="asg-controller-icon">📈</div>
              <div className="asg-controller-name">Auto Scaling Group</div>
              <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>Decision Engine</div>
              <div className="asg-policies">
                <span className="asg-policy-badge asg-policy-target">Target Tracking</span>
                <span className="asg-policy-badge asg-policy-step">Step</span>
                <span className="asg-policy-badge asg-policy-sched">Scheduled</span>
              </div>
            </motion.div>

            {/* ASG → LT Arrow */}
            <FlowArrow active={f('asg-lt')} color="#00d4ff" direction="right" length={35} label="Blueprint" />

            {/* Launch Template */}
            <motion.div
              className={cx('asg-lt')}
              style={{ position: 'relative' }}
              animate={g('lt') ? { boxShadow: ['0 0 5px rgba(0,212,255,0.3)', '0 0 18px rgba(0,212,255,0.5)', '0 0 5px rgba(0,212,255,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <PulseRing color="#00d4ff" active={g('lt')} />
              <div className="asg-lt-icon">📋</div>
              <div style={{ fontWeight: 700, fontSize: '0.52rem', color: 'var(--nd-cyan)' }}>Launch Template</div>
              <div style={{ fontSize: '0.38rem', color: 'var(--nd-muted)', textAlign: 'center' }}>AMI · t3.medium · SG</div>
            </motion.div>
          </div>

          {/* Arrow: ASG → Fleet */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', width: '100%' }}>
            {['a', 'b', 'c'].map(az => (
              <FlowArrow key={az} active={f('asg-fleet')} color="#00ff88" direction="down" length={22} />
            ))}
          </div>

          {/* ── ROW 4: EC2 Fleet across AZs ── */}
          <div className="asg-fleet-section">
            <motion.div
              className="asg-fleet-label"
              animate={{ color: step >= 4 && step <= 6 ? '#00ff88' : '#ff8c00' }}
            >
              EC2 Instance Fleet {step >= 4 && step <= 6 ? '(SCALING OUT ↑)' : step === 7 ? '(SCALING IN ↓)' : ''}
            </motion.div>
            <div className="asg-fleet-row">
              {['a', 'b', 'c'].map(az => {
                const count = getInstances(az)
                return (
                  <motion.div
                    key={az}
                    className={cx('asg-az')}
                    style={{ position: 'relative' }}
                    animate={g(`az_${az}`)
                      ? { borderColor: 'rgba(0,255,136,0.5)', boxShadow: '0 0 14px rgba(0,255,136,0.25)' }
                      : { borderColor: 'rgba(0,255,136,0.2)', boxShadow: '0 0 0px transparent' }
                    }
                  >
                    <PulseRing color="#00ff88" active={g(`az_${az}`)} />
                    <div className="asg-az-label">AZ-1{az}</div>
                    <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>subnet-{az}{az}{az}</div>
                    <div className="asg-ec2-grid">
                      <AnimatePresence>
                        {Array.from({ length: count }).map((_, idx) => (
                          <motion.div
                            key={`${az}-${idx}`}
                            className={cx(
                              'asg-ec2',
                              isNewInstance(az, idx) && 'asg-ec2-new',
                              g(`az_${az}`) && !isNewInstance(az, idx) && 'asg-ec2-glow',
                              step === 7 && idx === count && 'asg-ec2-unhealthy'
                            )}
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.5, delay: idx * 0.12, type: 'spring', stiffness: 200 }}
                          >
                            {isNewInstance(az, idx) ? '✦' : 'EC2'}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step === 7 && az !== 'c' ? 'drain' : 'healthy'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ marginTop: 2 }}
                      >
                        {step === 7 && az !== 'c'
                          ? <span className="asg-hc asg-hc-replacing">⏳ Draining</span>
                          : <span className="asg-hc asg-hc-healthy" style={{ opacity: step >= 5 ? 1 : 0.4 }}>✅ Healthy</span>
                        }
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Arrow: Down to SNS */}
          <FlowArrow active={f('asg-sns')} color="#ffd700" direction="down" length={20} />

          {/* ── ROW 5: SNS ── */}
          <motion.div
            className={cx('asg-sns')}
            style={{ position: 'relative' }}
            animate={g('sns') ? { boxShadow: ['0 0 5px rgba(255,215,0,0.3)', '0 0 18px rgba(255,215,0,0.5)', '0 0 5px rgba(255,215,0,0.3)'] } : { boxShadow: '0 0 0px transparent' }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <PulseRing color="#ffd700" active={g('sns')} />
            <div className="asg-sns-icon">🔔</div>
            <div style={{ fontWeight: 700, fontSize: '0.52rem', color: 'var(--nd-yellow)' }}>SNS Notifications</div>
            <div style={{ fontSize: '0.4rem', color: 'var(--nd-muted)' }}>Scale events → Team alerts</div>
          </motion.div>

        </div>

        {/* RIGHT: How It Works + Benefits */}
        <div className="nd-right">
          <div className="nd-rbox" style={{ borderColor: 'rgba(255,140,0,0.2)', background: 'rgba(255,140,0,0.02)' }}>
            <div className="nd-rhdr co">HOW IT WORKS</div>
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                className={cx('nd-hiw', step === i && 'nd-hiwon')}
                style={step === i ? { background: 'rgba(255,140,0,0.06)', borderColor: 'rgba(255,140,0,0.3)' } : {}}
                animate={{ x: step === i ? 3 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="nd-hnum"
                  style={step === i
                    ? { background: 'var(--nd-orange)', color: '#050510' }
                    : { background: 'rgba(255,140,0,0.08)', borderColor: 'rgba(255,140,0,0.25)', color: 'var(--nd-orange)' }
                  }
                  animate={step === i ? { boxShadow: ['0 0 4px var(--nd-orange)', '0 0 10px var(--nd-orange)', '0 0 4px var(--nd-orange)'] } : { boxShadow: '0 0 0px transparent' }}
                  transition={{ duration: 1, repeat: Infinity }}
                >{i + 1}</motion.div>
                <div className="nd-htext">{s.desc}</div>
              </motion.div>
            ))}
          </div>
          <div className="nd-rbox nd-benefitsbox">
            <div className="nd-rhdr nd-gold">KEY BENEFITS</div>
            {['Elasticity — Scale to demand', 'Cost Savings — No idle instances', 'High Availability — Multi-AZ', 'Self-Healing — Replace unhealthy', 'Zero-Downtime — Instance Refresh', 'Predictive — ML-based scaling', 'Integrated — ALB + CloudWatch'].map((b, i) => (
              <div key={i} className="nd-ben">
                <span className="nd-tick">+</span>{b}
              </div>
            ))}
          </div>
        </div>

      </div>{/* nd-body */}

      {/* BOTTOM: Key Features */}
      <div className="nd-bottom">
        <div className="nd-btitle co">KEY FEATURES</div>
        <div className="nd-bgrid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {KEY_FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              className="nd-bcard"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,140,0,0.4)' }}
            >
              <div className="nd-bicon">{feat.icon}</div>
              <div className="nd-bname">{feat.name}</div>
              <div className="nd-bdesc">{feat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
