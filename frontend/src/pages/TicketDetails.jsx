import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { commentService } from '../services/commentService';
import { statusHistoryService } from '../services/statusHistoryService';
import { userService } from '../services/userService';
import { PriorityBadge, StatusBadge, RoleBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import {
  ArrowLeft,
  MessageSquare,
  History,
  Send,
  UserCheck,
  Edit3,
  Calendar,
  User,
  Tags,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';

export const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Assign Agent Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [savingAssign, setSavingAssign] = useState(false);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError('');

      const [ticketRes, commentsRes, historyRes] = await Promise.all([
        ticketService.getTicketById(id),
        commentService.getComments(id),
        statusHistoryService.getTicketHistory(id),
      ]);

      if (ticketRes.success) {
        setTicket(ticketRes.data);
        setNewStatus(ticketRes.data.status);
        setSelectedAgentId(ticketRes.data.assignedTo?._id || '');
      }
      if (commentsRes.success) setComments(commentsRes.data);
      if (historyRes.success) setHistory(historyRes.data);

      // If user is admin, fetch agents list for assignment dropdown
      if (user?.role === 'admin') {
        const agentRes = await userService.getUsers({ role: 'agent' });
        if (agentRes.success) setAgents(agentRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  // Submit comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setError('');
      const res = await commentService.addComment(id, newComment.trim());
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
        setSuccess('Comment posted successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Update Status
  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === ticket?.status) return;

    try {
      setSavingStatus(true);
      setError('');
      const res = await ticketService.updateTicketStatus(id, {
        status: newStatus,
        comment: statusComment,
      });

      if (res.success) {
        setSuccess(`Status updated to ${newStatus}`);
        setStatusModalOpen(false);
        fetchTicketData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  // Assign Agent
  const handleAssignAgent = async (e) => {
    e.preventDefault();

    try {
      setSavingAssign(true);
      setError('');
      const res = await ticketService.assignTicket(id, {
        agentId: selectedAgentId || null,
      });

      if (res.success) {
        setSuccess('Ticket assignment updated successfully');
        setAssignModalOpen(false);
        fetchTicketData();
      }
    } catch (err) {
      setError(err.message || 'Failed to assign agent');
    } finally {
      setSavingAssign(false);
    }
  };

  // Self Assign for agents
  const handleSelfAssign = async () => {
    try {
      setLoading(true);
      await ticketService.assignTicket(id, { agentId: user._id });
      setSuccess('You have claimed this ticket');
      fetchTicketData();
    } catch (err) {
      setError(err.message || 'Failed to claim ticket');
      setLoading(false);
    }
  };

  if (loading && !ticket) {
    return <Loader message="Loading ticket details..." />;
  }

  if (!ticket && error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h3>Ticket Not Found</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const canChangeStatus =
    user?.role === 'admin' ||
    user?.role === 'agent' ||
    (user?.role === 'requester' && ticket?.createdBy?._id === user?._id);

  const canAssign = user?.role === 'admin';

  return (
    <div>
      {/* Top Breadcrumb & Action Bar */}
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
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Agent Self-Assign Button */}
          {user?.role === 'agent' && !ticket.assignedTo && (
            <button onClick={handleSelfAssign} className="btn btn-primary btn-sm">
              <UserCheck size={15} />
              <span>Claim Ticket (Assign to Me)</span>
            </button>
          )}

          {/* Admin Assign Button */}
          {canAssign && (
            <button
              onClick={() => setAssignModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <UserCheck size={15} />
              <span>Assign Agent</span>
            </button>
          )}

          {/* Status Change Button */}
          {canChangeStatus && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Edit3 size={15} />
              <span>Update Status</span>
            </button>
          )}
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Main Grid: Ticket Details + Timeline/Metadata */}
      <div className="ticket-detail-grid">
        {/* Left Column: Details & Comments */}
        <div>
          {/* Main Ticket Card */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Ticket #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
                  {ticket.title}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                Issue Description:
              </h4>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#4f46e5" />
                <h3>Conversation & Notes ({comments.length})</h3>
              </div>
            </div>

            {comments.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>
                No comments yet. Start the conversation below.
              </p>
            ) : (
              <div className="comments-thread">
                {comments.map((c) => {
                  const roleClass =
                    c.user?.role === 'admin'
                      ? 'comment-admin'
                      : c.user?.role === 'agent'
                      ? 'comment-agent'
                      : '';

                  return (
                    <div key={c._id} className={`comment-bubble ${roleClass}`}>
                      <div className="comment-meta">
                        <div className="comment-author">
                          <span>{c.user?.name || 'User'}</span>
                          <RoleBadge role={c.user?.role} />
                        </div>
                        <span className="comment-time">
                          {new Date(c.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="comment-text">{c.message}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Add a Reply or Note</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Type your message or update here..."
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingComment || !newComment.trim()}
                >
                  <Send size={15} />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata Box & Status History Timeline */}
        <div>
          {/* Metadata Card */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Ticket Information
            </h3>

            <div className="ticket-meta-box">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{ticket.category?.name || 'General'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Priority:</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="meta-item">
                <span className="meta-label">Requester:</span>
                <span className="meta-value">{ticket.createdBy?.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assigned To:</span>
                <span className="meta-value">
                  {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Submitted On:</span>
                <span className="meta-value">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Last Updated:</span>
                <span className="meta-value">
                  {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status History Timeline Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <History size={18} color="#4f46e5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Status History</h3>
            </div>

            {history.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No history records yet.</p>
            ) : (
              <div className="timeline">
                {history.map((h) => (
                  <div key={h._id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">
                          {h.oldStatus !== 'None' ? `${h.oldStatus} ➔ ` : ''}
                          <strong>{h.newStatus}</strong>
                        </span>
                        <span className="timeline-time">
                          {new Date(h.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                        By <strong>{h.changedBy?.name || 'System'}</strong> ({h.changedBy?.role || 'user'})
                      </p>
                      {h.comment && <div className="timeline-comment">{h.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Ticket Status"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStatusChange}
              disabled={savingStatus || newStatus === ticket?.status}
            >
              {savingStatus ? 'Saving...' : 'Confirm Status'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Select New Status</label>
          <select
            className="form-control"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Reason / Note for Status History (Optional)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Explain reason for this status change..."
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
          />
        </div>
      </Modal>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Ticket to Support Agent"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAssignAgent}
              disabled={savingAssign}
            >
              {savingAssign ? 'Assigning...' : 'Save Assignment'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Support Agent</label>
          <select
            className="form-control"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <option value="">-- Unassigned --</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};
