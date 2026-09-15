import api from './api';

export const ticketService = {
  // Get all tickets with optional query filters (status, priority, category, search, scope)
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  // Get single ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket content
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (id, statusData) => {
    const response = await api.patch(`/tickets/${id}/status`, statusData);
    return response.data;
  },

  // Assign ticket to agent
  assignTicket: async (id, assignData) => {
    const response = await api.patch(`/tickets/${id}/assign`, assignData);
    return response.data;
  },

  // Delete ticket (Admin only)
  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  // Get Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/tickets/stats/dashboard');
    return response.data;
  },
};
