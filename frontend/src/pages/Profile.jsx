import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle2, Shield, Calendar } from 'lucide-react';
import { RoleBadge } from '../components/Badge';
import { Alert } from '../components/Alert';

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (password && password !== confirmPassword) {
      return setStatus({ type: 'error', message: 'New passwords do not match' });
    }

    if (password && password.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
    }

    setLoading(true);

    try {
      const updateData = { name, email };
      if (password) updateData.password = password;

      await updateProfile(updateData);
      setPassword('');
      setConfirmPassword('');
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2>User Profile & Settings</h2>
          <RoleBadge role={user?.role} />
        </div>

        <Alert
          type={status.type}
          message={status.message}
          onClose={() => setStatus({ type: '', message: '' })}
        />

        {/* Profile Overview Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{user?.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} /> Role: <strong>{user?.role}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '14px' }}>Change Password (Optional)</h4>

          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <div className="search-input-wrapper">
                <span className="search-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="search-input-wrapper">
                <span className="search-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle2 size={16} />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
