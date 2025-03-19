import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { eventApi, personApi } from '../api'; // Uncomment when implementing real API calls
import PersonForm from './PersonForm';
import PersonList from './PersonList';
import KeywordSearch from './KeywordSearch';

const EventDetail = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('people'); // 'people' or 'search'

  // In a real application, we would fetch the event and people from the API
  // For this demo, we'll use mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock event data
        const mockEvent = {
          id: eventId,
          name: 'Tech Conference 2025',
          description: 'Annual technology conference with workshops and networking',
          timestamp: '2025-06-15T09:00:00.000Z',
          metadata: {
            location: 'Convention Center',
            organizer: 'Tech Association'
          }
        };
        
        // Mock people data
        const mockPeople = [
          {
            id: eventId,
            sort: '1234',
            name: 'John Smith',
            description: 'Speaker - JavaScript Performance Optimization',
            timestamp: '2025-05-01T10:30:00.000Z'
          },
          {
            id: eventId,
            sort: '5678',
            name: 'Sarah Johnson',
            description: 'Workshop Leader - React Advanced Patterns',
            timestamp: '2025-05-02T14:45:00.000Z'
          }
        ];
        
        setEvent(mockEvent);
        setPeople(mockPeople);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);

  const handleAddPerson = (newPerson) => {
    // In a real app, this would be added via API
    // For demo, we'll just add it to the state
    setPeople([...people, {
      ...newPerson,
      id: eventId,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleDeletePerson = async (personCode) => {
    try {
      // In a real app, this would delete via API
      // personApi.deletePerson(eventId, personCode);
      
      // For demo, we'll just filter the state
      setPeople(people.filter(person => person.sort !== personCode));
    } catch (err) {
      console.error('Error deleting person:', err);
      setError('Failed to delete person. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button 
          className="btn btn-outline-danger ms-3"
          onClick={() => navigate('/')}
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="alert alert-warning" role="alert">
        Event not found.
        <Link to="/" className="btn btn-outline-primary ms-3">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{event.name}</h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/')}
        >
          Back to Events
        </button>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Event Details</h5>
          <p className="card-text">{event.description}</p>
          
          <div className="row mt-3">
            <div className="col-md-6">
              <p><strong>Date:</strong> {new Date(event.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Time:</strong> {new Date(event.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
          
          {event.metadata && (
            <div className="row mt-2">
              {event.metadata.location && (
                <div className="col-md-6">
                  <p><strong>Location:</strong> {event.metadata.location}</p>
                </div>
              )}
              {event.metadata.organizer && (
                <div className="col-md-6">
                  <p><strong>Organizer:</strong> {event.metadata.organizer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'people' ? 'active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            People
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Keyword Search
          </button>
        </li>
      </ul>
      
      {activeTab === 'people' ? (
        <>
          <PersonForm eventId={eventId} onAddPerson={handleAddPerson} />
          <PersonList 
            people={people} 
            onDeletePerson={handleDeletePerson} 
          />
        </>
      ) : (
        <KeywordSearch eventId={eventId} />
      )}
    </div>
  );
};

export default EventDetail;
