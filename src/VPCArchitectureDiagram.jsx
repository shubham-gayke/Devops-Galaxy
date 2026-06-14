import React, { useState, useEffect } from 'react'
import './VPCArchitecture.css'

export default function VPCArchitectureDiagram() {
  const [activeFlow, setActiveFlow] = useState(null)
  const [animStep, setAnimStep] = useState(0)

  const flows = {
    internet: {
      label: '🌐 Public Web Request',
      description: 'Internet → IGW → ALB (Public Subnet) → EC2 App (Private) → RDS DB (Private)',
      color: '#3b82f6',
    },
    nat: {
      label: '🔄 Outbound (NAT)',
      description: 'Private EC2 → NAT Gateway → IGW → Internet (software updates, APIs)',
      color: '#f59e0b',
    },
    endpoint: {
      label: '🔌 S3 Endpoint (Free)',
      description: 'Private EC2 → VPC Gateway Endpoint → S3 (no internet, no cost)',
      color: '#10b981',
    },
  }

  useEffect(() => {
    if (!activeFlow) return
    const interval = setInterval(() => {
      setAnimStep(s => (s + 1) % 4)
    }, 700)
    return () => clearInterval(interval)
  }, [activeFlow])

  return (
    <div className="vpc-diagram-wrapper">
      <div className="vpc-diagram-title">
        <span className="vpc-badge">VPC</span>
        3-Tier Production Architecture — Multi-AZ
      </div>

      {/* Flow selector */}
      <div className="vpc-flow-buttons">
        {Object.entries(flows).map(([key, f]) => (
          <button
            key={key}
            className={`vpc-flow-btn ${activeFlow === key ? 'active' : ''}`}
            style={{ '--flow-color': f.color }}
            onClick={() => {
              setActiveFlow(activeFlow === key ? null : key)
              setAnimStep(0)
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {activeFlow && (
        <div className="vpc-flow-desc" style={{ borderColor: flows[activeFlow].color }}>
          {flows[activeFlow].description}
        </div>
      )}

      {/* Main Diagram */}
      <div className="vpc-diagram">

        {/* Internet */}
        <div className="vpc-internet">
          <div className="vpc-cloud-icon">🌐</div>
          <div className="vpc-label">Internet</div>
          <div className={`vpc-arrow-down ${activeFlow === 'internet' && animStep >= 0 ? 'lit' : ''} ${activeFlow === 'nat' && animStep >= 3 ? 'lit lit-up' : ''}`} style={{ '--lit-color': activeFlow === 'nat' ? '#f59e0b' : '#3b82f6' }} />
        </div>

        {/* VPC Boundary */}
        <div className="vpc-boundary">
          <div className="vpc-boundary-label">VPC — 10.0.0.0/16</div>

          {/* IGW Row */}
          <div className="vpc-igw-row">
            <div className={`vpc-component igw ${activeFlow === 'internet' && animStep >= 1 ? 'active-blue' : ''} ${activeFlow === 'nat' && animStep >= 2 ? 'active-amber' : ''}`}>
              <span className="vpc-comp-icon">🌍</span>
              <span className="vpc-comp-label">Internet Gateway</span>
            </div>
          </div>

          {/* Two-AZ layout */}
          <div className="vpc-az-row">

            {/* AZ 1a */}
            <div className="vpc-az">
              <div className="vpc-az-label">🏢 AZ — 1a</div>

              {/* Public subnet */}
              <div className="vpc-subnet public">
                <div className="vpc-subnet-label">📦 Public 10.0.1.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className={`vpc-component alb ${activeFlow === 'internet' && animStep >= 2 ? 'active-blue' : ''}`}>
                    <span>⚖️</span><span>ALB</span>
                  </div>
                  <div className={`vpc-component nat-gw ${activeFlow === 'nat' && animStep >= 1 ? 'active-amber' : ''}`}>
                    <span>🔄</span><span>NAT GW</span>
                  </div>
                </div>
              </div>

              {/* Private app subnet */}
              <div className="vpc-subnet private-app">
                <div className="vpc-subnet-label">🔒 Private App 10.0.10.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className={`vpc-component ec2 ${activeFlow === 'internet' && animStep >= 3 ? 'active-blue' : ''} ${activeFlow === 'nat' && animStep >= 0 ? 'active-amber' : ''} ${activeFlow === 'endpoint' && animStep >= 0 ? 'active-green' : ''}`}>
                    <span>💻</span><span>EC2 App</span>
                  </div>
                </div>
              </div>

              {/* Private DB subnet */}
              <div className="vpc-subnet private-db">
                <div className="vpc-subnet-label">🗄️ Private DB 10.0.20.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className={`vpc-component rds ${activeFlow === 'internet' && animStep >= 3 ? 'active-blue' : ''}`}>
                    <span>🗄️</span><span>RDS Primary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AZ 1b */}
            <div className="vpc-az">
              <div className="vpc-az-label">🏢 AZ — 1b</div>

              <div className="vpc-subnet public">
                <div className="vpc-subnet-label">📦 Public 10.0.2.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className="vpc-component alb">
                    <span>⚖️</span><span>ALB</span>
                  </div>
                  <div className="vpc-component nat-gw">
                    <span>🔄</span><span>NAT GW</span>
                  </div>
                </div>
              </div>

              <div className="vpc-subnet private-app">
                <div className="vpc-subnet-label">🔒 Private App 10.0.11.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className="vpc-component ec2">
                    <span>💻</span><span>EC2 App</span>
                  </div>
                </div>
              </div>

              <div className="vpc-subnet private-db">
                <div className="vpc-subnet-label">🗄️ Private DB 10.0.21.0/24</div>
                <div className="vpc-subnet-resources">
                  <div className="vpc-component rds standby">
                    <span>🗄️</span><span>RDS Standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Endpoint row */}
          <div className="vpc-endpoint-row">
            <div className={`vpc-component endpoint ${activeFlow === 'endpoint' && animStep >= 1 ? 'active-green' : ''}`}>
              <span>🔌</span><span>S3 VPC Gateway Endpoint (FREE)</span>
            </div>
          </div>
        </div>

        {/* S3 outside VPC */}
        <div className="vpc-s3-row">
          <div className={`vpc-component s3 ${activeFlow === 'endpoint' && animStep >= 2 ? 'active-green' : ''}`}>
            <span>🪣</span><span>Amazon S3</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="vpc-legend">
        <div className="vpc-legend-item"><div className="legend-dot public-dot" />Public Subnet</div>
        <div className="vpc-legend-item"><div className="legend-dot app-dot" />Private App Subnet</div>
        <div className="vpc-legend-item"><div className="legend-dot db-dot" />Private DB Subnet</div>
        <div className="vpc-legend-item"><div className="legend-dot igw-dot" />AWS Managed</div>
      </div>

      {/* Key Facts */}
      <div className="vpc-facts">
        <div className="vpc-fact">
          <span className="fact-icon">🔑</span>
          <strong>Public vs Private:</strong> It's the route table! Public → IGW. Private → NAT GW.
        </div>
        <div className="vpc-fact">
          <span className="fact-icon">💰</span>
          <strong>Cost Tip:</strong> Add S3 + DynamoDB Gateway Endpoints — they're FREE and save NAT costs.
        </div>
        <div className="vpc-fact">
          <span className="fact-icon">🏗️</span>
          <strong>HA Design:</strong> One NAT Gateway per AZ — never share one NAT across AZs.
        </div>
      </div>
    </div>
  )
}
