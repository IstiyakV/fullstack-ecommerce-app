import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiZap, FiCheck, FiX, FiSave, FiBox, FiImage, FiUploadCloud, FiStar, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api, { resolveImage } from '../../api/adminApi';

export default function ProductVariants() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newType, setNewType] = useState('');
  const [newOption, setNewOption] = useState({ type_id: '', option_value: '', color_code: '', option_image: '' });
  const [newSku, setNewSku] = useState({ sku_code: '', regular_price: '', price: '', stock: '0', combination: '{}', is_active: '1' });
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editOptionForm, setEditOptionForm] = useState(null);
  const [editingSkuId, setEditingSkuId] = useState(null);
  const [editSkuForm, setEditSkuForm] = useState(null);

  // Gallery modal state
  const [galleryOption, setGalleryOption] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, tRes, oRes, sRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/variant-types`),
        api.get(`/products/${id}/variant-options`),
        api.get(`/products/${id}/skus`),
      ]);
      setProduct(pRes.data.data);
      setTypes(tRes.data.data || []);
      setOptions(oRes.data.data || []);
      setSkus(sRes.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load variant data');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addType = async () => {
    if (!newType.trim()) return;
    try {
      await api.post(`/products/${id}/variant-types`, { type_name: newType, sort_order: types.length.toString() });
      setNewType('');
      toast.success('Variant type added');
      fetchAll();
    } catch (e) { toast.error('Failed to add type'); }
  };

  const deleteType = async (typeId) => {
    if (!window.confirm('Delete this variant type and all its options?')) return;
    try {
      await api.delete(`/variant-types/${typeId}`);
      toast.success('Variant type deleted');
      fetchAll();
    } catch (e) { toast.error('Failed to delete type'); }
  };

  // Gallery modal helpers
  const parseGallery = (o) => {
    try { return o.gallery_images ? (typeof o.gallery_images === 'string' ? JSON.parse(o.gallery_images) : o.gallery_images) : []; } catch { return []; }
  };

  const openGallery = (o) => {
    setGalleryOption(o);
    setGalleryImages(parseGallery(o));
  };

  const closeGallery = () => { setGalleryOption(null); setGalleryImages([]); setDragOver(false); };

  const handleGalleryUpload = async (files) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileList.length) return;
    if (galleryImages.length + fileList.length > 20) return toast.error('Maximum 20 images per variant');
    setGalleryUploading(true);
    const toastId = toast.loading(`Uploading ${fileList.length} image${fileList.length > 1 ? 's' : ''}...`);
    try {
      const urls = [];
      for (const file of fileList) {
        const fd = new FormData(); fd.append('file', file);
        const res = await api.post('/upload?folder=products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urls.push(res.data.url);
      }
      setGalleryImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`, { id: toastId });
    } catch { toast.error('Upload failed', { id: toastId }); }
    setGalleryUploading(false);
  };

  const removeGalleryImage = (index) => setGalleryImages(prev => prev.filter((_, i) => i !== index));

  const saveGallery = async () => {
    if (!galleryOption) return;
    try {
      await api.put(`/variant-options/${galleryOption.option_id}`, { gallery_images: galleryImages });
      toast.success('Gallery saved');
      fetchAll();
      closeGallery();
    } catch { toast.error('Failed to save gallery'); }
  };

  // Drag-and-drop reorder for gallery images
  const handleGalleryDragStart = (i) => setDragIdx(i);
  const handleGalleryDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    setGalleryImages(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(i, 0, moved);
      return arr;
    });
    setDragIdx(i);
  };
  const handleGalleryDragEnd = () => setDragIdx(null);

  // Set default option
  const setDefaultOption = async (optionId) => {
    try {
      await api.patch(`/variant-options/${optionId}/set-default`);
      toast.success('Default set');
      fetchAll();
    } catch { toast.error('Failed to set default'); }
  };

  const addOption = async () => {
    if (!newOption.type_id || !newOption.option_value) return toast.error('Type and Value are required');
    try {
      await api.post(`/products/${id}/variant-options`, newOption);
      setNewOption({ type_id: '', option_value: '', color_code: '', option_image: '' });
      toast.success('Option added');
      fetchAll();
    } catch (e) { toast.error('Failed to add option'); }
  };

  const deleteOption = async (optId) => {
    if (!window.confirm('Delete this option?')) return;
    try {
      await api.delete(`/variant-options/${optId}`);
      toast.success('Option deleted');
      fetchAll();
    } catch (e) { toast.error('Failed to delete option'); }
  };

  const startEditOption = (o) => {
    setEditingOptionId(o.option_id);
    setEditOptionForm({ ...o });
  };

  const saveOptionEdit = async () => {
    try {
      await api.put(`/variant-options/${editingOptionId}`, editOptionForm);
      setEditingOptionId(null);
      toast.success('Option updated');
      fetchAll();
    } catch (e) { toast.error('Failed to update option'); }
  };

  const addSku = async () => {
    if (!newSku.sku_code || !newSku.price) return toast.error('SKU Code and Price are required');
    try {
      await api.post(`/products/${id}/skus`, newSku);
      setNewSku({ sku_code: '', regular_price: '', price: '', stock: '0', combination: '{}', is_active: '1' });
      toast.success('SKU added');
      fetchAll();
    } catch (e) { toast.error('Failed to add SKU'); }
  };

  const deleteSku = async (skuId) => {
    if (!window.confirm('Delete this SKU?')) return;
    try {
      await api.delete(`/skus/${skuId}`);
      toast.success('SKU deleted');
      fetchAll();
    } catch (e) { toast.error('Failed to delete SKU'); }
  };

  const startEditSku = (s) => {
    setEditingSkuId(s.sku_id);
    setEditSkuForm({ ...s });
  };

  const saveSkuEdit = async () => {
    try {
      await api.put(`/skus/${editingSkuId}`, editSkuForm);
      setEditingSkuId(null);
      toast.success('SKU updated');
      fetchAll();
    } catch (e) { toast.error('Failed to update SKU'); }
  };

  const toggleSkuActive = async (sku) => {
    try {
      await api.put(`/skus/${sku.sku_id}`, { is_active: sku.is_active === '1' ? '0' : '1' });
      toast.success('Status updated');
      fetchAll();
    } catch (e) { toast.error('Failed to update status'); }
  };

  const autoGenerate = async () => {
    try {
      const res = await api.post(`/products/${id}/auto-generate-skus`);
      toast.success(res.data.message || 'SKUs generated successfully');
      fetchAll();
    } catch (e) { toast.error('Failed to auto-generate SKUs'); }
  };

  const deleteAllVariants = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete ALL variants (types, options, and SKUs)? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}/variants`);
      toast.success('All variants deleted successfully');
      fetchAll();
    } catch (e) { toast.error('Failed to delete all variants'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium mb-2 transition-colors">
          <FiArrowLeft /> Back to Products
        </Link>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm">
              <FiBox />
            </div>
            <div>
              <h1>Variants: {product?.product_name || `Product #${id}`}</h1>
              <p>Master SKU: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs ml-1">{product?.sku_code || '—'}</span></p>
            </div>
          </div>
          <button onClick={deleteAllVariants} className="btn-danger py-2 px-4 flex items-center gap-2">
            <FiTrash2 /> Master Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Types & Options */}
        <div className="space-y-6 lg:col-span-1">
          {/* Variant Types */}
          <div className="stat-card">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Variant Types
            </h2>
            <div className="grid grid-cols-[1fr_auto] gap-2 mb-4">
              <input value={newType} onChange={e => setNewType(e.target.value)} placeholder="e.g. Color, Size"
                className="form-input text-sm py-2 w-full" onKeyDown={e => e.key === 'Enter' && addType()} />
              <button onClick={addType} className="btn-primary py-2 px-4 flex items-center justify-center"><FiPlus /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <div key={t.type_id} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow">
                  {t.type_name}
                  <button onClick={() => deleteType(t.type_id)} className="text-indigo-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded hover:bg-white">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              {types.length === 0 && <p className="text-sm text-slate-400 italic">No variant types defined.</p>}
            </div>
          </div>

          {/* Variant Options */}
          <div className="data-table-wrapper">
            <div className="table-header flex-col items-start gap-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 m-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Option Values
              </h2>
              <div className="flex flex-col gap-2 w-full">
                <select value={newOption.type_id} onChange={e => setNewOption({ ...newOption, type_id: e.target.value })}
                  className="form-select py-2">
                  <option value="">-- Select Type --</option>
                  {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
                </select>
                <div className="grid grid-cols-[1fr_80px_auto] gap-2 w-full">
                  <input value={newOption.option_value} onChange={e => setNewOption({ ...newOption, option_value: e.target.value })}
                    placeholder="Value" className="form-input py-2 w-full" />
                  <input value={newOption.color_code} onChange={e => setNewOption({ ...newOption, color_code: e.target.value })}
                    placeholder="#Hex" className="form-input py-2 w-full text-center font-mono text-xs" />
                  <button onClick={addOption} className="btn-primary py-2 px-4 flex items-center justify-center"><FiPlus /></button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><FiImage size={11} /> Add images after creating the option</p>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    <th className="py-3 px-4 text-xs">Type / Value</th>
                    <th className="py-3 px-4 text-xs w-16 text-center">Color</th>
                    <th className="py-3 px-4 text-xs w-16 text-center">Images</th>
                    <th className="py-3 px-4 text-xs w-16 text-center">Default</th>
                    <th className="py-3 px-4 text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map(o => {
                    const typeName = types.find(t => t.type_id.toString() === o.type_id?.toString())?.type_name || o.type_id;
                    return (
                    <tr key={o.option_id}>
                      {editingOptionId === o.option_id ? (
                        <td colSpan="5" className="p-3 bg-slate-50 border-b">
                          <div className="grid grid-cols-[1fr_80px_auto_auto] gap-2">
                            <input value={editOptionForm.option_value} onChange={e => setEditOptionForm({...editOptionForm, option_value: e.target.value})} className="form-input py-1.5 text-sm w-full" placeholder="Value" />
                            <input value={editOptionForm.color_code || ''} onChange={e => setEditOptionForm({...editOptionForm, color_code: e.target.value})} className="form-input py-1.5 text-sm w-full font-mono text-xs" placeholder="#Hex" />
                            <button onClick={saveOptionEdit} className="btn-success py-1.5 px-3 flex items-center justify-center gap-1"><FiCheck /> Save</button>
                            <button onClick={() => setEditingOptionId(null)} className="btn-outline py-1.5 px-3 flex items-center justify-center"><FiX /></button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-4">
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">{typeName}</div>
                            <div className="font-semibold text-slate-700">{o.option_value}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {o.color_code ? (
                              <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm mx-auto" style={{ background: o.color_code }} title={o.color_code} />
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => openGallery(o)} className="option-gallery-btn" title="Manage Images">
                              <FiImage size={14}/>
                              {(() => { const c = parseGallery(o).length; return c > 0 ? <span className="img-count">{c}</span> : null; })()}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => setDefaultOption(o.option_id)}
                              className={`transition-all ${o.is_default === '1' ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                              title={o.is_default === '1' ? 'Default' : 'Set as Default'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                              <FiStar size={16} fill={o.is_default === '1' ? 'currentColor' : 'none'} />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            <button onClick={() => startEditOption(o)} className="table-action-btn edit" title="Edit"><FiEdit2 size={14}/></button>
                            <button onClick={() => deleteOption(o.option_id)} className="table-action-btn delete" title="Delete"><FiTrash2 size={14}/></button>
                          </td>
                        </>
                      )}
                    </tr>
                  )})}
                  {options.length === 0 && (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-sm">No options defined yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: SKUs */}
        <div className="lg:col-span-2">
          <div className="data-table-wrapper h-full flex flex-col">
            <div className="table-header">
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 m-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> SKU Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage individual variant combinations, pricing, and stock.</p>
              </div>
              <button onClick={autoGenerate} className="btn-primary bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30">
                <FiZap /> Auto-Generate SKUs
              </button>
            </div>

            {/* Manual SKU Form */}
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase w-full mb-3">Add Custom SKU</div>
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_auto] gap-3 items-center">
                <input value={newSku.sku_code} onChange={e => setNewSku({ ...newSku, sku_code: e.target.value })}
                  placeholder="SKU Code" className="form-input py-2 text-sm w-full font-mono" />
                <div className="relative w-full">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">৳</span>
                  <input value={newSku.regular_price} onChange={e => setNewSku({ ...newSku, regular_price: e.target.value })}
                    placeholder="Regular Price" className="form-input py-2 pl-7 pr-3 text-sm w-full text-right font-medium" />
                </div>
                <div className="relative w-full">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">৳</span>
                  <input value={newSku.price} onChange={e => setNewSku({ ...newSku, price: e.target.value })}
                    placeholder="Selling Price" className="form-input py-2 pl-7 pr-3 text-sm w-full text-right font-medium" />
                </div>
                <input value={newSku.stock} onChange={e => setNewSku({ ...newSku, stock: e.target.value })}
                  placeholder="Stock" className="form-input py-2 text-sm w-full text-center" />
                <input value={newSku.combination} onChange={e => setNewSku({ ...newSku, combination: e.target.value })}
                  placeholder='{"Color":"Black"}' className="form-input py-2 text-sm w-full font-mono text-xs" />
                <button onClick={addSku} className="btn-primary py-2 px-4 flex items-center justify-center"><FiPlus /></button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th>SKU Code</th>
                    <th className="text-right">Price</th>
                    <th className="text-center">Stock</th>
                    <th>Combination</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map(s => {
                    let combo = {};
                    try { combo = JSON.parse(s.combination); } catch(_){}
                    return (
                      <tr key={s.sku_id} className={s.is_active === '0' ? 'opacity-60 bg-slate-50/50' : ''}>
                        {editingSkuId === s.sku_id ? (
                          <td colSpan="6" className="p-3 bg-indigo-50/50 border-b">
                            <span className="font-mono text-xs font-semibold text-slate-600 block mb-2">Editing {s.sku_code}</span>
                            <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto_auto] gap-2 items-center">
                              <div className="relative w-full">
                                <span className="absolute left-2.5 top-2 text-slate-400 text-sm">৳</span>
                                <input value={editSkuForm.regular_price || ''} onChange={e => setEditSkuForm({...editSkuForm, regular_price: e.target.value})} className="form-input py-1.5 pl-6 pr-2 text-sm w-full text-right font-medium" placeholder="Reg. Price" />
                              </div>
                              <div className="relative w-full">
                                <span className="absolute left-2.5 top-2 text-slate-400 text-sm">৳</span>
                                <input value={editSkuForm.price} onChange={e => setEditSkuForm({...editSkuForm, price: e.target.value})} className="form-input py-1.5 pl-6 pr-2 text-sm w-full text-right font-medium" placeholder="Sell Price" />
                              </div>
                              <input value={editSkuForm.stock} onChange={e => setEditSkuForm({...editSkuForm, stock: e.target.value})} className="form-input py-1.5 text-sm w-full text-center" placeholder="Stock" />
                              <input value={editSkuForm.combination} onChange={e => setEditSkuForm({...editSkuForm, combination: e.target.value})} className="form-input py-1.5 text-sm w-full font-mono text-xs" placeholder="JSON Combo" />
                              
                              <button onClick={saveSkuEdit} className="btn-success py-1.5 px-3 flex items-center justify-center gap-1"><FiSave /> Save</button>
                              <button onClick={() => setEditingSkuId(null)} className="btn-outline py-1.5 px-3 flex items-center justify-center">Cancel</button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="font-mono text-xs text-slate-600 font-semibold">{s.sku_code}</td>
                            <td className="text-right">
                              {s.regular_price && parseFloat(s.regular_price) > parseFloat(s.price) && (
                                <div className="text-xs text-slate-400 line-through">৳{Number(s.regular_price).toLocaleString()}</div>
                              )}
                              <div className="font-bold text-slate-800">৳{Number(s.price).toLocaleString()}</div>
                            </td>
                            <td className="text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${Number(s.stock) <= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                {s.stock}
                              </span>
                            </td>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {Object.keys(combo).length > 0 ? Object.entries(combo).map(([k, v]) => (
                                  <span key={k} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-medium shadow-sm">
                                    <span className="opacity-60 mr-1">{k}:</span>{v}
                                  </span>
                                )) : <span className="text-xs text-slate-400 italic">Base Product</span>}
                              </div>
                            </td>
                            <td className="text-center">
                              <button onClick={() => toggleSkuActive(s)} title="Toggle Status" className="transition-transform hover:scale-110 focus:outline-none cursor-pointer border-0 bg-transparent p-0">
                                <span className={`badge-status ${s.is_active === '1' ? 'badge-active' : 'badge-inactive'}`}>
                                  {s.is_active === '1' ? 'Active' : 'Inactive'}
                                </span>
                              </button>
                            </td>
                            <td className="text-right whitespace-nowrap space-x-1">
                              <button onClick={() => startEditSku(s)} className="table-action-btn edit" title="Edit"><FiEdit2 size={14}/></button>
                              <button onClick={() => deleteSku(s.sku_id)} className="table-action-btn delete" title="Delete"><FiTrash2 size={14}/></button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {skus.length === 0 && (
                    <tr><td colSpan="6" className="py-12 text-center text-slate-400">
                      <FiZap className="mx-auto text-4xl mb-3 text-slate-200" />
                      <p className="text-sm">No SKUs generated yet.<br/>Click <strong>Auto-Generate SKUs</strong> to build the matrix from your options.</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* ═══ GALLERY MODAL ═══ */}
      {galleryOption && (
        <div className="modal-overlay gallery-modal" onClick={(e) => e.target === e.currentTarget && closeGallery()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3><FiImage /> Gallery — {galleryOption.option_value}</h3>
              <div className="flex items-center gap-3">
                <span className="gallery-counter"><FiImage size={12}/> {galleryImages.length} / 20</span>
                <button className="modal-close" onClick={closeGallery}><FiX /></button>
              </div>
            </div>
            <div className="modal-body">
              {/* Drop zone */}
              <label
                className={`gallery-dropzone ${dragOver ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleGalleryUpload(e.dataTransfer.files); }}
              >
                <div className="drop-icon"><FiUploadCloud /></div>
                <p>{galleryUploading ? 'Uploading...' : 'Drag & drop images here or click to browse'}</p>
                <p className="drop-hint">Accepts JPG, PNG, WEBP • Max 20 images per variant</p>
                <input type="file" multiple accept="image/*" onChange={(e) => { handleGalleryUpload(e.target.files); e.target.value = ''; }} className="hidden" />
              </label>

              {/* Image grid — drag to reorder */}
              {galleryImages.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400 mt-3 mb-1 flex items-center gap-1"><FiMove size={11}/> Drag images to reorder</p>
                  <div className="gallery-grid">
                    {galleryImages.map((img, i) => (
                      <div key={`${img}-${i}`}
                        className={`gallery-thumb ${dragIdx === i ? 'opacity-50 scale-95' : ''}`}
                        draggable
                        onDragStart={() => handleGalleryDragStart(i)}
                        onDragOver={(e) => handleGalleryDragOver(e, i)}
                        onDragEnd={handleGalleryDragEnd}
                        style={{ transition: 'transform 0.15s, opacity 0.15s' }}>
                        <span className="thumb-index">{i + 1}</span>
                        <img src={resolveImage(img)} alt={`Variant ${i + 1}`} />
                        <div className="thumb-overlay">
                          <button className="thumb-delete" onClick={() => removeGalleryImage(i)}><FiTrash2 size={11}/> Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="gallery-empty">
                  <FiImage />
                  <p>No images uploaded yet.<br/>Upload images to showcase this variant option.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeGallery}>Cancel</button>
              <button className="btn-primary" onClick={saveGallery}><FiSave /> Save Gallery</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
