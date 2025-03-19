import { useState } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // Will be used when implementing real API calls

const PersonForm = ({ eventId, onAddPerson }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Store the file as base64 string
      setFormData({
        ...formData,
        photo: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real app, we would call the API
      // For demo, we'll generate a random sort code
      const sort = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Call the parent component's callback
      onAddPerson({
        ...formData,
        sort,
        id: eventId
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        photo: null
      });
      
      // Hide form after successful submission
      setShowForm(false);
    } catch (err) {
      setError('Failed to add person. Please try again.');
      console.error('Error adding person:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="mb-4">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Add Person
        </button>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Add Person</h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name *</label>
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
              rows="2"
              placeholder="Role, responsibilities, or other details"
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="photo" className="form-label">Photo</label>
            <input
              type="file"
              className="form-control"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="form-text">Upload a photo of the person (optional)</div>
          </div>
          
          {formData.photo && (
            <div className="mb-3">
              <label className="form-label">Preview</label>
              <div>
                <img 
                  src={formData.photo} 
                  alt="Preview" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '100px' }} 
                />
              </div>
            </div>
          )}
          
          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary me-2" 
              onClick={() => setShowForm(false)}
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
                  Adding...
                </>
              ) : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonForm;
