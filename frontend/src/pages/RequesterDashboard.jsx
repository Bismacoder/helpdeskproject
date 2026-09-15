import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { StatCard } from '../components/StatCard';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Inbox,
} from 'lucide-react';

export const RequesterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, ticketsRes] = await Promise.all([
        ticketService.getDashboardStats(),
        ticketService.getTickets(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (ticketsRes.success) {
        // Take 5 most recent
        setRecentTickets(ticketsRes.data.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading your dashboard..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
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
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track and manage your support requests in real-time.
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Support Ticket</span>
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Metrics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Tickets"
          count={stats?.total}
          icon={Ticket}
          color="#4f46e5"
          bgLight="#eef2ff"
        />
        <StatCard
          title="Open"
          count={stats?.open}
          icon={AlertCircle}
          color="#2563eb"
          bgLight="#eff6ff"
        />
        <StatCard
          title="In Progress"
          count={stats?.inProgress}
          icon={Clock}
          color="#d97706"
          bgLight="#fef3c7"
        />
        <StatCard
          title="Resolved"
          count={stats?.resolved}
          icon={CheckCircle}
          color="#16a34a"
          bgLight="#dcfce7"
        />
      </div>

      {/* Recent Tickets Table */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Support Tickets</h3>
          <Link
            to="/tickets/my"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span>View all tickets</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No tickets found</h3>
            <p>You haven't submitted any support tickets yet.</p>
            <Link
              to="/tickets/new"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '14px' }}
            >
              <PlusCircle size={16} />
              <span>Create Your First Ticket</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="ticket-title-link"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td>{ticket.category?.name || 'Unassigned'}</td>
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
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
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
