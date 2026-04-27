import { useState, useEffect } from 'react';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function AppConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = () => {
    setLoading(true);
    api.get('/app-config')
      .then(r => {
        setConfigs(r.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchConfigs, []);

  const handleUpdate = async (id, val) => {
    try {
      const res = await api.put(`/app-config/${id}`, { config_value: val });
      if (res.data.success) {
        toast.success('Updated successfully');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Error updating config');
    }
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1>App Configuration</h1><p>Manage global application settings</p></div>
      </div>

      <div className="data-table-wrapper max-w-3xl">
        <table>
          <thead><tr><th>Setting Key</th><th>Value</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="text-center py-8 text-slate-400">Loading…</td></tr> :
            configs.map(c => (
              <tr key={c.config_id}>
                <td className="font-medium text-slate-700">{c.config_key}</td>
                <td>
                  <input
                    className="form-input"
                    value={c.config_value || ''}
                    onChange={(e) => setConfigs(configs.map(x => x.config_id === c.config_id ? { ...x, config_value: e.target.value } : x))}
                  />
                </td>
                <td>
                  <button className="btn-primary py-1.5" onClick={() => handleUpdate(c.config_id, c.config_value)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
