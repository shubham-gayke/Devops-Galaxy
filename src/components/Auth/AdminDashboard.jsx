import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'users'

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/transactions/pending', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/transactions/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/transactions/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFreeAccess = async (email) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/free-access`, { email }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const tabStyle = (isActive) => ({
    padding: '1rem 2rem', borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent', 
    color: isActive ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold'
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ color: 'var(--text-main)', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <div style={tabStyle(activeTab === 'transactions')} onClick={() => setActiveTab('transactions')}>Pending Transactions</div>
        <div style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>Users</div>
      </div>

      {activeTab === 'transactions' && (
        <div>
          {transactions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending transactions.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Plan</th>
                  <th style={{ padding: '1rem' }}>UTR Number</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{tx.userId?.email}</td>
                    <td style={{ padding: '1rem' }}>{tx.planId}</td>
                    <td style={{ padding: '1rem' }}><strong>{tx.utrNumber}</strong></td>
                    <td style={{ padding: '1rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleApprove(tx._id)} style={{ padding: '0.5rem 1rem', background: '#44ff44', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>Approve</button>
                      <button onClick={() => handleReject(tx._id)} style={{ padding: '0.5rem 1rem', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Username</th>
                <th style={{ padding: '1rem' }}>Premium</th>
                <th style={{ padding: '1rem' }}>Time Used</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>{u.username}</td>
                  <td style={{ padding: '1rem' }}>{u.isPremium ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '1rem' }}>{Math.floor(u.usedTrialTime / 60)} mins</td>
                  <td style={{ padding: '1rem' }}>{u.role}</td>
                  <td style={{ padding: '1rem' }}>
                    {!u.isPremium && <button onClick={() => handleFreeAccess(u.email)} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Give Free Access</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
