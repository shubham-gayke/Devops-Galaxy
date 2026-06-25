import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Subscribe = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [utr, setUtr] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const plans = [
    { id: '1_month', name: '1 Month Plan', price: '₹299', duration: '1 Month' },
    { id: '3_months', name: '3 Months Plan', price: '₹699', duration: '3 Months' },
    { id: '6_months', name: '6 Months Plan (+3 Months Bonus)', price: '₹999', duration: '9 Months Total' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('http://localhost:5000/api/transactions', { planId: selectedPlan, utrNumber: utr }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMessage('Transaction submitted successfully! An admin will verify your payment shortly.');
      setUtr('');
      setSelectedPlan(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit transaction');
    }
  };

  const cardStyle = { padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: '0.3s' };
  const activeCardStyle = { ...cardStyle, borderColor: 'var(--accent)', background: 'rgba(56, 189, 248, 0.1)' };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '1rem' }}>Premium Subscription</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Your 30-minute free trial has expired or you are upgrading. Choose a plan below.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {plans.map(plan => (
          <div key={plan.id} style={selectedPlan === plan.id ? activeCardStyle : cardStyle} onClick={() => setSelectedPlan(plan.id)}>
            <h3 style={{ color: 'var(--text-main)' }}>{plan.name}</h3>
            <p style={{ fontSize: '2rem', color: 'var(--accent)', margin: '1rem 0' }}>{plan.price}</p>
            <p style={{ color: 'var(--text-muted)' }}>{plan.duration}</p>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', textAlign: 'center' }}>Complete Payment</h3>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
            Please scan the QR code below using any UPI app or pay to the UPI ID: <strong style={{ color: 'var(--text-main)' }}>9168469745@ibl</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '250px', height: '250px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>
              <img src="/qr-code.jpeg" alt="PhonePe QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          {error && <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {message && <div style={{ color: '#44ff44', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
            <label style={{ color: 'var(--text-main)' }}>Enter 12-digit UTR / Reference Number</label>
            <input 
              type="text" 
              placeholder="e.g. 123456789012" 
              value={utr} 
              onChange={(e) => setUtr(e.target.value)} 
              required 
              style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
            <button type="submit" style={{ padding: '0.8rem', borderRadius: '4px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              Submit Verification
            </button>
          </form>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
         <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
      </div>
    </div>
  );
};

export default Subscribe;
