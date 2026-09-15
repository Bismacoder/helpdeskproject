import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { categoryService } from '../services/categoryService';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import {
  Search,
  Filter,
  UserCheck,
  Edit3,
  Trash2,
  Inbox,
  PlusCircle,
} from 'lucide-react';

export const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Assign Agent Modal
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [savingAssign, setSavingAssign] = useState(false);

  // Quick Status Modal
  const [statusModalTicket, setStatusModalTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Delete Ticket Modal
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [savingDelete, setSavingDelete] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [catRes, agentRes] = await Promise.all([
        categoryService.getCategories(),
        userService.getUsers({ role: 'agent' }),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (agentRes.success) setAgents(agentRes.data);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const res = await ticketService.getTickets(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const openAssignModal = (ticket) => {
    setAssignModalTicket(ticket);
    setSelectedAgentId(ticket.assignedTo?._id || '');
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!assignModalTicket) return;

    try {
      setSavingAssign(true);
      setError('');
      await ticketService.assignTicket(assignModalTicket._id, {
        agentId: selectedAgentId || null,
      });

      setSuccess('Ticket assignment updated successfully');
      setAssignModalTicket(null);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to assign ticket');
    } finally {
      setSavingAssign(false);
    }
  };

  const openStatusModal = (ticket) => {
    setStatusModalTicket(ticket);
    setNewStatus(ticket.status);
    setStatusComment('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusModalTicket || !newStatus) return;

    try {
      setSavingStatus(true);
      setError('');
      await ticketService.updateTicketStatus(statusModalTicket._id, {
        status: newStatus,
        comment: statusComment,
      });

      setSuccess(`Ticket status updated to ${newStatus}`);
      setStatusModalTicket(null);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;

    try {
      setSavingDelete(true);
      setError('');
      await ticketService.deleteTicket(deletingTicket._id);
      setSuccess('Ticket and all related history/comments deleted successfully');
      setDeletingTicket(null);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to delete ticket');
    } finally {
      setSavingDelete(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2>All Support Tickets</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Comprehensive overview of all tickets across every department and requester.
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Create Ticket</span>
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-secondary">
            <Filter size={15} />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Tickets Table */}
      <div className="card">
        {loading ? (
          <Loader message="Loading tickets..." />
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No tickets found</h3>
            <p>No tickets match your filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket Subject</th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link to={`/tickets/${ticket._id}`} className="ticket-title-link">
                        {ticket.title}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{ticket.createdBy?.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                          {ticket.createdBy?.email}
                        </span>
                      </div>
                    </td>
                    <td>{ticket.category?.name || 'General'}</td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      {ticket.assignedTo ? (
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {ticket.assignedTo.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openAssignModal(ticket)}
                          className="btn btn-secondary btn-sm"
                          title="Assign Support Agent"
                        >
                          <UserCheck size={14} />
                          <span>Assign</span>
                        </button>
                        <button
                          onClick={() => openStatusModal(ticket)}
                          className="btn btn-secondary btn-sm"
                          title="Change Status"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingTicket(ticket)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                          title="Delete Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={!!assignModalTicket}
        onClose={() => setAssignModalTicket(null)}
        title={`Assign Agent: ${assignModalTicket?.title?.substring(0, 30)}...`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAssignModalTicket(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAssign}
              disabled={savingAssign}
            >
              {savingAssign ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Select Support Agent</label>
          <select
            className="form-control"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <option value="">-- Unassigned --</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* Quick Status Modal */}
      <Modal
        isOpen={!!statusModalTicket}
        onClose={() => setStatusModalTicket(null)}
        title={`Change Status: ${statusModalTicket?.title?.substring(0, 30)}...`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStatusModalTicket(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveStatus}
              disabled={savingStatus || newStatus === statusModalTicket?.status}
            >
              {savingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Status</label>
          <select
            className="form-control"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status Change Comment (Logged to History)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Reason for status change..."
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Ticket Modal */}
      <Modal
        isOpen={!!deletingTicket}
        onClose={() => setDeletingTicket(null)}
        title="Confirm Ticket Deletion"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletingTicket(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteTicket}
              disabled={savingDelete}
            >
              {savingDelete ? 'Deleting...' : 'Delete Ticket'}
            </button>
          </>
        }
      >
        <p style={{ color: '#334155', fontSize: '0.95rem' }}>
          Are you sure you want to delete ticket{' '}
          <strong>"{deletingTicket?.title}"</strong>?
        </p>
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px' }}>
          This will permanently delete this ticket along with its comments and status history.
        </p>
      </Modal>
    </div>
  );
};
