import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { StatCard } from '../components/StatCard';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import {
  CheckSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Inbox,
  Layers,
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, ticketsRes] = await Promise.all([
        ticketService.getDashboardStats(),
        ticketService.getTickets({ scope: 'assigned' }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (ticketsRes.success) {
        setAssignedTickets(ticketsRes.data.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Failed to load agent dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading agent workspace..." />;
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Support Agent Workspace 🛠️
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Welcome back, {user?.name}. Here is your active ticket queue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/agent/assigned" className="btn btn-primary">
            <CheckSquare size={16} />
            <span>My Assigned Queue</span>
          </Link>
          <Link to="/agent/tickets" className="btn btn-secondary">
            <Layers size={16} />
            <span>Available Pool</span>
          </Link>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Metrics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Assigned to You"
          count={stats?.total}
          icon={CheckSquare}
          color="#4f46e5"
          bgLight="#eef2ff"
        />
        <StatCard
          title="Your In Progress"
          count={stats?.inProgress}
          icon={Clock}
          color="#d97706"
          bgLight="#fef3c7"
        />
        <StatCard
          title="Your Resolved"
          count={stats?.resolved}
          icon={CheckCircle}
          color="#16a34a"
          bgLight="#dcfce7"
        />
        <StatCard
          title="Unassigned Pool"
          count={stats?.unassignedOpen || 0}
          icon={AlertCircle}
          color="#2563eb"
          bgLight="#eff6ff"
        />
      </div>

      {/* Active Assigned Tickets */}
      <div className="card">
        <div className="card-header">
          <h3>Your Current Active Tickets</h3>
          <Link
            to="/agent/assigned"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span>View all assigned</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {assignedTickets.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No tickets currently assigned</h3>
            <p>Check the available tickets pool to pick up new tickets.</p>
            <Link
              to="/agent/tickets"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '14px' }}
            >
              <Layers size={16} />
              <span>Browse Ticket Pool</span>
            </Link>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link to={`/tickets/${ticket._id}`} className="ticket-title-link">
                        {ticket.title}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {ticket.createdBy?.name || 'User'}
                      </span>
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
                      <Link to={`/tickets/${ticket._id}`} className="btn btn-secondary btn-sm">
                        Manage
                      </Link>
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
