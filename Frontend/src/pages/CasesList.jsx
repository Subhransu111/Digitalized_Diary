import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import '../App.css';

const CasesList = () => {
  const api = useAxios();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all cases on load
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/cases');
        // Assuming backend returns { success: true, data: [...] }
        setCases(res.data.data); 
      } catch (err) {
        console.error("Failed to load cases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <div className="loading-screen">Loading Case Files...</div>;

  return (
    <div className="page-container">
      <div className="header-flex">
        <h2>📂 Case Archives</h2>
        <Link to="/create-case" className="action-btn">+ New Case</Link>
      </div>

      <div className="case-grid">
        {cases.map((c) => (
          <div key={c._id} className="case-card">
            <div className="card-header">
              <span className="case-id">{c.caseNumber}</span>
              <span className={`status-badge ${c.caseStatus.toLowerCase()}`}>
                {c.caseStatus}
              </span>
            </div>
            <h3>{c.caseTitle}</h3>
            <p className="case-desc">{c.caseDescription.substring(0, 100)}...</p>
            <div className="card-footer">
              <span className="date">{new Date(c.createdAt).toLocaleDateString()}</span>
              <Link to={`/cases/${c._id}`} className="view-btn">View Dossier →</Link>
            </div>
          </div>
        ))}
        
        {cases.length === 0 && (
          <div className="empty-state">No cases found. Start a new investigation.</div>
        )}
      </div>
    </div>
  );
};

export default CasesList;