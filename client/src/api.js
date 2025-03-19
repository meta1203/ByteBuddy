import axios from 'axios';

// Base URL for API calls - use the API_ENDPOINT from window object if available (set by CloudFormation)
// or fall back to the default URL for local development
const API_BASE_URL = window.API_ENDPOINT || 'http://bytebuddy-api.meta1203.com/';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event API calls
export const eventApi = {
  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/event', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get an event by ID
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting event ${eventId}:`, error);
      throw error;
    }
  },
};

// Person API calls
export const personApi = {
  // Create a new person for an event
  createPerson: async (eventId, personData) => {
    try {
      const response = await api.post(`/event/${eventId}/person`, personData);
      return response.data;
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  },

  // Get a person by event ID and person code
  getPerson: async (eventId, personCode) => {
    try {
      const response = await api.get(`/event/${eventId}/person/${personCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting person ${personCode}:`, error);
      throw error;
    }
  },

  // Delete a person by event ID and person code
  deletePerson: async (eventId, personCode) => {
    try {
      const response = await api.delete(`/event/${eventId}/person/${personCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting person ${personCode}:`, error);
      throw error;
    }
  },

  // Search for people by keyword within an event
  searchPeopleByKeyword: async (eventId, keyword) => {
    try {
      const response = await api.get(`/event/${eventId}/person/keyword/${keyword}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching people with keyword ${keyword}:`, error);
      throw error;
    }
  },
};

export default {
  eventApi,
  personApi,
};
