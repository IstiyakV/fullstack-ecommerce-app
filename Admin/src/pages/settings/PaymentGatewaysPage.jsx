import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payment-gateways').then(r => { setGateways(r.data.data || []); setLoading(false); });
  }, []);

  const toggleActive = async (gw) => {
    const newActive = gw.is_active === '1' ? '0' : '1';
    await api.put(`/payment-gateways/${gw.gateway_id}`, { is_active: newActive });
    toast.success(`${gw.display_name} ${newActive === '1' ? 'enabled' : 'disabled'}`);
    setGateways(prev => prev.map(g => g.gateway_id === gw.gateway_id ? { ...g, is_active: newActive } : g));
  };

  const updateConfig = async (gw, configJson) => {
    await api.put(`/payment-gateways/${gw.gateway_id}`, { config_json: configJson });
    toast.success(`${gw.display_name} config saved`);
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading…</div>;

  return (
    <div>
      <div className="page-header"><h1>Payment Gateways</h1><p>Enable/disable payment methods and configure API keys</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map(gw => (
          <GatewayCard key={gw.gateway_id} gw={gw} onToggle={() => toggleActive(gw)} onSaveConfig={(cfg) => updateConfig(gw, cfg)} />
        ))}
      </div>
    </div>
  );
}

function GatewayCard({ gw, onToggle, onSaveConfig }) {
  const [configJson, setConfigJson] = useState(gw.config_json || '{}');

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base">{gw.display_name}</h3>
          <p className="text-xs text-slate-500">{gw.gateway_name} • {gw.payment_type}</p>
        </div>
        <button className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${gw.is_active === '1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`} onClick={onToggle}>
          {gw.is_active === '1' ? '● Active' : '○ Inactive'}
        </button>
      </div>
      <div>
        <label className="form-label">Config JSON</label>
        <textarea className="form-input font-mono text-xs" rows={4} value={configJson} onChange={(e) => setConfigJson(e.target.value)} />
      </div>
      <button className="btn-primary mt-3 w-full justify-center" onClick={() => onSaveConfig(configJson)}>
        <FiSave size={14} /> Save Config
      </button>
    </div>
  );
}
