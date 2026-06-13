import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import SemanticSearch from '../components/SemanticSearch';

const CasesList = () => {
  const api = useAxios();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticQuery, setSemanticQuery] = useState('');

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

  const isSemanticSearch = Array.isArray(semanticResults);
  const visibleCases = isSemanticSearch
    ? semanticResults.map((result) => ({ ...result.case, similarityScore: result.score }))
    : cases;

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="cases-header-flex">
          <h2 className="cases-title-text">Case Archives</h2>
          <Link to="/create-case" className="action-btn">
            + New Case
          </Link>
        </div>

        <SemanticSearch
          api={api}
          onSearchResults={(results, query) => {
            setSemanticResults(results);
            setSemanticQuery(query);
          }}
          onClearSearch={() => {
            setSemanticResults(null);
            setSemanticQuery('');
          }}
        />

        {isSemanticSearch && (
          <div className="semantic-search-summary">
            {visibleCases.length} semantic match{visibleCases.length === 1 ? '' : 'es'} for "{semanticQuery}"
          </div>
        )}

        <div className="cases-grid-layout">
          {visibleCases.map((caseItem) => {
            const caseStatus = caseItem.caseStatus || 'Pending';
            const statusClass = caseStatus.toLowerCase();
            const description = caseItem.caseDescription || 'No description recorded.';

            return (
              <div key={caseItem._id} className="cases-item-card">
                <div>
                  <div className="cases-card-header">
                    <span className="cases-card-id">{caseItem.caseNumber || 'Unnumbered Case'}</span>
                    <div className="cases-card-badges">
                      {isSemanticSearch && (
                        <span className="cases-score-badge">{Math.round(caseItem.similarityScore * 100)}% match</span>
                      )}
                      <span className={`cases-status-badge ${statusClass}`}>{caseStatus}</span>
                    </div>
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

          {visibleCases.length === 0 && (
            <div className="cases-empty-state">
              {isSemanticSearch ? 'No semantic matches found.' : 'No cases found. Start a new investigation.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CasesList;
