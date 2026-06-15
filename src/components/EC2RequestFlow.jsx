import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../NeonDiagram.css'
import '../styles/EC2RequestFlow.css'

const STEPS = [
  { n:1, title:'Launch an Instance',  desc:'Choose an AMI, instance type, key pair and launch.'         },
  { n:2, title:'Configure Network',   desc:'Select a VPC, subnet, and security group.'                  },
  { n:3, title:'Attach Storage',      desc:'Add EBS volumes for persistent storage.'                    },
  { n:4, title:'Assign IAM Role',     desc:'Attach an IAM role to allow secure access to AWS services.' },
  { n:5, title:'Connect to Instance', desc:'Connect using SSH (Linux) or RDP (Windows) securely.'      },
  { n:6, title:'Monitor & Manage',    desc:'Monitor performance, create backups and scale.'             },
  { n:7, title:'Terminate or Stop',   desc:'Stop or terminate the instance when not needed.'            },
]

const HIW = [
  'You launch an EC2 instance from an Amazon Machine Image (AMI).',
  'The instance gets a private IP in your subnet and is protected by a Security Group.',
  'Traffic from the Internet goes through the Internet Gateway and Load Balancer.',
  'The instance can access other AWS services securely.',
  'You can attach EBS volumes for persistent storage.',
  'You monitor and manage the instance using CloudWatch and Systems Manager.',
  'When not needed, you can stop or terminate the instance to save costs.',
]

const BENEFITS = [
  'Fully scalable compute capacity',
  'Secure and isolated environment',
  'Flexible instance types',
  'High availability across AZs',
  'Pay only for what you use',
  'Easy to manage and automate',
]

const COMPONENTS = [
  { num:'1', name:'AMI',          desc:'Machine Image'    },
  { num:'2', name:'Instance Type',desc:'vCPU, RAM, Net'   },
  { num:'3', name:'Key Pair',     desc:'SSH Access'        },
  { num:'4', name:'Elastic IP',   desc:'Static IP'         },
  { num:'5', name:'User Data',    desc:'Script on Launch'  },
  { num:'6', name:'IAM Role',     desc:'Access AWS services'},
]

const INTEGRATIONS = [
  { num:'1', name:'IAM',         sub:'Access Control' },
  { num:'2', name:'S3',          sub:'Storage'        },
  { num:'3', name:'CloudWatch',  sub:'Monitoring'     },
  { num:'4', name:'CloudTrail',  sub:'Auditing'       },
  { num:'5', name:'Sys Manager', sub:'Management'     },
  { num:'6', name:'KMS',         sub:'Encryption'     },
]

const STEP_COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ff8c00', '#ff006e', '#ffd700', '#3b82f6']

export default function EC2RequestFlow() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 7), 2500)
    return () => clearInterval(t)
  }, [playing])

  const g = (sec) => {
    const map = {
      inet:  [0,1,2,3,4,5,6],
      igw:   [0,1,4,5,6],
      vpc:   [0,1,2,3,4,5,6],
      pub:   [0,1,4,5,6],
      priv:  [0,2,3,4,5,6],
      alb:   [0,1,4,5,6],
      ec2:   [0,3,4,5,6],
      data:  [2,5,6],
      ebs:   [2,5,6],
      rds:   [2,5,6],
      sg:    [1,3,4,5,6],
      asg:   [0,5,6],
    }
    return (map[sec]||[]).includes(step)
  }

  const f = (arrow) => {
    const map = {
      'inet-igw': [0,1,4,5,6],
      'igw-pub':  [0,1,4,5,6],
      'pub-priv': [0,1,4,5,6],
      'priv-data':[2,5,6],
      'az-az':    [0,4,5,6],
    }
    return (map[arrow]||[]).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  return (
    <motion.div
      className="nd-wrap ec2-wrap"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#ff6b35,transparent)'}} />
        <div className="nd-bar-center">
          <span className="nd-bar-icon ec2-bar-icon">EC2</span>
          <h2 className="nd-bar-title ec2-title">AWS EC2 – ARCHITECTURE &amp; WORKFLOW</h2>
        </div>
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#ff6b35,transparent)'}} />
      </div>
      <div className="nd-subtitle">Scalable Virtual Servers in the AWS Cloud</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn ec2-playbtn" onClick={() => setPlaying(p => !p)}>
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

        {/* LEFT */}
        <div className="nd-left">
          <div className="nd-panel-hdr" style={{color:'#ff6b35'}}>WORKFLOW</div>
          <div className="nd-panel-sub">HOW IT WORKS</div>
          {STEPS.map((s,i) => (
            <div key={i}>
              <motion.div
                className={cx('nd-step', step===i && 'nd-on')}
                style={step===i ? {background:'rgba(255,107,53,0.07)', borderColor:'rgba(255,107,53,0.3)'} : {}}
                onClick={() => { setStep(i); setPlaying(false) }}
                animate={{ scale: step===i ? 1.02 : 1 }}
                transition={{ duration:0.15 }}
              >
                <div className="nd-badge" style={{
                  borderColor:'#ff6b35',
                  background: step===i ? '#ff6b35' : 'rgba(255,107,53,0.1)',
                  color: step===i ? '#050510' : '#ff6b35',
                  boxShadow: step===i ? '0 0 8px #ff6b35' : 'none'
                }}>{s.n}</div>
                <div>
                  <div className="nd-stitle" style={step===i ? {color:'#ff6b35'} : {}}>{s.title}</div>
                  <div className="nd-sdesc">{s.desc}</div>
                </div>
              </motion.div>
              {i < 6 && <div className="nd-step-sep">↓</div>}
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div className="ec2-center">

          {/* Internet + IGW */}
          <div className="ec2-inet-row">
            <div className={cx('ec2-inet', g('inet') && 'ec2-inet-glow')}>
              Internet
              <div className="ec2-inet-arrows">↑↓</div>
            </div>
            <div className="ec2-igw-wrap">
              <div className={cx('ec2-igw', g('igw') && 'ec2-igw-glow')}>
                <span className="ec2-svc-badge" style={{background:'#00d4ff',color:'#050510'}}>IGW</span>
                <span style={{fontSize:'0.5rem', color:'#94a3b8'}}>Internet Gateway</span>
              </div>
              <div className="ec2-igw-arrows">
                <div className={cx('nd-valine ec2-igwline', f('igw-pub') && 'nd-fv')}>
                  <div className="ndpkt pkc" />
                </div>
                <div className="nd-vahead" style={{color:'rgba(0,212,255,0.4)'}}>▼</div>
              </div>
            </div>
          </div>

          {/* AWS Cloud */}
          <div className="ndbox bp ec2-cloud">
            <div className="ec2-cloud-label">AWS CLOUD</div>
            <div className="ec2-vpc-lbl">
              VPC <span style={{color:'#64748b'}}>10.0.0.0/16</span>
              <span className="ec2-az-badge">AZ-A</span>
              <span className="ec2-az-badge" style={{color:'#00d4ff', borderColor:'rgba(0,212,255,0.3)'}}>AZ-B</span>
            </div>

            <div className="ec2-az-grid">

              {/* AZ A */}
              <div className="ec2-az">
                <div className={cx('ec2-subnet ec2-pub', g('pub') && 'ec2-pub-glow')}>
                  <div className="ec2-subnet-lbl">Public Subnet A <span>10.0.1.0/24</span></div>
                  <div className={cx('ec2-alb', g('alb') && 'ec2-alb-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#00ff88',color:'#050510'}}>ALB</span>
                    <span>Load Balancer</span>
                  </div>
                </div>
                <div className="ec2-va-wrap">
                  <div className={cx('nd-valine', f('pub-priv') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pkg" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>
                <div className={cx('ec2-subnet ec2-priv', g('priv') && 'ec2-priv-glow')}>
                  <div className="ec2-subnet-lbl">Private Subnet A <span>10.0.3.0/24</span></div>
                  <div className={cx('ec2-inst', g('ec2') && 'ec2-inst-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#ff6b35',color:'#050510'}}>EC2</span>
                    <div>
                      <div style={{fontSize:'0.5rem', fontWeight:700}}>EC2 Instance</div>
                      <div style={{fontSize:'0.44rem', color:'#64748b'}}>Web Server</div>
                    </div>
                  </div>
                </div>
                <div className="ec2-va-wrap">
                  <div className={cx('nd-valine', f('priv-data') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pko" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>
                <div className={cx('ec2-subnet ec2-data', g('data') && 'ec2-data-glow')}>
                  <div className="ec2-subnet-lbl">Data Subnet A <span>10.0.5.0/24</span></div>
                  <div className={cx('ec2-ebs', g('ebs') && 'ec2-ebs-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#3b82f6',color:'#050510'}}>EBS</span>
                    Volume
                  </div>
                </div>
              </div>

              {/* Center: ASG + RDS */}
              <div className="ec2-center-col">
                <div style={{height:'58px'}} />
                <div className="ec2-va-wrap"><div className="nd-valine" style={{height:'12px'}}/><div className="nd-vahead">▼</div></div>
                <div className={cx('ec2-asg', g('asg') && 'ec2-asg-glow')}>
                  <div style={{fontSize:'0.46rem', fontWeight:900, color:'#ff8c00'}}>AUTO</div>
                  <div style={{fontSize:'0.42rem', color:'#64748b'}}>SCALING</div>
                  <div className="ec2-asg-arrows">
                    <div className={cx('nd-haline', f('az-az') && 'nd-fh')} style={{width:'22px'}}>
                      <div className="ndpkt pko" />
                    </div>
                    <span style={{fontSize:'0.5rem', color:'rgba(255,140,0,0.4)'}}>↔</span>
                    <div className={cx('nd-haline', f('az-az') && 'nd-fh')} style={{width:'22px'}}>
                      <div className="ndpkt pko" />
                    </div>
                  </div>
                </div>
                <div className="ec2-va-wrap"><div className="nd-valine" style={{height:'12px'}}/><div className="nd-vahead">▼</div></div>
                <div className={cx('ec2-rds', g('rds') && 'ec2-rds-glow')}>
                  <span className="ec2-svc-badge" style={{background:'#3b82f6',color:'#050510'}}>RDS</span>
                  <div style={{fontSize:'0.46rem', color:'#3b82f6', fontWeight:700}}>Amazon RDS</div>
                </div>
              </div>

              {/* AZ B */}
              <div className="ec2-az">
                <div className={cx('ec2-subnet ec2-pub', g('pub') && 'ec2-pub-glow')}>
                  <div className="ec2-subnet-lbl">Public Subnet B <span>10.0.2.0/24</span></div>
                  <div className={cx('ec2-alb', g('alb') && 'ec2-alb-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#00ff88',color:'#050510'}}>ALB</span>
                    <span>Load Balancer</span>
                  </div>
                </div>
                <div className="ec2-va-wrap">
                  <div className={cx('nd-valine', f('pub-priv') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pkg" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>
                <div className={cx('ec2-subnet ec2-priv', g('priv') && 'ec2-priv-glow')}>
                  <div className="ec2-subnet-lbl">Private Subnet B <span>10.0.4.0/24</span></div>
                  <div className={cx('ec2-inst', g('ec2') && 'ec2-inst-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#ff6b35',color:'#050510'}}>EC2</span>
                    <div>
                      <div style={{fontSize:'0.5rem', fontWeight:700}}>EC2 Instance</div>
                      <div style={{fontSize:'0.44rem', color:'#64748b'}}>Web Server</div>
                    </div>
                  </div>
                </div>
                <div className="ec2-va-wrap">
                  <div className={cx('nd-valine', f('priv-data') && 'nd-fv')} style={{height:'12px'}}>
                    <div className="ndpkt pko" />
                  </div>
                  <div className="nd-vahead">▼</div>
                </div>
                <div className={cx('ec2-subnet ec2-data', g('data') && 'ec2-data-glow')}>
                  <div className="ec2-subnet-lbl">Data Subnet B <span>10.0.6.0/24</span></div>
                  <div className={cx('ec2-ebs', g('ebs') && 'ec2-ebs-glow')}>
                    <span className="ec2-svc-badge" style={{background:'#3b82f6',color:'#050510'}}>EBS</span>
                    Volume
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Security Group */}
          <div className={cx('ec2-sg', g('sg') && 'ec2-sg-glow')}>
            <div className="ec2-sg-title">Security Group</div>
            <div className="ec2-sg-section">Inbound Rules</div>
            {[['SSH','22','My IP'],['HTTP','80','0.0.0.0/0'],['HTTPS','443','0.0.0.0/0']]
              .map(([t,p,s],i) => (
                <div key={i} className="ec2-sg-row">
                  <span className="ec2-sg-num">{i+1}</span>
                  <span>{t}</span><span>{p}</span><span>{s}</span>
                </div>
              ))}
            <div className="ec2-sg-section">Outbound Rules</div>
            <div className="ec2-sg-row">
              <span className="ec2-sg-num">1</span>
              <span>All Traffic</span><span>All</span><span>0.0.0.0/0</span>
            </div>
          </div>

          {/* Legend */}
          <div className="ec2-legend">
            {[
              { c:'#00d4ff', label:'Internet' },
              { c:'#00ff88', label:'Public'   },
              { c:'#ff6b35', label:'Private'  },
              { c:'#3b82f6', label:'Storage'  },
            ].map((l,i) => (
              <div key={i} className="ec2-legend-item">
                <div className="ec2-legend-line" style={{background:l.c}} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="nd-right">
          <div className="nd-rbox" style={{borderColor:'rgba(255,107,53,0.2)', background:'rgba(255,107,53,0.02)'}}>
            <div className="nd-rhdr" style={{color:'#ff6b35'}}>HOW IT WORKS</div>
            {HIW.map((text,i) => (
              <div key={i} className={cx('nd-hiw', step===i && 'nd-hiwon')}
                style={step===i ? {background:'rgba(255,107,53,0.04)', borderColor:'rgba(255,107,53,0.25)'} : {}}>
                <div className="nd-hnum" style={step===i ? {background:'#ff6b35', color:'#050510', boxShadow:'0 0 6px #ff6b35'} : {borderColor:'rgba(255,107,53,0.3)', color:'#ff6b35', background:'rgba(255,107,53,0.1)'}}>{i+1}</div>
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

      {/* BOTTOM: Components */}
      <div className="nd-bottom">
        <div className="nd-btitle" style={{color:'#ff6b35'}}>EC2 INSTANCE COMPONENTS</div>
        <div className="nd-bgrid" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
          {COMPONENTS.map((c,i) => (
            <div key={i} className="nd-bcard">
              <span className="nd-bnum ec2-bnum">{c.num}</span>
              <div className="nd-bname">{c.name}</div>
              <div className="nd-bdesc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: Integrations */}
      <div style={{marginTop:'0.5rem', paddingTop:'0.5rem', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="nd-btitle" style={{color:'#3b82f6'}}>INTEGRATION WITH AWS SERVICES</div>
        <div className="nd-bgrid" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
          {INTEGRATIONS.map((c,i) => (
            <div key={i} className="nd-bcard">
              <span className="nd-bnum ec2-bnum-blue">{c.num}</span>
              <div className="nd-bname">{c.name}</div>
              <div className="nd-bdesc">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
