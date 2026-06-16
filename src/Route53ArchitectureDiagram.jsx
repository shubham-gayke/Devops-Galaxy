import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './NeonDiagram.css'
import './Route53Architecture.css'

const STEPS = [
  { n:1, title:'User Requests',    desc:'User types www.example.com in the browser' },
  { n:2, title:'DNS Query',        desc:'The request goes to a DNS Resolver' },
  { n:3, title:'Route 53 Resolves',desc:'Resolver queries Route 53 Authoritative Name Servers' },
  { n:4, title:'Routing Decision', desc:'Route 53 returns the best healthy endpoint based on routing policy' },
  { n:5, title:'Response',         desc:'Resolver returns the IP / Alias target to the user' },
  { n:6, title:'Connect',          desc:'Browser connects to the chosen AWS resource' },
]

const ROUTING_POLICIES = [
  { icon:'🌐', name:'Latency Based', desc:'Best latency to user' },
  { icon:'🔄', name:'Failover',      desc:'Primary/Secondary' },
  { icon:'⚖️', name:'Weighted',      desc:'Distribute traffic by weight' },
  { icon:'📍', name:'Geolocation',   desc:'Route by user location' },
  { icon:'🎯', name:'Geoproximity',  desc:'Route by proximity & bias' },
]

const STEP_COLORS = ['#3b82f6', '#00d4ff', '#a855f7', '#ff006e', '#00ff88', '#ff8c00']

export default function Route53ArchitectureDiagram() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => (s + 1) % 6), 2500)
    return () => clearInterval(t)
  }, [playing])

  const g = (sec) => {
    const map = {
      user:     [0,1,4,5],
      resolver: [1,2,3,4],
      r53:      [2,3],
      table:    [3],
      target:   [3,4,5], // The target AWS resource lights up
    }
    return (map[sec]||[]).includes(step)
  }

  const f = (arrow) => {
    const map = {
      'user-res': [1],
      'res-r53':  [2],
      'r53-res':  [3,4],
      'res-user': [4],
      'user-aws': [5],
    }
    return (map[arrow]||[]).includes(step)
  }

  const cx = (...c) => c.filter(Boolean).join(' ')

  return (
    <motion.div
      className="nd-wrap r53-wrap"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
    >
      {/* TITLE */}
      <div className="nd-titlebar">
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#a855f7,transparent)'}} />
        <div className="nd-bar-center">
          <span className="nd-bar-icon r53-bar-icon">53</span>
          <h2 className="nd-bar-title r53-title">AWS Route 53 – Architecture & Flow</h2>
        </div>
        <div className="nd-bar-line" style={{background:'linear-gradient(90deg,transparent,#a855f7,transparent)'}} />
      </div>
      <div className="nd-subtitle">Route 53 is the DNS front door of your application</div>

      {/* CONTROLS */}
      <div className="nd-ctrl">
        <button className="nd-playbtn r53-playbtn" onClick={() => setPlaying(p => !p)}>
          {playing ? 'II  Pause' : 'Play'}
        </button>
        <span 
          className="nd-stepinfo" 
          style={{ 
            color: STEP_COLORS[step], 
            textShadow: `0 0 10px ${STEP_COLORS[step]}80` 
          }}
        >
          Step {step+1}/6 — {STEPS[step].title}
        </span>
      </div>

      {/* TOP: Animation Flow Steps */}
      <div className="nd-rbox" style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', borderColor:'rgba(168,85,247,0.2)'}}>
        {STEPS.map((s,i) => (
          <div key={i} style={{textAlign:'center', opacity: step===i ? 1 : 0.4, transition:'opacity 0.3s'}}>
            <div style={{fontSize:'0.6rem', color:STEP_COLORS[i], fontWeight:'bold', marginBottom:'0.2rem'}}>{i+1}. {s.title}</div>
            <div style={{fontSize:'0.45rem', color:'var(--nd-muted)'}}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* MAIN DIAGRAM BODY */}
      <div className="r53-center">

        {/* LEFT: Users */}
        <div className="r53-users-col">
          <div className="ndbox bb r53-users-box">
            <div className="ndbox-lbl cb">USERS</div>
            <div className={cx('r53-user', g('user') && 'r53-glow')}>
              <div className="r53-user-icon">💻</div>
              Laptop
            </div>
            <div className={cx('r53-user', g('user') && 'r53-glow')}>
              <div className="r53-user-icon">📱</div>
              Mobile
            </div>
            <div className={cx('r53-user', g('user') && 'r53-glow')}>
              <div className="r53-user-icon">🖥️</div>
              Desktop
            </div>
          </div>
          
          <div className={cx('ndbox bb', g('user') && 'gb')} style={{padding:'0.5rem'}}>
            <div className="ndbox-lbl cb" style={{marginBottom:0}}>www.example.com</div>
          </div>
        </div>

        {/* Horizontal Connector */}
        <div className="r53-hconn">
          {f('user-res') && <div className="ndpkt pkb" style={{top:'-3px', left:0, animation:'pktH 0.85s linear infinite'}} />}
          {f('res-user') && <div className="ndpkt pkc" style={{top:'-3px', right:0, animation:'pktH 0.85s linear infinite reverse'}} />}
        </div>

        {/* DNS Resolver */}
        <div className={cx('r53-resolver-box', g('resolver') && 'r53-resolver-glow')}>
          <div className="r53-resolver-icon">🔄</div>
          <div style={{fontWeight:'bold', fontSize:'0.7rem'}}>DNS Resolver</div>
          <div style={{fontSize:'0.5rem', color:'var(--nd-muted)'}}>(ISP / Recursive Resolver)</div>
        </div>

        {/* Horizontal Connector */}
        <div className="r53-hconn">
          {f('res-r53') && <div className="ndpkt pkb" style={{top:'-3px', left:0, animation:'pktH 0.85s linear infinite'}} />}
          {f('r53-res') && <div className="ndpkt pkv" style={{top:'-3px', right:0, animation:'pktH 0.85s linear infinite reverse'}} />}
        </div>

        {/* CENTER: Route 53 */}
        <div className="r53-r53-col">
          <div className={cx('r53-r53-box', g('r53') && 'r53-r53-glow')}>
            <div className="r53-hz-hdr">
              <span className="r53-hz-icon">53</span>
              Amazon Route 53
            </div>
            <div style={{textAlign:'center', fontSize:'0.5rem', color:'var(--nd-muted)', marginTop:'-0.5rem'}}>Authoritative Name Servers</div>
            
            <div className="ndbox bv" style={{padding:'0.5rem'}}>
              <div className="ndbox-lbl cv">HOSTED ZONE: example.com</div>
              <table className="r53-table">
                <thead>
                  <tr>
                    <th>Record Name</th>
                    <th>Type</th>
                    <th>Routing Policy</th>
                    <th>Value / Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={cx(step===3 && 'r53-tr-glow')}>
                    <td>www.example.com</td>
                    <td>A (Alias)</td>
                    <td>Latency Based</td>
                    <td style={{color:'var(--nd-green)'}}>→ ALB (us-east-1)</td>
                  </tr>
                  <tr className={cx(step===3 && 'r53-tr-glow')}>
                    <td>www.example.com</td>
                    <td>A (Alias)</td>
                    <td>Latency Based</td>
                    <td style={{color:'var(--nd-green)'}}>→ ALB (eu-west-1)</td>
                  </tr>
                  <tr className={cx(step===3 && 'r53-tr-glow')}>
                    <td>api.example.com</td>
                    <td>A (Alias)</td>
                    <td>Failover</td>
                    <td>
                      <div style={{color:'var(--nd-green)'}}>Primary → ALB (us-east-1)</div>
                      <div style={{color:'var(--nd-red)'}}>Failover → ALB (us-west-2)</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="r53-hc-box">
              <div className="ndbox-lbl cv" style={{position:'absolute', marginTop:'-1.1rem', background:'var(--nd-bg)', padding:'0 5px'}}>Health Checks</div>
              <div className="r53-hc green">
                <div className="r53-hc-icon">✅</div>
                <div>ALB (us-east-1)</div>
                <div>Healthy</div>
              </div>
              <div className="r53-hc green">
                <div className="r53-hc-icon">✅</div>
                <div>ALB (eu-west-1)</div>
                <div>Healthy</div>
              </div>
              <div className="r53-hc red">
                <div className="r53-hc-icon">❌</div>
                <div>ALB (us-west-2)</div>
                <div>Unhealthy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Connector - User direct to AWS */}
        <div style={{position:'absolute', bottom:'3rem', left:'4rem', width:'calc(100% - 14rem)', height:'2px', background:'transparent', borderBottom:'2px dashed rgba(255,255,255,0.1)', pointerEvents:'none'}}>
          {f('user-aws') && <div className="ndpkt pkg" style={{top:'-3px', left:0, animation:'pktH 1.2s linear infinite'}} />}
        </div>

        {/* RIGHT: AWS Resources */}
        <div className="r53-aws-col">
          <div className="ndbox-lbl cg" style={{textAlign:'center', marginBottom:'-0.5rem'}}>AWS Resources</div>
          
          <div className={cx('r53-aws-region up', g('target') && 'gg')}>
            <div className="r53-region-name">us-east-1 (N. Virginia)</div>
            <div className={cx('r53-alb', g('target') && 'r53-alb-glow')}>
              <div className="r53-alb-icon">⚖️</div>
              <div style={{fontSize:'0.45rem', color:'var(--nd-muted)'}}>Application<br/>Load Balancer</div>
              <div className="r53-instances">
                <div className="r53-instance"></div>
                <div className="r53-instance"></div>
              </div>
            </div>
          </div>

          <div className={cx('r53-aws-region up', g('target') && 'gg')}>
            <div className="r53-region-name">eu-west-1 (Ireland)</div>
            <div className={cx('r53-alb', g('target') && 'r53-alb-glow')}>
              <div className="r53-alb-icon">⚖️</div>
              <div style={{fontSize:'0.45rem', color:'var(--nd-muted)'}}>Application<br/>Load Balancer</div>
              <div className="r53-instances">
                <div className="r53-instance"></div>
                <div className="r53-instance"></div>
              </div>
            </div>
          </div>

          <div className="r53-aws-region down">
            <div className="r53-region-name">us-west-2 (Oregon) ❌</div>
            <div className="r53-alb">
              <div className="r53-alb-icon" style={{filter:'grayscale(1)'}}>⚖️</div>
              <div style={{fontSize:'0.45rem', color:'var(--nd-muted)'}}>Application<br/>Load Balancer</div>
              <div className="r53-instances">
                <div className="r53-instance" style={{borderColor:'var(--nd-red)'}}></div>
                <div className="r53-instance" style={{borderColor:'var(--nd-red)'}}></div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* r53-center */}

      {/* BOTTOM: Routing Policies */}
      <div className="nd-bottom">
        <div className="nd-btitle cv">ROUTING POLICIES</div>
        <div className="nd-bgrid" style={{gridTemplateColumns:'repeat(5, 1fr)'}}>
          {ROUTING_POLICIES.map((rp, i) => (
            <div key={i} className="nd-bcard">
              <div className="nd-bicon">{rp.icon}</div>
              <div className="nd-bname">{rp.name}</div>
              <div className="nd-bdesc">{rp.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
