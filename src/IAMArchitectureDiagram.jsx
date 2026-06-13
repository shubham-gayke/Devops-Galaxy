import React, { useState, useEffect } from 'react';
import './IAMArchitecture.css';

const IAMArchitectureDiagram = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      id: 1,
      title: "IAM User",
      subtitle: "Developer (john-dev)",
      description: "User initiates request to access AWS resource",
      details: ["Username / Password", "MFA (if enabled)", "Access Keys"],
      color: "#f59e0b"
    },
    {
      id: 2,
      title: "Authentication",
      subtitle: "Validate Credentials",
      description: "IAM validates the user credentials",
      details: ["✓ Username / Password", "✓ MFA if enabled", "✓ Check user exists"],
      color: "#ef4444"
    },
    {
      id: 3,
      title: "Policy Evaluation",
      subtitle: "Check Permissions",
      description: "IAM evaluates policies: Identity-based, Resource-based, SCPs",
      details: ["Identity Policy: Allow", "Resource Policy: Allow", "Permissions boundary: Not set", "SCPs (if applicable)"],
      color: "#10b981"
    },
    {
      id: 4,
      title: "Role Assumption",
      subtitle: "EC2-ReadS3-Role",
      description: "User assumes IAM role and gets temporary credentials (STS)",
      details: ["Temporary Credentials (STS)", "Session Token", "Expiration: 1-12 hours"],
      color: "#3b82f6"
    },
    {
      id: 5,
      title: "AWS Service",
      subtitle: "Amazon S3",
      description: "AWS service processes the request and returns the response",
      details: ["s3:GetObject", "company-prod-data/file.pdf", "Request successful"],
      color: "#8b5cf6"
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

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
    <div className="iam-flow-container">
      <div className="flow-header">
        <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
          IAM REQUEST FLOW
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          See how IAM authenticates, authorizes, and manages access to AWS resources
        </p>
        <button className="animation-toggle" onClick={toggleAnimation}>
          {isAnimating ? '⏸ Pause' : '▶ Play'} Animation
        </button>
      </div>

      {/* Custom Layout matching reference design */}
      <div className="flow-diagram">
        {/* Top Row - Steps 1, 2, 3 */}
        <div className="diagram-row top-row">
          {/* Step 1 */}
          <div 
            className={`diagram-step ${currentStep === 0 ? 'active' : ''}`}
            onClick={() => handleStepClick(0)}
            style={{ borderColor: steps[0].color }}
          >
            <div className="step-badge" style={{ background: steps[0].color }}>1</div>
            <div className="step-icon">👤</div>
            <div className="step-title">{steps[0].title}</div>
            <div className="step-subtitle">{steps[0].subtitle}</div>
          </div>

          {/* Arrow 1->2 */}
          <div className="diagram-arrow horizontal">
            <div className={`arrow-line ${currentStep >= 1 ? 'active' : ''}`}>
              {currentStep === 0 && isAnimating && (
                <div className="arrow-dot" style={{ background: steps[0].color }}></div>
              )}
            </div>
            <span className="arrow-symbol">→</span>
          </div>

          {/* Step 2 */}
          <div 
            className={`diagram-step ${currentStep === 1 ? 'active' : ''}`}
            onClick={() => handleStepClick(1)}
            style={{ borderColor: steps[1].color }}
          >
            <div className="step-badge" style={{ background: steps[1].color }}>2</div>
            <div className="step-icon">🔒</div>
            <div className="step-title">{steps[1].title}</div>
            <div className="step-subtitle">{steps[1].subtitle}</div>
          </div>

          {/* Arrow 2->3 */}
          <div className="diagram-arrow horizontal">
            <div className={`arrow-line ${currentStep >= 2 ? 'active' : ''}`}>
              {currentStep === 1 && isAnimating && (
                <div className="arrow-dot" style={{ background: steps[1].color }}></div>
              )}
            </div>
            <span className="arrow-symbol">→</span>
          </div>

          {/* Step 3 */}
          <div 
            className={`diagram-step ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => handleStepClick(2)}
            style={{ borderColor: steps[2].color }}
          >
            <div className="step-badge" style={{ background: steps[2].color }}>3</div>
            <div className="step-icon">✅</div>
            <div className="step-title">{steps[2].title}</div>
            <div className="step-subtitle">{steps[2].subtitle}</div>
          </div>
        </div>

        {/* Bottom Row - Steps 5 and 4 */}
        <div className="diagram-row bottom-row">
          {/* Step 5 - AWS Service (Highlighted) */}
          <div 
            className={`diagram-step large-step ${currentStep === 4 ? 'active highlighted' : 'highlighted'}`}
            onClick={() => handleStepClick(4)}
            style={{ borderColor: steps[4].color }}
          >
            <div className="step-badge" style={{ background: steps[4].color }}>5</div>
            <div className="step-icon">🪣</div>
            <div className="step-title">{steps[4].title}</div>
            <div className="step-subtitle">{steps[4].subtitle}</div>
          </div>

          {/* Arrow 4<-5 */}
          <div className="diagram-arrow horizontal">
            <span className="arrow-symbol">←</span>
            <div className={`arrow-line ${currentStep >= 4 ? 'active' : ''}`}>
              {currentStep === 3 && isAnimating && (
                <div className="arrow-dot reverse" style={{ background: steps[3].color }}></div>
              )}
            </div>
          </div>

          {/* Step 4 */}
          <div 
            className={`diagram-step ${currentStep === 3 ? 'active' : ''}`}
            onClick={() => handleStepClick(3)}
            style={{ borderColor: steps[3].color }}
          >
            <div className="step-badge" style={{ background: steps[3].color }}>4</div>
            <div className="step-icon">🎩</div>
            <div className="step-title">{steps[3].title}</div>
            <div className="step-subtitle">{steps[3].subtitle}</div>
          </div>
        </div>

        {/* Vertical Arrow from 3 to 4 */}
        <div className="diagram-arrow vertical right-side">
          <div className={`arrow-line ${currentStep >= 3 ? 'active' : ''}`}>
            {currentStep === 2 && isAnimating && (
              <div className="arrow-dot-vertical" style={{ background: steps[2].color }}></div>
            )}
          </div>
          <span className="arrow-symbol">↓</span>
        </div>
      </div>

      <div className="flow-details">
        <div className="detail-card" style={{ borderLeftColor: steps[currentStep].color }}>
          <h4 style={{ color: steps[currentStep].color }}>{steps[currentStep].title}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {steps[currentStep].description}
          </p>
          <ul className="detail-list">
            {steps[currentStep].details.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
        </div>

        <div className="live-info">
          <h5 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>LIVE REQUEST INFO</h5>
          <table className="info-table">
            <tbody>
              <tr>
                <td><strong>User:</strong></td>
                <td>john-dev</td>
              </tr>
              <tr>
                <td><strong>Action:</strong></td>
                <td>s3:GetObject</td>
              </tr>
              <tr>
                <td><strong>Resource:</strong></td>
                <td>arn:aws:s3:::company-prod-data/file.pdf</td>
              </tr>
              <tr>
                <td><strong>Source IP:</strong></td>
                <td>203.0.113.10</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td><span className={currentStep === 4 ? 'status-success' : 'status-pending'}>
                  {currentStep === 4 ? 'ALLOWED ✓' : 'PROCESSING...'}
                </span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="common-integrations">
        <h5 style={{ color: 'var(--accent)', marginBottom: '1rem', textAlign: 'center' }}>
          COMMON INTEGRATIONS
        </h5>
        <div className="integration-grid">
          {[
            { icon: '💻', name: 'IAM + EC2' },
            { icon: '⚡', name: 'IAM + Lambda' },
            { icon: '🪣', name: 'IAM + S3' },
            { icon: '🗄️', name: 'IAM + DynamoDB' },
            { icon: '🐳', name: 'IAM + EKS' },
            { icon: '📊', name: 'IAM + CloudTrail' }
          ].map((integration, idx) => (
            <div key={idx} className="integration-item">
              <span className="integration-icon">{integration.icon}</span>
              <span className="integration-name">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-explanation">
        <div className="explanation-step">
          <div className="exp-number">1</div>
          <div className="exp-text">The user provides credentials (password + MFA).</div>
        </div>
        <div className="explanation-step">
          <div className="exp-number">2</div>
          <div className="exp-text">IAM checks all applicable policies for the requested action.</div>
        </div>
        <div className="explanation-step">
          <div className="exp-number">3</div>
          <div className="exp-text">Since access is allowed, the user assumes a role on EC2.</div>
        </div>
        <div className="explanation-step">
          <div className="exp-number">4</div>
          <div className="exp-text">Temporary credentials are issued via STS.</div>
        </div>
        <div className="explanation-step">
          <div className="exp-number">5</div>
          <div className="exp-text">S3 returns the requested object.</div>
        </div>
        <div className="explanation-note">
          ⚠️ <strong>Note:</strong> If any policy had an Explicit Deny, access would be blocked immediately.
        </div>
      </div>
    </div>
  );
};

export default IAMArchitectureDiagram;
