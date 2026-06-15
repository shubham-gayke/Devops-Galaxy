import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './NeonDiagram.css'
import './IAMArchitecture.css'

const STEPS = [
  { n:1, title:'Create Users',         desc:'Create IAM users for people or applications.'              },
  { n:2, title:'Create Groups',        desc:'Organize users by adding them to groups.'                  },
  { n:3, title:'Attach Policies',      desc:'Attach policies to users/groups to define permissions.'    },
  { n:4, title:'Authenticate',         desc:'Users authenticate via password, MFA or access keys.'      },
  { n:5, title:'Access AWS Resources', desc:'IAM authorizes the request based on attached policies.'    },
  { n:6, title:'Monitor & Audit',      desc:'Track activity using CloudTrail and IAM Access Analyzer.'  },
  { n:7, title:'Review & Refine',      desc:'Review permissions regularly and follow least privilege.'  },
]

const HIW = [
  'Users or applications are created in IAM.',
  'They are added to groups or assigned roles.',
  'Policies are attached to grant permissions.',
  'Users authenticate using secure methods.',
  'IAM evaluates the request and allows or denies.',
  'All activity is logged and monitored.',
  'Permissions are reviewed regularly.',
]

const BENEFITS = [
  'Centralized access management',
  'Fine-grained permissions',
  'Secure with least privilege',
  'Auditable and compliant',
  'Supports MFA and federation',
  'Scalable and flexible',
]

const CONCEPTS = [
  { num:'1', name:'User',       desc:'An individual or application.'         },
  { num:'2', name:'Group',      desc:'Collection of users for management.'   },
  { num:'3', name:'Role',       desc:'Temporary permissions for users/services.' },
  { num:'4', name:'Policy',     desc:'JSON document that defines permissions.' },
  { num:'5', name:'Permission', desc:'Allow or deny access to AWS actions.'  },
  { num:'6', name:'Resource',   desc:'AWS service or resource being accessed.' },
]

const IDENTITIES = [
  { lbl:'Users',              active: (s) => [0,6].includes(s)       },
  { lbl:'Groups',             active: (s) => [1,6].includes(s)       },
  { lbl:'Roles',              active: (s) => [0,1,2,3,4,5,6].includes(s) },
  { lbl:'Service Roles',      active: (s) => [0,1,2,3,4,5,6].includes(s) },
]

const AUTH_METHODS = [
  { lbl:'Password'       },
  { lbl:'MFA'            },
  { lbl:'Access Keys'    },
  { lbl:'Federation/SSO' },
]

const POLICIES = [
  'Managed Policies',
  'Inline Policies',
  'Customer Managed',
]

const ROLES = [
  { name: 'EC2 Role', desc: 'Allows EC2 instances to access S3/DynamoDB' },
  { name: 'Lambda Role', desc: 'Allows Lambda to write to CloudWatch' },
]

const STEP_COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ff8c00', '#ff006e', '#ffd700', '#3b82f6']

const RESOURCES = [
  'EC2','S3','RDS','Lambda','DynamoDB','...more'
]

export default function IAMArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 7), 2500)
    return () => clearInterval(t)
  }, [playing])

  const g = (sec) => {
    const map = {
      id:  [0,1,2,3,4,5,6],
      idu: [0,6], idg: [1,6],
      au:  [3,4,5,6],
      pol: [2,4,5,6],
      ev:  [4,5,6],
      res: [4,5,6],
      ad:  [4,5,6],
      mon: [5,6],
    }
    return (map[sec]||[]).includes(step)
  }

  const f = (arrow) => {
    const map = {
      'id-au':  [3,4,5,6],
      'top-fl': [2,3,4,5,6],
      'p-ev':   [4,5,6],
      'ev-r':   [4,5,6],
      'fl-mo':  [5,6],
    }
    return (map[arrow]||[]).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  return (
    <motion.div
      className="nd-wrap iam-wrap"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" />
        <div className="nd-bar-center">
          <span className="nd-bar-icon iam-bar-icon">IAM</span>
          <h2 className="nd-bar-title">AWS IAM – ARCHITECTURE &amp; WORKFLOW</h2>
        </div>
        <div className="nd-bar-line" />
      </div>
      <div className="nd-subtitle">Secure access to your AWS resources</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn iam-playbtn" onClick={() => setPlaying(p => !p)}>
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
        <div className="iam-center">

          {/* Top row: IDENTITIES → AUTH */}
          <div className="iam-toprow">
            <div className={cx('ndbox bc iam-id', g('id') && 'gc')}>
              <div className="ndbox-lbl cc">IDENTITIES</div>
              <div className="iam-iconrow">
                {IDENTITIES.map((it,i) => (
                  <div key={i} className={cx('iam-iconcard', it.active(step) && 'iam-icon-on')}>
                    <span className="iam-num-badge">{i+1}</span>
                    <span className="iam-iclbl">{it.lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="iam-dash-arr">
              <div className={cx('nd-haline', f('id-au') && 'nd-fh')}>
                <div className="ndpkt pkc" />
              </div>
              <span className="nd-hahead">→</span>
            </div>

            {/* AUTHENTICATION */}
            <div className={cx('ndbox bp iam-auth', g('au') && 'gp')}>
              <div className="ndbox-lbl cp">AUTHENTICATION</div>
              <div className="iam-iconrow">
                {AUTH_METHODS.map((it,i) => (
                  <div key={i} className={cx('iam-iconcard', g('au') && 'iam-icon-on iam-icon-p')}>
                    <span className="iam-num-badge iam-num-p">{i+1}</span>
                    <span className="iam-iclbl">{it.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Down arrow */}
          <div className="nd-varrow iam-va">
            <div className={cx('nd-valine', f('top-fl') && 'nd-fv')}>
              <div className="ndpkt pkp" />
            </div>
            <div className="nd-vahead">▼</div>
          </div>

          {/* IAM AUTHORIZATION FLOW */}
          <div className={cx('ndbox bv iam-flowbox', (g('pol')||g('ev')||g('res')) && 'gv')}>
            <div className="ndbox-lbl cv">IAM AUTHORIZATION FLOW</div>
            <div className="iam-flowin">

              {/* POLICIES + PERMS */}
              <div className="iam-polcol">
                <div className={cx('ndbox bb iam-subbox', g('pol') && 'gb')}>
                  <div className="ndbox-lbl cb">POLICIES</div>
                  {POLICIES.map((p,i) => (
                    <div key={i} className="iam-prow">
                      <span className="iam-pnum">{i+1}</span> {p}
                    </div>
                  ))}
                </div>
                <div className={cx('ndbox bv iam-perms', g('pol') && 'gv')}>
                  <div className="ndbox-lbl cv" style={{fontSize:'0.48rem', lineHeight:1.3}}>
                    PERMISSIONS BOUNDARIES &amp; SESSION POLICIES
                  </div>
                  <div className="iam-permdesc">Extra layer of control on permissions.</div>
                </div>
              </div>

              {/* Arrow pol→eval */}
              <div className="iam-inarr">
                <div className={cx('nd-haline', f('p-ev') && 'nd-fh')}>
                  <div className="ndpkt pkv" />
                </div>
                <span className="nd-hahead cv">→</span>
              </div>

              {/* POLICY EVALUATION */}
              <div className={cx('ndbox bv iam-subbox iam-eval', g('ev') && 'gv')}>
                <div className="ndbox-lbl cv">POLICY EVALUATION</div>
                <div className="iam-funnel">
                  <div className="iam-fitem" style={{color:'#ff4444', borderColor:'rgba(255,68,68,0.2)'}}>1. Explicit Deny</div>
                  <div className="iam-fitem" style={{color:'#00ff88', borderColor:'rgba(0,255,136,0.2)'}}>2. Explicit Allow</div>
                  <div className="iam-fitem" style={{color:'#475569', borderColor:'rgba(71,85,105,0.2)'}}>3. Implicit Deny</div>
                </div>
              </div>

              {/* Arrow eval→res */}
              <div className="iam-inarr">
                <div className={cx('nd-haline', f('ev-r') && 'nd-fh')}>
                  <div className="ndpkt pkg" />
                </div>
                <span className="nd-hahead cg">→</span>
              </div>

              {/* AWS RESOURCES */}
              <div className={cx('ndbox bg iam-subbox iam-res', g('res') && 'gg')}>
                <div className="ndbox-lbl cg">AWS RESOURCES</div>
                {RESOURCES.map((r,i) => (
                  <div key={i} className="iam-rrow">
                    <span className="iam-rnum">{i+1}</span> {r}
                  </div>
                ))}
              </div>

              {/* ALLOW / DENY circles */}
              <div className="iam-adcol">
                <div className={cx('iam-reqbox', g('ad') && 'iam-reqglow')}>
                  REQUEST<br/>ALLOW/DENY
                </div>
                <div className="iam-circle iam-allow">ALLOW</div>
                <div className="iam-circle iam-deny">DENY</div>
              </div>
            </div>
          </div>

          {/* Down arrow */}
          <div className="nd-varrow iam-va">
            <div className={cx('nd-valine', f('fl-mo') && 'nd-fv')}>
              <div className="ndpkt pko" />
            </div>
            <div className="nd-vahead">▼</div>
          </div>

          {/* MONITORING */}
          <div className={cx('ndbox bo iam-mon', g('mon') && 'go')}>
            <div className="ndbox-lbl co">MONITORING &amp; AUDIT</div>
            <div className="iam-monrow">
              {[
                { num:'1', nm:'CloudTrail',       ds:'Records API activity'            },
                { num:'2', nm:'Access Analyzer',  ds:'Detects unused/external access'  },
                { num:'3', nm:'AWS Config',       ds:'Tracks IAM resource changes'     },
                { num:'4', nm:'CloudWatch',       ds:'Alarms and monitoring'           },
              ].map((m,i) => (
                <div key={i} className="iam-moncard">
                  <span className="iam-monnum">{m.num}</span>
                  <div className="iam-monnm">{m.nm}</div>
                  <div className="iam-monde">{m.ds}</div>
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
        <div className="nd-btitle cp">KEY IAM CONCEPTS</div>
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
