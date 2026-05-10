/**
 * Tools page — CRUD for external tool bookmarks.
 */
import { useState } from 'react';
import { Plus, ExternalLink, Pencil, Trash2, Wrench } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import Modal from '../components/Modal';

const CATEGORIES = ['general', 'exploit', 'defense', 'analysis'];
const CATEGORY_COLORS = {
  general: 'bg-accent/15 text-accent',
  exploit: 'bg-danger/15 text-danger',
  defense: 'bg-success/15 text-success',
  analysis: 'bg-warning/15 text-warning',
};

function ToolForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    url: initial.url || '',
    description: initial.description || '',
    category: initial.category || 'general',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Name *</label>
        <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Flag Submitter" />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">URL *</label>
        <input className="input-dark" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
        <input className="input-dark" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
        <select className="input-dark" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-glow flex-1">{submitLabel}</button>
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary border border-border hover:border-text-muted transition-colors">Cancel</button>
      </div>
    </form>
  );
}

export default function Tools() {
  const { tools, loading, createTool, updateTool, deleteTool } = useTools();
  const [showCreate, setShowCreate] = useState(false);
  const [editTool, setEditTool] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = async (form) => {
    await createTool(form);
    setShowCreate(false);
  };

  const handleUpdate = async (form) => {
    await updateTool(editTool.id, form);
    setEditTool(null);
  };

  const handleDelete = async () => {
    await deleteTool(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tools</h1>
          <p className="text-text-secondary text-sm mt-1">Manage external tool links and bookmarks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-glow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : tools.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Wrench className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No tools added yet</p>
          <p className="text-text-muted text-sm mt-1">Add your first tool to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{tool.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.general}`}>
                    {tool.category}
                  </span>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => setEditTool(tool)} className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(tool)} className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {tool.description && <p className="text-xs text-text-muted mb-3 flex-1">{tool.description}</p>}
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors mt-auto">
                <ExternalLink className="w-3.5 h-3.5" /> Open Tool
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Tool">
        <ToolForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Create Tool" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTool} onClose={() => setEditTool(null)} title="Edit Tool">
        {editTool && <ToolForm initial={editTool} onSubmit={handleUpdate} onCancel={() => setEditTool(null)} submitLabel="Update Tool" />}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Tool">
        <p className="text-text-secondary text-sm mb-4">Are you sure you want to delete <strong className="text-text-primary">{deleteConfirm?.name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30 transition-colors">Delete</button>
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary border border-border hover:border-text-muted transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
