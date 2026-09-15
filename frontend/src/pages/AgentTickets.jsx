import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Search, Filter, Layers, UserPlus, Inbox } from 'lucide-react';

export const AgentTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { scope: 'all' };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await ticketService.getTickets(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tickets pool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleSelfAssign = async (ticketId) => {
    try {
      await ticketService.assignTicket(ticketId, { agentId: user._id });
      setSuccess('Ticket successfully assigned to you!');
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to claim ticket');
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
          <h2>Available Support Pool</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Browse all tickets across the system and claim unassigned tickets.
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
              placeholder="Search all tickets..."
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

      {/* All Available Tickets Table */}
      <div className="card">
        {loading ? (
          <Loader message="Loading ticket pool..." />
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
                  <th>Current Assignee</th>
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
                    <td>{ticket.createdBy?.name || 'User'}</td>
                    <td>{ticket.category?.name || 'General'}</td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      {ticket.assignedTo ? (
                        <span
                          style={{
                            fontWeight: 500,
                            color:
                              ticket.assignedTo._id === user._id ? '#4f46e5' : '#334155',
                          }}
                        >
                          {ticket.assignedTo._id === user._id
                            ? 'You'
                            : ticket.assignedTo.name}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: '#e11d48',
                            backgroundColor: '#ffe4e6',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!ticket.assignedTo && (
                          <button
                            onClick={() => handleSelfAssign(ticket._id)}
                            className="btn btn-primary btn-sm"
                            title="Assign to yourself"
                          >
                            <UserPlus size={14} />
                            <span>Claim</span>
                          </button>
                        )}
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View
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
    </div>
  );
};
