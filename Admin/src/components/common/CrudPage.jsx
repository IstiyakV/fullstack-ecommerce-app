import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiX, FiAlertTriangle } from 'react-icons/fi';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

export default function CrudPage({
  title, subtitle, endpoint, columns, formFields,
  idField = 'id', noCreate = false, noEdit = false, noDelete = false,
  renderExtra, onRowClick, paginated = false,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = paginated ? { page, per_page: 20, search } : {};
      const res = await api.get(endpoint, { params });
      setItems(res.data.data || []);
      if (paginated) setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  }, [endpoint, page, search, paginated]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing}`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post(endpoint, formData);
        toast.success('Created successfully');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({});
      fetchData();
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${endpoint}/${deleteId}`);
      toast.success('Deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (item) => {
    setEditing(item[idField]);
    const data = {};
    formFields?.forEach(f => { data[f.key] = item[f.key] || ''; });
    setFormData(data);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    const data = {};
    formFields?.forEach(f => { data[f.key] = f.default || ''; });
    setFormData(data);
    setShowForm(true);
  };

  const totalPages = Math.ceil(total / 20);
  const isFullWidth = (f) => ['textarea', 'image'].includes(f.type) || f.fullWidth;

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1>{title}</h1><p>{subtitle}</p></div>
        {!noCreate && formFields && (
          <button className="btn-primary" onClick={openCreate}><FiPlus size={16} /> Add New</button>
        )}
      </div>

      <div className="data-table-wrapper">
        <div className="table-header">
          <div className="search-wrapper w-60">
            <FiSearch className="text-slate-400" />
            <input placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span className="text-xs text-slate-400">{paginated ? `${total} total` : `${items.length} items`}</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th className="w-[1%] whitespace-nowrap">Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="text-center py-8 text-slate-400">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="text-center py-8 text-slate-400">No items found</td></tr>
              ) : (
                items.filter(item => {
                  if (!search || paginated) return true;
                  return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
                }).map((item, i) => (
                  <tr key={i} className={onRowClick ? 'cursor-pointer' : ''} onClick={() => onRowClick?.(item)}>
                    {columns.map(c => (
                      <td key={c.key}>{c.render ? c.render(item[c.key], item) : item[c.key]}</td>
                    ))}
                    <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {!noEdit && formFields && (
                          <button className="table-action-btn edit" onClick={() => openEdit(item)} title="Edit"><FiEdit2 size={15} /></button>
                        )}
                        {!noDelete && (
                          <button className="table-action-btn delete" onClick={() => setDeleteId(item[idField])} title="Delete"><FiTrash2 size={15} /></button>
                        )}
                        {renderExtra?.(item)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {paginated && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FiChevronLeft size={16} /></button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button className="btn-outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight size={16} /></button>
          </div>
        )}
      </div>

      {/* ═══ PREMIUM FORM MODAL ═══ */}
      {showForm && formFields && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h3>
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 inline-flex items-center justify-center text-sm">
                  {editing ? <FiEdit2 size={14} /> : <FiPlus size={14} />}
                </span>
                {editing ? 'Edit' : 'Create'} {title.replace(/s$/, '')}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX size={16} /></button>
            </div>

            {/* Body — scrollable */}
            <div className="modal-body">
              <div className="form-grid">
                {formFields.map(f => (
                  <div key={f.key} className={isFullWidth(f) ? 'form-full' : ''}>
                    <label className="form-label">{f.label}</label>
                    {f.type === 'image' ? (
                      <ImageUpload value={formData[f.key] || ''} folder={f.folder} onChange={(url) => setFormData({ ...formData, [f.key]: url })} />
                    ) : f.type === 'textarea' ? (
                      <textarea className="form-input" rows={3} placeholder={`Enter ${f.label.toLowerCase()}…`} value={formData[f.key] || ''} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
                    ) : f.type === 'select' ? (
                      <select className="form-select" value={formData[f.key] || ''} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}>
                        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input type={f.type || 'text'} className="form-input" placeholder={`Enter ${f.label.toLowerCase()}…`} value={formData[f.key] || ''} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleSave}>
                {editing ? <FiEdit2 size={14} /> : <FiPlus size={14} />}
                {editing ? 'Update' : 'Create'}
              </button>
              <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM ═══ */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card inline-modal text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-800">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mb-5">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button className="btn-danger flex-1 py-2.5 justify-center" onClick={handleDelete}>
                <FiTrash2 size={14} /> Delete
              </button>
              <button className="btn-outline flex-1 py-2.5 justify-center" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
