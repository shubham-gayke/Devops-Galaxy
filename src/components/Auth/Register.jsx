import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/generate-otp', { email, purpose: 'register' });
      setMessage('OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp, purpose: 'register' });
      setMessage('OTP verified! Please set your username and password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register-complete', { email, username, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputStyle = { padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', boxSizing: 'border-box', marginBottom: '1rem' };
  const btnStyle = { padding: '0.8rem', borderRadius: '4px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'var(--bg-card)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
      {error && <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ color: '#44ff44', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      
      {step === 1 && (
        <form onSubmit={handleGetOtp}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Get OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>Enter OTP sent to {email}</p>
          <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Complete Registration</button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Already have an account? Login</Link>
      </div>
    </div>
  );
};

export default Register;
