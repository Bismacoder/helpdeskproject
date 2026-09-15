import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { categoryService } from '../services/categoryService';
import { ArrowLeft, Send, AlertCircle, PlusCircle } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Loader } from '../components/Loader';

export const CreateTicket = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategory(res.data[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !category) {
      return setError('Please fill in all required fields.');
    }

    setLoading(true);

    try {
      const res = await ticketService.createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });

      if (res.success && res.data) {
        navigate(`/tickets/${res.data._id}`);
      } else {
        navigate('/tickets/my');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return <Loader message="Loading categories..." />;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/requester/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Create New Support Ticket</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Describe your issue clearly so our support team can assist promptly.
            </p>
          </div>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ticket Subject / Summary *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cannot connect to office VPN from home"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              {categories.length === 0 ? (
                <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                  No categories available. Please contact administrator.
                </p>
              ) : (
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low - Minor request or question</option>
                <option value="Medium">Medium - Normal operational issue</option>
                <option value="High">High - Significant work impediment</option>
                <option value="Urgent">Urgent - Complete work stoppage / Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea
              className="form-control"
              placeholder="Please provide steps to reproduce, error codes, and any troubleshooting already attempted..."
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <Link to="/tickets/my" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || categories.length === 0}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
