import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../api';

const EventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metadata: {
      location: '',
      organizer: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (metadata)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await eventApi.createEvent(formData);
      console.log('Event created:', result);
      
      // Navigate to the event detail page
      navigate(`/events/${result.eventId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="mb-4">Create New Event</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Event Name *</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="metadata.location" className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            id="metadata.location"
            name="metadata.location"
            value={formData.metadata.location}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="metadata.organizer" className="form-label">Organizer</label>
          <input
            type="text"
            className="form-control"
            id="metadata.organizer"
            name="metadata.organizer"
            value={formData.metadata.organizer}
            onChange={handleChange}
          />
        </div>
        
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button 
            type="button" 
            className="btn btn-secondary me-md-2" 
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
