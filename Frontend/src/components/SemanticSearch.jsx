import React, { useState } from 'react';

const SemanticSearch = ({ onSearchResults, onClearSearch, api }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    if (query.trim().length < 3) {
      setError('Enter at least 3 characters to search.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/cases/semantic-search', { query });

      if (response.data.success) {
        onSearchResults(response.data.results || [], query.trim());
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (searchError) {
      console.error(searchError);
      setError(searchError.response?.data?.message || 'Semantic search processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError('');
    onClearSearch();
  };

  return (
    <div className="semantic-search-panel">
      <form onSubmit={handleSearchSubmit} className="semantic-search-form">
        <div className="semantic-search-input-group">
          <span className="search-icon" aria-hidden="true">
            Search
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files by meaning"
            className="semantic-search-input"
            disabled={loading}
          />
        </div>
        <div className="semantic-search-actions">
          <button type="submit" className="btn-primary search-action-btn" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Semantic Search'}
          </button>
          {query && (
            <button type="button" onClick={handleClear} className="btn-secondary clear-action-btn" disabled={loading}>
              Clear
            </button>
          )}
        </div>
      </form>
      {error && <div className="semantic-search-error-msg">{error}</div>}
    </div>
  );
};

export default SemanticSearch;
