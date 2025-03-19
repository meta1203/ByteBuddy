import { useState } from 'react';

const PersonList = ({ people, onDeletePerson }) => {
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleExpand = (personCode) => {
    if (expandedPerson === personCode) {
      setExpandedPerson(null);
    } else {
      setExpandedPerson(personCode);
    }
  };

  const handleDeleteClick = (personCode) => {
    setConfirmDelete(personCode);
  };

  const confirmDeletePerson = (personCode) => {
    onDeletePerson(personCode);
    setConfirmDelete(null);
    if (expandedPerson === personCode) {
      setExpandedPerson(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  if (!people || people.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No people added to this event yet.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4>People ({people.length})</h4>
      
      <div className="list-group">
        {people.map((person) => (
          <div 
            key={person.sort}
            className="list-group-item list-group-item-action"
          >
            <div className="d-flex w-100 justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{person.name}</h5>
                <p className="mb-1 text-muted">
                  ID: {person.sort}
                </p>
              </div>
              <div>
                <button 
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => toggleExpand(person.sort)}
                >
                  {expandedPerson === person.sort ? 'Hide Details' : 'Show Details'}
                </button>
                {confirmDelete === person.sort ? (
                  <>
                    <button 
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => confirmDeletePerson(person.sort)}
                    >
                      Confirm
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteClick(person.sort)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            
            {expandedPerson === person.sort && (
              <div className="mt-3 person-details">
                {person.description && (
                  <div className="mb-2">
                    <strong>Description:</strong>
                    <p>{person.description}</p>
                  </div>
                )}
                
                {person.photo && (
                  <div className="mb-2">
                    <strong>Photo:</strong>
                    <div className="mt-2">
                      <img 
                        src={person.photo} 
                        alt={`${person.name}`} 
                        className="img-thumbnail" 
                        style={{ maxHeight: '200px' }} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-2">
                  <strong>Added:</strong>
                  <p>{new Date(person.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonList;
