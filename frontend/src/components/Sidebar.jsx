import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LifeBuoy,
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  Tags,
  User,
  LogOut,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { RoleBadge } from './Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <LifeBuoy size={24} />
        </div>
        <div className="brand-text">
          <h2>HelpDesk Pro</h2>
          <span>Ticket Management</span>
        </div>
      </div>

      {/* Navigation Links based on Role */}
      <nav className="sidebar-nav">
        {/* Requester Navigation */}
        {user?.role === 'requester' && (
          <>
            <div className="nav-section-title">Overview</div>
            <NavLink
              to="/requester/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="nav-section-title">Tickets</div>
            <NavLink
              to="/tickets/new"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <PlusCircle size={18} />
              <span>Create Ticket</span>
            </NavLink>
            <NavLink
              to="/tickets/my"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Ticket size={18} />
              <span>My Tickets</span>
            </NavLink>
          </>
        )}

        {/* Agent Navigation */}
        {user?.role === 'agent' && (
          <>
            <div className="nav-section-title">Overview</div>
            <NavLink
              to="/agent/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="nav-section-title">Work Queue</div>
            <NavLink
              to="/agent/assigned"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CheckSquare size={18} />
              <span>Assigned Tickets</span>
            </NavLink>
            <NavLink
              to="/agent/tickets"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Layers size={18} />
              <span>Available Tickets</span>
            </NavLink>
          </>
        )}

        {/* Admin Navigation */}
        {user?.role === 'admin' && (
          <>
            <div className="nav-section-title">Administration</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="nav-section-title">Management</div>
            <NavLink
              to="/admin/tickets"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Ticket size={18} />
              <span>All Tickets</span>
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Tags size={18} />
              <span>Categories</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>User Accounts</span>
            </NavLink>
          </>
        )}

        {/* Settings & Profile for all roles */}
        <div className="nav-section-title">Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="user-details">
            <h4>{user?.name || 'User'}</h4>
            <RoleBadge role={user?.role} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-icon"
          title="Logout"
          style={{ color: '#94a3b8' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
