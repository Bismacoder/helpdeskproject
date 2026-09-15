import api from './api';

export const statusHistoryService = {
  // Get status history for a ticket
  getTicketHistory: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/history`);
    return response.data;
  },
};
