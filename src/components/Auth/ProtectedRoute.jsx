import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, logout, updatePremiumStatus } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let interval;
    const checkTimer = async () => {
      if (!user) return;
      try {
        const res = await axios.post('http://localhost:5000/api/timer/heartbeat', {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        updatePremiumStatus(user.isPremium, res.data.usedTrialTime);
      } catch (err) {
        if (err.response && err.response.status === 403) {
           setAccessDenied(true);
           updatePremiumStatus(false, err.response.data.usedTrialTime);
        } else if (err.response && err.response.status === 401) {
           logout();
        }
      } finally {
        setChecking(false);
      }
    };

    if (user) {
      checkTimer();
      // Heartbeat every 1 minute
      interval = setInterval(checkTimer, 60000);
    } else {
      setChecking(false);
    }

    return () => clearInterval(interval);
  }, [user]);

  // Temporarily disabled account login requirement
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (checking) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>Loading...</div>;

  if (accessDenied) {
    return <Navigate to="/subscribe" replace />;
  }

  return children;
};

export default ProtectedRoute;
