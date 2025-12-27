import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../App.css';

const Dashboard = () => {
  const api = useAxios();
  
  // State matches your Backend Response structure
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCount: 0,
    closedCount: 0,
    pendencyRate: '0%'
  });
  
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']; 

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // --- 1. Fetch KPI Stats ---
        const statsRes = await api.get('/analytics/stats');
        if(statsRes.data.success) {
            setStats(statsRes.data.data);
        }

        // --- 2. Fetch Timeline Data ---
        const timelineRes = await api.get('/analytics/timeline');
        if(timelineRes.data.success) {
            setTimelineData(timelineRes.data.data);
        }

        // --- 3. (NEW) Check for Stagnant Cases / Reminders ---
        // This runs silently in the background
        try {
            const reminderRes = await api.get('/analytics/reminders');
            if (reminderRes.data.success && reminderRes.data.count > 0) {
                // Trigger the popup if cases are overdue (older than 10 days)
                alert(`⚠️ ACTION REQUIRED\n\nYou have ${reminderRes.data.count} active cases that have been open for more than 10 days.\n\nPlease review the "Active Investigations" list.`);
            }
        } catch (reminderError) {
            console.warn("Reminder check failed silently:", reminderError);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [api]);

  // Prepare Pie Chart Data
  const pieData = [
    { name: 'Open / Pending', value: stats.pendingCount },
    { name: 'Closed', value: stats.closedCount }
  ];

  if (loading) return <div className="loading-screen">Loading Analytics...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">📊 Investigation Analytics</h2>

      {/* --- SECTION 1: KPI CARDS --- */}
      <div className="dashboard-grid">
        
        {/* Total Cases */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>📁</div>
          <div>
            <h3>{stats.totalCases}</h3>
            <p>Total Cases</p>
          </div>
        </div>

        {/* Pendency Rate */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffedd5', color: '#c2410c' }}>⚠️</div>
          <div>
            <h3>{stats.pendencyRate}</h3> 
            <p>Pendency Rate</p>
          </div>
        </div>

        {/* Closed Cases */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✅</div>
          <div>
            <h3>{stats.closedCount}</h3>
            <p>Cases Closed</p>
          </div>
        </div>

        {/* Open Cases */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⏳</div>
          <div>
            <h3>{stats.pendingCount}</h3>
            <p>Active Investigations</p>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CHARTS --- */}
      <div className="charts-container">
        
        {/* Chart 1: Status Pie */}
        <div className="chart-card">
          <h3>Case Status Overview</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Efficiency Bar */}
        <div className="chart-card">
          <h3>⚡ Efficiency: Days to Close Case</h3>
          <div style={{ width: '100%', height: 300 }}>
             {timelineData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="caseNumber" />
                    <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="custom-tooltip" style={{background:'white', padding:'10px', border:'1px solid #ccc'}}>
                                <p><strong>{data.caseNumber}</strong></p>
                                <p>{data.caseTitle}</p>
                                <p style={{color:'#3b82f6'}}>Time Taken: {data.daysTaken} days</p>
                                </div>
                            );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="daysTaken" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Days Taken" />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                 <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                     No closed cases to analyze yet.
                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;