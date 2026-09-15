import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Search, Filter, CheckSquare, Edit3, Inbox } from 'lucide-react';

export const AssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Fast Status Update Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { scope: 'assigned' };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await ticketService.getTickets(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assigned tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssignedTickets();
  };

  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setStatusComment('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await ticketService.updateTicketStatus(selectedTicket._id, {
        status: newStatus,
        comment: statusComment,
      });

      setSuccess(`Ticket status updated to ${newStatus}`);
      setSelectedTicket(null);
      fetchAssignedTickets();
    } catch (err) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
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
          <h2>My Assigned Tickets</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Tickets assigned directly to you for investigation and resolution.
          </p>
        </div>
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
              placeholder="Search assigned tickets..."
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

          <button type="submit" className="btn btn-secondary">
            <Filter size={15} />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Assigned Tickets Table */}
      <div className="card">
        {loading ? (
          <Loader message="Loading assigned tickets..." />
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No assigned tickets</h3>
            <p>You have no tickets currently matching your filters.</p>
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
                  <th>Updated</th>
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
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openStatusModal(ticket)}
                          className="btn btn-secondary btn-sm"
                          title="Quick Status Change"
                        >
                          <Edit3 size={14} />
                          <span>Status</span>
                        </button>
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Update Status: ${selectedTicket?.title?.substring(0, 30)}...`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedTicket(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStatusUpdate}
              disabled={updatingStatus || newStatus === selectedTicket?.status}
            >
              {updatingStatus ? 'Updating...' : 'Save Status'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>New Status</label>
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
          <label>Change Reason / Note (Saved to Status History)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Explain why the status is being updated..."
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
