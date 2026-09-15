import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import { PlusCircle, Edit2, Trash2, Tags, Inbox } from 'lucide-react';

export const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category Modal (Create or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Category
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError('');

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
        });
        setSuccess(`Category '${name.trim()}' updated successfully`);
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          description: description.trim(),
        });
        setSuccess(`Category '${name.trim()}' created successfully`);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      setSaving(true);
      setError('');
      await categoryService.deleteCategory(deletingCategory._id);
      setSuccess(`Category '${deletingCategory.name}' deleted successfully`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
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
          <h2>Ticket Categories</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Define and organize helpdesk categories used by requesters and agents.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Categories Table */}
      <div className="card">
        {loading ? (
          <Loader message="Loading categories..." />
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h3>No categories found</h3>
            <p>Create your first category to enable ticket creation.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tags size={16} color="#4f46e5" />
                        <strong style={{ fontSize: '0.9rem' }}>{cat.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '360px' }}>
                      {cat.description || 'No description provided'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveCategory}
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveCategory}>
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Hardware, Software, Network"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Provide a brief explanation of what this category covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Confirm Category Deletion"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletingCategory(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteCategory}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Category'}
            </button>
          </>
        }
      >
        <p style={{ color: '#334155', fontSize: '0.95rem' }}>
          Are you sure you want to delete category{' '}
          <strong>{deletingCategory?.name}</strong>?
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
          Note: You cannot delete categories that have tickets currently attached to them.
        </p>
      </Modal>
    </div>
  );
};
