const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const User = require('../models/User');
const StatusHistory = require('../models/StatusHistory');
const Comment = require('../models/Comment');

/**
 * @desc    Create a new support ticket
 * @route   POST /api/tickets
 * @access  Private (Requester, Agent, Admin)
 */
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    // Validate category existence
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    const chosenPriority = priority && validPriorities.includes(priority) ? priority : 'Medium';

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: chosenPriority,
      status: 'Open',
      createdBy: req.user._id,
      assignedTo: null,
    });

    // Record initial status in StatusHistory
    await StatusHistory.create({
      ticket: ticket._id,
      changedBy: req.user._id,
      oldStatus: 'None',
      newStatus: 'Open',
      comment: 'Ticket created and marked as Open',
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tickets based on user role and filters
 * @route   GET /api/tickets
 * @access  Private
 */
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, search, scope } = req.query;
    let query = {};

    // Role-based scoping:
    // 1. Requester: only their own tickets
    if (req.user.role === 'requester') {
      query.createdBy = req.user._id;
    }
    // 2. Agent:
    //    - If scope === 'assigned', only assigned to agent
    //    - If scope === 'all', all tickets or open tickets available to agents
    //    - Default: if no scope specified, shows assigned + unassigned open tickets
    else if (req.user.role === 'agent') {
      if (scope === 'assigned') {
        query.assignedTo = req.user._id;
      } else if (scope === 'all') {
        // Agent viewing all tickets across system
      } else {
        // Default agent view: Assigned to them OR Unassigned
        query.$or = [
          { assignedTo: req.user._id },
          { assignedTo: null },
        ];
      }
    }
    // 3. Admin: Sees all tickets by default

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      message: 'Tickets retrieved successfully',
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role permission check:
    // Requester can only view their own tickets
    if (
      req.user.role === 'requester' &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket content (title, description, category, priority)
 * @route   PUT /api/tickets/:id
 * @access  Private (Requester owner, Admin, Agent)
 */
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Requester can only edit their own tickets when still Open
    if (req.user.role === 'requester') {
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit this ticket',
        });
      }
    }

    const { title, description, category, priority } = req.body;

    if (title) ticket.title = title.trim();
    if (description) ticket.description = description.trim();
    if (category) {
      const cat = await Category.findById(category);
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
      ticket.category = category;
    }
    if (priority && ['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      ticket.priority = priority;
    }

    ticket.updatedAt = Date.now();
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket status and record status history
 * @route   PATCH /api/tickets/:id/status
 * @access  Private (Admin, Agent, or Requester closing/reopening own ticket)
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check authorization:
    // Requester can only update status of their own ticket
    if (req.user.role === 'requester') {
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to change status of this ticket',
        });
      }
    }

    const oldStatus = ticket.status;

    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Ticket is already marked as ${status}`,
      });
    }

    ticket.status = status;
    ticket.updatedAt = Date.now();
    await ticket.save();

    // Create Status History entry
    await StatusHistory.create({
      ticket: ticket._id,
      changedBy: req.user._id,
      oldStatus,
      newStatus: status,
      comment: comment ? comment.trim() : `Status changed from ${oldStatus} to ${status}`,
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign ticket to a support agent
 * @route   PATCH /api/tickets/:id/assign
 * @access  Private (Admin, or Agent self-assigning)
 */
const assignTicket = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Requester cannot assign tickets
    if (req.user.role === 'requester') {
      return res.status(403).json({
        success: false,
        message: 'Requesters are not permitted to assign tickets',
      });
    }

    let assignedUser = null;

    if (agentId) {
      assignedUser = await User.findById(agentId);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Target agent not found',
        });
      }

      if (assignedUser.role !== 'agent' && assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Tickets can only be assigned to agents or admins',
        });
      }

      ticket.assignedTo = assignedUser._id;
    } else {
      // Unassign
      ticket.assignedTo = null;
    }

    ticket.updatedAt = Date.now();
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: assignedUser
        ? `Ticket successfully assigned to ${assignedUser.name}`
        : 'Ticket unassigned successfully',
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete ticket (Admin only)
 * @route   DELETE /api/tickets/:id
 * @access  Private/Admin
 */
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Delete associated comments and status history
    await Comment.deleteMany({ ticket: ticket._id });
    await StatusHistory.deleteMany({ ticket: ticket._id });
    await Ticket.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Ticket and all related history/comments deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics for current user role
 * @route   GET /api/tickets/stats/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'requester') {
      matchQuery.createdBy = req.user._id;
    } else if (req.user.role === 'agent') {
      matchQuery.assignedTo = req.user._id;
    }

    const total = await Ticket.countDocuments(matchQuery);
    const open = await Ticket.countDocuments({ ...matchQuery, status: 'Open' });
    const inProgress = await Ticket.countDocuments({ ...matchQuery, status: 'In Progress' });
    const resolved = await Ticket.countDocuments({ ...matchQuery, status: 'Resolved' });
    const closed = await Ticket.countDocuments({ ...matchQuery, status: 'Closed' });

    // Additional stats for Admin
    let systemStats = {};
    if (req.user.role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalAgents = await User.countDocuments({ role: 'agent' });
      const totalRequesters = await User.countDocuments({ role: 'requester' });
      const totalCategories = await Category.countDocuments();
      systemStats = {
        totalUsers,
        totalAgents,
        totalRequesters,
        totalCategories,
      };
    }

    // Additional stats for Agent (e.g., unassigned open queue)
    if (req.user.role === 'agent') {
      const unassignedOpen = await Ticket.countDocuments({ assignedTo: null, status: 'Open' });
      systemStats = { unassignedOpen };
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        ...systemStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
  getDashboardStats,
};
