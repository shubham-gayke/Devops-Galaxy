import React from 'react';

const ServiceModelDiagram = () => {
  const models = [
    {
      title: 'On-Premises',
      layers: [
        { name: 'Applications', managed: 'you' },
        { name: 'Data', managed: 'you' },
        { name: 'Runtime', managed: 'you' },
        { name: 'Middleware', managed: 'you' },
        { name: 'O/S', managed: 'you' },
        { name: 'Virtualization', managed: 'you' },
        { name: 'Servers', managed: 'you' },
        { name: 'Storage', managed: 'you' },
        { name: 'Networking', managed: 'you' },
      ]
    },
    {
      title: 'Infrastructure as a Service',
      layers: [
        { name: 'Applications', managed: 'you' },
        { name: 'Data', managed: 'you' },
        { name: 'Runtime', managed: 'you' },
        { name: 'Middleware', managed: 'you' },
        { name: 'O/S', managed: 'you' },
        { name: 'Virtualization', managed: 'provider' },
        { name: 'Servers', managed: 'provider' },
        { name: 'Storage', managed: 'provider' },
        { name: 'Networking', managed: 'provider' },
      ]
    },
    {
      title: 'Platform as a Service',
      layers: [
        { name: 'Applications', managed: 'you' },
        { name: 'Data', managed: 'you' },
        { name: 'Runtime', managed: 'provider' },
        { name: 'Middleware', managed: 'provider' },
        { name: 'O/S', managed: 'provider' },
        { name: 'Virtualization', managed: 'provider' },
        { name: 'Servers', managed: 'provider' },
        { name: 'Storage', managed: 'provider' },
        { name: 'Networking', managed: 'provider' },
      ]
    },
    {
      title: 'Software as a Service',
      layers: [
        { name: 'Applications', managed: 'provider' },
        { name: 'Data', managed: 'provider' },
        { name: 'Runtime', managed: 'provider' },
        { name: 'Middleware', managed: 'provider' },
        { name: 'O/S', managed: 'provider' },
        { name: 'Virtualization', managed: 'provider' },
        { name: 'Servers', managed: 'provider' },
        { name: 'Storage', managed: 'provider' },
        { name: 'Networking', managed: 'provider' },
      ]
    }
  ];

  return (
    <div style={{
      margin: '2rem 0',
      padding: '1.5rem',
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1rem'
      }}>
        {models.map((model, idx) => (
          <div key={idx} style={{
            background: '#f0f0f0',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{
              textAlign: 'center',
              fontSize: '0.95rem',
              marginBottom: '1rem',
              color: '#333',
              fontWeight: '600'
            }}>{model.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {model.layers.map((layer, layerIdx) => (
                <div
                  key={layerIdx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: layer.managed === 'you' ? '#14b8a6' : '#f97316',
                    color: '#fff',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {layer.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '24px',
            background: '#14b8a6',
            borderRadius: '4px',
            border: '2px solid #0d9488'
          }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
            You Manage
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '24px',
            background: '#f97316',
            borderRadius: '4px',
            border: '2px solid #ea580c'
          }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
            Provider Manages
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceModelDiagram;
