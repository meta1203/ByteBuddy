import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { eventApi } from '../api'; // Uncomment when implementing real API calls

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null); // setError will be used when implementing real API calls
  const navigate = useNavigate();

  // In a real application, we would fetch the list of events from the API
  // For this demo, we'll use a mock list since our API doesn't have a list endpoint
  useEffect(() => {
    // Simulating API call with setTimeout
    const timer = setTimeout(() => {
      setEvents([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Conference 2025',
          description: 'Annual technology conference with workshops and networking',
          timestamp: '2025-06-15T09:00:00.000Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Product Launch',
          description: 'Launching our new product line with demos',
          timestamp: '2025-07-20T14:00:00.000Z',
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174002',
          name: 'Team Building Retreat',
          description: 'Annual team building event at mountain resort',
          timestamp: '2025-08-10T10:00:00.000Z',
        },
      ]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading events: {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center my-5">
        <p>No events found.</p>
        <Link to="/events/new" className="btn btn-primary">
          Create your first event
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events</h2>
        <Link to="/events/new" className="btn btn-primary">
          Create Event
        </Link>
      </div>

      <div className="row">
        {events.map((event) => (
          <div className="col-md-4 mb-4" key={event.id}>
            <div 
              className="card h-100 event-card" 
              onClick={() => handleEventClick(event.id)}
            >
              <div className="card-body">
                <h5 className="card-title">{event.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  {new Date(event.timestamp).toLocaleDateString()}
                </h6>
                <p className="card-text">{event.description}</p>
              </div>
              <div className="card-footer bg-transparent">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
