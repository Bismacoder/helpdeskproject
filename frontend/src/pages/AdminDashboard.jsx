import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { StatCard } from '../components/StatCard';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import {
  ShieldAlert,
  Ticket,
  Users,
  Tags,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard = () => {
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
        setRecentTickets(ticketsRes.data.slice(0, 6));
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading administrator overview..." />;
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
            System Administration Overview 🛡️
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Welcome, {user?.name}. Complete overview of system metrics and operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/tickets" className="btn btn-primary">
            <Ticket size={16} />
            <span>Manage Tickets</span>
          </Link>
          <Link to="/admin/categories" className="btn btn-secondary">
            <Tags size={16} />
            <span>Categories</span>
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            <Users size={16} />
            <span>Users</span>
          </Link>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Primary Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Tickets"
          count={stats?.total}
          icon={Ticket}
          color="#4f46e5"
          bgLight="#eef2ff"
        />
        <StatCard
          title="Open Tickets"
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
        <StatCard
          title="Total Users"
          count={stats?.totalUsers}
          icon={Users}
          color="#7e22ce"
          bgLight="#faf5ff"
        />
        <StatCard
          title="Support Agents"
          count={stats?.totalAgents}
          icon={UserCheck}
          color="#0891b2"
          bgLight="#ecfeff"
        />
        <StatCard
          title="Requesters"
          count={stats?.totalRequesters}
          icon={Users}
          color="#475569"
          bgLight="#f1f5f9"
        />
        <StatCard
          title="Categories"
          count={stats?.totalCategories}
          icon={Tags}
          color="#ea580c"
          bgLight="#fff7ed"
        />
      </div>

      {/* Recent System Tickets */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Support Tickets</h3>
          <Link
            to="/admin/tickets"
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
          <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
            No tickets in the system yet.
          </p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
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
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {ticket.assignedTo.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          Unassigned
                        </span>
                      )}
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
