import { useState } from 'react';
// import { personApi } from '../api'; // Uncomment when implementing real API calls

const KeywordSearch = ({ eventId }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError('Please enter a keyword to search');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call the API
      // const response = await personApi.searchPeopleByKeyword(eventId, keyword);
      // setResults(response.people);
      
      // For demo, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Mock search results based on the keyword
      if (keyword.toLowerCase() === 'javascript') {
        setResults([
          {
            id: eventId,
            sort: '1234',
            name: 'John Smith',
            description: 'Speaker - JavaScript Performance Optimization',
            timestamp: '2025-05-01T10:30:00.000Z'
          }
        ]);
      } else if (keyword.toLowerCase() === 'react') {
        setResults([
          {
            id: eventId,
            sort: '5678',
            name: 'Sarah Johnson',
            description: 'Workshop Leader - React Advanced Patterns',
            timestamp: '2025-05-02T14:45:00.000Z'
          }
        ]);
      } else if (keyword.toLowerCase() === 'workshop') {
        setResults([
          {
            id: eventId,
            sort: '5678',
            name: 'Sarah Johnson',
            description: 'Workshop Leader - React Advanced Patterns',
            timestamp: '2025-05-02T14:45:00.000Z'
          }
        ]);
      } else {
        setResults([]);
      }
      
      setSearched(true);
    } catch (err) {
      console.error('Error searching people:', err);
      setError('Failed to search for people. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Keyword Search</h4>
      
      <form onSubmit={handleSearch}>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter keyword (e.g., javascript, react, workshop)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="Search keyword"
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Searching...
              </>
            ) : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {searched && (
        <div className="search-results">
          <h5>Search Results for "{keyword}"</h5>
          
          {results.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No people found matching this keyword.
            </div>
          ) : (
            <div className="list-group">
              {results.map((person) => (
                <div 
                  key={person.sort}
                  className="list-group-item"
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{person.name}</h5>
                    <small>ID: {person.sort}</small>
                  </div>
                  {person.description && (
                    <p className="mb-1">{person.description}</p>
                  )}
                  <small className="text-muted">
                    Added: {new Date(person.timestamp).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <h6>Search Tips:</h6>
        <ul>
          <li>Enter keywords with at least 5 characters</li>
          <li>Keywords are extracted from person names and descriptions</li>
          <li>Try searching for roles, skills, or responsibilities</li>
          <li>For this demo, try: "javascript", "react", or "workshop"</li>
        </ul>
      </div>
    </div>
  );
};

export default KeywordSearch;
