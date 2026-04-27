import { useState, useEffect } from 'react';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function PaymentGateways() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGateways = () => {
    setLoading(true);
    api.get('/payment-gateways')
      .then(r => {
        setGateways(r.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchGateways, []);

  const handleUpdate = async (id, isActive, configJson) => {
    try {
      const parsedConfig = configJson ? JSON.parse(configJson) : {};
      const res = await api.put(`/payment-gateways/${id}`, { is_active: isActive?.toString(), config_json: parsedConfig });
      if (res.data.success) {
        toast.success('Updated successfully');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Error updating gateway. Ensure config is valid JSON.');
    }
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1>Payment Gateways</h1><p>Enable/disable payment methods and manage their settings</p></div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {loading ? <div className="text-center py-8 text-slate-400">Loading…</div> :
        gateways.map((g) => {
          const configStringified = typeof g.config_json === 'string' ? g.config_json : JSON.stringify(g.config_json, null, 2);
          return (
            <div key={g.gateway_id} className="stat-card">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-700">{g.gateway_name}</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500 font-medium">Active</span>
                  <input
                    type="checkbox"
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    checked={g.is_active === '1'}
                    onChange={(e) => setGateways(gateways.map(x => x.gateway_id === g.gateway_id ? { ...x, is_active: e.target.checked ? '1' : '0' } : x))}
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="form-label block mb-2">Configuration (JSON)</label>
                <textarea
                  className="form-input font-mono text-sm leading-relaxed"
                  rows={4}
                  value={g._tempConfig !== undefined ? g._tempConfig : configStringified}
                  onChange={(e) => setGateways(gateways.map(x => x.gateway_id === g.gateway_id ? { ...x, _tempConfig: e.target.value } : x))}
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => handleUpdate(g.gateway_id, g.is_active, g._tempConfig !== undefined ? g._tempConfig : configStringified)}
                >
                  Save Settings
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
