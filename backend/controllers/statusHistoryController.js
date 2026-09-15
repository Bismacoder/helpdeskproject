const StatusHistory = require('../models/StatusHistory');
const Ticket = require('../models/Ticket');

/**
 * @desc    Get status history for a specific ticket
 * @route   GET /api/tickets/:ticketId/history
 * @access  Private
 */
const getTicketHistory = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role check: requester can only view history of their own tickets
    if (
      req.user.role === 'requester' &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view history for this ticket',
      });
    }

    const history = await StatusHistory.find({ ticket: ticketId })
      .populate('changedBy', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      message: 'Status history retrieved successfully',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTicketHistory,
};
