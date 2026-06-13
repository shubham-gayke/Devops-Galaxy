import React, { useState, useEffect } from 'react';
import '../styles/EC2RequestFlow.css';

const EC2RequestFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      id: 1,
      title: "User / Client",
      subtitle: "Developer (john-dev)",
      description: "User initiates request to launch or access an EC2 instance",
      icon: "👤",
      color: "#f59e0b"
    },
    {
      id: 2,
      title: "Authentication",
      subtitle: "IAM Authentication",
      description: "IAM validates credentials and authenticates",
      details: ["✓ Validate credentials", "✓ Username/password", "✓ Access keys", "✓ MFA (if enabled)"],
      icon: "🔒",
      color: "#3b82f6"
    },
    {
      id: 3,
      title: "Authorization",
      subtitle: "IAM Policy Evaluation",
      description: "IAM evaluates policies and authorizes actions",
      details: ["✓ Check permissions", "✓ ec2:RunInstances", "✓ ec2:DescribeInstances", "✓ Allow / Deny"],
      icon: "✅",
      color: "#10b981"
    },
    {
      id: 4,
      title: "EC2 Service",
      subtitle: "Request accepted by EC2 service",
      description: "EC2 service validates and processes the request",
      details: ["✓ Validate request", "✓ Check quotas and limits", "✓ Resource availability"],
      icon: "🖥️",
      color: "#f97316"
    },
    {
      id: 5,
      title: "Launch Process",
      subtitle: "Instance Creation",
      description: "EC2 allocates resources and creates instance",
      details: ["• Allocate resources", "• Create instance", "• Attach volume", "• Assign security group", "• Assign key pair", "• Attach IAM role"],
      icon: "⚙️",
      color: "#8b5cf6"
    },
    {
      id: 6,
      title: "Instance Running",
      subtitle: "EC2 Instance Active",
      description: "Instance is in running state and ready to use",
      details: ["Instance is in 'running' state and ready to use"],
      icon: "💻",
      color: "#06b6d4"
    },
    {
      id: 7,
      title: "Access Instance",
      subtitle: "Connect via SSH/RDP",
      description: "User connects to the instance",
      details: ["Access using key pair", "(SSH) or password", "(Windows)"],
      icon: "🔑",
      color: "#ec4899"
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAnimating, steps.length]);

  const handleStepClick = (index) => {
    setIsAnimating(false);
    setCurrentStep(index);
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="ec2-flow-container">
      <div className="flow-header">
        <h3 className="flow-title">EC2 REQUEST FLOW</h3>
        <p className="flow-subtitle">
          See how a request is processed to launch and access an EC2 instance
        </p>
        <button className="animation-toggle" onClick={toggleAnimation}>
          {isAnimating ? '⏸ Pause' : '▶ Play'} Animation
        </button>
      </div>

      {/* Single Row Timeline matching reference design */}
      <div className="ec2-diagram">
        <div className="ec2-timeline-horizontal">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`ec2-diagram-step ${currentStep === index ? 'active' : ''}`}
                onClick={() => handleStepClick(index)}
                style={{ borderColor: step.color }}
              >
                <div className="ec2-step-badge" style={{ background: step.color }}>
                  {step.id}
                </div>
                <div className="ec2-step-icon">{step.icon}</div>
                <div className="ec2-step-title">{step.title}</div>
                <div className="ec2-step-subtitle">{step.subtitle}</div>
                {step.details && (
                  <div className="ec2-step-details">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="detail-item">{detail}</div>
                    ))}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="ec2-diagram-arrow">
                  <div className={`ec2-arrow-line ${currentStep > index ? 'active' : ''}`}>
                    {currentStep === index && isAnimating && (
                      <div className="ec2-moving-dot" style={{ background: step.color }}></div>
                    )}
                  </div>
                  <span className="ec2-arrow-symbol" style={{ 
                    color: currentStep > index ? step.color : 'rgba(100, 116, 139, 0.6)' 
                  }}>
                    →
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Access Denied Box (shown when authorization fails) */}
        {currentStep === 2 && (
          <div className="ec2-access-denied">
            <div className="denied-icon">✕</div>
            <div className="denied-title">Access Denied</div>
            <div className="denied-text">
              If not authorized, the request is blocked and no instance is launched.
            </div>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="ec2-details-grid">
        {/* Current Step Details */}
        <div className="ec2-detail-card" style={{ borderLeftColor: steps[currentStep].color }}>
          <h4 style={{ color: steps[currentStep].color }}>{steps[currentStep].title}</h4>
          <p className="detail-description">{steps[currentStep].description}</p>
          {steps[currentStep].details && (
            <ul className="ec2-detail-list">
              {steps[currentStep].details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Instance Details */}
        <div className="ec2-instance-details">
          <h5>INSTANCE DETAILS</h5>
          <table className="ec2-info-table">
            <tbody>
              <tr>
                <td><strong>Instance ID</strong></td>
                <td className="text-accent">i-0abc234d4567890</td>
              </tr>
              <tr>
                <td><strong>Instance Type</strong></td>
                <td>t3.micro</td>
              </tr>
              <tr>
                <td><strong>AMI</strong></td>
                <td>ami-0c55b159cbfafe1f0</td>
              </tr>
              <tr>
                <td><strong>Region</strong></td>
                <td>us-east-1</td>
              </tr>
              <tr>
                <td><strong>VPC</strong></td>
                <td>vpc-0a1b2c3d4e5f67h8</td>
              </tr>
              <tr>
                <td><strong>Subnet</strong></td>
                <td>subnet-0a1b2c3d4e5f67h8</td>
              </tr>
              <tr>
                <td><strong>Public IP</strong></td>
                <td className="text-accent">10.0.1.25</td>
              </tr>
              <tr>
                <td><strong>Private IP</strong></td>
                <td>54.201.45.67</td>
              </tr>
              <tr>
                <td><strong>Status</strong></td>
                <td>
                  <span className={currentStep >= 5 ? 'status-success' : 'status-pending'}>
                    {currentStep >= 5 ? '● running' : '○ pending'}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Security Group</strong></td>
                <td>sg-0a1b2c3d4e5f67h8</td>
              </tr>
              <tr>
                <td><strong>IAM Role</strong></td>
                <td>EC2-SSM-Role</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Group Details */}
      <div className="ec2-security-group">
        <h5>SECURITY GROUP (sg-0a1b2c3d)</h5>
        <div className="sg-tables">
          <div className="sg-table-container">
            <h6>Inbound Rules</h6>
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Protocol</th>
                  <th>Port</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SSH</td>
                  <td>TCP</td>
                  <td>22</td>
                  <td>203.0.113.0/24</td>
                </tr>
                <tr>
                  <td>HTTP</td>
                  <td>TCP</td>
                  <td>80</td>
                  <td>0.0.0.0/0</td>
                </tr>
                <tr>
                  <td>HTTPS</td>
                  <td>TCP</td>
                  <td>443</td>
                  <td>0.0.0.0/0</td>
                </tr>
                <tr>
                  <td>Custom</td>
                  <td>TCP</td>
                  <td>8080</td>
                  <td>10.0.0.0/16</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Common Integrations */}
      <div className="ec2-integrations">
        <h5>COMMON INTEGRATIONS</h5>
        <div className="integration-grid">
          {[
            { icon: '🔐', name: 'IAM\n(Access Control)', color: '#f59e0b' },
            { icon: '🌐', name: 'VPC\n(Network)', color: '#3b82f6' },
            { icon: '💾', name: 'EBS\n(Storage)', color: '#10b981' },
            { icon: '🛡️', name: 'Security Group\n(Firewall)', color: '#ef4444' },
            { icon: '📊', name: 'CloudWatch\n(Monitoring)', color: '#f97316' },
            { icon: '💼', name: 'Systems Manager\n(Management)', color: '#8b5cf6' }
          ].map((integration, idx) => (
            <div key={idx} className="integration-box" style={{ borderColor: integration.color }}>
              <span className="integration-icon">{integration.icon}</span>
              <span className="integration-name">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instance States */}
      <div className="ec2-states">
        <h5>INSTANCE STATES</h5>
        <div className="states-flow">
          {[
            { name: 'pending', icon: '▶', color: '#3b82f6' },
            { name: 'running', icon: '▶', color: '#10b981' },
            { name: 'stopping', icon: '●', color: '#f59e0b' },
            { name: 'stopped', icon: '●', color: '#f59e0b' },
            { name: 'shutting-down', icon: '●', color: '#ef4444' },
            { name: 'terminated', icon: '●', color: '#ef4444' }
          ].map((state, idx) => (
            <React.Fragment key={idx}>
              <div className="state-box" style={{ borderColor: state.color }}>
                <span className="state-icon" style={{ color: state.color }}>{state.icon}</span>
                <span className="state-name">{state.name}</span>
              </div>
              {idx < 5 && <span className="state-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick Explanation */}
      <div className="ec2-explanation">
        <h5>QUICK EXPLANATION</h5>
        <div className="explanation-steps">
          {[
            "User sends request to launch an EC2 instance.",
            "IAM authenticates the user's credentials and checks permissions.",
            "IAM policies are evaluated for ec2:RunInstances action.",
            "EC2 service validates the request.",
            "Resources are allocated and instance is created.",
            "Instance enters 'running' state.",
            "User connects to the instance using SSH or password."
          ].map((text, idx) => (
            <div key={idx} className="explanation-item">
              <div className="exp-number">{idx + 1}</div>
              <div className="exp-text">{text}</div>
            </div>
          ))}
        </div>
        <div className="explanation-warning">
          ⚠️ <strong>Note:</strong> If any step fails (authentication, authorization, or resource limits), 
          the instance will not be launched.
        </div>
      </div>
    </div>
  );
};

export default EC2RequestFlow;
