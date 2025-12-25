import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios'; // Import our new hook
import '../App.css'; 

const Dashboard = () => {
  const api = useAxios(); // Get the secured API instance
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // This call will now automatically have the Token!
        const response = await api.get('/analytics/dashboard'); 
        setStats(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  if (loading) return <div className="loading">Loading Cyber Analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Case Analytics Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cases</h3>
          <p className="stat-number">{stats?.totalCases || 0}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="stat-number">{stats?.pendingCount || 0}</p>
        </div>
        <div className="stat-card closed">
          <h3>Resolved</h3>
          <p className="stat-number">{stats?.closedCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;