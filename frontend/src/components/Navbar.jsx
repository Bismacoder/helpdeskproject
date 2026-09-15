import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { RoleBadge } from './Badge';

export const Navbar = ({ onToggleSidebar, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-toggle-btn btn-icon"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <div className="page-title-badge">
          <h1>{title || 'Helpdesk Portal'}</h1>
        </div>
      </div>

      <div className="navbar-right">
        <RoleBadge role={user?.role} />
        <Link
          to="/profile"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', gap: '6px' }}
        >
          <User size={15} />
          <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Logout"
          style={{ display: 'inline-flex', gap: '6px', color: '#dc2626' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
