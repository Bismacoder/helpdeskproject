const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
  getDashboardStats,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All ticket routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(authorize('admin'), deleteTicket);

router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/assign', authorize('admin', 'agent'), assignTicket);

module.exports = router;
