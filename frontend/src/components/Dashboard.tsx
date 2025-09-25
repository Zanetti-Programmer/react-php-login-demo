import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your personal dashboard</p>
      </div>

      <div className="user-info">
        <h2>User Information</h2>
        <div style={{ marginTop: '20px' }}>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;