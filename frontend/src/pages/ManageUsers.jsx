import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { Search, Edit2, Trash2, Shield, UserX, UserCheck, Inbox, Lock, Eye, EyeOff } from 'lucide-react';

export const ManageUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('requester');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);


  // Delete confirmation
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await userService.getUsers(params);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setIsActive(u.isActive);
    setPassword('');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      setError('');
      const updateData = { name, email, role, isActive };
      if (password) updateData.password = password;

      await userService.updateUser(editingUser._id, updateData);
      setSuccess(`User ${name} updated successfully`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setSaving(true);
      setError('');
      await userService.deleteUser(deletingUser._id);
      setSuccess(`User ${deletingUser.name} deleted successfully`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setSaving(false);
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
          <h2>User Accounts Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Manage user permissions, roles, activation statuses, and security credentials.
          </p>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filter and Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="requester">Requesters</option>
            <option value="agent">Support Agents</option>
            <option value="admin">Administrators</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <Loader message="Loading user directory..." />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No users found</h3>
            <p>No user records match your search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{u.name}</strong>
                        {u._id === currentUser?._id && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.7rem',
                              color: '#4f46e5',
                              fontWeight: 700,
                            }}
                          >
                            (You)
                          </span>
                        )}
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      {u.isActive ? (
                        <span
                          style={{
                            color: '#16a34a',
                            backgroundColor: '#dcfce7',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            color: '#dc2626',
                            backgroundColor: '#fee2e2',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          className="btn btn-secondary btn-sm"
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        {u._id !== currentUser?._id && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.name}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveUser}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={editingUser?._id === currentUser?._id}
              >
                <option value="requester">Requester</option>
                <option value="agent">Support Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label>Account Status</label>
              <select
                className="form-control"
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                disabled={editingUser?._id === currentUser?._id}
              >
                <option value="true">Active (Allowed to sign in)</option>
                <option value="false">Deactivated (Block access)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reset Password (Optional)</label>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="with-toggle"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Confirm User Deletion"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteUser}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete User'}
            </button>
          </>
        }
      >
        <p style={{ color: '#334155', fontSize: '0.95rem' }}>
          Are you sure you want to permanently delete user{' '}
          <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
        </p>
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
