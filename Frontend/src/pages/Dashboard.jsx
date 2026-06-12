import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Dashboard = () => {
  const api = useAxios();

  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCount: 0,
    closedCount: 0,
    pendencyRate: '0%',
  });

  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const statsRes = await api.get('/analytics/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        const timelineRes = await api.get('/analytics/timeline');
        if (timelineRes.data.success) {
          setTimelineData(timelineRes.data.data);
        }

        try {
          const reminderRes = await api.get('/analytics/reminders');
          if (reminderRes.data.success && reminderRes.data.count > 0) {
            alert(
              `ACTION REQUIRED\n\nYou have ${reminderRes.data.count} active cases that have been open for more than 10 days.\n\nPlease review the Active Investigations list.`,
            );
          }
        } catch (reminderError) {
          console.warn('Reminder check failed silently:', reminderError);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [api]);

  const pieData = [
    { name: 'Active / Pending', value: stats.pendingCount },
    { name: 'Closed', value: stats.closedCount },
  ];

  const pieColors = ['#ef4444', '#10b981'];

  if (loading) return <div className="loading-screen">Loading Analytics...</div>;

  return (
    <div className="page-shell">
      <div className="page-container">
        <h2 className="page-title">Investigation Analytics</h2>

        <div className="dashboard-grid-layout">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon-box total">TC</div>
            <div className="dashboard-stat-details">
              <h3>{stats.totalCases}</h3>
              <p>Total Cases</p>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon-box pendency">%</div>
            <div className="dashboard-stat-details">
              <h3>{stats.pendencyRate}</h3>
              <p>Pendency Rate</p>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon-box closed">CL</div>
            <div className="dashboard-stat-details">
              <h3>{stats.closedCount}</h3>
              <p>Cases Closed</p>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon-box active">OP</div>
            <div className="dashboard-stat-details">
              <h3>{stats.pendingCount}</h3>
              <p>Active Investigations</p>
            </div>
          </div>
        </div>

        <div className="dashboard-charts-layout">
          <div className="dashboard-chart-card">
            <h3>Case Status Overview</h3>
            <div className="dashboard-chart-frame">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={82}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'rgba(255, 255, 255, 0.68)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-chart-card">
            <h3>Efficiency: Days to Close Case</h3>
            <div className="dashboard-chart-frame">
              {timelineData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="caseNumber" tick={{ fill: 'rgba(255, 255, 255, 0.62)' }} tickLine={false} />
                    <YAxis
                      tick={{ fill: 'rgba(255, 255, 255, 0.62)' }}
                      tickLine={false}
                      label={{
                        value: 'Days',
                        angle: -90,
                        position: 'insideLeft',
                        fill: 'rgba(255, 255, 255, 0.62)',
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="dashboard-tooltip">
                              <p>
                                <strong>{data.caseNumber}</strong>
                              </p>
                              <p>{data.caseTitle}</p>
                              <p className="dashboard-tooltip-accent">Time Taken: {data.daysTaken} days</p>
                            </div>
                          );
                        }

                        return null;
                      }}
                    />
                    <Bar dataKey="daysTaken" fill="#ff5a1f" radius={[8, 8, 0, 0]} name="Days Taken" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty-chart">No closed cases to analyze yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
