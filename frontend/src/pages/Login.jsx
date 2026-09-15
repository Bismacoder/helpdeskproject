import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';
import { Alert } from '../components/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login({ email, password });
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/requester/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <LifeBuoy size={28} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your Helpdesk account</p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="demo-credentials-box">
          <h4>⚡ Quick Demo Credentials</h4>
          <div className="demo-btn-group">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('admin@helpdesk.com', 'admin123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#7e22ce" />
                <strong>Admin</strong>: admin@helpdesk.com
              </span>
              <span>Fill</span>
            </button>

            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('agent@helpdesk.com', 'agent123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} color="#3730a3" />
                <strong>Agent</strong>: agent@helpdesk.com
              </span>
              <span>Fill</span>
            </button>

            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('user@helpdesk.com', 'user123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#475569" />
                <strong>Requester</strong>: user@helpdesk.com
              </span>
              <span>Fill</span>
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create a Requester account</Link>
        </div>
      </div>
    </div>
  );
};
