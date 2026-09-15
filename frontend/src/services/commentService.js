import api from './api';

export const commentService = {
  // Get all comments for a ticket
  getComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add a comment to a ticket
  addComment: async (ticketId, message) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, { message });
    return response.data;
  },
};
