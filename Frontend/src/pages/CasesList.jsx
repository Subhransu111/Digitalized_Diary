import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios from '../hooks/useAxios';

const CasesList = () => {
  const api = useAxios();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/cases');
        setCases(res.data.data || []);
      } catch (err) {
        console.error('Failed to load cases', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [api]);

  if (loading) return <div className="loading-screen">Loading Case Files...</div>;

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="cases-header-flex">
          <h2 className="cases-title-text">Case Archives</h2>
          <Link to="/create-case" className="action-btn">
            + New Case
          </Link>
        </div>

        <div className="cases-grid-layout">
          {cases.map((caseItem) => {
            const caseStatus = caseItem.caseStatus || 'Pending';
            const statusClass = caseStatus.toLowerCase();
            const description = caseItem.caseDescription || 'No description recorded.';

            return (
              <div key={caseItem._id} className="cases-item-card">
                <div>
                  <div className="cases-card-header">
                    <span className="cases-card-id">{caseItem.caseNumber || 'Unnumbered Case'}</span>
                    <span className={`cases-status-badge ${statusClass}`}>{caseStatus}</span>
                  </div>
                  <h3 className="cases-card-title">{caseItem.caseTitle || 'Untitled Case'}</h3>
                  <p className="cases-card-desc">
                    {description.length > 120 ? `${description.substring(0, 120)}...` : description}
                  </p>
                </div>

                <div className="cases-card-footer">
                  <span className="cases-card-date">
                    {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : 'No date'}
                  </span>
                  <Link to={`/cases/${caseItem._id}`} className="cases-card-view-btn">
                    View Dossier &gt;
                  </Link>
                </div>
              </div>
            );
          })}

          {cases.length === 0 && <div className="cases-empty-state">No cases found. Start a new investigation.</div>}
        </div>
      </div>
    </div>
  );
};

export default CasesList;
