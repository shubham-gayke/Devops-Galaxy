import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './NeonDiagram.css'
import './VPCArchitecture.css'

const STEPS = [
  { n:1, title:'Create VPC',             desc:'Define your virtual network (CIDR block).'                },
  { n:2, title:'Create Subnets',         desc:'Add public and private subnets in multiple AZs.'          },
  { n:3, title:'Configure Route Tables', desc:'Define routes for traffic within the VPC and to internet.' },
  { n:4, title:'Configure Gateways',     desc:'Attach Internet Gateway for outbound Internet access.'    },
  { n:5, title:'Add Security',           desc:'Use Security Groups and ACLs to control traffic.'         },
  { n:6, title:'Launch Resources',       desc:'Deploy your resources (EC2, RDS, etc.) in your VPC.'     },
  { n:7, title:'Access & Communicate',   desc:'Users access your apps via the Internet securely.'        },
]

const HIW = [
  'Users access your application through the Internet.',
  'Traffic enters the VPC through the Internet Gateway and reaches the public subnets.',
  'The ALB distributes traffic to EC2 instances in private subnets.',
  'Private instances access Internet for updates via NAT Gateway.',
  'Databases in isolated subnets are not accessible from the Internet.',
  'Route tables ensure traffic takes the correct path.',
  'Security Groups and ACLs enforce network security.',
]

const BENEFITS = [
  'Isolated & private network',
  'Full control of IP address range',
  'Secure with multiple layers',
  'Highly available across AZs',
  'Scalable and flexible',
]

const SECURITY = [
  { num:'A', name:'Security Groups', desc:'Stateful — instance level' },
  { num:'B', name:'Network ACLs',    desc:'Stateless — subnet level'  },
  { num:'C', name:'Inbound/Outbound',desc:'Control all traffic flow'  },
]

const STEP_COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ff8c00', '#ff006e', '#ffd700', '#3b82f6']

// Simple div-based route table row — no HTML table to overflow
function RTRow({ dest, target, color }) {
  return (
    <div className="vpc-rtrow">
      <span className="vpc-rtdest">{dest}</span>
      <span className="vpc-rtarrow">→</span>
      <span className="vpc-rttarget" style={{ color }}>{target}</span>
    </div>
  )
}

export default function VPCArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 7), 2500)
    return () => clearInterval(t)
  }, [playing])

  const g = (sec) => {
    const map = {
      vpc:    [0,1,2,3,4,5,6],
      inet:   [0,3,4,6],
      igw:    [3,4,6],
      pub:    [1,2,3,4,6],
      priv:   [1,2,4,5,6],
      db:     [1,2,4,5,6],
      alb:    [3,6],
      ec2:    [5,6],
      rds:    [5,6],
      rt_pub: [2,3,4,6],
      rt_prv: [2,4],
      nat:    [4,6],
      sg:     [4,5,6],
    }
    return (map[sec]||[]).includes(step)
  }

  const f = (arrow) => {
    const map = {
      'inet-igw': [3,4,6],
      'igw-pub':  [3,4,6],
      'pub-priv': [3,4,5,6],
      'priv-db':  [4,5,6],
      'priv-nat': [4],
      'nat-inet': [4],
    }
    return (map[arrow]||[]).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  return (
    <motion.div
      className="nd-wrap vpc-wrap"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#00d4ff,transparent)'}} />
        <div className="nd-bar-center">
          <span className="nd-bar-icon vpc-bar-icon">VPC</span>
          <h2 className="nd-bar-title vpc-title">AWS VPC – ARCHITECTURE &amp; WORKFLOW</h2>
        </div>
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#00d4ff,transparent)'}} />
      </div>
      <div className="nd-subtitle">Your own isolated network in the AWS Cloud</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn vpc-playbtn" onClick={() => setPlaying(p => !p)}>
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
          <div className="nd-panel-hdr cc">WORKFLOW</div>
          <div className="nd-panel-sub">HOW IT WORKS</div>
          {STEPS.map((s,i) => (
            <div key={i}>
              <motion.div
                className={cx('nd-step', step===i && 'nd-on')}
                style={step===i ? {background:'rgba(0,212,255,0.07)', borderColor:'rgba(0,212,255,0.3)'} : {}}
                onClick={() => { setStep(i); setPlaying(false) }}
                animate={{ scale: step===i ? 1.02 : 1 }}
                transition={{ duration:0.15 }}
              >
                <div className="nd-badge" style={{
                  borderColor:'#00d4ff',
                  color: step===i ? '#050510' : '#00d4ff',
                  background: step===i ? '#00d4ff' : 'rgba(0,212,255,0.1)',
                  boxShadow: step===i ? '0 0 8px #00d4ff' : 'none'
                }}>{s.n}</div>
                <div>
                  <div className="nd-stitle" style={step===i ? {color:'#00d4ff'} : {}}>{s.title}</div>
                  <div className="nd-sdesc">{s.desc}</div>
                </div>
              </motion.div>
              {i < 6 && <div className="nd-step-sep">↓</div>}
            </div>
          ))}
        </div>

        {/* CENTER: Architecture */}
        <div className="vpc-center">

          {/* Internet → IGW */}
          <div className="vpc-inet-wrap">
            <div className={cx('vpc-inet', g('inet') && 'vpc-inet-glow')}>
              Internet
            </div>
            <div className="vpc-sv">
              <div className={cx('nd-valine', f('inet-igw') && 'nd-fv')} style={{height:'14px'}}>
                <div className="ndpkt pkc" />
              </div>
              <div className="nd-vahead cc">▼</div>
            </div>
            <div className={cx('vpc-igw', g('igw') && 'vpc-igw-glow')}>
              <span className="vpc-igw-badge">IGW</span>
              <span>Internet Gateway</span>
            </div>
            <div className="vpc-sv">
              <div className={cx('nd-valine', f('igw-pub') && 'nd-fv')} style={{height:'12px'}}>
                <div className="ndpkt pkc" />
              </div>
              <div className="nd-vahead cc">▼</div>
            </div>
          </div>

          {/* VPC Boundary Box */}
          <div className={cx('ndbox bc vpc-box', g('vpc') && 'gc')}>

            {/* Header row */}
            <div className="vpc-box-hdr">
              <span className="vpc-hdr-vpc">VPC</span>
              <span className="vpc-hdr-cidr">10.0.0.0/16</span>
              <span className="vpc-az-tag vpc-az-a">AZ-A</span>
              <span className="vpc-az-tag vpc-az-b">AZ-B</span>
            </div>

            {/* 3-column grid: AZ-A | Center | AZ-B */}
            <div className="vpc-inner-grid">

              {/* ── AZ A ── */}
              <div className="vpc-az">

                <div className={cx('vpc-subnet vpc-pub', g('pub') && 'vpc-pub-glow')}>
                  <div className="vpc-sub-lbl">Public Subnet A</div>
                  <div className="vpc-sub-cidr">10.0.1.0/24</div>
                  <div className={cx('vpc-alb', g('alb') && 'vpc-alb-glow')}>ALB</div>
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('pub-priv') && 'nd-fv')} style={{height:'10px'}}>
                    <div className="ndpkt pkg" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-subnet vpc-priv', g('priv') && 'vpc-priv-glow')}>
                  <div className="vpc-sub-lbl">Private Subnet A</div>
                  <div className="vpc-sub-cidr">10.0.3.0/24</div>
                  <div className={cx('vpc-ec2-pair', g('ec2') && 'vpc-ec2-glow')}>
                    <span className="vpc-ec2-badge">EC2</span>
                    <span className="vpc-ec2-badge">EC2</span>
                  </div>
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('priv-db') && 'nd-fv')} style={{height:'10px'}}>
                    <div className="ndpkt pkv" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-subnet vpc-db', g('db') && 'vpc-db-glow')}>
                  <div className="vpc-sub-lbl">Database Subnet A</div>
                  <div className="vpc-sub-cidr">10.0.5.0/24</div>
                  <div className={cx('vpc-rds', g('rds') && 'vpc-rds-glow')}>RDS</div>
                </div>
              </div>

              {/* ── CENTER: Route Tables + NAT ── */}
              <div className="vpc-rtables">

                <div className={cx('vpc-rt', g('rt_pub') && 'vpc-rt-glow')}>
                  <div className="vpc-rt-hdr cc">ROUTE TABLE<br/>(PUBLIC)</div>
                  <RTRow dest="10.0.0.0/16" target="local"    color="#00ff88" />
                  <RTRow dest="0.0.0.0/0"   target="IGW"      color="#00d4ff" />
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('priv-nat') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pko" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-rt', g('rt_prv') && 'vpc-rt-glow')}>
                  <div className="vpc-rt-hdr co">ROUTE TABLE<br/>(PRIVATE)</div>
                  <RTRow dest="10.0.0.0/16" target="local"    color="#00ff88" />
                  <RTRow dest="0.0.0.0/0"   target="NAT GW"   color="#ff8c00" />
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('priv-nat') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pko" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-nat', g('nat') && 'vpc-nat-glow')}>
                  <div className="vpc-nat-badge">NAT</div>
                  <div>
                    <div className="vpc-nat-title">NAT Gateway</div>
                    <div className="vpc-nat-sub">Outbound only</div>
                  </div>
                </div>

                {f('nat-inet') && (
                  <div className="vpc-sv" style={{marginTop:'0.2rem'}}>
                    <div className="nd-vahead co">▲</div>
                    <div className="nd-valine nd-fv" style={{height:'10px'}}>
                      <div className="ndpkt pko" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── AZ B ── */}
              <div className="vpc-az">

                <div className={cx('vpc-subnet vpc-pub', g('pub') && 'vpc-pub-glow')}>
                  <div className="vpc-sub-lbl">Public Subnet B</div>
                  <div className="vpc-sub-cidr">10.0.2.0/24</div>
                  <div className={cx('vpc-alb', g('alb') && 'vpc-alb-glow')}>ALB</div>
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('pub-priv') && 'nd-fv')} style={{height:'10px'}}>
                    <div className="ndpkt pkg" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-subnet vpc-priv', g('priv') && 'vpc-priv-glow')}>
                  <div className="vpc-sub-lbl">Private Subnet B</div>
                  <div className="vpc-sub-cidr">10.0.4.0/24</div>
                  <div className={cx('vpc-ec2-pair', g('ec2') && 'vpc-ec2-glow')}>
                    <span className="vpc-ec2-badge">EC2</span>
                    <span className="vpc-ec2-badge">EC2</span>
                  </div>
                </div>

                <div className="vpc-sv">
                  <div className={cx('nd-valine', f('priv-db') && 'nd-fv')} style={{height:'10px'}}>
                    <div className="ndpkt pkv" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>

                <div className={cx('vpc-subnet vpc-db', g('db') && 'vpc-db-glow')}>
                  <div className="vpc-sub-lbl">Database Subnet B</div>
                  <div className="vpc-sub-cidr">10.0.6.0/24</div>
                  <div className={cx('vpc-rds', g('rds') && 'vpc-rds-glow')}>RDS</div>
                </div>
              </div>

            </div>{/* vpc-inner-grid */}
          </div>{/* vpc-box */}

          {/* SECURITY row */}
          <div className={cx('ndbox bp vpc-sec', g('sg') && 'gp')}>
            <div className="ndbox-lbl cp">SECURITY LAYERS</div>
            <div className="vpc-sec-row">
              {SECURITY.map((s,i) => (
                <div key={i} className="vpc-sec-card">
                  <div className="vpc-sec-num">{s.num}</div>
                  <div className="vpc-sec-name">{s.name}</div>
                  <div className="vpc-sec-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="vpc-legend">
            {[
              { c:'#00d4ff', label:'Internet traffic' },
              { c:'#00ff88', label:'Public traffic'   },
              { c:'#a855f7', label:'DB traffic'       },
              { c:'#ff8c00', label:'NAT traffic'      },
            ].map((l,i) => (
              <div key={i} className="vpc-legend-item">
                <div className="vpc-legend-line" style={{background:l.c}} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: How It Works + Benefits */}
        <div className="nd-right">
          <div className="nd-rbox" style={{borderColor:'rgba(0,212,255,0.2)', background:'rgba(0,212,255,0.02)'}}>
            <div className="nd-rhdr cc">HOW IT WORKS</div>
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
                <span className="nd-tick">+</span>{b}
              </div>
            ))}
          </div>
        </div>

      </div>{/* nd-body */}
    </motion.div>
  )
}
