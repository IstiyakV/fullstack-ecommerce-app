import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function AppConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState({});

  useEffect(() => {
    api.get('/app-config').then(r => { setConfigs(r.data.data || []); setLoading(false); });
  }, []);

  const handleSave = async (c) => {
    const newVal = edited[c.config_id] ?? c.config_value;
    await api.put(`/app-config/${c.config_id}`, { config_value: newVal });
    toast.success(`${c.config_key} updated`);
    setEdited(prev => { const n = { ...prev }; delete n[c.config_id]; return n; });
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading…</div>;

  return (
    <div>
      <div className="page-header"><h1>App Configuration</h1><p>Edit global app settings (currency, contact info, etc.)</p></div>
      <div className="data-table-wrapper">
        <table>
          <thead><tr><th>Key</th><th>Value</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {configs.map(c => (
              <tr key={c.config_id}>
                <td><span className="font-mono text-sm font-semibold text-indigo-600">{c.config_key}</span></td>
                <td><input className="form-input" value={edited[c.config_id] ?? c.config_value} onChange={(e) => setEdited({...edited, [c.config_id]: e.target.value})} /></td>
                <td className="text-xs text-slate-500">{c.description || '—'}</td>
                <td><button className="btn-primary" onClick={() => handleSave(c)}><FiSave size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
