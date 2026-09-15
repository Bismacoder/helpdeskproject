const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

/**
 * @desc    Add a comment to a ticket
 * @route   POST /api/tickets/:ticketId/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment message',
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role check: requester can only comment on their own ticket
    if (
      req.user.role === 'requester' &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this ticket',
      });
    }

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user._id,
      message: message.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name email role'
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a ticket
 * @route   GET /api/tickets/:ticketId/comments
 * @access  Private
 */
const getComments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role check: requester can only view comments on their own ticket
    if (
      req.user.role === 'requester' &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view comments for this ticket',
      });
    }

    const comments = await Comment.find({ ticket: ticketId })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      message: 'Comments retrieved successfully',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
};
